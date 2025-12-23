import { config as loadEnv } from 'dotenv';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

const envPaths = [
  '.env.local',
  '.env',
  '../.env.local',
  '../.env',
];
for (const path of envPaths) {
  loadEnv({ path, override: false });
}

type Env = {
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ENDPOINT?: string;
  R2_BUCKET?: string;
};

const env = process.env as Env;

const requireEnv = (name: keyof Env): string => {
  const value = env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value.trim();
};

const bucket = requireEnv('R2_BUCKET');
const endpoint = requireEnv('R2_ENDPOINT');
const accessKeyId = requireEnv('R2_ACCESS_KEY_ID');
const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY');

const s3 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const isLikelyFullPath = (key: string): boolean => {
  // Require at least two path segments and no trailing slash.
  return /^[A-Za-z0-9_.+-]+\/.+[^/]$/.test(key);
};

const hasAtLeastOneSegment = (key: string): boolean => {
  return /^[A-Za-z0-9_.+-]+/.test(key);
};

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${message} [y/N]: `);
  await rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

async function ensureExists(key: string) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    throw new Error(
      `Object "${key}" not found in bucket "${bucket}": ${message}`,
    );
  }
}

async function deleteObject(key: string) {
  await ensureExists(key);

  const ok = await confirm(
    `Delete "${key}" from bucket "${bucket}" at ${endpoint}?`,
  );
  if (!ok) {
    console.log('Aborted by user.');
    return;
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
  console.log(`Deleted "${key}" from bucket "${bucket}".`);
}

async function deletePrefix(prefix: string) {
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`;
  if (!hasAtLeastOneSegment(normalized)) {
    throw new Error('Refusing to delete: prefix must have at least one segment.');
  }

  let continuation: string | undefined;
  let keys: string[] = [];

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: normalized,
        ContinuationToken: continuation,
      }),
    );
    const contents = res.Contents ?? [];
    for (const obj of contents) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuation = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuation);

  if (keys.length === 0) {
    console.log(`No objects found under prefix "${normalized}".`);
    return;
  }

  console.log(
    `About to delete ${keys.length} object(s) under prefix "${normalized}" in bucket "${bucket}".`,
  );
  const ok = await confirm('Are you sure?');
  if (!ok) {
    console.log('Aborted by user.');
    return;
  }

  // Delete in batches of up to 1000 keys per S3 API limits
  const chunkSize = 900;
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: false,
        },
      }),
    );
  }
  console.log(`Deleted prefix "${normalized}" (${keys.length} object(s)).`);
}

async function main() {
  const [, , command, arg] = process.argv;

  if (command === 'delete') {
    if (!arg) {
      console.error(
        'Usage: tsx cdnClient.mts delete <full-key-path> (e.g., fonts/family/hash/file.woff2)',
      );
      process.exit(1);
    }

    const key = arg.trim();
    if (!isLikelyFullPath(key)) {
      console.error(
        'Refusing to delete: provide a full key path with at least two segments (e.g., "fonts/family/file").',
      );
      process.exit(1);
    }

    await deleteObject(key);
    return;
  }

  if (command === 'delete-prefix') {
    if (!arg) {
      console.error(
        'Usage: tsx cdnClient.mts delete-prefix <prefix> (e.g., favicons or staging/fonts)',
      );
      process.exit(1);
    }
    const prefix = arg.trim();
    await deletePrefix(prefix);
    return;
  }

  if (command === 'ls') {
    const scope = arg?.trim() ?? 'root';
    const prefix = scope === 'staging' || scope === '_staging' ? '_staging/' : '';
    let continuation: string | undefined;
    let total = 0;

    do {
      const res = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix.length > 0 ? prefix : undefined,
          ContinuationToken: continuation,
        }),
      );
      const contents = res.Contents ?? [];
      for (const obj of contents) {
        if (obj.Key) {
          console.log(obj.Key);
          total += 1;
        }
      }
      continuation = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuation);

    if (total === 0) {
      console.log(
        prefix ? `No objects found under prefix "${prefix}".` : 'Bucket is empty.',
      );
    } else {
      console.log(`Total: ${total} object(s).`);
    }
    return;
  }

  console.error(
    'Usage:\n  tsx cdnClient.mts delete <full-key-path>\n  tsx cdnClient.mts delete-prefix <prefix>\n  tsx cdnClient.mts ls [root|staging]',
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
