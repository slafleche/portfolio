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
  await page.waitForFunction(() => {
    if (typeof document === 'undefined') return true;
    const fonts = (document as any).fonts;
    return typeof fonts === 'undefined' || fonts.status === 'loaded';
  });
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

for (const locale of LOCALES) {
  for (const width of WIDTHS) {
    for (const variant of VARIANTS) {
      test(`${variant.name} (${locale}) @${width}px`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({
          width,
          height: VIEWPORT_HEIGHT,
        });

        const path = variant.path(locale);

        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await waitForFonts(page);
        await hideNextDevOverlays(page);
        await waitForMenuPositioning(page);

        await expect(
          page.locator(variant.heroSelector),
        ).toBeVisible();
        await expect(page.locator('#contact')).toHaveCount(1, {
          timeout: 30_000,
        });

        await page.screenshot({
          fullPage: true,
          animations: 'disabled',
          path: testInfo.outputPath(
            `${variant.name}-${locale}-${width}.png`,
          ),
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
