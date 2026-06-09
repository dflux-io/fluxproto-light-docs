import { Link } from 'react-router-dom';
import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';

export default function ApiFlows() {
  return (
    <DocPage slug="api/flows" lede="Catalog operations for flows. The list view merges built-in flows (compiled into the binary) with custom flows (stored in the database). Built-in flows are read-only through the API; custom flows support full create, read, update, and delete.">
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/flows`}</code></td><td>List built-in + custom</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/flows/{id}`}</code></td><td>Get with YAML and Mermaid</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/flows`}</code></td><td>Create custom flow</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/flows/{id}`}</code></td><td>Update custom flow</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/flows/{id}`}</code></td><td>Delete custom flow</td></tr></tbody>
</table>
<h2 id="get-apiv1flows" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/flows`}</code></h2>
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
    "source": "builtin",
    "path": "",
    "workspace_id": "<uuid>",
    "protocols_used": ["ngap"],
    "nfs_used": ["gnb"]
  },
  {
    "id": "<uuid>",
    "name": "my_custom_flow",
    "description": "...",
    "category": "functional",
    "type": "client",
    "protocol": "sbi",
    "nf": "amf",
    "source": "user",
    "path": "sbi/registration",
    "workspace_id": "<uuid>",
    "protocols_used": ["sbi"],
    "nfs_used": ["amf"]
  }
]`} />
<table>
<thead><tr><th>Field</th><th>Notes</th></tr></thead>
<tbody><tr><td><code>{`id`}</code></td><td>Flow name for built-ins; UUID for custom</td></tr>
<tr><td><code>{`source`}</code></td><td><code>{`builtin`}</code> (compiled in), <code>{`template`}</code> (loaded from a templates directory), or <code>{`user`}</code> (created through the API)</td></tr>
<tr><td><code>{`category`}</code>, <code>{`type`}</code>, <code>{`protocol`}</code>, <code>{`nf`}</code></td><td>The flow's primary facets. Populated for both built-in and custom flows — for custom flows they are read from the submitted YAML.</td></tr>
<tr><td><code>{`protocols_used`}</code>, <code>{`nfs_used`}</code></td><td>Every distinct protocol and NF role the flow touches, including per-action overrides. Always at least the primary value.</td></tr>
<tr><td><code>{`path`}</code></td><td>Folder the flow lives in (<code>{`""`}</code> = root). Built-ins always sit at the root.</td></tr>
<tr><td><code>{`workspace_id`}</code></td><td>Workspace owning the flow. Built-ins are reported under the default workspace.</td></tr></tbody>
</table>
<p>The list is alphabetical by name.</p>
<h2 id="get-apiv1flows123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/flows/&#123;id&#125;`}</code></h2>
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
  "path": "",
  "workspace_id": "<uuid>",
  "protocols_used": ["ngap"],
  "nfs_used": ["gnb"],
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
<h2 id="post-apiv1flows" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/flows`}</code></h2>
<p>Create a custom flow. The <code>{`definition`}</code> is validated through the same parser the CLI uses — bad YAML is rejected at the API. Create, update, and delete apply to custom flows only; built-in names are reserved (see the errors below).</p>
<CodeBlock lang="http" code={`POST /api/v1/flows
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "my_flow",
  "description": "optional summary",
  "definition": "kind: flow\\nname: my_flow\\n...",
  "path": "sbi/registration",
  "workspace_id": "<uuid>"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>Flow name. Must not collide with a built-in.</td></tr>
<tr><td><code>{`definition`}</code></td><td>string</td><td>yes</td><td>The raw flow YAML.</td></tr>
<tr><td><code>{`description`}</code></td><td>string</td><td>no</td><td>Short summary shown in the catalog.</td></tr>
<tr><td><code>{`path`}</code></td><td>string</td><td>no</td><td>Folder to file the flow under (<code>{`""`}</code> = root).</td></tr>
<tr><td><code>{`workspace_id`}</code></td><td>string</td><td>no</td><td>Workspace to own the flow. Falls back to the default workspace when omitted.</td></tr></tbody>
</table>
<h3 id="response-3">Response</h3>
<p>Returns the full stored flow record.</p>
<CodeBlock lang="http" code={`201 Created
Content-Type: application/json

{
  "id": "<uuid>",
  "name": "my_flow",
  "description": "optional summary",
  "definition": "kind: flow\\nname: my_flow\\n...",
  "path": "sbi/registration",
  "source": "user",
  "workspace_id": "<uuid>",
  "created_at": "2026-06-09T12:00:00Z",
  "updated_at": "2026-06-09T12:00:00Z"
}`} />
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>YAML parse error or schema validation failure (error message names the offending state/transition/action)</td></tr>
<tr><td>409</td><td>A flow with this name already exists (built-in or custom)</td></tr></tbody>
</table>
<h2 id="put-apiv1flows123id125" className="flex items-center gap-2"><HttpMethod method="PUT" /><code>{`/api/v1/flows/&#123;id&#125;`}</code></h2>
<p>Update a custom flow. Built-in flows cannot be updated — <code>{`403 Forbidden`}</code>. Send only the fields you want to change; non-empty fields are applied onto the existing record. A new <code>{`definition`}</code> is re-validated as FSM YAML before it is saved.</p>
<CodeBlock lang="http" code={`PUT /api/v1/flows/<uuid>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "my_flow",
  "description": "updated summary",
  "definition": "kind: flow\\nname: my_flow\\n...",
  "path": "sbi/registration"
}`} />
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>YAML parse / validation failure</td></tr>
<tr><td>403</td><td>Trying to update a built-in flow</td></tr>
<tr><td>404</td><td>Flow not found</td></tr></tbody>
</table>
<h2 id="delete-apiv1flows123id125" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/flows/&#123;id&#125;`}</code></h2>
<p>Delete a custom flow. Built-in flows cannot be deleted — <code>{`403`}</code>.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/flows/<uuid>
Authorization: Bearer <token>`} />
<p>Returns <code>{`204 No Content`}</code> on success.</p>
<h3 id="errors-4">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>403</td><td>Trying to delete a built-in flow</td></tr>
<tr><td>404</td><td>Flow not found</td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li>The merged list combines the built-in flows compiled into the binary with the custom flows persisted in the database. The CLI shows the same view; pointing <code>{`flow list -templates <dir>`}</code> at a templates directory loads those YAML files into the database as custom flows, which then appear here too.</li>
<li>The Mermaid sequence diagram is generated from the flow at request time, not stored. Editing the YAML changes the next response.</li>
<li>Mass-loading flows from a templates directory is a CLI-only operation today — there is no <code>{`POST /flows/import`}</code> for a directory walk.</li>
</ul>
<h2 id="next">Where to go next</h2>
<ul>
<li>Browse every shipped flow in the <Link to="/reference/catalogs">flow and suite catalog</Link>.</li>
<li>Read real flow YAML to submit through <code>{`POST`}</code> in the <a href="https://github.com/dflux-io/fluxproto-light-templates">templates repository</a>.</li>
<li>See the field-by-field definition in the <Link to="/reference/flow-schema">flow schema reference</Link>.</li>
</ul>
    </DocPage>
  );
}
