import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Mermaid from '../../components/Mermaid';
import { Link } from 'react-router-dom';

export default function Flows() {
  return (
    <DocPage slug="concepts/flows" lede="A flow is the unit fluxproto-light executes. It encodes one protocol procedure as a finite-state machine in YAML. This page is the conceptual core of the docs — read it first, then States and transitions, then Actions.">
<h2 id="the-shape-of-a-procedure">The shape of a procedure</h2>
<p>5G/4G procedures share the same cadence: wait for an event, check it, send the next message. Registration walks from an initial UE message through authentication and security activation to a registered state, as the diagram below shows. PDU session establishment, deregistration, paging, and handover all follow the same pattern.</p>
<p>A finite-state machine captures that cadence directly. Each state is a "wait for" point. Each transition out of the state is an "if X happens, do Y, go to Z" rule. The whole procedure is a directed graph from <code>{`initial_state`}</code> to one of the <code>{`final_states`}</code>.</p>
<Mermaid code={`stateDiagram-v2
    [*] --> idle
    idle --> wait_auth_request: Start / send InitialUEMessage
    wait_auth_request --> wait_security_mode: NASDownlinkTransport.AuthenticationRequest / send AuthResponse
    wait_security_mode --> wait_context_setup: NASDownlinkTransport.SecurityModeCommand / send SecurityModeComplete
    wait_context_setup --> registered: InitialContextSetupRequest.RegistrationAccept / send InitialContextSetupResponse, RegistrationComplete
    wait_auth_request --> failed: on_timeout 10s
    wait_security_mode --> failed: on_timeout 10s
    wait_context_setup --> failed: on_timeout 10s
    registered --> [*]
    failed --> [*]`} />
<p>That diagram is the shipped <code>{`templates/gnb/registration.yaml`}</code>. Every box, arrow, label is one line of YAML.</p>
<h2 id="what-a-flow-declares">What a flow declares</h2>
<CodeBlock lang="yaml" code={`kind: flow
name: registration
description: 5G UE initial registration with auth and security activation
type: client                         # 'client' or 'server' — see below
protocol: ngap                       # the wire protocol
nf: gnb                              # which network function this simulates
initial_state: idle
final_states: [registered, failed]
states:
  idle:        { transitions: [...] }
  wait_auth_request: { transitions: [...] }
  ...
any_state_transitions: [...]         # global fallback, e.g. on Error → failed`} />
<p>The full schema reference is at <Link to="/reference/flow-schema">Flow schema reference</Link>. This page covers the conceptual pieces — the next two pages dive into <Link to="/concepts/flows/states">states and transitions</Link> and <Link to="/concepts/flows/actions">actions</Link>.</p>
<h2 id="client-vs-server-flows">Client vs server flows</h2>
<p>Same FSM model, different trigger.</p>
<p><strong>Client-mode flows</strong> initiate the procedure. The engine fires a synthetic <code>{`Start`}</code> event into the FSM's <code>{`initial_state`}</code>, which dispatches the first <code>{`send`}</code>. Most NGAP gNB-side flows and Diameter MME-side flows are client-mode.</p>
<p><strong>Server-mode flows</strong> wait for a peer to send the first message. No <code>{`Start`}</code> event; the FSM auto-spawns when the inbound demux receives a matching message at <code>{`initial_state`}</code>. There must be at least one transition at <code>{`initial_state`}</code> whose event matches an inbound RX message. The shipped <code>{`templates/amf/registration_amf.yaml`}</code>, <code>{`templates/sbi/nudm_sdm_get_server.yaml`}</code>, and <code>{`templates/rest/fgp_admin_server.yaml`}</code> are the canonical examples.</p>
<p>The engine validates this at flow-load: client flows must have a <code>{`Start`}</code>-event transition out of <code>{`initial_state`}</code>; server flows must not. Mistakes fail fast.</p>
<h2 id="per-ue-state-per-flow-context">Per-UE state, per-flow context</h2>
<p>When a flow starts for one UE, the engine creates a <code>{`UEContext`}</code> carrying that UE's subscriber, its FSM state, its message log, and a <code>{`Params`}</code> map for ad-hoc state. A hundred concurrent UEs each have their own <code>{`UEContext`}</code> — checks, extracts, and sends all read/write the right one without explicit author intervention.</p>
<p>UEs running the same flow share a flow context that holds aggregate metrics and per-flow handover state, but UE-level state is isolated. The <code>{`UEContext`}</code> is the surface the flow author thinks in, addressed through <code>{`ue.`}</code> paths (<code>{`ue.AmfUeNgapId`}</code>, <code>{`ue.SecCtx`}</code>, <code>{`ue.Params.&lt;key&gt;`}</code>).</p>
<h2 id="what-runs-at-flow-time">What runs at flow time</h2>
<p>When you run <code>{`run-flow -flow registration`}</code>, the engine:</p>
<ol>
<li>Looks up <code>{`registration`}</code> in the catalog.</li>
<li>Parses the YAML into a state machine and validates it.</li>
<li>Pre-parses each <code>{`send`}</code> — its <code>{`message_body`}</code> JSON is loaded into the typed message prototype, and every <code>{`{{...}}`}</code> template is compiled.</li>
<li>For each UE the workload calls for (<code>{`-repetitions`}</code>, <code>{`-rate`}</code>, <code>{`-duration`}</code>), creates a <code>{`UEContext`}</code> and dispatches a <code>{`Start`}</code> event.</li>
<li>As inbound events arrive, matches each against the current state's transitions, executes the matching transition's actions, and advances. This repeats until the UE reaches a final state.</li>
<li>Persists a report entry and exits.</li>
</ol>
<p>Authoring a flow means declaring the data for steps 3 and 4. Everything else is the engine's job.</p>
<h2 id="why-yaml">Why YAML</h2>
<p>A hand-coded state machine would be perfectly precise — and unmaintainable for the test engineers who write hundreds of these. YAML makes the structure obvious at a glance: every state visible, every transition visible, every action visible. New flows are typically copy-paste-edit from a sibling. The schema is enforced at load time — bad YAML never reaches the engine.</p>
<p>The cost is that some procedures don't fit the FSM model cleanly (anything with arbitrary loops or unbounded state). For those, drive multiple flows back-to-back via a <Link to="/concepts/suites">suite</Link>.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/concepts/flows/states">States and transitions</Link> — the building blocks: states, transitions, events, and timeouts.</li>
<li><Link to="/concepts/flows/actions">Actions and checks</Link> — what happens inside a transition: the six action types and the check operators.</li>
<li><Link to="/tutorials/first-yaml-flow">Tutorial: Your first YAML flow</Link> — author one yourself.</li>
<li><Link to="/reference/flow-schema">Flow schema reference</Link> — every field.</li>
<li>Browse the shipped flows in the <a href="https://github.com/dflux-io/fluxproto-light-templates">templates repository</a>, or see the full <Link to="/reference/catalogs">flow and suite catalog</Link>.</li>
</ul>
    </DocPage>
  );
}
