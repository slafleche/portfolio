export type EnvOverrides = Record<string, string | undefined>;
type EnvShape = Record<string, string | undefined>;

const SAFE_ENV_KEYS = [
  'PATH',
  'HOME',
  'USER',
  'LOGNAME',
  'SHELL',
  'PWD',
  'TMPDIR',
  'TMP',
  'TEMP',
  'LANG',
  'LC_ALL',
];

function pickSafeEnv(source: NodeJS.ProcessEnv): EnvShape {
  const safe: EnvShape = {};
  for (const key of SAFE_ENV_KEYS) {
    const value = source[key];
    if (value !== undefined) {
      safe[key] = value;
    }
  }
  return safe;
}

const SAFE_ENV_BASE = pickSafeEnv(process.env);

export function buildTestEnvBase(): EnvShape {
  return {
    ...SAFE_ENV_BASE,
    NODE_ENV: 'test',
    CI: '1',
    TZ: 'UTC',
  };
}

export function buildTestEnv(
  overrides: EnvOverrides = {},
): EnvShape {
  const nextEnv: EnvShape = {
    ...buildTestEnvBase(),
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete nextEnv[key];
      continue;
    }
    nextEnv[key] = value;
  }

  return nextEnv;
}

export function withTestEnv<T>(
  overrides: EnvOverrides,
  fn: () => T,
): T {
  const original = { ...process.env } as NodeJS.ProcessEnv;
  process.env = buildTestEnv(overrides) as NodeJS.ProcessEnv;
  try {
    return fn();
  } finally {
    process.env = original;
  }
}

export function installTestEnv(
  overrides: EnvOverrides = {},
): () => void {
  const original = { ...process.env } as NodeJS.ProcessEnv;
  process.env = buildTestEnv(overrides) as NodeJS.ProcessEnv;

  return () => {
    process.env = original;
  };
}
