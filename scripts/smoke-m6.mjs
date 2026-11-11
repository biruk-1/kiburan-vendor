/**
 * Milestone 6 smoke: seed vendor → services → packages → availability.
 * Requires the web app (SMOKE_BASE or :8091) and local Supabase with P9 applied.
 *
 *   node ./scripts/smoke-m6.mjs [outDir]
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SMOKE_BASE || 'http://localhost:8091';
const out = process.argv[2] || 'docs/milestone-6/screenshots';
mkdirSync(out, { recursive: true });

const email = 'marketplace.seed@kiburan.local';
const password = 'SeedVendorPass1';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await (
  await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
).newPage();
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 180));
});
const wait = (ms = 2000) => page.waitForTimeout(ms);
const snap = async (name) => {
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('snap', name, page.url());
};

await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForSelector('text=Sign In', { timeout: 180_000 });
await page.getByRole('textbox', { name: 'Email' }).fill(email);
await page.getByLabel('Password', { exact: true }).fill(password);
await page.getByRole('button', { name: 'Sign In', exact: true }).click();
await page.waitForURL(/\/(home|choose-business)/, { timeout: 90_000 });
if (page.url().includes('choose-business')) {
  await wait(1000);
  const seed = page.getByRole('button').filter({ hasText: /marketplace|studio|photography|seed/i }).first();
  if (await seed.count()) await seed.click();
  else await page.getByRole('button').nth(0).click();
  await page.waitForURL('**/home', { timeout: 60_000 });
}

await page.getByRole('tab', { name: /Services/i }).click();
await page.waitForURL('**/services**', { timeout: 30_000 });
await wait(2000);
await snap('01-services');

await page.getByRole('button', { name: 'Availability' }).click();
await page.waitForURL('**/services/availability', { timeout: 30_000 });
await page.getByRole('button', { name: 'Add window' }).waitFor({ timeout: 30_000 });
await wait(1000);
await snap('02-availability');

await page.getByRole('button', { name: 'Add window' }).click();
await page.getByLabel('Date').fill('2026-12-15');
await page.getByLabel('Start').fill('10:00');
await page.getByLabel('End').fill('14:00');
await page.getByRole('button', { name: /^Status:/ }).click();
await page.getByText('Unavailable', { exact: true }).last().click();
await page.getByRole('button', { name: 'Save window' }).click();
await wait(2500);
await snap('03-availability-saved');
const availText = await page.evaluate(() => document.body.innerText);
console.log('has unavailable window', /unavailable/i.test(availText));

await page.getByRole('button', { name: 'Back' }).click();
await page.waitForURL('**/services', { timeout: 30_000 });
await wait(1000);

await page.getByRole('button', { name: /More actions for/i }).first().click();
await wait(500);
await page.getByRole('button', { name: 'Packages' }).click();
await page.waitForURL('**/packages**', { timeout: 30_000 });
await wait(1500);
await snap('04-packages');

await page.getByRole('button', { name: 'Add package' }).click();
await page.waitForURL('**/packages/new', { timeout: 30_000 });
await page.getByLabel('Package name').fill('M6 Smoke Package');
await page.getByLabel('Price (ETB)').fill('18000');
await page.getByLabel('Inclusions').fill('Two shooters\nOnline gallery');
await snap('05-package-form');
await page.getByRole('button', { name: 'Save package' }).click();
await page.waitForURL(/\/packages$/, { timeout: 60_000 });
await wait(1500);
await snap('06-packages-list');
const pkgText = await page.evaluate(() => document.body.innerText);
console.log('has smoke package', /M6 Smoke Package/i.test(pkgText));

await page.getByRole('button', { name: 'Back' }).click();
await wait(800);
await page.getByRole('button', { name: 'Add service' }).click();
await page.getByLabel('Service Name').waitFor({ timeout: 30_000 });
await wait(1000);
await snap('07-add-service');
console.log('has upload photos', /Upload Photos/i.test(await page.evaluate(() => document.body.innerText)));

console.log('console errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
