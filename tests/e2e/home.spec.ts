import { expect,test } from '@playwright/test';

test.describe('home page', () => {
  test('menu, anchors, home link, and CTAs are usable', async ({
    page,
  }) => {
    await page.goto('/en');

    await expect(
      page
        .locator('section#hero')
        .getByRole('heading', { level: 1 }),
    ).toBeVisible();

    const homeLink = page.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/en');

    const approachLink = page.getByRole('link', {
      name: /approach/i,
    });
    await expect(approachLink).toBeVisible();
    await approachLink.click();
    await expect(page).toHaveURL(/#approach/);
    await expect(page.locator('#approach')).toBeVisible();

    const heroCta = page
      .locator('section#hero')
      .getByRole('button', { name: /connect/i });
    await expect(heroCta).toBeVisible();
    await heroCta.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('button', { name: /close/i })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.locator('#contact').scrollIntoViewIfNeeded();
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
      .getByRole('button', { name: /connect|contact/i });
    await expect(stickyCta).toHaveAttribute('data-phase', 'shown');
    await expect(stickyCta).toBeVisible();
    await stickyCta.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('button', { name: /close/i })
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();

    const systemsLink = page.getByRole('link', {
      name: /open systems page/i,
    });
    await expect(systemsLink).toBeVisible();
    await systemsLink.click();
    await expect(page).toHaveURL(/\/en\/systems/);
  });
});
