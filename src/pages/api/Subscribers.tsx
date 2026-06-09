import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';
import { Link } from 'react-router-dom';

export default function ApiSubscribers() {
  return (
    <DocPage slug="api/subscribers" lede="CRUD for subscribers + pool stats. Subscribers are UE identities (SUPI + K + OPC + SQN + algorithms) the engine assigns to UEs at flow-start. The pool serialises one-execution-per-subscriber for the lifetime of each UE.">
<p>For the conceptual model, see <Link to="/concepts/subscribers">Subscribers</Link>. For day-to-day workflows, see <Link to="/guides/subscribers">Managing subscribers</Link>.</p>
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
<h2 id="get-apiv1subscribers" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/subscribers`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/subscribers?locked=false&search=imsi-901
Authorization: Bearer <token>`} />
<table>
<thead><tr><th>Query param</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`locked`}</code></td><td>Filter to <code>{`true`}</code> (currently held by an execution) or <code>{`false`}</code> (free)</td></tr>
<tr><td><code>{`search`}</code></td><td>Prefix match against SUPI (anchored at the start; IMSI is not matched)</td></tr></tbody>
</table>
<h3 id="response">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "id": 1,
    "namespace": "default",
    "snn": "5G:mnc070.mcc901.3gppnetwork.org",
    "supi": "imsi-901-70-0000000001",
    "suci": null,
    "mcc": "901",
    "mnc": "70",
    "msin": "0000000001",
    "imsi": "901700000000001",
    "imsisv": null,
    "ki": "465B5CE8B199B49FAA5F0A2EE238A6BC",
    "opc": "E8ED289DEBA952E4283B54E88E6183CA",
    "rand": null,
    "sqn": "000000000000",
    "op": null,
    "calg": "0",
    "ialg": "2",
    "locked_by": null,
    "locked_at": null,
    "locked_by_execution_id": null,
    "created_at": "...",
    "updated_at": "..."
  }
]`} />
<p>The JSON entity uses <code>{`ki`}</code> for the subscriber key, <code>{`calg`}</code> for the ciphering algorithm, and <code>{`ialg`}</code> for the integrity algorithm. Algorithm values are returned as the numeric index (<code>{`"0"`}</code>–<code>{`"3"`}</code>), not the <code>{`NEA*`}</code>/<code>{`NIA*`}</code> name.</p>
<p><code>{`locked_by`}</code> holds the identity of whatever is currently holding this subscriber, or <code>{`null`}</code> when free. <code>{`locked_by_execution_id`}</code> scopes a bulk release to a single execution.</p>
<h2 id="get-apiv1subscribersstats" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/subscribers/stats`}</code></h2>
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
<h2 id="get-apiv1subscriberspool" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/subscribers/pool`}</code></h2>
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
<h2 id="post-apiv1subscribers" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/subscribers`}</code></h2>
<p>Create one.</p>
<CodeBlock lang="http" code={`POST /api/v1/subscribers
Authorization: Bearer <token>
Content-Type: application/json

{
  "supi": "imsi-901-70-0000000001",
  "snn": "5G:mnc070.mcc901.3gppnetwork.org",
  "ki": "465B5CE8B199B49FAA5F0A2EE238A6BC",
  "opc": "E8ED289DEBA952E4283B54E88E6183CA",
  "sqn": "000000000000",
  "calg": "0",
  "ialg": "2"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`supi`}</code></td><td>string</td><td>yes</td><td>Format <code>{`imsi-MCC-MNC-MSIN`}</code>, unique</td></tr>
<tr><td><code>{`ki`}</code></td><td>string</td><td>yes</td><td>Subscriber key, 32 hex chars</td></tr>
<tr><td><code>{`opc`}</code></td><td>string</td><td>yes</td><td>32 hex chars</td></tr>
<tr><td><code>{`sqn`}</code></td><td>string</td><td>no</td><td>12 hex chars</td></tr>
<tr><td><code>{`snn`}</code></td><td>string</td><td>yes</td><td>Serving network name</td></tr>
<tr><td><code>{`calg`}</code></td><td>string</td><td>no</td><td>Ciphering algorithm index <code>{`"0"`}</code>–<code>{`"3"`}</code></td></tr>
<tr><td><code>{`ialg`}</code></td><td>string</td><td>no</td><td>Integrity algorithm index <code>{`"0"`}</code>–<code>{`"3"`}</code></td></tr></tbody>
</table>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Invalid SUPI format, key/opc not hex, etc.</td></tr>
<tr><td>409</td><td>SUPI already exists</td></tr></tbody>
</table>
<h2 id="post-apiv1subscribersimport" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/subscribers/import`}</code></h2>
<p>Bulk import from a YAML body — same schema as the CLI's <code>{`-s &lt;file&gt;`}</code>. The request body is raw YAML, not a JSON wrapper.</p>
<CodeBlock lang="http" code={`POST /api/v1/subscribers/import
Authorization: Bearer <token>
Content-Type: application/x-yaml

config:
  mcc: "901"
  mnc: "070"
  snn: "5G:mnc070.mcc901.3gppnetwork.org"
subscribers:
  - supi: imsi-901-70-0000000001
    key: 465B5CE8B199B49FAA5F0A2EE238A6BC
    opc: E8ED289DEBA952E4283B54E88E6183CA
    sqn: "000000000000"
    ciphering: NEA0
    integrity: NIA2`} />
<Callout type="warning">The import YAML uses the keys <code>{`key`}</code>, <code>{`ciphering`}</code>, and <code>{`integrity`}</code> with <code>{`NEA*`}</code>/<code>{`NIA*`}</code> names. The JSON entity surface (GET, POST, PUT above) uses <code>{`ki`}</code>, <code>{`calg`}</code>, and <code>{`ialg`}</code> with numeric algorithm indices. The two surfaces do not share field names.</Callout>
<h3 id="response-4">Response</h3>
<CodeBlock lang="json" code={`{
  "created": 50,
  "updated": 5,
  "total": 55
}`} />
<p>Existing entries with the same SUPI are updated in place; new ones are inserted. <code>{`total`}</code> is <code>{`created`}</code> plus <code>{`updated`}</code>.</p>
<h2 id="delete-apiv1subscribers" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/subscribers`}</code></h2>
<p>Delete every unlocked subscriber. Locked rows are preserved so in-flight executions don't break.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/subscribers
Authorization: Bearer <token>`} />
<h3 id="response-5">Response</h3>
<CodeBlock lang="json" code={`{ "deleted": 88 }`} />
<h2 id="get-apiv1subscribers123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/subscribers/&#123;id&#125;`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/subscribers/1
Authorization: Bearer <token>`} />
<p>The <code>{`{id}`}</code> is the numeric primary key, not the SUPI. Use the list view's <code>{`search`}</code> to find one by SUPI first.</p>
<h2 id="put-apiv1subscribers123id125" className="flex items-center gap-2"><HttpMethod method="PUT" /><code>{`/api/v1/subscribers/&#123;id&#125;`}</code></h2>
<p>Update. Same body shape as POST.</p>
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Not found</td></tr>
<tr><td>409</td><td>Subscriber is locked (release it before updating)</td></tr></tbody>
</table>
<h2 id="delete-apiv1subscribers123id125" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/subscribers/&#123;id&#125;`}</code></h2>
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
<li>For load testing without populating a pool at all, use the CLI's <code>{`-gen-subscriber`}</code> flag. It synthesizes a subscriber per UE in memory and skips the pool and database acquire entirely.</li>
</ul>
    </DocPage>
  );
}
