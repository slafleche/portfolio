#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { URLSearchParams } from 'node:url';
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
let stderrBuffer = '';

const NOISY_WARNING_PATTERNS = [
  /\[webpack\.cache\.PackFileCacheStrategy]/,
  /while serializing webpack\/lib\/cache\/PackFileCacheStrategy/i,
  /No serializer registered for (?:SimpleWebpackError|PostCSSSyntaxError)/,
];

const HTTP_LOG_RE = /^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+\/\S+/m;
const RELOAD_MARKERS = [
  'Fast Refresh had to perform a full reload due to a runtime error.',
  'Fast Refresh had to perform a full reload.',
];

const logSeparator = (label) => {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
  });
  const bar = '─'.repeat(18);
  process.stdout.write(`\n${bar} ${label} @ ${timestamp} ${bar}\n\n`);
};

child.stdout.on('data', async (chunk) => {
  const text = chunk.toString();
  process.stdout.write(chunk);
  if (RELOAD_MARKERS.some((phrase) => text.includes(phrase))) {
    logSeparator('fast refresh');
  }
  if (bannerPrinted) return;

  stdoutBuffer += text;
  if (stdoutBuffer.includes('Local')) {
    const locales = await localesPromise.catch(() => []);
    if (locales.length) {
      console.log('info  - Debug routes (local):');
      const debugPages = ['favicons', 'formelements'];
      for (const locale of locales) {
        for (const page of debugPages) {
          const pathname = `/${locale}/debug/${page}`;
          const url = `http://localhost:3000${pathname}`;
          const hyperlink = `\u001b]8;;${url}\u0007${pathname}\u001b]8;;\u0007`;
          console.log(`         ${hyperlink}  ${url}`);
        }
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

const formatVEVirtualCssLine = (line) => {
  const trimmed = line.trimStart();
  const marker = '⨯ ./node_modules/@vanilla-extract/webpack-plugin/vanilla.virtual.css?';
  if (!trimmed.startsWith(marker)) return line;
  const queryStart = line.indexOf('?');
  if (queryStart === -1) return line;
  const colonIndex = line.indexOf(':', queryStart);
  const query = line.slice(queryStart + 1, colonIndex === -1 ? undefined : colonIndex);
  try {
    const params = new URLSearchParams(query);
    const fileName = params.get('fileName')
      ? decodeURIComponent(params.get('fileName'))
      : null;
    const source = params.get('source') ? 'virtual css' : null;
    const prefix = line.slice(0, line.indexOf('⨯'));
    const summary =
      `${prefix}✖ vanilla-extract error in ${fileName ?? 'unknown file'}` +
      (source ? ` (${source})` : '');
    return summary;
  } catch {
    return line;
  }
};

child.stderr.on('data', (chunk) => {
  stderrBuffer += chunk.toString();
  const lines = stderrBuffer.split(/\r?\n/);
  stderrBuffer = lines.pop() ?? '';
  const filtered = lines.filter(
    (line) =>
      line.trim().length === 0 ||
      !NOISY_WARNING_PATTERNS.some((pattern) => pattern.test(line)),
  ).map(formatVEVirtualCssLine);
  const output = filtered.join('\n').trimEnd();
  if (output) {
    process.stderr.write(output + '\n');
    logSeparator('stderr');
  }
});
child.stderr.on('close', () => {
  if (stderrBuffer.trim().length) {
    process.stderr.write(stderrBuffer);
  }
});

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
