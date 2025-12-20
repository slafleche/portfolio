import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { isDev } from '@/lib/runtimeEnv';

const DEFAULTS_PATH = path.resolve(
  process.cwd(),
  'app',
  '[LOCALE]',
  'debug',
  'projectorPath',
  'projectorPath.defaults.json',
);

const forbiddenResponse = () =>
  NextResponse.json({ error: 'Debug only.' }, { status: 403 });

export async function GET() {
  if (!isDev()) return forbiddenResponse();
  try {
    const raw = await readFile(DEFAULTS_PATH, 'utf8');
    return new NextResponse(raw, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new NextResponse('{"channels":[],"centerOffset":{}}', {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  if (!isDev()) return forbiddenResponse();
  try {
    const payload: unknown = await request.json();
    const serialized = JSON.stringify(payload, null, 2);
    await writeFile(DEFAULTS_PATH, serialized, 'utf8');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to write defaults.' },
      { status: 500 },
    );
  }
}
