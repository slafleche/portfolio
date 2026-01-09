import { expect,test } from '@playwright/test';

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
    await expect(heroCta).toBeVisible();
    await heroCta.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('button', { name: /close/i })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.locator('#systems-expertise').scrollIntoViewIfNeeded();
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
    const heroWaypoint = page.locator('#hero-waypoint');
    await expect
      .poll(async () =>
        heroWaypoint.evaluate(
          (el) => el.getBoundingClientRect().bottom <= 0,
        ),
      )
      .toBeTruthy();
    const stickyCta = page
      .locator('header')
      .getByRole('button', { name: /contact/i });
    await expect(stickyCta).toHaveAttribute('data-phase', 'shown');
    await expect(stickyCta).toBeVisible();
    await stickyCta.click();

    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
