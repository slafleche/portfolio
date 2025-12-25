import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

loadEnv({ path: '.env.local', override: true });
loadEnv({ path: '.env', override: true });
loadEnv({ path: '../.env.local', override: true });
loadEnv({ path: '../.env', override: true });

type Target = '_staging' | 'release';
type AssetKind = 'images' | 'fonts' | 'videos';
type Versions = Record<AssetKind, string>;

type ParsedArgs = {
  targets?: Target[];
  kinds: Set<AssetKind>;
  version?: string;
  yes: boolean;
  dryRun: boolean;
  purgePrefixes: boolean;
  urls: string[];
  help: boolean;
};

type RequiredEnv = {
  CF_API_TOKEN?: string;
  CF_ZONE_ID?: string;
  CDN_PUBLIC_BASE_URL?: string;
};

const PREFIX_BY_TARGET: Record<Target, string> = {
  release: 'release',
  _staging: '_staging',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

function requireEnv(name: keyof RequiredEnv, env: RequiredEnv): string {
  const value = env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var ${name}`);
  }
  return value.trim();
}

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${message} [y/N]: `);
  await rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const kinds = new Set<AssetKind>();
  let targets: Target[] | undefined;
  let version: string | undefined;
  let yes = false;
  let dryRun = false;
  let purgePrefixes = false;
  let help = false;
  const urls: string[] = [];

  for (const arg of args) {
    if (arg === '--images') kinds.add('images');
    else if (arg === '--fonts') kinds.add('fonts');
    else if (arg === '--videos') kinds.add('videos');
    else if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'staging' || t === 's') {
        targets = ['_staging'];
      } else if (t === 'release' || t === 'r') {
        targets = ['release'];
      } else if (t === 'both' || t === 'b') {
        targets = [
          '_staging',
          'release',
        ];
      }
    } else if (arg.startsWith('--version=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) version = v;
    } else if (arg === '--yes' || arg === '-y') {
      yes = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--prefix') {
      purgePrefixes = true;
    } else if (arg.startsWith('--url=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) urls.push(v);
    } else if (arg.startsWith('--urls=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) {
        urls.push(
          ...v
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        );
      }
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    }
  }

  if (kinds.size === 0) {
    kinds.add('images');
    kinds.add('fonts');
    kinds.add('videos');
  }

  if (!purgePrefixes && urls.length === 0) {
    purgePrefixes = true;
  }

  return {
    targets,
    kinds,
    version,
    yes,
    dryRun,
    purgePrefixes,
    urls,
    help,
  };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function pickTargets(): Promise<Target[]> {
  const stagingPath = path.join(REPO_ROOT, 'tmp', 'cdn', '_staging');
  const releasePath = path.join(REPO_ROOT, 'tmp', 'cdn', 'release');
  const stagingExists = await fileExists(stagingPath);
  const releaseExists = await fileExists(releasePath);

  if (stagingExists && releaseExists) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      'Found manifests for both _staging and release. Use which? [_staging (s)/release (r)/both (b)] (default: both). Tip: pass --target=_staging, --target=release, or --target=both to skip prompt: ',
    );
    await rl.close();
    const t = answer.trim();
    if (t === 'release' || t === 'r') return ['release'];
    if (t === '_staging' || t === 'staging' || t === 's') return ['_staging'];
    if (t === 'both' || t === 'b' || t === '') {
      return [
        '_staging',
        'release',
      ];
    }
    return [
      '_staging',
      'release',
    ];
  }

  if (releaseExists) return ['release'];
  return ['_staging'];
}

async function resolveVersions(
  target: Target,
  override?: string,
): Promise<Versions> {
  if (override) {
    return {
      images: override,
      fonts: override,
      videos: override,
    };
  }

  const versionsPath = path.join(
    REPO_ROOT,
    'cdn',
    'assetGroupVersions.json',
  );
  const raw = await fs.readFile(versionsPath, 'utf8').catch(() => null);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<
        Record<Target, { images?: string; fonts?: string; videos?: string }>
      >;
      const images = parsed?.[target]?.images;
      const fonts = parsed?.[target]?.fonts;
      const videos = parsed?.[target]?.videos;
      return {
        images:
          typeof images === 'string' && images.trim()
            ? images.trim()
            : 'v1',
        fonts: typeof fonts === 'string' && fonts.trim() ? fonts.trim() : 'v1',
        videos: typeof videos === 'string' && videos.trim() ? videos.trim() : 'v1',
      };
    } catch {
      // ignore
    }
  }

  return {
    images: 'v1',
    fonts: 'v1',
    videos: 'v1',
  };
}

function normalizeHost(baseUrl: string): string {
  const raw = baseUrl.trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) {
    return new URL(raw).host;
  }
  return raw.replace(/\/+$/, '');
}

function buildPrefixes(options: {
  host: string;
  target: Target;
  kinds: Set<AssetKind>;
  versions: Versions;
}): string[] {
  const { host, target, kinds, versions } = options;
  const prefix = PREFIX_BY_TARGET[target];

  return Array.from(kinds).map(
    (kind) => `${host}/${prefix}/${kind}/${versions[kind]}/`,
  );
}

async function purgeCache(options: {
  zoneId: string;
  token: string;
  files?: string[];
  prefixes?: string[];
  dryRun: boolean;
}): Promise<void> {
  const { zoneId, token, files, prefixes, dryRun } = options;
  if ((!files || files.length === 0) && (!prefixes || prefixes.length === 0)) {
    return;
  }

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;
  const payload: Record<string, string[]> = {};
  if (files && files.length > 0) payload.files = files;
  if (prefixes && prefixes.length > 0) payload.prefixes = prefixes;

  if (dryRun) {
    console.log('[dry-run] purge payload:', JSON.stringify(payload, null, 2));
    return;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `Purge failed (${res.status}): ${JSON.stringify(data)}`,
    );
  }
  if (!data?.success) {
    throw new Error(`Purge failed: ${JSON.stringify(data)}`);
  }
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    console.log(
      [
        'Usage: yarn --cwd cdn cdn:cache [--target=_staging|staging|release|both] [--version=vX] [--images] [--fonts] [--videos] [--prefix] [--url=...] [--urls=a,b,c] [--dry-run] [--yes]',
        '',
        'Flags:',
        '  --target=...   Choose _staging (or staging/s), release (or r), or both (or b). Default prompts if both exist.',
        '  --version=...  Override version for all kinds (otherwise uses cdn/assetGroupVersions.json).',
        '  --images       Include images (default on if no kinds specified).',
        '  --fonts        Include fonts (default on if no kinds specified).',
        '  --videos       Include videos (default on if no kinds specified).',
        '  --prefix       Purge CDN by prefix (default if no urls provided).',
        '  --url=...      Purge a single URL (repeatable).',
        '  --urls=...     Purge a comma-separated URL list.',
        '  --dry-run      Print payloads without sending purge requests.',
        '  --yes, -y      Skip confirmation prompt.',
        '',
        'Requires env: CF_API_TOKEN, CF_ZONE_ID, CDN_PUBLIC_BASE_URL.',
      ].join('\n'),
    );
    return;
  }

  const env = process.env as RequiredEnv;
  const token = requireEnv('CF_API_TOKEN', env);
  const zoneId = requireEnv('CF_ZONE_ID', env);
  const host = normalizeHost(
    requireEnv('CDN_PUBLIC_BASE_URL', env),
  );

  const targets = args.targets ?? (await pickTargets());

  const allPrefixes: string[] = [];
  for (const target of targets) {
    const versions = await resolveVersions(target, args.version);
    if (args.purgePrefixes) {
      allPrefixes.push(
        ...buildPrefixes({
          host,
          target,
          kinds: args.kinds,
          versions,
        }),
      );
    }
  }

  const urls = Array.from(
    new Set(args.urls.map((value) => value.trim()).filter(Boolean)),
  );
  const prefixes = Array.from(new Set(allPrefixes));

  if (urls.length === 0 && prefixes.length === 0) {
    throw new Error('Nothing to purge. Provide --prefix and/or --url(s).');
  }

  if (!args.yes && !args.dryRun) {
    const lines = [
      urls.length > 0 ? `URLs: ${urls.length}` : null,
      prefixes.length > 0 ? `Prefixes: ${prefixes.length}` : null,
    ]
      .filter(Boolean)
      .join(', ');
    const ok = await confirm(`Purge cache? (${lines})`);
    if (!ok) {
      console.log('Aborted by user.');
      return;
    }
  }

  const fileBatches = chunk(urls, 30);
  const prefixBatches = chunk(prefixes, 30);

  for (const batch of fileBatches) {
    await purgeCache({
      zoneId,
      token,
      files: batch,
      dryRun: args.dryRun,
    });
    console.log(
      `${args.dryRun ? '[dry-run] ' : ''}✓ Purged ${batch.length} URL(s)`,
    );
  }

  for (const batch of prefixBatches) {
    await purgeCache({
      zoneId,
      token,
      prefixes: batch,
      dryRun: args.dryRun,
    });
    console.log(
      `${args.dryRun ? '[dry-run] ' : ''}✓ Purged ${batch.length} prefix(es)`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
