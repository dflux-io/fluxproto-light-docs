import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function Daemon() {
  return (
    <DocPage slug="guides/daemon" lede="fluxproto-light with no subcommand runs as a daemon: HTTP API on port 8199, optional embedded web UI, optional Prometheus metrics, optional pprof. Schedule recurring runs over REST, browse historical reports in the web UI, drive flows from a CI agent against a long-lived test plane. This guide covers startup, login, configuration, and scheduling jobs.">
<h2 id="starting-the-daemon">Starting the daemon</h2>
<CodeBlock lang="bash" code={`./bin/fluxproto-light                    # API only on :8199
./bin/fluxproto-light -port 8199 -web    # API + web UI on :8199
./bin/fluxproto-light -metrics_port 9090 # Prometheus on :9090
./bin/fluxproto-light -pprof_port 6060   # pprof on :6060`} />
<p>Startup banner:</p>
<CodeBlock lang="" code={`==> fluxproto-light <version>

      Version: <version>
       Commit: <sha>
     Built at: <time>
     API addr: 0.0.0.0:8199
       Web UI: http://0.0.0.0:8199
      Metrics: 0.0.0.0:9090
        PProf: 0.0.0.0:6060`} />
<p>The daemon binds the API + web UI on the same port; the web UI proxies <code>{`/api/v1/*`}</code> to itself. Metrics and pprof live on separate ports if you set them.</p>
<h2 id="first-login">First login</h2>
<p>The daemon seeds a single admin user on first start:</p>
<ul>
<li>Username: <code>{`admin`}</code></li>
<li>Password: <code>{`admin`}</code></li>
</ul>
<p>The first thing the daemon makes you do is change that password — every authenticated endpoint except <code>{`/auth/me`}</code> and <code>{`/auth/change-password`}</code> returns HTTP 423 Locked until you do.</p>
<CodeBlock lang="bash" code={`# Log in
curl -X POST http://localhost:8199/api/v1/auth/login \\
    -H 'Content-Type: application/json' \\
    -d '{"username":"admin","password":"admin"}'
# → { "token": "<jwt>", "must_change_password": true, "user": {...}, "expires_at": "..." }

# Change the password
curl -X POST http://localhost:8199/api/v1/auth/change-password \\
    -H "Authorization: Bearer $TOKEN" \\
    -H 'Content-Type: application/json' \\
    -d '{"current_password":"admin","new_password":"<your new password>"}'`} />
<p>After that, you log in normally and use the returned token on every request.</p>
<h2 id="jwt-bearer-tokens">JWT bearer tokens</h2>
<p>Every authenticated request needs <code>{`Authorization: Bearer &lt;token&gt;`}</code>. The token's claims include <code>{`user_id`}</code>, <code>{`username`}</code>, and <code>{`role`}</code> (<code>{`admin`}</code> or <code>{`user`}</code>). Each token is good for 24 hours. The signing secret is generated fresh on every daemon start and held only in memory, so restarting the daemon invalidates every outstanding token and you log in again.</p>
<CodeBlock lang="bash" code={`curl -H "Authorization: Bearer $TOKEN" \\
    http://localhost:8199/api/v1/flows`} />
<h2 id="daemon-flags">Daemon flags</h2>
<table>
<thead><tr><th>Flag</th><th>Default</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>{`-host &lt;addr&gt;`}</code></td><td><code>{`0.0.0.0`}</code></td><td>Bind address for API + web UI</td></tr>
<tr><td><code>{`-port &lt;port&gt;`}</code></td><td><code>{`8199`}</code></td><td>API + web UI port</td></tr>
<tr><td><code>{`-web`}</code></td><td>off</td><td>Enable the embedded React web UI</td></tr>
<tr><td><code>{`-metrics_port &lt;port&gt;`}</code></td><td>-1 (off)</td><td>Prometheus <code>{`/metrics`}</code> endpoint</td></tr>
<tr><td><code>{`-pprof_port &lt;port&gt;`}</code></td><td>-1 (off)</td><td>Standard library pprof endpoints</td></tr>
<tr><td><code>{`-db_query_log`}</code></td><td>off</td><td>Log every SQL query (very verbose)</td></tr>
<tr><td><code>{`-debug`}</code>, <code>{`-trace`}</code>, <code>{`-quiet`}</code>, <code>{`-json`}</code>, <code>{`-logfile`}</code>, <code>{`-log-caller`}</code></td><td>—</td><td>Logging knobs</td></tr></tbody>
</table>
<p>The daemon doesn't take <code>{`-templates`}</code> or <code>{`-c &lt;config&gt;`}</code> — those are CLI-only. In daemon mode, environments and flows live in the database and are managed via the REST API or web UI.</p>
<h2 id="database">Database</h2>
<p>Default backend is SQLite at <code>{`./fpl.db`}</code>. Override with <code>{`FPL_DB=&lt;path&gt;`}</code> or by pointing the <code>{`-db &lt;path&gt;`}</code> flag at a different file. Postgres support: set the connection string and the daemon switches backends at startup. The schema migrates forward automatically on connect.</p>
<CodeBlock lang="bash" code={`# SQLite (default)
./bin/fluxproto-light

# Postgres
FPL_DB="postgres://user:pass@host:5432/fluxproto?sslmode=disable" \\
    ./bin/fluxproto-light`} />
<p>The daemon auto-releases any subscribers locked from a previous crash on startup, so a hard kill won't leave orphaned locks.</p>
<h2 id="web-ui">Web UI</h2>
<p><code>{`-web`}</code> mounts the embedded web UI on the API port. The daemon serves it as a single-page app: any non-API path falls through to the app shell, so deep-linked URLs work on reload.</p>
<p>If your build of the binary doesn't include the bundled frontend, <code>{`-web`}</code> is a no-op and the daemon logs a warning at startup.</p>
<h2 id="settings-schedules-environments">Settings, schedules, environments</h2>
<p>The daemon exposes the persistent configuration surface over <code>{`/api/v1/`}</code>:</p>
<ul>
<li><code>{`/settings`}</code> — runtime tuning (shutdown timeout, default workload caps). <code>{`GET`}</code> is open to any authed user; <code>{`PUT`}</code> requires <code>{`admin`}</code>.</li>
<li><code>{`/environments`}</code> — stored config YAMLs, addressable by ID. CRUD via REST; <code>{`POST /execute`}</code> references one by ID.</li>
<li><code>{`/schedules`}</code> — cron-style scheduled runs. See <a href="#scheduling-jobs">scheduling jobs</a> below.</li>
<li><code>{`/users`}</code> — user management (admin-only).</li>
</ul>
<h2 id="metrics">Metrics</h2>
<p>Set <code>{`-metrics_port`}</code> and the daemon exposes a Prometheus <code>{`/metrics`}</code> endpoint with every <code>{`fpl_*`}</code> metric the engine produces. See <Link to="/reference/metrics">the metrics reference</Link> for the full list. The standard <code>{`process_*`}</code> and <code>{`go_*`}</code> collectors are also registered.</p>
<h2 id="profiling">Profiling</h2>
<p>Set <code>{`-pprof_port`}</code> for <code>{`net/http/pprof`}</code>. Routes:</p>
<ul>
<li><code>{`/debug/pprof/`}</code> — index</li>
<li><code>{`/debug/pprof/profile?seconds=30`}</code> — CPU</li>
<li><code>{`/debug/pprof/heap`}</code> — heap</li>
<li><code>{`/debug/pprof/goroutine`}</code> — goroutines</li>
</ul>
<h2 id="shutdown">Shutdown</h2>
<p><code>{`SIGINT`}</code> or <code>{`SIGTERM`}</code> triggers a graceful shutdown. The daemon stops handing out subscribers (any request waiting on one is rejected), waits for in-flight executions up to <code>{`shutdown_timeout`}</code> (default 10s, tunable via the <code>{`/settings`}</code> endpoint), and then stops the HTTP, metrics, and pprof listeners.</p>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong><code>{`423 Locked`}</code> on every API call</strong> — the user has <code>{`must_change_password: true`}</code>. Hit <code>{`/auth/change-password`}</code> first.</p>
<p><strong>Web UI loads but API calls 401</strong> — the token has expired or the daemon was restarted. Log in again.</p>
<p><strong>Postgres connection fails on startup</strong> — use the standard <code>{`postgres://user:pass@host:port/db?sslmode=disable`}</code> connection-string form, and URL-encode any special characters in the password.</p>
<p><strong>Stale subscriber locks</strong> — should auto-release on startup, but you can force-release via <code>{`subscriber list`}</code> and <code>{`subscriber purge`}</code> against the DB if needed (see <Link to="/guides/subscribers">subscribers</Link>).</p>
<p><strong>Metrics endpoint 404</strong> — <code>{`-metrics_port`}</code> defaults to <code>{`-1`}</code> (off). Set it to enable.</p>
<h2 id="scheduling-jobs">Scheduling jobs</h2>
<p>The daemon runs a cron-style scheduler for recurring or one-shot flow executions. Manage schedules through the REST API or the web UI's Schedules page; there is no CLI subcommand for create or update. Each scheduled fire produces a normal report, indistinguishable from a manual run apart from the <code>{`schedule_id`}</code> stamped on it.</p>
<h3 id="schedule-types">Schedule types</h3>
<ul>
<li><code>{`once`}</code> — fires exactly once at <code>{`run_at`}</code> (RFC 3339 timestamp).</li>
<li><code>{`cron`}</code> — fires on a 5-field standard cron expression (<code>{`m h dom mon dow`}</code>) in the schedule's <code>{`timezone:`}</code> (default <code>{`UTC`}</code>).</li>
</ul>
<p>A third <code>{`immediate`}</code> type backs the "Run now" button. You don't construct it yourself; trigger it via <code>{`POST /api/v1/schedules/{id}/run`}</code>.</p>
<h3 id="create-a-schedule">Create a schedule</h3>
<CodeBlock lang="bash" code={`curl -X POST http://daemon/api/v1/schedules \\
    -H "Authorization: Bearer $TOKEN" \\
    -H "Content-Type: application/json" \\
    -d '{
      "name": "nightly registration smoke",
      "type": "cron",
      "cron_expr": "0 2 * * *",
      "timezone": "UTC",
      "flow_id": "registration",
      "environment_id": "<env uuid>",
      "repetitions": 5,
      "rate": 1,
      "duration_sec": 0,
      "timeout_sec": 30,
      "trace": false,
      "enabled": true
    }'`} />
<p>The cron expression follows the standard 5-field syntax (minute hour day-of-month month day-of-week). There is no seconds field and no named descriptors such as <code>{`@daily`}</code>.</p>
<p>Request fields:</p>
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Notes</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>Human-readable label</td></tr>
<tr><td><code>{`type`}</code></td><td>string</td><td>yes</td><td><code>{`once`}</code> or <code>{`cron`}</code></td></tr>
<tr><td><code>{`flow_id`}</code></td><td>string</td><td>yes</td><td>Flow name (or DB ID for custom flows)</td></tr>
<tr><td><code>{`environment_id`}</code></td><td>string</td><td>yes</td><td>Environment UUID; must exist</td></tr>
<tr><td><code>{`params`}</code></td><td>map</td><td>no</td><td>Per-flow params overlay</td></tr>
<tr><td><code>{`repetitions`}</code></td><td>int</td><td>no</td><td>UE count per fire (default 1)</td></tr>
<tr><td><code>{`rate`}</code></td><td>float</td><td>no</td><td>UEs/s (0 = burst)</td></tr>
<tr><td><code>{`duration_sec`}</code></td><td>int</td><td>no</td><td>Stop spawning after this many seconds</td></tr>
<tr><td><code>{`timeout_sec`}</code></td><td>int</td><td>no</td><td>Per-UE timeout (default 30)</td></tr>
<tr><td><code>{`trace`}</code></td><td>bool</td><td>no</td><td>Enable trace output for the run</td></tr>
<tr><td><code>{`run_at`}</code></td><td>RFC 3339</td><td>yes for <code>{`once`}</code></td><td>Fire time</td></tr>
<tr><td><code>{`cron_expr`}</code></td><td>string</td><td>yes for <code>{`cron`}</code></td><td>5-field cron expression</td></tr>
<tr><td><code>{`timezone`}</code></td><td>string</td><td>no</td><td>IANA tz name; default <code>{`UTC`}</code></td></tr>
<tr><td><code>{`enabled`}</code></td><td>bool</td><td>no</td><td>Default <code>{`true`}</code>. Disabled schedules don't fire.</td></tr></tbody>
</table>
<h3 id="list-schedules">List schedules</h3>
<CodeBlock lang="bash" code={`curl -H "Authorization: Bearer $TOKEN" \\
    'http://daemon/api/v1/schedules?type=cron&enabled=true'`} />
<p>Both query params are optional filters.</p>
<h3 id="get-one">Get one</h3>
<CodeBlock lang="bash" code={`curl -H "Authorization: Bearer $TOKEN" \\
    http://daemon/api/v1/schedules/<id>`} />
<h3 id="update-one">Update one</h3>
<p><code>{`PUT`}</code> accepts the same body shape as <code>{`POST`}</code> and replaces every field. The daemon reschedules the next fire to match the new definition.</p>
<CodeBlock lang="bash" code={`curl -X PUT http://daemon/api/v1/schedules/<id> \\
    -H "Authorization: Bearer $TOKEN" \\
    -H "Content-Type: application/json" \\
    -d '{ ... }'`} />
<h3 id="delete">Delete</h3>
<CodeBlock lang="bash" code={`curl -X DELETE -H "Authorization: Bearer $TOKEN" \\
    http://daemon/api/v1/schedules/<id>`} />
<p>Returns 204 on success. Deleting a schedule stops future fires. If a fire is already in progress, that execution runs to completion and its report persists.</p>
<h3 id="run-now">Run now</h3>
<CodeBlock lang="bash" code={`curl -X POST -H "Authorization: Bearer $TOKEN" \\
    http://daemon/api/v1/schedules/<id>/run`} />
<p>Creates an immediate one-shot execution copying the parent's <code>{`flow_id`}</code> / <code>{`environment_id`}</code> / <code>{`params`}</code> / workload knobs. Doesn't change the parent's state — the trigger is recorded as a separate execution. Response includes the new execution ID and the queue position.</p>
<h3 id="what-runs-at-fire-time">What runs at fire time</h3>
<p>The scheduler dispatches into the same engine the CLI uses. The fire produces a report with <code>{`schedule_id`}</code> set to the schedule's ID, so you can filter reports by schedule:</p>
<CodeBlock lang="bash" code={`curl -H "Authorization: Bearer $TOKEN" \\
    'http://daemon/api/v1/reports?schedule_id=<id>'`} />
<p>After each fire, a cron schedule's <code>{`next_run_at`}</code> is recomputed and persisted, so pending schedules survive daemon restarts.</p>
<h3 id="failure-modes">Failure modes</h3>
<p>If a cron fire can't compute its next run because the expression is invalid, the scheduler disables the schedule and stamps <code>{`last_status: cron_parse_error`}</code> on it. Re-enable by <code>{`PUT`}</code>-ing a corrected expression.</p>
<p>If the environment a schedule references is deleted, the next fire fails with <code>{`environment not found`}</code> and the schedule's <code>{`last_status`}</code> records that. Disable or reassign to recover.</p>
    </DocPage>
  );
}
