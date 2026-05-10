import type { Manifest, ManifestGroup, ManifestPage } from './types';

// Single source of truth for the docs IA. Edit this file to add, rename,
// or reorder a page; the sidebar renders from the groups, and prev/next
// derive from the flat ordered list. Routes live in App.tsx — they must
// stay in sync with the slugs here.

const projectName = 'fluxproto-light';

const groups: ManifestGroup[] = [
  {
    title: 'Introduction',
    pages: [
      { slug: 'introduction', title: 'Introduction', group: 'Introduction' },
      { slug: 'introduction/quickstart', title: 'Quickstart', group: 'Introduction' },
    ],
  },
  {
    title: 'Concepts',
    pages: [
      { slug: 'concepts/architecture', title: 'Architecture', group: 'Concepts' },
      { slug: 'concepts/flows', title: 'Flows', group: 'Concepts' },
      { slug: 'concepts/suites', title: 'Suites', group: 'Concepts' },
      { slug: 'concepts/environments', title: 'Environments', group: 'Concepts' },
      { slug: 'concepts/user-plane', title: 'User plane', group: 'Concepts' },
    ],
  },
  {
    title: 'Tutorials',
    pages: [
      { slug: 'tutorials/first-yaml-flow', title: 'Your first YAML flow', group: 'Tutorials' },
      { slug: 'tutorials/first-server-flow', title: 'Your first server-mode flow', group: 'Tutorials' },
    ],
  },
  {
    title: 'Guides',
    pages: [
      { slug: 'guides/writing', title: 'Writing flows and suites', group: 'Guides' },
      { slug: 'guides/running', title: 'Running flows and suites', group: 'Guides' },
      { slug: 'guides/configuring-environments', title: 'Configuring environments', group: 'Guides' },
      { slug: 'guides/daemon', title: 'Daemon mode and scheduling', group: 'Guides' },
      { slug: 'guides/user-plane-testing', title: 'User-plane testing', group: 'Guides' },
      { slug: 'guides/subscribers', title: 'Subscribers', group: 'Guides' },
      { slug: 'guides/multi-protocol-flows', title: 'Multi-protocol flows', group: 'Guides' },
      { slug: 'guides/ci-integration', title: 'CI integration', group: 'Guides' },
    ],
  },
  {
    title: 'Reference',
    pages: [
      { slug: 'reference/cli', title: 'CLI', group: 'Reference' },
      { slug: 'reference/flow-schema', title: 'Flow schema', group: 'Reference' },
      { slug: 'reference/suite-schema', title: 'Suite schema', group: 'Reference' },
      { slug: 'reference/config-schema', title: 'Config schema', group: 'Reference' },
      { slug: 'reference/catalogs', title: 'Flow & suite catalogs', group: 'Reference' },
      { slug: 'reference/metrics', title: 'Metrics', group: 'Reference' },
    ],
  },
  {
    title: 'API',
    pages: [
      { slug: 'api/overview', title: 'Overview', group: 'API' },
      { slug: 'api/users', title: 'Users', group: 'API' },
      { slug: 'api/flows', title: 'Flows', group: 'API' },
      { slug: 'api/environments', title: 'Environments', group: 'API' },
      { slug: 'api/executions', title: 'Executions and reports', group: 'API' },
      { slug: 'api/schedules', title: 'Schedules', group: 'API' },
      { slug: 'api/subscribers', title: 'Subscribers', group: 'API' },
      { slug: 'api/settings', title: 'Settings', group: 'API' },
    ],
  },
  {
    title: 'Glossary',
    pages: [
      { slug: 'glossary', title: 'Glossary', group: 'Glossary' },
    ],
  },
];

const indexPage: ManifestPage = { slug: '', title: 'fluxproto-light docs', group: '' };

const flatPages: ManifestPage[] = [
  indexPage,
  ...groups.flatMap((g) => g.pages),
];

export const manifest: Manifest = {
  projectName,
  groups,
  pages: flatPages,
};

export function pageBySlug(slug: string): ManifestPage | undefined {
  return manifest.pages.find((p) => p.slug === slug);
}

export function neighbors(slug: string): { prev?: ManifestPage; next?: ManifestPage } {
  const idx = manifest.pages.findIndex((p) => p.slug === slug);
  if (idx < 0) return {};
  return {
    prev: idx > 0 ? manifest.pages[idx - 1] : undefined,
    next: idx < manifest.pages.length - 1 ? manifest.pages[idx + 1] : undefined,
  };
}
