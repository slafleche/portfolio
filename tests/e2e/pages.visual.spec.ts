import fs from 'node:fs/promises';
import nodePath from 'node:path';

import {
  expect,
  takeSnapshot,
  test,
} from '@chromatic-com/playwright';
import type { Page } from '@playwright/test';

import {
  defaultViewports,
  LOCALES,
} from '../../src/dev/storybookConfig';

const VIEWPORT_HEIGHT = 900;
const WIDTHS = defaultViewports;

type Locale = (typeof LOCALES)[number];

test.use({
  disableAutoSnapshot: true,
  cropToViewport: false,
  assetDomains: ['cdn.lafleche.dev'],
  deviceScaleFactor: 2,
});

type Variant = {
  name: 'home' | 'systems';
  path: (locale: Locale) => string;
  heroSelector: string;
};

const VARIANTS: Variant[] = [
  {
    name: 'home',
    path: (locale) => `/${locale}`,
    heroSelector: 'section#hero',
  },
  {
    name: 'systems',
    path: (locale) => `/${locale}/systems`,
    heroSelector: 'section#systems-hero',
  },
];

const waitForFonts = async (page: Page) => {
  const timeoutMs = 15_000;

  try {
    await page.waitForFunction(() => {
      if (typeof document === 'undefined') return true;
      const fonts = (document as any).fonts;
      return typeof fonts === 'undefined' || fonts.status === 'loaded';
    }, { timeout: timeoutMs });
    return;
  } catch {
    // Some environments can keep `document.fonts.status` at "loading" forever
    // even though the page has rendered and visual snapshots are stable.
    // Prefer a bounded best-effort wait over failing the entire suite.
  }

  await page.evaluate(async (ms) => {
    const fonts = (document as any).fonts;
    if (!fonts?.ready) return;

    await Promise.race([
      fonts.ready.catch(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, ms)),
    ]);
  }, timeoutMs);
};

const hideNextDevOverlays = async (page: Page) => {
  await page.addStyleTag({
    content: [
      'nextjs-portal { display: none !important; }',
      '#__next-build-watcher { display: none !important; }',
      '#__next-dev-overlay { display: none !important; }',
    ].join('\n'),
  });

  await page.evaluate(() => {
    document.querySelector('nextjs-portal')?.remove();
    document.querySelector('#__next-build-watcher')?.remove();
    document.querySelector('#__next-dev-overlay')?.remove();
  });
};

const disableScrollbarGutterForSnapshots = async (page: Page) => {
  await page.addStyleTag({
    content: [
      // Prevent reserved scrollbar space from showing as a right-side "bar"
      // in Linux/Chromium snapshot renders.
      'html { scrollbar-gutter: auto !important; }',
      // Hide scrollbars while preserving scroll behavior.
      'html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }',
      '::-webkit-scrollbar { width: 0 !important; height: 0 !important; }',
    ].join('\n'),
  });
};

const waitForMenuPositioning = async (page: Page) => {
  await page.waitForFunction(() => {
    const localeLink = document.querySelector('a[hreflang]');
    if (!localeLink) return false;

    const localeItem = localeLink.closest('li');
    if (!localeItem) return false;

    const itemStyle = window.getComputedStyle(localeItem);
    if (itemStyle.position !== 'absolute') return false;

    const linkStyle = window.getComputedStyle(localeLink);
    if (linkStyle.borderTopLeftRadius === '0px') return false;

    const rect = localeItem.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
};

const waitForLazyImages = async (page: Page) => {
  const timeoutMs = 15_000;

  try {
    await page.waitForFunction(() => {
      const imgs = Array.from(document.images).filter((img) => {
        const src = img.currentSrc || img.src || '';
        return src.includes('mock-end-html');
      });

      // Some routes (e.g. systems) don't render the PageCurl at all.
      if (imgs.length === 0) return true;

      return imgs.every(
        (img) => img.complete && img.naturalWidth > 0,
      );
    }, { timeout: timeoutMs });
  } catch {
    // Best-effort: missing assets shouldn't block the whole render suite,
    // but we still try to wait when they exist to avoid blank lazy renders.
  }
};

for (const locale of LOCALES) {
  for (const width of WIDTHS) {
    for (const variant of VARIANTS) {
      test(`${variant.name} (${locale}) @${width}px`, async ({
        page,
      }, testInfo) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.setViewportSize({
          width,
          height: VIEWPORT_HEIGHT,
        });

        const routePath = variant.path(locale);

        await page.goto(routePath, { waitUntil: 'domcontentloaded' });
        await waitForFonts(page);
        await hideNextDevOverlays(page);
        await disableScrollbarGutterForSnapshots(page);
        await waitForMenuPositioning(page);

        await expect(
          page.locator(variant.heroSelector),
        ).toBeVisible();
        await expect(page.locator('#contact')).toHaveCount(1, {
          timeout: 30_000,
        });

        await page.locator('#contact').scrollIntoViewIfNeeded();
        await waitForLazyImages(page);

        const rendersDir = nodePath.join(
          process.cwd(),
          'public/pages-renders',
        );
        await fs.mkdir(rendersDir, { recursive: true });
        const renderPath = nodePath.join(
          rendersDir,
          `${locale}-${variant.name}-${width}.png`,
        );

        await page.screenshot({
          fullPage: true,
          animations: 'disabled',
          path: renderPath,
        });

        await takeSnapshot(
          page,
          `${variant.name}-${locale}-${width}`,
          testInfo,
        );
      });
    }
  }
}
