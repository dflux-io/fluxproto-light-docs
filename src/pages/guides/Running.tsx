import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function Running() {
  return (
    <DocPage slug="guides/running" lede="fluxproto-light run-flow executes one flow against an environment. Flows are looked up by name in the templates DB after a sync of the -templates directory; the engine then drives the FSM per UE according to the workload knobs. This guide covers invocation, the workload model, output, tracing, and exit codes.">
<h2 id="invocation">Invocation</h2>
<CodeBlock lang="bash" code={`fluxproto-light run-flow \\
    -flow <name> \\
    -templates <dir> \\
    -c <config.yaml> \\
    [-s <subscribers.yaml>] \\
    [-repetitions <n>] \\
    [-rate <n>] \\
    [-duration <duration>] \\
    [-timeout <duration>] \\
    [-trace] \\
    [-gen-subscriber] \\
    [-db <path>]`} />
<p><code>{`-flow`}</code> is the name (not the path) of the flow as listed by <code>{`fluxproto-light flow list -templates &lt;dir&gt;`}</code>. <code>{`-templates`}</code> is required — the loader walks it recursively, picks up every <code>{`kind: flow`}</code> and <code>{`kind: suite`}</code> YAML, and reconciles into the DB before the run.</p>
<h2 id="choosing-a-config">Choosing a config</h2>
<p><code>{`-c &lt;file&gt;`}</code> (or <code>{`-config &lt;file&gt;`}</code>) loads the env. The shipped <code>{`config/lab.yaml`}</code> is the canonical single-gNB lab. Other shipped configs:</p>
<table>
<thead><tr><th>File</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>{`config/lab.yaml`}</code></td><td>Single gNB → one AMF (NGAP)</td></tr>
<tr><td><code>{`config/lab2gnb.yaml`}</code></td><td>Two gNBs → one AMF (handover scenarios)</td></tr>
<tr><td><code>{`config/lab-diameter.yaml`}</code></td><td>MME → HSS (S6a)</td></tr>
<tr><td><code>{`config/lab-diameter-rx.yaml`}</code></td><td>AF → PCRF (Rx)</td></tr>
<tr><td><code>{`config/lab-diameter-gx.yaml`}</code></td><td>PGW → PCRF (Gx)</td></tr>
<tr><td><code>{`config/lab-diameter-multiapp.yaml`}</code></td><td>One MME, S6a + Rx multiplexed</td></tr>
<tr><td><code>{`config/lab-diameter-responder.yaml`}</code></td><td>Diameter responder/listener</td></tr>
<tr><td><code>{`config/lab-pfcp.yaml`}</code></td><td>SMF ↔ UPF on localhost UDP</td></tr>
<tr><td><code>{`config/lab-sbi.yaml`}</code></td><td>SBI client/server pair on localhost h2c</td></tr>
<tr><td><code>{`config/lab-rest.yaml`}</code></td><td>REST client/server pair on localhost h2c</td></tr>
<tr><td><code>{`config/lab-multinf.yaml`}</code></td><td>gNB + MME + UDM in one env</td></tr>
<tr><td><code>{`config/lab-multiprotocol.yaml`}</code></td><td>Multi-protocol on one UE</td></tr>
<tr><td><code>{`config/lab-fgp.yaml`}</code></td><td>FGP-admin lifecycle</td></tr></tbody>
</table>
<h2 id="workload-knobs">Workload knobs</h2>
<table>
<thead><tr><th>Flag</th><th>Purpose</th><th>Default</th></tr></thead>
<tbody><tr><td><code>{`-repetitions &lt;n&gt;`}</code></td><td>Spawn N UEs total</td><td>1</td></tr>
<tr><td><code>{`-rate &lt;n&gt;`}</code></td><td>UEs per second (0 = burst all immediately)</td><td>0</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>Stop spawning after this elapses</td><td>0 (unlimited)</td></tr>
<tr><td><code>{`-timeout &lt;duration&gt;`}</code></td><td>Per-UE flow timeout</td><td>30s</td></tr></tbody>
</table>
<p>Each UE runs the FSM independently. The engine spawns according to the rate, then waits for in-flight UEs to terminate. Total wall-clock time = max(<code>{`-duration`}</code>, <code>{`-repetitions / -rate`}</code>) + drain time.</p>
<p>A run with <code>{`-repetitions 1`}</code> and no <code>{`-duration`}</code>/<code>{`-rate`}</code> is single-UE mode — the report includes a per-message step log. Multi-UE runs aggregate metrics but skip the step log (it would be unhelpful at scale).</p>
<h2 id="output">Output</h2>
<p><code>{`run-flow`}</code> always prints a human-readable table to stdout; logs go to stderr.</p>
<CodeBlock lang="" code={`==> Flow: registration
    Result: PASS
    Duration: 187ms
    Steps: 7
    Final state: registered`} />
<p>For machine-readable output, run the flow against the <Link to="/guides/daemon">daemon</Link> and fetch the persisted report over the HTTP API, or read the report record from the DB (see <Link to="#db">DB</Link> below). The report carries the full execution result: <code>{`execution_id`}</code>, <code>{`report_id`}</code>, <code>{`flow_name`}</code>, <code>{`duration`}</code>, <code>{`metrics`}</code>, <code>{`steps`}</code>, <code>{`event_log`}</code>, <code>{`msg_types`}</code>, <code>{`workload`}</code>, <code>{`post_checks`}</code>, <code>{`uplane_report`}</code>, <code>{`final_state_counts`}</code>, <code>{`final_params`}</code>, and <code>{`all_passed`}</code>. When the flow ran as a suite step, <code>{`suite_execution_id`}</code> and <code>{`suite_step_name`}</code> are populated too.</p>
<h2 id="tracing">Tracing</h2>
<p><code>{`-trace`}</code> adds three things:</p>
<ol>
<li>TX/RX hex dump of every wire frame (printed inline with the table).</li>
<li>JSON trace of every FSM step (printed at the end).</li>
<li>Trace-level zerolog output to stderr.</li>
</ol>
<p>Tracing is expensive — it serialises every frame. Strip it for load tests.</p>
<h2 id="subscribers">Subscribers</h2>
<p>Two paths:</p>
<ul>
<li><code>{`-s &lt;file&gt;`}</code>: load subscribers from YAML into the DB on every run. The pool then hands them to UEs and serialises one-UE-per-subscriber for the lifetime of each UE.</li>
<li><code>{`-gen-subscriber`}</code>: synthesize a fresh subscriber per UE in memory. No DB writes, no pool contention. Use this for runs against lab AMFs / dev proxies that don't validate auth.</li>
</ul>
<p>If neither flag is set, the engine reads whatever's already in the DB. An empty pool fails fast with <code>{`ErrPoolEmpty`}</code>.</p>
<p>See <Link to="/guides/subscribers">subscribers</Link> for provisioning and pool semantics.</p>
<h2 id="exit-codes">Exit codes</h2>
<ul>
<li><code>{`0`}</code> — every UE's flow completed <code>{`AllPassed`}</code></li>
<li><code>{`1`}</code> — at least one check failed, or the engine returned an error</li>
</ul>
<p>For CI gating, rely on the exit code. For diagnostics beyond pass/fail, persist runs through the <Link to="/guides/daemon">daemon</Link> and pull the report over the <Link to="/api/executions">HTTP API</Link>.</p>
<h2 id="db">DB</h2>
<p>Every run persists a <code>{`ReportEntity`}</code> to SQLite at <code>{`./fpl.db`}</code> (overridable via <code>{`-db &lt;path&gt;`}</code> or <code>{`FPL_DB`}</code>). The shipped CLI also auto-syncs the templates dir into the DB before each run, so the catalog is always up to date with what's on disk.</p>
<CodeBlock lang="bash" code={`fluxproto-light report list
fluxproto-light report <report-id>`} />
<p>Reports survive across runs; truncate the DB by deleting the file or pointing <code>{`-db`}</code> at a fresh path.</p>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong><code>{`flow %q not found`}</code></strong> — the flow name didn't load. Run <code>{`flow list -templates &lt;dir&gt;`}</code> to see what's available; check the YAML for parse errors with <code>{`flow info &lt;name&gt; -templates &lt;dir&gt;`}</code>.</p>
<p><strong><code>{`error: load templates: ...`}</code></strong> — a YAML in the templates dir failed to parse or validate. The error message names the file and line.</p>
<p><strong><code>{`ErrPoolEmpty`}</code></strong> — no subscribers in the DB and no <code>{`-gen-subscriber`}</code>. Either provision via <code>{`-s &lt;file&gt;`}</code> or pass <code>{`-gen-subscriber`}</code>.</p>
<p><strong>Flow times out at <code>{`wait_*`}</code></strong> — the AMF/peer didn't send the expected response in time. Check <code>{`-trace`}</code> to see what <em>was</em> sent and whether the response matched the FSM's <code>{`event:`}</code> clause. Common cause: PLMN mismatch.</p>
<p><strong><code>{`-rate`}</code> ignored</strong> — single-UE runs (<code>{`-repetitions 1`}</code>, no <code>{`-duration`}</code>) burst, ignoring rate. Multi-UE runs respect it.</p>
<h2 id="running-suites">Running suites</h2>
<p><code>{`fluxproto-light run-suite`}</code> executes a suite — an ordered list of flow steps — as one or more cycles. Each cycle produces a single suite report with one child report per step. The sections below cover suite invocation, the cycle model, suite reports, and exit-code behaviour.</p>
<h3 id="suite-invocation">Suite invocation</h3>
<CodeBlock lang="bash" code={`fluxproto-light run-suite \\
    -suite <name> \\
    -templates <dir> \\
    -c <config.yaml> \\
    [-s <subscribers.yaml>] \\
    [-repetitions <n>] \\
    [-duration <duration>] \\
    [-timeout <duration>] \\
    [-trace] \\
    [-gen-subscriber] \\
    [-db <path>]`} />
<p><code>{`-suite`}</code> is the name (not the path) as listed by <code>{`fluxproto-light suite list -templates &lt;dir&gt;`}</code>. The templates repository ships 21 suites — compliance and security passes for gNB, AUSF, SMF, UDM, UPF, and NRF, plus the <code>{`gnb-register-deregister`}</code> demo. See the <Link to="/reference/catalogs">flow and suite catalog</Link> for the full list, and browse the source YAML in the <a href="https://github.com/dflux-io/fluxproto-light-templates" target="_blank" rel="noreferrer">fluxproto-light-templates</a> repository.</p>
<h3 id="cycle-vs-step">Cycle vs step</h3>
<p>A <em>cycle</em> is one full traversal of the suite's <code>{`steps:`}</code> list. A <em>step</em> is one entry in that list, executing one flow with its own workload. The runner repeats the cycle <code>{`-repetitions`}</code> times (or until <code>{`-duration`}</code> elapses).</p>
<p>Within a cycle, steps are strictly serial — no parallelism between steps. Each step independently acquires its own subscribers from the pool, runs its flow, and releases the subscribers before the next step starts.</p>
<h3 id="workload-at-the-cli-vs-in-the-suite">Workload at the CLI vs in the suite</h3>
<p>The CLI flags drive the <em>outer loop</em> (number of cycles). Workload knobs <em>inside</em> a cycle live in the suite YAML on each step:</p>
<table>
<thead><tr><th>CLI flag</th><th>Scope</th></tr></thead>
<tbody><tr><td><code>{`-repetitions &lt;n&gt;`}</code></td><td>Number of full cycles</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>Run cycles back-to-back until this elapses</td></tr>
<tr><td><code>{`-timeout &lt;duration&gt;`}</code></td><td>Per-cycle deadline (each step inherits when not overridden)</td></tr></tbody>
</table>
<p>Per-step workload (<code>{`repetitions`}</code>, <code>{`rate`}</code>, <code>{`duration`}</code>, <code>{`timeout`}</code>) lives in the YAML — see <Link to="/guides/writing">writing flows and suites</Link>.</p>
<p><code>{`run-suite`}</code> has no <code>{`-rate`}</code> flag. Steps run strictly serially, so there is no suite-level spawn rate; set <code>{`rate`}</code> per step in the YAML when a step needs to throttle its own UEs.</p>
<CodeBlock lang="bash" code={`# 5 cycles of the gnb-register-deregister suite
fluxproto-light run-suite -suite gnb-register-deregister \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml -repetitions 5

# Cycles back-to-back for 10 minutes
fluxproto-light run-suite -suite gnb-register-deregister \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml -duration 10m`} />
<h3 id="cli-overrides">CLI overrides</h3>
<p><code>{`-trace`}</code> and <code>{`-gen-subscriber`}</code> OR with each step's setting — one of them being true enables the feature for that step. Useful when a long suite YAML has trace off but you want to debug one cycle.</p>
<h3 id="suite-reports">Suite reports</h3>
<p>Each cycle persists one <code>{`SuiteReportEntity`}</code> plus one child <code>{`ReportEntity`}</code> per step. Browse with:</p>
<CodeBlock lang="bash" code={`# List the most recent suite reports
fluxproto-light report list-suites

# Show a specific suite execution
fluxproto-light report show-suite <suite-execution-id>`} />
<p>The <code>{`show-suite`}</code> view prints the suite-level summary (cycle duration, step count, pass/fail/abort) followed by every child report's summary. Drill into a single step's full report with <code>{`report &lt;report-id&gt;`}</code> using the ID from the <code>{`show-suite`}</code> listing.</p>
<p>The standalone <code>{`report list`}</code> view filters out suite-children — they show up only via <code>{`list-suites`}</code> / <code>{`show-suite`}</code>. This keeps the standalone listing clean for ad-hoc <code>{`run-flow`}</code> runs.</p>
<h3 id="exit-code">Exit code</h3>
<p>Exit <code>{`0`}</code> only when <em>every</em> cycle's <code>{`AllPassed`}</code> is true and no cycle was aborted. A single failing step (with <code>{`stop_on_failure: true`}</code>, the default) makes the cycle abort and produces a non-zero exit.</p>
<table>
<thead><tr><th>Exit code</th><th>Meaning</th></tr></thead>
<tbody><tr><td><code>{`0`}</code></td><td>Every cycle's every step passed</td></tr>
<tr><td><code>{`1`}</code></td><td>At least one step failed, or one cycle was aborted, or the suite returned an error</td></tr></tbody>
</table>
<p><code>{`always_run`}</code> cleanup steps execute even after an abort, but their pass/fail still counts toward the cycle's <code>{`AllPassed`}</code>.</p>
<h3 id="per-step-success-vs-cycle-abort">Per-step success vs cycle abort</h3>
<p>A step can fail without aborting the cycle if it sets <code>{`stop_on_failure: false`}</code>. In that case the cycle continues to the next step but <code>{`cycle.AllPassed`}</code> is still false. Use this for negative-test steps that are expected to fail intermittently and shouldn't gate the cleanup steps that follow.</p>
<h3 id="reading-the-report-json">Reading the report JSON</h3>
<p>When runs go through the <Link to="/guides/daemon">daemon</Link>, fetch a report by its id over the HTTP API:</p>
<CodeBlock lang="bash" code={`curl -H "Authorization: Bearer $TOKEN" \\
    https://daemon/api/v1/reports/<report-id>`} />
<p>The report surface is <code>{`GET /api/v1/reports`}</code> (the list) and <code>{`GET /api/v1/reports/{id}`}</code> (one report). Each suite step's report carries the same execution result as a standalone <code>{`run-flow`}</code> run, with <code>{`suite_execution_id`}</code> and <code>{`suite_step_name`}</code> populated. See the <Link to="/api/executions">executions and reports API</Link> for the full schema.</p>
<h3 id="troubleshooting-2">Suite troubleshooting</h3>
<p><strong>Suite stops after one step</strong> — the step's <code>{`AllPassed`}</code> was false and <code>{`stop_on_failure: true`}</code> (default). Set <code>{`stop_on_failure: false`}</code> on the step if it's an expected partial failure.</p>
<p><strong><code>{`always_run`}</code> step didn't execute</strong> — check the trace; the cycle might have been cancelled before reaching the cleanup. <code>{`always_run`}</code> runs after an abort but not after a context cancellation (Ctrl+C, deadline).</p>
<p><strong>Subscriber pool drained mid-cycle</strong> — every step takes a fresh batch. Make sure the pool size ≥ the largest step's <code>{`repetitions`}</code>, or use <code>{`gen_subscriber: true`}</code> per step.</p>
<p><strong>Expected to see suites in <code>{`report list`}</code></strong> — they're filtered out. Use <code>{`report list-suites`}</code> instead.</p>
    </DocPage>
  );
}
