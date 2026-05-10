import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function Metrics() {
  return (
    <DocPage slug="reference/metrics" lede="Every Prometheus metric the daemon exposes on /metrics. The endpoint binds on -metrics_port <port> (default off) over a separate listener — set -metrics_port 9090 to enable. The process_* and go_* collectors from the standard prometheus/client_golang library are also registered.">
<p>For prose on enabling metrics, see <Link to="/guides/daemon">daemon-mode</Link>.</p>
<h2 id="synopsis">Synopsis</h2>
<CodeBlock lang="bash" code={`fluxproto-light -port 8199 -metrics_port 9090
curl http://localhost:9090/metrics`} />
<h2 id="counters">Counters</h2>
<table>
<thead><tr><th>Name</th><th>Labels</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`fpl_messages_total`}</code></td><td>direction, msg_type</td><td>Total NGAP messages pipelined</td></tr>
<tr><td><code>{`fpl_message_bytes_total`}</code></td><td>direction, msg_type</td><td>Total bytes of NGAP messages pipelined</td></tr>
<tr><td><code>{`fpl_ngap_encode_errors_total`}</code></td><td>msg_type</td><td>NGAP encode failures inside EncoderStage</td></tr>
<tr><td><code>{`fpl_ngap_decode_errors_total`}</code></td><td>msg_type</td><td>NGAP decode failures inside DecoderStage</td></tr>
<tr><td><code>{`fpl_flows_total`}</code></td><td>flow, result</td><td>Completed flows (<code>{`result`}</code>: <code>{`success`}</code>, <code>{`failed`}</code>, <code>{`timeout`}</code>)</td></tr>
<tr><td><code>{`fpl_ue_deregistrations_total`}</code></td><td>—</td><td>UE deregistrations observed (inner-NAS DeregistrationAccept)</td></tr>
<tr><td><code>{`fpl_procedure_failures_total`}</code></td><td>procedure</td><td>Procedure failures observed on the wire</td></tr>
<tr><td><code>{`fpl_subscriber_pool_acquire_total`}</code></td><td>result</td><td>SubscriberPool.Acquire calls (<code>{`result`}</code>: <code>{`success`}</code>, <code>{`timeout`}</code>, <code>{`canceled`}</code>, <code>{`drained`}</code>, <code>{`error`}</code>)</td></tr>
<tr><td><code>{`fpl_fsm_state_timeouts_total`}</code></td><td>flow, state</td><td><code>{`on_timeout`}</code> firings</td></tr>
<tr><td><code>{`fpl_bus_handler_total`}</code></td><td>address</td><td>Total events dispatched per bus address</td></tr>
<tr><td><code>{`fpl_bus_handler_errors_total`}</code></td><td>address</td><td>Handler-level errors (not business errors routed to internal.error)</td></tr>
<tr><td><code>{`fpl_bus_events_dropped_total`}</code></td><td>address</td><td>Events dropped at a bus address (overflow / shutdown)</td></tr></tbody>
</table>
<h2 id="gauges">Gauges</h2>
<table>
<thead><tr><th>Name</th><th>Labels</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`fpl_flows_active`}</code></td><td>flow</td><td>UEs whose flow is in-flight (between FSM start and terminal state)</td></tr>
<tr><td><code>{`fpl_gnb_registered`}</code></td><td>—</td><td>gNBs that have completed NG Setup (incremented on NGSetupResponse)</td></tr>
<tr><td><code>{`fpl_ue_registered`}</code></td><td>—</td><td>UEs currently registered with the 5GC</td></tr>
<tr><td><code>{`fpl_pdu_sessions_active`}</code></td><td>—</td><td>PDU sessions currently active</td></tr>
<tr><td><code>{`fpl_subscriber_pool_total`}</code></td><td>—</td><td>Total subscribers in the pool (custom collector; reads <code>{`SubscriberPool.Stats()`}</code> per scrape)</td></tr>
<tr><td><code>{`fpl_subscriber_pool_locked`}</code></td><td>—</td><td>Subscribers currently held by an execution</td></tr>
<tr><td><code>{`fpl_subscriber_pool_free`}</code></td><td>—</td><td>Subscribers available for acquisition</td></tr>
<tr><td><code>{`fpl_subscriber_pool_waiting`}</code></td><td>—</td><td>Acquirers blocked in the FIFO queue</td></tr>
<tr><td><code>{`fpl_executions_active`}</code></td><td>—</td><td>In-flight executions (custom collector over <code>{`ExecutionRegistry`}</code>)</td></tr>
<tr><td><code>{`fpl_bus_queue_depth`}</code></td><td>—</td><td>Live event-bus queue depth</td></tr>
<tr><td><code>{`dflux_app_info`}</code></td><td>name, version, commit, buildtime</td><td>Daemon metadata, always 1</td></tr></tbody>
</table>
<h2 id="histograms">Histograms</h2>
<table>
<thead><tr><th>Name</th><th>Labels</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`fpl_pipeline_stage_seconds`}</code></td><td>direction, stage, msg_type</td><td>Wall-clock time per pipeline stage per message</td></tr>
<tr><td><code>{`fpl_flow_latency_seconds`}</code></td><td>flow, result</td><td>End-to-end flow latency, FSM start → terminal state</td></tr>
<tr><td><code>{`fpl_step_latency_seconds`}</code></td><td>flow, from_state, to_state</td><td>FSM state dwell time per transition</td></tr>
<tr><td><code>{`fpl_subscriber_pool_acquire_seconds`}</code></td><td>result</td><td>SubscriberPool.Acquire wall-clock duration</td></tr>
<tr><td><code>{`fpl_bus_handler_duration_seconds`}</code></td><td>address</td><td>Wall-clock time per event-bus handler invocation</td></tr></tbody>
</table>
<h2 id="bucket-layouts">Bucket layouts</h2>
<p><code>{`fpl_pipeline_stage_seconds`}</code>, <code>{`fpl_step_latency_seconds`}</code>, <code>{`fpl_bus_handler_duration_seconds`}</code> use a stage-tuned bucket set covering 100 µs to 10 s in roughly half-decade steps:</p>
<CodeBlock lang="" code={`0.0001, 0.00025, 0.0005, 0.001, 0.0025, 0.005,
0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10`} />
<p><code>{`fpl_flow_latency_seconds`}</code> uses a flow-tuned set covering 5 ms to 60 s:</p>
<CodeBlock lang="" code={`0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5,
1, 2.5, 5, 10, 30, 60`} />
<p><code>{`fpl_subscriber_pool_acquire_seconds`}</code> uses an acquire-tuned set covering 500 µs to 30 s:</p>
<CodeBlock lang="" code={`0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30`} />
<h2 id="examples">Examples</h2>
<h3 id="live-success-rate-per-flow">Live success rate per flow</h3>
<CodeBlock lang="promql" code={`sum by(flow) (rate(fpl_flows_total{result="success"}[5m]))
  /
sum by(flow) (rate(fpl_flows_total[5m]))`} />
<h3 id="p95-flow-latency">P95 flow latency</h3>
<CodeBlock lang="promql" code={`histogram_quantile(0.95,
  sum by(flow, le) (rate(fpl_flow_latency_seconds_bucket[5m])))`} />
<h3 id="subscriber-pool-saturation">Subscriber pool saturation</h3>
<CodeBlock lang="promql" code={`fpl_subscriber_pool_locked / fpl_subscriber_pool_total`} />
<h3 id="bus-backpressure">Bus backpressure</h3>
<CodeBlock lang="promql" code={`fpl_bus_queue_depth
rate(fpl_bus_events_dropped_total[1m])`} />
<h2 id="notes">Notes</h2>
<ul>
<li>Custom collectors (<code>{`fpl_subscriber_pool_*`}</code>, <code>{`fpl_executions_active`}</code>) read live in-memory state on every scrape, so values are always current — no periodic push.</li>
<li><code>{`dflux_app_info`}</code> is the standard pattern for surfacing version metadata to dashboards and alert payloads.</li>
<li><code>{`result`}</code> labels on counters and histograms are kept low-cardinality (small enum) so they're safe to slice and dice.</li>
</ul>
    </DocPage>
  );
}
