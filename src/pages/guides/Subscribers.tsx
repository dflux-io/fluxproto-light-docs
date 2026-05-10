import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function Subscribers() {
  return (
    <DocPage slug="guides/subscribers">
<h1>Subscribers</h1>
<p>A subscriber is one UE identity — SUPI, K, OPC, SQN, SNN, ciphering and integrity algorithms. NGAP/NAS authentication consumes them; Diameter S6a / Gx flows reuse the same pool, with the request enrichers reading <code>{`imsi`}</code> for User-Name (S6a) or Subscription-Id-Data (Gx) and falling back to UE-stable synthetic IDs when an entry doesn't carry an explicit IMSI. This guide covers provisioning, generation, the runtime pool, and listing/purging against Open5GS.</p>
<h2 id="three-ways-to-provide-subscribers">Three ways to provide subscribers</h2>
<ol>
<li><strong>Generate to YAML</strong> (<code>{`subscriber generate`}</code>) — synthesize random credentials, write to a YAML file you can commit or hand to a core network's provisioning UI.</li>
<li><strong>Provision into Open5GS</strong> (<code>{`subscriber provision`}</code>) — POST a YAML file's subscribers to an Open5GS WebUI so the AMF accepts auth attempts.</li>
<li><strong><code>{`-gen-subscriber`}</code> per run</strong> — synthesize a fresh subscriber per UE entirely in memory. No DB writes, no pool. Use when the AMF doesn't validate auth (lab AMFs / dev proxies).</li>
</ol>
<p>For runs that <em>do</em> need real subscribers, fluxproto-light loads them into its own DB via <code>{`-s &lt;file&gt;`}</code> and the pool serialises them across UEs.</p>
<h2 id="yaml-format">YAML format</h2>
<p><code>{`config/subscribers.yaml`}</code>:</p>
<CodeBlock lang="yaml" code={`config:
  mcc: "901"
  mnc: "070"
  snn: 5G:mnc070.mcc901.3gppnetwork.org
subscribers:
  - supi: "imsi-901-70-0000000001"
    imsi: "901700000000001"
    key: "465B5CE8B199B49FAA5F0A2EE238A6BC"
    opc: "E8ED289DEBA952E4283B54E88E6183CA"
    sqn: "000000000000"
    snn: "5G:mnc070.mcc901.3gppnetwork.org"
    ciphering: "NEA0"
    integrity: "NIA2"`} />
<p>SUPI format: <code>{`imsi-&lt;MCC&gt;-&lt;MNC&gt;-&lt;MSIN&gt;`}</code>. MCC is 3 digits, MNC is 2–3 digits, MSIN is digits-only. <code>{`key`}</code> and <code>{`opc`}</code> are 32 hex chars; <code>{`sqn`}</code> is 12 hex.</p>
<p><code>{`config:`}</code> provides defaults applied to subscriber rows that don't override.</p>
<h2 id="subscriber-generate"><code>{`subscriber generate`}</code></h2>
<p>Synthesize random credentials to YAML:</p>
<CodeBlock lang="bash" code={`fluxproto-light subscriber generate \\
    -count 100 \\
    -mcc 901 \\
    -mnc 070 \\
    -start-msin 1 \\
    -ciphering NEA0 \\
    -integrity NIA2 \\
    -o subscribers-100.yaml`} />
<table>
<thead><tr><th>Flag</th><th>Default</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>{`-count &lt;n&gt;`}</code></td><td>10</td><td>Number of subscribers to generate</td></tr>
<tr><td><code>{`-mcc &lt;mcc&gt;`}</code></td><td>901</td><td>Mobile Country Code</td></tr>
<tr><td><code>{`-mnc &lt;mnc&gt;`}</code></td><td>070</td><td>Mobile Network Code</td></tr>
<tr><td><code>{`-start-msin &lt;n&gt;`}</code></td><td>1</td><td>First MSIN; subsequent ones increment</td></tr>
<tr><td><code>{`-ciphering &lt;alg&gt;`}</code></td><td>NEA0</td><td>NEA0 / NEA1 / NEA2 / NEA3</td></tr>
<tr><td><code>{`-integrity &lt;alg&gt;`}</code></td><td>NIA2</td><td>NIA0 / NIA1 / NIA2 / NIA3</td></tr>
<tr><td><code>{`-o &lt;path&gt;`}</code></td><td>subscribers.yaml</td><td>Output path</td></tr></tbody>
</table>
<p>K and OPC are 16 random bytes each, hex-encoded. The MSIN sequence is deterministic (start + offset), so you can regenerate the same set with the same flags.</p>
<h2 id="subscriber-provision"><code>{`subscriber provision`}</code></h2>
<p>Push a YAML file into an Open5GS WebUI:</p>
<CodeBlock lang="bash" code={`fluxproto-light subscriber provision \\
    -file subscribers-100.yaml \\
    -host 192.168.1.139 \\
    -port 9999 \\
    -user admin \\
    -pass <password>`} />
<p>Defaults match a stock Open5GS WebUI (admin/1423). The provision call POSTs each subscriber to <code>{`/api/db/Subscriber`}</code>; existing entries with the same IMSI are updated.</p>
<h2 id="subscriber-list-subscriber-purge"><code>{`subscriber list`}</code> / <code>{`subscriber purge`}</code></h2>
<p>Inspect and clean up the Open5GS side:</p>
<CodeBlock lang="bash" code={`fluxproto-light subscriber list -host <ip> -port 9999 -user admin -pass <pwd>

fluxproto-light subscriber purge -host <ip> -port 9999 -user admin -pass <pwd> -yes`} />
<p><code>{`purge`}</code> deletes every subscriber from the WebUI; <code>{`-yes`}</code> skips the confirmation prompt. Use with care.</p>
<h2 id="gen-subscriber"><code>{`-gen-subscriber`}</code></h2>
<p>Skip the YAML/provision dance entirely:</p>
<CodeBlock lang="bash" code={`fluxproto-light run-flow -flow registration \\
    -templates templates -c config/lab.yaml \\
    -gen-subscriber -repetitions 100`} />
<p>The engine synthesizes a fresh <code>{`SubscriberEntity`}</code> per UE in memory. No DB writes, no pool contention. The pool-empty fail-fast guard is bypassed and <code>{`SubscriberPool.Release`}</code> is skipped at cleanup.</p>
<p>This works only when the AMF doesn't actually validate the auth challenge — lab AMFs, dev proxies, or any FSM that fails before reaching authentication. Real AMFs reject auth attempts because they have no row for the SUPI.</p>
<h2 id="the-pool-observable-behaviour">The pool — observable behaviour</h2>
<p>When real subscribers are loaded, the engine acquires through the in-process <code>{`SubscriberPool`}</code> rather than touching the DB directly. Observable behaviour:</p>
<ul>
<li><strong>One execution holds one subscriber for its full lifetime.</strong> Acquired at FSM start, released at terminal state (success or fail).</li>
<li><strong>Acquirers block when the pool is empty.</strong> A call that can't get a free subscriber waits on a FIFO queue. Default wait: 5 seconds, capped at the engine's per-flow timeout.</li>
<li><strong>Drain on shutdown.</strong> When the daemon shuts down, every in-flight Acquire wakes up with <code>{`ErrPoolDraining`}</code> so requests fail fast instead of timing out behind a closing listener.</li>
</ul>
<p>The pool is in-memory and per-process. Two daemons sharing one Postgres DB don't share an in-process queue, but their DB-level locks still serialise lookups (the repo path is atomic).</p>
<h2 id="pool-stats">Pool stats</h2>
<p>The daemon exposes pool stats on the <code>{`/status`}</code> endpoint, plus Prometheus collectors for total / locked / waiting and an acquire histogram (see <Link to="/reference/metrics">reference/metrics.md</Link>).</p>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong><code>{`ErrPoolEmpty`}</code></strong> — no subscribers in the DB and <code>{`-gen-subscriber`}</code> not set. Provision via <code>{`-s &lt;file&gt;`}</code>.</p>
<p><strong>Acquire timeouts under load</strong> — pool is too small for the workload. Either increase the pool size (provision more subscribers) or reduce <code>{`-rate`}</code>.</p>
<p><strong>Open5GS WebUI returns 401</strong> — wrong <code>{`-user`}</code>/<code>{`-pass`}</code>. The defaults match a stock Open5GS install; production deployments should change them.</p>
<p><strong>SUPI rejected at auth</strong> — the K/OPC in fluxproto's YAML doesn't match what's provisioned in the AMF/HSS. Re-provision or regenerate; the values must match exactly.</p>
<p><strong>Synthetic-IMSI Diameter requests</strong> — when a subscriber has no <code>{`imsi`}</code> field, the Diameter enrichers fall back to a UE-stable synthetic identifier so load tests can run without populating IMSI per row.</p>
    </DocPage>
  );
}
