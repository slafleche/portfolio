import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isIndexingAllowed, isRelease } from '@/lib/runtimeEnv';

const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';

function buildRobotsBody(origin: string): string {
  // Allow indexing only in release environments where indexing is allowed.
  if (isRelease() && isIndexingAllowed()) {
    return [
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${origin}/sitemap.xml`,
    ].join('\n');
  }

  return [
    'User-agent: *',
    'Disallow: /',
  ].join('\n');
}

export function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const body = buildRobotsBody(origin);

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
