import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export type CacheBustingConfig = {
  hashLength: number;
  prefix?: string;
  publicRoot?: string;
};

export type HashedWriteParams = CacheBustingConfig & {
  outDir: string;
  logicalName: string;
  ext: string;
  buffer: Buffer | string;
};

export type HashedWriteResult = {
  fileName: string;
  absolutePath: string;
  urlPath: string;
  hash: string;
};

const DEFAULT_PUBLIC_ROOT = '/';

export const hashBuffer = (
  buffer: Buffer | string,
  length: number,
) => {
  const rawHash = crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
  return rawHash.slice(0, Math.max(1, length));
};

export const formatHashedFileName = (
  logicalName: string,
  hash: string,
  ext: string,
  prefix?: string,
) => {
  const base = prefix ? `${prefix}-${logicalName}` : logicalName;
  return `${base}.${hash}${ext.startsWith('.') ? ext : `.${ext}`}`;
};

export async function writeHashedFile({
  outDir,
  logicalName,
  ext,
  buffer,
  hashLength,
  prefix,
  publicRoot = DEFAULT_PUBLIC_ROOT,
}: HashedWriteParams): Promise<HashedWriteResult> {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const hash = hashBuffer(buf, hashLength);
  const fileName = formatHashedFileName(
    logicalName,
    hash,
    ext,
    prefix,
  );
  await fs.mkdir(outDir, { recursive: true });
  const absolutePath = path.join(outDir, fileName);
  await fs.writeFile(absolutePath, buf);
  const normalizedRoot = publicRoot.endsWith('/')
    ? publicRoot.slice(0, -1)
    : publicRoot;
  const urlPath = `${normalizedRoot}/${fileName}`.replace(
    /\/+/g,
    '/',
  );
  return {
    fileName,
    absolutePath,
    urlPath,
    hash,
  };
}

export type CopyHashedFileParams = CacheBustingConfig & {
  sourcePath: string;
  outDir: string;
  logicalName: string;
  ext?: string;
};

export async function copyHashedFile({
  sourcePath,
  outDir,
  logicalName,
  hashLength,
  prefix,
  publicRoot = DEFAULT_PUBLIC_ROOT,
  ext,
}: CopyHashedFileParams): Promise<HashedWriteResult> {
  const buffer = await fs.readFile(sourcePath);
  const finalExt = ext ?? path.extname(sourcePath);
  return writeHashedFile({
    outDir,
    logicalName,
    ext: finalExt,
    buffer,
    hashLength,
    prefix,
    publicRoot,
  });
}
