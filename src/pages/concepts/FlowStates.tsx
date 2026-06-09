import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Mermaid from '../../components/Mermaid';
import Callout from '../../components/Callout';
import { Link } from 'react-router-dom';

export default function FlowStates() {
  return (
    <DocPage slug="concepts/flows/states" lede="How a flow's state machine is built: states as the nodes, the start state, transitions that fire on events, the any_state fallback, and the on_timeout safety net.">
<p>A flow is a finite-state machine. <Link to="/concepts/flows">Flows</Link> introduced the shape; this page covers the building blocks — states, the start state, transitions, the <code>{`any_state_transitions`}</code> fallback, and <code>{`on_timeout`}</code>. The next page, <Link to="/concepts/flows/actions">Actions and checks</Link>, covers what runs <em>inside</em> a transition.</p>

<h2 id="states-are-the-nodes">States are the nodes</h2>
<p>A state is a node in the FSM — a point where the flow waits for something to happen. Each UE running the flow sits in exactly one state at a time. A state declares two things, both optional:</p>
<ul>
<li><code>{`transitions`}</code> — event-keyed rules for what to do when a message (or synthetic event) arrives</li>
<li><code>{`on_timeout`}</code> — a fallback fired if nothing matches within a deadline</li>
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
<p>Name states for what the flow is waiting for. The shipped flows use <code>{`wait_*`}</code> prefixes for waiting states (<code>{`wait_auth_request`}</code>, <code>{`wait_security_mode`}</code>, <code>{`wait_context_setup`}</code>) and plain nouns for terminal states (<code>{`registered`}</code>, <code>{`failed`}</code>). The names are arbitrary labels — the engine only cares that every <code>{`target`}</code> resolves to a real state.</p>

<h2 id="the-start-state">The start state</h2>
<p>One state is the entry point, named at the top level by <code>{`initial_state`}</code>. Every UE begins there. How the FSM leaves the start state depends on the flow's <code>{`type`}</code>:</p>
<ul>
<li><strong>Client flows</strong> initiate the procedure. The engine fires a synthetic <code>{`Start`}</code> event into <code>{`initial_state`}</code> once per UE, which dispatches the first <code>{`send`}</code>. A client flow <em>must</em> have a transition matching <code>{`Start`}</code> at <code>{`initial_state`}</code>.</li>
<li><strong>Server flows</strong> wait for a peer to send the first message. There is no <code>{`Start`}</code> event; the FSM spawns when an inbound message matches a transition at <code>{`initial_state`}</code>. A server flow <em>must not</em> have a <code>{`Start`}</code> transition there, and must have at least one transition to receive that first message.</li>
</ul>
<p>The engine enforces both rules at flow-load time, so a mismatched <code>{`type`}</code> fails fast rather than hanging at runtime.</p>
<CodeBlock lang="yaml" code={`initial_state: idle
final_states: [registered, failed]

states:
  idle:
    transitions:
      - event: Start                  # client flow: the engine fires this once per UE
        target: wait_auth_request
        actions:
          - type: send
            message: InitialUEMessage`} />

<h2 id="final-states">Final states</h2>
<p>The states named in the top-level <code>{`final_states`}</code> list are terminal. Reaching one ends the flow for that UE — the engine records the outcome and stops dispatching events to that UE. Final states carry no <code>{`transitions`}</code>; they are leaves of the graph.</p>
<CodeBlock lang="yaml" code={`final_states:
  - registered      # the success outcome
  - failed          # the catch-all error outcome`} />
<p>Most flows have exactly two: one success state and one failure state. Negative tests often invert the labels — a "rejected" outcome is the <em>success</em> of the test. The names are conventional, not magic; the engine treats any state in <code>{`final_states`}</code> as terminal.</p>

<h2 id="transitions">Transitions — the edges</h2>
<p>A transition is an edge out of a state. It binds an event to a <code>{`target`}</code> state and an optional ordered list of <code>{`actions`}</code>. When the FSM is in state <code>{`S`}</code> and an event arrives, the engine scans <code>{`S`}</code>'s transitions in order and fires the first whose event matches: its actions run, then the FSM advances to <code>{`target`}</code>.</p>
<p>If no transition in <code>{`S`}</code> matches, the FSM stays in <code>{`S`}</code> and waits for the next event (or the timeout). Events that match nothing are simply ignored — there is no implicit error.</p>
<CodeBlock lang="yaml" code={`- event: NASDownlinkTransport.AuthenticationRequest
  target: wait_security_mode
  actions:
    - type: check
      field: amf_ue_ngap_id
      op: not_empty
    - type: send
      message: AuthResponse`} />
<p>A transition can target any state — a later waiting state, a final state, or (for retry and polling patterns) back to the same state. The exact field tables for transitions and events live in the <Link to="/reference/flow-schema">flow schema reference</Link>; this page stays conceptual.</p>

<h3 id="event-forms">Three event forms</h3>
<p>The <code>{`event`}</code> key takes one of three shapes.</p>
<p><strong>Simple</strong> — a single event name. Most transitions look like this.</p>
<CodeBlock lang="yaml" code={`event: NASDownlinkTransport.AuthenticationRequest`} />
<p><strong>OR-compound</strong> — fires when any one of the listed events arrives. Useful when an AMF may skip authentication for an already-authenticated UE and jump straight to security mode.</p>
<CodeBlock lang="yaml" code={`event:
  or: [NASDownlinkTransport.AuthenticationRequest, NASDownlinkTransport.SecurityModeCommand]`} />
<p><strong>AND-compound</strong> — fires only after every listed event has arrived. The engine accumulates the events it has seen so far for the current state and re-checks the AND clause on each new arrival, firing once the set is complete.</p>
<CodeBlock lang="yaml" code={`event:
  and: [InitialContextSetupRequest, RegistrationAccept]`} />

<h2 id="synthetic-events">Synthetic events</h2>
<p>Most events name a wire message the protocol resolver emitted. Four events have no wire frame — the engine raises them itself.</p>
<table>
<thead><tr><th>Event</th><th>When it fires</th></tr></thead>
<tbody>
<tr><td><code>{`Start`}</code></td><td>Once per UE for client flows, into <code>{`initial_state`}</code></td></tr>
<tr><td><code>{`Error`}</code></td><td>On a decode error or an unrecoverable failure on the inbound path</td></tr>
<tr><td><code>{`StateTimeout`}</code></td><td>When an <code>{`on_timeout`}</code> deadline elapses (you wire this through <code>{`on_timeout`}</code>, not by naming it in <code>{`event:`}</code>)</td></tr>
<tr><td><code>{`UplaneComplete`}</code></td><td>After an <code>{`uplane_start`}</code> action finishes its traffic run</td></tr>
</tbody>
</table>
<p>The common use of a synthetic event in authored YAML is <code>{`Error`}</code> in <code>{`any_state_transitions`}</code>, to land every error path in <code>{`failed`}</code>.</p>

<h2 id="any_state_transitions">any_state_transitions — the global fallback</h2>
<p>Some events can arrive in any state and always mean the same thing — a protocol-level <code>{`Error`}</code>, an <code>{`ErrorIndication`}</code>, an abort. Rather than repeating the same transition in every state, declare it once at the top level under <code>{`any_state_transitions`}</code>.</p>
<p>The engine checks state-specific transitions <em>first</em>; only if none matched does it fall back to <code>{`any_state_transitions`}</code>. A state that handles an event locally overrides the global rule.</p>
<CodeBlock lang="yaml" code={`any_state_transitions:
  - event: Error
    target: failed
  - event: ErrorIndication
    target: failed`} />
<p>An any-state transition may target <code>{`_self`}</code> to fire its actions and stay in the current state — useful for handling a recurring keep-alive or status message that can arrive anywhere without advancing the procedure.</p>
<CodeBlock lang="yaml" code={`any_state_transitions:
  - event: Heartbeat
    target: _self          # run actions, remain in the current state`} />

<h2 id="on_timeout">on_timeout — the safety net</h2>
<p>Every waiting state should carry an <code>{`on_timeout`}</code>. Without one, a peer that never replies leaves the UE parked in that state until the engine's outer flow deadline trips — the flow then fails without a defined outcome instead of landing in a state you chose.</p>
<CodeBlock lang="yaml" code={`on_timeout:
  duration: 10s
  target: failed`} />
<p>The deadline starts when the FSM enters the state. <code>{`duration`}</code> is a Go-style duration string — <code>{`10s`}</code>, <code>{`2m`}</code>, <code>{`500ms`}</code>. When it elapses, the engine raises a <code>{`StateTimeout`}</code> event and moves the UE to <code>{`target`}</code>. The target is any state name: usually <code>{`failed`}</code>, but for retry patterns it can point back at a waiting state.</p>
<p>An <code>{`on_timeout`}</code> may carry its own <code>{`actions`}</code>, which run before the target is applied — the same execution semantics as a transition's actions. This expresses "wait N, then do X" without needing an inbound event to drive it, for example a token-expiry probe that re-sends after an idle delay.</p>
<CodeBlock lang="yaml" code={`on_timeout:
  duration: 30s
  target: wait_refresh
  actions:
    - type: send
      message: TokenRefresh`} />
<Callout type="tip">Reach for <code>{`on_timeout`}</code> on every <code>{`wait_*`}</code> state, and reach for <code>{`any_state_transitions`}</code> for <code>{`Error`}</code>. Between the two, every UE has a defined exit no matter what the peer does — which is what keeps a 10,000-UE load run from accumulating stuck sessions.</Callout>

<h2 id="putting-it-together">Putting it together</h2>
<p>Here is the full graph of the shipped <code>{`gnb/registration.yaml`}</code> flow — start state, waiting states, transitions on inbound NAS messages, a timeout out of every waiting state, and an any-state <code>{`Error`}</code> edge into <code>{`failed`}</code>.</p>
<Mermaid code={`stateDiagram-v2
    [*] --> idle
    idle --> wait_auth_request: Start / send InitialUEMessage
    wait_auth_request --> wait_security_mode: AuthenticationRequest / check + send AuthResponse
    wait_security_mode --> wait_context_setup: SecurityModeCommand / check + send SecurityModeComplete
    wait_context_setup --> registered: RegistrationAccept / check + send InitialContextSetupResponse, RegistrationComplete
    wait_auth_request --> failed: on_timeout 10s
    wait_security_mode --> failed: on_timeout 10s
    wait_context_setup --> failed: on_timeout 10s
    idle --> failed: Error (any_state)
    wait_auth_request --> failed: Error (any_state)
    wait_security_mode --> failed: Error (any_state)
    wait_context_setup --> failed: Error (any_state)
    registered --> [*]
    failed --> [*]`} />
<p>Every node, edge, and label in that diagram is a few lines of YAML. The procedure walks from <code>{`idle`}</code> through three waits to <code>{`registered`}</code>; any timeout or error diverts to <code>{`failed`}</code>. That is the whole model: states are where you wait, transitions are how you move, and the timeout and any-state fallbacks guarantee you always move <em>somewhere</em>.</p>

<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/concepts/flows/actions">Actions and checks</Link> — what runs inside a transition: <code>{`check`}</code>, <code>{`extract`}</code>, <code>{`send`}</code>, and more</li>
<li><Link to="/reference/flow-schema">Flow schema reference</Link> — the exact field tables for states, transitions, events, and timeouts</li>
</ul>
    </DocPage>
  );
}
