import DocPage from '../../components/DocPage';
import { Link } from 'react-router-dom';

export default function Introduction() {
  return (
    <DocPage slug="introduction" lede="fluxproto-light is a 5G/4G protocol load and conformance tester — one Go binary that simulates network elements such as gNB, AMF, MME, UDM, AUSF, and SMF/UPF. It drives deterministic procedures over NGAP, Diameter, SBI, REST, and PFCP, plus GTP-U user-plane traffic on N3, against real or simulated cores.">
<p>It is for the test/integration engineer who needs to gate a build with a registration smoke run, lean on an AMF for an hour with a hundred concurrent UEs, exercise a vendor's policy plane via Diameter Gx and Rx, or terminate user-plane traffic on a clean receiver and read the throughput back.</p>
<h2 id="what-ships">What ships</h2>
<ul>
<li><strong>Five wire protocols</strong> — NGAP/SCTP (3GPP TS 38.413), Diameter S6a/Gx/Rx (RFC 6733; 3GPP TS 29.272/29.212/29.214), SBI HTTP/2 (3GPP TS 29.500-series), REST HTTP/2, PFCP (3GPP TS 29.244)</li>
<li><strong>278 ready-to-run flows and 21 suites</strong> across NGAP (79), SBI (97), REST (60), PFCP (28), and Diameter (14) — browse the <Link to="/reference/catalogs">flow catalog</Link>, or read the source YAML in the <a href="https://github.com/dflux-io/fluxproto-light-templates">templates repository</a></li>
<li><strong>A declarative YAML schema</strong> for authoring custom flows as state machines — six action types (<code>{`send`}</code>, <code>{`check`}</code>, <code>{`extract`}</code>, <code>{`uplane_start`}</code>, <code>{`ngap_realloc`}</code>, <code>{`ngap_handover_swap`}</code>); nine check operators; <code>{`{{...}}`}</code> template expressions</li>
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
<li><Link to="/introduction/why">Why fluxproto-light</Link> — when to pick it, what it replaces, where its limits are</li>
<li><Link to="/introduction/quickstart">Quickstart</Link> — build, run a flow, read a report (10 minutes)</li>
<li><Link to="/concepts/architecture">Concepts overview</Link> — flow, FSM, suite, environment in depth</li>
<li><Link to="/reference/catalogs">Flow catalog</Link> — every shipped flow and suite</li>
</ul>
    </DocPage>
  );
}
