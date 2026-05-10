import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Mermaid from '../../components/Mermaid';
import { Link } from 'react-router-dom';

export default function Suites() {
  return (
    <DocPage slug="concepts/suites" lede="A suite is an ordered list of flow steps run as one cycle. Each step independently acquires its own subscribers, runs its flow with its own workload, and either continues or aborts the cycle. Suites are the unit of composed tests — a single suite covers &quot;provision policy → run a load burst → tear down policy&quot; cleanly where one flow can't.">
<h2 id="what-a-suite-declares">What a suite declares</h2>
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
<p>Each step picks a flow by name and configures its workload. Per-step settings mirror the engine workload — <code>{`repetitions`}</code>, <code>{`rate`}</code>, <code>{`duration`}</code>, <code>{`timeout`}</code>, <code>{`params`}</code>, <code>{`trace`}</code>, <code>{`gen_subscriber`}</code> — plus two suite-only fields (<code>{`stop_on_failure`}</code>, <code>{`always_run`}</code>) that govern step ordering.</p>
<h2 id="cycles">Cycles</h2>
<p>The suite runner repeats the full step list N times — each repetition is a <em>cycle</em>. The CLI exposes the outer-loop knobs:</p>
<CodeBlock lang="bash" code={`fluxproto-light run-suite -suite gnb-register-deregister \\
    -repetitions 5 \\
    -duration 10m \\
    -timeout 30s`} />
<p><code>{`-rate`}</code> is rejected at the suite level — suites are strictly serial in v1. Per-step rate lives in the suite YAML.</p>
<p>Each cycle produces:</p>
<ul>
<li>One <code>{`SuiteReportEntity`}</code> (cycle-level summary)</li>
<li>One child <code>{`ReportEntity`}</code> per executed step (the same shape as a standalone <code>{`run-flow`}</code> report)</li>
</ul>
<p>One cycle of a typical provision/load/cleanup suite, end to end:</p>
<Mermaid code={`flowchart LR
    Start([Cycle start]) --> S1["install_pcc<br/><span style='font-size:10px'>flow: install_rule</span>"]
    S1 -->|pass| S2["load_test<br/><span style='font-size:10px'>flow: pdu_session_setup<br/>repetitions: 100</span>"]
    S1 -->|fail + stop_on_failure| Cleanup
    S2 -->|pass| Cleanup["cleanup<br/><span style='font-size:10px'>flow: delete_rule<br/>always_run: true</span>"]
    S2 -->|fail + stop_on_failure| Cleanup
    Cleanup --> End([Cycle done])

    classDef step fill:#1a1a1f,stroke:#3b82f6,stroke-width:1.5px,color:#ededf0
    classDef finally fill:#1a1a1f,stroke:#10b981,stroke-width:1.5px,color:#ededf0
    classDef edge fill:#131217,stroke:#2a2a30,color:#a1a1aa
    class S1,S2 step
    class Cleanup finally
    class Start,End edge`} />
<h2 id="stop_on_failure">stop_on_failure</h2>
<p>Default <code>{`true`}</code>. If a step's <code>{`EngineResult.AllPassed`}</code> is false, the cycle aborts before the next non-<code>{`always_run`}</code> step. The aborted cycle's <code>{`SuiteResult.Aborted`}</code> is true; CI gets a non-zero exit.</p>
<p>Override with <code>{`stop_on_failure: false`}</code> for steps that are expected to fail intermittently:</p>
<CodeBlock lang="yaml" code={`- name: noisy_negative_test
  flow: malformed_nas
  stop_on_failure: false
- name: real_thing
  flow: registration`} />
<h2 id="always_run">always_run</h2>
<p>A step marked <code>{`always_run: true`}</code> executes even after the cycle aborted earlier. The try/finally pattern: install policy → run load → tear down policy, where teardown runs even if load failed.</p>
<CodeBlock lang="yaml" code={`steps:
  - name: install_pcc
    flow: rest_fgp_admin_add_pcc_rule_client
  - name: load_test
    flow: pdu_session_setup
    repetitions: 100
  - name: cleanup
    flow: rest_fgp_admin_delete_pcc_rule_client
    always_run: true`} />
<p><code>{`always_run`}</code> still respects context cancellation (Ctrl+C, deadline) — if you really need to abort, the cleanup step is skipped.</p>
<h2 id="subscribers-across-steps">Subscribers across steps</h2>
<p>Each step independently acquires its own subscribers from the pool. <code>{`repetitions: 5`}</code> on step 1 takes 5 subscribers, releases them at the end of the step, then step 2 takes 5 fresh ones. There is no subscriber sharing across steps in v1.</p>
<p>Implication: provision enough subscribers for the largest step's <code>{`repetitions`}</code> (or use <code>{`gen_subscriber: true`}</code> to synthesize per-UE in memory).</p>
<h2 id="when-to-use-a-suite-vs-multiple-flows">When to use a suite vs multiple flows</h2>
<p>Use a suite when:</p>
<ul>
<li>The composition is meaningful — provision/load/cleanup, register-then-deregister, attach-then-handover-then-detach.</li>
<li>You want one report per cycle covering all the steps.</li>
<li>You need cleanup steps that run even on upstream failure.</li>
</ul>
<p>Use multiple back-to-back <code>{`run-flow`}</code> calls when:</p>
<ul>
<li>The composition is just "run these in any order, gate on each independently".</li>
<li>The steps don't share a meaningful cycle.</li>
</ul>
<h2 id="what-you-dont-write">What you don't write</h2>
<p>Notably absent from the suite model: no inter-step state passing in v1. You can't extract a value from one step and feed it to the next. If you need that level of composition, write one bigger flow that drives the cross-step procedure directly — flows can mutate UE state across multiple states cleanly.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/guides/writing">Writing suites guide</Link> — full how-to</li>
<li><Link to="/guides/running">Running suites guide</Link> — invocation, exit codes</li>
<li><Link to="/reference/suite-schema">Suite schema reference</Link> — every field</li>
<li><Link to="/reference/catalogs">Suite catalog</Link> — what ships</li>
</ul>
    </DocPage>
  );
}
