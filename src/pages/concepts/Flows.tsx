import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Mermaid from '../../components/Mermaid';
import { Link } from 'react-router-dom';

export default function Flows() {
  return (
    <DocPage slug="concepts/flows">
<h1>Flows</h1>
<p>A flow is the unit fluxproto-light executes. It encodes one protocol procedure as a finite-state machine in YAML. This page is the conceptual core of the docs — read it first, then <Link to="/concepts/flows">States and transitions</Link>, then <Link to="/concepts/flows">Actions</Link>.</p>
<h2 id="the-shape-of-a-procedure">The shape of a procedure</h2>
<p>5G/4G procedures share the same cadence: wait for an event, check it, send the next message. Registration is <code>{`Start → InitialUEMessage → wait AuthRequest → check + AuthResponse → wait SecurityModeCommand → check + SecurityModeComplete → wait RegistrationAccept → check + InitialContextSetupResponse + RegistrationComplete → registered`}</code>. PDU session establishment, deregistration, paging, handover all follow the same pattern.</p>
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
<p>The full schema reference is at <Link to="/reference/flow-schema">reference/flow-schema.md</Link>. This page covers the conceptual pieces — the next two pages dive into <Link to="/concepts/flows">states/transitions</Link> and <Link to="/concepts/flows">actions</Link>.</p>
<h2 id="client-vs-server-flows">Client vs server flows</h2>
<p>Same FSM model, different trigger.</p>
<p><strong>Client-mode flows</strong> initiate the procedure. The engine fires a synthetic <code>{`Start`}</code> event into the FSM's <code>{`initial_state`}</code>, which dispatches the first <code>{`send`}</code>. Most NGAP gNB-side flows and Diameter MME-side flows are client-mode.</p>
<p><strong>Server-mode flows</strong> wait for a peer to send the first message. No <code>{`Start`}</code> event; the FSM auto-spawns when the inbound demux receives a matching message at <code>{`initial_state`}</code>. There must be at least one transition at <code>{`initial_state`}</code> whose event matches an inbound RX message. The shipped <code>{`templates/amf/registration_amf.yaml`}</code>, <code>{`templates/sbi/nudm_sdm_get_server.yaml`}</code>, and <code>{`templates/rest/fgp_admin_server.yaml`}</code> are the canonical examples.</p>
<p>The engine validates this at flow-load: client flows must have a <code>{`Start`}</code>-event transition out of <code>{`initial_state`}</code>; server flows must not. Mistakes fail fast.</p>
<h2 id="per-ue-state-per-flow-context">Per-UE state, per-flow context</h2>
<p>When a flow starts for one UE, the engine creates a <code>{`UEContext`}</code> carrying that UE's subscriber, its FSM state, its message log, and a <code>{`Params`}</code> map for ad-hoc state. A hundred concurrent UEs each have their own <code>{`UEContext`}</code> — checks, extracts, and sends all read/write the right one without explicit author intervention.</p>
<p>UEs running the same flow share a <em>flow context</em> (<code>{`FlowContext`}</code>) that holds aggregate metrics and per-flow handover state, but UE-level state is isolated. The <code>{`UEContext`}</code> is the surface the FSM author thinks in (<code>{`ue.AmfUeNgapId`}</code>, <code>{`ue.SecCtx`}</code>, <code>{`ue.Params.&lt;key&gt;`}</code>).</p>
<h2 id="what-runs-at-flow-time">What runs at flow time</h2>
<p>When you <code>{`run-flow -flow registration`}</code>:</p>
<ol>
<li>The engine looks up <code>{`registration`}</code> in the catalog (DB-backed).</li>
<li>Re-parses the YAML into an <code>{`*fsm.FSM`}</code>, validates it.</li>
<li>Runs <code>{`PreparseFSM`}</code> — every <code>{`send`}</code>'s <code>{`message_body`}</code> JSON is unmarshalled into the typed prototype struct, every <code>{`{{...}}`}</code> template is compiled.</li>
<li>For each UE per the workload (<code>{`-repetitions`}</code>, <code>{`-rate`}</code>, <code>{`-duration`}</code>), creates a <code>{`UEContext`}</code> and dispatches <code>{`Start`}</code>.</li>
<li>As inbound events arrive, calls <code>{`Dispatch(fsm, state, event)`}</code> — looks up a matching transition, executes its actions, advances state. Repeats until a final state.</li>
<li>Persists a <code>{`ReportEntity`}</code> and exits.</li>
</ol>
<p>Authoring a flow means declaring step 3-4's data. Everything else is the engine's job.</p>
<h2 id="why-yaml">Why YAML</h2>
<p>A Go-coded FSM would be perfectly precise — and unmaintainable for the test engineers who need to write hundreds of these. YAML makes the structure obvious to readers who don't know the codebase: every state visible, every transition visible, every action visible. New flows are typically copy-paste-edit from a sibling. The schema lives in <code>{`fpl/fsm/fsm.go`}</code> and is enforced at load time — bad YAML never reaches the engine.</p>
<p>The cost is that some procedures don't fit the FSM model cleanly (anything with arbitrary loops or unbounded state). For those, drive multiple flows back-to-back via a <Link to="/concepts/suites">suite</Link>.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/concepts/flows">States and transitions</Link> — the building blocks</li>
<li><Link to="/concepts/flows">Actions</Link> — what happens inside a transition</li>
<li><Link to="/tutorials/first-yaml-flow">Tutorials: Your first YAML flow</Link> — author one yourself</li>
<li><Link to="/reference/flow-schema">Reference: Flow schema</Link> — every field</li>
</ul>
<p>The building blocks of a flow. This page covers states, transitions, events, and timeouts. The next page, <Link to="/concepts/flows">Actions</Link>, covers what runs <em>inside</em> a transition.</p>
<h2 id="states-are-nouns">States are nouns</h2>
<p>A state is a node in the FSM where the flow waits. Every state has:</p>
<ul>
<li><code>{`transitions`}</code> — event-keyed rules for what happens when something arrives</li>
<li><code>{`on_timeout`}</code> — a fallback transition fired if no event matches in time</li>
</ul>
<CodeBlock lang="yaml" code={`states:
  wait_auth_request:
    on_timeout:
      duration: 10s
      target: failed
    transitions:
      - event: NASDownlinkTransport.AuthenticationRequest
        target: wait_security_mode
        actions:
          - type: check
            field: amf_ue_ngap_id
            op: not_empty
          - type: send
            message: AuthResponse`} />
<p>A <code>{`final_state`}</code> has no transitions — reaching one terminates the flow for that UE. Final states are listed at the top level of the flow:</p>
<CodeBlock lang="yaml" code={`final_states:
  - registered
  - failed`} />
<h2 id="transitions-are-verbs">Transitions are verbs</h2>
<p>A transition binds an event to a target state and an optional list of actions. When the FSM is in state <code>{`S`}</code> and an event matches one of <code>{`S`}</code>'s transitions, the transition fires: actions execute, the FSM advances to <code>{`target`}</code>. If no transition matches, the FSM stays in <code>{`S`}</code>.</p>
<CodeBlock lang="yaml" code={`- event: NASDownlinkTransport.AuthenticationRequest
  target: wait_security_mode
  actions:
    - type: check
      field: amf_ue_ngap_id
      op: not_empty
    - type: send
      message: AuthResponse`} />
<p>Three event forms.</p>
<h3 id="simple">Simple</h3>
<CodeBlock lang="yaml" code={`event: NASDownlinkTransport.AuthenticationRequest`} />
<p>Fires on a single event name. Most transitions look like this.</p>
<h3 id="or-compound">OR-compound</h3>
<CodeBlock lang="yaml" code={`event:
  or: [NASDownlinkTransport.AuthenticationRequest, NASDownlinkTransport.SecurityModeCommand]`} />
<p>Fires when any one of the listed events arrives. Useful when an AMF can skip authentication on already-authenticated UEs and jump straight to security mode.</p>
<h3 id="and-compound">AND-compound</h3>
<CodeBlock lang="yaml" code={`event:
  and: [InitialContextSetupRequest, RegistrationAccept]`} />
<p>Fires <em>only</em> when every listed event has arrived. Useful when a procedure pivots only after multiple inbound messages have all been seen — the engine accumulates pending events and re-checks AND clauses on each new arrival.</p>
<h2 id="event-names">Event names</h2>
<p>Event names match the wire-message form the protocol resolver emits.</p>
<ul>
<li><strong>NGAP messages</strong> use the canonical NGAP procedure name: <code>{`InitialUEMessage`}</code>, <code>{`NGSetupResponse`}</code>, <code>{`PduSessionResourceSetupRequest`}</code>.</li>
<li><strong>Inner-NAS messages</strong> carried inside NGAP appear as dotted nested forms: <code>{`NASDownlinkTransport.AuthenticationRequest`}</code>, <code>{`InitialContextSetupRequest.RegistrationAccept`}</code>. The first segment is the outer NGAP wrapper; the second is the NAS payload type.</li>
<li><strong>Diameter messages</strong> use their command-code mnemonics: <code>{`ULA`}</code>, <code>{`AIA`}</code>, <code>{`CCA`}</code>, <code>{`AAA`}</code>.</li>
<li><strong>SBI</strong> uses the service-and-operation name: <code>{`Nudm_SDM_GetSubscriptionData_Answer`}</code>.</li>
<li><strong>PFCP</strong> uses the message name: <code>{`PFCPAssociationSetupResponse`}</code>.</li>
<li><strong>REST</strong> uses whatever message label the flow author declared in the corresponding <code>{`send`}</code>.</li>
</ul>
<p>In multi-protocol flows, authors can prefix names with the protocol (<code>{`ngap.X`}</code>, <code>{`diameter.X`}</code>, <code>{`sbi.X`}</code>) for visual disambiguation. The matcher strips one leading prefix on either side before comparing, so <code>{`ngap.InitialUEMessage`}</code> and <code>{`InitialUEMessage`}</code> match the same actual event.</p>
<h2 id="synthetic-events">Synthetic events</h2>
<p>Four events the engine emits without a wire frame:</p>
<table>
<thead><tr><th>Event</th><th>Source</th><th>When it fires</th></tr></thead>
<tbody><tr><td><code>{`Start`}</code></td><td>engine</td><td>Once per UE for client-mode flows out of <code>{`initial_state`}</code></td></tr>
<tr><td><code>{`Error`}</code></td><td>protocol</td><td>On decode error, enricher error, unrecoverable failure</td></tr>
<tr><td><code>{`StateTimeout`}</code></td><td>engine</td><td>When an <code>{`on_timeout`}</code> block elapses (you don't reference this in <code>{`event:`}</code> directly — <code>{`on_timeout`}</code> is the wiring)</td></tr>
<tr><td><code>{`UplaneComplete`}</code></td><td>engine</td><td>After an <code>{`uplane_start`}</code> action finishes its run</td></tr></tbody>
</table>
<p>Use <code>{`Error`}</code> in <code>{`any_state_transitions`}</code> to land any error path in <code>{`failed`}</code>:</p>
<CodeBlock lang="yaml" code={`any_state_transitions:
  - event: Error
    target: failed`} />
<h2 id="any_state_transitions">any_state_transitions</h2>
<p>Top-level transitions that fire from any state when no state-specific transition matched. The pattern is "global fallback" — most often used for <code>{`Error`}</code> handling, occasionally for protocol-level abort messages that can arrive at any time:</p>
<CodeBlock lang="yaml" code={`any_state_transitions:
  - event: Error
    target: failed
  - event: ErrorIndication
    target: failed`} />
<h2 id="on_timeout-the-safety-net">on_timeout — the safety net</h2>
<p>Every <code>{`wait_*`}</code> state should have an <code>{`on_timeout`}</code>. Without one, a peer that never replies leaves the FSM stuck and the flow times out at the engine level rather than landing in a defined final state.</p>
<CodeBlock lang="yaml" code={`on_timeout:
  duration: 10s
  target: failed`} />
<p>Duration is a Go-style duration string (<code>{`10s`}</code>, <code>{`2m`}</code>, <code>{`500ms`}</code>). The target is any state name — typically <code>{`failed`}</code>, but for retry patterns it can target a different <code>{`wait_*`}</code> state.</p>
<p>The engine fires a <code>{`StateTimeout`}</code> event when the duration elapses; the timeout block is sugar for a transition that fires on <code>{`StateTimeout`}</code>. (You can write the explicit transition yourself, but <code>{`on_timeout`}</code> is the one-liner everyone uses.)</p>
<h2 id="validation-rules">Validation rules</h2>
<p>The engine rejects malformed FSMs at load time. The most common failures:</p>
<ul>
<li>A transition's <code>{`target`}</code> references a non-existent state</li>
<li>A client flow has no <code>{`Start`}</code>-event transition at <code>{`initial_state`}</code></li>
<li>A server flow <em>does</em> have a <code>{`Start`}</code>-event transition at <code>{`initial_state`}</code></li>
<li>A check action appears after a send within the same transition's <code>{`actions`}</code> list (checks must precede sends)</li>
<li>A send action has no <code>{`message:`}</code> field</li>
<li>An extract action has neither <code>{`field`}</code>/<code>{`store`}</code> shorthand nor an <code>{`extracts:`}</code> list</li>
</ul>
<p>The error message names the offending state, transition index, and action index — easy to grep for.</p>
<h2 id="where-to-go-next-2">Where to go next</h2>
<ul>
<li><Link to="/concepts/flows">Actions</Link> — what happens inside a transition</li>
<li><Link to="/concepts/suites">Suites</Link> — composing flows</li>
<li><Link to="/reference/flow-schema">Flow schema reference</Link> — exact field tables</li>
</ul>
<p>Actions are what runs <em>inside</em> a transition. They execute in YAML order when the transition fires. Six action types ship today.</p>
<p>This page is the conceptual tour. The exact field tables live in the <Link to="/reference/flow-schema#action-types">flow schema reference</Link>.</p>
<h2 id="the-six-types">The six types</h2>
<table>
<thead><tr><th>Type</th><th>What it does</th><th>Common position</th></tr></thead>
<tbody><tr><td><code>{`check`}</code></td><td>Assert a field on the most recent inbound message (or UE state)</td><td>First in the list</td></tr>
<tr><td><code>{`extract`}</code></td><td>Read a field off the inbound message into UE state</td><td>Before any <code>{`send`}</code></td></tr>
<tr><td><code>{`send`}</code></td><td>Emit a message on the wire</td><td>After checks/extracts</td></tr>
<tr><td><code>{`uplane_start`}</code></td><td>Arm the user-plane traffic generator after a PDU session is up</td><td>Between sends</td></tr>
<tr><td><code>{`ngap_realloc`}</code></td><td>NGAP: reallocate the RAN-UE-NGAP-ID before the next send</td><td>Between sends</td></tr>
<tr><td><code>{`ngap_handover_swap`}</code></td><td>NGAP: move the UE binding from source to target gNB</td><td>Between sends</td></tr></tbody>
</table>
<p>The first three are universal — every flow uses them. The latter three are specialised. We'll walk through them in that order.</p>
<h2 id="check-assert-before-you-send">check — assert before you send</h2>
<p>A <code>{`check`}</code> evaluates a field on the most recent inbound message (or <code>{`ue.&lt;path&gt;`}</code> against UE context) using one of eight comparison operators. A failed check aborts the transition; the FSM stays in the current state and either receives a later matching event or hits <code>{`on_timeout`}</code>.</p>
<CodeBlock lang="yaml" code={`- type: check
  field: amf_ue_ngap_id
  op: not_empty

- type: check
  field: ue.AmfUeNgapId
  op: equals
  expected: 12345`} />
<table>
<thead><tr><th>Op</th><th>Required <code>{`expected`}</code></th><th>Passes when</th></tr></thead>
<tbody><tr><td><code>{`equals`}</code></td><td>yes</td><td>Field equals expected</td></tr>
<tr><td><code>{`not_empty`}</code></td><td>no</td><td>Field resolves and is non-zero</td></tr>
<tr><td><code>{`greater_than`}</code></td><td>yes</td><td>Field &gt; expected</td></tr>
<tr><td><code>{`less_than`}</code></td><td>yes</td><td>Field &lt; expected</td></tr>
<tr><td><code>{`greater_or_equal`}</code></td><td>yes</td><td>Field ≥ expected</td></tr>
<tr><td><code>{`less_or_equal`}</code></td><td>yes</td><td>Field ≤ expected</td></tr>
<tr><td><code>{`contains`}</code></td><td>yes</td><td>Field's string form contains the expected substring</td></tr>
<tr><td><code>{`exists`}</code></td><td>no</td><td>Field resolves (regardless of value)</td></tr></tbody>
</table>
<p>Field paths are case-sensitive. NGAP wire-message fields use lowercase-with-underscores (<code>{`amf_ue_ngap_id`}</code>); UE-context fields are PascalCase prefixed with <code>{`ue.`}</code> (<code>{`ue.AmfUeNgapId`}</code>).</p>
<p>Checks must precede sends within a transition. The validator rejects the alternative — once you've sent, the inbound under check is no longer the latest message.</p>
<h2 id="extract-bridge-inbound-to-outbound">extract — bridge inbound to outbound</h2>
<p><code>{`extract`}</code> reads a field off the most recent inbound message and stores it in <code>{`ue.Params[&lt;key&gt;]`}</code>. Later <code>{`send`}</code>s reference it via <code>{`{{ue.Params.&lt;key&gt;}}`}</code> templates.</p>
<p>Two forms:</p>
<CodeBlock lang="yaml" code={`# Shorthand — single field
- type: extract
  field: amf_ue_ngap_id
  store: amf_id

# List form — multiple fields in one action
- type: extract
  extracts:
    - { field: amf_ue_ngap_id, store: amf_id }
    - { field: ue.SecCtx,      store: sec_ctx }`} />
<p>This is how procedures that <em>correlate</em> a request with a later request — a session ID, a transaction ID, an authentication challenge — express the dependency declaratively. Without <code>{`extract`}</code>, the next state's <code>{`send`}</code> has no clean way to reference an earlier inbound's field.</p>
<p>Like <code>{`check`}</code>, <code>{`extract`}</code> must precede sends.</p>
<h2 id="send-emit-a-message">send — emit a message</h2>
<p>A <code>{`send`}</code> emits a message on the wire. The <code>{`message`}</code> field names a registered enricher; the enricher fills protocol-specific fields from UE state.</p>
<CodeBlock lang="yaml" code={`- type: send
  message: InitialUEMessage
  message_body: |
    {
      "criticality": 1,
      "rrc_establishment_cause": 0,
      "ue_context_request": 1
    }`} />
<p>Four fields control a send:</p>
<table>
<thead><tr><th>Field</th><th>Required</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>{`message`}</code></td><td>yes</td><td>Registered enricher name</td></tr>
<tr><td><code>{`message_body`}</code></td><td>no</td><td>Pre-populated JSON merged into the typed message struct before the enricher fills the rest</td></tr>
<tr><td><code>{`params`}</code></td><td>no</td><td>Per-action runtime params overlay</td></tr>
<tr><td><code>{`protocol`}</code></td><td>no</td><td>Override the default protocol (used in multi-protocol flows)</td></tr>
<tr><td><code>{`peer`}</code></td><td>no</td><td>Override the target peer name within the protocol</td></tr></tbody>
</table>
<h3 id="what-an-enricher-is">What an enricher is</h3>
<p>An enricher is a Go function that fills protocol fields on outbound messages. You don't write them — you reference one by name. Each enricher binds:</p>
<ul>
<li>A label (the value of <code>{`message:`}</code>)</li>
<li>A typed prototype struct (e.g. <code>{`NGAPInitialUEMessage`}</code>)</li>
<li>A function that populates that struct from UE state</li>
</ul>
<p>Shipped enricher counts: NGAP 25, Diameter 22, SBI 8, PFCP 10, REST generic. Full list at <Link to="/reference/flow-schema#enricher-catalog">reference/flow-schema.md</Link>.</p>
<h3 id="message_body-pre-populate-fields">message_body — pre-populate fields</h3>
<p><code>{`message_body`}</code> lets the FSM author override default field values on the typed prototype before the enricher fills the rest. Zero values are gated by the enricher (it fills only fields the author left zero), so what you set here survives.</p>
<p>This is how you author negative tests — set a field to a malformed value and let the enricher fill the rest of the message normally:</p>
<CodeBlock lang="yaml" code={`- type: send
  message: InitialUEMessage
  message_body: |
    { "rrc_establishment_cause": 99 }   # invalid value, AMF should reject`} />
<h3 id="templates-in-message_body-and-params">Templates in message_body and params</h3>
<p>Both <code>{`message_body`}</code> JSON values and <code>{`params`}</code> map values accept <code>{`{{...}}`}</code> templates. Two forms:</p>
<CodeBlock lang="yaml" code={`# Variable lookup — dotted path through UE state / params / inbound
params:
  amf_id: "{{ue.AmfUeNgapId}}"

# Function call — registered template function with $ prefix
params:
  rand: "{{$randint 1 1000}}"`} />
<p>Templates are compiled at flow-load time; unknown function names and arity errors fail before the first send.</p>
<h2 id="uplane_start-arm-the-traffic-generator">uplane_start — arm the traffic generator</h2>
<p><code>{`uplane_start`}</code> is the bridge from signalling to user plane. It runs after a PDU session is established and arms the configured traffic generator (USPACE or DPDK) using parameters from the inbound <code>{`PduSessionResourceSetupRequest`}</code> and the gNB's <code>{`uplane:`}</code> config block.</p>
<CodeBlock lang="yaml" code={`- type: uplane_start`} />
<p>The shipped <code>{`templates/gnb/uplane_traffic.yaml`}</code> is the canonical example. It runs registration + PDU session establishment, then triggers <code>{`uplane_start`}</code> to fire traffic for the configured duration. The receiver running on the destination end (<code>{`fluxproto-light server uspace`}</code> or <code>{`server dpdk`}</code>) echoes the traffic back; the sender measures throughput, latency, jitter, drop.</p>
<p>After <code>{`uplane_start`}</code> finishes, the engine fires <code>{`UplaneComplete`}</code> so the FSM can advance to a final state.</p>
<p>See <Link to="/concepts/user-plane">User plane</Link> and <Link to="/guides/user-plane-testing">User-plane testing guide</Link> for the receiver setup.</p>
<h2 id="ngap_realloc-renumber-the-ue-on-the-same-gnb">ngap_realloc — renumber the UE on the same gNB</h2>
<p>NGAP-only. Mutates the UE's <code>{`RAN-UE-NGAP-ID`}</code> before the next send. Used in stress flows to verify AMF tracking when the gNB renumbers a UE. Allowed between sends.</p>
<h2 id="ngap_handover_swap-move-the-ue-between-gnbs">ngap_handover_swap — move the UE between gNBs</h2>
<p>NGAP-only. After receiving <code>{`HandoverCommand`}</code>, swaps the UE's gNB binding from source to target. The next send uses the target gNB's transport. Used by <code>{`templates/gnb/handover_source.yaml`}</code>.</p>
<h2 id="what-you-dont-write">What you don't write</h2>
<p>Notably absent from the action types: no <code>{`wait`}</code>, no <code>{`sleep`}</code>, no <code>{`loop`}</code>, no <code>{`if/else`}</code>. The FSM model handles waiting through state transitions; conditional branching through multiple transitions on different events; loops through self-targeting transitions or <code>{`any_state_transitions`}</code>. If your flow needs something like an explicit retry counter, use <code>{`extract`}</code> to maintain it as a UE param and check it in transition guards.</p>
<h2 id="where-to-go-next-3">Where to go next</h2>
<ul>
<li><Link to="/concepts/suites">Suites</Link> — composing flows</li>
<li><Link to="/guides/writing">Writing flows guide</Link> — how-to with full examples</li>
<li><Link to="/reference/flow-schema">Flow schema reference</Link> — exact field tables</li>
</ul>
    </DocPage>
  );
}
