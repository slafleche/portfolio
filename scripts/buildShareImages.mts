import fs from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const SHARE_IMAGE_SIZES = [
  { width: 1200, height: 630 },
  { width: 1200, height: 675 },
  { width: 1200, height: 1200 },
] as const;

const OUTPUT_DIR = path.resolve('public', 'share');
const TARGET_URL =
  process.env.SHARE_IMAGE_URL ??
  'http://localhost:3000/en/debug/shareImage';
const VIEWPORT_SELECTOR = '[data-target="share-image-viewport"]';

const expectedSizes = new Set(
  SHARE_IMAGE_SIZES.map(
    (size) => `${size.width}x${size.height}`,
  ),
);

const main = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: {
      width: 1600,
      height: 1200,
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
    if (fonts) {
      await fonts.ready;
    }
  });

  await page.addStyleTag({
    content: `
      * {
        animation: none !important;
        transition: none !important;
      }
    `,
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
      `No viewports found for selector "${VIEWPORT_SELECTOR}".`,
    );
  }

  for (let index = 0; index < count; index += 1) {
    const viewport = viewports.nth(index);
    const locale = await viewport.getAttribute('data-locale');
    const size = await viewport.getAttribute('data-size');

    if (!locale) {
      await browser.close();
      throw new Error(
        `Viewport at index ${index} is missing data-locale.`,
      );
    }

    if (!size) {
      await browser.close();
      throw new Error(
        `Viewport at index ${index} is missing data-size.`,
      );
    }

    if (!expectedSizes.has(size)) {
      console.warn(
        `[build:share-images] Unexpected size "${size}" from ${TARGET_URL}.`,
      );
    }

    const outputName = `${locale}-share-image-${size}.gen.png`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await viewport.scrollIntoViewIfNeeded();
    await viewport.screenshot({ path: outputPath });
    console.log(`Wrote ${outputPath}`);
  }

  await browser.close();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
