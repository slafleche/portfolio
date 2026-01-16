/* eslint-env worker */
export default {
  async fetch(request) {
    const origin = request.headers.get('Origin');

    const allow = new Set([
      'https://staging.lafleche.dev',
      'https://lafleche.dev',
      'http://localhost:3000',
    ]);

    const url = new URL(request.url);

    // CHANGE THIS if your backend is different
    url.protocol = 'https:';
    url.hostname = 'lafleche.dev';

    // Preflight
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

    const res = await fetch(new Request(url.toString(), request));
    const headers = new Headers(res.headers);

    if (origin && allow.has(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Vary', 'Origin');
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  },
};
