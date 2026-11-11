/**
 * Milestone 5 smoke: seed vendor → dashboard summary → business profile / portfolio / settings.
 * Requires the web app on :8091 and local Supabase with M5 migrations applied.
 *
 *   node ./scripts/smoke-m5.mjs [outDir]
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SMOKE_BASE || 'http://localhost:8091';
const out = process.argv[2] || 'docs/milestone-5/screenshots';
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
await snap('01-sign-in');

await page.getByRole('textbox', { name: 'Email' }).fill(email);
await page.getByLabel('Password', { exact: true }).fill(password);
await page.getByRole('button', { name: 'Sign In', exact: true }).click();
await page.waitForURL(/\/(home|choose-business)/, { timeout: 90_000 });
if (page.url().includes('choose-business')) {
  await wait(1000);
  // Prefer the seeded marketplace business when several memberships exist.
  const seed = page.getByRole('button').filter({ hasText: /marketplace|studio|photography|seed/i }).first();
  if (await seed.count()) await seed.click();
  else await page.getByRole('button').nth(0).click();
  await page.waitForURL('**/home', { timeout: 60_000 });
}
await wait(2500);
await snap('02-dashboard');

const dashText = await page.evaluate(() => document.body.innerText);
console.log('has new inquiries', /New Inquiries/i.test(dashText));
console.log('has booking value', /Confirmed bookings this month/i.test(dashText));

await page.getByRole('tab', { name: /Profile/i }).click();
await page.waitForURL('**/profile**', { timeout: 30_000 });
await wait(1500);
await snap('03-profile');

await page.getByRole('button', { name: 'Business Profile' }).click();
await page.getByRole('textbox', { name: 'Business name' }).waitFor({ timeout: 30_000 });
await wait(1000);
await snap('04-business-profile');

await page.getByRole('button', { name: 'Back' }).click();
await page.waitForURL('**/profile', { timeout: 30_000 });
await wait(800);
await page.getByRole('button', { name: 'Portfolio' }).click();
await page.waitForURL('**/profile/media', { timeout: 30_000 });
await page.getByRole('button', { name: 'Add photo' }).waitFor({ timeout: 30_000 });
await wait(1000);
await snap('05-portfolio');

await page.getByRole('button', { name: 'Back' }).click();
await page.waitForURL('**/profile', { timeout: 30_000 });
await wait(800);
await page.getByRole('button', { name: 'Business Settings' }).click();
await page.waitForURL('**/profile/settings', { timeout: 30_000 });
await page.waitForSelector('text=Marketplace status', { timeout: 30_000 });
await wait(1000);
await snap('06-settings');

console.log('console errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
