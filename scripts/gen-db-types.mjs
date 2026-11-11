#!/usr/bin/env node
/**
 * Generates src/types/database.types.ts from the SHARED Kiburan Supabase project.
 * The migrations live in the client repo; this app never owns a schema of its own.
 * Override the shared project location with KIBURAN_SHARED_PROJECT_DIR.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharedDir = path.resolve(root, process.env.KIBURAN_SHARED_PROJECT_DIR ?? '../kiburan');
const launcher = path.join(sharedDir, 'scripts', 'supabase.mjs');
const outFile = path.join(root, 'src', 'types', 'database.types.ts');

if (!fs.existsSync(launcher)) {
  process.stderr.write(`Shared Supabase launcher not found at ${launcher}\n`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [launcher, 'gen', 'types', 'typescript', '--local'], {
  encoding: 'utf8',
  cwd: sharedDir,
  maxBuffer: 32 * 1024 * 1024,
});

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout || 'gen types failed\n');
  process.exit(result.status ?? 1);
}

const types = result.stdout;
if (!types.includes('export type Database')) {
  process.stderr.write('Generated output did not look like database types.\n');
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, types, 'utf8');
process.stdout.write(`Wrote ${outFile}\n`);
