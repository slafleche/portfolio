#!/usr/bin/env node
// Vercel-safe HLS builder (100vh ladder), with tmp cleanup + selective builds
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import prettyBytes from 'pretty-bytes';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Config -------------------------------------------------------------- */
const SRC_MAP_PATH = 'src/assets/videos/videoSources.json'; // { "hero": "<url>", ... }
const OUT_ROOT = 'public/videos'; // derived assets (gitignored)
const MANIFEST_PATH = 'src/data/generated/videos.manifest.gen.json';
const TEMP_ROOT = 'tmp/videos';

// 100vh fullscreen hero ladder — 24fps, 2s segments
const LADDER = [
	{
		h: 1440,
		vK: 5200,
		aK: 96,
		profile: 'high',
	},
	{
		h: 1080,
		vK: 3800,
		aK: 96,
		profile: 'high',
	},
	{
		h: 900,
		vK: 2800,
		aK: 96,
		profile: 'main',
	},
	{
		h: 720,
		vK: 1900,
		aK: 96,
		profile: 'main',
	},
	{
		h: 540,
		vK: 1200,
		aK: 64,
		profile: 'main',
	},
	{
		h: 360,
		vK: 700,
		aK: 48,
		profile: 'baseline',
	},
	{
		h: 240,
		vK: 400,
		aK: 32,
		profile: 'baseline',
	},
];

const FPS = 24;
const SEG = 2;
const GOP = FPS * 2;
const KEEP_AUDIO = true;

const BASE_VIDEO_FILTER = [
	'format=yuv420p',
	'gradfun=strength=0.9:radius=16',
	'noise=alls=4:allf=t+u',
].join(','); // shared pre-processing so posters match HLS output

/* Utility helpers ---------------------------------------------------- */
const exists = async (p) =>
	!!(await fs
		.access(p)
		.then(() => true)
		.catch(() => false));

const sha256 = (buf) =>
	crypto.createHash('sha256').update(buf).digest('hex');

const toName = (s) =>
	s
		.replace(/[\\/]+/g, '-')
		.replace(/\s+/g, '-')
		.toLowerCase();

function normalizeDrive(urlStr) {
	try {
		const u = new URL(urlStr);
		if (u.hostname === 'drive.google.com') {
			const m =
				u.pathname.match(/\/file\/d\/([^/]+)/) ||
				u.search.match(/id=([^&]+)/);
			if (m && m[1]) {
				return `https://drive.google.com/uc?export=download&id=${m[1]}`;
			}
		}
		return urlStr;
	} catch {
		return urlStr;
	}
}

// Force Dropbox shared links to ?dl=1 (direct download) while preserving other query params.
function toDirectDropboxUrl(urlStr) {
	try {
		const u = new URL(urlStr);
		if (
			u.hostname === 'www.dropbox.com' ||
			u.hostname === 'dropbox.com'
		) {
			u.searchParams.set('dl', '1'); // force direct download
			return u.toString();
		}
		return urlStr;
	} catch {
		return urlStr;
	}
}

function extFromUrlSafe(rawUrl) {
	try {
		const u = new URL(rawUrl);
		return path.extname(u.pathname) || '';
	} catch {
		return path.extname(rawUrl) || '';
	}
}

async function cleanOutRoot() {
	await fs
		.rm(OUT_ROOT, {
			recursive: true,
			force: true,
		})
		.catch(() => {});
	await fs.mkdir(OUT_ROOT, {
		recursive: true,
	});
}

async function cleanTempRoot() {
	await fs
		.rm(TEMP_ROOT, {
			recursive: true,
			force: true,
		})
		.catch(() => {});
	await fs.mkdir(TEMP_ROOT, {
		recursive: true,
	});
}

/* Networking --------------------------------------------------------- */
async function downloadToTemp(name, rawUrl) {
	let urlStr = (rawUrl || '').trim();
	if (!urlStr) throw new Error(`Empty URL for "${name}"`);

	urlStr = normalizeDrive(urlStr);
	urlStr = toDirectDropboxUrl(urlStr);

	const res = await fetch(urlStr, {
		redirect: 'follow',
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${urlStr}`);

	const ct =
		res.headers
			.get('content-type')
			?.split(';')[0]
			?.trim()
			.toLowerCase() || '';
	const buf = Buffer.from(await res.arrayBuffer());

	const looksHtml = buf
		.slice(0, 64)
		.toString('utf8')
		.includes('<!DOCTYPE html');
	const okCT =
		ct.startsWith('video/') ||
		ct === 'application/octet-stream' ||
		ct === 'application/mp4' ||
		ct === 'application/x-mp4';
	if (!okCT || looksHtml) {
		const preview = buf
			.slice(0, 160)
			.toString('utf8')
			.replace(/\s+/g, ' ')
			.slice(0, 120);
		throw new Error(
			`Non-video response for "${name}": content-type="${ct}", bytes=${buf.length}. ` +
				`If this is Dropbox, ensure the link ends with "?dl=1". First bytes: ${preview}`,
		);
	}

	const extFromCT = ct.includes('mp4')
		? '.mp4'
		: ct.includes('webm')
			? '.webm'
			: ct.includes('quicktime')
				? '.mov'
				: '';
	const ext = extFromCT || extFromUrlSafe(urlStr) || '.mp4';

	const hash = sha256(buf);
	await fs.mkdir(TEMP_ROOT, {
		recursive: true,
	});
	const file = path.join(TEMP_ROOT, `${name}-${hash}${ext}`);
	await fs.writeFile(file, buf);
	return {
		file,
		hash,
		bytes: buf.length,
	};
}

/* FFprobe / FFmpeg --------------------------------------------------- */
async function ffprobeJSON(inputPath) {
	const { stdout } = await execa(ffprobeStatic.path, [
		'-v',
		'quiet',
		'-print_format',
		'json',
		'-show_format',
		'-show_streams',
		inputPath,
	]);
	const meta = JSON.parse(stdout || '{}');
	if (!meta.streams || meta.streams.length === 0) {
		throw new Error(
			`ffprobe: no streams found in "${inputPath}". File may be corrupt or not a video.`,
		);
	}
	return meta;
}

// Deband, add subtle grain, then split/scale ladder outputs (order matters).
function buildFilterAndMaps(hasAudio) {
	const splitN = LADDER.length;
	const v = Array.from({ length: splitN }, (_, i) => `v${i + 1}`);
	const out = v.map((label, i) => `${label}out`);

	const split =
		`[0:v]${BASE_VIDEO_FILTER},` +
		`split=${splitN}` +
		v.map((x) => `[${x}]`).join('') +
		';';

	const scales = v
		.map(
			(x, i) =>
				` [${x}]scale=-2:${LADDER[i].h}:flags=lanczos[${out[i]}];`,
		)
		.join('');

	const maps = [];
	for (let i = 0; i < out.length; i++) {
		maps.push('-map', `[${out[i]}]`);
		if (hasAudio && KEEP_AUDIO) maps.push('-map', 'a:0?');
	}

	const varMap = LADDER.map((_, i) =>
		hasAudio && KEEP_AUDIO ? `v:${i},a:${i}` : `v:${i}`,
	).join(' ');

	return {
		filter: split + scales,
		maps,
		varMap,
	};
}

async function buildHLS(srcPath, name) {
	const outDir = path.join(OUT_ROOT, name);
	await fs.mkdir(outDir, {
		recursive: true,
	});

	const meta = await ffprobeJSON(srcPath);
	const v = meta.streams.find((s) => s.codec_type === 'video');
	const a = meta.streams.find((s) => s.codec_type === 'audio');
	const width = v?.width ?? 0;
	const height = v?.height ?? 0;
	const duration = Number(meta.format?.duration ?? 0);
	const hasAudio = !!a;

	const { filter, maps, varMap } = buildFilterAndMaps(hasAudio);

	for (let i = 0; i < LADDER.length; i++) {
		await fs.mkdir(path.join(outDir, `out_${i}`), {
			recursive: true,
		});
	}

	const rungOpts = LADDER.flatMap((r, i) => [
		'-c:v',
		'libx264',
		'-profile:v',
		r.profile,
		'-pix_fmt',
		'yuv420p',

		// preserve gradients
		'-tune',
		'grain',

		// extra x264 guidance (conservative)
		'-x264-params',
		'aq-mode=3:aq-strength=1.1:deblock=-1,-1:psy-rd=0.6:vbv-init=0.9',

		'-preset',
		'veryfast', // change to 'slow' for better quality (slower)
		'-r',
		String(FPS),
		'-g',
		String(GOP),
		'-keyint_min',
		String(GOP),
		'-sc_threshold',
		'0',

		`-b:v:${i}`,
		`${r.vK}k`,
		`-maxrate:${i}`,
		`${Math.round(r.vK * 1.1)}k`,
		`-bufsize:${i}`,
		`${r.vK * 2}k`,

		// Tag BT.709 to avoid player color surprises
		'-color_primaries',
		'bt709',
		'-color_trc',
		'bt709',
		'-colorspace',
		'bt709',

		...(KEEP_AUDIO && hasAudio
			? [
					'-c:a',
					'aac',
					`-b:a:${i}`,
					`${r.aK}k`,
				]
			: [
					'-an',
				]),
	]);

	const args = [
		'-i',
		srcPath,

		// filter graph (deband/dither + grain + scale ladder)
		'-filter_complex',
		filter,
		...maps,

		...rungOpts,

		'-f',
		'hls',
		'-hls_time',
		String(SEG),
		'-hls_playlist_type',
		'vod',
		'-hls_flags',
		'independent_segments',
		'-var_stream_map',
		varMap,
		'-master_pl_name',
		'master.m3u8',
		'-hls_segment_filename',
		path.join(outDir, 'out_%v', 'seg_%03d.ts'),
		path.join(outDir, 'out_%v', 'index.m3u8'),
	];

	console.log(`↻ ffmpeg → ${name}`);
	await execa(ffmpegStatic, args, {
		stdio: 'inherit',
	});

	const poster = path.join(outDir, 'poster.jpg');
	await execa(ffmpegStatic, [
		'-ss',
		'1',
		'-i',
		srcPath,
		'-frames:v',
		'1',
		'-vf',
		`${BASE_VIDEO_FILTER},scale=-2:720:flags=lanczos`,
		'-color_primaries',
		'bt709',
		'-color_trc',
		'bt709',
		'-colorspace',
		'bt709',
		'-q:v',
		'3',
		poster,
	]);

	return {
		name,
		width,
		height,
		aspect: height ? width / height : 0,
		duration,
		hasAudio: KEEP_AUDIO && hasAudio,
		masterUrl: `/videos/${name}/master.m3u8`,
		posterUrl: `/videos/${name}/poster.jpg`,
		variants: LADDER.map((r, i) => ({
			rung: i,
			height: r.h,
			bandwidthKbps: r.vK + (KEEP_AUDIO && hasAudio ? r.aK : 0),
			playlistUrl: `/videos/${name}/out_${i}/index.m3u8`,
		})),
	};
}

/* CLI entry ---------------------------------------------------------- */
function parseTargets(argv) {
	const names = argv.filter((a) => !a.startsWith('-')).map(toName);
	return new Set(names);
}

(async () => {
	const targets = parseTargets(process.argv.slice(2));
	const partialBuild = targets.size > 0;

	let manifest = {};
	if (await exists(MANIFEST_PATH)) {
		try {
			manifest =
				JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8')) || {};
		} catch {}
	}

	const urlMap = JSON.parse(await fs.readFile(SRC_MAP_PATH, 'utf8'));
	const allowedNames = new Set(
		Object.keys(urlMap).map((key) => toName(key)),
	);
	if (!partialBuild) {
		manifest = {};
	} else {
		for (const key of Object.keys(manifest)) {
			if (!allowedNames.has(key)) delete manifest[key];
		}
	}
	const entries = Object.entries(urlMap).filter(
		([
			key,
		]) => (partialBuild ? targets.has(toName(key)) : true),
	);

	if (partialBuild && entries.length === 0) {
		console.warn(
			'⚠️ No matching video keys for:',
			[
				...targets,
			].join(', '),
		);
		process.exit(0);
	}

	await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
	await cleanTempRoot();

	if (!partialBuild) {
		await cleanOutRoot();
	} else {
		await fs.mkdir(OUT_ROOT, {
			recursive: true,
		});
	}

	for (const [
		rawName,
		rawUrl,
	] of entries) {
		const name = toName(rawName);
		console.log(`\n▶ ${name}`);
		try {
			const { file, hash, bytes } = await downloadToTemp(
				name,
				rawUrl,
			);
			const prev = manifest[name];

			if (partialBuild && prev?.sourceHash === hash) {
				console.log(
					`• Unchanged (${prettyBytes(bytes)}). Skipping transcode.`,
				);
				continue;
			}
			await fs
				.rm(path.join(OUT_ROOT, name), {
					recursive: true,
					force: true,
				})
				.catch(() => {});

			const info = await buildHLS(file, name);
			manifest[name] = {
				...info,
				sourceHash: hash,
				sourceSize: bytes,
			};
			console.log(
				`✓ Built ${name}  ${info.width}x${info.height}  ${Math.round(info.duration)}s`,
			);
		} catch (err) {
			console.error(`✗ ${name} failed:`, err?.message || err);
		}
	}

	await fs.writeFile(
		MANIFEST_PATH,
		JSON.stringify(
			Object.fromEntries(
				Object.entries(manifest).filter(([key]) =>
					allowedNames.has(key),
				),
			),
			null,
			2,
		),
	);
	console.log(`\n✓ Wrote manifest → ${MANIFEST_PATH}`);
	console.log(`✓ Outputs under → ${OUT_ROOT}`);

	await fs
		.rm(TEMP_ROOT, {
			recursive: true,
			force: true,
		})
		.catch(() => {});
})();
