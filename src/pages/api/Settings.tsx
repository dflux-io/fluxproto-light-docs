import { Link } from 'react-router-dom';
import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';

export default function ApiSettings() {
  return (
    <DocPage slug="api/settings" lede="Runtime tuning. Persisted to the DB so values survive daemon restarts. GET is open to any authenticated user; PUT requires role: admin.">
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/settings`}</code></td><td>bearer</td><td>Read all runtime settings</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/settings`}</code></td><td>admin</td><td>Update one or more settings</td></tr></tbody>
</table>
<h2 id="get-apiv1settings" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/settings`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/settings
Authorization: Bearer <token>`} />
<h3 id="response">Response</h3>
<p>The response is a JSON array. Each entry carries the setting's namespaced <code>{`key`}</code>, its current <code>{`value`}</code>, the built-in <code>{`default`}</code>, and a human-readable <code>{`description`}</code> — so a client can render the full settings panel without hard-coding labels.</p>
<CodeBlock lang="json" code={`[
  { "key": "execution.flow_timeout",              "value": "30s",   "default": "30s",   "description": "Default per-flow execution timeout" },
  { "key": "execution.subscriber_acquire_timeout", "value": "5s",    "default": "5s",    "description": "How long to wait for a free subscriber before failing" },
  { "key": "execution.report_limit",              "value": "20",    "default": "20",    "description": "Default number of reports returned by the list endpoint" },
  { "key": "transport.ng_setup_timeout",          "value": "5s",    "default": "5s",    "description": "Timeout for NG Setup procedure with AMF" },
  { "key": "transport.sctp_max_retries",          "value": "10",    "default": "10",    "description": "Maximum SCTP reconnection retry attempts" },
  { "key": "transport.sctp_initial_backoff",      "value": "1s",    "default": "1s",    "description": "Initial backoff duration for SCTP reconnection" },
  { "key": "transport.sctp_max_backoff",          "value": "30s",   "default": "30s",   "description": "Maximum backoff duration for SCTP reconnection (exponential cap)" },
  { "key": "daemon.slow_query_threshold",         "value": "200ms", "default": "200ms", "description": "SQL queries slower than this are logged as warnings" },
  { "key": "daemon.shutdown_timeout",             "value": "10s",   "default": "10s",   "description": "Graceful shutdown timeout for HTTP daemon" },
  { "key": "ui.status_refresh_interval",          "value": "10s",   "default": "10s",   "description": "How often the UI status bar refreshes environment and subscriber info" }
]`} />
<p>Every key is namespaced (<code>{`execution.`}</code>, <code>{`transport.`}</code>, <code>{`daemon.`}</code>, <code>{`ui.`}</code>). Duration values use Go duration strings (<code>{`30s`}</code>, <code>{`200ms`}</code>); <code>{`sctp_max_retries`}</code> and <code>{`report_limit`}</code> are integers.</p>
<h2 id="put-apiv1settings" className="flex items-center gap-2"><HttpMethod method="PUT" /><code>{`/api/v1/settings`}</code></h2>
<p>Admin only. The body is a flat <code>{`key → value`}</code> object of namespaced keys — only the keys you send are changed; the rest keep their stored values. Use the same key names the GET response returns.</p>
<CodeBlock lang="http" code={`PUT /api/v1/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "daemon.shutdown_timeout": "30s",
  "transport.sctp_max_retries": "20"
}`} />
<h3 id="response-2">Response</h3>
<p>Returns the same array the <code>{`GET`}</code> endpoint returns, reflecting the new values. The in-memory cache that the engine and transport read from is refreshed before the response is sent.</p>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Unknown setting key, or an invalid value — duration keys must be a valid Go duration (<code>{`30s`}</code>, <code>{`5m`}</code>) and positive; integer keys must be a non-negative integer.</td></tr>
<tr><td>403</td><td>Caller does not have the <code>{`admin`}</code> role.</td></tr></tbody>
</table>
<h2 id="effect-timing">Effect timing</h2>
<p>A successful PUT refreshes the cache the engine and transport read from, so most settings apply to the next operation that reads them. <code>{`daemon.shutdown_timeout`}</code> is read when the daemon shuts down, so it applies to the next shutdown.</p>
<h2 id="notes">Notes</h2>
<ul>
<li>Transport tuning is exposed here: <code>{`transport.sctp_max_retries`}</code>, <code>{`transport.sctp_initial_backoff`}</code>, and <code>{`transport.sctp_max_backoff`}</code> govern SCTP reconnection, and <code>{`transport.ng_setup_timeout`}</code> bounds the NG Setup procedure with the AMF.</li>
<li>For per-execution overrides such as rate and repetitions, use the request body fields on <Link to="/api/executions">execution endpoints</Link> rather than mutating settings.</li>
<li>Persisted to the database, so values survive a daemon restart. Keys not present in the database fall back to their built-in <code>{`default`}</code>.</li>
</ul>
    </DocPage>
  );
}
