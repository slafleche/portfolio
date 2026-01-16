/* eslint-env worker */
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allow = new Set([
      'https://staging.lafleche.dev',
      'https://lafleche.dev',
      'http://localhost:3000',
    ]);

    if (request.method === 'OPTIONS') {
      if (origin && allow.has(origin)) {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers':
              request.headers.get('Access-Control-Request-Headers') ||
              '*',
            'Access-Control-Max-Age': '86400',
            Vary: 'Origin',
          },
        });
      }
      return new Response(null, { status: 204 });
    }

    const url = new URL(request.url);
    const key = url.pathname.replace(/^\/+/, '');
    const object = await env.ASSETS.get(key);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers(object.httpMetadata ?? {});
    if (object.size) {
      headers.set('Content-Length', object.size.toString());
    }
    if (object.etag) {
      headers.set('ETag', object.etag);
    }
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    if (origin && allow.has(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Vary', 'Origin');
    }

    return new Response(object.body, {
      status: 200,
      headers,
    });
  },
};
