#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const TARGET_URL =
  process.env.HERO_HEADING_URL ??
  'http://localhost:3000/en/debug/heroHeadingSvg';
const OUTPUT_DIR = '/tmp/heroTextSvg';
const VIEWPORT_SELECTOR = '[data-target="viewport"]';
const EXPORT_ATTR = 'data-export-target';
const EXPORT_STYLE_ID = 'hero-heading-export-style';
const SHADOW_CONFIG = {
  attrName: 'data-shadow',
  metaSuffix: '.shadow.json',
};

const parseShadowPayload = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    console.warn(`Invalid shadow payload: ${raw}`);
  }
  return null;
};

const persistShadowMetadata = async (
  svgDir,
  baseName,
  metadata,
) => {
  const metaPath = path.join(
    svgDir,
    `${baseName}${SHADOW_CONFIG.metaSuffix}`,
  );
  if (!metadata?.shadow) {
    await fs.rm(metaPath, { force: true });
    return;
  }
  await fs.writeFile(
    metaPath,
    JSON.stringify(metadata, null, 2),
    'utf8',
  );
};

try {
  execSync('inkscape --version', { stdio: 'ignore' });
  console.log('Inkscape CLI available');
} catch {
  console.error('Inkscape CLI not found in PATH.');
  console.error(
    'Install it with "brew install inkscape" or from https://inkscape.org/release/.',
  );
  process.exit(1);
}

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: {
    width: 1600,
    height: 900,
  },
});

const response = await page.goto(TARGET_URL, {
  waitUntil: 'networkidle',
});
if (!response || !response.ok()) {
  await browser.close();
  throw new Error(
    `Failed to load ${TARGET_URL} (status: ${response?.status() ?? 'unknown'}).`,
  );
}
await page.evaluate(async () => {
  const doc = globalThis.document;
  if (!doc) return;
  const fonts = doc.fonts;
  if (fonts?.ready) {
    await fonts.ready;
  }
});

await page.waitForSelector(VIEWPORT_SELECTOR, {
  state: 'attached',
  timeout: 10_000,
});

const viewports = page.locator(VIEWPORT_SELECTOR);
const count = await viewports.count();

if (count === 0) {
  await browser.close();
  throw new Error(
    `No viewports found for selector "${VIEWPORT_SELECTOR}" on ${TARGET_URL}.`,
  );
}

const exportStyles = `
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
  }
  body * {
    visibility: hidden !important;
  }
  [${EXPORT_ATTR}],
  [${EXPORT_ATTR}] * {
    visibility: visible !important;
  }
  [${EXPORT_ATTR}] {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
  }
`;

for (let index = 0; index < count; index += 1) {
  const viewport = viewports.nth(index);
  const locale = await viewport.getAttribute('data-locale');
  const pageName = await viewport.getAttribute('data-page');
  const name =
    (await viewport.getAttribute('data-name')) ?? 'heroHeading';
  const heading = viewport.locator('[data-target="hero-heading"]');
  const shadowPayload = parseShadowPayload(
    await heading.getAttribute(SHADOW_CONFIG.attrName),
  );

  if (!locale) {
    await browser.close();
    throw new Error(
      `Viewport at index ${index} is missing data-locale.`,
    );
  }

  if (!pageName) {
    await browser.close();
    throw new Error(
      `Viewport at index ${index} is missing data-page.`,
    );
  }

  await page.evaluate(
    ({ exportAttr, styleId }) => {
      const doc = globalThis.document;
      if (!doc) return;
      doc
        .querySelectorAll(`[${exportAttr}]`)
        .forEach((node) => node.removeAttribute(exportAttr));
      const style = doc.getElementById(styleId);
      if (style) style.remove();
    },
    {
      exportAttr: EXPORT_ATTR,
      styleId: EXPORT_STYLE_ID,
    },
  );

  await viewport.evaluate(
    (node, exportAttr) => node.setAttribute(exportAttr, 'true'),
    EXPORT_ATTR,
  );

  const styleHandle = await page.addStyleTag({
    content: exportStyles,
  });
  await styleHandle.evaluate((node, styleId) => {
    node.id = styleId;
  }, EXPORT_STYLE_ID);

  const pdfDir = path.join(OUTPUT_DIR, pageName, 'pdfs');
  const svgDir = path.join(OUTPUT_DIR, pageName, 'svgs');
  await fs.mkdir(pdfDir, { recursive: true });
  await fs.mkdir(svgDir, { recursive: true });
  const pdfPath = path.join(pdfDir, `${locale}-${name}.pdf`);
  const svgPath = path.join(svgDir, `${locale}-${name}.svg`);
  let exportedSvgPath = svgPath;

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
  });

  try {
    execSync(
      `inkscape "${pdfPath}" --pages=1 --pdf-poppler --export-plain-svg --export-area-drawing --export-type=svg --export-filename="${svgPath}" --export-text-to-path`,
      { stdio: 'inherit' },
    );
  } catch {
    const fallbackSvgPath = path.join(
      svgDir,
      `${locale}-${name}-live.svg`,
    );
    exportedSvgPath = fallbackSvgPath;
    execSync(
      `inkscape "${pdfPath}" --pages=1 --pdf-poppler --export-plain-svg --export-area-drawing --export-type=svg --export-filename="${fallbackSvgPath}"`,
      { stdio: 'inherit' },
    );
    console.warn(
      `Outlined export failed; wrote live-text SVG to ${fallbackSvgPath}`,
    );
  }

  await fs.access(pdfPath);
  console.log(`Wrote ${pdfPath}`);

  try {
    await fs.access(exportedSvgPath);
    await persistShadowMetadata(svgDir, `${locale}-${name}`, {
      locale,
      page: pageName,
      name,
      shadow: shadowPayload,
    });
    console.log(`Wrote ${exportedSvgPath}`);
  } catch {
    const fallbackSvgPath = path.join(
      svgDir,
      `${locale}-${name}-live.svg`,
    );
    await fs.access(fallbackSvgPath);
    await persistShadowMetadata(svgDir, `${locale}-${name}`, {
      locale,
      page: pageName,
      name,
      shadow: shadowPayload,
    });
    console.log(`Wrote ${fallbackSvgPath}`);
  }
}

await browser.close();
