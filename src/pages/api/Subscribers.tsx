import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiSubscribers() {
  return (
    <DocPage slug="api/subscribers">
<h1>Subscribers</h1>
<p>CRUD for subscribers + pool stats. Subscribers are UE identities (SUPI + K + OPC + SQN + algorithms) the engine assigns to UEs at flow-start. The pool serialises one-execution-per-subscriber for the lifetime of each UE.</p>
<p>For the conceptual model, see <Link to="/guides/subscribers">Subscribers guide</Link>.</p>
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/subscribers`}</code></td><td>List with optional filter</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/subscribers/stats`}</code></td><td>Aggregate counts</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/subscribers/pool`}</code></td><td>Live pool snapshot</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/subscribers`}</code></td><td>Create one</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/subscribers/import`}</code></td><td>Bulk import from YAML</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/subscribers`}</code></td><td>Delete every unlocked subscriber</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/subscribers/{id}`}</code></td><td>Get</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/subscribers/{id}`}</code></td><td>Update</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/subscribers/{id}`}</code></td><td>Delete (must be unlocked)</td></tr></tbody>
</table>
<h2 id="get-apiv1subscribers">GET /api/v1/subscribers</h2>
<CodeBlock lang="http" code={`GET /api/v1/subscribers?locked=false&search=imsi-901
Authorization: Bearer <token>`} />
<table>
<thead><tr><th>Query param</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`locked`}</code></td><td>Filter to <code>{`true`}</code> (currently held by an execution) or <code>{`false`}</code> (free)</td></tr>
<tr><td><code>{`search`}</code></td><td>Substring match against SUPI / IMSI</td></tr></tbody>
</table>
<h3 id="response">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "id": 1,
    "supi": "imsi-901-70-0000000001",
    "imsi": "901700000000001",
    "key": "465B5CE8B199B49FAA5F0A2EE238A6BC",
    "opc": "E8ED289DEBA952E4283B54E88E6183CA",
    "sqn": "000000000000",
    "snn": "5G:mnc070.mcc901.3gppnetwork.org",
    "ciphering": "NEA0",
    "integrity": "NIA2",
    "locked_by": "",
    "locked_at": null,
    "created_at": "...",
    "updated_at": "..."
  }
]`} />
<p><code>{`locked_by`}</code> is the execution ID that's currently holding this subscriber, or empty.</p>
<h2 id="get-apiv1subscribersstats">GET /api/v1/subscribers/stats</h2>
<p>Aggregate counts.</p>
<CodeBlock lang="http" code={`GET /api/v1/subscribers/stats
Authorization: Bearer <token>`} />
<h3 id="response-2">Response</h3>
<CodeBlock lang="json" code={`{
  "total": 100,
  "locked": 12,
  "free": 88,
  "waiting": 3
}`} />
<p><code>{`waiting`}</code> is the in-process FIFO queue depth — acquirers blocked because the pool is empty. Only meaningful inside the daemon process that owns the pool.</p>
<h2 id="get-apiv1subscriberspool">GET /api/v1/subscribers/pool</h2>
<p>Live pool snapshot including waiting context IDs.</p>
<CodeBlock lang="http" code={`GET /api/v1/subscribers/pool
Authorization: Bearer <token>`} />
<h3 id="response-3">Response</h3>
<CodeBlock lang="json" code={`{
  "total": 100,
  "locked": 12,
  "free": 88,
  "waiting": 3,
  "waiting_context_ids": ["<uuid>", "<uuid>", "<uuid>"]
}`} />
<h2 id="post-apiv1subscribers">POST /api/v1/subscribers</h2>
<p>Create one.</p>
<CodeBlock lang="http" code={`POST /api/v1/subscribers
Authorization: Bearer <token>
Content-Type: application/json

{
  "supi": "imsi-901-70-0000000001",
  "key": "465B5CE8B199B49FAA5F0A2EE238A6BC",
  "opc": "E8ED289DEBA952E4283B54E88E6183CA",
  "sqn": "000000000000",
  "snn": "5G:mnc070.mcc901.3gppnetwork.org",
  "ciphering": "NEA0",
  "integrity": "NIA2"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`supi`}</code></td><td>string</td><td>yes</td><td>Format <code>{`imsi-MCC-MNC-MSIN`}</code>, unique</td></tr>
<tr><td><code>{`key`}</code></td><td>string</td><td>yes</td><td>32 hex chars</td></tr>
<tr><td><code>{`opc`}</code></td><td>string</td><td>yes</td><td>32 hex chars</td></tr>
<tr><td><code>{`sqn`}</code></td><td>string</td><td>no</td><td>12 hex chars</td></tr>
<tr><td><code>{`snn`}</code></td><td>string</td><td>yes</td><td>Serving network name</td></tr>
<tr><td><code>{`ciphering`}</code></td><td>string</td><td>no</td><td><code>{`NEA0`}</code> / <code>{`NEA1`}</code> / <code>{`NEA2`}</code> / <code>{`NEA3`}</code></td></tr>
<tr><td><code>{`integrity`}</code></td><td>string</td><td>no</td><td><code>{`NIA0`}</code> / <code>{`NIA1`}</code> / <code>{`NIA2`}</code> / <code>{`NIA3`}</code></td></tr></tbody>
</table>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Invalid SUPI format, key/opc not hex, etc.</td></tr>
<tr><td>409</td><td>SUPI already exists</td></tr></tbody>
</table>
<h2 id="post-apiv1subscribersimport">POST /api/v1/subscribers/import</h2>
<p>Bulk import from a YAML body — same schema as the CLI's <code>{`-s &lt;file&gt;`}</code>.</p>
<CodeBlock lang="http" code={`POST /api/v1/subscribers/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "yaml": "config:\\n  mcc: \\"901\\"\\n  mnc: \\"070\\"\\nsubscribers:\\n  - supi: imsi-901-70-0000000001\\n    key: ...\\n"
}`} />
<h3 id="response-4">Response</h3>
<CodeBlock lang="json" code={`{
  "created": 50,
  "updated": 5
}`} />
<p>Existing entries with the same SUPI are updated in place; new ones are inserted.</p>
<h2 id="delete-apiv1subscribers">DELETE /api/v1/subscribers</h2>
<p>Delete every unlocked subscriber. Locked rows are preserved so in-flight executions don't break.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/subscribers
Authorization: Bearer <token>`} />
<h3 id="response-5">Response</h3>
<CodeBlock lang="json" code={`{ "deleted": 88, "skipped_locked": 12 }`} />
<h2 id="get-apiv1subscribers123id125">GET /api/v1/subscribers/&#123;id&#125;</h2>
<CodeBlock lang="http" code={`GET /api/v1/subscribers/1
Authorization: Bearer <token>`} />
<p>The <code>{`{id}`}</code> is the numeric primary key, not the SUPI. Use the list view's <code>{`search`}</code> to find one by SUPI first.</p>
<h2 id="put-apiv1subscribers123id125">PUT /api/v1/subscribers/&#123;id&#125;</h2>
<p>Update. Same body shape as POST.</p>
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Not found</td></tr>
<tr><td>409</td><td>Subscriber is locked (release it before updating)</td></tr></tbody>
</table>
<h2 id="delete-apiv1subscribers123id125">DELETE /api/v1/subscribers/&#123;id&#125;</h2>
<p>Delete one. Must be unlocked.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/subscribers/1
Authorization: Bearer <token>`} />
<p>Returns <code>{`204 No Content`}</code>.</p>
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Not found</td></tr>
<tr><td>409</td><td>Subscriber is locked</td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li>The CLI's <code>{`subscriber generate`}</code> / <code>{`subscriber provision`}</code> commands operate locally (generate → YAML file) and against Open5GS (provision → WebUI), not against this API. Use <code>{`/subscribers/import`}</code> for the equivalent of provisioning into the daemon's own pool.</li>
<li>The pool's "locked" state survives daemon restarts — but the daemon also auto-releases stale locks on startup, so a hard kill won't leave orphans.</li>
<li>For load testing without populating a pool at all, use the CLI's <code>{`-gen-subscriber`}</code> flag (synthesizes per-UE in memory). There's no daemon equivalent in v1; use <code>{`/execute`}</code> with a flow that doesn't validate auth.</li>
</ul>
    </DocPage>
  );
}
