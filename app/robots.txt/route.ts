import { NextResponse } from 'next/server';

import { isIndexingAllowed, isRelease } from '@/lib/runtimeEnv';

const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';

function buildRobotsBody(): string {
  // Allow indexing only in release environments where indexing is allowed.
  if (isRelease() && isIndexingAllowed()) {
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
