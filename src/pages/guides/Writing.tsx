import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function Writing() {
  return (
    <DocPage slug="guides/writing" lede="Flows are YAML files with kind: flow describing a finite-state machine for one protocol procedure. The engine drives the FSM per UE, dispatching transitions on inbound events (RX messages) and the synthetic Start event. This guide walks through the pieces of a flow YAML and what each one does. For exhaustive field tables, see reference/flow-schema.md.">
<h2 id="flow-anatomy">Flow anatomy</h2>
<p>Every flow has the same top-level shape:</p>
<CodeBlock lang="yaml" code={`kind: flow
name: <unique flow name>
description: <one-line summary>
detail: |
  <multi-line markdown for the catalog UI>
category: functional | negative | robustness | stability | lifecycle | load | stress
type: client | server
protocol: ngap | sbi | diameter | rest | pfcp
nf: gnb | amf | smf | ausf | udm | pcf | nrf | upf | mme | pgw | af | external
initial_state: <state name>
final_states:
  - <state name>
  - <state name>
states:
  <state name>:
    transitions: [...]
    on_timeout:
      duration: 10s
      target: <state name>
any_state_transitions: [...]`} />
<p>The shipped <code>{`templates/gnb/registration.yaml`}</code> is the canonical NGAP example. <code>{`templates/amf/registration_amf.yaml`}</code> is the canonical server-mode example.</p>
<h2 id="defining-states">Defining states</h2>
<p>A state is a node in the FSM. The engine sits in one state per UE and waits for an event that matches a <code>{`transition`}</code>. Each state can also declare <code>{`on_timeout`}</code> — a fallback transition that fires if no matching event arrives within the duration.</p>
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
<p>A <code>{`final_state`}</code> has no transitions — reaching one terminates the flow for that UE.</p>
<h2 id="transitions-and-events">Transitions and events</h2>
<p>A transition fires when an inbound event matches its <code>{`event:`}</code> clause. Three forms:</p>
<CodeBlock lang="yaml" code={`# Simple — fires on a single event name
- event: NASDownlinkTransport.AuthenticationRequest
  target: wait_security_mode

# OR-compound — fires when any one event in the list arrives
- event:
    or: [NASDownlinkTransport.AuthenticationRequest, NASDownlinkTransport.SecurityModeCommand]
  target: shortcut_state

# AND-compound — fires only when every event in the list has arrived
- event:
    and: [InitialContextSetupRequest, RegistrationAccept]
  target: registered`} />
<p>Event names match the wire-message form the protocol resolver emits. NGAP uses dotted nested forms (<code>{`NASDownlinkTransport.AuthenticationRequest`}</code>) for inner-NAS messages. Authors can also prefix with the protocol name (<code>{`ngap.X`}</code>, <code>{`diameter.X`}</code>) for visual disambiguation in multi-protocol flows — the matcher strips one leading prefix on either side before comparing.</p>
<p>Synthetic events:</p>
<ul>
<li><code>{`Start`}</code> — fired by the engine for every client-mode UE to drive the first transition out of <code>{`initial_state`}</code>.</li>
<li><code>{`Error`}</code> — emitted when an inbound message fails decoding or an enricher returns an error.</li>
<li><code>{`StateTimeout`}</code> — fired when an <code>{`on_timeout`}</code> block elapses (you don't reference this in <code>{`event:`}</code> — <code>{`on_timeout`}</code> itself is the wiring).</li>
<li><code>{`UplaneComplete`}</code> — fired after a <code>{`uplane_start`}</code> action finishes its run.</li>
</ul>
<h2 id="any_state_transitions">any_state_transitions</h2>
<p>Top-level transitions that fire from any state when no state-specific transition matched. Use for global error handling:</p>
<CodeBlock lang="yaml" code={`any_state_transitions:
  - event: Error
    target: failed`} />
<h2 id="action-types">Action types</h2>
<p>Every transition can carry an <code>{`actions:`}</code> list, executed in order when the transition fires. Six types ship today:</p>
<h3 id="send"><code>{`send`}</code></h3>
<p>Emit a message on the wire. <code>{`message:`}</code> names a registered enricher; the enricher fills protocol-specific fields from UE state. <code>{`message_body:`}</code> is optional pre-populated JSON merged into the typed message struct before the enricher runs. <code>{`params:`}</code> overlays runtime values. <code>{`protocol:`}</code> and <code>{`peer:`}</code> override the default routing — used in multi-protocol flows.</p>
<CodeBlock lang="yaml" code={`- type: send
  message: InitialUEMessage
  message_body: |
    {
      "criticality": 1,
      "rrc_establishment_cause": 0,
      "ue_context_request": 1
    }`} />
<h3 id="check"><code>{`check`}</code></h3>
<p>Assert a field on the most recent inbound message (or <code>{`ue.&lt;path&gt;`}</code> against UE context). Eight comparison ops: <code>{`equals`}</code>, <code>{`not_empty`}</code>, <code>{`greater_than`}</code>, <code>{`less_than`}</code>, <code>{`greater_or_equal`}</code>, <code>{`less_or_equal`}</code>, <code>{`contains`}</code>, <code>{`exists`}</code>. A failed check aborts the transition; the FSM stays in the current state and either receives a later matching event or hits <code>{`on_timeout`}</code>.</p>
<CodeBlock lang="yaml" code={`- type: check
  field: ue.AmfUeNgapId
  op: not_empty`} />
<p>Checks must come before any <code>{`send`}</code> in a transition.</p>
<h3 id="extract"><code>{`extract`}</code></h3>
<p>Read a field off the most recent inbound message and store it in <code>{`ue.Params[&lt;store key&gt;]`}</code> for later use. Two forms:</p>
<CodeBlock lang="yaml" code={`- type: extract
  field: amf_ue_ngap_id
  store: amf_ue_ngap_id

- type: extract
  extracts:
    - { field: amf_ue_ngap_id, store: amf_ue_ngap_id }
    - { field: ue.SecCtx, store: sec_ctx }`} />
<h3 id="uplane_start"><code>{`uplane_start`}</code></h3>
<p>Arm the user-plane traffic generator after the NGAP send that surfaced the UPF tunnel parameters. The parameters come from the gNB's <code>{`uplane:`}</code> config block and the inbound <code>{`PduSessionResourceSetupRequest`}</code>.</p>
<CodeBlock lang="yaml" code={`- type: uplane_start`} />
<p>See <Link to="/guides/user-plane-testing">user-plane-testing</Link> and the shipped <code>{`templates/gnb/uplane_traffic.yaml`}</code>.</p>
<h3 id="ngap_realloc"><code>{`ngap_realloc`}</code></h3>
<p>NGAP-only. Reallocate the <code>{`RAN-UE-NGAP-ID`}</code> on the same gNB before the next send. Used in stress flows to verify AMF tracking when the gNB renumbers a UE.</p>
<h3 id="ngap_handover_swap"><code>{`ngap_handover_swap`}</code></h3>
<p>NGAP-only. Move the UE from the source gNB to the target gNB after <code>{`HandoverCommand`}</code>. Used by <code>{`templates/gnb/handover_source.yaml`}</code> to switch the UE binding mid-flow.</p>
<h2 id="check-ops">Check ops</h2>
<table>
<thead><tr><th>Op</th><th>Passes when</th></tr></thead>
<tbody><tr><td><code>{`equals`}</code></td><td>Field equals <code>{`expected:`}</code></td></tr>
<tr><td><code>{`not_empty`}</code></td><td>Field resolves and is non-zero</td></tr>
<tr><td><code>{`greater_than`}</code></td><td>Field &gt; <code>{`expected:`}</code></td></tr>
<tr><td><code>{`less_than`}</code></td><td>Field &lt; <code>{`expected:`}</code></td></tr>
<tr><td><code>{`greater_or_equal`}</code></td><td>Field ≥ <code>{`expected:`}</code></td></tr>
<tr><td><code>{`less_or_equal`}</code></td><td>Field ≤ <code>{`expected:`}</code></td></tr>
<tr><td><code>{`contains`}</code></td><td>Field's string form contains <code>{`expected:`}</code> substring</td></tr>
<tr><td><code>{`exists`}</code></td><td>Field resolves (regardless of value)</td></tr></tbody>
</table>
<h2 id="template-expressions">Template expressions</h2>
<p><code>{`message_body:`}</code>, <code>{`params:`}</code> values, and <code>{`expected:`}</code> accept <code>{`{{...}}`}</code> templating. Two forms:</p>
<CodeBlock lang="yaml" code={`# Variable lookup — dotted path into the UE's resolution context
params:
  amf_ue_ngap_id: "{{ue.AmfUeNgapId}}"

# Function call — registered template function, $-prefixed
params:
  random_id: "{{$randint 1 1000}}"`} />
<p>A whole-value template (<code>{`&quot;{{x}}&quot;`}</code>) preserves the resolved value's native Go type. String interpolation (<code>{`&quot;prefix-{{x}}-suffix&quot;`}</code>) returns a string. Templates are compiled at flow-load time; unknown functions and arity errors fail before the first send.</p>
<h2 id="enrichers">Enrichers</h2>
<p>Enrichers are Go functions that fill protocol fields on outbound messages. You don't write them — you reference one by name in <code>{`send.message`}</code>. Shipped enricher counts:</p>
<ul>
<li>NGAP: 25 (NGSetupRequest, InitialUEMessage, AuthResponse, SecurityModeComplete, RegistrationComplete, ServiceRequest, DeregistrationRequest, PDUSession*, UEContextRelease*, NGReset, RANConfigurationUpdate, MalformedInitialUEMessage, HandoverRequired/Notify, ...)</li>
<li>Diameter: 22 (S6a: ULR/ULA, AIR/AIA, PUR/PUA, IDR/IDA, CLR/CLA, NOR/NOA + error variants; Gx: CCRInit/CCRTerminate/CCA; Rx: AAR/AAA)</li>
<li>SBI: 8 (Nudm_SDM_GetSubscriptionData, Nudm_UEAuthentication_GetAuthData, Nausf_UEAuthentication_Authenticate, Namf_Communication_N1N2MessageTransfer, plus matching <code>{`_Answer`}</code> server-side variants)</li>
<li>PFCP: 10 (Heartbeat, AssociationSetup, SessionEstablishment, SessionModification, SessionDeletion — request and response each)</li>
<li>REST: generic — flow authors declare arbitrary message names inline; one shipped enricher (<code>{`EnrichRESTGeneric`}</code>) sends/receives the JSON body verbatim.</li>
</ul>
<p>The full list is in <Link to="/reference/flow-schema#enricher-catalog">reference/flow-schema.md</Link>.</p>
<h2 id="client-vs-server-flows">Client vs server flows</h2>
<p><code>{`type: client`}</code> flows have a <code>{`Start`}</code> event transition out of <code>{`initial_state`}</code>. The engine fires <code>{`Start`}</code> per UE; the first <code>{`send`}</code> action emits the procedure's first message.</p>
<p><code>{`type: server`}</code> flows have no <code>{`Start`}</code> — they auto-spawn when an inbound demux matches a registered server-mode message at <code>{`initial_state`}</code>. There must be at least one transition at <code>{`initial_state`}</code> whose event matches an inbound RX message. The shipped <code>{`templates/amf/registration_amf.yaml`}</code>, <code>{`templates/sbi/nudm_sdm_get_server.yaml`}</code>, and <code>{`templates/rest/fgp_admin_server.yaml`}</code> are the canonical examples.</p>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong><code>{`unknown enricher &quot;X&quot;`}</code> at flow load</strong> — the <code>{`message:`}</code> value doesn't match any registered enricher name. Check the enricher catalog for the exact spelling; for REST, server-side flows reference enrichers registered at flow-load time via <code>{`RegisterRESTMessage`}</code>.</p>
<p><strong><code>{`event must be a string or {and: [...]} or {or: [...]}`}</code></strong> — your <code>{`event:`}</code> field is malformed. Use one of the three documented forms.</p>
<p><strong><code>{`state X has no transitions and is not a final state`}</code></strong> — every non-terminal state needs at least one transition (or <code>{`on_timeout`}</code>).</p>
<p><strong><code>{`client FSM must have a transition matching &quot;Start&quot;`}</code></strong> — client flows must dispatch on the synthetic <code>{`Start`}</code> event from <code>{`initial_state`}</code>.</p>
<p><strong><code>{`server FSM must not have a transition matching &quot;Start&quot;`}</code></strong> — server flows are reactive. Drop the <code>{`Start`}</code> transition.</p>
<p><strong>Check fails but trace shows the field is set</strong> — <code>{`field:`}</code> paths are case-sensitive. NGAP fields use lowercase-with-underscores (<code>{`amf_ue_ngap_id`}</code>); UE-context fields are PascalCase prefixed with <code>{`ue.`}</code> (<code>{`ue.AmfUeNgapId`}</code>).</p>
<p>A suite is a YAML file with <code>{`kind: suite`}</code> that orders a list of flow steps into one cycle. Each step runs its referenced flow with its own workload before the next step starts; subscribers are not shared across steps. Suites are strictly serial in v1 — no <code>{`rate:`}</code> at the suite level. This guide covers the YAML shape and the runner semantics.</p>
<h2 id="suite-anatomy">Suite anatomy</h2>
<CodeBlock lang="yaml" code={`kind: suite
name: <unique suite name>
description: <one-line summary>
steps:
  - name: <step name>
    flow: <flow name>
    repetitions: <int>
    rate: <float>
    duration: <duration>
    timeout: <duration>
    params:
      <key>: <value>
    trace: true
    gen_subscriber: true
    stop_on_failure: false
    always_run: true`} />
<p>The shipped <code>{`templates/suites/gnb_register_deregister.yaml`}</code> is the canonical example.</p>
<h2 id="ordered-steps">Ordered steps</h2>
<p>Steps execute in YAML order. Each step independently acquires its own subscribers from the pool — <code>{`repetitions: 5`}</code> on step 1 takes 5 subscribers, releases them at the end of the step, then step 2 takes 5 fresh ones. There is no subscriber sharing across steps in v1.</p>
<CodeBlock lang="yaml" code={`steps:
  - name: register
    flow: registration
    repetitions: 5
  - name: deregister
    flow: deregistration
    repetitions: 5
    always_run: true`} />
<h2 id="per-step-workload">Per-step workload</h2>
<p>Each step has its own <code>{`repetitions`}</code>, <code>{`rate`}</code>, <code>{`duration`}</code>, <code>{`timeout`}</code> — the same knobs <code>{`run-flow`}</code> exposes. They mirror <code>{`Engine.Workload`}</code>. CLI overrides (<code>{`-trace`}</code>, <code>{`-gen-subscriber`}</code>) OR with the per-step settings, so a CLI <code>{`-trace`}</code> opts every step in.</p>
<table>
<thead><tr><th>Field</th><th>Purpose</th><th>Default</th></tr></thead>
<tbody><tr><td><code>{`repetitions`}</code></td><td>UE count for this step</td><td>1</td></tr>
<tr><td><code>{`rate`}</code></td><td>UEs/s within this step (0 = burst)</td><td>0</td></tr>
<tr><td><code>{`duration`}</code></td><td>Stop spawning UEs after this elapses</td><td>0 (unlimited)</td></tr>
<tr><td><code>{`timeout`}</code></td><td>Per-UE flow timeout</td><td>30s</td></tr>
<tr><td><code>{`params`}</code></td><td>Overlay merged into each UE's per-flow params</td><td>nil</td></tr>
<tr><td><code>{`trace`}</code></td><td>TX/RX hex dump + JSON trace for this step</td><td>false</td></tr>
<tr><td><code>{`gen_subscriber`}</code></td><td>Synthesize subscribers per UE; skip pool/DB</td><td>false</td></tr></tbody>
</table>
<h2 id="stop_on_failure">stop_on_failure</h2>
<p>Default <code>{`true`}</code>. If a step's <code>{`EngineResult.AllPassed`}</code> is false, the cycle aborts before the next non-<code>{`always_run`}</code> step. Override with <code>{`stop_on_failure: false`}</code> to keep going regardless.</p>
<CodeBlock lang="yaml" code={`steps:
  - name: noisy_negative_test
    flow: malformed_nas
    stop_on_failure: false   # don't fail the whole suite if this misfires
  - name: real_thing
    flow: registration`} />
<h2 id="always_run">always_run</h2>
<p>A step marked <code>{`always_run: true`}</code> executes even when the cycle has aborted earlier. Use for cleanup steps that must run regardless of upstream failures — the equivalent of a <code>{`finally`}</code> block.</p>
<CodeBlock lang="yaml" code={`steps:
  - name: provision_pcc
    flow: rest_fgp_admin_add_pcc_rule_client
  - name: load_test
    flow: pdu_session_setup
    repetitions: 100
  - name: cleanup
    flow: rest_fgp_admin_delete_pcc_rule_client
    always_run: true`} />
<h2 id="params">params</h2>
<p>A map merged into each UE's per-flow params before any <code>{`{{params.X}}`}</code> template resolves. Useful when one suite reuses a flow but with different inputs per step:</p>
<CodeBlock lang="yaml" code={`steps:
  - name: register_us
    flow: registration
    params:
      mcc: "001"
      mnc: "01"
  - name: register_eu
    flow: registration
    params:
      mcc: "208"
      mnc: "01"`} />
<h2 id="trace">trace</h2>
<p>Per-step trace flag. Setting it on one step doesn't affect other steps. The CLI <code>{`-trace`}</code> flag OR's with this — one of them being true enables trace for that step.</p>
<h2 id="suite-cycle-semantics">Suite cycle semantics</h2>
<p>The runner repeats the full step list <code>{`cfg.Workload.Repetitions`}</code> times (or until <code>{`cfg.Workload.Duration`}</code> elapses, whichever applies). Each iteration is one <em>cycle</em>. The CLI exposes only the outer-loop knobs:</p>
<ul>
<li><code>{`-repetitions &lt;n&gt;`}</code> — number of full cycles (default 1)</li>
<li><code>{`-duration &lt;duration&gt;`}</code> — keep cycling back-to-back until this elapses</li>
<li><code>{`-timeout &lt;duration&gt;`}</code> — per-cycle deadline; each step inherits if the step doesn't override</li>
</ul>
<p>Suite-level <code>{`-rate`}</code> is rejected — suites are strictly serial in v1.</p>
<h2 id="reports">Reports</h2>
<p>Each cycle produces one <code>{`SuiteReportEntity`}</code> with one child <code>{`ReportEntity`}</code> per step. The CLI <code>{`report list-suites`}</code> and <code>{`report show-suite &lt;id&gt;`}</code> views browse them; the daemon UI does the same. The suite report's <code>{`AllPassed`}</code> is true only when every non-aborted step's report is <code>{`AllPassed`}</code>. <code>{`Aborted`}</code> is set when <code>{`stop_on_failure`}</code> cut the cycle short.</p>
<CodeBlock lang="bash" code={`fluxproto-light report list-suites
fluxproto-light report show-suite <suite-execution-id>`} />
<h2 id="validation">Validation</h2>
<p><code>{`fluxproto-light suite list -templates &lt;dir&gt;`}</code> walks the templates directory and surfaces any suite that fails parsing. Common failures:</p>
<ul>
<li><code>{`step %q: flow is required`}</code> — every step needs a <code>{`flow:`}</code> field.</li>
<li><code>{`duplicate step name %q`}</code> — step names must be unique within a suite.</li>
<li><code>{`step %q: rate must be &gt;= 0`}</code> — rates and durations cannot be negative.</li>
</ul>
<p>Step-level flow names are not resolved at suite-load time — they're resolved lazily by the runner against the DB-backed catalog. A suite that references a missing flow loads cleanly but fails at run time with <code>{`flow %q not found`}</code>.</p>
<h2 id="troubleshooting-2">Troubleshooting</h2>
<p><strong>Step skipped after a prior failure</strong> — that's <code>{`stop_on_failure: true`}</code> (the default) doing its job. Either set it to <code>{`false`}</code> on the upstream step or mark the cleanup step <code>{`always_run: true`}</code>.</p>
<p><strong>Subscribers exhausted between steps</strong> — every step takes its own batch from the pool. Provision enough subscribers for the largest step (or use <code>{`gen_subscriber: true`}</code> to synthesize per-UE subscribers in memory).</p>
<p><strong><code>{`-rate is not supported for run-suite`}</code></strong> — suites are serial. Move the rate into a per-step <code>{`rate:`}</code> field.</p>
    </DocPage>
  );
}
