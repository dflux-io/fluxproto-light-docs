import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import DocPage from '../components/DocPage';
import SectionCard from '../components/SectionCard';
import { sectionMeta } from '../manifest';

export default function Index() {
  const sections: { to: string; group: string; title: string; description: string }[] = [
    {
      to: '/introduction',
      group: 'Introduction',
      title: 'Start here',
      description: 'What fluxproto-light is, when to pick it, and how to run your first flow in 10 minutes.',
    },
    {
      to: '/concepts/architecture',
      group: 'Concepts',
      title: 'Mental model',
      description: 'Flows, suites, environments, NF roles. Read these to understand the model behind the tool.',
    },
    {
      to: '/tutorials/first-yaml-flow',
      group: 'Tutorials',
      title: 'Hands-on',
      description: 'Walk-throughs that put concepts to work. Author a flow, drive a server-mode procedure.',
    },
    {
      to: '/guides/writing',
      group: 'Guides',
      title: 'How-tos',
      description: 'Recipes for everyday tasks: writing flows, configuring envs, running suites in CI.',
    },
    {
      to: '/reference/cli',
      group: 'Reference',
      title: 'Look it up',
      description: 'Authoritative schemas — every CLI flag, every YAML field, every metric, every flow.',
    },
    {
      to: '/api/overview',
      group: 'API',
      title: 'REST API',
      description: 'The daemon\'s HTTP surface. Drive runs, browse reports, manage schedules from any client.',
    },
  ];

  return (
    <DocPage slug="" bare>
      {/* Hero */}
      <div className="not-prose mb-12 rounded-2xl border border-surface-border bg-surface-muted px-8 py-10 panel-glow">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Sparkles size={14} strokeWidth={2} aria-hidden />
          fluxproto-light docs
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
          5G/4G protocol load &amp; conformance tester
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
          One Go binary that drives NGAP, Diameter, SBI, REST, and PFCP from declarative YAML
          flow definitions. Run conformance tests in CI or stand up a continuous test plane
          with the embedded daemon.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <Link
            to="/introduction"
            className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            Get started →
          </Link>
          <Link
            to="/concepts/architecture"
            className="inline-flex items-center rounded-md border border-surface-border bg-surface px-3 py-1.5 font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Read the concepts
          </Link>
        </div>
      </div>

      {/* Card grid */}
      <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const { Icon } = sectionMeta(s.group);
          return (
            <SectionCard
              key={s.to}
              to={s.to}
              Icon={Icon}
              section={s.group}
              title={s.title}
              description={s.description}
            />
          );
        })}
      </div>

      {/* Latest release */}
      <p className="not-prose mt-10 text-xs text-ink-subtle">
        Latest release: <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">20260509-1822-2148cf89</code>
      </p>
    </DocPage>
  );
}
