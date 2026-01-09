import fs from 'node:fs/promises';
import path from 'node:path';

import { execa } from 'execa';

const ROOT = process.cwd();
const RESULTS_DIR = path.join(ROOT, 'test-results');

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

const main = async () => {
  const { keep, clear, passThrough } = parseArgs(
    process.argv.slice(2),
  );

  if (clear) {
    await fs.rm(RESULTS_DIR, { recursive: true, force: true });
  }

  await execa('yarn', ['playwright', 'test', ...passThrough], {
    stdio: 'inherit',
  });

  await removeOldRuns(keep);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
