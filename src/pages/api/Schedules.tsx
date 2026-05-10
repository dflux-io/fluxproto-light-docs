import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiSchedules() {
  return (
    <DocPage slug="api/schedules" lede="Cron-style and one-shot scheduled executions. Each fire produces a normal ReportEntity indistinguishable from a manual /execute (apart from schedule_id stamped on it).">
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/schedules`}</code></td><td>List</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/schedules`}</code></td><td>Create</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/schedules/{id}`}</code></td><td>Get</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/schedules/{id}`}</code></td><td>Update</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/schedules/{id}`}</code></td><td>Delete</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/schedules/{id}/run`}</code></td><td>Fire immediately</td></tr></tbody>
</table>
<h2 id="schedule-types">Schedule types</h2>
<p>Two ship today (plus an internal <code>{`immediate`}</code> type used by the run-now endpoint):</p>
<ul>
<li><strong><code>{`once`}</code></strong> — fires exactly once at <code>{`run_at`}</code> (RFC 3339 timestamp).</li>
<li><strong><code>{`cron`}</code></strong> — fires on a 5-field standard cron expression (<code>{`m h dom mon dow`}</code>) in the schedule's <code>{`timezone:`}</code> (default <code>{`UTC`}</code>).</li>
</ul>
<p>The cron parser is <code>{`github.com/robfig/cron/v3`}</code> with the standard <code>{`Minute | Hour | Dom | Month | Dow`}</code> set — no seconds field, no descriptors like <code>{`@daily`}</code>.</p>
<h2 id="get-apiv1schedules" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/schedules`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/schedules?type=cron&enabled=true
Authorization: Bearer <token>`} />
<table>
<thead><tr><th>Query param</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`type`}</code></td><td>Filter to <code>{`once`}</code> or <code>{`cron`}</code></td></tr>
<tr><td><code>{`enabled`}</code></td><td>Filter to <code>{`true`}</code> or <code>{`false`}</code></td></tr></tbody>
</table>
<h3 id="response">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "id": "<uuid>",
    "name": "nightly registration smoke",
    "type": "cron",
    "flow_id": "registration",
    "environment_id": "<uuid>",
    "params": null,
    "repetitions": 5,
    "rate": 1,
    "duration_sec": 0,
    "timeout_sec": 30,
    "trace": false,
    "cron_expr": "0 2 * * *",
    "timezone": "UTC",
    "next_run_at": "2026-05-11T02:00:00Z",
    "state": "pending",
    "enabled": true,
    "last_run_at": "2026-05-10T02:00:00Z",
    "last_status": "success",
    "created_at": "...",
    "updated_at": "..."
  }
]`} />
<h2 id="post-apiv1schedules" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/schedules`}</code></h2>
<p>Create.</p>
<CodeBlock lang="http" code={`POST /api/v1/schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "nightly registration smoke",
  "type": "cron",
  "cron_expr": "0 2 * * *",
  "timezone": "UTC",
  "flow_id": "registration",
  "environment_id": "<uuid>",
  "repetitions": 5,
  "rate": 1,
  "duration_sec": 0,
  "timeout_sec": 30,
  "trace": false,
  "enabled": true
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>Human-readable label</td></tr>
<tr><td><code>{`type`}</code></td><td>string</td><td>yes</td><td><code>{`once`}</code> or <code>{`cron`}</code></td></tr>
<tr><td><code>{`flow_id`}</code></td><td>string</td><td>yes</td><td>Flow name or UUID</td></tr>
<tr><td><code>{`environment_id`}</code></td><td>string</td><td>yes</td><td>Env UUID; must exist</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td>Per-flow params overlay</td></tr>
<tr><td><code>{`repetitions`}</code></td><td>int</td><td>no</td><td>UE count (default 1)</td></tr>
<tr><td><code>{`rate`}</code></td><td>float</td><td>no</td><td>UEs/s (0 = burst)</td></tr>
<tr><td><code>{`duration_sec`}</code></td><td>int</td><td>no</td><td>Stop spawning after N seconds</td></tr>
<tr><td><code>{`timeout_sec`}</code></td><td>int</td><td>no</td><td>Per-UE timeout (default 30)</td></tr>
<tr><td><code>{`trace`}</code></td><td>bool</td><td>no</td><td>Enable trace output</td></tr>
<tr><td><code>{`run_at`}</code></td><td>RFC 3339</td><td>yes for <code>{`once`}</code></td><td>Fire time</td></tr>
<tr><td><code>{`cron_expr`}</code></td><td>string</td><td>yes for <code>{`cron`}</code></td><td>5-field cron</td></tr>
<tr><td><code>{`timezone`}</code></td><td>string</td><td>no</td><td>IANA tz; default <code>{`UTC`}</code></td></tr>
<tr><td><code>{`enabled`}</code></td><td>bool</td><td>no</td><td>Default <code>{`true`}</code></td></tr></tbody>
</table>
<h3 id="cross-field-validation">Cross-field validation</h3>
<ul>
<li><code>{`type: once`}</code> requires <code>{`run_at`}</code>.</li>
<li><code>{`type: cron`}</code> requires <code>{`cron_expr`}</code>.</li>
<li><code>{`timezone:`}</code>, if set, must be a valid IANA timezone (<code>{`time.LoadLocation`}</code>).</li>
<li><code>{`flow_id`}</code> and <code>{`environment_id`}</code> must resolve at write time.</li>
</ul>
<h3 id="response-2">Response</h3>
<CodeBlock lang="http" code={`201 Created
Content-Type: application/json

{
  "id": "<uuid>",
  ...same shape as list entry
}`} />
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Cross-field validation failure (missing run_at, bad cron, bad timezone, ...)</td></tr>
<tr><td>404</td><td>Environment not found</td></tr></tbody>
</table>
<h2 id="get-apiv1schedules123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/schedules/&#123;id&#125;`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/schedules/<uuid>
Authorization: Bearer <token>`} />
<h2 id="put-apiv1schedules123id125" className="flex items-center gap-2"><HttpMethod method="PUT" /><code>{`/api/v1/schedules/&#123;id&#125;`}</code></h2>
<p>Replace. Same body shape as <code>{`POST`}</code> (the daemon cancels the old heap entry and re-enqueues internally).</p>
<CodeBlock lang="http" code={`PUT /api/v1/schedules/<uuid>
Authorization: Bearer <token>
Content-Type: application/json

{ ... full schedule body ... }`} />
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Validation failure</td></tr>
<tr><td>404</td><td>Schedule not found</td></tr></tbody>
</table>
<h2 id="delete-apiv1schedules123id125" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/schedules/&#123;id&#125;`}</code></h2>
<p>Cancel + delete. Best-effort against in-memory heap; an in-flight fire completes and its report still persists.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/schedules/<uuid>
Authorization: Bearer <token>`} />
<p>Returns <code>{`204 No Content`}</code>.</p>
<h2 id="post-apiv1schedules123id125run" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/schedules/&#123;id&#125;/run`}</code></h2>
<p>Fire an immediate one-shot copy of the schedule. Doesn't change the parent's <code>{`next_run_at`}</code> or state — the trigger is recorded as a separate execution.</p>
<CodeBlock lang="http" code={`POST /api/v1/schedules/<uuid>/run
Authorization: Bearer <token>`} />
<h3 id="response-3">Response</h3>
<CodeBlock lang="http" code={`202 Accepted
Content-Type: application/json

{
  "execution_id": "<uuid>",
  "status": "queued",
  "position": 0
}`} />
<p>The new execution copies the schedule's <code>{`flow_id`}</code>, <code>{`environment_id`}</code>, <code>{`params`}</code>, and workload knobs. Track it via <Link to="/api/executions">Executions</Link>.</p>
<h2 id="state-machine">State machine</h2>
<p>A schedule moves through:</p>
<ul>
<li><code>{`pending`}</code> — initial state, waiting for the next fire</li>
<li><code>{`running`}</code> — fire in progress</li>
<li>(back to <code>{`pending`}</code> for cron after recomputing <code>{`next_run_at`}</code>)</li>
<li><code>{`completed`}</code> — for <code>{`once`}</code> schedules after their single fire</li>
<li><code>{`disabled`}</code> — via <code>{`enabled: false`}</code>, or auto-disabled on cron parse error</li>
</ul>
<p><code>{`last_status`}</code> records the outcome of the most recent fire: <code>{`success`}</code>, <code>{`failed`}</code>, <code>{`cron_parse_error`}</code>, etc.</p>
<h2 id="notes">Notes</h2>
<ul>
<li>The signing secret invalidation on daemon restart applies to JWTs only — schedules survive restarts. The scheduler resumes the heap from the DB on startup.</li>
<li>Cron next-time is recomputed and persisted after each fire so the heap can be rebuilt deterministically.</li>
<li>For one-shot ad-hoc runs without persistence, prefer <code>{`POST /api/v1/execute`}</code> directly. Schedules are for <em>recurring</em> or <em>future</em> fires.</li>
</ul>
    </DocPage>
  );
}
