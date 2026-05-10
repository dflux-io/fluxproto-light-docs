import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';

export default function UserPlaneTesting() {
  return (
    <DocPage slug="guides/user-plane-testing">
<h1>User-plane testing</h1>
<p>GTP-U user-plane testing is separate from signalling. Once a UE has its PDU session established (via the NGAP <code>{`pdu_session_setup`}</code> flow), the gNB can drive real IP traffic through the UPF on N3 (3GPP TS 29.281) and measure throughput, latency, jitter, and drop. fluxproto-light has two user-plane backends — userspace kernel sockets for portability, DPDK for line-rate. This guide covers both.</p>
<h2 id="two-backends">Two backends</h2>
<table>
<thead><tr><th>Backend</th><th>When to pick</th></tr></thead>
<tbody><tr><td><code>{`uspace`}</code> (userspace)</td><td>Functional checks, low rates (≤ a few hundred Mbps), no privileged NIC binding. Runs on any Linux.</td></tr>
<tr><td><code>{`dpdk`}</code></td><td>Throughput / latency benchmarks. Requires huge pages + a NIC bound to a DPDK-compatible driver.</td></tr></tbody>
</table>
<p>The two backends terminate the <em>receiver</em> side — they sit "behind the UPF" on N6/N9 (plain IP, GTP-U already stripped) or, in DPDK mode with <code>{`-gtp`}</code>, terminate GTP tunnels themselves.</p>
<p>The <em>sender</em> side is a flow action: <code>{`templates/gnb/uplane_traffic.yaml`}</code> runs the registration + PDU session sequence then triggers <code>{`uplane_start`}</code>, which arms the gNB-side traffic generator using parameters from the inbound <code>{`PduSessionResourceSetupRequest`}</code> and the gNB's <code>{`uplane:`}</code> config block.</p>
<h2 id="configure-the-gnb-sender">Configure the gNB sender</h2>
<p>In your env's gNB block:</p>
<CodeBlock lang="yaml" code={`nfs:
  - name: GNBENF
    role: gnb
    transport: ngap-out
    gnb:
      global_id: { ... }
      supported_tas: [ ... ]
      uplane:
        type: USPACE             # or DPDK
        protocol: 1              # 1=ICMP, 2=UDP, 3=TCP
        duration: "5s"
        target_addr: "8.8.8.8"   # destination behind the UPF`} />
<p><code>{`type: USPACE`}</code> runs an in-process userspace generator (kernel sockets). <code>{`type: DPDK`}</code> shells out to the embedded <code>{`fpl-dpdk-c`}</code> binary (extracted from the Go binary into a temp dir on first use, see <code>{`make embed-dfxpc`}</code>).</p>
<p><code>{`local_gtpu`}</code> on the NGAP transport is the IP the gNB advertises to the UPF as its N3 endpoint — the UPF will tunnel return traffic there.</p>
<h2 id="server-uspace-userspace-receiver"><code>{`server uspace`}</code> — userspace receiver</h2>
<CodeBlock lang="bash" code={`fluxproto-light server uspace \\
    -protocol udp \\
    -listen 0.0.0.0 \\
    -port-start 5001 \\
    -port-num 4`} />
<p>Per-protocol behaviour:</p>
<ul>
<li><strong>UDP</strong>: <code>{`ListenPacket`}</code> per port; echoes each datagram back to the sender.</li>
<li><strong>TCP</strong>: <code>{`Listen`}</code> per port. The kernel completes the SYN/SYN-ACK so a SYN-only client sees its RTT reply even when <code>{`Accept()`}</code> doesn't fire. Application-layer echo runs after the full 3-way handshake.</li>
<li><strong>ICMP</strong>: raw ICMP socket; replies to echo requests. Note: most Linux kernels also reply automatically — set <code>{`net.ipv4.icmp_echo_ignore_all=1`}</code> to let this server be the responder.</li>
</ul>
<p>Flags:</p>
<table>
<thead><tr><th>Flag</th><th>Default</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>{`-protocol icmp|udp|tcp`}</code></td><td>(required)</td><td>Protocol to serve</td></tr>
<tr><td><code>{`-listen &lt;ip&gt;`}</code></td><td><code>{`0.0.0.0`}</code></td><td>Bind IP</td></tr>
<tr><td><code>{`-port-start &lt;n&gt;`}</code></td><td>5001</td><td>First port for UDP/TCP</td></tr>
<tr><td><code>{`-port-num &lt;n&gt;`}</code></td><td>1</td><td>How many sequential ports to bind</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>forever</td><td>Run for this then exit</td></tr>
<tr><td><code>{`-payload-size &lt;n&gt;`}</code></td><td>0</td><td>Echo payload size override</td></tr>
<tr><td><code>{`-metrics-port &lt;n&gt;`}</code></td><td>0 (off)</td><td>Prometheus metrics endpoint</td></tr></tbody>
</table>
<p>ICMP needs <code>{`CAP_NET_RAW`}</code>; either run as root or grant the capability.</p>
<h2 id="server-dpdk-dpdk-receiver"><code>{`server dpdk`}</code> — DPDK receiver</h2>
<CodeBlock lang="bash" code={`sudo fluxproto-light server dpdk \\
    -protocol udp \\
    -port-pci 0000:00:09.0 \\
    -port-addr 192.168.1.141 \\
    -port-gateway 192.168.1.1 \\
    -listen 192.168.1.141 \\
    -port-start 5678 \\
    -port-num 1`} />
<p>Flags specific to DPDK:</p>
<table>
<thead><tr><th>Flag</th><th>Required</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>{`-protocol icmp|udp|tcp`}</code></td><td>yes</td><td>Protocol to serve</td></tr>
<tr><td><code>{`-port-pci &lt;pci&gt;`}</code></td><td>yes</td><td>NIC PCI address bound to a DPDK driver</td></tr>
<tr><td><code>{`-port-addr &lt;ip&gt;`}</code></td><td>yes</td><td>IP for the PCI port</td></tr>
<tr><td><code>{`-port-gateway &lt;ip&gt;`}</code></td><td>yes</td><td>Gateway IP for the PCI port</td></tr>
<tr><td><code>{`-listen &lt;ip&gt;`}</code></td><td>yes</td><td>Server's own bind IP (passed as <code>{`--server`}</code> to fpl-dpdk-c)</td></tr>
<tr><td><code>{`-port-start &lt;port&gt;`}</code></td><td>yes</td><td>First listen port</td></tr>
<tr><td><code>{`-port-num &lt;n&gt;`}</code></td><td>no (default 1)</td><td>Number of listen ports</td></tr>
<tr><td><code>{`-cpu &lt;n&gt;`}</code></td><td>no (default 0)</td><td>CPU index for the DPDK lcore</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>no</td><td>Run for this then exit (clamped to ≥ 5s)</td></tr>
<tr><td><code>{`-payload-size &lt;n&gt;`}</code></td><td>no</td><td>Response payload size</td></tr>
<tr><td><code>{`-keepalive &lt;duration&gt;`}</code></td><td>no</td><td>TCP keepalive interval (e.g. <code>{`1s`}</code>)</td></tr>
<tr><td><code>{`-client-allow &lt;ip&gt;`}</code> + <code>{`-client-num &lt;n&gt;`}</code></td><td>no</td><td>Permitted client IP range</td></tr>
<tr><td><code>{`-gtp`}</code></td><td>no</td><td>Enable GTP tunnel termination</td></tr>
<tr><td><code>{`-metrics-port &lt;n&gt;`}</code></td><td>no</td><td>Prometheus metrics endpoint</td></tr></tbody>
</table>
<p>The DPDK backend shells out to <code>{`fpl-dpdk-c`}</code>, an embedded binary built into the Go executable. On first use, fluxproto-light extracts it to a temp dir and execs it; the binary requires huge pages allocated and the chosen NIC bound to a DPDK-compatible driver (typically <code>{`vfio-pci`}</code> or <code>{`igb_uio`}</code>).</p>
<p>DPDK prerequisites at a customer-procedural level:</p>
<ol>
<li>Allocate huge pages: <code>{`echo 1024 &gt; /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages`}</code></li>
<li>Bind the NIC to a DPDK driver (<code>{`dpdk-devbind.py --bind=vfio-pci 0000:00:09.0`}</code>)</li>
<li>Run <code>{`server dpdk`}</code> as root (or with <code>{`CAP_SYS_ADMIN`}</code>)</li>
</ol>
<p>Build the embedded binary fresh from the in-repo source:</p>
<CodeBlock lang="bash" code={`make embed-dfxpc`} />
<p>After that the next <code>{`make`}</code> picks up the updated embed.</p>
<h2 id="driving-traffic-from-a-flow">Driving traffic from a flow</h2>
<p>The shipped <code>{`templates/gnb/uplane_traffic.yaml`}</code> is the canonical sender flow. It runs the full registration + PDU session establishment then triggers <code>{`uplane_start`}</code> to fire the configured sender. The receiver running on the destination end echoes traffic back, and the sender measures throughput / latency / jitter / drop.</p>
<CodeBlock lang="yaml" code={`- type: send
  message: PDUSessionResourceSetupResponse
- type: uplane_start`} />
<p>The <code>{`EngineResult`}</code> includes a <code>{`uplane_report`}</code> field with the per-flow metric snapshot when an <code>{`uplane_start`}</code> action fired during the run.</p>
<h2 id="what-each-backend-measures">What each backend measures</h2>
<p>Both backends report the same metric shape:</p>
<ul>
<li>Packets in / out per second</li>
<li>Bytes in / out per second</li>
<li>Bidirectional latency on echo (RTT)</li>
<li>Jitter on echo (stddev of RTT)</li>
<li>Drop rate (sent vs echoed)</li>
</ul>
<p>Userspace tops out at a few hundred kpps on a typical NIC; DPDK reaches line rate up to the per-core packet budget.</p>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong>ICMP server receives nothing</strong> — kernel is auto-replying. Set <code>{`net.ipv4.icmp_echo_ignore_all=1`}</code>.</p>
<p><strong><code>{`fpl-dpdk-c: not found`}</code></strong> — the binary wasn't embedded at build time. Run <code>{`make embed-dfxpc`}</code> then rebuild.</p>
<p><strong>DPDK <code>{`EAL: Cannot mbuf`}</code> errors</strong> — huge pages aren't allocated, or the process can't see them. Verify with <code>{`cat /proc/meminfo | grep Huge`}</code>.</p>
<p><strong>Sender never fires <code>{`uplane_start`}</code></strong> — the flow's preceding states didn't reach the action. Check <code>{`-trace`}</code> to see where the FSM landed.</p>
<p><strong>N3 traffic returns to the wrong address</strong> — <code>{`local_gtpu`}</code> on the NGAP transport must be the IP the UPF can route packets to. NAT in between will break the return path.</p>
    </DocPage>
  );
}
