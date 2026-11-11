/**
 * Milestone 7 smoke: seed vendor → inquiries → quote → (bookings empty or listed).
 * Requires web app + local Supabase with P2/P3 + m7 smoke fixtures.
 *
 *   node ./scripts/smoke-m7.mjs [outDir]
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SMOKE_BASE || 'http://localhost:8091';
const out = process.argv[2] || 'docs/milestone-7/screenshots';
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

await page.getByRole('tab', { name: /Inquiries/i }).click();
await page.waitForURL('**/messages**', { timeout: 30_000 });
await wait(2000);
await snap('02-inquiries');
const listText = await page.evaluate(() => document.body.innerText);
console.log('has smoke couple', /Tsehay/i.test(listText));

await page.getByRole('button', { name: /Tsehay/i }).first().click();
await page.waitForURL('**/messages/**', { timeout: 30_000 });
await wait(1500);
await snap('03-inquiry-detail');

await page.getByRole('button', { name: 'Send quote' }).click();
await page.waitForURL('**/quote', { timeout: 30_000 });
await page.getByLabel('Amount (ETB)').fill('48000');
await page.getByLabel('Description').fill('M7 smoke full-day quote');
await page.getByLabel('Valid until').fill('2026-12-01');
await snap('04-send-quote');
await page.getByRole('button', { name: 'Send quote' }).click();
await page.waitForURL(/\/messages\/[^/]+$/, { timeout: 60_000 });
await wait(2000);
await snap('05-inquiry-quoted');
const detailText = await page.evaluate(() => document.body.innerText);
console.log('has quoted', /Quoted|48000|48,000/i.test(detailText));

await page.getByRole('tab', { name: /Bookings/i }).click();
await wait(2000);
await snap('06-bookings');

console.log('console errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
