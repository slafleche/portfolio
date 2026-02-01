import fg from 'fast-glob';
import { JSDOM } from 'jsdom';

import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { AVAILABLE_LOCALES } from '../src/lib/locales/translations/index';

type Args = {
  baseUrl: string;
  outDir: string;
  locales: string[];
  open: boolean;
};

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_OUT_DIR = 'simpleHtml';
const NOT_FOUND_PROBE_ROUTE = '/__simplehtml_not_found__';
const NOT_FOUND_OUT_ROUTE = '/404';

function parseArgs(argv: string[]): Args {
  const args: Args = {
    baseUrl: DEFAULT_BASE_URL,
    outDir: DEFAULT_OUT_DIR,
    locales: [...AVAILABLE_LOCALES],
    open: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i] ?? '';
    if (token === '--open' || token === '-o') {
      args.open = true;
      continue;
    }
    if (token === '--base-url') {
      args.baseUrl = String(argv[i + 1] ?? '').trim();
      i += 1;
      continue;
    }
    if (token === '--out-dir') {
      args.outDir = String(argv[i + 1] ?? '').trim();
      i += 1;
      continue;
    }
    if (token === '--locales') {
      const raw = String(argv[i + 1] ?? '');
      args.locales = raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }
  }

  if (!args.baseUrl) args.baseUrl = DEFAULT_BASE_URL;
  if (!args.outDir) args.outDir = DEFAULT_OUT_DIR;
  if (args.locales.length === 0) args.locales = [...AVAILABLE_LOCALES];

  return args;
}

function getSiteRoutesFromAppRouterPages(pageFiles: string[]): string[] {
  const routes = pageFiles
    .map((filePath) =>
      filePath
        .replace(/^app\/\[LOCALE\]\/\(site\)/, '')
        .replace(/\/page\.tsx$/, ''),
    )
    .map((route) => (route === '' ? '/' : route))
    .filter((route) => route.startsWith('/'));

  return Array.from(new Set(routes)).sort();
}

function buildPageUrl(baseUrl: string, locale: string, route: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  const localePart = String(locale).replace(/^\/+|\/+$/g, '');
  if (route === '/' || route === '') return `${base}/${localePart}`;
  return `${base}/${localePart}${route}`;
}

function outFilePath(outDir: string, locale: string, route: string): string {
  const safeOutDir = outDir.replace(/\/+$/, '');
  const localePart = String(locale).replace(/^\/+|\/+$/g, '');
  const routePart = route
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  return routePart === ''
    ? path.join(safeOutDir, localePart, 'index.html')
    : path.join(safeOutDir, localePart, routePart, 'index.html');
}

async function fetchHtml(
  url: string,
  locale: string,
  options?: { allowStatuses?: number[] },
): Promise<string> {
  const allowStatuses = options?.allowStatuses ?? [200];
  const response = await fetch(url, {
    headers: {
      'x-locale': locale,
      'x-render-mode': 'simple',
    },
  });

  if (!allowStatuses.includes(response.status)) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} (${url})\n` +
        body.slice(0, 500),
    );
  }

  return await response.text();
}

function extractSnapshotHtml(html: string): string {
  const dom = new JSDOM(html);
  const main = dom.window.document.querySelector('main');
  const body = dom.window.document.body;
  if (!main && !body) return html;

  const snapshotRoot = dom.window.document.createElement('div');
  const sourceNodes = main
    ? Array.from(main.childNodes)
    : Array.from(body.childNodes);

  for (const node of sourceNodes) {
    snapshotRoot.append(node.cloneNode(true));
  }

  // When a <main> exists, include any <footer> rendered outside of it.
  // (Many pages defer the footer, so this helps when it is present in SSR.)
  if (main) {
    const footers = dom.window.document.querySelectorAll('footer');
    for (const footer of Array.from(footers)) {
      snapshotRoot.append(footer.cloneNode(true));
    }
  }

  const scripts = snapshotRoot.querySelectorAll('script');
  for (const script of Array.from(scripts)) script.remove();

  const addSimpleRenderComments = () => {
    const markedNodes = snapshotRoot.querySelectorAll('[data-simple-render]');
    for (const node of Array.from(markedNodes)) {
      const label = node.getAttribute('data-simple-render')?.trim() ?? '';
      if (label === '') {
        node.removeAttribute('data-simple-render');
        continue;
      }
      node.insertAdjacentHTML(
        'beforebegin',
        `<!-- Simple Render for ${label} -->`,
      );
      node.removeAttribute('data-simple-render');
    }
  };
  addSimpleRenderComments();

  const addSectionComments = () => {
    const sections = snapshotRoot.querySelectorAll('section');
    for (const section of Array.from(sections)) {
      const previous = section.previousSibling;
      if (
        previous?.nodeType === dom.window.Node.COMMENT_NODE &&
        (previous as Comment).data.trim().startsWith('Section')
      ) {
        continue;
      }

      const id = section.getAttribute('id')?.trim() ?? '';
      const headingText =
        section
          .querySelector('h1,h2,h3,h4,h5,h6')
          ?.textContent?.trim() ?? '';

      const label = id
        ? `#${id}`
        : headingText
          ? headingText
          : '(no id)';

      section.parentNode?.insertBefore(
        dom.window.document.createComment(` Section ${label} `),
        section,
      );
    }
  };
  addSectionComments();

  const removeEmptyElements = () => {
    let changed = true;
    while (changed) {
      changed = false;
      const elements = snapshotRoot.querySelectorAll('*');
      for (const el of Array.from(elements)) {
        const tagName = el.tagName.toLowerCase();
        if (tagName === 'br') continue;
        if (tagName === 'img') continue;
        if (tagName === 'hr') continue;
        if (tagName === 'input') continue;
        if (tagName === 'source') continue;

        const hasElementChildren = el.children.length > 0;
        const hasText = (el.textContent ?? '').trim() !== '';
        if (hasElementChildren || hasText) continue;

        // Preserve anchors even if empty (should be rare after SVG handling).
        if (tagName === 'a') continue;

        el.remove();
        changed = true;
      }
    }
  };
  removeEmptyElements();

  const stripSvgs = () => {
    const svgs = snapshotRoot.querySelectorAll('svg');
    for (const svg of Array.from(svgs)) {
      const link = svg.closest('a');
      const svgTitle = svg.querySelector('title')?.textContent?.trim() ?? '';
      const ariaLabel =
        link?.getAttribute('aria-label')?.trim() ??
        svg.getAttribute('aria-label')?.trim() ??
        '';

      const label =
        ariaLabel ||
        (link?.textContent?.trim() ?? '') ||
        svgTitle ||
        '';

      svg.remove();

      if (link) {
        const linkText = link.textContent?.trim() ?? '';
        if (linkText === '' && label !== '') {
          link.textContent = label;
        }
      }
    }
  };
  stripSvgs();

  const isAllowedAttribute = (
    tagName: string,
    attrName: string,
  ): boolean => {
    if (attrName === 'id') return true;
    if (attrName.startsWith('aria-')) return true;

    if (tagName === 'a' && attrName === 'href') return true;
    if (tagName === 'a' && attrName === 'rel') return true;
    if (tagName === 'a' && attrName === 'target') return true;

    if (
      (tagName === 'img' ||
        tagName === 'source' ||
        tagName === 'video') &&
      attrName === 'src'
    ) {
      return true;
    }
    if (tagName === 'img' && attrName === 'alt') return true;

    if (attrName === 'title') return true;
    return false;
  };

  const stripAttributes = (node: Element) => {
    const tagName = node.tagName.toLowerCase();
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name;
      if (!isAllowedAttribute(tagName, name)) {
        node.removeAttribute(name);
      }
    }
  };

  const stripAttrsDeep = (node: Element) => {
    stripAttributes(node);
    for (const child of Array.from(node.children)) {
      stripAttrsDeep(child);
    }
  };

  const isReactStreamingMarker = (value: string) =>
    value === '$--' || value === '/$--';

  const removeMarkerComments = (node: Node) => {
    if (node.nodeType === dom.window.Node.COMMENT_NODE) {
      const comment = node as Comment;
      if (isReactStreamingMarker(comment.data.trim())) {
        comment.remove();
      }
      return;
    }
    for (const child of Array.from(node.childNodes)) {
      removeMarkerComments(child);
    }
  };
  removeMarkerComments(snapshotRoot);

  stripAttrsDeep(snapshotRoot);

  return snapshotRoot.innerHTML;
}

function validateSnapshotHtml(
  snapshotHtml: string,
  targetPath: string,
): void {
  const dom = new JSDOM(`<div id="snapshot-root">${snapshotHtml}</div>`);
  const root = dom.window.document.querySelector('#snapshot-root');
  if (!root) return;

  const forbiddenTags = [
    'script',
    'iframe',
    'object',
    'embed',
  ];
  for (const tagName of forbiddenTags) {
    if (root.querySelector(tagName)) {
      throw new Error(
        `Refusing to write unsafe snapshot (${targetPath}): contains <${tagName}>.`,
      );
    }
  }

  const isForbiddenUrl = (value: string) => {
    const trimmed = value.trim();
    if (trimmed === '') return false;
    return (
      /^javascript:/i.test(trimmed) ||
      /^data:text\/html/i.test(trimmed)
    );
  };

  for (const el of Array.from(root.querySelectorAll('*'))) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      // Block inline event handlers even in noscript; treat snapshots as code.
      if (name.startsWith('on')) {
        throw new Error(
          `Refusing to write unsafe snapshot (${targetPath}): contains event handler attribute "${attr.name}".`,
        );
      }

      if (
        (name === 'href' || name === 'src') &&
        isForbiddenUrl(value)
      ) {
        throw new Error(
          `Refusing to write unsafe snapshot (${targetPath}): contains unsafe URL in "${attr.name}".`,
        );
      }
    }
  }
}

async function formatHtml(html: string, targetPath: string): Promise<string> {
  const prettier = await import('prettier');
  const resolved =
    (await prettier.resolveConfig(targetPath, {
      editorconfig: true,
    })) ?? {};

  return prettier.format(html, {
    ...resolved,
    filepath: targetPath,
    parser: 'html',
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const pageFiles = await fg('app/[LOCALE]/\\(site\\)/**/page.tsx', {
    dot: false,
    onlyFiles: true,
  });
  const routes = getSiteRoutesFromAppRouterPages(pageFiles);
  if (routes.length === 0) {
    throw new Error('No routes found under app/[LOCALE]/(site)/**/page.tsx');
  }

  for (const locale of args.locales) {
    for (const route of routes) {
      const url = buildPageUrl(args.baseUrl, locale, route);
      const targetPath = outFilePath(args.outDir, locale, route);
      const html = await fetchHtml(url, locale);
      const snapshotHtml = extractSnapshotHtml(html);
      validateSnapshotHtml(snapshotHtml, targetPath);
      const formatted = await formatHtml(snapshotHtml, targetPath);

      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, formatted, 'utf8');

      console.info('[simpleHtml]', targetPath);
    }

    {
      const url = buildPageUrl(
        args.baseUrl,
        locale,
        NOT_FOUND_PROBE_ROUTE,
      );
      const targetPath = outFilePath(
        args.outDir,
        locale,
        NOT_FOUND_OUT_ROUTE,
      );
      const html = await fetchHtml(url, locale, {
        allowStatuses: [200, 404],
      });
      const snapshotHtml = extractSnapshotHtml(html);
      validateSnapshotHtml(snapshotHtml, targetPath);
      const formatted = await formatHtml(snapshotHtml, targetPath);

      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, formatted, 'utf8');

      console.info('[simpleHtml]', targetPath);
    }
  }

  if (args.open) {
    const outDirPath = path.resolve(process.cwd(), args.outDir);
    if (process.platform === 'darwin') {
      spawnSync('open', [outDirPath], { stdio: 'inherit' });
    } else {
      console.info('[simpleHtml] --open is only supported on macOS.');
    }
  }
}

await main();
