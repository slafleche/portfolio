import fs from 'node:fs/promises';
import path from 'node:path';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  getManifestTarget,
  type ManifestTarget,
} from '@/lib/runtimeEnv';

const resolveTarget = (request: NextRequest): ManifestTarget => {
  const url = new URL(request.url);
  const raw = url.searchParams.get('target');
  if (raw === 'release' || raw === '_staging') {
    return raw;
  }
  return getManifestTarget();
};

export async function GET(request: NextRequest) {
  const target = resolveTarget(request);
  const filePath = path.join(
    process.cwd(),
    'src',
    'data',
    'generated',
    target,
    'fonts',
    'manifest.fonts.gen.json',
  );

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return new NextResponse(raw, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
