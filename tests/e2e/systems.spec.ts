import { expect, test } from '@playwright/test';

test.describe('systems page', () => {
  test('menu, anchors, home link, and CTAs are usable', async ({
    page,
  }) => {
    await page.goto('/en/systems');

    const expertiseLink = page.getByRole('link', {
      name: /expertise/i,
    });
    await expect(expertiseLink).toBeVisible();
    await expertiseLink.click();
    await expect(page).toHaveURL(/#systems-expertise/);
    await expect(
      page.locator('#systems-expertise'),
    ).toBeVisible();

    await expect(
      page
        .locator('section#systems-hero')
        .getByRole('heading', { level: 1 }),
    ).toBeVisible();

    const homeLink = page.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/en');

    const heroCta = page
      .locator('section#systems-hero')
      .getByRole('button', { name: /contact/i });
    await heroCta.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /contact/i }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: /close/i })
      .click();

    await page.locator('#systems-expertise').scrollIntoViewIfNeeded();

    const stickyCta = page
      .locator('header')
      .getByRole('button', { name: /contact/i });
    await expect(stickyCta).toHaveAttribute('data-phase', 'shown');
    await stickyCta.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /contact/i }),
    ).toBeVisible();
  });
});
