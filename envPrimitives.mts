/* global process */

// Basic environment classification helpers for config and runtime.
// Shared between next.config.js and src/lib/runtimeEnv.ts. This module must be
// safe for both Node and browser bundles, so it only relies on the global
// process.env and avoids node-specific imports.

function getNodeEnv() {
  if (typeof process === 'undefined' || !process.env) {
    return 'development';
  }

  if (process.env.VERCEL && process.env.VERCEL.toString() === '1') {
    const vercelEnv = process.env.VERCEL_ENV ?? 'development';
    if (vercelEnv === 'production') {
      return 'release';
    } else if (vercelEnv === 'preview') {
      return 'staging';
    }
  }
  return 'development';
}

export function isStaging() {
  return getNodeEnv() === 'staging';
}

export function notStaging() {
  return !isStaging();
}

export function isRelease() {
  return getNodeEnv() === 'release';
}

export function notRelease() {
  return !isRelease();
}

export function isDev() {
  return notStaging() && notRelease();
}

export function notDev() {
  return !isDev();
}
