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

// These "full page render" tests can be slow in CI due to:
// - remote font/image fetches
// - fullPage screenshots on long pages
test.describe.configure({ timeout: 120_000 });

test.use({
  disableAutoSnapshot: true,
  cropToViewport: false,
  assetDomains: ['cdn.lafleche.dev'],
  deviceScaleFactor: 2,
  navigationTimeout: 60_000,
  actionTimeout: 60_000,
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
      'html, body, * { scrollbar-gutter: auto !important; }',
      // Hide scrollbars while preserving scroll behavior.
      '* { -ms-overflow-style: none !important; scrollbar-width: none !important; }',
      '::-webkit-scrollbar, *::-webkit-scrollbar { width: 0 !important; height: 0 !important; }',
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

const hideSkipNavFocusForSnapshots = async (page: Page) => {
  // Playwright/Chromium can land focus on the first focusable element after
  // navigation, which makes the skip-nav link slide into view and pollute
  // visual snapshots.
  await page.addStyleTag({
    content: [
      'a[href="#main"]:focus, a[href="#main"]:focus-visible {',
      '  transform: translate(-50%, -200%) !important;',
      '  outline: none !important;',
      '}',
    ].join('\n'),
  });

  await page.evaluate(() => {
    const el = document.activeElement;
    if (el instanceof HTMLElement) el.blur();
  });
};

const ensurePageCurlLoadedForSnapshots = async (page: Page) => {
  // The PageCurl mock image is below the fold and lazily loaded; Playwright's
  // fullPage screenshot scrolls the page while capturing, which can race with
  // lazy asset fetches. Force-load + wait for the actual <img> element(s)
  // without changing scroll position.
  const timeoutMs = 15_000;

  try {
    await page.evaluate(async (timeout) => {
      const startedAt = Date.now();

      const getTargets = () => {
        const imgs = Array.from(document.images);
        return imgs.filter((img) => {
          const src = img.currentSrc || img.src || '';
          return src.includes('mock-end-html');
        });
      };

      const targets = getTargets().filter((img) =>
        // Guard against unrelated images that might coincidentally match.
        img.src.includes('mock-end-html'),
      );

      // Some routes don't render the PageCurl at all.
      if (!targets.length) return;

      for (const img of targets) {
        // Force a stable, non-srcset load path (prefer the explicit src), and
        // remove <source> siblings so the browser doesn't pick a variant that
        // isn't present in a given environment.
        const picture = img.closest('picture');
        if (picture) {
          picture
            .querySelectorAll('source')
            .forEach((node) => node.remove());
        }
        img.removeAttribute('srcset');

        try {
          img.loading = 'eager';
        } catch {}
        try {
          // Not universally supported, but harmless where it is.
          (img as any).fetchPriority = 'high';
        } catch {}

        // Kick the request if the browser deferred it.
        const src = img.src;
        if (src) img.src = src;
      }

      const preload = async (src: string, remainingMs: number) => {
        if (!src) return;
        await Promise.race([
          new Promise<void>((resolve) => {
            const loader = new Image();
            loader.onload = () => resolve();
            loader.onerror = () => resolve();
            loader.src = src;
          }),
          new Promise<void>((resolve) =>
            setTimeout(resolve, Math.max(0, remainingMs)),
          ),
        ]);
      };

      const decode = async (img: HTMLImageElement, remainingMs: number) => {
        if (typeof img.decode !== 'function') return;
        await Promise.race([
          img.decode().catch(() => undefined),
          new Promise<void>((resolve) =>
            setTimeout(resolve, Math.max(0, remainingMs)),
          ),
        ]);
      };

      const allLoaded = () => {
        const live = getTargets();
        return live.every((img) => img.complete && img.naturalWidth > 0);
      };

      // Actively preload+decode each target so the browser cache is warm before
      // Playwright starts scrolling for the fullPage screenshot.
      for (const img of targets) {
        const elapsed = Date.now() - startedAt;
        const remaining = timeout - elapsed;
        if (remaining <= 0) break;
        const src = img.src;
        await preload(src, remaining);
        await decode(img, remaining);
      }

      while (!allLoaded() && Date.now() - startedAt < timeout) {
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
      }
    }, timeoutMs);
  } catch {
    // Best-effort: if it still races, we still attempt the render.
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

        await hideSkipNavFocusForSnapshots(page);
        await ensurePageCurlLoadedForSnapshots(page);

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
