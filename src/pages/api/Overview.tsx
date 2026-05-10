import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ApiOverview() {
  return (
    <DocPage slug="api/overview" lede="The fluxproto-light daemon exposes a JSON-over-HTTP REST API at /api/v1/. Every resource has its own page in this section. This page documents the cross-cutting conventions: authentication, errors, CORS.">
<h2 id="base-url">Base URL</h2>
<CodeBlock lang="" code={`http://<host>:<port>/api/v1`} />
<p>The daemon binds <code>{`0.0.0.0:8199`}</code> by default. Override with <code>{`-host`}</code> and <code>{`-port`}</code>. The web UI (<code>{`-web`}</code>) shares the same port and proxies API calls to itself.</p>
<h2 id="authentication">Authentication</h2>
<p>Every endpoint except <code>{`/health`}</code> and <code>{`/api/v1/auth/login`}</code> requires a JWT bearer token.</p>
<CodeBlock lang="http" code={`Authorization: Bearer <token>`} />
<p>Tokens are issued by <code>{`POST /api/v1/auth/login`}</code> (see <Link to="/api/overview">Authentication</Link>). They are HS256-signed with a secret generated once per daemon start and held in memory only — restarting the daemon invalidates every outstanding token.</p>
<p>Tokens expire 24 hours after issuance. Claims:</p>
<CodeBlock lang="json" code={`{
  "user_id": "<uuid>",
  "username": "<string>",
  "role": "admin" | "viewer",
  "exp": <unix>,
  "iat": <unix>
}`} />
<h3 id="first-login">First login</h3>
<p>The daemon seeds a single admin user on first start: <code>{`root`}</code> / <code>{`toor`}</code>. The first thing the daemon makes you do is change that password — every authenticated endpoint except <code>{`/auth/me`}</code> and <code>{`/auth/change-password`}</code> returns HTTP 423 Locked until you do.</p>
<h3 id="roles">Roles</h3>
<p>Two roles ship today:</p>
<ul>
<li><code>{`admin`}</code> — full access, including <code>{`/users`}</code> and the write side of <code>{`/settings`}</code></li>
<li><code>{`viewer`}</code> — read access plus the ability to trigger executions and edit subscribers/environments/flows; no user management, no settings writes</li>
</ul>
<p>Endpoints flagged "admin" in this section's pages require <code>{`role: admin`}</code>.</p>
<h2 id="resource-pages">Resource pages</h2>
<table>
<thead><tr><th>Page</th><th>Resource</th></tr></thead>
<tbody><tr><td><Link to="/api/overview">Authentication</Link></td><td><code>{`/auth/login`}</code>, <code>{`/auth/me`}</code>, <code>{`/auth/change-password`}</code></td></tr>
<tr><td><Link to="/api/users">Users</Link></td><td><code>{`/users`}</code> (admin-only CRUD + reset-password)</td></tr>
<tr><td><Link to="/api/flows">Flows</Link></td><td><code>{`/flows`}</code> — built-in + custom</td></tr>
<tr><td><Link to="/api/environments">Environments</Link></td><td><code>{`/environments`}</code></td></tr>
<tr><td><Link to="/api/executions">Executions</Link></td><td><code>{`/execute`}</code>, <code>{`/executions`}</code>, queue, cancel</td></tr>
<tr><td><Link to="/api/executions">Reports</Link></td><td><code>{`/reports`}</code> list and detail</td></tr>
<tr><td><Link to="/api/schedules">Schedules</Link></td><td><code>{`/schedules`}</code> cron + once + run-now</td></tr>
<tr><td><Link to="/api/subscribers">Subscribers</Link></td><td><code>{`/subscribers`}</code> and pool stats</td></tr>
<tr><td><Link to="/api/settings">Settings</Link></td><td><code>{`/settings`}</code> runtime tuning</td></tr>
<tr><td><Link to="/api/overview">Transport check</Link></td><td><code>{`/transport`}</code> connectivity probe</td></tr></tbody>
</table>
<h2 id="error-shape">Error shape</h2>
<p>Every error response is a JSON document with at minimum <code>{`{&quot;error&quot;: &quot;&lt;message&gt;&quot;}`}</code>. Some errors include extra fields (<code>{`code`}</code>, <code>{`details`}</code>); the <code>{`error`}</code> field is the only stable contract.</p>
<table>
<thead><tr><th>Code</th><th>Meaning</th></tr></thead>
<tbody><tr><td>400</td><td>Bad request — invalid body, query params, or malformed YAML</td></tr>
<tr><td>401</td><td>Unauthorized — missing, invalid, or expired token</td></tr>
<tr><td>403</td><td>Forbidden — admin-only endpoint without admin role</td></tr>
<tr><td>404</td><td>Not found</td></tr>
<tr><td>409</td><td>Conflict — duplicate name, last-admin guard, locked subscriber, etc.</td></tr>
<tr><td>423</td><td>Locked — <code>{`must_change_password: true`}</code> until you change it</td></tr>
<tr><td>500</td><td>Server error</td></tr></tbody>
</table>
<h2 id="content-types">Content types</h2>
<ul>
<li>Requests with a body: <code>{`Content-Type: application/json`}</code>. YAML uploads (envs, flows, subscriber bulk-import) accept <code>{`application/json`}</code> with the YAML as a string field, or <code>{`text/yaml`}</code> with the raw bytes.</li>
<li>All responses: <code>{`application/json; charset=utf-8`}</code>.</li>
</ul>
<h2 id="cors">CORS</h2>
<p>The daemon allows any origin (<code>{`Access-Control-Allow-Origin: *`}</code>), <code>{`GET`}</code>, <code>{`POST`}</code>, <code>{`PUT`}</code>, <code>{`DELETE`}</code>, <code>{`OPTIONS`}</code>. Suitable for the embedded web UI and any local-trust frontend; tighten via reverse proxy if you expose the API externally.</p>
<h2 id="pagination">Pagination</h2>
<p>The list endpoints accept a <code>{`limit`}</code> query parameter (default 20). They return up to that many of the most recent records. Cursor-based pagination is not implemented in v1 — for bulk export use the database directly.</p>
<h2 id="health-probe">Health probe</h2>
<CodeBlock lang="http" code={`GET /health
GET /api/v1/health`} />
<p>Both return <code>{`200 ok`}</code> with body <code>{`ok`}</code> when the daemon is up. Neither requires auth. Suitable for load-balancer probes.</p>
<h2 id="where-to-start">Where to start</h2>
<ul>
<li>New to the daemon? <Link to="/api/overview">Authentication</Link> walks through login + first-time password change.</li>
<li>Driving runs from CI? <Link to="/api/executions">Executions</Link>.</li>
<li>Setting up scheduled runs? <Link to="/api/schedules">Schedules</Link>.</li>
</ul>
<p>Login, password change, and the current-user endpoint. Tokens are 24-hour HS256 JWTs; the signing secret is generated per daemon start and held in memory only — a restart invalidates every outstanding token.</p>
<p>For the cross-cutting auth model (roles, locked-account flow, header shape), see <Link to="/api/overview#authentication">API overview</Link>.</p>
<h2 id="post-apiv1authlogin" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/auth/login`}</code></h2>
<p>Exchange username + password for a bearer token. Public — no auth header required.</p>
<h3 id="request">Request</h3>
<CodeBlock lang="http" code={`POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "root",
  "password": "toor"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`username`}</code></td><td>string</td><td>yes</td><td>3-32 chars, <code>{`[a-zA-Z0-9_]`}</code></td></tr>
<tr><td><code>{`password`}</code></td><td>string</td><td>yes</td><td>8+ chars</td></tr></tbody>
</table>
<h3 id="response">Response</h3>
<CodeBlock lang="http" code={`200 OK
Content-Type: application/json

{
  "token": "<jwt>",
  "expires_at": "2026-05-11T15:30:00Z",
  "must_change_password": true,
  "user": {
    "id": "<uuid>",
    "username": "root",
    "display_name": "",
    "role": "admin",
    "active": true,
    "must_change_pass": true,
    "last_login_at": "2026-05-10T15:30:00Z",
    "created_by": "",
    "created_at": "...",
    "updated_at": "..."
  }
}`} />
<h3 id="errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Missing <code>{`username`}</code> or <code>{`password`}</code>, or fields fail validation</td></tr>
<tr><td>401</td><td>Unknown username, wrong password, or disabled account</td></tr></tbody>
</table>
<p>The error message is the same for unknown user and wrong password (<code>{`invalid credentials`}</code>) — username enumeration is not possible.</p>
<h3 id="first-time-login">First-time login</h3>
<p>The seeded admin (<code>{`root`}</code> / <code>{`toor`}</code>) is created with <code>{`must_change_pass: true`}</code>. The login response surfaces this in <code>{`must_change_password`}</code>. Until you change it, every authenticated endpoint except <code>{`/auth/me`}</code> and <code>{`/auth/change-password`}</code> returns <code>{`423 Locked`}</code>.</p>
<h2 id="get-apiv1authme" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/auth/me`}</code></h2>
<p>Return the authenticated user.</p>
<h3 id="request-2">Request</h3>
<CodeBlock lang="http" code={`GET /api/v1/auth/me
Authorization: Bearer <token>`} />
<h3 id="response-2">Response</h3>
<CodeBlock lang="http" code={`200 OK
Content-Type: application/json

{
  "id": "<uuid>",
  "username": "root",
  "display_name": "Admin",
  "role": "admin",
  "active": true,
  "must_change_pass": false,
  "last_login_at": "2026-05-10T15:30:00Z",
  "created_by": "",
  "created_at": "...",
  "updated_at": "..."
}`} />
<h3 id="errors-2">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>401</td><td>Missing, invalid, or expired token; user disabled</td></tr></tbody>
</table>
<h2 id="post-apiv1authchange-password" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/auth/change-password`}</code></h2>
<p>Change the authenticated user's password. Clears <code>{`must_change_pass`}</code>.</p>
<h3 id="request-3">Request</h3>
<CodeBlock lang="http" code={`POST /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "toor",
  "new_password": "<new-strong-password>"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`current_password`}</code></td><td>string</td><td>yes</td><td>Existing password</td></tr>
<tr><td><code>{`new_password`}</code></td><td>string</td><td>yes</td><td>8+ chars, must differ from <code>{`current_password`}</code></td></tr></tbody>
</table>
<h3 id="response-3">Response</h3>
<CodeBlock lang="http" code={`200 OK
Content-Type: application/json

{ "message": "password changed successfully" }`} />
<h3 id="errors-3">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Missing fields, new password too short, equal to current</td></tr>
<tr><td>401</td><td>Wrong <code>{`current_password`}</code></td></tr></tbody>
</table>
<h2 id="notes">Notes</h2>
<ul>
<li>Tokens are 24-hour TTL. There is no refresh-token endpoint — re-authenticate when a token expires.</li>
<li>The signing secret is process-local and cleared on restart. Active tokens become invalid; clients should expect 401 after a daemon restart and re-login.</li>
<li>Bcrypt with default cost is used for password hashing.</li>
<li>For programmatic clients, store the token in memory or a secret store — never persist it on disk.</li>
</ul>
<p>Probe connectivity for every transport in an env. Equivalent to the CLI <code>{`fluxproto-light check -c &lt;file&gt;`}</code> plus a Diameter-side CER/CEA probe.</p>
<h2 id="post-apiv1transport" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/transport`}</code></h2>
<CodeBlock lang="http" code={`POST /api/v1/transport
Authorization: Bearer <token>
Content-Type: application/json

{ ... full Config JSON ... }`} />
<p>The body is a full env config in JSON form (the same shape <code>{`/environments`}</code> accepts as <code>{`yaml:`}</code>, but here as parsed JSON). The handler does not require the env to be persisted — submit one ad-hoc to validate before saving.</p>
<h3 id="response-4">Response</h3>
<CodeBlock lang="json" code={`[
  {
    "protocol": "ngap",
    "gnb_name": "GNBENF",
    "amf_addr": "192.168.1.139:38412",
    "status": "ok",
    "latency": "12ms",
    "error": ""
  },
  {
    "protocol": "diameter",
    "peer_name": "fgp-1",
    "peer_addr": "127.0.0.1:3868",
    "status": "ok",
    "latency": "8ms",
    "error": ""
  }
]`} />
<p>Each row probes one peer:</p>
<ul>
<li><strong>NGAP rows</strong> open SCTP to each gNB→AMF pair, exchange <code>{`NGSetupRequest`}</code>/<code>{`NGSetupResponse`}</code>, then close cleanly.</li>
<li><strong>Diameter rows</strong> open the configured transport (SCTP or TCP) to each peer with <code>{`connection_mode: initiator`}</code> or <code>{`both`}</code>, exchange <code>{`CER`}</code>/<code>{`CEA`}</code>, then close. Pure-<code>{`responder`}</code> peers return <code>{`&quot;status&quot;: &quot;skipped&quot;`}</code> — there's nothing for the local end to dial.</li>
<li><strong>PFCP rows</strong> (when present) send an <code>{`AssociationSetupRequest`}</code> and verify the response.</li>
</ul>
<h3 id="status-values">Status values</h3>
<table>
<thead><tr><th>Status</th><th>Meaning</th></tr></thead>
<tbody><tr><td><code>{`ok`}</code></td><td>Probe succeeded; latency populated</td></tr>
<tr><td><code>{`failed`}</code></td><td>Probe error; <code>{`error`}</code> populated</td></tr>
<tr><td><code>{`skipped`}</code></td><td>Pure-responder peer — nothing to dial</td></tr></tbody>
</table>
<h3 id="errors-4">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Body is not valid JSON or fails env-schema validation</td></tr></tbody>
</table>
<p>The probe handler doesn't return non-200 on individual peer failures — those surface as <code>{`&quot;status&quot;: &quot;failed&quot;`}</code> rows so a partial-success env can still report cleanly.</p>
<h2 id="use-cases">Use cases</h2>
<ul>
<li><strong>Pre-flight check in the web UI</strong> — paste an env, click "Test", get a per-peer status table before saving.</li>
<li><strong>CI gating before a long-running execution</strong> — fail fast if the AMF is unreachable, rather than letting every UE time out.</li>
<li><strong>Debugging a peer config</strong> — surfaces the exact NGSetup or CER reject reason in the <code>{`error`}</code> field.</li>
</ul>
<h2 id="notes-2">Notes</h2>
<ul>
<li>The probe holds connections open only long enough for the protocol-level handshake. No flows run, no data is persisted.</li>
<li>Latency is wall-clock from connect to handshake response.</li>
<li>For the CLI equivalent: <code>{`fluxproto-light check -c config/lab.yaml`}</code>. Same probe code path on both sides.</li>
</ul>
    </DocPage>
  );
}
