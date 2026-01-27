/* global Response */

const ALLOW_ORIGINS_STAGING = new Set([
  // Staging site
  "https://staging.lafleche.dev",

  // Local dev (Storybook / Next dev)
  "http://localhost:6006",
  "http://127.0.0.1:6006",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const ALLOW_ORIGINS_PROD = new Set([
  // Production site(s)
  "https://lafleche.dev",
  "https://www.lafleche.dev",
]);

const ALLOW_ORIGIN_SUFFIXES_PROD = [
  // Chromatic previews (e.g. https://<build>.chromatic.com)
  ".chromatic.com",
];

// Keep this tight for an asset bucket:
const ALLOW_METHODS = "GET, HEAD, OPTIONS";
// If you truly need POST to this hostname, change to:
// const ALLOW_METHODS = "GET, HEAD, OPTIONS, POST";

function isAllowedOrigin(origin, isStagingAsset) {
  if (!origin) return false;
  const allowedExact = isStagingAsset
    ? ALLOW_ORIGINS_STAGING.has(origin)
    : ALLOW_ORIGINS_PROD.has(origin);
  if (allowedExact) return true;

  if (isStagingAsset) return false;

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOW_ORIGIN_SUFFIXES_PROD.some((suffix) =>
      hostname.endsWith(suffix),
    );
  } catch {
    return false;
  }
}

function applyCors(headers, origin) {
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  // Only set this if you actually need cookies/Authorization *and* you understand the risk:
  // headers.set("Access-Control-Allow-Credentials", "true");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Never intercept Cloudflare internal paths if this worker is routed broadly.
    if (url.pathname.startsWith("/cdn-cgi/")) {
      return fetch(request);
    }

    const origin = request.headers.get("Origin");
    const key = url.pathname.replace(/^\/+/, "");
    const isStagingAsset = key.startsWith("_staging/");
    const allowed = isAllowedOrigin(origin, isStagingAsset);

    // Handle preflight
    if (request.method === "OPTIONS") {
      // If it’s not a CORS preflight, return a plain 204
      if (!origin) return new Response(null, { status: 204 });

      if (!allowed) {
        // Explicitly deny: this avoids confusing “silent” CORS failures
        return new Response("CORS origin denied", { status: 403 });
      }

      const reqHeaders = request.headers.get("Access-Control-Request-Headers");
      const headers = new Headers();
      applyCors(headers, origin);
      headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
      if (reqHeaders) {
        headers.set("Access-Control-Allow-Headers", reqHeaders);
      }
      headers.set("Access-Control-Max-Age", "86400");

      return new Response(null, { status: 204, headers });
    }

    // Only serve assets for safe methods
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const object = await env.ASSETS.get(key);

    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers(object.httpMetadata ?? {});
    if (object.size) headers.set("Content-Length", String(object.size));
    if (object.etag) headers.set("ETag", object.etag);

    // Long cache for immutable assets
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    if (allowed) applyCors(headers, origin);

    // Optional: expose some headers to the browser if you need them
    // headers.set("Access-Control-Expose-Headers", "ETag, Content-Length");

    return new Response(object.body, { status: 200, headers });
  },
};
