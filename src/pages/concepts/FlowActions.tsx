import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';
import { Link } from 'react-router-dom';

export default function FlowActions() {
  return (
    <DocPage slug="concepts/flows/actions" lede="The action types a transition can run — send, check, extract, and the rest — and the check operators that gate a procedure.">
<p>Actions are what runs <em>inside</em> a transition. When a transition fires, its <code>{`actions`}</code> list executes top to bottom, then the flow advances to the transition's <code>{`target`}</code> state. A transition with no actions is legal — it just moves state.</p>
<p>This page is the conceptual tour. The exact field tables live in the <Link to="/reference/flow-schema">flow schema reference</Link>.</p>

<h2 id="a-transition-in-three-acts">A transition in three acts</h2>
<p>The everyday transition reads the inbound message, then answers it. Order matters: <strong>check</strong> what arrived, <strong>extract</strong> anything later steps need, then <strong>send</strong> the reply.</p>
<CodeBlock lang="yaml" code={`- event: NASDownlinkTransport.AuthenticationRequest
  target: wait_security_mode
  actions:
    - type: check                  # assert the inbound is well-formed
      field: amf_ue_ngap_id
      op: not_empty
    - type: extract                # stash a field for a later send
      field: rand
      store: auth_rand
    - type: send                   # answer on the wire
      message: AuthenticationResponse`} />
<p>That ordering is not a convention — the engine enforces it. A <code>{`check`}</code> or <code>{`extract`}</code> that appears after a <code>{`send`}</code> in the same list is rejected at flow-load, because once you have sent, the inbound message under inspection is no longer the latest frame. Read first, write last.</p>

<h2 id="the-six-action-types">The six action types</h2>
<p>Six action types ship today. The first three are universal — nearly every flow uses them. The other three are specialised.</p>
<table>
<thead><tr><th>Type</th><th>What it does</th><th>Typical position</th></tr></thead>
<tbody>
<tr><td><code>{`check`}</code></td><td>Assert a field on the most recent inbound message (or on UE state)</td><td>First</td></tr>
<tr><td><code>{`extract`}</code></td><td>Read a field off the inbound message into UE state for later use</td><td>Before any <code>{`send`}</code></td></tr>
<tr><td><code>{`send`}</code></td><td>Emit a message on the wire</td><td>After checks and extracts</td></tr>
<tr><td><code>{`uplane_start`}</code></td><td>Arm the user-plane traffic generator once a PDU session is up</td><td>Between sends</td></tr>
<tr><td><code>{`ngap_realloc`}</code></td><td>NGAP only — reallocate the RAN-UE-NGAP-ID before the next send</td><td>Between sends</td></tr>
<tr><td><code>{`ngap_handover_swap`}</code></td><td>NGAP only — move the UE binding from source to target gNB</td><td>Between sends</td></tr>
</tbody>
</table>

<h2 id="check">check — assert before you send</h2>
<p>A <code>{`check`}</code> evaluates a field against an operator. The field resolves from the most recent inbound message, or — when the path is prefixed <code>{`ue.`}</code> — from the UE's own context. A failed check aborts the transition: the flow stays in the current state and waits for a later matching event or for <code>{`on_timeout`}</code>. This is how negative tests assert that a peer rejected a malformed request with the right cause.</p>
<CodeBlock lang="yaml" code={`- type: check
  field: amf_ue_ngap_id
  op: not_empty

- type: check
  field: pfcp.cause
  op: equals
  expected: "Request accepted"`} />
<p>Both <code>{`field`}</code> and <code>{`op`}</code> are required on every check. Field paths are case-sensitive: wire-message fields use lowercase-with-underscores (<code>{`amf_ue_ngap_id`}</code>), while UE-context fields are PascalCase under the <code>{`ue.`}</code> prefix (<code>{`ue.AmfUeNgapId`}</code>).</p>

<h3 id="check-operators">The nine check operators</h3>
<p>The engine defines nine comparison operators. Six need an <code>{`expected`}</code> value; three are presence or emptiness tests that take none.</p>
<table>
<thead><tr><th>Operator</th><th>Needs <code>{`expected`}</code></th><th>Passes when</th></tr></thead>
<tbody>
<tr><td><code>{`equals`}</code></td><td>yes</td><td>Field equals expected (compared as strings)</td></tr>
<tr><td><code>{`not_empty`}</code></td><td>no</td><td>Field resolves and is non-nil, non-empty, non-zero</td></tr>
<tr><td><code>{`greater_than`}</code></td><td>yes</td><td>Field &gt; expected (numeric)</td></tr>
<tr><td><code>{`less_than`}</code></td><td>yes</td><td>Field &lt; expected (numeric)</td></tr>
<tr><td><code>{`greater_or_equal`}</code></td><td>yes</td><td>Field ≥ expected (numeric)</td></tr>
<tr><td><code>{`less_or_equal`}</code></td><td>yes</td><td>Field ≤ expected (numeric)</td></tr>
<tr><td><code>{`contains`}</code></td><td>yes</td><td>Field's string form contains the expected substring</td></tr>
<tr><td><code>{`not_contains`}</code></td><td>yes</td><td>Field's string form does <em>not</em> contain the expected substring</td></tr>
<tr><td><code>{`exists`}</code></td><td>no</td><td>Field resolves at all, whatever its value</td></tr>
</tbody>
</table>
<Callout type="note">
<code>{`exists`}</code> and <code>{`not_empty`}</code> are not the same. <code>{`exists`}</code> only asks whether the AVP or field is present; <code>{`not_empty`}</code> additionally requires the value to be non-zero. Use <code>{`exists`}</code> when an empty or zero value is still a valid presence assertion.
</Callout>
<p>The <code>{`expected`}</code> value can itself be a <code>{`{{...}}`}</code> template, so a check's right-hand side can come from a field extracted earlier in the same flow — for example <code>{`expected: "{{ue.Params.pre_count}}"`}</code>.</p>

<h2 id="extract">extract — bridge inbound to outbound</h2>
<p><code>{`extract`}</code> reads a field off the most recent inbound message and stores it under <code>{`ue.Params[<key>]`}</code>. Later sends reference it through <code>{`{{ue.Params.<key>}}`}</code> templates. This is how a procedure correlates a request with a later one — a session ID, a transaction ID, an authentication challenge — declaratively, without writing Go.</p>
<p>There are two forms. The shorthand handles a single field; the list form bundles several extracts into one action.</p>
<CodeBlock lang="yaml" code={`# Shorthand — one field
- type: extract
  field: amf_ue_ngap_id
  store: amf_id

# List form — several fields at once
- type: extract
  extracts:
    - { field: amf_ue_ngap_id, store: amf_id }
    - { field: rand,           store: auth_rand }`} />
<p>Each entry needs a <code>{`store`}</code> and exactly one source: a <code>{`field`}</code> path to resolve, or a <code>{`value`}</code> template expression to evaluate. The two are mutually exclusive. A <code>{`value`}</code> entry lets you store a derived result — for instance, decoding a token field and keeping the result:</p>
<CodeBlock lang="yaml" code={`- type: extract
  extracts:
    - value: "{{$jwt_decode rest.body.access_token}}"
      store: claims`} />
<p>Like <code>{`check`}</code>, <code>{`extract`}</code> must precede sends in the actions list.</p>

<h2 id="send">send — emit a message</h2>
<p>A <code>{`send`}</code> puts a message on the wire. The <code>{`message`}</code> field names a registered enricher — a built-in that fills protocol-specific fields from UE state. You reference enrichers by name; you never write them. <code>{`message`}</code> is the only required field on a send.</p>
<CodeBlock lang="yaml" code={`- type: send
  message: InitialUEMessage
  message_body: |
    {
      "rrc_establishment_cause": 0,
      "ue_context_request": 1
    }`} />
<p>Optional fields refine the send:</p>
<table>
<thead><tr><th>Field</th><th>Required</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>{`message`}</code></td><td>yes</td><td>Registered enricher name</td></tr>
<tr><td><code>{`message_body`}</code></td><td>no</td><td>JSON pre-filled onto the typed message struct before the enricher fills the rest</td></tr>
<tr><td><code>{`params`}</code></td><td>no</td><td>Per-action params overlay applied after the enricher runs</td></tr>
<tr><td><code>{`protocol`}</code></td><td>no</td><td>Protocol override — used in multi-protocol flows</td></tr>
<tr><td><code>{`peer`}</code></td><td>no</td><td>Target peer name within the protocol</td></tr>
</tbody>
</table>
<p><code>{`message_body`}</code> is how you author negative tests: set one field to a malformed value and let the enricher fill the rest normally. Both <code>{`message_body`}</code> JSON values and <code>{`params`}</code> values accept <code>{`{{...}}`}</code> templates, compiled at flow-load so unknown function names and arity errors fail before the first send.</p>

<h2 id="specialised-actions">The specialised three</h2>
<p>Three action types exist for procedures the read-check-send pattern does not cover. Each is allowed between sends.</p>
<h3 id="uplane_start">uplane_start — arm the traffic generator</h3>
<p><code>{`uplane_start`}</code> bridges signalling to user plane. It runs after a PDU session is established and arms the configured traffic generator using parameters surfaced by the inbound <code>{`PduSessionResourceSetupRequest`}</code> and the gNB's <code>{`uplane:`}</code> config block. When the run finishes, the engine fires a synthetic <code>{`UplaneComplete`}</code> event so the FSM can advance.</p>
<CodeBlock lang="yaml" code={`- type: uplane_start`} />
<p>See <Link to="/concepts/user-plane">User plane</Link> and the <Link to="/guides/user-plane-testing">user-plane testing guide</Link> for the receiver setup.</p>
<h3 id="ngap_realloc">ngap_realloc — renumber the UE on the same gNB</h3>
<p>NGAP only. Reallocates the UE's <code>{`RAN-UE-NGAP-ID`}</code> before the next send, exercising AMF tracking when a gNB renumbers a UE on the same node.</p>
<h3 id="ngap_handover_swap">ngap_handover_swap — move the UE between gNBs</h3>
<p>NGAP only. After a <code>{`HandoverCommand`}</code> arrives, swaps the UE's gNB binding from source to target so the next send uses the target gNB's transport.</p>

<h2 id="what-you-dont-write">What you don't write</h2>
<p>Notably absent: no <code>{`wait`}</code>, no <code>{`sleep`}</code>, no <code>{`loop`}</code>, no <code>{`if`}</code>/<code>{`else`}</code>. The state machine handles those structurally. Waiting is a state; conditional branching is multiple transitions on different events; looping is a self-targeting transition. If a flow needs an explicit retry counter, keep it as a UE param with <code>{`extract`}</code> and gate on it with a <code>{`check`}</code>.</p>

<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/concepts/suites">Suites</Link> — composing flows into a CI-gating run</li>
<li><Link to="/guides/writing">Writing flows</Link> — a how-to with full examples</li>
</ul>
    </DocPage>
  );
}
