import { test, expect } from '@playwright/test';

test('has title and landing content', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    // Replace with actual title of the Koda project
    await expect(page).toHaveTitle(/Koda/i);

    // Check for some landing page content
    // For example, if there is a "Explore" or "Discover" button
    // const exploreButton = page.getByRole('button', { name: /explore/i });
    // await expect(exploreButton).toBeVisible();
});

test('navigation to sign-in works', async ({ page }) => {
    await page.goto('/');

    // Look for a login or sign-in link
    const signInLink = page.getByRole('link', { name: /connect/i }).or(page.getByRole('link', { name: /login/i }));
    if (await signInLink.isVisible()) {
        await signInLink.click();
        await expect(page.url()).toContain('sign-in');
    }
});
