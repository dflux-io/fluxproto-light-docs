import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function FirstServerFlow() {
  return (
    <DocPage slug="tutorials/first-server-flow" lede="By the end of this tutorial you will have run two fluxproto-light processes against each other on localhost: one acting as an AMF (server-mode registration_amf flow), the other as a gNB (client-mode registration flow). Server-mode flows wait for the first inbound message and auto-spawn — no Start event, no -repetitions setting on the AMF side. Use server-mode flows for vendor-side wiring tests and conformance harnesses against a real gNB.">
<h2 id="prerequisites">Prerequisites</h2>
<ul>
<li>You completed the <Link to="/introduction/quickstart">Quickstart</Link> and <Link to="/tutorials/first-yaml-flow">Your first YAML flow</Link>.</li>
<li>Two terminals open in this repo.</li>
<li>The shipped flows on disk. They live in the sibling templates repository — <a href="https://github.com/dflux-io/fluxproto-light-templates">fluxproto-light-templates</a> — which these commands reference with <code>{`-templates ../fluxproto-light-templates`}</code>.</li>
</ul>
<h2 id="step-1-author-an-amf-side-env">Step 1 — Author an AMF-side env</h2>
<p>The shipped <code>{`lab.yaml`}</code> declares one gNB. We need a sibling env with one AMF binding. Create <code>{`config/lab-amf-server.yaml`}</code>:</p>
<CodeBlock lang="yaml" code={`nfs:
  - name: amf-server
    role: amf
    plmn: { mcc: "901", mnc: "70" }
    transport: ngap-listen
    amf:
      served_guami:
        plmn: { mcc: "901", mnc: "70" }
        amf_region_id: 1
        amf_set_id: 1
        amf_pointer: 0

transports:
  ngap-listen:
    protocol: ngap
    ngap:
      mode: server
      local_sctp: "127.0.0.1"`} />
<p><code>{`mode: server`}</code> flips the NGAP transport into AMF-mode: bind <code>{`local_sctp`}</code> and accept inbound gNB associations.</p>
<h2 id="step-2-point-the-gnb-at-localhost">Step 2 — Point the gNB at localhost</h2>
<p>Copy <code>{`config/lab.yaml`}</code> to <code>{`config/lab-localhost.yaml`}</code> and point the gNB at the AMF you'll run in the next step. The shipped <code>{`lab.yaml`}</code> dials a real peer (<code>{`192.168.1.139:38412`}</code>), so you are overriding that address with localhost here — Step 4 runs against the copy:</p>
<CodeBlock lang="yaml" code={`transports:
  ngap-out:
    protocol: ngap
    ngap:
      mode: client
      local_sctp: "0.0.0.0"
      peers:
        - { address: "127.0.0.1", port: 38412 }`} />
<h2 id="step-3-start-the-amf-side-flow">Step 3 — Start the AMF-side flow</h2>
<p>Terminal 1:</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-flow \\
    -flow registration_amf \\
    -templates ../fluxproto-light-templates \\
    -c config/lab-amf-server.yaml \\
    -duration 60s`} />
<p>Server-mode flows exit on context cancel — the <code>{`-duration 60s`}</code> gives you a minute to drive a client at it. The engine first syncs the templates directory, then starts the flow:</p>
<CodeBlock lang="" code={`  Templates loaded from ../fluxproto-light-templates: flows 278 total (+278/~0/-0, 0 skipped), suites 21 total (+21/~0/-0, 0 skipped)
==> Flow: registration_amf`} />
<h2 id="step-4-drive-a-registration-from-the-gnb-side">Step 4 — Drive a registration from the gNB side</h2>
<p>Terminal 2:</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-flow \\
    -flow registration \\
    -templates ../fluxproto-light-templates \\
    -c config/lab-localhost.yaml \\
    -s config/subscribers.yaml \\
    -trace`} />
<p>Watch terminal 1 — you'll see the AMF flow auto-spawn on inbound <code>{`InitialUEMessage`}</code>, send a <code>{`UEContextReleaseCommand`}</code>, and land in <code>{`released`}</code>. The shipped <code>{`registration_amf`}</code> flow is intentionally minimal (wiring-validation only); it doesn't drive the full registration handshake. The gNB-side <code>{`registration`}</code> flow will time out waiting for <code>{`AuthenticationRequest`}</code> because the AMF stub never sends one.</p>
<h2 id="step-5-stop-the-amf-flow">Step 5 — Stop the AMF flow</h2>
<p>Either wait for <code>{`-duration 60s`}</code> to elapse, or hit Ctrl+C in terminal 1. The flow exits cleanly and writes its report.</p>
<h2 id="step-6-inspect-both-reports">Step 6 — Inspect both reports</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light report list`} />
<p>Two reports — one for <code>{`registration_amf`}</code> (server-mode, one execution started by inbound TX), one for <code>{`registration`}</code> (client-mode, one UE timed out waiting for auth). Open either with <code>{`report &lt;id&gt;`}</code> to see the per-step log.</p>
<h2 id="what-you-built">What you built</h2>
<p>You ran fluxproto-light as an AMF, accepted an inbound gNB association, and traced a full <code>{`InitialUEMessage`}</code> → <code>{`UEContextReleaseCommand`}</code> exchange. Server-mode is the same FSM model as client-mode — only the trigger differs (first inbound vs <code>{`Start`}</code> event). The shipped <code>{`registration_amf`}</code> flow is wiring-validation only: no auth, no security mode, no real registration accept.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/concepts/architecture">Architecture</Link> — how server-mode admission, auto-spawn, and FSM dispatch fit together.</li>
<li><Link to="/guides/multi-protocol-flows">Multi-protocol flows</Link> — drive more than one wire protocol from a single run.</li>
<li><Link to="/reference/flow-schema">Flow schema reference</Link> — the full field set for authoring your own flows.</li>
</ul>
    </DocPage>
  );
}
