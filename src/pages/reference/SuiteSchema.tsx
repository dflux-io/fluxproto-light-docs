import { Link } from 'react-router-dom';
import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';

export default function SuiteSchema() {
  return (
    <DocPage slug="reference/suite-schema" lede="Authoritative schema for kind: suite YAML. Suites compose flows into ordered, serial runs. For prose and worked walkthroughs, see the writing guide.">
<h2 id="synopsis">Synopsis</h2>
<CodeBlock lang="yaml" code={`kind: suite
name: gnb-register-deregister
description: Demo — register a small batch of UEs, then deregister.
steps:
  - name: register
    flow: registration
    repetitions: 5
  - name: deregister
    flow: deregistration
    repetitions: 5
    always_run: true`} />
<p>Working suites live under <code>{`suites/`}</code> in the public templates repo: <a href="https://github.com/dflux-io/fluxproto-light-templates">github.com/dflux-io/fluxproto-light-templates</a>.</p>
<h2 id="top-level-fields">Top-level fields</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`kind`}</code></td><td>string</td><td>no</td><td>—</td><td><code>{`suite`}</code>. Optional, but when set it must equal <code>{`suite`}</code>; the templates loader uses it to discriminate suites from flows.</td></tr>
<tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>—</td><td>Unique suite name. Looked up by <code>{`run-suite -suite &lt;name&gt;`}</code>.</td></tr>
<tr><td><code>{`description`}</code></td><td>string</td><td>no</td><td>—</td><td>One-line summary; surfaced in <code>{`suite list`}</code>.</td></tr>
<tr><td><code>{`steps`}</code></td><td>[]SuiteStep</td><td>yes</td><td>—</td><td>Ordered list. At least one.</td></tr>
<tr><td><code>{`final_checks`}</code></td><td>[]Check</td><td>no</td><td>—</td><td>Aggregate-metric assertions evaluated once per cycle against the merged metrics across every step. See <a href="#aggregate-checks">Aggregate checks</a>.</td></tr></tbody>
</table>
<h2 id="per-step-fields">Per-step fields</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>—</td><td>Step name; unique within the suite. Surfaced on each child report.</td></tr>
<tr><td><code>{`flow`}</code></td><td>string</td><td>yes</td><td>—</td><td>Flow name. Resolved at runtime against the catalog, not at parse time.</td></tr>
<tr><td><code>{`repetitions`}</code></td><td>int</td><td>no</td><td>1</td><td>UEs to spawn for this step.</td></tr>
<tr><td><code>{`rate`}</code></td><td>float</td><td>no</td><td>0</td><td>UEs/s within this step (0 = burst).</td></tr>
<tr><td><code>{`duration`}</code></td><td>duration</td><td>no</td><td>0</td><td>Stop spawning UEs after this elapses.</td></tr>
<tr><td><code>{`timeout`}</code></td><td>duration</td><td>no</td><td>inherited from cycle</td><td>Per-UE flow timeout.</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td>nil</td><td>Overlay merged into each UE's per-flow params.</td></tr>
<tr><td><code>{`trace`}</code></td><td>bool</td><td>no</td><td>false</td><td>Hex dump TX/RX + JSON trace for this step (OR'd with the suite-level CLI <code>{`-trace`}</code>).</td></tr>
<tr><td><code>{`gen_subscriber`}</code></td><td>bool</td><td>no</td><td>false</td><td>Synthesize subscribers per UE; OR'd with the CLI <code>{`-gen-subscriber`}</code>.</td></tr>
<tr><td><code>{`stop_on_failure`}</code></td><td>bool</td><td>no</td><td>true</td><td>When <code>{`false`}</code>, the cycle continues to the next step even if this step fails.</td></tr>
<tr><td><code>{`always_run`}</code></td><td>bool</td><td>no</td><td>false</td><td>When <code>{`true`}</code>, this step runs even after a prior step aborted the cycle (try/finally).</td></tr>
<tr><td><code>{`success_when`}</code></td><td>matcher</td><td>no</td><td>—</td><td>Overrides per-UE pass/fail with a count-based criterion over final states. See <a href="#success-when">success_when</a>.</td></tr>
<tr><td><code>{`checks`}</code></td><td>[]Check</td><td>no</td><td>—</td><td>Aggregate-metric assertions evaluated after this step. See <a href="#aggregate-checks">Aggregate checks</a>.</td></tr>
<tr><td><code>{`carry_params`}</code></td><td>bool</td><td>no</td><td>false</td><td>Export this step's final params for the next step to consume. Valid only when <code>{`repetitions`}</code> is 1 or 0. See <a href="#carry-params">carry_params</a>.</td></tr>
<tr><td><code>{`background_flows`}</code></td><td>[]string</td><td>no</td><td>—</td><td>Server-mode flow names started in parallel with this step's main flow, sharing the suite's event bus. Cancelled when the main flow finishes.</td></tr></tbody>
</table>
<h2 id="execution-semantics">Execution semantics</h2>
<ul>
<li>Steps run in YAML order, strictly serial — no parallelism.</li>
<li>Each step independently acquires its own subscribers from the pool; subscribers are not shared across steps.</li>
<li>The runner repeats the full step list <code>{`-repetitions`}</code> times, or until <code>{`-duration`}</code> elapses.</li>
<li>Suites are serial, so there is no suite-level rate. <code>{`run-suite`}</code> registers no <code>{`-rate`}</code> flag — set rate per step in YAML instead.</li>
</ul>
<h3 id="default-stop_on_failure-true">Default <code>{`stop_on_failure: true`}</code></h3>
<p>When a step does not pass, the cycle aborts before the next step that is not marked <code>{`always_run`}</code>. The aborted cycle is reported as aborted.</p>
<h3 id="always_run-true"><code>{`always_run: true`}</code></h3>
<p>A step marked <code>{`always_run: true`}</code> executes even when an earlier step aborted the cycle. Use it for cleanup steps. An <code>{`always_run`}</code> step still respects cancellation — Ctrl+C or a deadline skips it.</p>
<h2 id="aggregate-checks">Aggregate checks</h2>
<p>Per-step <code>{`checks`}</code> and top-level <code>{`final_checks`}</code> turn a suite into a load-test or conformance gate. Each check asserts a numeric comparison against a metric from the run.</p>
<ul>
<li><code>{`checks`}</code> run after a single step completes, against that step's metrics. A failed check flips the step to failed, which feeds <code>{`stop_on_failure`}</code>.</li>
<li><code>{`final_checks`}</code> run once per cycle against the metrics merged across every step. Counters are summed; latency and RTT percentiles are computed from the merged histograms, so <code>{`p99_latency_ms`}</code> means p99 across all step samples. A failed final check fails the cycle but does not abort it — every step has already run by then.</li>
</ul>
<p>A check has three fields: <code>{`metric`}</code> (a key such as <code>{`avg_latency_ms`}</code>, <code>{`p99_latency_ms`}</code>, <code>{`success_rate`}</code>, or <code>{`flows_failed`}</code>), <code>{`op`}</code>, and <code>{`value`}</code>. Valid ops are numeric only: <code>{`equals`}</code>, <code>{`greater_than`}</code>, <code>{`less_than`}</code>, <code>{`greater_or_equal`}</code>, <code>{`less_or_equal`}</code>.</p>
<CodeBlock lang="yaml" code={`steps:
  - name: load
    flow: pdu_session_setup
    repetitions: 1000
    rate: 100
    checks:
      - metric: p99_latency_ms
        op: less_than
        value: 100
      - metric: success_rate
        op: greater_or_equal
        value: 0.99
final_checks:
  - metric: flows_failed
    op: equals
    value: 0`} />
<h3 id="success-when"><code>{`success_when`}</code></h3>
<p>By default a step passes only when every UE passes. <code>{`success_when`}</code> replaces that with a count-based criterion over the per-UE final-state tally — useful for negative tests where you expect some UEs to land in a rejection state. Exactly one matcher must be set:</p>
<ul>
<li><code>{`at_least_one_final_state: <state>`}</code> — passes when at least one UE ended in that state.</li>
<li><code>{`exactly_n_final_state: { state: <state>, count: <n> }`}</code> — passes when exactly N UEs ended in that state.</li>
<li><code>{`all_final_state: <state>`}</code> — passes when every completed UE ended in that state (and at least one completed).</li>
</ul>
<CodeBlock lang="yaml" code={`steps:
  - name: rate-limit-burst
    flow: sbi_amf_register_client
    repetitions: 50
    rate: 500
    success_when:
      at_least_one_final_state: rate_limited`} />
<h3 id="carry-params"><code>{`carry_params`}</code></h3>
<p>Set <code>{`carry_params: true`}</code> to export a step's final params so the next step can consume them — for example, step one extracts a <code>{`version_id`}</code> and step two issues a PUT against it. The next step layers its own authored params on top, so on a key collision the downstream value wins. Valid only when <code>{`repetitions`}</code> is 1 or 0; with more than one UE the engine has no defensible way to choose whose params to keep.</p>
<h3 id="validation">Validation</h3>
<p><code>{`run-suite`}</code> rejects a suite at load time when:</p>
<ul>
<li><code>{`kind`}</code> is set to anything other than <code>{`suite`}</code></li>
<li><code>{`name`}</code> is empty</li>
<li>there are no steps</li>
<li>a step <code>{`name`}</code> is empty or duplicated within the suite</li>
<li>a step <code>{`flow`}</code> is empty (the name itself is not resolved at parse time)</li>
<li>any of <code>{`repetitions`}</code>, <code>{`rate`}</code>, <code>{`duration`}</code>, <code>{`timeout`}</code> is negative</li>
<li>a <code>{`success_when`}</code> sets zero or more than one matcher</li>
<li>a check is missing its <code>{`metric`}</code> or uses a non-numeric <code>{`op`}</code></li>
<li><code>{`carry_params: true`}</code> is set on a step with <code>{`repetitions`}</code> greater than 1</li>
</ul>
<h2 id="examples">Examples</h2>
<h3 id="single-step-smoke">Single-step smoke</h3>
<CodeBlock lang="yaml" code={`kind: suite
name: registration-only
description: Registration flow only, 10 UEs at 1/s.
steps:
  - name: register
    flow: registration
    repetitions: 10
    rate: 1`} />
<h3 id="provision-load-cleanup">Provision → load → cleanup</h3>
<CodeBlock lang="yaml" code={`kind: suite
name: pcc-rule-load-test
description: Install a PCC rule, run a PDU session burst, deregister.
steps:
  - name: install_rule
    flow: rest_fgp_admin_add_pcc_rule_client
  - name: load
    flow: pdu_session_setup
    repetitions: 100
    rate: 10
  - name: cleanup
    flow: deregistration
    repetitions: 100
    always_run: true`} />
<h3 id="per-region-matrix">Per-region matrix</h3>
<CodeBlock lang="yaml" code={`kind: suite
name: register-multi-plmn
description: Register UEs across three PLMNs.
steps:
  - name: us
    flow: registration
    params: { mcc: "001", mnc: "01" }
  - name: eu
    flow: registration
    params: { mcc: "208", mnc: "01" }
  - name: jp
    flow: registration
    params: { mcc: "440", mnc: "00" }`} />
<h2 id="notes">Notes</h2>
<ul>
<li><code>{`flow:`}</code> resolves at runtime, not at parse time. A suite that names a missing flow loads cleanly and fails at the first step that can't resolve.</li>
<li><code>{`params:`}</code> does not propagate between steps unless you set <code>{`carry_params`}</code> — otherwise each step starts fresh.</li>
<li><code>{`gen_subscriber: true`}</code> on one step doesn't affect its siblings; the synthesized subscriber lives only for that step's UEs.</li>
</ul>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/guides/writing">Writing flows and suites</Link> — prose walkthrough of authoring.</li>
<li><Link to="/reference/metrics">Metrics reference</Link> — the metric keys available to <code>{`checks`}</code> and <code>{`final_checks`}</code>.</li>
<li><Link to="/reference/catalogs">Flow &amp; suite catalog</Link> — every shipped flow and suite.</li>
</ul>
    </DocPage>
  );
}
