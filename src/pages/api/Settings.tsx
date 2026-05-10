import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';

export default function ApiSettings() {
  return (
    <DocPage slug="api/settings">
<h1>Settings</h1>
<p>Runtime tuning. Persisted to the DB so values survive daemon restarts. <code>{`GET`}</code> is open to any authenticated user; <code>{`PUT`}</code> requires <code>{`role: admin`}</code>.</p>
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/settings`}</code></td><td>bearer</td><td>Read all runtime settings</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/settings`}</code></td><td>admin</td><td>Update one or more settings</td></tr></tbody>
</table>
<h2 id="get-apiv1settings">GET /api/v1/settings</h2>
<CodeBlock lang="http" code={`GET /api/v1/settings
Authorization: Bearer <token>`} />
<h3 id="response">Response</h3>
<CodeBlock lang="json" code={`{
  "shutdown_timeout": "10s",
  "subscriber_acquire_timeout": "5s",
  "default_flow_timeout": "30s",
  "default_workload_max_repetitions": 1000,
  "default_workload_max_rate": 100
}`} />
<p>The exact set of keys is the runtime-settings registry — additions are non-breaking. Each key is documented in <code>{`fpl/settings.go`}</code>.</p>
<h2 id="put-apiv1settings">PUT /api/v1/settings</h2>
<p>Update. Body is a partial map — only provided keys are changed.</p>
<CodeBlock lang="http" code={`PUT /api/v1/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "shutdown_timeout": "30s",
  "default_workload_max_rate": 200
}`} />
<h3 id="response-2">Response</h3>
<p>Returns the full settings object (the same shape <code>{`GET`}</code> returns) reflecting the new values.</p>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Unknown key, invalid value (bad duration string, negative number, etc.)</td></tr>
<tr><td>403</td><td>Caller is not <code>{`admin`}</code></td></tr></tbody>
</table>
<h2 id="effect-timing">Effect timing</h2>
<p>Most settings take effect on the next operation that reads them — duration knobs are read fresh each call. The exception is <code>{`shutdown_timeout`}</code> (read at shutdown, so it applies to the <em>next</em> shutdown).</p>
<h2 id="notes">Notes</h2>
<ul>
<li>The settings table is small and stable; adding a new tunable is a code change with a default value, not a schema migration.</li>
<li>For per-execution overrides (timeouts, rates), use the <code>{`/execute`}</code> body fields rather than mutating settings.</li>
<li>Settings do <em>not</em> govern transport-level behaviour (SCTP retransmission, Diameter watchdog interval, etc.) — those live on the env's transport blocks.</li>
</ul>
    </DocPage>
  );
}
