import DocPage from '../../components/DocPage';
import { Link } from 'react-router-dom';

export default function Introduction() {
  return (
    <DocPage slug="introduction">
<h1>What is fluxproto-light</h1>
<p>fluxproto-light is a 5G/4G protocol load and conformance tester. One Go binary that simulates network elements (gNB, AMF, MME, UDM, AUSF, SMF/UPF, …) and drives deterministic procedures over NGAP, Diameter, SBI, REST, and PFCP — plus GTP-U user-plane traffic on N3 — against real or simulated cores.</p>
<p>It is for the test/integration engineer who needs to gate a build with a registration smoke run, lean on an AMF for an hour with a hundred concurrent UEs, exercise a vendor's policy plane via Diameter Gx and Rx, or terminate user-plane traffic on a clean receiver and read the throughput back.</p>
<h2 id="what-ships">What ships</h2>
<ul>
<li><strong>5 wire protocols</strong> — NGAP/SCTP (3GPP TS 38.413), Diameter S6a/Gx/Rx (RFC 6733; 3GPP TS 29.272/29.212/29.214), SBI HTTP/2 (3GPP TS 29.500-series), REST HTTP/2, PFCP (3GPP TS 29.244)</li>
<li><strong>40 ready-to-run flow templates</strong> across NGAP (16), Diameter (14), SBI (4), PFCP (2), REST (2), one multi-protocol — see the <Link to="/reference/catalogs">flow catalog</Link></li>
<li><strong>A declarative YAML schema</strong> for authoring custom flows as state machines — <code>{`send`}</code>, <code>{`check`}</code>, <code>{`extract`}</code>, <code>{`uplane_start`}</code> actions; eight check ops; <code>{`{{...}}`}</code> template expressions</li>
<li><strong>Suite runner</strong> with per-step workload, <code>{`stop_on_failure`}</code> gating, <code>{`always_run`}</code> cleanup steps, and JSON reports for CI gating</li>
<li><strong>NF roles</strong> for gNB, AMF, SMF, AUSF, UDM, PCF, NRF, UPF, MME, PGW, AF, plus <code>{`external`}</code> for non-3GPP peers</li>
<li><strong>Server-mode flows</strong> — auto-spawn on first inbound message; ship for AMF, UDM, AUSF, UPF, FGP-admin</li>
<li><strong>GTP-U user-plane</strong> via embedded DPDK (<code>{`dfxp-c`}</code>) or kernel-socket userspace receiver</li>
<li><strong>Daemon mode</strong> — HTTP API, JWT auth, embedded web UI, cron-style scheduling, Prometheus metrics</li>
<li><strong>Single static binary</strong> (Go 1.25); SQLite default, Postgres via connection string</li>
</ul>
<h2 id="how-its-used">How it's used</h2>
<p>Two deployment modes, same engine underneath:</p>
<ul>
<li><strong>CLI</strong> — <code>{`fluxproto-light run-flow -flow registration -c lab.yaml`}</code>. One-shot, deterministic, exits with <code>{`0`}</code> or <code>{`1`}</code>. The mode CI gates plug into.</li>
<li><strong>Daemon</strong> — long-lived, REST API + web UI + scheduler + metrics. The mode a continuously-running test plane plugs into.</li>
</ul>
<p>Both share the same flow catalog, the same protocol stacks, the same FSM dispatcher. Same <code>{`EngineResult`}</code> JSON in both.</p>
<h2 id="what-its-not">What it's not</h2>
<p>fluxproto-light is intentionally not a 3GPP simulator. It does not implement the full state machine of any NF. It implements the FSM model the <em>test author</em> declares — which is exactly what a tester wants for conformance and load work and exactly what a simulator wants to avoid.</p>
<p>If you need a working AMF, run an AMF; the shipped <code>{`registration_amf`}</code> flow is a wiring stub, not a replacement.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/introduction">Why fluxproto-light</Link> — when to pick it, what it replaces</li>
<li><Link to="/introduction/quickstart">Quickstart</Link> — build, run a flow, read a report (10 minutes)</li>
<li><Link to="/concepts/architecture">Concepts overview</Link> — flow, FSM, suite, environment in depth</li>
<li><Link to="/reference/catalogs">Flow catalog</Link> — every shipped flow</li>
</ul>
<p>This page is the "is this the right tool for me" gate. Read it before sinking time into the rest of the docs.</p>
<h2 id="when-to-pick-fluxproto-light">When to pick fluxproto-light</h2>
<p>You should pick fluxproto-light when:</p>
<ul>
<li><strong>You need a deterministic test, not a working NF.</strong> Conformance and negative tests want to know <em>exactly</em> which messages went out, exactly which checks passed, and exactly which final state the FSM landed in. A real AMF or HSS gives you a black box. fluxproto-light gives you the script.</li>
<li><strong>You drive multiple protocols on the same UE.</strong> A test that registers a UE on NGAP <em>and</em> validates the parallel S6a profile fetch on Diameter is one flow in fluxproto-light. Two separate tools is two test suites that can drift.</li>
<li><strong>You need both load and conformance from the same model.</strong> The same <code>{`registration`}</code> flow runs as a 1-UE conformance check and as a 1000-UE/s load burst — same YAML, different <code>{`-rate`}</code> and <code>{`-repetitions`}</code>.</li>
<li><strong>You want to gate CI without standing up a tester binary.</strong> A static Go binary, a <code>{`-output json`}</code> flag, and an exit code are everything CI needs. No JVM, no Python venv, no lab-only tools.</li>
<li><strong>Your tests need to live in version control next to the code they test.</strong> YAML flow definitions diff cleanly in PRs; new flows are copy-paste-edit from a sibling.</li>
</ul>
<h2 id="when-not-to-pick-it">When <em>not</em> to pick it</h2>
<p>You should pick something else when:</p>
<ul>
<li><strong>You need a working network function in production.</strong> fluxproto-light's <code>{`registration_amf`}</code> flow is a wiring stub. Real AMFs implement the full registration state machine; fluxproto-light implements whichever subset your test declares. Run Open5GS, free5GC, or a vendor AMF for production.</li>
<li><strong>You need every 3GPP procedure out of the box.</strong> The shipped catalog covers the common procedures; less common ones (mobility-restriction-list updates, AMF status-indication, UPF F-TEID lifecycle nuances beyond a single setup) need authoring. The schema makes that tractable, but it's not a click-once experience.</li>
<li><strong>You don't have a 3GPP-aware author on the team.</strong> Flow YAML uses 3GPP terminology directly — TACs, GUAMIs, SUPIs, NAS PDUs. There's no abstraction that hides the protocol from the author.</li>
<li><strong>You need a GUI-driven recorder/replayer.</strong> This is a CLI- and YAML-first tool. A web UI exists for browsing reports, not for authoring tests.</li>
</ul>
<h2 id="what-it-replaces">What it replaces</h2>
<table>
<thead><tr><th>If you currently use…</th><th>fluxproto-light covers…</th></tr></thead>
<tbody><tr><td>Hand-rolled Python / Go scripts driving SCTP sockets</td><td>Yes — same level of control with a structured FSM model and free reporting</td></tr>
<tr><td><code>{`ng40`}</code> / <code>{`tcpdump`}</code>-and-stare</td><td>Yes for procedure-level testing; no for fine packet forensics</td></tr>
<tr><td>A vendor's tester appliance</td><td>Yes for the procedures it ships; gaps fillable via custom YAML</td></tr>
<tr><td>Open5GS as a fake gNB</td><td>Replaces the gNB side cleanly; the AMF side stays Open5GS</td></tr>
<tr><td><code>{`wrk`}</code> / <code>{`bombardier`}</code> against an SBI endpoint</td><td>Yes — declare a SBI flow, set <code>{`-rate`}</code></td></tr></tbody>
</table>
<h2 id="strengths">Strengths</h2>
<ul>
<li><strong>Deterministic FSM dispatch.</strong> Every event maps to exactly one transition. A passing test means the procedure took the path you specified — not "something close to it".</li>
<li><strong>One catalog, every protocol.</strong> Adding NGAP coverage doesn't require a different tool than adding Diameter coverage.</li>
<li><strong>Load and conformance from the same definition.</strong> The flow is the test; the workload knobs are orthogonal.</li>
<li><strong>CI-shaped output.</strong> Stable JSON, deterministic exit codes, no interactive prompts.</li>
<li><strong>Single static binary.</strong> No runtime to install, no language ecosystem to manage. Cross-compile and ship.</li>
</ul>
<h2 id="limitations-to-know-about-up-front">Limitations to know about up front</h2>
<ul>
<li><strong>Authoring requires 3GPP fluency.</strong> Flow YAML names protocols and field paths directly.</li>
<li><strong>Server-mode is a stub.</strong> The shipped server flows validate wiring; full responder implementations are case-by-case authoring.</li>
<li><strong>DPDK user-plane requires privileged setup.</strong> Huge pages, NIC binding, CAP_SYS_ADMIN. Userspace mode runs anywhere but caps at a few hundred kpps.</li>
<li><strong>No full-text search in the docs UI yet</strong> — pick from the left nav.</li>
</ul>
<h2 id="where-to-go-next-2">Where to go next</h2>
<ul>
<li><Link to="/introduction/quickstart">Quickstart</Link> if you want hands-on now</li>
<li><Link to="/concepts/architecture">Concepts overview</Link> if you want the model first</li>
<li><Link to="/reference/catalogs">Flow catalog</Link> to see what ships</li>
</ul>
    </DocPage>
  );
}
