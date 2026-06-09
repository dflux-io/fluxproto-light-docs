import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';
import { catalogSummary } from '../../generated/catalogSummary';
import { getCatalog, sourceUrl, type Catalog, type CatalogFlow } from '../../lib/catalog';

const PROTOCOL_LABEL: Record<string, string> = {
  ngap: 'NGAP',
  diameter: 'Diameter',
  sbi: 'SBI',
  rest: 'REST',
  pfcp: 'PFCP',
};

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-muted px-4 py-3 panel-glow">
      <div className="text-2xl font-semibold tracking-tight text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-ink-muted">{label}</div>
    </div>
  );
}

export default function Catalogs() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [protocol, setProtocol] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    getCatalog().then(setCatalog).catch((e) => setError(String(e)));
  }, []);

  const protocols = Object.keys(catalogSummary.byProtocol);
  const categories = Object.keys(catalogSummary.byCategory).filter((c) => c && c !== '-');

  const flows = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    return catalog.flows.filter((f) => {
      if (protocol !== 'all' && f.protocol !== protocol) return false;
      if (category !== 'all' && f.category !== category) return false;
      if (q && !(`${f.name} ${f.description} ${f.nf}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [catalog, query, protocol, category]);

  const grouped = useMemo(() => {
    const m = new Map<string, CatalogFlow[]>();
    for (const f of flows) {
      const k = f.protocol || 'other';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(f);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [flows]);

  const repoUrl = catalog?.repoUrl ?? 'https://github.com/dflux-io/fluxproto-light-templates';

  return (
    <DocPage
      slug="reference/catalogs"
      lede="Every flow and suite that ships in the templates repo, generated directly from the binary's catalog so it never drifts. Filter below, or run flow list to see the same set on your machine."
    >
      <div className="not-prose grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={catalogSummary.totals.flows} label="flows" />
        <StatCard value={catalogSummary.totals.suites} label="suites" />
        <StatCard value={Object.keys(catalogSummary.byProtocol).length} label="protocols" />
        <StatCard value={catalogSummary.byNf.gnb !== undefined ? Object.keys(catalogSummary.byNf).length : 0} label="NF roles" />
      </div>

      <p>
        The catalog lives in the{' '}
        <a href={repoUrl} target="_blank" rel="noreferrer">
          fluxproto-light-templates
        </a>{' '}
        repo. Point the CLI at a checkout of it with <code>{`-templates`}</code> and list everything:
      </p>

      <CodeBlock lang="bash" code={`fluxproto-light flow list  -templates ../fluxproto-light-templates\nfluxproto-light suite list -templates ../fluxproto-light-templates`} />

      <Callout type="tip">
        Counts by protocol: {protocols.map((p) => `${PROTOCOL_LABEL[p] ?? p} ${catalogSummary.byProtocol[p]}`).join(' · ')}.
        Roughly {catalogSummary.byCategory.functional ?? 0} functional and {catalogSummary.byCategory.negative ?? 0} negative/abnormal cases.
      </Callout>

      <h2 id="flows">Flows</h2>

      <div className="not-prose mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, NF, or description…"
            className="w-full rounded-md border border-surface-border bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={protocol}
          onChange={(e) => setProtocol(e.target.value)}
          className="rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-ink-muted focus:border-accent focus:outline-none"
        >
          <option value="all">All protocols</option>
          {protocols.map((p) => (
            <option key={p} value={p}>
              {PROTOCOL_LABEL[p] ?? p} ({catalogSummary.byProtocol[p]})
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-sm text-ink-muted focus:border-accent focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c} ({catalogSummary.byCategory[c]})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <Callout type="warning" title="Catalog unavailable">
          Could not load the catalog data ({error}). Run <code>{`npm run build:catalog`}</code> locally to regenerate it.
        </Callout>
      )}

      {!catalog && !error && <p className="text-sm text-ink-muted">Loading catalog…</p>}

      {catalog && (
        <>
          <p className="not-prose mb-4 text-sm text-ink-muted">
            Showing {flows.length} of {catalog.flows.length} flows.
          </p>
          {grouped.map(([proto, items]) => (
            <section key={proto} className="not-prose mb-8">
              <h3 id={proto} className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-subtle">
                {PROTOCOL_LABEL[proto] ?? proto} <span className="text-ink-subtle/70">· {items.length}</span>
              </h3>
              <div className="overflow-hidden rounded-lg border border-surface-border">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {items.map((f, i) => (
                      <tr key={f.name} className={i % 2 ? 'bg-surface-muted/40' : ''}>
                        <td className="border-b border-surface-border px-3 py-2 align-top">
                          <a
                            href={sourceUrl(repoUrl, f.path)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[13px] text-accent hover:underline"
                          >
                            {f.name}
                            <ExternalLink size={11} aria-hidden />
                          </a>
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-ink-subtle">
                            <span className="rounded bg-surface-subtle px-1.5 py-0.5">{f.nf}</span>
                            <span className="rounded bg-surface-subtle px-1.5 py-0.5">{f.category}</span>
                            {f.type === 'server' && <span className="rounded bg-surface-subtle px-1.5 py-0.5">server</span>}
                          </div>
                        </td>
                        <td className="border-b border-surface-border px-3 py-2 align-top text-ink-muted">
                          {f.description || <span className="text-ink-subtle">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <h2 id="suites">Suites</h2>
          <p>
            Suites chain flows into a single ordered run with per-step workload and pass/fail gating. There are{' '}
            {catalog.suites.length} shipped suites:
          </p>
          <div className="not-prose overflow-hidden rounded-lg border border-surface-border">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {catalog.suites.map((s, i) => (
                  <tr key={s.name} className={i % 2 ? 'bg-surface-muted/40' : ''}>
                    <td className="border-b border-surface-border px-3 py-2 align-top">
                      <a
                        href={sourceUrl(repoUrl, s.path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[13px] text-accent hover:underline"
                      >
                        {s.name}
                        <ExternalLink size={11} aria-hidden />
                      </a>
                      <div className="mt-1 text-[10px] text-ink-subtle">{s.steps} steps</div>
                    </td>
                    <td className="border-b border-surface-border px-3 py-2 align-top text-ink-muted">{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-ink-subtle">
        Generated from the catalog on {catalogSummary.generatedAt}. Regenerate with <code>{`npm run build:catalog`}</code>.
      </p>
    </DocPage>
  );
}
