import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiUsers() {
  return (
    <DocPage slug="api/users" lede="User management. Every endpoint here requires role: admin.">
<p>The daemon seeds a single admin user on first start (<code>{`admin`}</code> / <code>{`admin`}</code>); see the <Link to="/api/overview">API overview</Link> for the first-login flow. After that, admins create additional users via <code>{`POST /api/v1/users`}</code>.</p>
<h2 id="endpoints">Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody><tr><td>GET</td><td><code>{`/api/v1/users`}</code></td><td>List</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/users`}</code></td><td>Create</td></tr>
<tr><td>GET</td><td><code>{`/api/v1/users/{id}`}</code></td><td>Get</td></tr>
<tr><td>PUT</td><td><code>{`/api/v1/users/{id}`}</code></td><td>Update</td></tr>
<tr><td>DELETE</td><td><code>{`/api/v1/users/{id}`}</code></td><td>Soft-delete</td></tr>
<tr><td>POST</td><td><code>{`/api/v1/users/{id}/reset-password`}</code></td><td>Reset password</td></tr></tbody>
</table>
<h2 id="get-apiv1users" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/users`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/users
Authorization: Bearer <token>`} />
<p>Returns an array of <code>{`UserEntity`}</code>. Includes both active and inactive users.</p>
<h2 id="post-apiv1users" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/users`}</code></h2>
<p>Create a new user. Pass an initial password; the new user can sign in with it and change it through <code>{`POST /api/v1/auth/change-password`}</code>.</p>
<CodeBlock lang="http" code={`POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "alice",
  "password": "<initial-password>",
  "display_name": "Alice",
  "role": "user"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`username`}</code></td><td>string</td><td>yes</td><td>3-32 chars, <code>{`[a-zA-Z0-9_]`}</code>, unique</td></tr>
<tr><td><code>{`password`}</code></td><td>string</td><td>yes</td><td>4+ chars, the user's initial password</td></tr>
<tr><td><code>{`display_name`}</code></td><td>string</td><td>no</td><td>Free-text</td></tr>
<tr><td><code>{`role`}</code></td><td>string</td><td>yes</td><td><code>{`admin`}</code> or <code>{`user`}</code></td></tr></tbody>
</table>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Missing fields, role not <code>{`admin`}</code> or <code>{`user`}</code>, validation failure</td></tr>
<tr><td>409</td><td>Username already exists</td></tr></tbody>
</table>
<h2 id="get-apiv1users123id125" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/users/&#123;id&#125;`}</code></h2>
<CodeBlock lang="http" code={`GET /api/v1/users/<uuid>
Authorization: Bearer <token>`} />
<h2 id="put-apiv1users123id125" className="flex items-center gap-2"><HttpMethod method="PUT" /><code>{`/api/v1/users/&#123;id&#125;`}</code></h2>
<p>Update display name, role, or active flag. Each field is optional — only provided fields are updated.</p>
<CodeBlock lang="http" code={`PUT /api/v1/users/<uuid>
Authorization: Bearer <token>
Content-Type: application/json

{
  "display_name": "Alice Anderson",
  "role": "admin",
  "active": false
}`} />
<h3 id="guard-rails">Guard rails</h3>
<ul>
<li>Cannot change your own role (the caller's own ID is rejected for <code>{`role`}</code> changes).</li>
<li>Cannot demote or disable the <strong>last active admin</strong> — the daemon counts active admins and refuses if doing this would drop it to zero.</li>
</ul>
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Trying to change own role</td></tr>
<tr><td>404</td><td>User not found</td></tr>
<tr><td>409</td><td>Last-admin guard tripped</td></tr></tbody>
</table>
<h2 id="delete-apiv1users123id125" className="flex items-center gap-2"><HttpMethod method="DELETE" /><code>{`/api/v1/users/&#123;id&#125;`}</code></h2>
<p>Soft-delete: sets <code>{`active: false`}</code>. Username and ID are preserved so historical reports still resolve who triggered them.</p>
<CodeBlock lang="http" code={`DELETE /api/v1/users/<uuid>
Authorization: Bearer <token>`} />
<h3 id="guard-rails-2">Guard rails</h3>
<ul>
<li>Cannot delete yourself.</li>
<li>Cannot disable the last active admin.</li>
</ul>
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Deleting yourself</td></tr>
<tr><td>404</td><td>User not found</td></tr>
<tr><td>409</td><td>Last-admin guard tripped</td></tr></tbody>
</table>
<p>Returns <code>{`204 No Content`}</code> on success.</p>
<h2 id="post-apiv1users123id125reset-password" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/users/&#123;id&#125;/reset-password`}</code></h2>
<p>Set a new password on a target user. The new password takes effect immediately; the target signs in with it from then on.</p>
<CodeBlock lang="http" code={`POST /api/v1/users/<uuid>/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_password": "<temporary-password>"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`new_password`}</code></td><td>string</td><td>yes</td><td>4+ chars</td></tr></tbody>
</table>
<p>Returns <code>{`200 OK`}</code> with <code>{`{ &quot;message&quot;: &quot;password reset successfully&quot; }`}</code>.</p>
<h2 id="notes">Notes</h2>
<ul>
<li>The <code>{`password_hash`}</code> field is bcrypt with default cost. The hash is never returned in any response.</li>
<li>All timestamps are RFC 3339 UTC.</li>
<li><code>{`created_by`}</code> is the username of the admin who created the user; <code>{`system`}</code> for the seeded admin.</li>
</ul>
    </DocPage>
  );
}
