import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.endsWith('.md')) {
    const url = new URL(
      specifier,
      context.parentURL ?? import.meta.url,
    );
    return { url: url.href, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.md')) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    return {
      format: 'module',
      source: `export default ${JSON.stringify(source)};`,
      shortCircuit: true,
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
