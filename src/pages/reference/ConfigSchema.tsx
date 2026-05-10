import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ConfigSchema() {
  return (
    <DocPage slug="reference/config-schema">
<h1>Config schema reference</h1>
<p>Authoritative schema for env YAMLs (e.g. <code>{`config/lab.yaml`}</code>). For prose, see <Link to="/guides/configuring-environments">configuring-environments</Link>.</p>
<h2 id="synopsis">Synopsis</h2>
<CodeBlock lang="yaml" code={`nfs:
  - name: GNBENF
    role: gnb
    plmn: { mcc: "901", mnc: "70" }
    transport: ngap-out
    gnb: { ... }

transports:
  ngap-out:
    protocol: ngap
    ngap: { ... }

diameter_dictionary_path: config/diameter/custom_dict.xml`} />
<h2 id="top-level-fields">Top-level fields</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`nfs`}</code></td><td>[]NF</td><td>yes</td><td>Inventory of NFs in this env</td></tr>
<tr><td><code>{`transports`}</code></td><td>map[string]Transport</td><td>yes</td><td>Wire-stack table; keys are transport IDs that NFs reference</td></tr>
<tr><td><code>{`diameter_dictionary_path`}</code></td><td>string</td><td>no</td><td>Path to an XML file extending the embedded Diameter AVP dictionary. Process-wide; applies to every Diameter transport.</td></tr></tbody>
</table>
<h2 id="nf-entry">NF entry</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>Unique within the env</td></tr>
<tr><td><code>{`role`}</code></td><td>enum</td><td>yes</td><td><code>{`gnb`}</code>, <code>{`amf`}</code>, <code>{`smf`}</code>, <code>{`ausf`}</code>, <code>{`udm`}</code>, <code>{`pcf`}</code>, <code>{`nrf`}</code>, <code>{`upf`}</code>, <code>{`mme`}</code>, <code>{`pgw`}</code>, <code>{`af`}</code>, <code>{`external`}</code></td></tr>
<tr><td><code>{`plmn`}</code></td><td>PLMN</td><td>no</td><td><code>{`{ mcc, mnc }`}</code></td></tr>
<tr><td><code>{`transport`}</code></td><td>string</td><td>no</td><td>Transport ID this NF uses</td></tr>
<tr><td><code>{`gnb`}</code></td><td>GNBProperties</td><td>role-specific</td><td>Set when <code>{`role: gnb`}</code></td></tr>
<tr><td><code>{`amf`}</code></td><td>AMFProperties</td><td>role-specific</td><td>Set when <code>{`role: amf`}</code></td></tr></tbody>
</table>
<h2 id="gnbproperties">GNBProperties</h2>
<CodeBlock lang="yaml" code={`gnb:
  global_id:
    plmn: { mcc: "901", mnc: "70" }
    gnb_id: "123456"
    bit_length: 24
  supported_tas:
    - tac: 1
      plmns:
        - plmn: { mcc: "901", mnc: "70" }
          slices: [{ sst: 1, sd: "010203" }]
  paging_drx: 32
  uplane: { ... }
  auto_reply: { handover_request: true }`} />
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`global_id`}</code></td><td>GlobalID</td><td>yes</td><td>gNB identity advertised in NGSetupRequest</td></tr>
<tr><td><code>{`global_id.plmn`}</code></td><td>PLMN</td><td>yes</td><td>gNB PLMN</td></tr>
<tr><td><code>{`global_id.gnb_id`}</code></td><td>string</td><td>yes</td><td>gNB ID (decimal or hex string)</td></tr>
<tr><td><code>{`global_id.bit_length`}</code></td><td>int</td><td>yes</td><td>22, 24, 28, or 32</td></tr>
<tr><td><code>{`supported_tas`}</code></td><td>[]SupportedTA</td><td>yes</td><td>TAC + PLMNs + slices</td></tr>
<tr><td><code>{`supported_tas[].tac`}</code></td><td>int</td><td>yes</td><td>Tracking Area Code</td></tr>
<tr><td><code>{`supported_tas[].plmns[].plmn`}</code></td><td>PLMN</td><td>yes</td><td>PLMN within the TA</td></tr>
<tr><td><code>{`supported_tas[].plmns[].slices[]`}</code></td><td>SliceConfig</td><td>yes</td><td><code>{`{ sst, sd }`}</code></td></tr>
<tr><td><code>{`paging_drx`}</code></td><td>int</td><td>no</td><td>DRX coefficient (32, 64, 128, 256)</td></tr>
<tr><td><code>{`uplane`}</code></td><td>UplaneConfig</td><td>no</td><td>User-plane traffic generator config</td></tr>
<tr><td><code>{`auto_reply.handover_request`}</code></td><td>bool</td><td>no</td><td>Stub-reply to inbound HandoverRequest (used by <code>{`handover_source`}</code> flow)</td></tr></tbody>
</table>
<h2 id="amfproperties">AMFProperties</h2>
<CodeBlock lang="yaml" code={`amf:
  served_guami:
    plmn: { mcc: "901", mnc: "70" }
    amf_region_id: 1
    amf_set_id: 1
    amf_pointer: 0
  relative_capacity: 100
  allowed_gnbs:
    - name: GNBENF`} />
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`served_guami`}</code></td><td>AMFServedGuami</td><td>no</td><td>GUAMI advertised in NGSetupResponse. Defaults if nil.</td></tr>
<tr><td><code>{`relative_capacity`}</code></td><td>uint8</td><td>no</td><td>NGSetupResponse field</td></tr>
<tr><td><code>{`allowed_gnbs`}</code></td><td>[]AMFAllowedGNB</td><td>no</td><td>Empty = accept any gNB. Match is on <code>{`RanNodeName`}</code>.</td></tr></tbody>
</table>
<h2 id="transport">Transport</h2>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`protocol`}</code></td><td>enum</td><td>yes</td><td><code>{`ngap`}</code>, <code>{`diameter`}</code>, <code>{`sbi`}</code>, <code>{`rest`}</code>, <code>{`pfcp`}</code></td></tr>
<tr><td><code>{`ngap`}</code></td><td>NgapTransportConfig</td><td>role-specific</td><td>Set when <code>{`protocol: ngap`}</code></td></tr>
<tr><td><code>{`diameter`}</code></td><td>DiameterConfig</td><td>role-specific</td><td>Set when <code>{`protocol: diameter`}</code></td></tr>
<tr><td><code>{`sbi`}</code></td><td>SBITransportConfig</td><td>role-specific</td><td>Set when <code>{`protocol: sbi`}</code></td></tr>
<tr><td><code>{`rest`}</code></td><td>RESTTransportConfig</td><td>role-specific</td><td>Set when <code>{`protocol: rest`}</code></td></tr>
<tr><td><code>{`pfcp`}</code></td><td>PFCPTransportConfig</td><td>role-specific</td><td>Set when <code>{`protocol: pfcp`}</code></td></tr></tbody>
</table>
<h3 id="ngap-transport">NGAP transport</h3>
<CodeBlock lang="yaml" code={`ngap:
  mode: client | server
  local_sctp: "0.0.0.0"
  local_gtpu: "192.168.1.200"
  peers:
    - { address: "10.0.0.10", port: 38412 }`} />
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`mode`}</code></td><td>string</td><td>no</td><td><code>{`client`}</code> or <code>{`server`}</code>. Defaults: <code>{`client`}</code> if <code>{`peers`}</code> non-empty, <code>{`server`}</code> otherwise.</td></tr>
<tr><td><code>{`local_sctp`}</code></td><td>string</td><td>yes</td><td>Bind/dial-source IP</td></tr>
<tr><td><code>{`local_gtpu`}</code></td><td>string</td><td>no</td><td>IP advertised as N3 endpoint in PduSessionResourceSetupResponse</td></tr>
<tr><td><code>{`peers`}</code></td><td>[]AMFConfig</td><td>client-mode</td><td>List of <code>{`{ address, port }`}</code> AMFs to dial</td></tr></tbody>
</table>
<h3 id="diameter-transport">Diameter transport</h3>
<p>RFC 6733 shape: one local identity, peer table, optional realm-based routing table.</p>
<CodeBlock lang="yaml" code={`diameter:
  local: { ... }
  peers: [ ... ]
  routes: [ ... ]`} />
<p><code>{`local`}</code> (DiameterLocalConfig):</p>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`origin_host`}</code></td><td>string</td><td>yes</td><td>Our Origin-Host advertised in CER</td></tr>
<tr><td><code>{`origin_realm`}</code></td><td>string</td><td>yes</td><td>Our Origin-Realm</td></tr>
<tr><td><code>{`vendor_id`}</code></td><td>uint32</td><td>no</td><td>Vendor-Id AVP (3GPP=10415)</td></tr>
<tr><td><code>{`product_name`}</code></td><td>string</td><td>no</td><td>Product-Name AVP</td></tr>
<tr><td><code>{`application_ids`}</code></td><td>[]uint32</td><td>yes</td><td>App IDs advertised: S6a=16777251, Gx=16777238, Rx=16777236</td></tr>
<tr><td><code>{`watchdog_interval`}</code></td><td>duration</td><td>no</td><td>DWR/DWA cadence</td></tr>
<tr><td><code>{`listen`}</code></td><td>DiameterListenConfig</td><td>no</td><td>Set to enable inbound peer connections (Responder role)</td></tr>
<tr><td><code>{`listen.transport`}</code></td><td>string</td><td>yes (with <code>{`listen`}</code>)</td><td><code>{`sctp`}</code> or <code>{`tcp`}</code></td></tr>
<tr><td><code>{`listen.addr`}</code> / <code>{`listen.port`}</code></td><td>string / int</td><td>yes</td><td>Local bind</td></tr>
<tr><td><code>{`responder.timeout`}</code></td><td>duration</td><td>no</td><td>Pure-Responder readiness wait at Start</td></tr></tbody>
</table>
<p><code>{`peers`}</code> (one per remote peer):</p>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`name`}</code></td><td>string</td><td>yes</td><td>Local nickname referenced in <code>{`routes`}</code></td></tr>
<tr><td><code>{`transport`}</code></td><td>string</td><td>yes</td><td><code>{`sctp`}</code> or <code>{`tcp`}</code></td></tr>
<tr><td><code>{`addr`}</code></td><td>string</td><td>yes</td><td>Remote address</td></tr>
<tr><td><code>{`port`}</code></td><td>int</td><td>yes</td><td>Remote port</td></tr>
<tr><td><code>{`sctp_ppid`}</code></td><td>uint32</td><td>no</td><td>RFC 6733 §2.1; default 46 if unset</td></tr>
<tr><td><code>{`destination_host`}</code></td><td>string</td><td>yes</td><td>Must match remote's <code>{`origin_host`}</code> in CEA</td></tr>
<tr><td><code>{`destination_realm`}</code></td><td>string</td><td>yes</td><td>Must match remote's <code>{`origin_realm`}</code></td></tr>
<tr><td><code>{`connection_mode`}</code></td><td>string</td><td>no</td><td><code>{`initiator`}</code> (default; we dial), <code>{`responder`}</code> (we wait), <code>{`both`}</code> (we dial <em>and</em> accept; RFC 6733 §5.6.4 election)</td></tr>
<tr><td><code>{`tls`}</code></td><td>bool</td><td>no</td><td>TLS to this peer</td></tr></tbody>
</table>
<p><code>{`routes`}</code> (RFC 6733 §6.1):</p>
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`realm`}</code></td><td>string</td><td>yes</td><td>Destination-Realm to match</td></tr>
<tr><td><code>{`application_ids`}</code></td><td>[]uint32</td><td>yes</td><td>Apps this route handles</td></tr>
<tr><td><code>{`local_action`}</code></td><td>string</td><td>no</td><td><code>{`local`}</code>, <code>{`relay`}</code> (default), <code>{`proxy`}</code>, <code>{`redirect`}</code></td></tr>
<tr><td><code>{`peers[].name`}</code></td><td>string</td><td>yes</td><td>Reference into <code>{`peers`}</code></td></tr>
<tr><td><code>{`peers[].rating`}</code></td><td>int</td><td>no</td><td>Higher rating wins</td></tr></tbody>
</table>
<h3 id="sbi-transport">SBI transport</h3>
<CodeBlock lang="yaml" code={`sbi:
  base_url: https://udm.lab.local:8443    # client mode
  nf_type: UDM
  nf_instance_id: <uuid>
  tls: { ca_file, cert_file, key_file }
  oauth2: { enabled, token_url, client_id, client_secret_env }
  listen: { addr, port }                  # server mode
  server: { answer_timeout, read_header_timeout }`} />
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`base_url`}</code></td><td>string</td><td>client-mode</td><td>Set for client mode. Mutually exclusive with <code>{`listen`}</code>.</td></tr>
<tr><td><code>{`nf_type`}</code></td><td>string</td><td>no</td><td>Advertised NFType (UDM, AUSF, AMF, ...)</td></tr>
<tr><td><code>{`nf_instance_id`}</code></td><td>string</td><td>no</td><td>UUID identity</td></tr>
<tr><td><code>{`tls.*`}</code></td><td>string</td><td>no</td><td>CA / cert / key paths</td></tr>
<tr><td><code>{`oauth2.enabled`}</code></td><td>bool</td><td>no</td><td>Enable OAuth2 client-credentials</td></tr>
<tr><td><code>{`oauth2.token_url`}</code></td><td>string</td><td>OAuth2</td><td>Token endpoint</td></tr>
<tr><td><code>{`oauth2.client_id`}</code></td><td>string</td><td>OAuth2</td><td>Client ID</td></tr>
<tr><td><code>{`oauth2.client_secret_env`}</code></td><td>string</td><td>OAuth2</td><td>Env var name holding the secret (never put secrets in YAML)</td></tr>
<tr><td><code>{`listen.addr`}</code> / <code>{`listen.port`}</code></td><td>string / int</td><td>server-mode</td><td>Bind</td></tr>
<tr><td><code>{`server.answer_timeout`}</code></td><td>duration</td><td>no</td><td>Default 10s — caps how long the listener blocks on the FSM before returning 504</td></tr>
<tr><td><code>{`server.read_header_timeout`}</code></td><td>duration</td><td>no</td><td>Default 30s — <code>{`http.Server.ReadHeaderTimeout`}</code></td></tr></tbody>
</table>
<h3 id="rest-transport">REST transport</h3>
<p>Generic HTTP/2 for non-3GPP peers. Same shape as SBI without OpenAPI.</p>
<CodeBlock lang="yaml" code={`rest:
  base_url: "http://127.0.0.1:18080"      # client mode
  listen: { addr, port }                  # server mode
  tls: { ... }
  auth: { type, token_env, ... }
  server: { answer_timeout, read_header_timeout }`} />
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`base_url`}</code></td><td>string</td><td>client-mode</td><td>Mutually exclusive with <code>{`listen`}</code></td></tr>
<tr><td><code>{`listen.addr`}</code> / <code>{`listen.port`}</code></td><td>string / int</td><td>server-mode</td><td>Bind</td></tr>
<tr><td><code>{`auth.type`}</code></td><td>string</td><td>no</td><td><code>{`none`}</code>, <code>{`basic`}</code>, <code>{`bearer`}</code>, <code>{`api_key`}</code></td></tr>
<tr><td><code>{`auth.username_env`}</code> / <code>{`auth.password_env`}</code></td><td>string</td><td>basic</td><td>Env var names</td></tr>
<tr><td><code>{`auth.token_env`}</code></td><td>string</td><td>bearer</td><td>Env var name holding the token</td></tr>
<tr><td><code>{`auth.header`}</code> / <code>{`auth.value_env`}</code></td><td>string</td><td>api_key</td><td>Custom header name + env var holding the value</td></tr>
<tr><td><code>{`tls.*`}</code></td><td>string</td><td>no</td><td>CA / cert / key paths</td></tr>
<tr><td><code>{`server.answer_timeout`}</code> / <code>{`server.read_header_timeout`}</code></td><td>duration</td><td>no</td><td>Same defaults as SBI</td></tr></tbody>
</table>
<h3 id="pfcp-transport">PFCP transport</h3>
<CodeBlock lang="yaml" code={`pfcp:
  mode: client | server
  local: "0.0.0.0:0" | "127.0.0.1:18805"
  peer: { addr, port }                    # client mode only
  node_id: { type, value }`} />
<table>
<thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
<tbody><tr><td><code>{`mode`}</code></td><td>string</td><td>yes</td><td><code>{`client`}</code> or <code>{`server`}</code></td></tr>
<tr><td><code>{`local`}</code></td><td>string</td><td>server: yes; client: optional</td><td>host:port; <code>{`0.0.0.0:0`}</code> for ephemeral client</td></tr>
<tr><td><code>{`peer.addr`}</code></td><td>string</td><td>client</td><td>Remote PFCP node IP</td></tr>
<tr><td><code>{`peer.port`}</code></td><td>int</td><td>client</td><td>Remote PFCP UDP port (8805 default)</td></tr>
<tr><td><code>{`node_id.type`}</code></td><td>string</td><td>yes</td><td><code>{`ipv4`}</code>, <code>{`ipv6`}</code>, or <code>{`fqdn`}</code></td></tr>
<tr><td><code>{`node_id.value`}</code></td><td>string</td><td>yes</td><td>Address or FQDN advertised in AssociationSetupRequest/Response</td></tr></tbody>
</table>
<h2 id="examples">Examples</h2>
<h3 id="single-gnb-lab-canonical">Single-gNB lab (canonical)</h3>
<p>See <code>{`config/lab.yaml`}</code>.</p>
<h3 id="diameter-mme-hss">Diameter MME → HSS</h3>
<p>See <code>{`config/lab-diameter.yaml`}</code>. Shipped peers point at <code>{`fgp`}</code> in HSS-server mode.</p>
<h3 id="pfcp-loopback">PFCP loopback</h3>
<p>See <code>{`config/lab-pfcp.yaml`}</code>. SMF + UPF on <code>{`127.0.0.1:18805`}</code>.</p>
<h3 id="sbi-loopback">SBI loopback</h3>
<p>See <code>{`config/lab-sbi.yaml`}</code>. UDM + AUSF servers + matching client peers, all on <code>{`127.0.0.1`}</code>.</p>
<h3 id="multi-nf">Multi-NF</h3>
<p>See <code>{`config/lab-multinf.yaml`}</code>. Two gNBs sharing one NGAP transport, plus an MME on Diameter, plus a remote UDM on SBI — the canonical multi-NF reference.</p>
<h2 id="notes">Notes</h2>
<ul>
<li>Multiple NFs may reference the same transport ID when they share a wire (e.g. two MMEs on one Diameter peer pool).</li>
<li>The validator runs at config load. Any invalid combination (<code>{`mode: client`}</code> with no peers, <code>{`protocol: sbi`}</code> with both <code>{`base_url`}</code> and <code>{`listen`}</code> set, ...) fails before the daemon binds.</li>
<li>Secrets must come from environment variables — every <code>{`*_env`}</code> field is a name, not a value.</li>
</ul>
    </DocPage>
  );
}
