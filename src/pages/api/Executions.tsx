import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiExecutions() {
  return (
    <DocPage slug="api/executions" lede="Trigger runs and read their results. An execution is one engine invocation against one (flow, environment) pair — the same shape a CLI run-flow produces. While a run is in flight, the daemon tracks it in memory; once it finishes, the result lands in a persisted report.">
<h2 id="endpoints">Execution endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>POST</td><td><code>{`/api/v1/execute`}</code></td><td>Queue an immediate execution (async)</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/executions`}</code></td><td>List currently running executions</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/executions/queue`}</code></td><td>Live queue: running plus pending</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/executions/{id}`}</code></td><td>Live status of one running execution</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/executions/{id}`}</code></td><td>Cancel a queued or running execution</td></tr></tbody>
</table>
<p>Executions are async by default. <code>{`POST /api/v1/execute`}</code> returns <code>{`202 Accepted`}</code> with an ID and queue position immediately — it never holds the connection open while the run proceeds. Poll <code>{`/executions/{id}`}</code> while the run is live, then read the <a href="#reports">report</a> once it finishes.</p>
<h2 id="post-apiv1execute" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/execute`}</code></h2>
<p>Queue an execution. The daemon runs it as soon as resources permit.</p>
<CodeBlock lang="http" code={`POST /api/v1/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "flow_id": "registration",
  "environment_id": "<env-uuid>",
  "params": { "key": "value" },
  "repetitions": 5,
  "rate": 1,
  "duration": "",
  "timeout": "30s",
  "trace": false
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`flow_id`}</code></td><td>string</td><td>yes*</td><td>—</td><td>Flow name (shipped) or UUID (custom)</td></tr>
<tr><td><code>{`suite_id`}</code></td><td>string</td><td>yes*</td><td>—</td><td>Suite name or UUID; mutually exclusive with <code>{`flow_id`}</code></td></tr>
<tr><td><code>{`environment_id`}</code></td><td>string</td><td>yes</td><td>—</td><td>Environment UUID</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td><code>{`{}`}</code></td><td>Per-flow params overlay</td></tr>
<tr><td><code>{`repetitions`}</code></td><td>int</td><td>no</td><td>1</td><td>UEs to spawn (flow only)</td></tr>
<tr><td><code>{`rate`}</code></td><td>float</td><td>no</td><td>0</td><td>UEs per second, 0 = burst (flow only)</td></tr>
<tr><td><code>{`duration`}</code></td><td>string</td><td>no</td><td><code>{`""`}</code></td><td>Go-duration string (e.g. <code>{`30s`}</code>); stop spawning after this elapses. Empty = no time limit (flow only)</td></tr>
<tr><td><code>{`timeout`}</code></td><td>string</td><td>no</td><td>environment <code>{`execution.flow_timeout`}</code> setting</td><td>Go-duration string for the per-UE timeout</td></tr>
<tr><td><code>{`trace`}</code></td><td>bool</td><td>no</td><td>false</td><td>Enable TX/RX hex dump + JSON trace</td></tr></tbody>
</table>
<p>* Provide exactly one of <code>{`flow_id`}</code> or <code>{`suite_id`}</code>. Suites carry their own per-step workload, so they ignore <code>{`repetitions`}</code>, <code>{`rate`}</code>, and <code>{`duration`}</code>.</p>
<p><code>{`duration`}</code> and <code>{`timeout`}</code> are Go-duration strings (<code>{`"500ms"`}</code>, <code>{`"30s"`}</code>, <code>{`"5m"`}</code>), not integer seconds. When <code>{`timeout`}</code> is omitted, the engine applies the daemon's <code>{`execution.flow_timeout`}</code> runtime setting (ships at <code>{`30s`}</code>).</p>
<h3 id="response">Response</h3>
<CodeBlock lang="http" code={`202 Accepted
Content-Type: application/json

{
  "execution_id": "<uuid>",
  "status": "queued",
  "position": 0
}`} />
<p><code>{`position`}</code> is the queue position when this call lands; <code>{`0`}</code> means it's first up. Poll <code>{`/executions/{id}`}</code> for live status while the run proceeds.</p>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Missing <code>{`environment_id`}</code>; missing both <code>{`flow_id`}</code> and <code>{`suite_id`}</code>; both supplied at once; flow, suite, or environment not found; or no subscribers configured</td></tr></tbody>
</table>
<h2 id="get-apiv1executions" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/executions`}</code></h2>
<p>List the executions running <em>right now</em>. This endpoint reads the in-memory registry, so it returns only live runs — finished executions are gone from this list and survive as <a href="#reports">reports</a>. There is no <code>{`limit`}</code> param.</p>
<CodeBlock lang="http" code={`GET /api/v1/executions
Authorization: Bearer <token>`} />
<h3 id="response-2">Response</h3>
<p>An array of live snapshots. Each entry is the running view: status is always <code>{`running`}</code>, with elapsed time and a live metrics snapshot.</p>
<CodeBlock lang="json" code={`[
  {
    "id": "<uuid>",
    "flow_name": "registration",
    "status": "running",
    "started_at": "2026-06-09T10:12:03.114Z",
    "elapsed": "1.482s",
    "metrics": { "flow.duration_p50_ms": 174, "tx.messages_total": 3 },
    "event_log": [
      { "ts": "...", "level": "info", "msg": "engine started" }
    ],
    "msg_types": {
      "tx": { "ngap": { "InitialUEMessage": 1 } },
      "rx": { "ngap": { "AuthenticationRequest": 1 } }
    }
  }
]`} />
<h2 id="get-apiv1executionsqueue" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/executions/queue`}</code></h2>
<p>Live queue snapshot. Returns a flat array combining running executions (position <code>{`0`}</code>) and pending immediate schedules (position <code>{`1`}</code>…N).</p>
<CodeBlock lang="http" code={`GET /api/v1/executions/queue
Authorization: Bearer <token>`} />
<h3 id="response-3">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "execution_id": "<uuid>",
    "name": "registration",
    "status": "running",
    "created_at": "2026-06-09T10:12:03.114Z",
    "position": 0
  },
  {
    "execution_id": "<uuid>",
    "name": "pdu-session-establish",
    "status": "queued",
    "created_at": "2026-06-09T10:12:04.901Z",
    "position": 1
  }
]`} />
<h2 id="get-apiv1executions123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/executions/&#123;id&#125;`}</code></h2>
<p>Live status of one running execution. Returns the same running view as the list endpoint.</p>
<CodeBlock lang="http" code={`GET /api/v1/executions/<uuid>
Authorization: Bearer <token>`} />
<h3 id="response-4">Response</h3>
<CodeBlock lang="json" code={`{
  "id": "<uuid>",
  "flow_name": "registration",
  "status": "running",
  "started_at": "2026-06-09T10:12:03.114Z",
  "elapsed": "1.482s",
  "metrics": { "flow.duration_p50_ms": 174, "tx.messages_total": 3 },
  "event_log": [ { "ts": "...", "level": "info", "msg": "engine started" } ],
  "msg_types": { "tx": { "ngap": { "InitialUEMessage": 1 } }, "rx": {} }
}`} />
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>No live execution with this ID. The run may have finished — fetch its <a href="#reports">report</a> instead.</td></tr></tbody>
</table>
<p>Once an execution completes it leaves the registry, so this endpoint <strong>404s for finished runs</strong>. To read the outcome of a completed run, use <a href="#get-apiv1reports123id125"><code>{`GET /api/v1/reports/{id}`}</code></a> — it accepts the execution ID as well as the report ID.</p>
<h2 id="delete-apiv1executions123id125" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/executions/&#123;id&#125;`}</code></h2>
<p>Cancel a queued or running execution. Best-effort: in-flight UEs may continue briefly. The engine cancels the parent context, and any UE blocked in a <code>{`wait_*`}</code> state lands in <code>{`failed`}</code> via <code>{`on_timeout`}</code> shortly after.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/executions/<uuid>
Authorization: Bearer <token>`} />
<p>Returns <code>{`204 No Content`}</code> on success.</p>
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>No pending schedule or running execution with this ID. A run that already finished is gone from both, so it returns 404.</td></tr></tbody>
</table>
<h2 id="notes">Notes on polling</h2>
<ul>
<li>Poll <code>{`/executions/{id}`}</code> every second or two while a run is live. There is no SSE or WebSocket endpoint in v1.</li>
<li>The daemon keeps live executions in memory only; finished ones survive as the persisted report. When <code>{`/executions/{id}`}</code> starts returning 404, the run is done — read its report.</li>
</ul>

<h2 id="reports">Reports</h2>
<p>A report is the persisted result of a finished execution — the durable record of what happened. Reports are written when a run completes and stay available for later query, which is exactly what CI plug-ins read after a run.</p>
<h3 id="report-endpoints">Report endpoints</h3>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/reports`}</code></td><td>List recent reports</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/reports/{id}`}</code></td><td>One report by report ID or execution ID</td></tr></tbody>
</table>
<h3 id="get-apiv1reports" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/reports`}</code></h3>
<p>List recent reports, newest first. The only query param is <code>{`limit`}</code>; there is no per-flow or per-schedule filter. Filter client-side on the fields below if you need a narrower view.</p>
<CodeBlock lang="http" code={`GET /api/v1/reports?limit=50
Authorization: Bearer <token>`} />
<table>
<thead><tr><th>Query param</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`limit`}</code></td><td>environment <code>{`execution.report_limit`}</code> setting (ships at 20)</td><td>Maximum entries to return</td></tr></tbody>
</table>
<h4 id="response-5">Response</h4>
<p>An array of full report records, newest first.</p>
<CodeBlock lang="json" code={`[
  {
    "id": "<report-uuid>",
    "execution_id": "<execution-uuid>",
    "schedule_id": "",
    "flow_name": "registration",
    "duration_ms": 187,
    "all_passed": true,
    "metrics": { "flow.duration_p50_ms": 174, "tx.messages_total": 5 },
    "created_at": "2026-06-09T10:12:05.301Z"
  }
]`} />
<p>Omitted fields (<code>{`steps`}</code>, <code>{`event_log`}</code>, <code>{`msg_types`}</code>, <code>{`post_checks`}</code>, and so on) are dropped from the JSON when empty for that run; a single-UE run carries them, a large burst run may not.</p>
<p><code>{`suite_execution_id`}</code> is present only on reports produced by suite steps; the suite-level summary lives in a separate <code>{`SuiteReportEntity`}</code> (no public API in v1 — surfaced in the web UI's reports page and via <code>{`report show-suite`}</code> on the CLI).</p>
<h3 id="get-apiv1reports123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/reports/&#123;id&#125;`}</code></h3>
<p>Full report detail. The path accepts either the report ID or the originating execution ID — so after a run you can fetch its report straight from the execution ID you got back from <code>{`/execute`}</code>, without holding onto a separate report ID.</p>
<CodeBlock lang="http" code={`GET /api/v1/reports/<report-uuid-or-execution-uuid>
Authorization: Bearer <token>`} />
<h4 id="response-6">Response</h4>
<CodeBlock lang="json" code={`{
  "id": "<report-uuid>",
  "execution_id": "<execution-uuid>",
  "schedule_id": "",
  "flow_name": "registration",
  "duration_ms": 187,
  "all_passed": true,
  "metrics": {
    "flow.duration_p50_ms": 174,
    "flow.duration_p95_ms": 211,
    "tx.messages_total": 5
  },
  "steps": [
    {
      "ts": "...",
      "state_from": "idle",
      "state_to": "wait_auth_request",
      "event": "Start",
      "actions": []
    }
  ],
  "event_log": [
    { "ts": "...", "level": "info", "msg": "engine started" }
  ],
  "msg_types": {
    "tx": { "ngap": { "InitialUEMessage": 1, "AuthResponse": 1 } },
    "rx": { "ngap": { "AuthenticationRequest": 1 } }
  },
  "workload": {
    "repetitions": 1,
    "rate": 0,
    "timeout": "30s"
  },
  "post_checks": [],
  "uplane_report": null,
  "created_at": "2026-06-09T10:12:05.301Z"
}`} />
<table>
<thead><tr><th>Field</th><th>Notes</th></tr></thead>
<tbody><tr><td><code>{`duration_ms`}</code></td><td>Wall-clock run duration in milliseconds</td></tr>
<tr><td><code>{`metrics`}</code></td><td>Flat map of bucketed timings + counts</td></tr>
<tr><td><code>{`steps`}</code></td><td>Per-message log; populated only for single-UE runs (<code>{`repetitions: 1`}</code> and no <code>{`rate`}</code>/<code>{`duration`}</code>)</td></tr>
<tr><td><code>{`event_log`}</code></td><td>Timestamped progress events; useful for failure forensics</td></tr>
<tr><td><code>{`msg_types`}</code></td><td>Per-protocol per-message-type counts</td></tr>
<tr><td><code>{`workload`}</code></td><td>The workload config the run actually used</td></tr>
<tr><td><code>{`post_checks`}</code></td><td><code>{`-expect`}</code> / <code>{`-max-latency`}</code> style assertions and their results</td></tr>
<tr><td><code>{`uplane_report`}</code></td><td>Per-flow user-plane metric snapshot when <code>{`uplane_start`}</code> ran</td></tr>
<tr><td><code>{`all_passed`}</code></td><td>The CI gate: true means every check passed and every UE reached a passing terminal state</td></tr></tbody>
</table>
<h4 id="errors-3">Errors</h4>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>No report found for this report ID or execution ID</td></tr></tbody>
</table>
<h3 id="programmatic-ci-usage">Programmatic CI usage</h3>
<p>Trigger a run, poll until the live execution disappears (it finished), then read the report by execution ID and gate on <code>{`all_passed`}</code>.</p>
<CodeBlock lang="bash" code={`TOKEN=$(...login...)
EXEC=$(curl -s -X POST $DAEMON/api/v1/execute -H "Authorization: Bearer $TOKEN" \\
    -H 'Content-Type: application/json' \\
    -d '{"flow_id":"registration","environment_id":"'$ENV'","repetitions":5,"rate":1}' | jq -r .execution_id)

# Poll until the live execution is gone (HTTP 404 = finished)
while curl -sf -o /dev/null -H "Authorization: Bearer $TOKEN" \\
    $DAEMON/api/v1/executions/$EXEC; do
  sleep 2
done

# Fetch the report by execution ID and gate
curl -s -H "Authorization: Bearer $TOKEN" \\
    $DAEMON/api/v1/reports/$EXEC | jq -e .all_passed`} />
<p>The exit code from <code>{`jq -e`}</code> mirrors the <code>{`all_passed`}</code> boolean — that's your CI gate.</p>
<h3 id="report-notes">Notes on reports</h3>
<ul>
<li>Reports are kept indefinitely; there's no auto-rotation in v1.</li>
<li>Suite-step reports appear in the list with <code>{`suite_execution_id`}</code> populated. Filter them out client-side for an "ad-hoc runs only" view.</li>
</ul>

<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/api/schedules">Schedules</Link> — run flows on a cron schedule instead of one-shot.</li>
<li><Link to="/reference/metrics">Metrics reference</Link> — what every key in <code>{`metrics`}</code> means.</li>
<li><Link to="/guides/ci-integration">CI integration</Link> — wire <code>{`all_passed`}</code> into a build gate end to end.</li>
</ul>
    </DocPage>
  );
}
