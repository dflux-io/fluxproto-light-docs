import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiSchedules() {
  return (
    <DocPage slug="api/schedules" lede="Cron-style and one-shot scheduled executions. Each fire produces a normal execution report, indistinguishable from a manual /execute apart from the schedule_id stamped on it.">
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
<p>Two types are available:</p>
<ul>
<li><strong><code>{`once`}</code></strong> — fires exactly once at <code>{`run_at`}</code> (RFC 3339 timestamp).</li>
<li><strong><code>{`cron`}</code></strong> — fires on a 5-field standard cron expression (<code>{`m h dom mon dow`}</code>) in the schedule's <code>{`timezone`}</code> (default <code>{`UTC`}</code>).</li>
</ul>
<p>Cron expressions use the standard five fields — minute, hour, day-of-month, month, day-of-week. There is no seconds field and no descriptors like <code>{`@daily`}</code>.</p>
<h3 id="target-kind">What a schedule runs</h3>
<p>Each schedule targets either a flow or a suite, selected by <code>{`target_kind`}</code>:</p>
<ul>
<li><strong><code>{`flow`}</code></strong> (default) — runs the flow named in <code>{`flow_id`}</code> against <code>{`environment_id`}</code> with the workload knobs below.</li>
<li><strong><code>{`suite`}</code></strong> — runs the suite named in <code>{`suite_id`}</code>. See <Link to="/concepts/suites">Suites</Link> for the suite execution model.</li>
</ul>
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
    "workspace_id": "<uuid>",
    "target_kind": "flow",
    "flow_id": "registration",
    "environment_id": "<uuid>",
    "params": null,
    "repetitions": 5,
    "rate": 1,
    "duration_sec": 0,
    "timeout_sec": 30,
    "trace": false,
    "gen_subscriber": false,
    "cron_expr": "0 2 * * *",
    "timezone": "UTC",
    "next_run_at": "2026-05-11T02:00:00Z",
    "state": "pending",
    "enabled": true,
    "last_run_at": "2026-05-10T02:00:00Z",
    "last_report_id": "<uuid>",
    "last_status": "ok",
    "run_count": 30,
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
<tr><td><code>{`target_kind`}</code></td><td>string</td><td>no</td><td><code>{`flow`}</code> (default) or <code>{`suite`}</code></td></tr>
<tr><td><code>{`flow_id`}</code></td><td>string</td><td>for flow targets</td><td>Flow name or UUID</td></tr>
<tr><td><code>{`suite_id`}</code></td><td>string</td><td>for suite targets</td><td>Suite name or UUID</td></tr>
<tr><td><code>{`environment_id`}</code></td><td>string</td><td>yes</td><td>Environment UUID; must exist</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td>Per-flow params overlay</td></tr>
<tr><td><code>{`repetitions`}</code></td><td>int</td><td>no</td><td>UE count (default 1)</td></tr>
<tr><td><code>{`rate`}</code></td><td>float</td><td>no</td><td>UEs/s (0 = burst)</td></tr>
<tr><td><code>{`duration_sec`}</code></td><td>int</td><td>no</td><td>Stop spawning after N seconds</td></tr>
<tr><td><code>{`timeout_sec`}</code></td><td>int</td><td>no</td><td>Per-UE timeout (default 30)</td></tr>
<tr><td><code>{`trace`}</code></td><td>bool</td><td>no</td><td>Enable trace output</td></tr>
<tr><td><code>{`gen_subscriber`}</code></td><td>bool</td><td>no</td><td>Generate a subscriber per UE</td></tr>
<tr><td><code>{`run_at`}</code></td><td>RFC 3339</td><td>yes for <code>{`once`}</code></td><td>Fire time</td></tr>
<tr><td><code>{`cron_expr`}</code></td><td>string</td><td>yes for <code>{`cron`}</code></td><td>5-field cron</td></tr>
<tr><td><code>{`timezone`}</code></td><td>string</td><td>no</td><td>IANA tz; default <code>{`UTC`}</code></td></tr>
<tr><td><code>{`enabled`}</code></td><td>bool</td><td>no</td><td>Default <code>{`true`}</code></td></tr></tbody>
</table>
<h3 id="cross-field-validation">Cross-field validation</h3>
<ul>
<li><code>{`type: once`}</code> requires <code>{`run_at`}</code>.</li>
<li><code>{`type: cron`}</code> requires <code>{`cron_expr`}</code>.</li>
<li><code>{`target_kind: flow`}</code> requires <code>{`flow_id`}</code>; <code>{`target_kind: suite`}</code> requires <code>{`suite_id`}</code>.</li>
<li><code>{`timezone`}</code>, if set, must be a valid IANA timezone name.</li>
<li>The target (<code>{`flow_id`}</code> or <code>{`suite_id`}</code>) and <code>{`environment_id`}</code> must resolve at write time.</li>
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
<p>Replace the schedule. Same body shape as <code>{`POST`}</code>. The next fire is recomputed from the new body.</p>
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
<p>Cancel and delete the schedule. An in-flight fire completes, and its report still persists.</p>
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
<p>The <code>{`state`}</code> field reports where a schedule is in its lifecycle:</p>
<ul>
<li><code>{`pending`}</code> — waiting for the next fire. This is the initial state, and a <code>{`cron`}</code> schedule returns here after each fire once <code>{`next_run_at`}</code> is recomputed.</li>
<li><code>{`running`}</code> — a fire is in progress.</li>
<li><code>{`failed`}</code> — a <code>{`cron`}</code> schedule whose expression no longer parses. The engine sets <code>{`enabled: false`}</code> at the same time so it stops firing.</li>
</ul>
<p>A <code>{`once`}</code> schedule is deleted after its single fire rather than left in a terminal state, so you will not see it in subsequent list responses.</p>
<p><code>{`last_status`}</code> records the outcome of the most recent fire:</p>
<ul>
<li><code>{`ok`}</code> — the fire completed without error.</li>
<li><code>{`failed`}</code> — the fire ran but the run returned an error.</li>
<li><code>{`cron_parse_error`}</code> — the cron expression could not be parsed when computing the next fire.</li>
<li><code>{`crashed`}</code> — the schedule was interrupted mid-fire by a daemon restart; recovered on startup.</li>
</ul>
<p><code>{`run_count`}</code> increments on each cron fire, and <code>{`last_report_id`}</code> points at the report from the most recent fire.</p>
<h2 id="notes">Notes</h2>
<ul>
<li>Schedules persist across daemon restarts. The scheduler rebuilds its queue from the database on startup.</li>
<li>The next cron fire is recomputed and persisted after each run, so the queue is restored deterministically after a restart.</li>
<li>For a one-shot ad-hoc run, prefer <Link to="/api/executions">POST /api/v1/execute</Link> directly. Schedules are for recurring or future fires.</li>
</ul>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/api/executions">Executions</Link> — track the runs a schedule produces.</li>
<li><Link to="/guides/ci-integration">CI integration</Link> — drive scheduled runs from a pipeline.</li>
</ul>
    </DocPage>
  );
}
