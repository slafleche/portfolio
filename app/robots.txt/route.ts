import { NextResponse } from 'next/server';
import { getRuntimeEnv, isIndexingAllowed } from '@/lib/runtimeEnv';

const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';

function buildRobotsBody(): string {
  const env = getRuntimeEnv();

  // Staging, previews, and uncharted branches: always "do not index".
  if (env.hostedTier === 'staging' || env.kind !== 'hosted') {
    return [
      'User-agent: *',
      'Disallow: /',
    ].join('\n');
  }

  // Production (release): respect the indexing helper.
  if (isIndexingAllowed()) {
    return [
      'User-agent: *',
      'Allow: /',
    ].join('\n');
  }

  return [
    'User-agent: *',
    'Disallow: /',
  ].join('\n');
}

export function GET() {
  const body = buildRobotsBody();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': TEXT_CONTENT_TYPE,
      // Keep robots responses effectively uncached by intermediaries so
      // config/env changes take effect quickly after deploy.
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
