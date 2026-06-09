import DocPage from '../../components/DocPage';
import HttpMethod from '../../components/HttpMethod';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';
import { Link } from 'react-router-dom';

export default function ApiOverview() {
  return (
    <DocPage slug="api/overview" lede="The fluxproto-light daemon exposes a JSON-over-HTTP REST API at /api/v1/. Each resource has its own page in this section. This page documents the cross-cutting conventions — authentication, the transport check, errors, CORS, pagination, and health — that every page builds on.">
<h2 id="base-url">Base URL</h2>
<CodeBlock lang="" code={`http://<host>:<port>/api/v1`} />
<p>The daemon binds <code>{`0.0.0.0:8199`}</code> by default. Override with <code>{`-host`}</code> and <code>{`-port`}</code>. The web UI (<code>{`-web`}</code>) shares the same port and proxies API calls to itself.</p>

<h2 id="authentication">Authentication</h2>
<p>Every endpoint except <code>{`/health`}</code> and <code>{`/api/v1/auth/login`}</code> requires a JWT bearer token.</p>
<CodeBlock lang="http" code={`Authorization: Bearer <token>`} />
<p>Tokens are issued by <code>{`POST /api/v1/auth/login`}</code> (see <Link to="#post-apiv1authlogin">the login endpoint</Link> below). They are HS256-signed with a secret generated once per daemon start and held in memory only. A daemon restart rotates that secret, so every outstanding token becomes invalid and clients must log in again. Tokens expire 24 hours after issuance — there is no refresh endpoint; re-authenticate when a token expires.</p>
<p>Decoded claims:</p>
<CodeBlock lang="json" code={`{
  "user_id": "<uuid>",
  "username": "<string>",
  "role": "admin" | "user",
  "exp": <unix>,
  "iat": <unix>
}`} />

<h3 id="first-login">First login</h3>
<p>On first start the daemon seeds a single admin account — username <code>{`admin`}</code>, password <code>{`admin`}</code> — and logs the credentials as dev defaults. These are development-grade credentials. Change the password before you expose the daemon: log in, then call <Link to="#post-apiv1authchange-password"><code>{`/auth/change-password`}</code></Link>.</p>

<h3 id="roles">Roles</h3>
<p>Two roles ship today:</p>
<ul>
<li><code>{`admin`}</code> — full access, including <code>{`/users`}</code> and the write side of <code>{`/settings`}</code>.</li>
<li><code>{`user`}</code> — every other authenticated route, including triggering executions and editing subscribers, environments, and flows. No user management; no settings writes.</li>
</ul>
<p>Only two routes are admin-gated: the <code>{`/users`}</code> resource and <code>{`PUT /settings`}</code>. Endpoints flagged "admin" in this section's pages require <code>{`role: admin`}</code>; everything else is open to both roles.</p>

<h3 id="forced-password-change">Forced password change</h3>
<p>When an admin creates or resets a user with <code>{`must_change_pass: true`}</code>, that account is locked until the password is changed. While the flag is set, every authenticated endpoint except <code>{`/auth/me`}</code> and <code>{`/auth/change-password`}</code> returns <code>{`423 Locked`}</code>. Changing the password clears the flag.</p>
<Callout type="note">
The dev-default <code>{`admin`}</code> account is not created with this flag, so it is never locked. The 423 flow applies only to accounts an admin later creates or resets with <code>{`must_change_pass`}</code>.
</Callout>

<h2 id="resource-pages">Resource pages</h2>
<table>
<thead><tr><th>Page</th><th>Resource</th></tr></thead>
<tbody>
<tr><td><Link to="#authentication">Authentication</Link></td><td><code>{`/auth/login`}</code>, <code>{`/auth/me`}</code>, <code>{`/auth/change-password`}</code> (on this page)</td></tr>
<tr><td><Link to="/api/users">Users</Link></td><td><code>{`/users`}</code> (admin-only CRUD + reset-password)</td></tr>
<tr><td><Link to="/api/flows">Flows</Link></td><td><code>{`/flows`}</code> — shipped + custom</td></tr>
<tr><td><Link to="/api/environments">Environments</Link></td><td><code>{`/environments`}</code></td></tr>
<tr><td><Link to="/api/executions">Executions &amp; reports</Link></td><td><code>{`/execute`}</code>, <code>{`/executions`}</code>, <code>{`/reports`}</code>, queue, cancel</td></tr>
<tr><td><Link to="/api/schedules">Schedules</Link></td><td><code>{`/schedules`}</code> — cron + once + run-now</td></tr>
<tr><td><Link to="/api/subscribers">Subscribers</Link></td><td><code>{`/subscribers`}</code> and pool stats</td></tr>
<tr><td><Link to="/api/settings">Settings</Link></td><td><code>{`/settings`}</code> runtime tuning</td></tr>
<tr><td><Link to="#transport-check">Transport check</Link></td><td><code>{`/transport`}</code> connectivity probe (on this page)</td></tr>
</tbody>
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
<tr><td>423</td><td>Locked — account has <code>{`must_change_pass: true`}</code> until the password is changed</td></tr>
<tr><td>500</td><td>Server error</td></tr></tbody>
</table>

<h2 id="content-types">Content types</h2>
<ul>
<li>Requests with a body: <code>{`Content-Type: application/json`}</code>. YAML uploads (environments, flows, subscriber bulk-import) accept <code>{`application/json`}</code> with the YAML as a string field, or <code>{`text/yaml`}</code> with the raw bytes.</li>
<li>All responses: <code>{`application/json; charset=utf-8`}</code>.</li>
</ul>

<h2 id="cors">CORS</h2>
<p>The daemon allows any origin (<code>{`Access-Control-Allow-Origin: *`}</code>), <code>{`GET`}</code>, <code>{`POST`}</code>, <code>{`PUT`}</code>, <code>{`DELETE`}</code>, <code>{`OPTIONS`}</code>. This suits the embedded web UI and any local-trust frontend; tighten it via a reverse proxy if you expose the API externally.</p>

<h2 id="pagination">Pagination</h2>
<p>The list endpoints accept a <code>{`limit`}</code> query parameter (default 20). They return up to that many of the most recent records. Cursor-based pagination is not implemented in v1 — for bulk export, read the database directly.</p>

<h2 id="health-probe">Health probe</h2>
<CodeBlock lang="http" code={`GET /health
GET /api/v1/health`} />
<p>Both return <code>{`200 OK`}</code> with body <code>{`ok`}</code> when the daemon is up. Neither requires auth. Suitable for load-balancer probes.</p>

<h2 id="post-apiv1authlogin" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/auth/login`}</code></h2>
<p>Exchange a username and password for a bearer token. Public — no auth header required.</p>
<h3 id="login-request">Request</h3>
<CodeBlock lang="http" code={`POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>{`username`}</code></td><td>string</td><td>yes</td><td>3–32 chars, <code>{`[a-zA-Z0-9_]`}</code></td></tr>
<tr><td><code>{`password`}</code></td><td>string</td><td>yes</td><td>4+ chars (dev-grade minimum)</td></tr>
</tbody>
</table>
<h3 id="login-response">Response</h3>
<CodeBlock lang="http" code={`200 OK
Content-Type: application/json

{
  "token": "<jwt>",
  "expires_at": "2026-05-11T15:30:00Z",
  "must_change_password": false,
  "user": {
    "id": "<uuid>",
    "username": "admin",
    "display_name": "Admin",
    "role": "admin",
    "active": true,
    "must_change_pass": false,
    "last_login_at": "2026-05-10T15:30:00Z",
    "created_by": "system",
    "created_at": "...",
    "updated_at": "..."
  }
}`} />
<p><code>{`must_change_password`}</code> mirrors the account's <code>{`must_change_pass`}</code> flag. It is <code>{`false`}</code> for the dev-default admin and <code>{`true`}</code> only for accounts an admin created or reset with a forced change pending — see <Link to="#forced-password-change">Forced password change</Link>.</p>
<h3 id="login-errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody>
<tr><td>400</td><td>Missing <code>{`username`}</code> or <code>{`password`}</code></td></tr>
<tr><td>401</td><td>Unknown username, wrong password, or disabled account</td></tr>
</tbody>
</table>
<p>The error message is identical for an unknown user and a wrong password (<code>{`invalid credentials`}</code>), so username enumeration is not possible.</p>

<h2 id="get-apiv1authme" className="flex items-center gap-2"><HttpMethod method="GET" /><code>{`/api/v1/auth/me`}</code></h2>
<p>Return the authenticated user.</p>
<h3 id="me-request">Request</h3>
<CodeBlock lang="http" code={`GET /api/v1/auth/me
Authorization: Bearer <token>`} />
<h3 id="me-response">Response</h3>
<CodeBlock lang="http" code={`200 OK
Content-Type: application/json

{
  "id": "<uuid>",
  "username": "admin",
  "display_name": "Admin",
  "role": "admin",
  "active": true,
  "must_change_pass": false,
  "last_login_at": "2026-05-10T15:30:00Z",
  "created_by": "system",
  "created_at": "...",
  "updated_at": "..."
}`} />
<h3 id="me-errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>401</td><td>Missing, invalid, or expired token; user disabled</td></tr></tbody>
</table>

<h2 id="post-apiv1authchange-password" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/auth/change-password`}</code></h2>
<p>Change the authenticated user's password. Clears <code>{`must_change_pass`}</code> and lifts the 423 lock if it was set.</p>
<h3 id="change-password-request">Request</h3>
<CodeBlock lang="http" code={`POST /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "admin",
  "new_password": "<new-password>"
}`} />
<table>
<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>{`current_password`}</code></td><td>string</td><td>yes</td><td>Existing password</td></tr>
<tr><td><code>{`new_password`}</code></td><td>string</td><td>yes</td><td>4+ chars, must differ from <code>{`current_password`}</code></td></tr>
</tbody>
</table>
<h3 id="change-password-response">Response</h3>
<CodeBlock lang="http" code={`200 OK
Content-Type: application/json

{ "message": "password changed successfully" }`} />
<h3 id="change-password-errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody>
<tr><td>400</td><td>Missing fields, new password too short, or equal to current</td></tr>
<tr><td>401</td><td>Wrong <code>{`current_password`}</code></td></tr>
</tbody>
</table>
<Callout type="note">
Passwords are hashed with bcrypt at default cost. For programmatic clients, hold the token in memory or a secret store — never persist it on disk.
</Callout>

<h2 id="transport-check">Transport check</h2>
<p>Probe connectivity for every transport in an environment before you run anything against it. This is the same probe as the CLI <code>{`fluxproto-light check -c <file>`}</code>, plus a Diameter-side CER/CEA exchange.</p>
<h3 id="post-apiv1transport" className="flex items-center gap-2"><HttpMethod method="POST" /><code>{`/api/v1/transport`}</code></h3>
<CodeBlock lang="http" code={`POST /api/v1/transport
Authorization: Bearer <token>
Content-Type: application/json

{ ... full environment config as JSON ... }`} />
<p>The body is a full environment config in JSON form — the same shape <code>{`/environments`}</code> accepts under <code>{`yaml:`}</code>, but here as parsed JSON. The environment does not need to be persisted: submit one ad hoc to validate it before saving.</p>
<h3 id="transport-response">Response</h3>
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
<li><strong>Diameter rows</strong> open the configured transport (SCTP or TCP) to each peer with <code>{`connection_mode: initiator`}</code> or <code>{`both`}</code>, exchange <code>{`CER`}</code>/<code>{`CEA`}</code>, then close. Pure-<code>{`responder`}</code> peers return <code>{`&quot;status&quot;: &quot;skipped&quot;`}</code> — there is nothing for the local end to dial.</li>
<li><strong>PFCP rows</strong> (when present) send an <code>{`AssociationSetupRequest`}</code> and verify the response.</li>
</ul>
<h3 id="transport-status-values">Status values</h3>
<table>
<thead><tr><th>Status</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><code>{`ok`}</code></td><td>Probe succeeded; <code>{`latency`}</code> populated</td></tr>
<tr><td><code>{`failed`}</code></td><td>Probe error; <code>{`error`}</code> populated</td></tr>
<tr><td><code>{`skipped`}</code></td><td>Pure-responder peer — nothing to dial</td></tr>
</tbody>
</table>
<h3 id="transport-errors">Errors</h3>
<table>
<thead><tr><th>Code</th><th>Cause</th></tr></thead>
<tbody><tr><td>400</td><td>Body is not valid JSON or fails environment-schema validation</td></tr></tbody>
</table>
<p>The handler does not return a non-200 status for individual peer failures. Those surface as <code>{`&quot;status&quot;: &quot;failed&quot;`}</code> rows, so a partial-success environment still reports cleanly. The probe holds connections open only long enough for the protocol handshake — no flows run and nothing is persisted. Latency is wall-clock from connect to handshake response.</p>
<p>Use it to pre-flight an environment in the web UI ("paste, click Test, read the per-peer table"), to gate a long execution in CI (fail fast if the AMF is unreachable rather than letting every UE time out), and to debug a peer config (the exact NGSetup or CER reject reason lands in the <code>{`error`}</code> field).</p>

<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li>New to the daemon? Start with <Link to="#post-apiv1authlogin">login</Link>, then <Link to="#post-apiv1authchange-password">change the default password</Link>.</li>
<li>Driving runs from CI? <Link to="/api/executions">Executions &amp; reports</Link>.</li>
<li>Setting up recurring runs? <Link to="/api/schedules">Schedules</Link>.</li>
</ul>
    </DocPage>
  );
}
