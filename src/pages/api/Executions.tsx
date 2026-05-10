import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiExecutions() {
  return (
    <DocPage slug="api/executions">
<h1>Executions</h1>
<p>Trigger and inspect in-flight runs. An execution is one engine invocation against one (flow, env) pair — the same shape a CLI <code>{`run-flow`}</code> produces.</p>
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>POST</td><td><code>{`/api/v1/execute`}</code></td><td>Queue an immediate execution</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/executions`}</code></td><td>List recent executions</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/executions/queue`}</code></td><td>Live queue depth + waiters</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/executions/{id}`}</code></td><td>Detail / status</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/executions/{id}`}</code></td><td>Cancel queued or running</td></tr></tbody>
</table>
<h2 id="post-apiv1execute">POST /api/v1/execute</h2>
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
  "duration_sec": 0,
  "timeout_sec": 30,
  "trace": false
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`flow_id`}</code></td><td>string</td><td>yes</td><td>—</td><td>Flow name (built-in) or UUID (custom)</td></tr>
<tr><td><code>{`environment_id`}</code></td><td>string</td><td>yes</td><td>—</td><td>Env UUID</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td><code>{`{}`}</code></td><td>Per-flow params overlay</td></tr>
<tr><td><code>{`repetitions`}</code></td><td>int</td><td>no</td><td>1</td><td>UEs to spawn</td></tr>
<tr><td><code>{`rate`}</code></td><td>float</td><td>no</td><td>0</td><td>UEs per second (0 = burst)</td></tr>
<tr><td><code>{`duration_sec`}</code></td><td>int</td><td>no</td><td>0</td><td>Stop spawning after this elapses</td></tr>
<tr><td><code>{`timeout_sec`}</code></td><td>int</td><td>no</td><td>30</td><td>Per-UE timeout</td></tr>
<tr><td><code>{`trace`}</code></td><td>bool</td><td>no</td><td>false</td><td>Enable TX/RX hex dump + JSON trace</td></tr></tbody>
</table>
<h3 id="response">Response</h3>
<CodeBlock lang="http" code={`202 Accepted
Content-Type: application/json

{
  "execution_id": "<uuid>",
  "status": "queued",
  "position": 0
}`} />
<p><code>{`position`}</code> is the queue position when this call lands; <code>{`0`}</code> means it's first up. Subsequent polls of <code>{`/executions/{id}`}</code> return the live status.</p>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Missing <code>{`flow_id`}</code> or <code>{`environment_id`}</code>, or fields fail validation</td></tr>
<tr><td>404</td><td>Flow or environment not found</td></tr></tbody>
</table>
<h2 id="get-apiv1executions">GET /api/v1/executions</h2>
<p>List recent executions across all states.</p>
<CodeBlock lang="http" code={`GET /api/v1/executions?limit=50
Authorization: Bearer <token>`} />
<table>
<thead><tr><th>Query param</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`limit`}</code></td><td>20</td><td>Maximum entries to return</td></tr></tbody>
</table>
<h3 id="response-2">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "id": "<uuid>",
    "flow_id": "registration",
    "flow_name": "registration",
    "environment_id": "<uuid>",
    "schedule_id": "",
    "status": "succeeded",
    "started_at": "...",
    "ended_at": "...",
    "duration_ms": 187
  }
]`} />
<p><code>{`status`}</code> values:</p>
<ul>
<li><code>{`queued`}</code> — accepted, not yet running</li>
<li><code>{`running`}</code> — engine is dispatching UEs</li>
<li><code>{`succeeded`}</code> — finished with <code>{`AllPassed: true`}</code></li>
<li><code>{`failed`}</code> — finished with <code>{`AllPassed: false`}</code></li>
<li><code>{`canceled`}</code> — DELETE before completion</li>
</ul>
<h2 id="get-apiv1executionsqueue">GET /api/v1/executions/queue</h2>
<p>Live queue snapshot.</p>
<CodeBlock lang="http" code={`GET /api/v1/executions/queue
Authorization: Bearer <token>`} />
<h3 id="response-3">Response</h3>
<CodeBlock lang="json" code={`{
  "depth": 3,
  "waiting": [
    { "execution_id": "<uuid>", "queued_at": "...", "flow_id": "..." }
  ]
}`} />
<h2 id="get-apiv1executions123id125">GET /api/v1/executions/&#123;id&#125;</h2>
<CodeBlock lang="http" code={`GET /api/v1/executions/<uuid>
Authorization: Bearer <token>`} />
<h3 id="response-4">Response</h3>
<CodeBlock lang="json" code={`{
  "id": "<uuid>",
  "flow_id": "registration",
  "flow_name": "registration",
  "environment_id": "<uuid>",
  "schedule_id": "",
  "status": "running",
  "started_at": "...",
  "ended_at": null,
  "duration_ms": 0,
  "report_id": ""
}`} />
<p>After completion, <code>{`report_id`}</code> points at the persisted <code>{`ReportEntity`}</code> — fetch it via <Link to="/api/executions">Reports</Link>.</p>
<h2 id="delete-apiv1executions123id125">DELETE /api/v1/executions/&#123;id&#125;</h2>
<p>Cancel a queued or running execution. Best-effort: in-flight UEs may continue briefly; the engine cancels the parent context and any UE blocked in a <code>{`wait_*`}</code> state will land in <code>{`failed`}</code> via <code>{`on_timeout`}</code> shortly.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/executions/<uuid>
Authorization: Bearer <token>`} />
<p>Returns <code>{`204 No Content`}</code> on success.</p>
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Execution not found</td></tr>
<tr><td>409</td><td>Execution already finished (succeeded/failed/canceled)</td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li>Polling for completion: GET <code>{`/executions/{id}`}</code> every second or two. There is no SSE or WebSocket endpoint in v1.</li>
<li>The daemon's in-memory <code>{`ExecutionRegistry`}</code> keeps live executions; finished ones survive only via the persisted <code>{`ReportEntity`}</code>. The <code>{`/executions/{id}`}</code> endpoint reads from both.</li>
<li>For long-running burst tests, prefer scheduling them via <code>{`/schedules`}</code> rather than holding an HTTP connection — the <code>{`run-now`}</code> endpoint copies all the params and queues an execution without keeping you blocked.</li>
</ul>
<p>Persisted execution results. The same <code>{`EngineResult`}</code> shape <code>{`run-flow`}</code> emits to stdout when called with <code>{`-output json`}</code> — exactly what CI plug-ins want.</p>
<h2 id="endpoints-2">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/reports`}</code></td><td>List</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/reports/{id}`}</code></td><td>Detail</td></tr></tbody>
</table>
<h2 id="get-apiv1reports">GET /api/v1/reports</h2>
<p>List recent reports. Supports filtering by flow and schedule.</p>
<CodeBlock lang="http" code={`GET /api/v1/reports?limit=50&flow_id=registration&schedule_id=<uuid>
Authorization: Bearer <token>`} />
<table>
<thead><tr><th>Query param</th><th>Default</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`limit`}</code></td><td>20</td><td>Maximum entries to return</td></tr>
<tr><td><code>{`flow_id`}</code></td><td>—</td><td>Filter to one flow</td></tr>
<tr><td><code>{`schedule_id`}</code></td><td>—</td><td>Filter to executions triggered by one schedule</td></tr></tbody>
</table>
<h3 id="response-5">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "id": "<uuid>",
    "execution_id": "<uuid>",
    "schedule_id": "",
    "suite_execution_id": "",
    "suite_step_name": "",
    "flow_id": "registration",
    "flow_name": "registration",
    "all_passed": true,
    "duration_ms": 187,
    "created_at": "..."
  }
]`} />
<p>The list view returns metadata only. Fetch the full report (with steps, event log, message-type breakdown, post-checks) via <code>{`/api/v1/reports/{id}`}</code>.</p>
<p><code>{`suite_execution_id`}</code> is non-empty only for reports produced by suite steps; the suite-level summary lives at a separate <code>{`SuiteReportEntity`}</code> (no public API in v1; surfaced in the web UI's Reports page and via <code>{`report show-suite`}</code> on the CLI).</p>
<h2 id="get-apiv1reports123id125">GET /api/v1/reports/&#123;id&#125;</h2>
<p>Full report detail.</p>
<CodeBlock lang="http" code={`GET /api/v1/reports/<uuid>
Authorization: Bearer <token>`} />
<h3 id="response-6">Response</h3>
<p>The shape mirrors <code>{`EngineResult`}</code> — every field that fluxproto-light serialises to JSON when you pass <code>{`-output json`}</code> to the CLI. Stable across releases.</p>
<CodeBlock lang="json" code={`{
  "id": "<report-uuid>",
  "execution_id": "<execution-uuid>",
  "schedule_id": "",
  "suite_execution_id": "",
  "suite_step_name": "",
  "flow_name": "registration",
  "duration": 187000000,
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
      "actions": [...]
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
    "duration": "",
    "timeout": "30s"
  },
  "post_checks": [],
  "uplane_report": null,
  "all_passed": true,
  "created_at": "..."
}`} />
<table>
<thead><tr><th>Field</th><th>Notes</th></tr></thead>
<tbody><tr><td><code>{`duration`}</code></td><td>Nanoseconds, <code>{`time.Duration`}</code>-shaped</td></tr>
<tr><td><code>{`metrics`}</code></td><td>Flat map of bucketed timings + counts</td></tr>
<tr><td><code>{`steps`}</code></td><td>Per-message log; populated only for single-UE runs (<code>{`repetitions: 1`}</code> and no <code>{`rate`}</code>/<code>{`duration`}</code>)</td></tr>
<tr><td><code>{`event_log`}</code></td><td>Timestamped progress events; useful for failure forensics</td></tr>
<tr><td><code>{`msg_types`}</code></td><td>Per-protocol per-message-type counts</td></tr>
<tr><td><code>{`post_checks`}</code></td><td><code>{`-expect`}</code>, <code>{`-max-latency`}</code> style assertions and their results</td></tr>
<tr><td><code>{`uplane_report`}</code></td><td>Per-flow user-plane metric snapshot when <code>{`uplane_start`}</code> ran</td></tr>
<tr><td><code>{`all_passed`}</code></td><td>The CI gate: true means every check passed and every UE reached a passing terminal state</td></tr></tbody>
</table>
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Report not found</td></tr></tbody>
</table>
<h2 id="programmatic-ci-usage">Programmatic CI usage</h2>
<CodeBlock lang="bash" code={`TOKEN=$(...login...)
EXEC=$(curl -s -X POST $DAEMON/api/v1/execute -H "Authorization: Bearer $TOKEN" \\
    -H 'Content-Type: application/json' \\
    -d '{"flow_id":"registration","environment_id":"'$ENV'","repetitions":5,"rate":1}' | jq -r .execution_id)

# Poll until done
while :; do
  STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" $DAEMON/api/v1/executions/$EXEC | jq -r .status)
  case "$STATUS" in
    succeeded|failed|canceled) break ;;
    *) sleep 2 ;;
  esac
done

# Fetch the report and gate
REPORT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" $DAEMON/api/v1/executions/$EXEC | jq -r .report_id)
curl -s -H "Authorization: Bearer $TOKEN" $DAEMON/api/v1/reports/$REPORT_ID | jq -e .all_passed`} />
<p>Exit code from <code>{`jq -e`}</code> mirrors the boolean — that's your CI gate.</p>
<h2 id="notes-2">Notes</h2>
<ul>
<li>Reports are kept indefinitely. Truncate the <code>{`reports`}</code> table if you need to free space; there's no auto-rotation in v1.</li>
<li>Suite-children reports surface in this list with <code>{`suite_execution_id`}</code> populated. Filter them out client-side for "ad-hoc runs only" views.</li>
</ul>
    </DocPage>
  );
}
