import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isIndexingAllowed, isRelease } from '@/lib/runtimeEnv';

const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';

const AI_TRAINING_BOT_BLOCKS = [
  'User-agent: Google-Extended',
  'Disallow: /',
  '',
  'User-agent: GPTBot',
  'Disallow: /',
  '',
  'User-agent: ChatGPT-User',
  'Disallow: /',
  '',
  'User-agent: OAI-SearchBot',
  'Disallow: /',
  '',
  'User-agent: ClaudeBot',
  'Disallow: /',
  '',
  'User-agent: CCBot',
  'Disallow: /',
  '',
  'User-agent: Bytespider',
  'Disallow: /',
  '',
  'User-agent: PerplexityBot',
  'Disallow: /',
  '',
  'User-agent: Applebot-Extended',
  'Disallow: /',
  '',
  'User-agent: meta-externalagent',
  'Disallow: /',
  '',
  'User-agent: meta-externalfetcher',
  'Disallow: /',
];

function buildRobotsBody(origin: string): string {
  const lines: string[] = [];

  // Allow indexing only in release environments where indexing is allowed.
  if (isRelease() && isIndexingAllowed()) {
    lines.push(
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${origin}/sitemap.xml`,
    );
  } else {
    lines.push(
      'User-agent: *',
      'Disallow: /',
    );
  }

  lines.push('', ...AI_TRAINING_BOT_BLOCKS);

  return lines.join('\n');
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
