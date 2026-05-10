import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function SuiteSchema() {
  return (
    <DocPage slug="reference/suite-schema">
<h1>Suite schema reference</h1>
<p>Authoritative schema for <code>{`kind: suite`}</code> YAML. Suites compose flows into ordered, serial runs. For prose, see <Link to="/guides/writing">writing-suites</Link>.</p>
<h2 id="synopsis">Synopsis</h2>
<CodeBlock lang="yaml" code={`kind: suite
name: gnb-register-deregister
description: Register a small batch of UEs, then deregister.
steps:
  - name: register
    flow: registration
    repetitions: 5
  - name: deregister
    flow: deregistration
    repetitions: 5
    always_run: true`} />
<h2 id="top-level-fields">Top-level fields</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`kind`}</code></td><td>string</td><td>no</td><td>—</td><td><code>{`suite`}</code>. Optional but required by the templates loader.</td></tr>
<tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>—</td><td>Unique suite name. Looked up by <code>{`run-suite -suite &lt;name&gt;`}</code>.</td></tr>
<tr><td><code>{`description`}</code></td><td>string</td><td>no</td><td>—</td><td>One-line summary; surfaced in <code>{`suite list`}</code>.</td></tr>
<tr><td><code>{`category`}</code></td><td>string</td><td>no</td><td>—</td><td>Free-form label for catalog filtering.</td></tr>
<tr><td><code>{`steps`}</code></td><td>[]SuiteStep</td><td>yes</td><td>—</td><td>Ordered list. At least one.</td></tr></tbody>
</table>
<h2 id="per-step-fields">Per-step fields</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>—</td><td>Step name; unique within the suite. Surfaced on each child report.</td></tr>
<tr><td><code>{`flow`}</code></td><td>string</td><td>yes</td><td>—</td><td>Flow name. Resolved lazily at runtime against the DB catalog.</td></tr>
<tr><td><code>{`repetitions`}</code></td><td>int</td><td>no</td><td>1</td><td>UEs to spawn for this step.</td></tr>
<tr><td><code>{`rate`}</code></td><td>float</td><td>no</td><td>0</td><td>UEs/s within this step (0 = burst).</td></tr>
<tr><td><code>{`duration`}</code></td><td>duration</td><td>no</td><td>0</td><td>Stop spawning UEs after this elapses.</td></tr>
<tr><td><code>{`timeout`}</code></td><td>duration</td><td>no</td><td>inherited from cycle</td><td>Per-UE flow timeout.</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td>nil</td><td>Overlay merged into each UE's per-flow params.</td></tr>
<tr><td><code>{`trace`}</code></td><td>bool</td><td>no</td><td>false</td><td>Hex dump TX/RX + JSON trace for this step (OR'd with the suite-level CLI <code>{`-trace`}</code>).</td></tr>
<tr><td><code>{`gen_subscriber`}</code></td><td>bool</td><td>no</td><td>false</td><td>Synthesize subscribers per UE; OR'd with the CLI <code>{`-gen-subscriber`}</code>.</td></tr>
<tr><td><code>{`stop_on_failure`}</code></td><td>bool</td><td>no</td><td>true</td><td>When <code>{`false`}</code>, the cycle continues to the next step even if this step fails.</td></tr>
<tr><td><code>{`always_run`}</code></td><td>bool</td><td>no</td><td>false</td><td>When <code>{`true`}</code>, this step runs even after a prior step aborted the cycle (try/finally).</td></tr></tbody>
</table>
<h2 id="execution-semantics">Execution semantics</h2>
<ul>
<li>Steps run in YAML order, strictly serial — no parallelism.</li>
<li>Each step independently acquires its own subscribers from the pool; subscribers are not shared across steps.</li>
<li>Each cycle generates one <code>{`SuiteReportEntity`}</code> plus one child <code>{`ReportEntity`}</code> per executed step.</li>
<li>The runner repeats the full step list <code>{`cfg.Workload.Repetitions`}</code> times, or until <code>{`cfg.Workload.Duration`}</code> elapses.</li>
<li>Rate at the suite level is rejected — the CLI errors out if <code>{`-rate`}</code> is passed to <code>{`run-suite`}</code>.</li>
</ul>
<h3 id="default-stop_on_failure-true">Default <code>{`stop_on_failure: true`}</code></h3>
<p>When a step's <code>{`EngineResult.AllPassed`}</code> is false, the cycle aborts before the next non-<code>{`always_run`}</code> step. The aborted cycle's <code>{`SuiteResult.Aborted`}</code> is true.</p>
<h3 id="always_run-true"><code>{`always_run: true`}</code></h3>
<p>A step marked <code>{`always_run: true`}</code> executes even when the cycle has aborted earlier. Use for cleanup steps. Note: an <code>{`always_run`}</code> step still respects context cancellation — Ctrl+C or a deadline still skips it.</p>
<h3 id="validation">Validation</h3>
<ul>
<li><code>{`name`}</code> is required and unique within the suite</li>
<li><code>{`flow`}</code> is required (but not resolved at parse time)</li>
<li><code>{`repetitions`}</code>, <code>{`rate`}</code>, <code>{`duration`}</code>, <code>{`timeout`}</code> must all be <code>{`&gt;= 0`}</code></li>
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
description: Install a PCC rule, run a PDU session burst, remove the rule.
steps:
  - name: install_rule
    flow: rest_fgp_admin_add_pcc_rule_client
  - name: load
    flow: pdu_session_setup
    repetitions: 100
    rate: 10
  - name: remove_rule
    flow: rest_fgp_admin_delete_pcc_rule_client
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
<li><code>{`params:`}</code> does not propagate between steps — each step starts fresh.</li>
<li><code>{`gen_subscriber: true`}</code> on one step doesn't pollute siblings; the in-memory subscriber lives only for that step's UEs.</li>
<li>The default <code>{`stop_on_failure: true`}</code> is encoded as a pointer-to-bool in Go so the YAML parser distinguishes "not set" from "set false". Authors don't need to think about this — omit the field for default behaviour.</li>
</ul>
    </DocPage>
  );
}
