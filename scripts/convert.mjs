// One-shot conversion: docs/*.md → src/pages/*.tsx
//
// Reads each source markdown, lexes it with marked, walks the token tree
// and emits proper JSX. Code blocks become <CodeBlock>; mermaid blocks
// become <Mermaid>. Internal .md links are rewritten to the new slug map
// (consolidation: writing-flows.md + writing-suites.md → /guides/writing,
// etc). The auto-gen stamp HTML comment is stripped. The "See also:" /
// "Next:" footer lines from the old MD format are dropped — DocPage's
// PrevNext handles that automatically now.
//
// Run: node scripts/convert.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.resolve(REPO_ROOT, '..', 'fluxproto-light', 'docs');
const OUT_ROOT = path.resolve(REPO_ROOT, 'src', 'pages');

// (componentName, slug, outputPath, sourceMdFiles[])
const PAGES = [
  ['Index', '', 'Index.tsx', ['index.md']],
  ['Introduction', 'introduction', 'introduction/Introduction.tsx', ['introduction/what-is-fluxproto-light.md', 'introduction/why-fluxproto-light.md']],
  ['Quickstart', 'introduction/quickstart', 'introduction/Quickstart.tsx', ['introduction/quickstart.md']],
  ['Architecture', 'concepts/architecture', 'concepts/Architecture.tsx', ['concepts/architecture.md']],
  ['Flows', 'concepts/flows', 'concepts/Flows.tsx', ['concepts/flows.md', 'concepts/states-and-transitions.md', 'concepts/actions.md']],
  ['Suites', 'concepts/suites', 'concepts/Suites.tsx', ['concepts/suites.md']],
  ['Environments', 'concepts/environments', 'concepts/Environments.tsx', ['concepts/environments-and-nfs.md', 'concepts/protocols.md']],
  ['UserPlane', 'concepts/user-plane', 'concepts/UserPlane.tsx', ['concepts/user-plane.md']],
  ['FirstYamlFlow', 'tutorials/first-yaml-flow', 'tutorials/FirstYamlFlow.tsx', ['tutorials/first-yaml-flow.md']],
  ['FirstServerFlow', 'tutorials/first-server-flow', 'tutorials/FirstServerFlow.tsx', ['tutorials/first-server-flow.md']],
  ['Writing', 'guides/writing', 'guides/Writing.tsx', ['guides/writing-flows.md', 'guides/writing-suites.md']],
  ['Running', 'guides/running', 'guides/Running.tsx', ['guides/running-flows.md', 'guides/running-suites.md']],
  ['ConfiguringEnvironments', 'guides/configuring-environments', 'guides/ConfiguringEnvironments.tsx', ['guides/configuring-environments.md']],
  ['Daemon', 'guides/daemon', 'guides/Daemon.tsx', ['guides/daemon-mode.md', 'guides/scheduling-jobs.md']],
  ['UserPlaneTesting', 'guides/user-plane-testing', 'guides/UserPlaneTesting.tsx', ['guides/user-plane-testing.md']],
  ['Subscribers', 'guides/subscribers', 'guides/Subscribers.tsx', ['guides/subscribers.md']],
  ['MultiProtocolFlows', 'guides/multi-protocol-flows', 'guides/MultiProtocolFlows.tsx', ['guides/multi-protocol-flows.md']],
  ['CiIntegration', 'guides/ci-integration', 'guides/CiIntegration.tsx', ['guides/ci-integration.md']],
  ['Cli', 'reference/cli', 'reference/Cli.tsx', ['reference/cli.md']],
  ['FlowSchema', 'reference/flow-schema', 'reference/FlowSchema.tsx', ['reference/flow-schema.md']],
  ['SuiteSchema', 'reference/suite-schema', 'reference/SuiteSchema.tsx', ['reference/suite-schema.md']],
  ['ConfigSchema', 'reference/config-schema', 'reference/ConfigSchema.tsx', ['reference/config-schema.md']],
  ['Catalogs', 'reference/catalogs', 'reference/Catalogs.tsx', ['reference/flow-catalog.md', 'reference/suite-catalog.md']],
  ['Metrics', 'reference/metrics', 'reference/Metrics.tsx', ['reference/metrics.md']],
  ['ApiOverview', 'api/overview', 'api/Overview.tsx', ['api/overview.md', 'api/authentication.md', 'api/transport.md']],
  ['ApiUsers', 'api/users', 'api/Users.tsx', ['api/users.md']],
  ['ApiFlows', 'api/flows', 'api/Flows.tsx', ['api/flows.md']],
  ['ApiEnvironments', 'api/environments', 'api/Environments.tsx', ['api/environments.md']],
  ['ApiExecutions', 'api/executions', 'api/Executions.tsx', ['api/executions.md', 'api/reports.md']],
  ['ApiSchedules', 'api/schedules', 'api/Schedules.tsx', ['api/schedules.md']],
  ['ApiSubscribers', 'api/subscribers', 'api/Subscribers.tsx', ['api/subscribers.md']],
  ['ApiSettings', 'api/settings', 'api/Settings.tsx', ['api/settings.md']],
  ['Glossary', 'glossary', 'Glossary.tsx', ['glossary.md']],
];

// Maps old MD path → new slug. Consolidation handled here.
const SLUG_MAP = {
  'index.md': '/',
  'glossary.md': '/glossary',
  'introduction/what-is-fluxproto-light.md': '/introduction',
  'introduction/why-fluxproto-light.md': '/introduction',
  'introduction/quickstart.md': '/introduction/quickstart',
  'concepts/overview.md': '/concepts/architecture',
  'concepts/architecture.md': '/concepts/architecture',
  'concepts/flows.md': '/concepts/flows',
  'concepts/states-and-transitions.md': '/concepts/flows',
  'concepts/actions.md': '/concepts/flows',
  'concepts/suites.md': '/concepts/suites',
  'concepts/environments-and-nfs.md': '/concepts/environments',
  'concepts/protocols.md': '/concepts/environments',
  'concepts/user-plane.md': '/concepts/user-plane',
  'tutorials/first-yaml-flow.md': '/tutorials/first-yaml-flow',
  'tutorials/first-server-flow.md': '/tutorials/first-server-flow',
  'guides/writing-flows.md': '/guides/writing',
  'guides/writing-suites.md': '/guides/writing',
  'guides/configuring-environments.md': '/guides/configuring-environments',
  'guides/running-flows.md': '/guides/running',
  'guides/running-suites.md': '/guides/running',
  'guides/daemon-mode.md': '/guides/daemon',
  'guides/scheduling-jobs.md': '/guides/daemon',
  'guides/user-plane-testing.md': '/guides/user-plane-testing',
  'guides/subscribers.md': '/guides/subscribers',
  'guides/multi-protocol-flows.md': '/guides/multi-protocol-flows',
  'guides/ci-integration.md': '/guides/ci-integration',
  'reference/cli.md': '/reference/cli',
  'reference/flow-schema.md': '/reference/flow-schema',
  'reference/suite-schema.md': '/reference/suite-schema',
  'reference/config-schema.md': '/reference/config-schema',
  'reference/flow-catalog.md': '/reference/catalogs',
  'reference/suite-catalog.md': '/reference/catalogs',
  'reference/metrics.md': '/reference/metrics',
  'api/overview.md': '/api/overview',
  'api/authentication.md': '/api/overview',
  'api/transport.md': '/api/overview',
  'api/users.md': '/api/users',
  'api/flows.md': '/api/flows',
  'api/environments.md': '/api/environments',
  'api/executions.md': '/api/executions',
  'api/reports.md': '/api/executions',
  'api/schedules.md': '/api/schedules',
  'api/subscribers.md': '/api/subscribers',
  'api/settings.md': '/api/settings',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// JSX text-node escape. Marked has already encoded HTML entities in many
// token text fields; decode first to avoid double-encoding, then re-encode
// the JSX-unsafe characters.
function escapeText(s) {
  s = s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

// Inside JSX template literals (backticks), backticks and ${ need escaping.
function escapeTemplateLiteral(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// Escape attribute values for JSX (double-quoted attributes).
function escapeAttr(s) {
  return s.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}

function resolveLink(href, currentPath) {
  if (!href) return null;
  if (/^[a-z]+:\/\//i.test(href)) return { external: true, href };
  if (href.startsWith('#')) return { internal: true, href }; // pure anchor
  const [pathPart, hash] = href.split('#');
  if (!pathPart.endsWith('.md')) return { internal: false, href };
  // Resolve relative
  const baseDir = currentPath.includes('/') ? currentPath.slice(0, currentPath.lastIndexOf('/')) : '';
  const segments = (baseDir ? baseDir.split('/') : []).concat(pathPart.split('/'));
  const stack = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { stack.pop(); continue; }
    stack.push(seg);
  }
  const key = stack.join('/');
  const newSlug = SLUG_MAP[key];
  if (!newSlug) return { external: false, href: '/' + key.replace(/\.md$/, '') };
  return { internal: true, href: hash ? `${newSlug}#${hash}` : newSlug };
}

// ---------------------------------------------------------------------------
// Inline emission
// ---------------------------------------------------------------------------

function emitInline(tokens, ctx) {
  if (!tokens) return '';
  return tokens.map((t) => {
    switch (t.type) {
      case 'text':
        // marked may put nested tokens inside a text token in some cases
        if (t.tokens && t.tokens.length > 0) return emitInline(t.tokens, ctx);
        return escapeText(t.text);
      case 'em':
        return `<em>${emitInline(t.tokens, ctx)}</em>`;
      case 'strong':
        return `<strong>${emitInline(t.tokens, ctx)}</strong>`;
      case 'codespan':
        // Use a template literal for safety with backticks/braces.
        return `<code>{\`${escapeTemplateLiteral(t.text)}\`}</code>`;
      case 'link': {
        const r = resolveLink(t.href, ctx.currentPath);
        const inner = emitInline(t.tokens, ctx);
        if (!r) return inner;
        if (r.external) {
          return `<a href="${escapeAttr(r.href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
        }
        return `<Link to="${escapeAttr(r.href)}">${inner}</Link>`;
      }
      case 'br':
        return '<br />';
      case 'del':
        return `<del>${emitInline(t.tokens, ctx)}</del>`;
      case 'escape':
        return escapeText(t.text);
      case 'html':
        return ''; // strip raw HTML
      default:
        return '';
    }
  }).join('');
}

// ---------------------------------------------------------------------------
// Block emission
// ---------------------------------------------------------------------------

let currentHeadingIds;

function emitBlock(token, ctx) {
  switch (token.type) {
    case 'heading': {
      const text = emitInline(token.tokens, ctx);
      const plain = stripTags(text);
      let id = slugify(plain);
      // Disambiguate dups on the same page
      let suffix = 1;
      while (currentHeadingIds.has(id)) {
        id = `${slugify(plain)}-${++suffix}`;
      }
      currentHeadingIds.add(id);
      const tag = `h${token.depth}`;
      // H1 stays unadorned; H2/H3 get IDs for the outline.
      return token.depth === 1
        ? `<${tag}>${text}</${tag}>\n`
        : `<${tag} id="${id}">${text}</${tag}>\n`;
    }
    case 'paragraph':
      return `<p>${emitInline(token.tokens, ctx)}</p>\n`;
    case 'text':
      // Block-level text tokens occur inside list_items containing only
      // inline content (e.g. a single link). Emit the inline content directly.
      return token.tokens ? emitInline(token.tokens, ctx) : escapeText(token.text);
    case 'space':
      return '';
    case 'code': {
      const lang = token.lang || '';
      const code = escapeTemplateLiteral(token.text);
      if (lang === 'mermaid') {
        return `<Mermaid code={\`${code}\`} />\n`;
      }
      return `<CodeBlock lang="${escapeAttr(lang)}" code={\`${code}\`} />\n`;
    }
    case 'list': {
      const tag = token.ordered ? 'ol' : 'ul';
      const items = token.items.map((item) => {
        const inner = item.tokens.map((t) => emitBlock(t, ctx)).join('').trim();
        // List items often contain a single paragraph — unwrap the <p> for nicer output.
        const unwrapped = inner.replace(/^<p>([\s\S]*)<\/p>$/, '$1');
        return `<li>${unwrapped}</li>`;
      }).join('\n');
      return `<${tag}>\n${items}\n</${tag}>\n`;
    }
    case 'table': {
      const headerRow = '<tr>' + token.header.map((cell) =>
        `<th>${emitInline(cell.tokens, ctx)}</th>`
      ).join('') + '</tr>';
      const bodyRows = token.rows.map((row) =>
        '<tr>' + row.map((cell) => `<td>${emitInline(cell.tokens, ctx)}</td>`).join('') + '</tr>'
      ).join('\n');
      return `<table>\n<thead>${headerRow}</thead>\n<tbody>${bodyRows}</tbody>\n</table>\n`;
    }
    case 'blockquote': {
      const inner = token.tokens.map((t) => emitBlock(t, ctx)).join('').trim();
      return `<blockquote>${inner}</blockquote>\n`;
    }
    case 'hr':
      return '';   // We use prev/next + heading borders; mid-page <hr> is noisy.
    case 'html':
      return '';   // strip raw HTML (auto-gen stamps live in HTML comments)
    default:
      return '';
  }
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

// ---------------------------------------------------------------------------
// Per-page conversion
// ---------------------------------------------------------------------------

function convertPage([component, slug, outRel, sources]) {
  // Concat sources, stripping the auto-gen stamp + the "See also/Next" footer.
  const blocks = sources.map((src) => {
    const full = path.join(DOCS_ROOT, src);
    let text = fs.readFileSync(full, 'utf-8');
    // Strip the AUTO-GENERATED HTML comment at the top.
    text = text.replace(/^<!--[\s\S]*?-->\s*\n?/, '');
    // Strip the "See also: ... / Next: ..." footer (DocPage handles prev/next now).
    text = text.replace(/\n+---\n+\*\*See also:\*\*[\s\S]*$/, '\n');
    text = text.replace(/\n+\*\*See also:\*\*[\s\S]*$/, '\n');
    return { src, text };
  });

  // For multi-source pages, drop H1s on all but the first source. Each source's
  // H1 was a page title; the merged page only needs the first.
  const merged = blocks.map((b, i) => {
    if (i === 0) return b.text;
    // Strip the leading H1 line on subsequent sources
    return b.text.replace(/^# .+\n+/, '');
  }).join('\n\n');

  // Reset per-page heading-id tracker.
  currentHeadingIds = new Set();

  const tokens = marked.lexer(merged);
  const ctx = { currentPath: sources[0] };
  const body = tokens.map((tok) => emitBlock(tok, ctx)).join('').trim();

  // Detect what we used so imports stay tight.
  const usesCodeBlock = /<CodeBlock /.test(body);
  const usesMermaid = /<Mermaid /.test(body);
  const usesLink = /<Link /.test(body);

  const imports = ['import DocPage from \'@components/DocPage\';'];
  if (usesCodeBlock) imports.push('import CodeBlock from \'@components/CodeBlock\';');
  if (usesMermaid) imports.push('import Mermaid from \'@components/Mermaid\';');
  if (usesLink) imports.push('import { Link } from \'react-router-dom\';');

  // Pages live under src/pages/<outRel>; components under src/components/.
  // The relative path from the page dir to components is "../" times
  // (slashes-in-outRel + 1) — climb out of pages/ first, then any subdirs.
  const slashes = (outRel.match(/\//g) || []).length;
  const compPath = '../'.repeat(slashes + 1) + 'components/';
  const fixedImports = imports.map((line) => line.replace('@components/', compPath));

  // Don't pretty-indent the body — template literals (CodeBlock / Mermaid)
  // would have their content corrupted by leading whitespace. Valid JSX
  // doesn't require indentation.
  const tsx = `${fixedImports.join('\n')}

export default function ${component}() {
  return (
    <DocPage slug="${slug}">
${body}
    </DocPage>
  );
}
`;

  const outFull = path.join(OUT_ROOT, outRel);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });
  fs.writeFileSync(outFull, tsx);
  console.log(`✓ ${outRel}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`Converting ${PAGES.length} pages from ${DOCS_ROOT}\n`);
for (const entry of PAGES) {
  try {
    convertPage(entry);
  } catch (e) {
    console.error(`✗ ${entry[2]}: ${e.message}`);
    throw e;
  }
}
console.log(`\nDone. Wrote ${PAGES.length} files to ${OUT_ROOT}.`);
