import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { isDev } from '@/lib/runtimeEnv';

type SimpleHtmlRoute = '' | 'architecture' | 'systems' | '404';

type ReadSimpleHtmlOptions = {
  locale: string;
  route: SimpleHtmlRoute;
};

export async function readSimpleHtml({
  locale,
  route,
}: ReadSimpleHtmlOptions): Promise<string> {
  const safeLocale = String(locale).replace(/[^a-z]/gi, '');
  const safeRoute = String(route).replace(/[^a-z0-9]/gi, '');

  const base = path.join(process.cwd(), 'simpleHtml');
  const targetPath =
    safeRoute === ''
      ? path.join(base, safeLocale, 'index.html')
      : path.join(base, safeLocale, safeRoute, 'index.html');

  try {
    return await readFile(targetPath, 'utf8');
  } catch (error) {
    if (
      isDev() &&
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: unknown }).code === 'ENOENT'
    ) {
      return '';
    }
    throw error;
  }
}
