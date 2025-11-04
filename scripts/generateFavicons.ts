#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
	faviconTokens,
	faviconAssetPlan,
	faviconThemeColors,
	faviconManifestTokens,
	faviconCacheTokens,
	faviconOptions,
} from '../src/tokens/favicon.tokens';
import {
	writeHashedFile,
	type HashedWriteResult,
} from './lib/cacheBusting';

const OUT_ROOT = path.resolve('public', 'favicons');
const TEMP_ROOT = path.resolve('tmp', 'favicons.gen');
const MANIFEST_TS_PATH = path.resolve(
	'src',
	'data',
	'generated',
	'favicons.manifest.gen.ts',
);
const PUBLIC_ROOT = '/favicons';

type PngResult = HashedWriteResult & {
	size: number;
};

type IcoCandidate = {
	size: number;
	buffer: Buffer;
};

async function resetDir(dir: string) {
	await fs
		.rm(dir, { recursive: true, force: true })
		.catch(() => {});
	await fs.mkdir(dir, { recursive: true });
}

async function stageTempFile(
	name: string,
	ext: string,
	buffer: Buffer,
): Promise<string> {
	const fileName = `${name}${ext.startsWith('.') ? ext : `.${ext}`}`;
	const outPath = path.join(TEMP_ROOT, fileName);
	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await fs.writeFile(outPath, buffer);
	return outPath;
}

function buildIcoFromPng(candidates: IcoCandidate[]) {
	if (!candidates.length) {
		throw new Error('ICO generation requires at least one PNG candidate.');
	}

	const sorted = [...candidates].sort((a, b) => a.size - b.size);
	const count = sorted.length;
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type (icon)
	header.writeUInt16LE(count, 4);

	const entries = Buffer.alloc(16 * count);
	let offset = header.length + entries.length;

	sorted.forEach(({ size, buffer }, index) => {
		const entryOffset = index * 16;
		const dims = size >= 256 ? 0 : size;
		entries[entryOffset] = dims; // width
		entries[entryOffset + 1] = dims; // height
		entries[entryOffset + 2] = 0; // palette
		entries[entryOffset + 3] = 0; // reserved
		entries.writeUInt16LE(1, entryOffset + 4); // planes
		entries.writeUInt16LE(32, entryOffset + 6); // bit count
		entries.writeUInt32LE(buffer.length, entryOffset + 8);
		entries.writeUInt32LE(offset, entryOffset + 12);
		offset += buffer.length;
	});

	return Buffer.concat([
		header,
		entries,
		...sorted.map((item) => item.buffer),
	]);
}

async function main() {
	console.log('→ Favicons: cleaning staging directories');
	await resetDir(TEMP_ROOT);
	await resetDir(OUT_ROOT);

	const sourceSvgPath = path.resolve(faviconTokens.sourceSvg);
	console.log(`→ Favicons: loading source SVG "${sourceSvgPath}"`);

	const svgBuffer = await fs.readFile(sourceSvgPath);

	const pngResults: PngResult[] = [];
	const pngBufferMap = new Map<number, Buffer>();
	const icoCandidates: IcoCandidate[] = [];

	console.log('→ Favicons: generating PNG variants');
	for (const size of faviconAssetPlan.pngSizes) {
		const logicalName = `icon-${size}`;
		const pngBuffer = await sharp(svgBuffer)
			.resize(size, size, {
				fit: 'contain',
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png({
				compressionLevel: 9,
				progressive: false,
			})
			.toBuffer();

		pngBufferMap.set(size, pngBuffer);

		await stageTempFile(logicalName, '.png', pngBuffer);
		const hashed = await writeHashedFile({
			outDir: OUT_ROOT,
			logicalName,
			ext: '.png',
			buffer: pngBuffer,
			hashLength: faviconCacheTokens.hashLength,
			prefix: faviconCacheTokens.prefix,
			publicRoot: PUBLIC_ROOT,
		});

		pngResults.push({ ...hashed, size });

		if (faviconAssetPlan.icoSizes.includes(size)) {
			icoCandidates.push({ size, buffer: pngBuffer });
		}
	}

	if (!icoCandidates.length) {
		throw new Error(
			'No ICO candidates generated. Check faviconAssetPlan.icoSizes.',
		);
	}

	console.log('→ Favicons: writing favicon.svg');
	const svgResult = await writeHashedFile({
		outDir: OUT_ROOT,
		logicalName: faviconAssetPlan.svgOutputName.replace(/\.svg$/i, ''),
		ext: '.svg',
		buffer: svgBuffer,
		hashLength: faviconCacheTokens.hashLength,
		prefix: faviconCacheTokens.prefix,
		publicRoot: PUBLIC_ROOT,
	});

	console.log('→ Favicons: generating favicon.ico');
	const icoBuffer = buildIcoFromPng(icoCandidates);

	const icoResult = await writeHashedFile({
		outDir: OUT_ROOT,
		logicalName: 'favicon',
		ext: '.ico',
		buffer: icoBuffer,
		hashLength: faviconCacheTokens.hashLength,
		prefix: faviconCacheTokens.prefix,
		publicRoot: PUBLIC_ROOT,
	});

	console.log('→ Favicons: generating apple-touch-icon.png');
	const appleBuffer = await sharp(svgBuffer)
		.resize(faviconAssetPlan.appleTouchSize, faviconAssetPlan.appleTouchSize, {
			fit: 'contain',
			background: faviconThemeColors.backgroundColor,
		})
		.flatten({ background: faviconThemeColors.backgroundColor })
		.png({ compressionLevel: 9 })
		.toBuffer();

	await stageTempFile('apple-touch-icon', '.png', appleBuffer);
	const appleResult = await writeHashedFile({
		outDir: OUT_ROOT,
		logicalName: 'apple-touch-icon',
		ext: '.png',
		buffer: appleBuffer,
		hashLength: faviconCacheTokens.hashLength,
		prefix: faviconCacheTokens.prefix,
		publicRoot: PUBLIC_ROOT,
	});

	let maskableResult: HashedWriteResult | null = null;
	if (faviconOptions.generateMaskable) {
		console.log('→ Favicons: generating maskable icon');
		const maskableBuffer = await sharp(svgBuffer)
			.resize(faviconAssetPlan.maskableSize, faviconAssetPlan.maskableSize, {
				fit: 'contain',
				background: faviconThemeColors.backgroundColor,
			})
			.flatten({ background: faviconThemeColors.backgroundColor })
			.png({ compressionLevel: 9 })
			.toBuffer();

		await stageTempFile('maskable-icon', '.png', maskableBuffer);
		maskableResult = await writeHashedFile({
			outDir: OUT_ROOT,
			logicalName: 'maskable-icon',
			ext: '.png',
			buffer: maskableBuffer,
			hashLength: faviconCacheTokens.hashLength,
			prefix: faviconCacheTokens.prefix,
			publicRoot: PUBLIC_ROOT,
		});
	}

	console.log('→ Favicons: generating Safari mask-icon.svg');
	const maskIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="192" fill="#000"/></svg>\n`;
	const maskIconResult = await writeHashedFile({
		outDir: OUT_ROOT,
		logicalName: 'mask-icon',
		ext: '.svg',
		buffer: maskIconSvg,
		hashLength: faviconCacheTokens.hashLength,
		prefix: faviconCacheTokens.prefix,
		publicRoot: PUBLIC_ROOT,
	});

	console.log('→ Favicons: generating mstile asset');
	const tileSize = faviconAssetPlan.browserConfigTileSize;
	const tileBuffer = await sharp(svgBuffer)
		.resize(tileSize, tileSize, {
			fit: 'contain',
			background: faviconThemeColors.backgroundColor,
		})
		.flatten({ background: faviconThemeColors.backgroundColor })
		.png({ compressionLevel: 9 })
		.toBuffer();

	await stageTempFile(`mstile-${tileSize}`, '.png', tileBuffer);
	const tileResult = await writeHashedFile({
		outDir: OUT_ROOT,
		logicalName: `mstile-${tileSize}`,
		ext: '.png',
		buffer: tileBuffer,
		hashLength: faviconCacheTokens.hashLength,
		prefix: faviconCacheTokens.prefix,
		publicRoot: PUBLIC_ROOT,
	});

	let browserConfigResult: HashedWriteResult | null = null;
	if (faviconOptions.generateBrowserConfig) {
		console.log('→ Favicons: generating browserconfig.xml');
		const browserConfigXml = [
			'<?xml version="1.0" encoding="utf-8"?>',
			'<browserconfig>',
			'  <msapplication>',
			'    <tile>',
			`      <square150x150logo src="${tileResult.urlPath}"/>`,
			`      <TileColor>${faviconThemeColors.msTileColor}</TileColor>`,
			'    </tile>',
			'  </msapplication>',
			'</browserconfig>',
			'',
		].join('\n');

		browserConfigResult = await writeHashedFile({
			outDir: OUT_ROOT,
			logicalName: 'browserconfig',
			ext: '.xml',
			buffer: browserConfigXml,
			hashLength: faviconCacheTokens.hashLength,
			prefix: faviconCacheTokens.prefix,
			publicRoot: PUBLIC_ROOT,
		});
	}

	console.log('→ Favicons: compiling web manifest');
	const manifestIcons = new Map<number, HashedWriteResult>();
	for (const size of faviconAssetPlan.androidChromeSizes) {
		const match = pngResults.find((item) => item.size === size);
		if (!match) {
			throw new Error(
				`Missing PNG variant for Android Chrome size ${size}.`,
			);
		}
		manifestIcons.set(size, match);
	}

	const manifestPayload: Record<string, unknown> = {
		name: faviconManifestTokens.name,
		short_name: faviconManifestTokens.shortName,
		description: faviconManifestTokens.description,
		start_url: faviconManifestTokens.startUrl,
		scope: faviconManifestTokens.scope,
		display: faviconManifestTokens.display,
		orientation: faviconManifestTokens.orientation,
		lang: faviconManifestTokens.lang,
		background_color: faviconThemeColors.backgroundColor,
		theme_color: faviconThemeColors.darkThemeColor,
		icons: [
			...Array.from(manifestIcons.entries()).map(([size, info]) => ({
				src: info.urlPath,
				type: 'image/png',
				sizes: `${size}x${size}`,
				purpose: 'any',
			})),
			...(maskableResult
				? [
						{
							src: maskableResult.urlPath,
							type: 'image/png',
							sizes: `${faviconAssetPlan.maskableSize}x${faviconAssetPlan.maskableSize}`,
							purpose: 'any maskable',
						},
					]
				: []),
		],
	};

	const webManifestBuffer = Buffer.from(
		`${JSON.stringify(manifestPayload, null, 2)}\n`,
	);

	const webManifestResult = await writeHashedFile({
		outDir: OUT_ROOT,
		logicalName: 'site',
		ext: '.webmanifest',
		buffer: webManifestBuffer,
		hashLength: faviconCacheTokens.hashLength,
		prefix: faviconCacheTokens.prefix,
		publicRoot: PUBLIC_ROOT,
	});

	console.log('→ Favicons: emitting generated manifest file');

	const pngManifestEntries = pngResults
		.sort((a, b) => a.size - b.size)
		.map((item) => ({
			size: item.size,
			src: item.urlPath,
			fileName: item.fileName,
			hash: item.hash,
		}));

	const androidManifestEntries = faviconAssetPlan.androidChromeSizes.map(
		(size) => {
			const item = pngResults.find((entry) => entry.size === size);
			if (!item) {
				throw new Error(
					`Android Chrome icon size ${size} missing from PNG outputs.`,
				);
			}
			return {
				size,
				src: item.urlPath,
				fileName: item.fileName,
				hash: item.hash,
			};
		},
	);

	const androidIcons = androidManifestEntries.map((entry) => ({
		...entry,
		sizes: `${entry.size}x${entry.size}`,
	}));

	const linkDescriptors = {
		main: [
			{
				rel: 'icon' as const,
				type: 'image/svg+xml',
				sizes: 'any',
				href: svgResult.urlPath,
			},
			...pngManifestEntries.map((item) => ({
				rel: 'icon' as const,
				type: 'image/png',
				sizes: `${item.size}x${item.size}`,
				href: item.src,
			})),
			{
				rel: 'apple-touch-icon' as const,
				sizes: `${faviconAssetPlan.appleTouchSize}x${faviconAssetPlan.appleTouchSize}`,
				href: appleResult.urlPath,
			},
			{
				rel: 'mask-icon' as const,
				color: faviconThemeColors.maskIconColor,
				href: maskIconResult.urlPath,
			},
			{
				rel: 'manifest' as const,
				href: webManifestResult.urlPath,
			},
		],
	};

	const metaTags = {
		themeColorLight: faviconThemeColors.lightThemeColor,
		themeColorDark: faviconThemeColors.darkThemeColor,
		msTileColor: faviconThemeColors.msTileColor,
		msApplicationConfig: browserConfigResult?.urlPath ?? null,
	};

	const manifestMeta = {
		...faviconManifestTokens,
	};

	const faviconSvg = {
		src: svgResult.urlPath,
		fileName: svgResult.fileName,
		hash: svgResult.hash,
	};

	const faviconIco = {
		src: icoResult.urlPath,
		fileName: icoResult.fileName,
		hash: icoResult.hash,
	};

	const faviconAppleTouch = {
		src: appleResult.urlPath,
		fileName: appleResult.fileName,
		hash: appleResult.hash,
		size: faviconAssetPlan.appleTouchSize,
	};

	const faviconMaskIcon = {
		src: maskIconResult.urlPath,
		fileName: maskIconResult.fileName,
		hash: maskIconResult.hash,
		color: faviconThemeColors.maskIconColor,
	};

	const faviconMsTile = {
		src: tileResult.urlPath,
		fileName: tileResult.fileName,
		hash: tileResult.hash,
		size: faviconAssetPlan.browserConfigTileSize,
		color: faviconThemeColors.msTileColor,
	};

	const manifestTs = `// AUTO-GENERATED by scripts/generateFavicons.ts — DO NOT EDIT
export const FAVICON_SVG = ${JSON.stringify(faviconSvg, null, 2)} as const;

export const FAVICON_ICO = ${JSON.stringify(faviconIco, null, 2)} as const;

export const FAVICON_PNG_VARIANTS = ${JSON.stringify(
	pngManifestEntries,
	null,
	2,
)} as const;

export const FAVICON_APPLE_TOUCH_ICON = ${JSON.stringify(
	faviconAppleTouch,
	null,
	2,
)} as const;

export const FAVICON_ANDROID_ICONS = ${JSON.stringify(
	androidIcons,
	null,
	2,
)} as const;

export const FAVICON_MASK_ICON = ${JSON.stringify(
	faviconMaskIcon,
	null,
	2,
)} as const;

export const FAVICON_MASKABLE_ICON = ${JSON.stringify(
	maskableResult
		? {
				src: maskableResult.urlPath,
				fileName: maskableResult.fileName,
				hash: maskableResult.hash,
				size: faviconAssetPlan.maskableSize,
		  }
		: null,
	null,
	2,
)} as const;

export const FAVICON_MS_TILE = ${JSON.stringify(
	faviconMsTile,
	null,
	2,
)} as const;

export const FAVICON_BROWSERCONFIG = ${JSON.stringify(
	browserConfigResult
		? {
				src: browserConfigResult.urlPath,
				fileName: browserConfigResult.fileName,
				hash: browserConfigResult.hash,
		  }
		: null,
	null,
	2,
)} as const;

export const FAVICON_WEB_MANIFEST = ${JSON.stringify(
	{
		src: webManifestResult.urlPath,
		fileName: webManifestResult.fileName,
		hash: webManifestResult.hash,
	},
	null,
	2,
)} as const;

export const FAVICON_THEME_COLORS = ${JSON.stringify(
	{
		light: faviconThemeColors.lightThemeColor,
		dark: faviconThemeColors.darkThemeColor,
		background: faviconThemeColors.backgroundColor,
		maskIcon: faviconThemeColors.maskIconColor,
		msTile: faviconThemeColors.msTileColor,
	},
	null,
	2,
)} as const;

export const FAVICON_MANIFEST_META = ${JSON.stringify(
	manifestMeta,
	null,
	2,
)} as const;

export const FAVICON_LINK_DESCRIPTORS = ${JSON.stringify(
	linkDescriptors,
	null,
	2,
)} as const;

export const FAVICON_META_TAGS = ${JSON.stringify(
	metaTags,
	null,
	2,
)} as const;
`;

	await fs.mkdir(path.dirname(MANIFEST_TS_PATH), { recursive: true });
	await fs.writeFile(MANIFEST_TS_PATH, manifestTs, 'utf8');

	console.log(`→ Favicons: wrote manifest ${MANIFEST_TS_PATH}`);
	console.log(`→ Favicons: assets available under ${OUT_ROOT}`);

	console.log('→ Favicons: cleaning staging directory');
	await fs
		.rm(TEMP_ROOT, { recursive: true, force: true })
		.catch(() => {});
}

main().catch((error) => {
	console.error('✗ Favicons: generation failed');
	console.error(error);
	process.exit(1);
});
