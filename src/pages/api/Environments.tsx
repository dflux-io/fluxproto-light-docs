import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';

export default function ApiEnvironments() {
  return (
    <DocPage slug="api/environments" lede="CRUD for stored environment configs. An environment is the same YAML shape the CLI loads from -c <file> — see config schema. The daemon stores them as DB rows so /execute and /schedules can reference them by ID.">
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/environments`}</code></td><td>List</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/environments`}</code></td><td>Create</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/environments/{id}`}</code></td><td>Get</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/environments/{id}`}</code></td><td>Update</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/environments/{id}`}</code></td><td>Delete</td></tr></tbody>
</table>
<h2 id="get-apiv1environments" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/environments`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/environments
Authorization: Bearer <token>`} />
<h3 id="response">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "id": "<uuid>",
    "name": "lab",
    "description": "Single-gNB lab",
    "created_at": "...",
    "updated_at": "..."
  }
]`} />
<p>The list view returns metadata only — call <code>{`/api/v1/environments/{id}`}</code> for the full YAML body.</p>
<h2 id="post-apiv1environments" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/environments`}</code></h2>
<p>Create from YAML. Validated through the same parser CLI runs use.</p>
<CodeBlock lang="http" code={`POST /api/v1/environments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "lab",
  "description": "Single-gNB lab pointed at Open5GS",
  "yaml": "nfs:\\n  - name: GNBENF\\n    role: gnb\\n    ..."
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>Human-readable label, unique</td></tr>
<tr><td><code>{`description`}</code></td><td>string</td><td>no</td><td>Free-text</td></tr>
<tr><td><code>{`yaml`}</code></td><td>string</td><td>yes</td><td>The env YAML</td></tr></tbody>
</table>
<h3 id="response-2">Response</h3>
<CodeBlock lang="http" code={`201 Created
Content-Type: application/json

{
  "id": "<uuid>",
  "name": "lab",
  "description": "...",
  "yaml": "nfs:\\n  ...",
  "created_at": "...",
  "updated_at": "..."
}`} />
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>YAML parse / validation failure (error names the offending field)</td></tr>
<tr><td>409</td><td>Name already exists</td></tr></tbody>
</table>
<h2 id="get-apiv1environments123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/environments/&#123;id&#125;`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/environments/<uuid>
Authorization: Bearer <token>`} />
<p>Returns the full record including the YAML body.</p>
<h2 id="put-apiv1environments123id125" className="flex items-center gap-2"><HttpMethod method="PUT" /><code>{`/api/v1/environments/&#123;id&#125;`}</code></h2>
<p>Update. Same body shape as <code>{`POST`}</code>. Re-validates the YAML.</p>
<CodeBlock lang="http" code={`PUT /api/v1/environments/<uuid>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "lab",
  "description": "Updated",
  "yaml": "..."
}`} />
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>YAML parse / validation failure</td></tr>
<tr><td>404</td><td>Env not found</td></tr>
<tr><td>409</td><td>Renaming to an existing name</td></tr></tbody>
</table>
<h2 id="delete-apiv1environments123id125" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/environments/&#123;id&#125;`}</code></h2>
<CodeBlock lang="http" code={`DELETE /api/v1/environments/<uuid>
Authorization: Bearer <token>`} />
<p>Returns <code>{`204 No Content`}</code>.</p>
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Env not found</td></tr>
<tr><td>409</td><td>Env is referenced by an active schedule (delete the schedule first)</td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li>The YAML field is the source of truth. The daemon does not parse it on write into derived columns — every request re-validates.</li>
<li>Envs do not reference flows. Flow ↔ env binding happens at execution time.</li>
<li>For programmatic uploads, the cleanest pattern is <code>{`yaml: $(cat config/lab.yaml)`}</code> shell-substitution wrapped in JSON encoding.</li>
</ul>
    </DocPage>
  );
}
