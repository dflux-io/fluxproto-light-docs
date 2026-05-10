import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiUsers() {
  return (
    <DocPage slug="api/users">
<h1>Users</h1>
<p>User management. Every endpoint here requires <code>{`role: admin`}</code>.</p>
<p>The daemon seeds a single root user on first start (<code>{`root`}</code> / <code>{`toor`}</code>); see <Link to="/api/overview">Authentication</Link> for first-login flow. After that, admins create additional users via <code>{`POST /users`}</code>.</p>
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
<h2 id="get-apiv1users">GET /api/v1/users</h2>
<CodeBlock lang="http" code={`GET /api/v1/users
Authorization: Bearer <token>`} />
<p>Returns an array of <code>{`UserEntity`}</code>. Includes both active and inactive users.</p>
<h2 id="post-apiv1users">POST /api/v1/users</h2>
<p>Create a new user. The new user is created with <code>{`must_change_pass: true`}</code> — they're forced to set their own password on first login.</p>
<CodeBlock lang="http" code={`POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "alice",
  "password": "<initial-password>",
  "display_name": "Alice",
  "role": "viewer"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`username`}</code></td><td>string</td><td>yes</td><td>3-32 chars, <code>{`[a-zA-Z0-9_]`}</code>, unique</td></tr>
<tr><td><code>{`password`}</code></td><td>string</td><td>yes</td><td>8+ chars, initial — user changes on first login</td></tr>
<tr><td><code>{`display_name`}</code></td><td>string</td><td>no</td><td>Free-text</td></tr>
<tr><td><code>{`role`}</code></td><td>string</td><td>yes</td><td><code>{`admin`}</code> or <code>{`viewer`}</code></td></tr></tbody>
</table>
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Missing fields, role not admin/viewer, validation failure</td></tr>
<tr><td>409</td><td>Username already exists</td></tr></tbody>
</table>
<h2 id="get-apiv1users123id125">GET /api/v1/users/&#123;id&#125;</h2>
<CodeBlock lang="http" code={`GET /api/v1/users/<uuid>
Authorization: Bearer <token>`} />
<h2 id="put-apiv1users123id125">PUT /api/v1/users/&#123;id&#125;</h2>
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
<h2 id="delete-apiv1users123id125">DELETE /api/v1/users/&#123;id&#125;</h2>
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
<h2 id="post-apiv1users123id125reset-password">POST /api/v1/users/&#123;id&#125;/reset-password</h2>
<p>Force a password reset on a target user. The target's <code>{`must_change_pass`}</code> is set to true; they're forced to change again on next login.</p>
<CodeBlock lang="http" code={`POST /api/v1/users/<uuid>/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_password": "<temporary-password>"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`new_password`}</code></td><td>string</td><td>yes</td><td>8+ chars</td></tr></tbody>
</table>
<p>Returns <code>{`200 OK`}</code> with <code>{`{ &quot;message&quot;: &quot;password reset successfully&quot; }`}</code>.</p>
<h2 id="notes">Notes</h2>
<ul>
<li>The <code>{`password_hash`}</code> field is bcrypt with default cost. The hash is never returned in any response.</li>
<li>All timestamps are RFC 3339 UTC.</li>
<li><code>{`created_by`}</code> is the username of the admin who created the user; empty for the seeded root.</li>
</ul>
    </DocPage>
  );
}
