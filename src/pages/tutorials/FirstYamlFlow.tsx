import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function FirstYamlFlow() {
  return (
    <DocPage slug="tutorials/first-yaml-flow">
<h1>Your first YAML flow</h1>
<p>By the end of this tutorial you will have copied the shipped <code>{`registration`}</code> template, modified one transition to fail the flow on a different condition, and watched the resulting path land in <code>{`failed`}</code> instead of <code>{`registered`}</code>. The point is to put your hands on the YAML schema before reading the full reference.</p>
<h2 id="prerequisites">Prerequisites</h2>
<ul>
<li>You completed the <Link to="/introduction/quickstart">Quickstart</Link> and have <code>{`bin/fluxproto-light`}</code> working.</li>
<li>An AMF reachable from the lab — same as the previous tutorial.</li>
</ul>
<h2 id="step-1-copy-the-shipped-template">Step 1 — Copy the shipped template</h2>
<CodeBlock lang="bash" code={`mkdir -p my-templates
cp templates/gnb/registration.yaml my-templates/registration_strict.yaml`} />
<p>Open <code>{`my-templates/registration_strict.yaml`}</code>. Notice the shape: <code>{`kind: flow`}</code>, <code>{`type: client`}</code>, <code>{`protocol: ngap`}</code>, <code>{`nf: gnb`}</code>, <code>{`initial_state: idle`}</code>, <code>{`final_states: [registered, failed]`}</code>. Each <code>{`state:`}</code> has <code>{`transitions`}</code> keyed by <code>{`event:`}</code>.</p>
<h2 id="step-2-rename-the-flow">Step 2 — Rename the flow</h2>
<p>The templates loader keys flows by name. Change the <code>{`name:`}</code> field so your edit doesn't collide with the shipped <code>{`registration`}</code> flow:</p>
<CodeBlock lang="yaml" code={`kind: flow
name: registration_strict
description: Tighter 5G registration — fail if security_key is empty (YAML)`} />
<h2 id="step-3-tighten-a-check">Step 3 — Tighten a check</h2>
<p>In the <code>{`wait_context_setup`}</code> state, the shipped flow asserts <code>{`security_key`}</code> is <code>{`not_empty`}</code> before sending <code>{`InitialContextSetupResponse`}</code>. Make the failure noisier — add an extra check that fails on purpose so you can watch the FSM land in <code>{`failed`}</code>:</p>
<CodeBlock lang="yaml" code={`  wait_context_setup:
    on_timeout:
      duration: 10s
      target: failed
    transitions:
      - event: InitialContextSetupRequest.RegistrationAccept
        target: registered
        actions:
          - type: check
            field: security_key
            op: not_empty
          - type: check
            field: ue.AmfUeNgapId
            op: equals
            expected: 0   # this will fail — real AMF returns nonzero
          - type: send
            message: InitialContextSetupResponse
          - type: send
            message: RegistrationComplete`} />
<p>A check failing in the middle of a transition aborts that transition. The flow then has no path forward and times out into <code>{`failed`}</code>.</p>
<h2 id="step-4-run-your-modified-flow">Step 4 — Run your modified flow</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-flow \\
    -flow registration_strict \\
    -templates my-templates \\
    -c config/lab.yaml \\
    -s config/subscribers.yaml \\
    -trace`} />
<p>Expected:</p>
<CodeBlock lang="" code={`==> Flow: registration_strict
    Result: FAIL
    Duration: 10.1s
    Final state: failed`} />
<p>The 10-second pause is the <code>{`on_timeout: 10s → failed`}</code> from <code>{`wait_context_setup`}</code> — the failed check left the FSM stuck in that state.</p>
<h2 id="step-5-make-it-pass-again">Step 5 — Make it pass again</h2>
<p>Loosen the check back to something that holds:</p>
<CodeBlock lang="yaml" code={`          - type: check
            field: ue.AmfUeNgapId
            op: not_empty`} />
<p>Re-run — the flow now lands in <code>{`registered`}</code>.</p>
<h2 id="step-6-inspect-the-catalog-entry">Step 6 — Inspect the catalog entry</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light flow info registration_strict -templates my-templates`} />
<p>Confirms the flow loaded, prints the YAML, and shows the high-level metadata fields the daemon and web UI surface.</p>
<h2 id="what-you-built">What you built</h2>
<p>You wrote your first custom flow without writing Go. You've seen how a single check op (<code>{`equals`}</code>, <code>{`not_empty`}</code>, <code>{`greater_than`}</code>, ...) determines whether a transition fires, and how <code>{`on_timeout`}</code> is the safety net that always exists on every state. The full schema — every action type, every check op, the template syntax for <code>{`{{...}}`}</code> — is in <Link to="/reference/flow-schema">reference/flow-schema.md</Link>.</p>
    </DocPage>
  );
}
