// Generates public/catalog.json from the fluxproto-light binary's authoritative
// `flow list` / `suite list` output, so the Flow & suite catalog page can never
// drift from what actually ships.
//
// This runs LOCALLY (the Go binary + templates repo are not present on the
// deploy host). If either is missing it prints a warning and leaves the
// committed catalog.json untouched — so `npm run build` stays green on CI/Vercel.
// Regenerate on each templates release with:  npm run build:catalog
//
// Override locations with env vars:
//   FPL_BIN=/path/to/fluxproto-light  FPL_TEMPLATES=/path/to/templates  npm run build:catalog

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve, relative, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO_URL = 'https://github.com/dflux-io/fluxproto-light-templates';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BIN = process.env.FPL_BIN || resolve(root, '../fluxproto-light/bin/fluxproto-light');
const TMPL = process.env.FPL_TEMPLATES || resolve(root, '../fluxproto-light-templates');
const OUT = resolve(root, 'public/catalog.json');           // full list — fetched by the catalog page
const SUMMARY = resolve(root, 'src/generated/catalogSummary.ts'); // tiny totals — bundled into home/header

function warnSkip(reason) {
  console.warn(`[build-catalog] ${reason} — keeping existing public/catalog.json + summary`);
  process.exit(0);
}

if (!existsSync(BIN)) warnSkip(`binary not found at ${BIN}`);
if (!existsSync(TMPL)) warnSkip(`templates dir not found at ${TMPL}`);

// Parse the binary's padded-column table. Every column except the trailing
// DESCRIPTION is a single space-free token (flow/suite names are identifiers),
// so token-position parsing is robust even when a long name overflows its
// padded column width. The header row names the columns; the last header
// (description) absorbs all remaining tokens.
function parseTable(text) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const sepIdx = lines.findIndex((l) => /^[\s-]+$/.test(l) && l.includes('--'));
  if (sepIdx < 1) return { headers: [], rows: [] };
  const headers = lines[sepIdx - 1].trim().split(/\s+/).map((h) => h.toLowerCase());
  const lead = headers.length - 1; // single-token columns before description
  const rows = lines.slice(sepIdx + 1).map((line) => {
    const toks = line.trim().split(/\s+/);
    const o = {};
    for (let i = 0; i < lead; i++) o[headers[i]] = toks[i] ?? '';
    o[headers[headers.length - 1]] = toks.slice(lead).join(' ');
    return o;
  });
  return { headers, rows };
}

// Use a throwaway DB in the temp dir so loading templates never drops an
// fpl.db into the docs repo.
const SCRATCH_DB = join(tmpdir(), 'fpl-catalog-scratch.db');

function run(args) {
  return execFileSync(BIN, [...args, '-db', SCRATCH_DB], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

// Walk the templates repo and map each flow/suite `name:` to its YAML path,
// so the catalog can deep-link to the (public) source on GitHub.
function buildPathMap(dir) {
  const map = {};
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) {
        if (entry === '.git' || entry === 'node_modules') continue;
        walk(full);
      } else if (/\.ya?ml$/.test(entry)) {
        const m = readFileSync(full, 'utf8').match(/^name:\s*(\S+)\s*$/m);
        if (m) map[m[1]] = relative(TMPL, full);
      }
    }
  };
  walk(dir);
  return map;
}

const pathMap = buildPathMap(TMPL);
const pathFor = (name) => pathMap[name] || '';

const flowsRaw = parseTable(run(['flow', 'list', '-templates', TMPL])).rows;
const suitesRaw = parseTable(run(['suite', 'list', '-templates', TMPL])).rows;

const flows = flowsRaw
  .filter((r) => r.name && r.name !== '----')
  .map((r) => ({
    name: r.name,
    source: r.source || '',
    type: r.type || '',
    protocol: r.protocol || '',
    nf: r.nf || '',
    category: r.category || '',
    description: r.description === '(no description)' ? '' : r.description || '',
    path: pathFor(r.name),
  }));

const suites = suitesRaw
  .filter((r) => r.name && r.name !== '----')
  .map((r) => ({
    name: r.name,
    source: r.source || '',
    steps: Number.parseInt(r.steps, 10) || 0,
    description: r.description || '',
    path: pathFor(r.name),
  }));

const tally = (arr, key) => {
  const m = {};
  for (const x of arr) {
    const k = x[key] || 'other';
    m[k] = (m[k] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]));
};

const catalog = {
  generatedAt: new Date().toISOString().slice(0, 10),
  repoUrl: REPO_URL,
  totals: { flows: flows.length, suites: suites.length },
  byProtocol: tally(flows, 'protocol'),
  byNf: tally(flows, 'nf'),
  byCategory: tally(flows, 'category'),
  flows,
  suites,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(catalog, null, 2) + '\n');

// Tiny typed summary (no per-flow list) — safe to bundle into the home page.
const summary = {
  generatedAt: catalog.generatedAt,
  totals: catalog.totals,
  byProtocol: catalog.byProtocol,
  byNf: catalog.byNf,
  byCategory: catalog.byCategory,
};
mkdirSync(dirname(SUMMARY), { recursive: true });
writeFileSync(
  SUMMARY,
  '// AUTO-GENERATED by scripts/build-catalog.mjs — do not edit by hand.\n' +
    '// Regenerate with `npm run build:catalog`.\n' +
    'export interface CatalogSummary {\n' +
    '  generatedAt: string;\n' +
    '  totals: { flows: number; suites: number };\n' +
    '  byProtocol: Record<string, number>;\n' +
    '  byNf: Record<string, number>;\n' +
    '  byCategory: Record<string, number>;\n' +
    '}\n\n' +
    `export const catalogSummary: CatalogSummary = ${JSON.stringify(summary, null, 2)};\n`,
);

console.log(
  `[build-catalog] wrote ${flows.length} flows + ${suites.length} suites to public/catalog.json ` +
    `+ src/generated/catalogSummary.ts (protocols: ${Object.keys(catalog.byProtocol).join(', ')})`,
);
