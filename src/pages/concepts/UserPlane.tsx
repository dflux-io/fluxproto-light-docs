import DocPage from '../../components/DocPage';

export default function UserPlane() {
  return (
    <DocPage slug="concepts/user-plane">
<h1>User plane</h1>
<p>User-plane testing is a separate concern from signalling testing. This page explains why fluxproto-light treats GTP-U as its own subsystem with its own backends, what the two backends measure, and when to pick each one.</p>
<h2 id="why-split-signalling-from-user-plane">Why split signalling from user plane</h2>
<p>5G procedures split clean across a control / user-plane line. Signalling — registration, PDU session establishment, handover — runs over NGAP and NAS5G with carefully timed interactions and per-step assertions. The whole flow takes hundreds of milliseconds and produces tens of bytes per UE. User plane — the actual GTP-U traffic on N3 once the session is up — takes microseconds per packet and produces megabits per second.</p>
<p>Mixing the two into one process model would be a mistake. Signalling needs deterministic FSM dispatch with checks at every step; user plane needs a tight packet loop with no per-frame Go-side dispatch overhead. fluxproto-light keeps them separate: signalling drives an FSM that <em>sets up</em> the PDU session; user plane is a separate component that <em>uses</em> the session.</p>
<h2 id="what-the-user-plane-subsystem-does">What the user-plane subsystem does</h2>
<p>A successful PDU session establishment leaves the gNB knowing two things: the UPF-side GTP-U tunnel parameters (TEID, IP) and the UE-side IP address. The gNB-side traffic generator then sends real IP packets through the GTP-U tunnel at whatever rate the test is asking for. On the other end of the tunnel the UPF strips GTP-U and forwards plain IP onto the data network — where a receiver running <code>{`fluxproto-light server uspace`}</code> or <code>{`server dpdk`}</code> echoes the traffic back. The round-trip latency, throughput, jitter, and drop are the user-plane test's actual measurements.</p>
<p>The <code>{`uplane_start`}</code> flow action is the bridge between the two subsystems. It runs at the end of the signalling flow once the PDU session is up; it arms the configured user-plane sender (USPACE or DPDK) with the parameters from the <code>{`PduSessionResourceSetupRequest`}</code> and waits for completion before the FSM advances to a final state.</p>
<h2 id="two-backend-modes">Two backend modes</h2>
<table>
<thead><tr><th>Backend</th><th>When to pick</th></tr></thead>
<tbody><tr><td><code>{`uspace`}</code> (userspace)</td><td>Functional checks, low rates (≤ a few hundred Mbps), no privileged NIC binding. Runs on any Linux.</td></tr>
<tr><td><code>{`dpdk`}</code></td><td>Throughput / latency benchmarks. Requires huge pages + a NIC bound to a DPDK-compatible driver.</td></tr></tbody>
</table>
<h3 id="userspace">Userspace</h3>
<p>The userspace backend uses kernel sockets:</p>
<ul>
<li><strong>UDP</strong>: <code>{`ListenPacket`}</code> per port; echoes each datagram.</li>
<li><strong>TCP</strong>: <code>{`Listen`}</code> per port. The kernel completes the SYN/SYN-ACK handshake so a SYN-only client gets its RTT reply even when <code>{`Accept()`}</code> doesn't fire. Application-layer echo runs after a full 3-way handshake.</li>
<li><strong>ICMP</strong>: raw ICMP socket; replies to echo requests.</li>
</ul>
<p>The whole stack is Go code with <code>{`syscall`}</code>-based packet handling. It tops out at the few-hundred-kpps range on a typical NIC, depending on per-packet overhead. That's fine for functional tests where you're confirming the tunnel terminates and traffic flows. It's not enough for line-rate benchmarks.</p>
<h3 id="dpdk">DPDK</h3>
<p>The DPDK backend shells out to <code>{`fpl-dpdk-c`}</code>, an embedded binary built into the Go executable. The binary is extracted to a temp dir on first use and exec'd with the configured arguments. It uses DPDK's poll-mode drivers to bypass the kernel network stack entirely, going from ~100 kpps userspace to multi-Mpps line rate.</p>
<p>Cost: DPDK requires huge pages allocated in advance, the NIC bound to a DPDK-compatible driver (<code>{`vfio-pci`}</code> or <code>{`igb_uio`}</code>), and (typically) root or <code>{`CAP_SYS_ADMIN`}</code>. The setup is heavier than userspace but the difference in measurement quality is the difference between "the tunnel works" and "the tunnel can sustain N Mpps with P95 latency under M ms".</p>
<h2 id="what-each-measures">What each measures</h2>
<p>Both backends report the same metric shape:</p>
<ul>
<li><strong>Packets in / out per second</strong> — throughput at the receiver</li>
<li><strong>Bytes in / out per second</strong> — bandwidth</li>
<li><strong>Round-trip latency on echo</strong> — how long a packet spent in the tunnel + the receiver</li>
<li><strong>Jitter on echo</strong> — standard deviation of RTT, the variability metric that matters for real-time traffic</li>
<li><strong>Drop rate</strong> — sent vs echoed; non-zero drop on a clean network indicates UPF / receiver / tunnel saturation</li>
</ul>
<p>The userspace backend measures these in Go atomics; DPDK measures them in the C side and forwards summaries back via stdout.</p>
<h2 id="why-receiver-side-support-matters">Why receiver-side support matters</h2>
<p>A UE-side traffic generator is easy. A receiver that can absorb the traffic, echo it cleanly, and report metrics is what makes the test loop closed. Most labs don't have a clean way to terminate GTP-U traffic — either you put a real CN box behind the UPF, or you write a stub. fluxproto-light's <code>{`server uspace`}</code> / <code>{`server dpdk`}</code> <em>is</em> the stub; it terminates the post-UPF plain IP traffic on N6, echoes it, and reports metrics — eliminating the need for an external traffic terminator in lab setups.</p>
<p>DPDK with <code>{`-gtp`}</code> extends this to terminating GTP tunnels themselves, which is useful when there's no UPF in the path at all (gNB-direct testing, UPF replacement scenarios).</p>
<h2 id="when-to-skip-user-plane-testing-entirely">When to skip user-plane testing entirely</h2>
<p>Plenty of tests don't need it. NGAP procedure conformance, Diameter S6a behaviour, SBI service interactions — all signalling-only. The user-plane subsystem has zero overhead when no flow triggers <code>{`uplane_start`}</code>; flows without it run as fast as they always would.</p>
<p>Reach for user-plane testing when the question is "does the data path work" or "how fast can it go". For the procedural questions ("does the UE register"), signalling-only is the right tool.</p>
    </DocPage>
  );
}
