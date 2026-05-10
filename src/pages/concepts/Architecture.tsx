import DocPage from '../../components/DocPage';
import Mermaid from '../../components/Mermaid';

export default function Architecture() {
  return (
    <DocPage slug="concepts/architecture">
<h1>Architecture</h1>
<p>Where fluxproto-light sits, what the binary contains, and how the two deployment modes (CLI vs daemon) relate.</p>
<h2 id="system-shape">System shape</h2>
<Mermaid code={`graph LR
  CI[CI agent / engineer] -- HTTP / CLI --> FPL[fluxproto-light]
  FPL -- NGAP / SCTP --> AMF
  FPL -- NAS over NGAP --> AMF
  FPL -- Diameter S6a --> HSS
  FPL -- Diameter Gx / Rx --> PCRF
  FPL -- SBI HTTP/2 --> UDM
  FPL -- SBI HTTP/2 --> AUSF
  FPL -- REST HTTP/2 --> Vendor[Vendor admin API]
  FPL -- PFCP UDP --> UPF
  FPL -- GTP-U N3 --> UPF
  FPL -- Postgres / SQLite --> DB[(Reports + catalog)]
  FPL -- /metrics --> Prom[Prometheus]
  AMF -- N3 GTP-U --> Receiver[fpl server uspace / dpdk]`} />
<p>fluxproto-light sits between a CI agent (or an engineer at a terminal) and one or more 5G/4G NFs under test. It carries no production traffic — it's a tester's instrument.</p>
<p>The receiver-side <code>{`server uspace`}</code> / <code>{`server dpdk`}</code> lives outside the main binary's daemon role; it terminates GTP-U traffic on the data network so user-plane tests can close the loop without an external traffic terminator.</p>
<h2 id="cli-vs-daemon">CLI vs daemon</h2>
<p>Two ways to run the same binary, sharing the same engine, the same FSM dispatcher, the same protocol stacks, and the same <code>{`EngineResult`}</code> JSON shape.</p>
<table>
<thead><tr><th></th><th>CLI</th><th>Daemon</th></tr></thead>
<tbody><tr><td>Lifecycle</td><td>One-shot</td><td>Long-lived</td></tr>
<tr><td>Trigger</td><td><code>{`fluxproto-light run-flow …`}</code></td><td><code>{`fluxproto-light`}</code> (no subcommand)</td></tr>
<tr><td>Reads env from</td><td>YAML file (<code>{`-c &lt;file&gt;`}</code>)</td><td>Database row (managed via REST API)</td></tr>
<tr><td>Reports</td><td>Persisted to local SQLite (<code>{`./fpl.db`}</code>)</td><td>Persisted to SQLite or Postgres</td></tr>
<tr><td>Auth</td><td>None</td><td>JWT bearer; admin/viewer roles</td></tr>
<tr><td>Web UI</td><td>No</td><td>Embedded React UI (<code>{`-web`}</code>)</td></tr>
<tr><td>Scheduler</td><td>No</td><td>Cron-style schedules</td></tr>
<tr><td>Metrics</td><td>In-process counters only</td><td>Prometheus <code>{`/metrics`}</code> endpoint</td></tr>
<tr><td>CI shape</td><td>Exit code + JSON</td><td>Same engine driven over REST</td></tr></tbody>
</table>
<p>CI usually wants the CLI — deterministic, no infra. Continuously running test planes usually want the daemon — schedule, browse historical reports, scrape metrics.</p>
<h2 id="single-binary-nature">Single-binary nature</h2>
<p>The Go binary embeds:</p>
<ul>
<li>The full engine and protocol stacks (NGAP via <code>{`fluxproto/ngap5g`}</code>, Diameter via <code>{`fluxproto/diameter`}</code>, SBI generated from 3GPP OpenAPI specs, PFCP, REST)</li>
<li>The DPDK user-plane traffic generator (<code>{`fpl-dpdk-c`}</code>, extracted to a temp dir on first use)</li>
<li>The React/Vite web UI (when built with <code>{`make web`}</code>)</li>
<li>Default Diameter dictionaries, NAS5G codec, and SCTP/UDP/TCP transport plumbing</li>
</ul>
<p>There are no shared libraries to ship, no runtime config beyond the env YAML and the optional database. Cross-compile with <code>{`GOOS=… GOARCH=… make`}</code>.</p>
<h2 id="storage">Storage</h2>
<p>Default backend is SQLite at <code>{`./fpl.db`}</code>. Pointing <code>{`FPL_DB`}</code> at a Postgres DSN switches backends without changing any other behaviour — useful when multiple daemon instances should share execution history (multi-region test plane, dev clusters with rotating CI runners). The schema migrates forward automatically on connect.</p>
<h2 id="process-model-what-runs-in-the-daemon">Process model — what runs in the daemon</h2>
<p>When the daemon starts, it brings up:</p>
<ul>
<li>An HTTP server on <code>{`-port`}</code> (default 8199) — the API surface</li>
<li>(Optional) the same server fronts the embedded web UI when <code>{`-web`}</code> is set</li>
<li>(Optional) a Prometheus <code>{`/metrics`}</code> endpoint on <code>{`-metrics_port`}</code></li>
<li>(Optional) <code>{`net/http/pprof`}</code> on <code>{`-pprof_port`}</code></li>
<li>A goroutine pool servicing the <strong>event bus</strong> — every protocol stack posts inbound frames here for the FSM dispatcher to consume</li>
<li>A <strong>scheduler</strong> that polls the DB for due <code>{`cron`}</code> / <code>{`once`}</code> schedules and dispatches them through the same engine the CLI uses</li>
<li>A <strong>subscriber pool</strong> wrapping the DB's subscriber rows with a FIFO waiter queue</li>
</ul>
<p>The engine itself is the same code in CLI and daemon mode. The difference is purely lifecycle (one-shot vs continuous) and where it reads its inputs from (YAML files vs DB rows).</p>
<h2 id="what-stays-out">What stays out</h2>
<p>fluxproto-light is intentionally not a 3GPP simulator. It does not implement the full state machines of any NF — it implements the FSM model the <em>test author</em> declares. That's the point: deterministic test flows beat realistic simulator state for conformance and load work.</p>
<p>If you need a working AMF, run an AMF; the shipped <code>{`registration_amf`}</code> flow is a wiring stub, not a replacement.</p>
    </DocPage>
  );
}
