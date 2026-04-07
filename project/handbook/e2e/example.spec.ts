import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Handbook/)
})

test('has platform info', async ({ page }) => {
  await page.goto('/')
  const platformInfo = page.getByRole('contentinfo')

  await expect(platformInfo).toBeVisible()
  await expect(platformInfo).toHaveText(/Cordova platform: browser@\d+\.\d+\.\d+ device is online/)
})
