/**
 * Milestone 8 smoke: seed vendor → reviews → earnings.
 * Requires web app + local Supabase with P6 RPCs + m8 fixtures.
 *
 *   node ./scripts/smoke-m8.mjs [outDir]
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SMOKE_BASE || 'http://localhost:8091';
const out = process.argv[2] || 'docs/milestone-8/screenshots';
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
await page.getByRole('textbox', { name: 'Email' }).fill(email);
await page.getByLabel('Password', { exact: true }).fill(password);
await page.getByRole('button', { name: 'Sign In', exact: true }).click();
await page.waitForURL(/\/(home|choose-business)/, { timeout: 90_000 });
if (page.url().includes('choose-business')) {
  await wait(800);
  const lumen = page.getByRole('button').filter({ hasText: /Lumen|Lace|Studio/i }).first();
  if (await lumen.count()) await lumen.click();
  else await page.getByRole('button').nth(0).click();
  await page.waitForURL('**/home', { timeout: 60_000 });
}
await wait(2000);
await snap('01-dashboard');

await page.getByRole('button', { name: /Rating|reviews/i }).first().click();
await page.waitForURL('**/profile/reviews**', { timeout: 30_000 });
await wait(2000);
await snap('02-reviews');
const reviewsText = await page.evaluate(() => document.body.innerText);
console.log('has published review', /published review|Tsehay|5\.0|5/i.test(reviewsText));

await page.getByRole('tab', { name: /Pending/i }).click();
await wait(1200);
await snap('03-reviews-pending');
console.log('has pending', /pending/i.test(await page.evaluate(() => document.body.innerText)));

await page.getByRole('tab', { name: /Home/i }).click();
await page.waitForURL('**/home**', { timeout: 30_000 });
await wait(1000);
await page.getByRole('button', { name: /Confirmed bookings this month/i }).click();
await page.waitForURL('**/profile/earnings**', { timeout: 30_000 });
await wait(2000);
await snap('04-earnings');
const earningsText = await page.evaluate(() => document.body.innerText);
console.log(
  'has earnings metrics',
  /Pipeline value|Confirmed booking value|Agreed deposits|not payments received/i.test(earningsText),
);

console.log('console errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
