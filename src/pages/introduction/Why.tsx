import DocPage from '../../components/DocPage';
import { Link } from 'react-router-dom';

export default function Why() {
  return (
    <DocPage slug="introduction/why" lede="When fluxproto-light is the right tool, when it is not, and what it replaces. Read this before sinking time into the rest of the docs — it is the decision gate.">
<p>fluxproto-light drives deterministic protocol procedures over NGAP, Diameter, SBI, REST, and PFCP — plus GTP-U user-plane traffic — against real or simulated cores. It is not a network function. The sections below tell you whether that fits your problem.</p>
<h2 id="when-to-pick-it">When to pick fluxproto-light</h2>
<p>Pick fluxproto-light when:</p>
<ul>
<li><strong>You need a deterministic test, not a working NF.</strong> Conformance and negative tests want to know exactly which messages went out, which checks passed, and which final state the run landed in. A real AMF or HSS gives you a black box; fluxproto-light gives you the script.</li>
<li><strong>You drive multiple protocols on the same UE.</strong> A test that registers a UE over NGAP and validates the parallel S6a profile fetch over Diameter is one flow. Two separate tools means two test suites that drift apart.</li>
<li><strong>You need both load and conformance from one model.</strong> The same <code>{`registration`}</code> flow runs as a single-UE conformance check or as a 1000-UE/s burst — same YAML, different <code>{`-rate`}</code> and <code>{`-repetitions`}</code>.</li>
<li><strong>You want to gate CI without standing up a tester binary.</strong> A static Go binary, an exit code, and a JSON report are everything CI needs. No JVM, no Python virtual environment, no lab-only appliance.</li>
<li><strong>Your tests live in version control next to the code they exercise.</strong> Flow YAML diffs cleanly in pull requests, and a new flow is copy-paste-edit from a sibling.</li>
</ul>
<h2 id="when-not-to-pick-it">When not to pick it</h2>
<p>Pick something else when:</p>
<ul>
<li><strong>You need a working network function in production.</strong> The shipped <code>{`registration_amf`}</code> flow is a wiring stub. Real AMFs implement the full registration state machine; fluxproto-light implements whichever subset your test declares. Run Open5GS, free5GC, or a vendor AMF for production.</li>
<li><strong>You need every 3GPP procedure out of the box.</strong> The catalog covers the common procedures; less common ones — mobility-restriction-list updates, AMF status indication, UPF F-TEID lifecycle nuances beyond a single setup — need authoring. The schema makes that tractable, but it is not click-once.</li>
<li><strong>You have no 3GPP-aware author on the team.</strong> Flow YAML uses 3GPP terminology directly — TACs, GUAMIs, SUPIs, NAS PDUs. Nothing hides the protocol from the author.</li>
<li><strong>You need a GUI-driven recorder and replayer.</strong> This is a CLI- and YAML-first tool. The web UI browses reports; it does not author tests.</li>
</ul>
<h2 id="what-it-replaces">What it replaces</h2>
<p>Most teams arrive with an existing approach. Here is how fluxproto-light maps onto the common ones:</p>
<table>
<thead><tr><th>If you currently use…</th><th>fluxproto-light covers…</th></tr></thead>
<tbody>
<tr><td>Hand-rolled Python or Go scripts driving SCTP sockets</td><td>Yes — the same level of control with a structured state-machine model and reporting for free</td></tr>
<tr><td><code>{`ng40`}</code> or <code>{`tcpdump`}</code>-and-stare</td><td>Yes for procedure-level testing; no for fine packet forensics</td></tr>
<tr><td>A vendor's tester appliance</td><td>Yes for the procedures it ships; gaps are fillable with custom YAML</td></tr>
<tr><td>Open5GS as a fake gNB</td><td>Replaces the gNB side cleanly; the AMF side stays Open5GS</td></tr>
<tr><td><code>{`wrk`}</code> or <code>{`bombardier`}</code> against an SBI endpoint</td><td>Yes — declare an SBI flow and set <code>{`-rate`}</code></td></tr>
</tbody>
</table>
<h2 id="strengths">Strengths</h2>
<ul>
<li><strong>Deterministic dispatch.</strong> Every event maps to exactly one transition. A passing test means the procedure took the path you specified — not something close to it.</li>
<li><strong>One catalog, every protocol.</strong> Adding NGAP coverage uses the same tool as adding Diameter coverage. The catalog ships 278 flows and 21 suites across NGAP, SBI, REST, PFCP, and Diameter — browse the <Link to="/reference/catalogs">flow and suite catalog</Link>.</li>
<li><strong>Load and conformance from one definition.</strong> The flow is the test; the workload knobs are orthogonal to it.</li>
<li><strong>CI-shaped output.</strong> The CLI exits <code>{`0`}</code> when every check passes and <code>{`1`}</code> otherwise, and persists a JSON report you read back with <code>{`fluxproto-light report`}</code>. No interactive prompts.</li>
<li><strong>Single static binary.</strong> No runtime to install and no language ecosystem to manage. Cross-compile and ship.</li>
</ul>
<h2 id="limitations">Limitations to know about up front</h2>
<ul>
<li><strong>Authoring requires 3GPP fluency.</strong> Flow YAML names protocols and field paths directly.</li>
<li><strong>Server-mode flows are stubs.</strong> The shipped server-mode flows validate wiring; full responder implementations are case-by-case authoring.</li>
<li><strong>The DPDK user-plane needs privileged setup.</strong> Huge pages, NIC binding, and <code>{`CAP_SYS_ADMIN`}</code>. Userspace mode runs anywhere but caps at a few hundred kpps.</li>
</ul>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/introduction">Overview</Link> — what ships, how it is used, and what it is not</li>
<li><Link to="/introduction/quickstart">Quickstart</Link> — build, run a flow, and read a report in about ten minutes</li>
</ul>
    </DocPage>
  );
}
