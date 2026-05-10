import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function Quickstart() {
  return (
    <DocPage slug="introduction/quickstart" lede="By the end of this guide you will have built fluxproto-light, run the canonical registration flow against an AMF you reach over the lab network, and read back the report. About 10 minutes start to finish, assuming you already have an AMF reachable on 192.168.1.139:38412 (3GPP TS 38.413, NGAP).">
<p>If you want the conceptual model before the hands-on walk-through, read <Link to="/concepts/architecture">Concepts overview</Link> first — the rest of this page assumes you're happy to learn by doing.</p>
<h2 id="prerequisites">Prerequisites</h2>
<ul>
<li>Go 1.25+ (<code>{`go version`}</code>)</li>
<li>Make</li>
<li>An AMF reachable on SCTP port 38412 — Open5GS, free5GC, or any vendor AMF that admits the gNB defined in <code>{`config/lab.yaml`}</code></li>
<li>The PLMN MCC=901, MNC=70 provisioned on that AMF, or a <code>{`lab.yaml`}</code> you've edited to match your AMF's PLMN</li>
</ul>
<h2 id="step-1-build-the-binary">Step 1 — Build the binary</h2>
<CodeBlock lang="bash" code={`make`} />
<p>You should see <code>{`[INFO] Building fluxproto-light for linux/amd64...`}</code> and the binary land at <code>{`bin/fluxproto-light`}</code>.</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light -v`} />
<p>Expected output:</p>
<CodeBlock lang="" code={`fluxproto-light <version>`} />
<h2 id="step-2-inspect-the-lab-config">Step 2 — Inspect the lab config</h2>
<CodeBlock lang="bash" code={`cat config/lab.yaml`} />
<p>The shipped <code>{`lab.yaml`}</code> declares one gNB (<code>{`GNBENF`}</code>) on PLMN 901/70 dialing one AMF at <code>{`192.168.1.139:38412`}</code> over SCTP. If your AMF lives elsewhere, edit the <code>{`peers:`}</code> block now.</p>
<h2 id="step-3-list-the-available-flows">Step 3 — List the available flows</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light flow list -templates templates`} />
<p>You'll see 40 flows across NGAP, Diameter, SBI, REST, and PFCP. Look for the row named <code>{`registration`}</code> — that's the one we'll run.</p>
<h2 id="step-4-check-transport-connectivity">Step 4 — Check transport connectivity</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light check -c config/lab.yaml`} />
<p>Expected output (one row per gNB→AMF pair):</p>
<CodeBlock lang="" code={`[fpl] checking transport (1 gNBs)

  GNB                  AMF                       STATUS   LATENCY      ERROR
  ---                  ---                       ------   -------      -----
  GNBENF               192.168.1.139:38412       OK       12ms`} />
<p>If you see <code>{`FAIL`}</code>, your AMF isn't reachable on SCTP — fix that before continuing. The error column shows whether the SCTP handshake or the NGSetup procedure failed.</p>
<h2 id="step-5-run-the-registration-flow">Step 5 — Run the registration flow</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-flow \\
    -flow registration \\
    -templates templates \\
    -c config/lab.yaml \\
    -s config/subscribers.yaml \\
    -trace`} />
<p><code>{`-trace`}</code> prints every TX/RX hex dump plus a JSON trace of each FSM step. Strip it for production.</p>
<p>Expected tail:</p>
<CodeBlock lang="" code={`==> Flow: registration
    Result: PASS
    Duration: 187ms
    Steps: 7
    Final state: registered`} />
<h2 id="step-6-re-run-as-a-small-load-test">Step 6 — Re-run as a small load test</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-flow \\
    -flow registration \\
    -templates templates \\
    -c config/lab.yaml \\
    -s config/subscribers.yaml \\
    -repetitions 10 \\
    -rate 5`} />
<p>10 UEs at 5 starts/s. Each UE acquires its own subscriber from the pool. The summary at the end aggregates per-flow latency.</p>
<h2 id="step-7-read-a-report-from-the-db">Step 7 — Read a report from the DB</h2>
<p>The CLI persists every run into <code>{`./fpl.db`}</code> (SQLite). List recent runs:</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light report list`} />
<p>Pick a report ID and inspect it:</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light report <report-id>`} />
<h2 id="what-you-built">What you built</h2>
<p>You've built fluxproto-light, validated SCTP and NGSetup against a real AMF, run a 5G UE registration with full authentication and security activation, and produced a stored report with per-step timings. From here, the rest of the tool's surface is two more concepts — describing different procedures (custom flows) and composing them (suites).</p>
    </DocPage>
  );
}
