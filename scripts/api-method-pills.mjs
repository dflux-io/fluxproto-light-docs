// Post-process API pages: find H2 headings that look like an HTTP
// endpoint (e.g. `<h2 id="...">POST /api/v1/auth/login</h2>`) and
// rewrite them as `<h2 id="..."><HttpMethod method="POST" /> <code>{`/api/v1/auth/login`}</code></h2>`.
//
// Adds an import for HttpMethod if any rewrite happened.
//
// Run: node scripts/api-method-pills.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(__dirname, '..', 'src', 'pages', 'api');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

// Match an H2 whose text is an HTTP method followed by a path.
// e.g. `<h2 id="post-apiv1authlogin">POST /api/v1/auth/login</h2>`
const ENDPOINT_RE = /<h2 id="([^"]+)">(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+(\/[^<\s]+)<\/h2>/g;

let processed = 0;
for (const file of walk(API_ROOT)) {
  let src = fs.readFileSync(file, 'utf-8');
  let touched = false;

  src = src.replace(ENDPOINT_RE, (_m, id, method, p) => {
    touched = true;
    return `<h2 id="${id}" className="flex items-center gap-2"><HttpMethod method="${method}" /><code>{\`${p}\`}</code></h2>`;
  });

  if (!touched) continue;

  // Ensure HttpMethod is imported. Insert after the DocPage import.
  if (!src.includes(`import HttpMethod`)) {
    src = src.replace(
      /import DocPage from '([^']+)\/DocPage';/,
      (m, dir) => `${m}\nimport HttpMethod from '${dir}/HttpMethod';`,
    );
  }

  fs.writeFileSync(file, src);
  processed++;
  console.log(`✓ ${path.relative(API_ROOT, file)}`);
}

console.log(`\nDone. ${processed} files touched.`);
