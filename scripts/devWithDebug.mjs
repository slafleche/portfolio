#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { installTTYGuards } from './ttyGuard.mjs';

installTTYGuards();

async function loadAvailableLocales() {
	const localeFile = path.resolve(
		process.cwd(),
		'src',
		'lib',
		'locales',
		'translations',
		'index.ts',
	);

	try {
		const raw = await readFile(localeFile, 'utf8');
		const match = raw.match(
			/AVAILABLE_LOCALES\s*=\s*\[\s*([\s\S]*?)\s*\]\s*as const/,
		);
		if (!match) return [];
		return match[1]
			.split(',')
			.map((entry) => entry.replace(/['"`]/g, '').trim())
			.filter(Boolean);
	} catch {
		return [];
	}
}

const nextArgs = [
	'dev',
	...process.argv.slice(2),
];

const child = spawn(
	process.platform === 'win32' ? 'npx.cmd' : 'npx',
	[
		'next',
		...nextArgs,
	],
	{
		stdio: [
			'inherit',
			'pipe',
			'pipe',
		],
		env: process.env,
	},
);

const localesPromise = loadAvailableLocales();

let bannerPrinted = false;
let stdoutBuffer = '';

child.stdout.on('data', async (chunk) => {
	const text = chunk.toString();
	process.stdout.write(chunk);

	if (bannerPrinted) {
		return;
	}

	stdoutBuffer += text;
	if (stdoutBuffer.includes('Local')) {
		const locales = await localesPromise.catch(() => []);
		if (locales.length) {
			console.log('info  - Debug routes (local):');
			for (const locale of locales) {
				const pathname = `/${locale}/debug/favicons`;
				const url = `http://localhost:3000${pathname}`;
                const hyperlink = `\u001b]8;;${url}\u0007${pathname}\u001b]8;;\u0007`;
                console.log(`         ${hyperlink}  ${url}`);
			}
		} else {
			console.log('info  - Debug routes: none');
		}
		bannerPrinted = true;
		stdoutBuffer = '';
	} else if (stdoutBuffer.length > 1024) {
		stdoutBuffer = stdoutBuffer.slice(-1024);
	}
});

child.stderr.on('data', (chunk) => {
	process.stderr.write(chunk);
});

child.on('close', (code, signal) => {
	if (typeof code === 'number') {
		process.exit(code);
	} else if (signal) {
		process.kill(process.pid, signal);
	} else {
		process.exit(0);
	}
});
