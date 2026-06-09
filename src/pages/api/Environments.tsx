import { Link } from 'react-router-dom';
import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function ApiEnvironments() {
  return (
    <DocPage slug="api/environments" lede="CRUD for stored environments. An environment carries the same shape the CLI loads from -c <file>, expressed as a JSON config object. The daemon stores each one as a row so /execute and /schedules can reference it by ID.">
<p>The config object follows the <Link to="/reference/config-schema">environment schema</Link>. On the wire it is JSON, not a YAML string — the daemon stores it in a <code>{`jsonb`}</code> column and re-validates it on every write.</p>
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/environments`}</code></td><td>List every environment, config included</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/environments`}</code></td><td>Create one</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/environments/{id}`}</code></td><td>Fetch one by ID</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/environments/{id}`}</code></td><td>Update one (partial)</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/environments/{id}`}</code></td><td>Delete one</td></tr></tbody>
</table>
<h2 id="get-apiv1environments" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/environments`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/environments
Authorization: Bearer <token>`} />
<h3 id="response">Response</h3>
<p>Each row carries the stored record plus a derived <code>{`summary`}</code> object. The list is not metadata-only — the full <code>{`config`}</code> is returned for every environment.</p>
<CodeBlock lang="json" code={`[
  {
    "id": "<uuid>",
    "name": "lab",
    "config": {
      "nfs": [{ "name": "GNBENF", "role": "gnb", "transport": "ngap" }],
      "transports": { "ngap": { "protocol": "ngap" } }
    },
    "workspace_id": "<uuid>",
    "created_at": "...",
    "updated_at": "...",
    "summary": {
      "nfs": [{ "role": "gnb", "protocol": "ngap", "name": "GNBENF" }],
      "protocols": ["ngap"],
      "has_rest": false
    }
  }
]`} />
<p>The <code>{`summary`}</code> is a structured digest derived from <code>{`config`}</code>: a flattened list of <code>{`(role, protocol)`}</code> pairs, the distinct protocols declared, and a <code>{`has_rest`}</code> shortcut. Clients use it to check whether a flow can run on the environment without re-parsing the config.</p>
<h2 id="post-apiv1environments" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/environments`}</code></h2>
<p>Create an environment. When <code>{`config`}</code> is present it is validated through the same parser the CLI runs use.</p>
<CodeBlock lang="http" code={`POST /api/v1/environments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "lab",
  "config": {
    "nfs": [{ "name": "GNBENF", "role": "gnb", "transport": "ngap" }],
    "transports": { "ngap": { "protocol": "ngap", "addr": "127.0.0.1:38412" } }
  }
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>Label for the environment, unique across the daemon</td></tr>
<tr><td><code>{`config`}</code></td><td>object</td><td>no</td><td>The environment config. Omit it to create a name-only row and fill it in later with PUT.</td></tr>
<tr><td><code>{`workspace_id`}</code></td><td>string</td><td>no</td><td>Scopes the environment to a workspace. Falls back to the default workspace.</td></tr>
</tbody>
</table>
<h3 id="response-2">Response</h3>
<p>Create returns the stored entity with status <code>{`201`}</code>. Unlike GET and the list endpoint, the create response does not include the <code>{`summary`}</code> object — re-fetch the environment if you need it.</p>
<CodeBlock lang="http" code={`201 Created
Content-Type: application/json

{
  "id": "<uuid>",
  "name": "lab",
  "config": { "nfs": [ ... ], "transports": { ... } },
  "workspace_id": "<uuid>",
  "created_at": "...",
  "updated_at": "..."
}`} />
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Missing <code>{`name`}</code>, or <code>{`config`}</code> fails to parse or validate. The missing-name case names the field; a config failure returns a wrapped parser or validation message.</td></tr></tbody>
</table>
<Callout type="note">Environment names are unique at the storage layer, but the daemon does not translate a duplicate-name collision into a clean <code>{`409`}</code>. A duplicate insert surfaces as a <code>{`500`}</code>. Check for an existing name before you create.</Callout>
<h2 id="get-apiv1environments123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/environments/&#123;id&#125;`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/environments/<uuid>
Authorization: Bearer <token>`} />
<p>Returns the full record, including <code>{`config`}</code> and the derived <code>{`summary`}</code>. Responds <code>{`404`}</code> if the ID is unknown.</p>
<h2 id="put-apiv1environments123id125" className="flex items-center gap-2"><HttpMethod method="PUT" /><code>{`/api/v1/environments/&#123;id&#125;`}</code></h2>
<p>Update an environment. This is a partial update: <code>{`name`}</code> and <code>{`config`}</code> are each applied only when present, so you can rename without resending the config or replace the config without resending the name. A supplied <code>{`config`}</code> is re-validated.</p>
<CodeBlock lang="http" code={`PUT /api/v1/environments/<uuid>
Authorization: Bearer <token>
Content-Type: application/json

{
  "config": {
    "nfs": [ ... ],
    "transports": { ... }
  }
}`} />
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Supplied <code>{`config`}</code> fails to parse or validate</td></tr>
<tr><td>404</td><td>Environment not found</td></tr></tbody>
</table>
<Callout type="note">As with create, renaming to a name that already exists is not caught as a <code>{`409`}</code>; the collision surfaces as a <code>{`500`}</code>.</Callout>
<h2 id="delete-apiv1environments123id125" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/environments/&#123;id&#125;`}</code></h2>
<CodeBlock lang="http" code={`DELETE /api/v1/environments/<uuid>
Authorization: Bearer <token>`} />
<p>Deletes the environment and responds <code>{`204 No Content`}</code>. If any <Link to="/api/schedules">schedule</Link> references the environment, the delete is refused with <code>{`409`}</code> unless you pass <code>{`?force=true`}</code>.</p>
<h3 id="dependent-schedules">Dependent schedules</h3>
<p>The check scans every schedule that points at the environment, whether enabled or not. When one or more match and <code>{`force`}</code> is not set, the daemon returns <code>{`409`}</code> with the offending schedules listed so you can confirm before cascading:</p>
<CodeBlock lang="json" code={`{
  "error": "environment has dependent schedules",
  "dependent_schedules": [
    {
      "id": "<uuid>",
      "name": "nightly-smoke",
      "type": "flow",
      "cron_expr": "0 2 * * *",
      "enabled": true
    }
  ]
}`} />
<p>Re-issue the request with <code>{`?force=true`}</code> to cancel and delete those schedules, then remove the environment in the same call:</p>
<CodeBlock lang="http" code={`DELETE /api/v1/environments/<uuid>?force=true
Authorization: Bearer <token>`} />
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Environment not found</td></tr>
<tr><td>409</td><td>Schedules reference the environment and <code>{`force`}</code> was not set</td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li>The <code>{`config`}</code> object is the source of truth. The daemon does not split it into derived columns on write — every create and update re-validates the whole object.</li>
<li>Environments do not reference flows. A flow binds to an environment at execution time, through <Link to="/api/executions">/execute</Link>.</li>
<li>To post a config you keep on disk as YAML, convert it to JSON and nest it under <code>{`config`}</code>. For example:</li>
</ul>
<CodeBlock lang="bash" code={`curl -sS -X POST http://localhost:8199/api/v1/environments \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d "$(yq -o=json '{"name":"lab","config":.}' config/lab.yaml)"`} />
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/reference/config-schema">Environment schema</Link> — every field the <code>{`config`}</code> object accepts.</li>
<li><Link to="/concepts/environments">Environments</Link> — what an environment models and how flows bind to it.</li>
<li><Link to="/api/schedules">Schedules</Link> — the records that reference an environment by ID.</li>
</ul>
    </DocPage>
  );
}
