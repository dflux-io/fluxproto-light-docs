import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function Cli() {
  return (
    <DocPage slug="reference/cli">
<h1>CLI reference</h1>
<p><code>{`fluxproto-light`}</code> is one binary that runs as a daemon (no subcommand) or as a CLI tool with a subcommand. This page documents every subcommand and every flag.</p>
<h2 id="synopsis">Synopsis</h2>
<CodeBlock lang="" code={`fluxproto-light                                       # run as daemon
fluxproto-light run-flow -flow <name> -templates <dir> -c <config> [opts]
fluxproto-light run-suite -suite <name> -templates <dir> -c <config> [opts]
fluxproto-light flow <list|info> [name] -templates <dir>
fluxproto-light suite <list|info> [name] -templates <dir>
fluxproto-light report <list|list-suites|show-suite <id>|<id>>
fluxproto-light subscriber <generate|provision|list|purge> [opts]
fluxproto-light server <uspace|dpdk> [opts]
fluxproto-light check -c <config>
fluxproto-light -v`} />
<h2 id="run-flow">run-flow</h2>
<p>Execute one flow against an environment. Flows are looked up by name in the templates DB after a sync of the <code>{`-templates`}</code> dir. See <Link to="/guides/running">running-flows</Link> for the workload model.</p>
<h3 id="synopsis-2">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light run-flow -flow registration \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml -trace`} />
<h3 id="argument-reference">Argument reference</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-flow &lt;name&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Flow name (as listed by <code>{`flow list`}</code>)</td></tr>
<tr><td><code>{`-templates &lt;dir&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Templates directory (recursively walked)</td></tr>
<tr><td><code>{`-c &lt;file&gt;`}</code> / <code>{`-config &lt;file&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Env YAML config file</td></tr>
<tr><td><code>{`-s &lt;file&gt;`}</code> / <code>{`-subscribers &lt;file&gt;`}</code></td><td>string</td><td>no</td><td>—</td><td>Subscribers YAML file</td></tr>
<tr><td><code>{`-db &lt;path&gt;`}</code></td><td>string</td><td>no</td><td><code>{`./fpl.db`}</code></td><td>SQLite DB path; env: <code>{`FPL_DB`}</code></td></tr>
<tr><td><code>{`-repetitions &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>1</td><td>Number of UEs to spawn</td></tr>
<tr><td><code>{`-rate &lt;n&gt;`}</code></td><td>float</td><td>no</td><td>0</td><td>UEs per second (0 = burst)</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>duration</td><td>no</td><td>0</td><td>Stop spawning after this elapses</td></tr>
<tr><td><code>{`-timeout &lt;duration&gt;`}</code></td><td>duration</td><td>no</td><td>30s</td><td>Per-UE flow timeout</td></tr>
<tr><td><code>{`-trace`}</code></td><td>bool</td><td>no</td><td>false</td><td>Hex dump TX/RX + JSON trace</td></tr>
<tr><td><code>{`-gen-subscriber`}</code></td><td>bool</td><td>no</td><td>false</td><td>Synthesize a subscriber per UE in memory</td></tr>
<tr><td><code>{`-debug`}</code></td><td>bool</td><td>no</td><td>false</td><td>Debug-level logs</td></tr></tbody>
</table>
<h3 id="examples">Examples</h3>
<CodeBlock lang="bash" code={`# Single UE smoke test
fluxproto-light run-flow -flow registration \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml -trace

# 100 UEs at 10/s for at most 30s
fluxproto-light run-flow -flow registration \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml \\
    -repetitions 100 -rate 10 -duration 30s`} />
<h2 id="run-suite">run-suite</h2>
<p>Execute a suite — an ordered list of flow steps — as one or more cycles. See <Link to="/guides/running">running-suites</Link> for cycle semantics.</p>
<h3 id="synopsis-3">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light run-suite -suite gnb-register-deregister \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml -repetitions 3`} />
<h3 id="argument-reference-2">Argument reference</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-suite &lt;name&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Suite name (as listed by <code>{`suite list`}</code>)</td></tr>
<tr><td><code>{`-templates &lt;dir&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Templates directory</td></tr>
<tr><td><code>{`-c &lt;file&gt;`}</code> / <code>{`-config &lt;file&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Env YAML config file</td></tr>
<tr><td><code>{`-s &lt;file&gt;`}</code> / <code>{`-subscribers &lt;file&gt;`}</code></td><td>string</td><td>no</td><td>—</td><td>Subscribers YAML file</td></tr>
<tr><td><code>{`-db &lt;path&gt;`}</code></td><td>string</td><td>no</td><td><code>{`./fpl.db`}</code></td><td>SQLite DB path; env: <code>{`FPL_DB`}</code></td></tr>
<tr><td><code>{`-repetitions &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>1</td><td>Number of full suite cycles</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>duration</td><td>no</td><td>0</td><td>Run cycles back-to-back until elapsed</td></tr>
<tr><td><code>{`-timeout &lt;duration&gt;`}</code></td><td>duration</td><td>no</td><td>30s</td><td>Per-cycle timeout</td></tr>
<tr><td><code>{`-trace`}</code></td><td>bool</td><td>no</td><td>false</td><td>Hex dump TX/RX + JSON trace (OR'd with each step's setting)</td></tr>
<tr><td><code>{`-gen-subscriber`}</code></td><td>bool</td><td>no</td><td>false</td><td>Synthesize subscribers per UE; OR'd with per-step setting</td></tr>
<tr><td><code>{`-debug`}</code></td><td>bool</td><td>no</td><td>false</td><td>Debug-level logs</td></tr></tbody>
</table>
<p><code>{`-rate`}</code> is rejected at the suite level — suites are strictly serial in v1; per-step rate lives in the suite YAML.</p>
<h3 id="examples-2">Examples</h3>
<CodeBlock lang="bash" code={`# 5 cycles
fluxproto-light run-suite -suite gnb-register-deregister \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml -repetitions 5

# Cycles back-to-back for 10 minutes
fluxproto-light run-suite -suite gnb-register-deregister \\
    -templates templates -c config/lab.yaml \\
    -s config/subscribers.yaml -duration 10m`} />
<h2 id="flow">flow</h2>
<p>Catalog operations for flow templates. Both subcommands sync the <code>{`-templates`}</code> dir into the DB before reading.</p>
<h3 id="synopsis-4">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light flow list -templates templates
fluxproto-light flow info registration -templates templates`} />
<h3 id="argument-reference-3">Argument reference</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`list`}</code></td><td>subcommand</td><td>yes</td><td>—</td><td>List every loaded flow as a table</td></tr>
<tr><td><code>{`info &lt;name&gt;`}</code></td><td>subcommand</td><td>yes</td><td>—</td><td>Print one flow's metadata + YAML</td></tr>
<tr><td><code>{`-templates &lt;dir&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Templates directory</td></tr>
<tr><td><code>{`-db &lt;path&gt;`}</code></td><td>string</td><td>no</td><td><code>{`./fpl.db`}</code></td><td>SQLite DB path</td></tr>
<tr><td><code>{`-debug`}</code></td><td>bool</td><td>no</td><td>false</td><td>Debug-level logs</td></tr></tbody>
</table>
<h3 id="examples-3">Examples</h3>
<CodeBlock lang="bash" code={`fluxproto-light flow list -templates templates
fluxproto-light flow info uplane_traffic -templates templates`} />
<h2 id="suite">suite</h2>
<p>Catalog operations for suite templates. Same shape as <code>{`flow`}</code>.</p>
<h3 id="synopsis-5">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light suite list -templates templates
fluxproto-light suite info gnb-register-deregister -templates templates`} />
<h3 id="argument-reference-4">Argument reference</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`list`}</code></td><td>subcommand</td><td>yes</td><td>—</td><td>List every loaded suite</td></tr>
<tr><td><code>{`info &lt;name&gt;`}</code></td><td>subcommand</td><td>yes</td><td>—</td><td>Print one suite's metadata + YAML</td></tr>
<tr><td><code>{`-templates &lt;dir&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Templates directory</td></tr>
<tr><td><code>{`-db &lt;path&gt;`}</code></td><td>string</td><td>no</td><td><code>{`./fpl.db`}</code></td><td>SQLite DB path</td></tr></tbody>
</table>
<h2 id="report">report</h2>
<p>Browse persisted execution reports. Reads only from the local DB.</p>
<h3 id="synopsis-6">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light report list
fluxproto-light report list-suites
fluxproto-light report show-suite <suite-execution-id>
fluxproto-light report <report-id|execution-id>`} />
<h3 id="argument-reference-5">Argument reference</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`list [&lt;limit&gt;]`}</code></td><td>subcommand</td><td>Recent standalone-flow reports (default limit 20). Suite-children are filtered out.</td></tr>
<tr><td><code>{`list-suites [&lt;limit&gt;]`}</code></td><td>subcommand</td><td>Recent suite reports (default limit 20)</td></tr>
<tr><td><code>{`show-suite &lt;id&gt;`}</code></td><td>subcommand</td><td>Suite-level summary plus every child report's summary</td></tr>
<tr><td><code>{`&lt;id&gt;`}</code></td><td>string</td><td>Show one report by report ID or execution ID</td></tr></tbody>
</table>
<h3 id="examples-4">Examples</h3>
<CodeBlock lang="bash" code={`fluxproto-light report list
fluxproto-light report list 50
fluxproto-light report list-suites
fluxproto-light report show-suite 7a1b...c3d
fluxproto-light report 1f4d...8b9`} />
<h2 id="subscriber">subscriber</h2>
<p>Subscriber utilities — generate, provision into Open5GS, list, purge. See <Link to="/guides/subscribers">subscribers</Link>.</p>
<h3 id="synopsis-7">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light subscriber generate -count 10 -mcc 901 -mnc 070
fluxproto-light subscriber provision -file subscribers.yaml
fluxproto-light subscriber list -host <ip>
fluxproto-light subscriber purge -host <ip> -yes`} />
<h3 id="argument-reference-generate">Argument reference (<code>{`generate`}</code>)</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-count &lt;n&gt;`}</code></td><td>int</td><td>10</td><td>Subscribers to generate</td></tr>
<tr><td><code>{`-mcc &lt;mcc&gt;`}</code></td><td>string</td><td>901</td><td>Mobile Country Code</td></tr>
<tr><td><code>{`-mnc &lt;mnc&gt;`}</code></td><td>string</td><td>070</td><td>Mobile Network Code</td></tr>
<tr><td><code>{`-start-msin &lt;n&gt;`}</code></td><td>uint</td><td>1</td><td>Starting MSIN</td></tr>
<tr><td><code>{`-ciphering &lt;alg&gt;`}</code></td><td>string</td><td>NEA0</td><td>NEA0 / NEA1 / NEA2 / NEA3</td></tr>
<tr><td><code>{`-integrity &lt;alg&gt;`}</code></td><td>string</td><td>NIA2</td><td>NIA0 / NIA1 / NIA2 / NIA3</td></tr>
<tr><td><code>{`-o &lt;path&gt;`}</code></td><td>string</td><td>subscribers.yaml</td><td>Output file</td></tr></tbody>
</table>
<h3 id="argument-reference-provision-list-purge">Argument reference (<code>{`provision`}</code>, <code>{`list`}</code>, <code>{`purge`}</code>)</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-file &lt;path&gt;`}</code></td><td>string</td><td>subscribers.yaml</td><td>YAML file to provision (<code>{`provision`}</code> only)</td></tr>
<tr><td><code>{`-host &lt;ip&gt;`}</code></td><td>string</td><td>192.168.1.139</td><td>Open5GS WebUI host</td></tr>
<tr><td><code>{`-port &lt;port&gt;`}</code></td><td>int</td><td>9999</td><td>Open5GS WebUI port</td></tr>
<tr><td><code>{`-user &lt;name&gt;`}</code></td><td>string</td><td>admin</td><td>WebUI username</td></tr>
<tr><td><code>{`-pass &lt;pwd&gt;`}</code></td><td>string</td><td>1423</td><td>WebUI password</td></tr>
<tr><td><code>{`-yes`}</code></td><td>bool</td><td>false</td><td>Skip confirmation prompt (<code>{`purge`}</code> only)</td></tr></tbody>
</table>
<h2 id="server">server</h2>
<p>User-plane (GTP-U) receiver. Two backends. See <Link to="/guides/user-plane-testing">user-plane-testing</Link>.</p>
<h3 id="synopsis-8">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light server uspace -protocol udp -port-start 5001
fluxproto-light server dpdk -protocol udp \\
    -port-pci 0000:00:09.0 -port-addr 192.168.1.141 \\
    -port-gateway 192.168.1.1 -listen 192.168.1.141 \\
    -port-start 5678 -port-num 1`} />
<h3 id="argument-reference-uspace">Argument reference (<code>{`uspace`}</code>)</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-protocol &lt;icmp|udp|tcp&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Protocol to serve</td></tr>
<tr><td><code>{`-listen &lt;ip&gt;`}</code></td><td>string</td><td>no</td><td>0.0.0.0</td><td>Bind IP</td></tr>
<tr><td><code>{`-port-start &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>5001</td><td>First port for UDP/TCP</td></tr>
<tr><td><code>{`-port-num &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>1</td><td>Port range count</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>duration</td><td>no</td><td>forever</td><td>Run for this then exit</td></tr>
<tr><td><code>{`-payload-size &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>0</td><td>Echo payload size override</td></tr>
<tr><td><code>{`-metrics-port &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>0 (off)</td><td>Prometheus metrics endpoint</td></tr></tbody>
</table>
<h3 id="argument-reference-dpdk">Argument reference (<code>{`dpdk`}</code>)</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-protocol &lt;icmp|udp|tcp&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Protocol to serve</td></tr>
<tr><td><code>{`-listen &lt;ip&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Server's own bind IP (passed as <code>{`--server`}</code>)</td></tr>
<tr><td><code>{`-port-start &lt;port&gt;`}</code></td><td>int</td><td>yes</td><td>—</td><td>First listen port</td></tr>
<tr><td><code>{`-port-num &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>1</td><td>Number of listen ports</td></tr>
<tr><td><code>{`-port-pci &lt;pci&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>NIC PCI address</td></tr>
<tr><td><code>{`-port-addr &lt;ip&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>IP for the PCI port</td></tr>
<tr><td><code>{`-port-gateway &lt;ip&gt;`}</code></td><td>string</td><td>yes</td><td>—</td><td>Gateway for the PCI port</td></tr>
<tr><td><code>{`-cpu &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>0</td><td>CPU index</td></tr>
<tr><td><code>{`-duration &lt;duration&gt;`}</code></td><td>duration</td><td>no</td><td>forever</td><td>Run for this then exit (≥ 5s)</td></tr>
<tr><td><code>{`-payload-size &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>0</td><td>Response payload size</td></tr>
<tr><td><code>{`-keepalive &lt;duration&gt;`}</code></td><td>duration</td><td>no</td><td>0</td><td>TCP keepalive interval</td></tr>
<tr><td><code>{`-client-allow &lt;ip&gt;`}</code></td><td>string</td><td>no</td><td>—</td><td>Permitted client IP range start</td></tr>
<tr><td><code>{`-client-num &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>0</td><td>IPs in the client-allow range</td></tr>
<tr><td><code>{`-gtp`}</code></td><td>bool</td><td>no</td><td>false</td><td>Enable GTP tunnel termination</td></tr>
<tr><td><code>{`-metrics-port &lt;n&gt;`}</code></td><td>int</td><td>no</td><td>0</td><td>Prometheus metrics endpoint</td></tr></tbody>
</table>
<h2 id="check">check</h2>
<p>Probe SCTP + NGSetup connectivity for every gNB→AMF pair in the env.</p>
<h3 id="synopsis-9">Synopsis</h3>
<CodeBlock lang="bash" code={`fluxproto-light check -c config/lab.yaml`} />
<h3 id="argument-reference-6">Argument reference</h3>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-c &lt;file&gt;`}</code> / <code>{`-config &lt;file&gt;`}</code></td><td>string</td><td>yes</td><td>Env YAML config file</td></tr>
<tr><td><code>{`-debug`}</code></td><td>bool</td><td>no</td><td>Debug-level logs</td></tr>
<tr><td><code>{`-trace`}</code></td><td>bool</td><td>no</td><td>Trace-level logs</td></tr></tbody>
</table>
<p>The output is a one-row-per-pair table. Exit <code>{`0`}</code> on all-OK, <code>{`1`}</code> if any pair failed.</p>
<h2 id="daemon-flags">Daemon flags</h2>
<p>Used when the binary is invoked with no subcommand.</p>
<table>
<thead><tr><th>Flag</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-host &lt;addr&gt;`}</code></td><td>string</td><td><code>{`0.0.0.0`}</code></td><td>Bind address</td></tr>
<tr><td><code>{`-port &lt;port&gt;`}</code></td><td>int</td><td>8199</td><td>API + web UI port</td></tr>
<tr><td><code>{`-web`}</code></td><td>bool</td><td>false</td><td>Enable embedded web UI</td></tr>
<tr><td><code>{`-metrics_port &lt;port&gt;`}</code></td><td>int</td><td>-1 (off)</td><td>Prometheus metrics endpoint</td></tr>
<tr><td><code>{`-pprof_port &lt;port&gt;`}</code></td><td>int</td><td>-1 (off)</td><td>pprof endpoint</td></tr>
<tr><td><code>{`-db_query_log`}</code></td><td>bool</td><td>false</td><td>Log every SQL query</td></tr>
<tr><td><code>{`-v`}</code> / <code>{`-version`}</code></td><td>bool</td><td>—</td><td>Print version and exit</td></tr></tbody>
</table>
<p>See <Link to="/guides/daemon">daemon-mode</Link>.</p>
<h2 id="logging-flags">Logging flags</h2>
<p>Apply to every subcommand and to daemon mode.</p>
<table>
<thead><tr><th>Flag</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`-debug`}</code></td><td>Enable debug-level logging</td></tr>
<tr><td><code>{`-trace`}</code></td><td>Enable trace-level logging (very verbose)</td></tr>
<tr><td><code>{`-quiet`}</code></td><td>Suppress logs below warn level</td></tr>
<tr><td><code>{`-json`}</code></td><td>Emit logs as JSON instead of console format</td></tr>
<tr><td><code>{`-logfile &lt;path&gt;`}</code></td><td>Write logs to a file (append-mode)</td></tr>
<tr><td><code>{`-log-caller`}</code></td><td>Include caller <code>{`file:line`}</code> in logs</td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li><code>{`-flow def my-flow.yaml`}</code> (loading a flow by file path) is no longer supported. Walk the file's containing directory with <code>{`-templates`}</code>; the flow is then addressable by its <code>{`name:`}</code> field.</li>
<li><code>{`run`}</code> (without <code>{`-flow`}</code> or <code>{`-suite`}</code>) was renamed to <code>{`run-flow`}</code> in #243. The error message points at the new spelling.</li>
<li>The CLI auto-syncs the templates dir into the DB on every <code>{`run-flow`}</code>, <code>{`run-suite`}</code>, and <code>{`flow|suite list|info`}</code>. The DB defaults to <code>{`./fpl.db`}</code>; override with <code>{`-db &lt;path&gt;`}</code> or <code>{`FPL_DB`}</code>.</li>
</ul>
    </DocPage>
  );
}
