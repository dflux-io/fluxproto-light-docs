import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function FirstYamlFlow() {
  return (
    <DocPage slug="tutorials/first-yaml-flow" lede="By the end of this tutorial you will have copied the shipped registration flow, modified one transition to fail on a different condition, and watched the resulting run land in failed instead of registered. The point is to put your hands on the YAML schema before reading the full reference.">
<h2 id="prerequisites">Prerequisites</h2>
<ul>
<li>You completed the <Link to="/introduction/quickstart">Quickstart</Link> and have <code>{`bin/fluxproto-light`}</code> working.</li>
<li>An AMF reachable from the lab — same as the previous tutorial.</li>
<li>The <a href="https://github.com/dflux-io/fluxproto-light-templates">fluxproto-light-templates</a> repository checked out alongside this one. The examples below assume it sits at <code>{`../fluxproto-light-templates`}</code>, the same path the Quickstart used.</li>
</ul>
<h2 id="step-1-copy-the-shipped-flow">Step 1 — Copy the shipped flow</h2>
<p>The shipped flows live in the templates repository, one YAML file per flow, grouped by network function. Copy the gNB registration flow into a working directory of your own so your edits don't touch the originals:</p>
<CodeBlock lang="bash" code={`mkdir -p my-templates
cp ../fluxproto-light-templates/gnb/registration.yaml my-templates/registration_strict.yaml`} />
<p>Open <code>{`my-templates/registration_strict.yaml`}</code>. Notice the shape: <code>{`kind: flow`}</code>, <code>{`type: client`}</code>, <code>{`protocol: ngap`}</code>, <code>{`nf: gnb`}</code>, <code>{`initial_state: idle`}</code>, <code>{`final_states: [registered, failed]`}</code>. Each entry under <code>{`states:`}</code> has <code>{`transitions`}</code> keyed by <code>{`event:`}</code>.</p>
<h2 id="step-2-rename-the-flow">Step 2 — Rename the flow</h2>
<p>The templates loader keys flows by name. Change the <code>{`name:`}</code> field so your edit doesn't collide with the shipped <code>{`registration`}</code> flow:</p>
<CodeBlock lang="yaml" code={`kind: flow
name: registration_strict
description: Tighter 5G registration — fail if security_key is empty (YAML)`} />
<h2 id="step-3-tighten-a-check">Step 3 — Tighten a check</h2>
<p>In the <code>{`wait_context_setup`}</code> state, the shipped flow already asserts that <code>{`security_key`}</code> and <code>{`ue.AmfUeNgapId`}</code> are both <code>{`not_empty`}</code> before sending <code>{`InitialContextSetupResponse`}</code>. Add one more check that fails on purpose so you can watch the run land in <code>{`failed`}</code> — assert that <code>{`ue.AmfUeNgapId`}</code> equals <code>{`0`}</code>, which a real AMF never returns:</p>
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
            op: not_empty
          - type: check
            field: ue.AmfUeNgapId
            op: equals
            expected: 0   # this will fail — a real AMF returns nonzero
          - type: send
            message: InitialContextSetupResponse
          - type: send
            message: RegistrationComplete`} />
<p>When a check fails, the engine fails the flow immediately. It does not abort just the transition and wait — the run completes right away with a result of <code>{`failed`}</code>, in well under a second. The <code>{`on_timeout`}</code> on this state never fires.</p>
<h2 id="step-4-run-your-modified-flow">Step 4 — Run your modified flow</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-flow \\
    -flow registration_strict \\
    -templates my-templates \\
    -c config/lab.yaml \\
    -s config/subscribers.yaml \\
    -trace`} />
<p>Expected — the failing <code>{`equals`}</code> check ends the run almost instantly:</p>
<CodeBlock lang="" code={`  Flow:      registration_strict
  Duration:  142ms
  Succeeded: 0
  Failed:    1
  Success:   0.0%
  TX msgs:   3
  RX msgs:   3

  RESULT: FAIL`} />
<p>The duration is a fraction of a second, not the 10s <code>{`on_timeout`}</code> window. The failed check fails the flow on the spot, so the timer on <code>{`wait_context_setup`}</code> is never given the chance to fire. Add <code>{`-trace`}</code>, as above, to see each check and send logged in order up to the one that fails.</p>
<h2 id="step-5-make-it-pass-again">Step 5 — Make it pass again</h2>
<p>Change the check you added in Step 3 to one that holds — assert that <code>{`ue.AmfUeNgapId`}</code> is non-empty instead of equal to zero:</p>
<CodeBlock lang="yaml" code={`          - type: check
            field: ue.AmfUeNgapId
            op: not_empty`} />
<p>Re-run the same command. With every check passing, all four actions in the transition fire and the flow lands in <code>{`registered`}</code> with a result of <code>{`PASS`}</code>.</p>
<h2 id="step-6-inspect-the-catalog-entry">Step 6 — Inspect the catalog entry</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light flow info registration_strict -templates my-templates`} />
<p>This confirms the flow loaded, prints the YAML, and shows the high-level metadata fields (name, type, protocol, NF, category) that the daemon and web UI surface.</p>
<h2 id="what-you-built">What you built</h2>
<p>You wrote your first custom flow without writing Go. You've seen how a single check op (<code>{`equals`}</code>, <code>{`not_empty`}</code>, <code>{`greater_than`}</code>, and the rest) determines whether a transition fires and that a failed check fails the run on the spot. The full schema — every action type, every check op, the template syntax for <code>{`{{...}}`}</code> — is in the <Link to="/reference/flow-schema">flow schema reference</Link>.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li>Build the other side of the wire in <Link to="/tutorials/first-server-flow">your first server flow</Link>.</li>
<li>Work through the full set of editing patterns in <Link to="/guides/writing">writing flows</Link>.</li>
<li>Read how a failed check propagates through the state machine in <Link to="/concepts/flows/actions">actions and checks</Link>.</li>
</ul>
    </DocPage>
  );
}
