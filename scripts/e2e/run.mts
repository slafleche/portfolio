import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';

import { execa } from 'execa';

const ROOT = process.cwd();
const RESULTS_DIR = path.join(ROOT, 'test-results');
const LOCALHOST_PORT = 3000;
const LOCALHOST_URL = `http://localhost:${LOCALHOST_PORT}`;
const NEXT_DEV_LOCK = path.join(ROOT, '.next', 'dev', 'lock');

type Options = {
  keep: number;
  clear: boolean;
  passThrough: string[];
};

const parseArgs = (argv: string[]): Options => {
  const passThrough: string[] = [];
  let keep = 5;
  let clear = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--clear') {
      clear = true;
      continue;
    }
    if (arg === '--keep') {
      const next = argv[i + 1];
      if (next && !Number.isNaN(Number(next))) {
        keep = Math.max(0, Number(next));
        i += 1;
        continue;
      }
    }
    passThrough.push(arg);
  }

  return {
    keep,
    clear,
    passThrough,
  };
};

const listRuns = async () => {
  try {
    const entries = await fs.readdir(RESULTS_DIR, {
      withFileTypes: true,
    });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .reverse();
  } catch {
    return [];
  }
};

const pruneBeforeRun = async (keep: number) => {
  if (keep <= 0) {
    await fs.rm(RESULTS_DIR, { recursive: true, force: true });
    return;
  }
  const runs = await listRuns();
  const targetMax = Math.max(0, keep - 1);
  const toRemove = runs.slice(targetMax);
  await Promise.all(
    toRemove.map((dir) =>
      fs.rm(path.join(RESULTS_DIR, dir), {
        recursive: true,
        force: true,
      }),
    ),
  );
};

const removeOldRuns = async (keep: number) => {
  if (keep < 0) return;
  const runs = await listRuns();
  const toRemove = runs.slice(keep);
  await Promise.all(
    toRemove.map((dir) =>
      fs.rm(path.join(RESULTS_DIR, dir), {
        recursive: true,
        force: true,
      }),
    ),
  );
};

const isLocalhostUrl = (raw?: string): boolean => {
  if (!raw) return true;
  try {
    const url = new URL(raw);
    return [
      'localhost',
      '127.0.0.1',
      '::1',
    ].includes(url.hostname);
  } catch {
    return false;
  }
};

const hasNextDevLock = async (): Promise<boolean> => {
  try {
    await fs.access(NEXT_DEV_LOCK);
    return true;
  } catch {
    return false;
  }
};

const isPortInUseAtHost = (
  port: number,
  host: string,
): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(300);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });

const isPortInUse = async (port: number): Promise<boolean> => {
  const hosts = [
    '127.0.0.1',
    '::1',
  ];
  for (const host of hosts) {
    if (await isPortInUseAtHost(port, host)) return true;
  }
  return false;
};

const main = async () => {
  const { keep, clear, passThrough } = parseArgs(
    process.argv.slice(2),
  );

  const isLocalhost = isLocalhostUrl(
    process.env.PLAYWRIGHT_BASE_URL,
  );
  const [
    hasLock,
    portInUse,
  ] = await Promise.all([
    hasNextDevLock(),
    isPortInUse(LOCALHOST_PORT),
  ]);

  if (isLocalhost && hasLock && portInUse) {
    process.env.PLAYWRIGHT_REUSE_EXISTING = '1';
    process.env.PLAYWRIGHT_BASE_URL = LOCALHOST_URL;
    process.env.PLAYWRIGHT_PORT = String(LOCALHOST_PORT);
  }

  if (clear) {
    await fs.rm(RESULTS_DIR, { recursive: true, force: true });
  }

  try {
    await pruneBeforeRun(keep);
    await execa(
      'yarn',
      ['playwright', 'test', ...passThrough],
      {
        stdio: 'inherit',
      },
    );
  } finally {
    await removeOldRuns(keep);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
