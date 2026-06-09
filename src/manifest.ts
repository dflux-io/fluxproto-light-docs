import {
  Rocket,
  Lightbulb,
  GraduationCap,
  Wrench,
  Library,
  Plug,
  Book,
  type LucideIcon,
} from 'lucide-react';
import type { Manifest, ManifestGroup, ManifestPage } from './types';

// Single source of truth for the docs IA. Edit this file to add, rename,
// or reorder a page; the sidebar renders from the groups, prev/next
// derive from the flat ordered list, and DocPage looks up icon + section
// for the page header. Routes live in App.tsx — they must stay in sync
// with the slugs here.

const projectName = 'fluxproto-light';

interface SectionMeta {
  Icon: LucideIcon;
}

const sections: Record<string, SectionMeta> = {
  'Get started':   { Icon: Rocket },
  Concepts:        { Icon: Lightbulb },
  Tutorials:       { Icon: GraduationCap },
  'How-to guides': { Icon: Wrench },
  Reference:       { Icon: Library },
  'HTTP API':      { Icon: Plug },
  Glossary:        { Icon: Book },
};

const groups: ManifestGroup[] = [
  {
    title: 'Get started',
    pages: [
      { slug: 'introduction', title: 'Overview', group: 'Get started' },
      { slug: 'introduction/why', title: 'Why fluxproto-light', group: 'Get started' },
      { slug: 'introduction/quickstart', title: 'Quickstart', group: 'Get started' },
    ],
  },
  {
    title: 'Concepts',
    pages: [
      { slug: 'concepts/architecture', title: 'Architecture', group: 'Concepts' },
      { slug: 'concepts/flows', title: 'Flows', group: 'Concepts' },
      { slug: 'concepts/flows/states', title: 'States & transitions', group: 'Concepts' },
      { slug: 'concepts/flows/actions', title: 'Actions & checks', group: 'Concepts' },
      { slug: 'concepts/suites', title: 'Suites', group: 'Concepts' },
      { slug: 'concepts/environments', title: 'Environments', group: 'Concepts' },
      { slug: 'concepts/subscribers', title: 'Subscribers', group: 'Concepts' },
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
    title: 'How-to guides',
    pages: [
      { slug: 'guides/writing', title: 'Writing flows and suites', group: 'How-to guides' },
      { slug: 'guides/running', title: 'Running flows and suites', group: 'How-to guides' },
      { slug: 'guides/configuring-environments', title: 'Configuring environments', group: 'How-to guides' },
      { slug: 'guides/subscribers', title: 'Managing subscribers', group: 'How-to guides' },
      { slug: 'guides/multi-protocol-flows', title: 'Multi-protocol flows', group: 'How-to guides' },
      { slug: 'guides/user-plane-testing', title: 'User-plane testing', group: 'How-to guides' },
      { slug: 'guides/daemon', title: 'Running the daemon', group: 'How-to guides' },
      { slug: 'guides/ci-integration', title: 'CI integration', group: 'How-to guides' },
    ],
  },
  {
    title: 'Reference',
    pages: [
      { slug: 'reference/cli', title: 'CLI', group: 'Reference' },
      { slug: 'reference/flow-schema', title: 'Flow schema', group: 'Reference' },
      { slug: 'reference/suite-schema', title: 'Suite schema', group: 'Reference' },
      { slug: 'reference/config-schema', title: 'Environment schema', group: 'Reference' },
      { slug: 'reference/catalogs', title: 'Flow & suite catalog', group: 'Reference' },
      { slug: 'reference/metrics', title: 'Metrics', group: 'Reference' },
    ],
  },
  {
    title: 'HTTP API',
    pages: [
      { slug: 'api/overview', title: 'Overview', group: 'HTTP API' },
      { slug: 'api/users', title: 'Users', group: 'HTTP API' },
      { slug: 'api/environments', title: 'Environments', group: 'HTTP API' },
      { slug: 'api/flows', title: 'Flows', group: 'HTTP API' },
      { slug: 'api/executions', title: 'Executions and reports', group: 'HTTP API' },
      { slug: 'api/schedules', title: 'Schedules', group: 'HTTP API' },
      { slug: 'api/subscribers', title: 'Subscribers', group: 'HTTP API' },
      { slug: 'api/settings', title: 'Settings', group: 'HTTP API' },
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

export function sectionMeta(group: string): SectionMeta {
  return sections[group] ?? { Icon: Book };
}
