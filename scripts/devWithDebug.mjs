#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';

// Optional guard import — safe to fail
let installTTYGuards = () => {};
let restoreTTY = () => {};
try {
  ({ installTTYGuards, restoreTTY } = await import('./ttyGuard.mjs'));
} catch {}
installTTYGuards();

const hasTTY = !!(process.stdin && process.stdin.isTTY);

/* --------------------------- TTY snapshot/restore -------------------------- */

function snapshotTTY() {
  if (!hasTTY) return null;
  try {
    const out = spawnSync(
      'stty',
      [
        '-g',
      ],
      {
        stdio: [
          'inherit',
          'pipe',
          'inherit',
        ],
      },
    ).stdout;
    const s = out?.toString().trim();
    return s && /^[0-9a-f:;]+$/i.test(s) ? s : null;
  } catch {
    return null;
  }
}

function restoreTTYSnapshot(snap) {
  if (!snap || !hasTTY) return false;
  try {
    spawnSync(
      'stty',
      [
        snap,
      ],
      { stdio: 'inherit' },
    );
    return true;
  } catch {
    return false;
  }
}

function hardSaneTTY() {
  if (!hasTTY) return false;
  try {
    spawnSync(
      'stty',
      [
        'sane',
      ],
      { stdio: 'inherit' },
    );
    return true;
  } catch {
    return false;
  }
}

const ttySnap = hasTTY ? snapshotTTY() : null;

function fullRestoreAndExit(exitCode = 0) {
  try {
    restoreTTY();
  } catch {}
  const restored = ttySnap ? restoreTTYSnapshot(ttySnap) : false;
  if (!restored) {
    hardSaneTTY();
  }
  process.exit(Number.isInteger(exitCode) ? exitCode : 0);
}

/* --------------------------------- Helpers -------------------------------- */

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
      .map((e) => e.replace(/['"`]/g, '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/* ------------------------------- Child spawn ------------------------------- */

const interactive = process.env.INTERACTIVE === '1';
const stdio = interactive
  ? [
      'pipe',
      'pipe',
      'pipe',
    ]
  : [
      'ignore',
      'pipe',
      'pipe',
    ];
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
    stdio,
    env: process.env,
  },
);

/* ------------------------ Optional interactive proxy ----------------------- */

if (interactive && hasTTY) {
  process.stdin.setRawMode?.(false);
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  rl.on('line', (line) => {
    if (child.stdin?.writable && !child.killed)
      child.stdin.write(line + '\n');
  });
  rl.on('close', () => {
    try {
      child.stdin.end();
    } catch {}
  });
}

/* ----------------------------- Banner / locales ---------------------------- */

const localesPromise = loadAvailableLocales();
let bannerPrinted = false;
let stdoutBuffer = '';

child.stdout.on('data', async (chunk) => {
  const text = chunk.toString();
  process.stdout.write(chunk);
  if (bannerPrinted) return;

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

child.stderr.on('data', (chunk) => process.stderr.write(chunk));

/* ------------------------------- Exit paths -------------------------------- */

function wireCleanup() {
  process.on('SIGINT', () => fullRestoreAndExit(130));
  process.on('SIGTERM', () => fullRestoreAndExit(143));
  process.on('uncaughtException', (err) => {
    console.error(err);
    fullRestoreAndExit(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.error(reason);
    fullRestoreAndExit(1);
  });
  process.on('exit', () => {
    try {
      restoreTTY();
    } catch {}
    restoreTTYSnapshot(ttySnap);
  });
}

wireCleanup();

child.on('close', (code) =>
  fullRestoreAndExit(Number.isInteger(code) ? code : 0),
);
child.on('error', (error) => {
  console.error(error);
  fullRestoreAndExit(1);
});
