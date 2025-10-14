#!/usr/bin/env node
import { optimize } from 'svgo';
import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';

// CLI usage:
//   node scripts/optimize-svgs.mjs "public/**/*.svg" --write
//   node scripts/optimize-svgs.mjs "icons/*.svg" --precision=2 --shorten-ids
//
// Notes:
// - By default prints diffed size changes; use --write to overwrite files.
// - --precision sets float precision. Default comes from svgo.config.mjs.
// - --shorten-ids enables ID minification (not recommended if you style by ID).

const args = process.argv.slice(2);
if (args.length === 0) {
	console.log(`Usage:
  ${pc.bold('node scripts/optimize-svgs.mjs')} ${pc.dim('"glob/pattern/**/*.svg" [more globs] [--write] [--precision=3] [--shorten-ids]')}
`);
	process.exit(1);
}

const globs = [];
const flags = new Set();
const opts = {
	precision: undefined,
	shortenIds: false,
	write: false,
};

for (const a of args) {
	if (a.startsWith('--precision=')) {
		const n = Number(a.split('=')[1]);
		if (!Number.isNaN(n)) opts.precision = n;
	} else if (a === '--shorten-ids') {
		opts.shortenIds = true;
	} else if (a === '--write') {
		opts.write = true;
	} else if (a.startsWith('--')) {
		flags.add(a);
	} else {
		globs.push(a);
	}
}

if (globs.length === 0) {
	globs.push('src/assets/**/*.{svg,SVG}');
}

const files = await fg(globs, {
	onlyFiles: true,
	dot: false,
	caseSensitiveMatch: false,
});

if (files.length === 0) {
	console.log(pc.yellow('No SVG files matched.'));
	process.exit(0);
}

const configPath = path.resolve('svgo.config.mjs');
let baseConfig = {};
try {
	// Dynamically import user's svgo config if present
	baseConfig =
		(await import(pathToFileURL(configPath))).default ?? {};
} catch {
	// fall back to minimal config if not found
	baseConfig = {
		multipass: true,
		plugins: [
			[
				'preset-default',
				{
					overrides: {
						removeViewBox: false,
						cleanupIds: false,
					},
				},
			],
			'convertTransform',
			['convertPathData', { forceAbsolutePath: true }],
		],
	};
}

function pathToFileURL(p) {
	const url = new URL('file://');
	// Windows support
	const resolved = path.resolve(p).replace(/\\/g, '/');
	url.pathname = resolved.startsWith('/') ? resolved : `/${resolved}`;
	return url;
}

// Apply CLI overrides
if (opts.precision != null) {
	baseConfig.floatPrecision = opts.precision;
}
if (opts.shortenIds) {
	// Enable ID shortening on top of user's config
	baseConfig.plugins ??= [];
	baseConfig.plugins.push([
		'cleanupIds',
		{ remove: true, minify: true },
	]);
}

let totalSaved = 0;
let changed = 0;

for (const file of files) {
	const input = await fs.readFile(file, 'utf8');
	const before = Buffer.byteLength(input, 'utf8');

	const result = optimize(input, {
		path: file,
		...baseConfig,
	});

	if (result.error) {
		console.error(pc.red(`✗ ${file}`), result.error);
		continue;
	}

	const output = result.data;
	const after = Buffer.byteLength(output, 'utf8');
	const delta = before - after;
	const pct = before ? ((delta / before) * 100).toFixed(1) : '0.0';

	if (opts.write && output !== input) {
		await fs.writeFile(file, output, 'utf8');
		changed++;
	}

	const sign = delta >= 0 ? pc.green('↓') : pc.red('↑');
	console.log(
		`${sign} ${pc.bold(file)}  ${pc.dim(`${before} → ${after} bytes`)}  ${delta >= 0 ? pc.green(`(-${delta}, ${pct}%)`) : pc.red(`(+${-delta}, ${pct}%)`)}`,
	);

	totalSaved += Math.max(delta, 0);
}

if (opts.write) {
	console.log(
		pc.bold(
			pc.green(
				`Done. Updated ${changed}/${files.length} files. Saved ~${totalSaved} bytes total.`,
			),
		),
	);
} else {
	console.log(
		pc.dim(
			`(dry run — add ${pc.bold('--write')} to overwrite files)`,
		),
	);
}
