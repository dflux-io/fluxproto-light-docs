import DocPage from '../components/DocPage';
import { Link } from 'react-router-dom';

export default function Glossary() {
  return (
    <DocPage slug="glossary">
<h1>Glossary</h1>
<p>Product-specific terms used throughout this documentation. 3GPP terminology (NGAP, NAS, AMF, gNB, etc.) is assumed and not redefined here.</p>
<h2 id="terms">Terms</h2>
<p><strong>Flow</strong>
: A finite-state machine encoding one protocol procedure. Defined as YAML (<code>{`kind: flow`}</code>) with <code>{`states`}</code>, <code>{`transitions`}</code>, <code>{`actions`}</code>, and <code>{`final_states`}</code>. The unit fluxproto-light executes — <code>{`run-flow -flow registration`}</code> runs one flow against one or more UEs.</p>
<p><strong>Path</strong>
: One traversal of a flow from <code>{`initial_state`}</code> to a final state. A flow with multiple <code>{`final_states`}</code> (e.g. <code>{`registered`}</code> and <code>{`failed`}</code>) has multiple paths; on a given execution a UE follows exactly one.</p>
<p><strong>Step</strong>
: One state transition inside a flow. The CLI <code>{`report show`}</code> view lists steps in order with their timestamps and TX/RX message types. The term also names one entry inside a suite (<code>{`SuiteStep`}</code>) — context disambiguates.</p>
<p><strong>Suite</strong>
: An ordered collection of flows defined as YAML (<code>{`kind: suite`}</code>) with <code>{`steps`}</code>. Each step independently acquires its own subscribers, runs its referenced flow with its own workload, and either continues or aborts the cycle based on <code>{`stop_on_failure`}</code>. Cleanup steps marked <code>{`always_run`}</code> execute even after an abort.</p>
<p><strong>Environment</strong>
: A YAML config file (e.g. <code>{`config/lab.yaml`}</code>) declaring the NFs in scope and the transports they use to reach the wire. Loaded with <code>{`-c &lt;file&gt;`}</code> for CLI runs, or stored in the daemon DB for API-driven runs.</p>
<p><strong>Execution</strong>
: One run of a flow or suite, identified by an execution ID (UUID). Persisted in the DB as a <code>{`ReportEntity`}</code> with the engine result, step log, message-type breakdown, and post-run check outcomes.</p>
<p><strong>NF role</strong>
: The kind of network function a flow simulates or talks to: <code>{`gnb`}</code>, <code>{`amf`}</code>, <code>{`smf`}</code>, <code>{`ausf`}</code>, <code>{`udm`}</code>, <code>{`pcf`}</code>, <code>{`nrf`}</code>, <code>{`upf`}</code>, <code>{`mme`}</code>, <code>{`pgw`}</code>, <code>{`af`}</code>, or <code>{`external`}</code>. Validated against the env at engine startup so a gNB-side flow cannot run against an AMF-only env.</p>
<p><strong>Client mode</strong>
: A flow that initiates the procedure. The engine fires a <code>{`Start`}</code> event into the FSM's <code>{`initial_state`}</code>, which dispatches the first <code>{`send`}</code>. Most NGAP gNB flows are client-mode.</p>
<p><strong>Server mode</strong>
: A flow that waits for a peer to send the first message. No <code>{`Start`}</code> event; the FSM auto-spawns when the inbound demux receives a matching message (e.g. <code>{`InitialUEMessage`}</code> for the <code>{`registration_amf`}</code> flow). Used for AMF, UDM, AUSF, UPF, and FGP-admin server flows.</p>
<p><strong>Enricher</strong>
: The Go function that fills protocol-specific fields on an outbound message before it is encoded onto the wire — e.g. <code>{`EnrichInitialUEMessage`}</code> populates <code>{`AmfUeNgapId`}</code>, <code>{`RanUeNgapId`}</code>, NAS payload from UE state. Flow authors reference enrichers by name in <code>{`send`}</code> actions; they don't write them.</p>
<p><strong>Check</strong>
: A <code>{`type: check`}</code> action that asserts a field on the most recent inbound message (or UE context) using one of the comparison operators: <code>{`equals`}</code>, <code>{`not_empty`}</code>, <code>{`greater_than`}</code>, <code>{`less_than`}</code>, <code>{`greater_or_equal`}</code>, <code>{`less_or_equal`}</code>, <code>{`contains`}</code>, <code>{`exists`}</code>. A failed check fails the flow.</p>
<p><strong>Action</strong>
: One operation inside a transition. Six types ship today: <code>{`send`}</code>, <code>{`check`}</code>, <code>{`extract`}</code>, <code>{`uplane_start`}</code>, <code>{`ngap_realloc`}</code>, <code>{`ngap_handover_swap`}</code>. See <Link to="/reference/flow-schema#action-types">reference/flow-schema.md</Link>.</p>
<p><strong>Workload</strong>
: How the engine spawns UEs over the lifetime of a run. Knobs: <code>{`repetitions`}</code> (UE count), <code>{`rate`}</code> (UEs per second; 0 = burst), <code>{`duration`}</code> (stop after wall-clock), <code>{`timeout`}</code> (per-UE).</p>
<p><strong>Subscriber</strong>
: One UE identity (SUPI + K + OPC + SNN + algorithms) used by NGAP/NAS authentication. Stored in the DB or generated in-memory via <code>{`-gen-subscriber`}</code>. The pool serialises subscribers per execution: one running UE holds one subscriber for its lifetime.</p>
<p><strong>Subscriber pool</strong>
: The runtime layer that hands subscribers to executions and queues acquirers when none are free. Observable behaviour: an execution holds its subscriber until terminal state, then releases it back to the pool.</p>
<p><strong>Lab</strong>
: The conventional name for the canonical single-gNB environment in <code>{`config/lab.yaml`}</code>. Documentation examples derive from this lab unless a page is explicitly about an advanced case.</p>
    </DocPage>
  );
}
