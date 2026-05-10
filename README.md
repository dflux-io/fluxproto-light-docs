# fluxproto-light-docs

Documentation site for fluxproto-light. React + TypeScript + Tailwind. Pages authored as JSX.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS with custom Islands palette (black canvas, blue accent, dark by default)
- React Router for client-side routing
- highlight.js for syntax highlighting
- mermaid (lazy-loaded) for diagrams

## Local dev

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build

```bash
npm run build        # → dist/
npm run preview      # serve dist/ for smoke-testing
```

## Deploy on Vercel

Push the repo, click "Import Project" on Vercel, point at this repo. Vercel auto-detects Vite, runs `npm run build`, and serves `dist/`. Auto-deploys on every push to `main`. The `vercel.json` rewrites all non-asset paths to `index.html` so React Router deep links work.

No environment variables required. Project name and any other site config live in `src/manifest.ts`.

## Authoring pages

Every page is a `.tsx` file under `src/pages/` returning JSX. The shared `<DocPage>` wrapper provides the prev/next nav and the right-side outline; the page content is direct HTML-shaped JSX.

```tsx
import { DocPage } from '../components/DocPage';
import { CodeBlock } from '../components/CodeBlock';

export default function MyPage() {
  return (
    <DocPage slug="guides/my-page">
      <h1>My page</h1>
      <p>The lede sentence.</p>

      <h2 id="install">Install</h2>
      <p>Run the command:</p>
      <CodeBlock lang="bash" code={`npm install fluxproto-light`} />
    </DocPage>
  );
}
```

Add the page to `src/manifest.ts` (title + group) and to `src/App.tsx`'s route table. The sidebar renders from the manifest; prev/next derive from the manifest's flat ordering.

### Available components

- `<CodeBlock lang="bash" code="..." />` — fenced code with copy button + highlight.js
- `<Callout type="note|tip|warning">…</Callout>` — admonition boxes
- `<Mermaid code="..." />` — diagram (lazy-loaded mermaid)

## Project structure

```
fluxproto-light-docs/
├── package.json, vite.config.ts, tsconfig*.json, tailwind.config.ts
├── index.html, vercel.json, .gitignore
├── public/                 — favicon etc.
├── scripts/
│   └── convert.mjs         — one-shot MD→TSX conversion (historical)
└── src/
    ├── main.tsx, App.tsx
    ├── manifest.ts         — single source of IA
    ├── types.ts
    ├── lib/theme.ts
    ├── components/
    │   ├── Layout.tsx, TopBar.tsx, SiteNav.tsx, PageOutline.tsx
    │   ├── PrevNext.tsx, ThemeToggle.tsx, DocPage.tsx
    │   ├── CodeBlock.tsx, Callout.tsx, Mermaid.tsx
    ├── pages/
    │   ├── Index.tsx, Glossary.tsx
    │   ├── introduction/, concepts/, tutorials/, guides/, reference/, api/
    └── styles/globals.css
```
