// One-shot: walk src/pages/**/*.tsx and extract the leading <h1>...</h1>
// + first <p>...</p> off each page. The H1 is dropped entirely (DocPage
// renders the title from the manifest); the paragraph becomes the
// `lede` prop on <DocPage>.
//
// Run: node scripts/extract-lede.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_ROOT = path.resolve(__dirname, '..', 'src', 'pages');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

// Strip JSX tags + entities to a clean attribute-safe plain string.
function ledeFromInline(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\{`([^`]*)`\}/g, '$1')         // <code>{`x`}</code> → x
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

let processed = 0;
let skipped = 0;

for (const file of walk(PAGES_ROOT)) {
  let src = fs.readFileSync(file, 'utf-8');

  // Pattern: <DocPage slug="..."> followed (optionally) by whitespace, then
  //          <h1>...</h1>, then optional whitespace, then <p>...</p>.
  // We do this in two stages because lede is optional but H1 is always there.
  const docPageOpen = /<DocPage(\s+[^>]*)>\n/;
  const m = src.match(docPageOpen);
  if (!m) { skipped++; continue; }

  const startIdx = m.index + m[0].length;
  const tail = src.slice(startIdx);

  // Strip the leading H1.
  const h1Match = tail.match(/^\s*<h1>([\s\S]*?)<\/h1>\s*\n/);
  if (!h1Match) { skipped++; continue; }
  let after = tail.slice(h1Match[0].length);

  // Then optionally the first <p>...</p> as the lede.
  let lede = '';
  const pMatch = after.match(/^\s*<p>([\s\S]*?)<\/p>\s*\n/);
  if (pMatch) {
    lede = ledeFromInline(pMatch[1]);
    // Only adopt as lede if it looks like prose (not, say, a one-liner like
    // "All endpoints under...") — the converter already filters most of these.
    if (lede.length > 0) {
      after = after.slice(pMatch[0].length);
    } else {
      lede = '';
    }
  }

  // Build the new <DocPage> open tag with the lede prop.
  const oldOpen = m[0];
  const ledeProp = lede ? ` lede="${escapeAttr(lede)}"` : '';
  // m[1] captured the existing attrs (e.g. ` slug="…"`); preserve them.
  const newOpen = `<DocPage${m[1]}${ledeProp}>\n`;

  const head = src.slice(0, m.index);
  const out = head + newOpen + after;

  if (out !== src) {
    fs.writeFileSync(file, out);
    processed++;
    console.log(`✓ ${path.relative(PAGES_ROOT, file)}${lede ? '  (with lede)' : ''}`);
  } else {
    skipped++;
  }
}

console.log(`\nDone. ${processed} processed, ${skipped} skipped.`);
