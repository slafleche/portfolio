import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

const OUTPUT_DIR = path.join(REPO_ROOT, 'tmp', 'blog-images');
const TARGET_URL =
  process.env.BLOG_IMAGE_URL ??
  'http://localhost:3000/en/debug/blogImages';
const VIEWPORT_SELECTOR = '[data-target="blog-image-viewport"]';

// Optional id filter(s) passed as CLI args, e.g.
//   yarn build:blog-images lafleche-dev-design-walkthrough
// When provided, only matching images are (re)rendered and the output
// directory is NOT wiped, so other images stay untouched.
const ID_FILTER = new Set(process.argv.slice(2).filter(Boolean));

const main = async () => {
  if (ID_FILTER.size === 0) {
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  }
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

      /* Hide Next.js devtools/overlay UI (the "pill") when capturing screenshots. */
      nextjs-portal,
      #__next-devtools,
      #__next-build-watcher,
      [data-nextjs-devtools],
      [data-nextjs-toast] {
        display: none !important;
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

  let wrote = 0;
  for (let index = 0; index < count; index += 1) {
    const viewport = viewports.nth(index);
    const id = await viewport.getAttribute('data-id');
    const size = await viewport.getAttribute('data-size');

    if (!id) {
      await browser.close();
      throw new Error(
        `Viewport at index ${index} is missing data-id.`,
      );
    }

    if (!size) {
      await browser.close();
      throw new Error(
        `Viewport at index ${index} is missing data-size.`,
      );
    }

    if (ID_FILTER.size > 0 && !ID_FILTER.has(id)) {
      continue;
    }

    const outputName = `${id}-${size}.gen.png`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await viewport.scrollIntoViewIfNeeded();
    await viewport.screenshot({ path: outputPath });
    console.log(`Wrote ${outputPath}`);
    wrote += 1;
  }

  await browser.close();

  if (ID_FILTER.size > 0 && wrote === 0) {
    throw new Error(
      `No viewports matched id filter: ${[...ID_FILTER].join(', ')}.`,
    );
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
