import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';

export default function ApiFlows() {
  return (
    <DocPage slug="api/flows">
<h1>Flows</h1>
<p>Catalog operations for flows. The list view merges built-in flows (compiled into the binary) with custom flows (stored in the DB). Built-in flows are read-only via the API; custom flows are full CRUD.</p>
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/flows`}</code></td><td>List built-in + custom</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/flows/{id}`}</code></td><td>Get with YAML and Mermaid</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/flows`}</code></td><td>Create custom flow</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/flows/{id}`}</code></td><td>Update custom flow</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/flows/{id}`}</code></td><td>Delete custom flow</td></tr></tbody>
</table>
<h2 id="get-apiv1flows">GET /api/v1/flows</h2>
<p>List every flow the daemon knows about. Merged from the built-in registry and the DB.</p>
<CodeBlock lang="http" code={`GET /api/v1/flows
Authorization: Bearer <token>`} />
<h3 id="response">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "id": "registration",
    "name": "registration",
    "description": "5G UE initial registration with auth and security activation",
    "category": "functional",
    "type": "client",
    "protocol": "ngap",
    "nf": "gnb",
    "source": "builtin"
  },
  {
    "id": "<uuid>",
    "name": "my_custom_flow",
    "description": "...",
    "source": "custom"
  }
]`} />
<table>
<thead><tr><th>Field</th><th>Notes</th></tr></thead>
<tbody><tr><td><code>{`id`}</code></td><td>Flow name for built-ins; UUID for custom</td></tr>
<tr><td><code>{`source`}</code></td><td><code>{`builtin`}</code> or <code>{`custom`}</code></td></tr>
<tr><td><code>{`category`}</code>, <code>{`type`}</code>, <code>{`protocol`}</code>, <code>{`nf`}</code></td><td>Built-in only</td></tr></tbody>
</table>
<p>The list is alphabetical by name.</p>
<h2 id="get-apiv1flows123id125">GET /api/v1/flows/&#123;id&#125;</h2>
<p>Get a flow's full detail including the YAML source and a generated Mermaid sequence diagram.</p>
<CodeBlock lang="http" code={`GET /api/v1/flows/registration
Authorization: Bearer <token>`} />
<h3 id="response-2">Response</h3>
<CodeBlock lang="json" code={`{
  "id": "registration",
  "name": "registration",
  "description": "...",
  "category": "functional",
  "type": "client",
  "protocol": "ngap",
  "nf": "gnb",
  "source": "builtin",
  "detail": "...long-form markdown...",
  "definition": "kind: flow\\nname: registration\\n...",
  "mermaid": "sequenceDiagram\\n  participant gNB\\n  participant AMF\\n  ..."
}`} />
<table>
<thead><tr><th>Field</th><th>Notes</th></tr></thead>
<tbody><tr><td><code>{`definition`}</code></td><td>The flow YAML, ready to round-trip back through <code>{`POST`}</code></td></tr>
<tr><td><code>{`mermaid`}</code></td><td>Sequence diagram source — render in any Mermaid-compatible viewer</td></tr>
<tr><td><code>{`detail`}</code></td><td>Optional long-form description from the flow's <code>{`detail:`}</code> field</td></tr></tbody>
</table>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>404</td><td>Flow not found</td></tr>
<tr><td>400</td><td>Built-in flow has invalid YAML (shouldn't happen)</td></tr></tbody>
</table>
<h2 id="post-apiv1flows">POST /api/v1/flows</h2>
<p>Create a custom flow from YAML. Validated through the same parser CLI runs use — bad YAML is rejected at the API.</p>
<CodeBlock lang="http" code={`POST /api/v1/flows
Authorization: Bearer <token>
Content-Type: application/json

{
  "yaml": "kind: flow\\nname: my_flow\\n..."
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`yaml`}</code></td><td>string</td><td>yes</td><td>The flow YAML</td></tr></tbody>
</table>
<h3 id="response-3">Response</h3>
<CodeBlock lang="http" code={`201 Created
Content-Type: application/json

{
  "id": "<uuid>",
  "name": "my_flow",
  "description": "...",
  "source": "custom"
}`} />
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>YAML parse error or schema validation failure (error message names the offending state/transition/action)</td></tr>
<tr><td>409</td><td>A flow with this name already exists (built-in or custom)</td></tr></tbody>
</table>
<h2 id="put-apiv1flows123id125">PUT /api/v1/flows/&#123;id&#125;</h2>
<p>Update a custom flow. Built-in flows cannot be updated — <code>{`403 Forbidden`}</code>. The flow's name in the YAML must match the existing record's name.</p>
<CodeBlock lang="http" code={`PUT /api/v1/flows/<uuid>
Authorization: Bearer <token>
Content-Type: application/json

{
  "yaml": "kind: flow\\nname: my_flow\\n..."
}`} />
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>YAML parse / validation failure</td></tr>
<tr><td>403</td><td>Trying to update a built-in flow</td></tr>
<tr><td>404</td><td>Flow not found</td></tr></tbody>
</table>
<h2 id="delete-apiv1flows123id125">DELETE /api/v1/flows/&#123;id&#125;</h2>
<p>Delete a custom flow. Built-in flows cannot be deleted — <code>{`403`}</code>.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/flows/<uuid>
Authorization: Bearer <token>`} />
<p>Returns <code>{`204 No Content`}</code> on success.</p>
<h3 id="errors-4">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>403</td><td>Trying to delete a built-in flow</td></tr>
<tr><td>404</td><td>Flow not found</td></tr>
<tr><td>409</td><td>Flow is referenced by an active schedule (delete the schedule first)</td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li>The merged catalog (built-in + custom) is the same view the CLI uses via <code>{`flow list -templates &lt;dir&gt;`}</code> after a sync — the API is just the persistent half.</li>
<li>The Mermaid sequence diagram is generated from the FSM at request time, not stored. Editing the YAML changes the next response.</li>
<li>Mass-loading flows from a templates directory is a CLI-only operation today — there's no <code>{`POST /flows/import`}</code> for a directory walk.</li>
</ul>
    </DocPage>
  );
}
