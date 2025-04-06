import { test, expect } from '@playwright/test'
// npx firebase-tools emulators:start => starten van de firebase emulator
// npm i mongodb-memory-server => installeren van de mongodb memory server (eenmalig vereist)
// npx playwright test --ui => runnen van code
// npx playwright codegen => aanmaken van code

test('Check login functionality & chat functionality', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await page.getByRole('list').getByRole('img').first().click()
  await page.getByRole('link', { name: 'inloggen' }).click()
  await page.getByPlaceholder('Enter your email').click()
  await page
    .getByPlaceholder('Enter your email')
    .fill('testplaywright@testplaywright.be')
  await page.getByPlaceholder('Enter your password').click()
  await page
    .getByPlaceholder('Enter your password')
    .fill('testplaywright@testplaywright.be')
  await page.getByRole('button', { name: 'Login' }).click()
  await page.waitForTimeout(5000)
  if (
    (await page.getByText('Wrong credentials').isVisible()) ||
    (await page.getByText('auth/user-not-found').isVisible())
  ) {
    console.log('wrong credentials...')
    await page.getByRole('link', { name: 'Need to create an account?' }).click()
    await page.getByPlaceholder('Enter your username').click()
    await page.getByPlaceholder('Enter your username').fill('testplaywright')
    await page.getByPlaceholder('Enter your email').click()
    await page.getByLabel('Choose your gender').selectOption('female')
    await page
      .getByPlaceholder('Enter your email')
      .fill('testplaywright@testplaywright.be')
    await page.getByLabel('Choose your language').selectOption('nl')
    await page.getByPlaceholder('Enter your password').click()
    await page
      .getByPlaceholder('Enter your password')
      .fill('testplaywright@testplaywright.be')
    await page.getByRole('button', { name: 'Register' }).click()
  }
  await page.waitForTimeout(5000)
  await page.getByTestId('chat-toggle-button').click()
  await page
    .getByRole('button', { name: 'Start chat met touroperator' })
    .click()
  await page.getByText('Stel jouw vraag').click()
})
