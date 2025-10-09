#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'src/assets/images';
const OUT_ROOT = 'public/images'; // cleaned each run
const MANIFEST_PATH = 'src/data/generated/images.manifest.gen.json';
const TEMP_ROOT = 'tmp/large-images';
const LARGE_IMAGES_DIR = path.join(SRC_DIR, 'largeImages');
const LARGE_IMAGES_CONFIG = path.join(SRC_DIR, 'largeImages.json');
const IGNORE_DIRS = new Set([LARGE_IMAGES_DIR]);
const MIME_EXTENSIONS = new Map([
	['image/jpeg', '.jpg'],
	['image/png', '.png'],
	['image/webp', '.webp'],
	['image/avif', '.avif'],
	['image/tiff', '.tif'],
	['image/x-tiff', '.tif'],
]);

const WIDTHS = [320, 480, 640, 750, 828, 1080, 1200, 1920];
const FORMATS = [
	{ ext: 'avif', to: (img) => img.avif({ quality: 50 }) },
	{ ext: 'webp', to: (img) => img.webp({ quality: 70 }) },
	{ ext: 'jpg', to: (img) => img.jpeg({ quality: 82, progressive: true }) },
];
const VALID_EXT = new Set([
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.tif',
	'.tiff',
	'.avif',
]);

function normalizeLargeImageUrl(rawUrl) {
	try {
		const url = new URL(rawUrl);
		if (url.hostname === 'drive.google.com') {
			const match = url.pathname.match(/\/file\/d\/([^/]+)/);
			if (match) {
				return `https://drive.google.com/uc?export=download&id=${match[1]}`;
			}
		}
		return url.toString();
	} catch {
		return rawUrl;
	}
}

function extensionFromMime(mime) {
	if (!mime) return '';
	const clean = mime.split(';', 1)[0].trim().toLowerCase();
	return MIME_EXTENSIONS.get(clean) ?? '';
}

function extensionFromUrl(rawUrl) {
	try {
		const { pathname } = new URL(rawUrl);
		return path.extname(pathname).toLowerCase();
	} catch {
		return path.extname(rawUrl).toLowerCase();
	}
}

async function loadLargeImagesConfig() {
	try {
		const raw = await fs.readFile(LARGE_IMAGES_CONFIG, 'utf8');
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch (error) {
		if (error.code === 'ENOENT') return {};
		throw error;
	}
}

async function downloadLargeImage(name, rawUrl) {
	if (typeof fetch !== 'function') {
		throw new Error('fetch is not available in this Node.js runtime.');
	}
	const normalizedUrl = normalizeLargeImageUrl(rawUrl);
	const response = await fetch(normalizedUrl);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	let ext = extensionFromUrl(normalizedUrl) || extensionFromUrl(rawUrl);
	if (!VALID_EXT.has(ext)) {
		ext = extensionFromMime(response.headers.get('content-type')) || '.jpg';
	}
	if (!VALID_EXT.has(ext)) ext = '.jpg';
	const filePath = path.join(TEMP_ROOT, `${name}${ext}`);
	await fs.writeFile(filePath, Buffer.from(arrayBuffer));
	return filePath;
}

async function* walk(dir) {
	for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (IGNORE_DIRS.has(p)) continue;
			yield* walk(p);
		} else {
			yield p;
		}
	}
}

function toName(filePath) {
	// "hero/banner big.JPG" -> "hero-banner-big"
	return path
		.relative(SRC_DIR, filePath)
		.replace(path.extname(filePath), '')
		.replace(/[\\/]+/g, '-')
		.replace(/\s+/g, '-')
		.toLowerCase();
}

async function cleanOutRoot() {
	try {
		await fs.rm(OUT_ROOT, { recursive: true, force: true });
	} catch {}
	await fs.mkdir(OUT_ROOT, { recursive: true });
}

async function processImage(filePath, nameOverride, manifest) {
	const ext = path.extname(filePath).toLowerCase();
	if (!VALID_EXT.has(ext)) return;

	const name = nameOverride ?? toName(filePath);
	const outDir = path.join(OUT_ROOT, name);
	await fs.mkdir(outDir, { recursive: true });

	const img = sharp(filePath).rotate(); // auto-orient EXIF
	const meta = await img.metadata();
	const srcW = meta.width ?? 0;
	const srcH = meta.height ?? 0;
	if (!srcW || !srcH) return;

	const lqipW = Math.min(24, srcW);
	const lqip = await img
		.clone()
		.resize({ width: lqipW })
		.blur()
		.jpeg({ quality: 40 })
		.toBuffer();
	const blurDataURL = `data:image/jpeg;base64,${lqip.toString('base64')}`;

	const item = {
		name,
		width: srcW,
		height: srcH,
		aspect: srcW / srcH,
		blurDataURL,
		variants: {},
	};

	const targetWidths = WIDTHS.filter((w) => w <= srcW);

	for (const { ext: outExt, to } of FORMATS) {
		const list = [];
		for (const w of targetWidths) {
			const fileName = `${w}.${outExt}`;
			const outPath = path.join(outDir, fileName);
			await to(img.clone().resize({ width: w })).toFile(outPath);
			list.push({ w, url: `/images/${name}/${fileName}` });
		}
		item.variants[outExt] = list;
	}

	const origFile = `orig${ext || '.jpg'}`;
	await img.toFile(path.join(outDir, origFile));
	item.original = {
		url: `/images/${name}/${origFile}`,
		width: srcW,
		height: srcH,
	};

	if (manifest[name]) {
		console.warn(`⚠️ Duplicate image name "${name}" encountered. Overwriting previous entry.`);
	}
	manifest[name] = item;
}

await cleanOutRoot();
await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
try {
	await fs.rm(TEMP_ROOT, { recursive: true, force: true });
} catch {}

const manifest = {}; // { [name]: {...} }

for await (const file of walk(SRC_DIR)) {
	await processImage(file, undefined, manifest);
}

const largeImagesMap = await loadLargeImagesConfig();
const largeEntries = Object.entries(largeImagesMap);

if (largeEntries.length) {
	await fs.mkdir(TEMP_ROOT, { recursive: true });
	for (const [name, rawUrl] of largeEntries) {
		const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
		if (!url) {
			console.warn(`⚠️ Skipping large image "${name}" because URL is empty.`);
			continue;
		}
		try {
			const filePath = await downloadLargeImage(name, url);
			await processImage(filePath, name, manifest);
		} catch (error) {
			console.error(`✗ Failed to process large image "${name}": ${error.message}`);
		}
	}
	try {
		await fs.rm(TEMP_ROOT, { recursive: true, force: true });
	} catch {}
}

await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`✓ Wrote manifest: ${MANIFEST_PATH}`);
console.log(`✓ Images in: ${OUT_ROOT} (clean build)`);
