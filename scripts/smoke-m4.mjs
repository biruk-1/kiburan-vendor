/**
 * Milestone 4 smoke: register → create business → submit for review.
 * Requires the web app on :8091 and local Supabase with the M4 migration applied.
 *
 *   node ./scripts/smoke-m4.mjs [outDir]
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:8091';
const out = process.argv[2] || 'docs/milestone-4/screenshots';
mkdirSync(out, { recursive: true });
const email = `m4.vendor.${Date.now()}@kiburan.local`;
const password = 'VendorTestPass1';

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

await page.goto(`${BASE}/welcome`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForSelector('text=Get Started', { timeout: 180_000 });
console.log('start text', JSON.stringify((await page.evaluate(() => document.body.innerText)).slice(0, 400)));
await snap('01-welcome');
await page.getByRole('button', { name: 'Get Started' }).click();
await wait(2000);
await page.getByLabel('Full name').fill('M4 Test Vendor');
await page.getByLabel('Email').fill(email);
await page.getByLabel('Password', { exact: true }).fill(password);
await page.getByLabel('Confirm password').fill(password);
await page.getByRole('button', { name: 'Create Account' }).click();
await page.getByLabel('Business name').waitFor({ timeout: 60_000 });
console.log('after register', page.url(), email);
await snap('02-create-business');

await page.getByLabel('Business name').fill('M4 Smoke Studio');
await page.getByRole('checkbox', { name: 'Photographer' }).click();
await page.getByLabel('City').fill('Addis Ababa');
await page.getByLabel('Description').fill('Portrait and wedding photography for couples across Addis Ababa.');
await page.getByLabel('Phone').fill('+251911222333');
await snap('02b-create-business-filled');
await page.getByRole('button', { name: 'Submit for review' }).click();
await page.waitForURL('**/home', { timeout: 60_000 });
await wait(2500);
console.log('after submit', page.url());
await snap('03-dashboard-pending');
const text = await page.evaluate(() => document.body.innerText);
console.log('has under review', /Under review/i.test(text));
console.log('console errors', errors.length ? errors.join('\n') : 'none');
await browser.close();
