import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function FlowSchema() {
  return (
    <DocPage slug="reference/flow-schema" lede="Authoritative schema for kind: flow YAML. Every field, every action type, every check op. For prose on the authoring model, see writing-flows and explanation/flow-authoring-model.">
<h2 id="synopsis">Synopsis</h2>
<CodeBlock lang="yaml" code={`kind: flow
name: registration
description: 5G UE initial registration with auth and security activation
detail: |
  Multi-line markdown rendered in catalog UIs.
category: functional
type: client
protocol: ngap
nf: gnb
initial_state: idle
final_states:
  - registered
  - failed
states:
  idle:
    transitions:
      - event: Start
        target: wait_auth_request
        actions:
          - type: send
            message: InitialUEMessage
any_state_transitions:
  - event: Error
    target: failed`} />
<h2 id="top-level-fields">Top-level fields</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`kind`}</code></td><td>string</td><td>no</td><td>—</td><td><code>{`flow`}</code>. Optional but required by the templates loader so it can dispatch to the correct parser.</td></tr>
<tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>—</td><td>Unique flow name. Looked up by <code>{`run-flow -flow &lt;name&gt;`}</code>.</td></tr>
<tr><td><code>{`description`}</code></td><td>string</td><td>no</td><td>—</td><td>One-line summary; surfaced in <code>{`flow list`}</code>.</td></tr>
<tr><td><code>{`detail`}</code></td><td>string</td><td>no</td><td>—</td><td>Long-form description; markdown allowed.</td></tr>
<tr><td><code>{`category`}</code></td><td>enum</td><td>no</td><td>—</td><td><code>{`functional`}</code>, <code>{`negative`}</code>, <code>{`robustness`}</code>, <code>{`stability`}</code>, <code>{`lifecycle`}</code>, <code>{`load`}</code>, <code>{`stress`}</code>. Filters in catalog views.</td></tr>
<tr><td><code>{`type`}</code></td><td>enum</td><td>yes</td><td>—</td><td><code>{`client`}</code> or <code>{`server`}</code>. Client flows fire <code>{`Start`}</code>; server flows wait for first RX.</td></tr>
<tr><td><code>{`protocol`}</code></td><td>enum</td><td>yes</td><td>—</td><td><code>{`ngap`}</code>, <code>{`sbi`}</code>, <code>{`diameter`}</code>, <code>{`rest`}</code>, <code>{`pfcp`}</code>. Routes inbound demux + the default send protocol.</td></tr>
<tr><td><code>{`nf`}</code></td><td>enum</td><td>yes</td><td>—</td><td><code>{`gnb`}</code>, <code>{`amf`}</code>, <code>{`smf`}</code>, <code>{`ausf`}</code>, <code>{`udm`}</code>, <code>{`pcf`}</code>, <code>{`nrf`}</code>, <code>{`upf`}</code>, <code>{`mme`}</code>, <code>{`pgw`}</code>, <code>{`af`}</code>, <code>{`external`}</code>. Validated against the env.</td></tr>
<tr><td><code>{`initial_state`}</code></td><td>string</td><td>yes</td><td>—</td><td>Name of the state the FSM starts in.</td></tr>
<tr><td><code>{`final_states`}</code></td><td>[]string</td><td>yes</td><td>—</td><td>Terminal state names; reaching one ends the flow.</td></tr>
<tr><td><code>{`states`}</code></td><td>map</td><td>yes</td><td>—</td><td>Map of state name → <code>{`State`}</code>.</td></tr>
<tr><td><code>{`any_state_transitions`}</code></td><td>[]Transition</td><td>no</td><td>—</td><td>Fallback transitions matched when no state-specific transition does.</td></tr></tbody>
</table>
<h2 id="state-shape">State shape</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`transitions`}</code></td><td>[]Transition</td><td>no</td><td>—</td><td>Event-keyed transitions out of this state.</td></tr>
<tr><td><code>{`on_timeout`}</code></td><td>TimeoutConfig</td><td>no</td><td>—</td><td>Fallback transition fired when no event matches before <code>{`duration`}</code> elapses.</td></tr></tbody>
</table>
<p><code>{`TimeoutConfig`}</code>:</p>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`duration`}</code></td><td>duration</td><td>How long to wait before firing</td></tr>
<tr><td><code>{`target`}</code></td><td>string</td><td>Target state</td></tr></tbody>
</table>
<h2 id="transition-shape">Transition shape</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`event`}</code></td><td>EventDef</td><td>yes</td><td>Trigger; see <Link to="#event-shape">Event shape</Link></td></tr>
<tr><td><code>{`target`}</code></td><td>string</td><td>yes</td><td>Target state name (or <code>{`_self`}</code> in <code>{`any_state_transitions`}</code>)</td></tr>
<tr><td><code>{`actions`}</code></td><td>[]Action</td><td>no</td><td>Operations to execute when this transition fires</td></tr></tbody>
</table>
<h2 id="event-shape">Event shape</h2>
<p><code>{`event:`}</code> accepts three forms.</p>
<CodeBlock lang="yaml" code={`# Simple — fires when this exact event arrives
event: NASDownlinkTransport.AuthenticationRequest

# OR-compound — fires when any one of the listed events arrives
event:
  or: [NASDownlinkTransport.AuthenticationRequest, ServiceRequest]

# AND-compound — fires only when every listed event has arrived
event:
  and: [InitialContextSetupRequest, RegistrationAccept]`} />
<p>Authors may prefix any event name with the protocol (<code>{`ngap.X`}</code>, <code>{`diameter.X`}</code>, <code>{`sbi.X`}</code>) for visual disambiguation in multi-protocol flows. The matcher strips one leading prefix on either side before comparing.</p>
<p>Synthetic events:</p>
<table>
<thead><tr><th>Event</th><th>Source</th><th>Notes</th></tr></thead>
<tbody><tr><td><code>{`Start`}</code></td><td>engine</td><td>Fired once per UE for client flows out of <code>{`initial_state`}</code></td></tr>
<tr><td><code>{`Error`}</code></td><td>protocol</td><td>Fired on decode error, enricher error, or unrecoverable failure</td></tr>
<tr><td><code>{`StateTimeout`}</code></td><td>engine</td><td>Fired when an <code>{`on_timeout`}</code> block elapses</td></tr>
<tr><td><code>{`UplaneComplete`}</code></td><td>engine</td><td>Fired after a <code>{`uplane_start`}</code> action finishes its run</td></tr></tbody>
</table>
<h2 id="action-types">Action types</h2>
<p>Six action types ship today. All actions execute in YAML order within a transition.</p>
<h3 id="send"><code>{`send`}</code></h3>
<p>Emit a message on the wire. Required when the transition needs to TX.</p>
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`type`}</code></td><td><code>{`send`}</code></td><td>yes</td><td>—</td></tr>
<tr><td><code>{`message`}</code></td><td>string</td><td>yes</td><td>Registered enricher name; see <Link to="#enricher-catalog">Enricher catalog</Link></td></tr>
<tr><td><code>{`message_body`}</code></td><td>JSON string</td><td>no</td><td>Pre-populated fields on the typed message struct, merged before the enricher fills the rest</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td>Runtime params overlay</td></tr>
<tr><td><code>{`protocol`}</code></td><td>enum</td><td>no</td><td>Override the default protocol (per-action; used in multi-protocol flows)</td></tr>
<tr><td><code>{`peer`}</code></td><td>string</td><td>no</td><td>Override the target peer name within the protocol</td></tr></tbody>
</table>
<CodeBlock lang="yaml" code={`- type: send
  message: InitialUEMessage
  message_body: |
    { "criticality": 1, "rrc_establishment_cause": 0, "ue_context_request": 1 }`} />
<h3 id="check"><code>{`check`}</code></h3>
<p>Assert a field on the most recent inbound message (or <code>{`ue.&lt;path&gt;`}</code> against UE context). Must precede any <code>{`send`}</code> in the same transition.</p>
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`type`}</code></td><td><code>{`check`}</code></td><td>yes</td><td>—</td></tr>
<tr><td><code>{`field`}</code></td><td>string</td><td>yes</td><td>Field path; <code>{`ue.X`}</code> reads UE context, otherwise reads the most recent RX message</td></tr>
<tr><td><code>{`op`}</code></td><td>enum</td><td>yes</td><td>One of <code>{`equals`}</code>, <code>{`not_empty`}</code>, <code>{`greater_than`}</code>, <code>{`less_than`}</code>, <code>{`greater_or_equal`}</code>, <code>{`less_or_equal`}</code>, <code>{`contains`}</code>, <code>{`exists`}</code></td></tr>
<tr><td><code>{`expected`}</code></td><td>any</td><td>depends</td><td>Required for ops that compare against a value</td></tr></tbody>
</table>
<h3 id="extract"><code>{`extract`}</code></h3>
<p>Read a field off the most recent inbound message and store it in <code>{`ue.Params[&lt;store&gt;]`}</code> for later template lookup. Must precede any <code>{`send`}</code>.</p>
<CodeBlock lang="yaml" code={`# Shorthand — single field
- type: extract
  field: amf_ue_ngap_id
  store: amf_ue_ngap_id

# List form — multiple fields in one action
- type: extract
  extracts:
    - { field: amf_ue_ngap_id, store: amf_ue_ngap_id }
    - { field: ue.SecCtx,      store: sec_ctx }`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`type`}</code></td><td><code>{`extract`}</code></td><td>yes</td><td>—</td></tr>
<tr><td><code>{`field`}</code></td><td>string</td><td>one of</td><td>Shorthand: field path</td></tr>
<tr><td><code>{`store`}</code></td><td>string</td><td>one of</td><td>Shorthand: target key in <code>{`ue.Params`}</code></td></tr>
<tr><td><code>{`extracts`}</code></td><td>list</td><td>one of</td><td>List form: multiple <code>{`{field, store}`}</code> pairs</td></tr></tbody>
</table>
<h3 id="uplane_start"><code>{`uplane_start`}</code></h3>
<p>Arm the user-plane traffic generator after the NGAP send that surfaced the UPF tunnel parameters. Reads parameters from the gNB's <code>{`uplane:`}</code> config block. Allowed between sends.</p>
<CodeBlock lang="yaml" code={`- type: uplane_start`} />
<h3 id="ngap_realloc"><code>{`ngap_realloc`}</code></h3>
<p>NGAP-only. Reallocate <code>{`RAN-UE-NGAP-ID`}</code> on the same gNB before the next send. Used in stress flows.</p>
<h3 id="ngap_handover_swap"><code>{`ngap_handover_swap`}</code></h3>
<p>NGAP-only. Move the UE from the source gNB to the target gNB after <code>{`HandoverCommand`}</code>. Used by <code>{`templates/gnb/handover_source.yaml`}</code>.</p>
<h2 id="check-ops">Check ops</h2>
<table>
<thead><tr><th>Op</th><th>Required <code>{`expected`}</code></th><th>Passes when</th></tr></thead>
<tbody><tr><td><code>{`equals`}</code></td><td>yes</td><td>Field equals the expected value</td></tr>
<tr><td><code>{`not_empty`}</code></td><td>no</td><td>Field resolves and is non-zero</td></tr>
<tr><td><code>{`greater_than`}</code></td><td>yes</td><td>Field &gt; expected</td></tr>
<tr><td><code>{`less_than`}</code></td><td>yes</td><td>Field &lt; expected</td></tr>
<tr><td><code>{`greater_or_equal`}</code></td><td>yes</td><td>Field ≥ expected</td></tr>
<tr><td><code>{`less_or_equal`}</code></td><td>yes</td><td>Field ≤ expected</td></tr>
<tr><td><code>{`contains`}</code></td><td>yes</td><td>Field's string form contains the expected substring</td></tr>
<tr><td><code>{`exists`}</code></td><td>no</td><td>Field resolves (regardless of value)</td></tr></tbody>
</table>
<h2 id="template-expressions">Template expressions</h2>
<p><code>{`message_body`}</code> JSON, <code>{`params`}</code> values, and <code>{`expected`}</code> values may contain <code>{`{{...}}`}</code> expressions. Two forms.</p>
<CodeBlock lang="yaml" code={`# Variable lookup — dotted path through UE state
params:
  amf_id: "{{ue.AmfUeNgapId}}"

# Function call — registered template function with $ prefix
params:
  rand: "{{$randint 1 1000}}"`} />
<p>Whole-value templates (<code>{`&quot;{{x}}&quot;`}</code>) preserve the resolved value's native Go type. String interpolation (<code>{`&quot;prefix-{{x}}-suffix&quot;`}</code>) returns a string. Compilation happens at flow-load time; unknown function names and arity errors fail fast.</p>
<p>Resolution scopes:</p>
<ul>
<li><code>{`ue.X`}</code> — UE context fields (PascalCase)</li>
<li><code>{`params.X`}</code> — per-flow params (CLI <code>{`-params`}</code> or <code>{`params:`}</code> in suite step)</li>
<li>bare names — fields on the most recent inbound message</li>
</ul>
<h2 id="enricher-catalog">Enricher catalog</h2>
<p>Each enricher binds one message label to one Go function and one prototype struct. The FSM author references the label by name in <code>{`send.message`}</code>. Bare protocol names are listed; the catalog is registered at process init.</p>
<h3 id="ngap">NGAP</h3>
<table>
<thead><tr><th>Message</th><th>Prototype</th></tr></thead>
<tbody><tr><td>NGSetupRequest</td><td><code>{`NGAPNgSetupRequest`}</code></td></tr>
<tr><td>InitialUEMessage</td><td><code>{`NGAPInitialUEMessage`}</code></td></tr>
<tr><td>AuthResponse</td><td><code>{`NGAPNASUplinkNASTransport`}</code></td></tr>
<tr><td>SecurityModeComplete</td><td><code>{`NGAPNASUplinkNASTransport`}</code></td></tr>
<tr><td>InitialContextSetupResponse</td><td><code>{`NGAPInitialContextSetupResponse`}</code></td></tr>
<tr><td>RegistrationComplete</td><td><code>{`NGAPNASUplinkNASTransport`}</code></td></tr>
<tr><td>ConfigurationUpdateComplete</td><td><code>{`NGAPNASUplinkNASTransport`}</code></td></tr>
<tr><td>PDUSessionEstablishmentRequest</td><td><code>{`NGAPNASUplinkNASTransport`}</code></td></tr>
<tr><td>PDUSessionResourceSetupResponse</td><td><code>{`NGAPPduSessionResourceSetupResponse`}</code></td></tr>
<tr><td>DeregistrationRequest</td><td><code>{`NGAPNASUplinkNASTransport`}</code></td></tr>
<tr><td>UEContextReleaseCommand</td><td><code>{`NGAPUEContextReleaseCommand`}</code></td></tr>
<tr><td>UEContextReleaseComplete</td><td><code>{`NGAPUEContextReleaseComplete`}</code></td></tr>
<tr><td>PDUSessionReleaseRequest</td><td><code>{`NGAPNASUplinkNASTransport`}</code></td></tr>
<tr><td>PDUSessionResourceReleaseResponse</td><td><code>{`NGAPPduSessionResourceReleaseResponse`}</code></td></tr>
<tr><td>NGReset</td><td><code>{`NGAPNGReset`}</code></td></tr>
<tr><td>ServiceRequest</td><td><code>{`NGAPInitialUEMessage`}</code></td></tr>
<tr><td>UEContextReleaseRequest</td><td><code>{`NGAPUEContextReleaseRequest`}</code></td></tr>
<tr><td>UEContextSuspendRequest</td><td><code>{`NGAPUEContextSuspendRequest`}</code></td></tr>
<tr><td>RANConfigurationUpdate</td><td><code>{`NGAPRANConfigurationUpdate`}</code></td></tr>
<tr><td>MalformedInitialUEMessage</td><td><code>{`NGAPInitialUEMessage`}</code></td></tr>
<tr><td>HandoverRequired</td><td><code>{`NGAPHandoverRequired`}</code></td></tr>
<tr><td>HandoverNotify</td><td><code>{`NGAPHandoverNotify`}</code></td></tr></tbody>
</table>
<h3 id="diameter">Diameter</h3>
<p>S6a: <code>{`ULR`}</code>, <code>{`ULA`}</code>, <code>{`ULAUserUnknown`}</code>, <code>{`ULALoopDetected`}</code>, <code>{`AIR`}</code>, <code>{`AIA`}</code>, <code>{`PUR`}</code>, <code>{`PUA`}</code>, <code>{`IDR`}</code>, <code>{`IDA`}</code>, <code>{`CLR`}</code>, <code>{`CLA`}</code>, <code>{`NOR`}</code>, <code>{`NOA`}</code>. All on <code>{`DiameterMessageProto`}</code>.</p>
<p>Gx: <code>{`CCRInit`}</code>, <code>{`CCRTerminate`}</code>, <code>{`CCA`}</code>.</p>
<p>Rx: <code>{`AAR`}</code>, <code>{`AAA`}</code>.</p>
<h3 id="sbi">SBI</h3>
<p>UDM: <code>{`Nudm_SDM_GetSubscriptionData`}</code>, <code>{`Nudm_SDM_GetSubscriptionData_Answer`}</code>, <code>{`Nudm_UEAuthentication_GetAuthData`}</code>, <code>{`Nudm_UEAuthentication_GetAuthData_Answer`}</code>.</p>
<p>AUSF: <code>{`Nausf_UEAuthentication_Authenticate`}</code>, <code>{`Nausf_UEAuthentication_Authenticate_Answer`}</code>.</p>
<p>AMF: <code>{`Namf_Communication_N1N2MessageTransfer`}</code>, <code>{`Namf_Communication_N1N2MessageTransfer_Answer`}</code>.</p>
<h3 id="pfcp">PFCP</h3>
<p><code>{`PFCPHeartbeatRequest`}</code>, <code>{`PFCPHeartbeatResponse`}</code>, <code>{`PFCPAssociationSetupRequest`}</code>, <code>{`PFCPAssociationSetupResponse`}</code>, <code>{`PFCPSessionEstablishmentRequest`}</code>, <code>{`PFCPSessionEstablishmentResponse`}</code>, <code>{`PFCPSessionModificationRequest`}</code>, <code>{`PFCPSessionModificationResponse`}</code>, <code>{`PFCPSessionDeletionRequest`}</code>, <code>{`PFCPSessionDeletionResponse`}</code>.</p>
<h3 id="rest">REST</h3>
<p>Generic — flow authors declare the message label inline. The loader registers the label against <code>{`RESTMessageProto`}</code> + <code>{`EnrichRESTGeneric`}</code> at flow-load time. The shipped catch-all sentinels are <code>{`RESTGeneric`}</code> and <code>{`RESTGeneric_Answer`}</code>.</p>
<h2 id="examples">Examples</h2>
<h3 id="minimal-client-flow">Minimal client flow</h3>
<CodeBlock lang="yaml" code={`kind: flow
name: ng_setup
description: NG Setup procedure
category: functional
type: client
protocol: ngap
nf: gnb
initial_state: idle
final_states: [done, failed]
states:
  idle:
    transitions:
      - event: Start
        target: wait_resp
        actions:
          - type: send
            message: NGSetupRequest
  wait_resp:
    on_timeout: { duration: 10s, target: failed }
    transitions:
      - event: NGSetupResponse
        target: done`} />
<h3 id="server-flow">Server flow</h3>
<CodeBlock lang="yaml" code={`kind: flow
name: registration_amf
description: AMF stub responding to InitialUEMessage
type: server
protocol: ngap
nf: amf
initial_state: idle
final_states: [released]
states:
  idle:
    transitions:
      - event: InitialUEMessage
        target: released
        actions:
          - type: send
            message: UEContextReleaseCommand`} />
<h2 id="notes">Notes</h2>
<ul>
<li>A check action that fails aborts the transition; the FSM stays in the current state.</li>
<li>Send actions cannot precede checks within the same transition. The validator rejects this at flow-load.</li>
<li>Server flows must NOT have a <code>{`Start`}</code>-event transition at <code>{`initial_state`}</code> — they're reactive.</li>
<li>Client flows MUST have a <code>{`Start`}</code>-event transition at <code>{`initial_state`}</code>.</li>
<li><code>{`_self`}</code> is allowed only as the target of an <code>{`any_state_transition`}</code> and means "stay in the current state".</li>
</ul>
    </DocPage>
  );
}
