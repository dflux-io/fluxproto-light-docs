import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import { Link } from 'react-router-dom';

export default function ConfiguringEnvironments() {
  return (
    <DocPage slug="guides/configuring-environments" lede="An environment is a YAML file that declares the network functions (NFs) fluxproto-light simulates or talks to, plus the wire-level transports those NFs use. CLI runs load it via -c <file>; daemon runs store one per database row. This guide covers the top-level shape and each protocol's transport block.">
<h2 id="top-level-shape">Top-level shape</h2>
<CodeBlock lang="yaml" code={`nfs:
  - name: <unique nf name>
    role: gnb | amf | smf | ausf | udm | pcf | nrf | upf | mme | pgw | af | external
    plmn: { mcc: "...", mnc: "..." }
    transport: <transport id>
    gnb: { ... }     # only when role: gnb
    amf: { ... }     # only when role: amf

transports:
  <transport id>:
    protocol: ngap | diameter | sbi | rest | pfcp
    ngap: { ... }     # only when protocol: ngap
    diameter: { ... } # only when protocol: diameter
    # ...

diameter_dictionary_path: <optional path to extra Diameter AVP XML>`} />
<p>Each NF references one transport by ID. Multiple NFs can share a transport (two MMEs on one Diameter peer pool) — but most labs use one NF per transport for clarity.</p>
<h2 id="gnb-properties">gNB properties</h2>
<p>Set when <code>{`role: gnb`}</code>. Identity for the NGAP TX/RX pipeline; wire details live on the NGAP transport.</p>
<CodeBlock lang="yaml" code={`- name: GNBENF
  role: gnb
  plmn: { mcc: "901", mnc: "70" }
  transport: ngap-out
  gnb:
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
    uplane:
      type: USPACE
      protocol: 1
      duration: "5s"
      target_addr: "8.8.8.8"
    auto_reply:
      handover_request: true`} />
<p><code>{`uplane:`}</code> arms a user-plane traffic generator — see <Link to="/guides/user-plane-testing">user-plane-testing</Link>. <code>{`auto_reply.handover_request: true`}</code> makes the gNB stub-reply to inbound <code>{`HandoverRequest`}</code> so the source-side handover flow can complete (used by <code>{`templates/gnb/handover_source.yaml`}</code>).</p>
<h2 id="amf-properties">AMF properties</h2>
<p>Set when <code>{`role: amf`}</code>. Identity for AMF-mode (server) NGAP. The listen endpoint lives on the NGAP transport (<code>{`mode: server`}</code>); this block carries what the AMF advertises in <code>{`NGSetupResponse`}</code>.</p>
<CodeBlock lang="yaml" code={`- name: amf-server
  role: amf
  plmn: { mcc: "901", mnc: "70" }
  transport: ngap-listen
  amf:
    served_guami:
      plmn: { mcc: "901", mnc: "70" }
      amf_region_id: 1
      amf_set_id: 1
      amf_pointer: 0
    relative_capacity: 100
    allowed_gnbs:
      - name: GNBENF`} />
<p>Empty <code>{`allowed_gnbs:`}</code> means accept any gNB. Match is by <code>{`RanNodeName`}</code> against <code>{`NGSetupRequest.RanNodeName`}</code>.</p>
<h2 id="ngap-transport">NGAP transport</h2>
<CodeBlock lang="yaml" code={`ngap-out:
  protocol: ngap
  ngap:
    mode: client | server
    local_sctp: "0.0.0.0"
    local_gtpu: "192.168.1.200"
    peers:
      - { address: "10.0.0.10", port: 38412 }`} />
<p><code>{`mode: client`}</code> (default when <code>{`peers:`}</code> is non-empty) dials the listed AMFs on SCTP/38412. <code>{`mode: server`}</code> binds <code>{`local_sctp`}</code> and accepts inbound gNB associations (use empty <code>{`peers:`}</code> here).</p>
<p><code>{`local_gtpu`}</code> is the IP the gNB advertises in <code>{`PduSessionResourceSetupResponse`}</code> for the N3 GTP-U tunnel — set it to whichever NIC the UPF will reach.</p>
<p>NGAP is 3GPP TS 38.413; SCTP is RFC 4960. The Payload Protocol Identifier is auto-set per NGAP convention.</p>
<h2 id="diameter-transport">Diameter transport</h2>
<p>Diameter follows RFC 6733 shape: one local identity, a peer table, and a realm-based routing table.</p>
<CodeBlock lang="yaml" code={`diameter-mme:
  protocol: diameter
  diameter:
    local:
      origin_host: dsr.lab.local
      origin_realm: lab.local
      vendor_id: 10415
      product_name: fluxproto-light
      application_ids: [16777251]   # S6a (3GPP TS 29.272)
      watchdog_interval: 30s
      listen:
        transport: sctp
        addr: "0.0.0.0"
        port: 3868
      responder:
        timeout: 30s
    peers:
      - name: hss-1
        destination_host: hss.lab.local
        destination_realm: lab.local
        transport: sctp
        addr: 10.0.0.30
        port: 3868
        sctp_ppid: 46
        connection_mode: initiator
        tls: false
    routes:
      - realm: lab.local
        application_ids: [16777251]
        local_action: relay
        peers:
          - { name: hss-1, rating: 10 }`} />
<p>Application IDs:</p>
<ul>
<li>S6a: <code>{`16777251`}</code> (3GPP TS 29.272)</li>
<li>Gx: <code>{`16777238`}</code> (3GPP TS 29.212)</li>
<li>Rx: <code>{`16777236`}</code> (3GPP TS 29.214)</li>
</ul>
<p><code>{`connection_mode`}</code> (Oracle DSR vocabulary): <code>{`initiator`}</code> (we dial), <code>{`responder`}</code> (we wait), <code>{`both`}</code> (we dial <em>and</em> accept; RFC 6733 §5.6.4 election resolves duplicates). When <code>{`local.listen`}</code> is set the node accepts inbound connections in addition to dialing.</p>
<p><code>{`local_action`}</code> follows RFC 6733 §6.1: <code>{`local`}</code>, <code>{`relay`}</code>, <code>{`proxy`}</code>, <code>{`redirect`}</code>. Default is <code>{`relay`}</code>.</p>
<h2 id="sbi-transport">SBI transport</h2>
<p>SBI is HTTP/2 (3GPP TS 29.500-series). One binding is one mode — client (<code>{`base_url`}</code>) or server (<code>{`listen`}</code>).</p>
<CodeBlock lang="yaml" code={`sbi-udm:
  protocol: sbi
  sbi:
    base_url: https://udm.lab.local:8443
    nf_type: UDM
    nf_instance_id: <uuid>
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/client.pem
      key_file: /path/to/client.key
    oauth2:
      enabled: true
      token_url: https://nrf.lab.local:8443/oauth2/token
      client_id: my-amf
      client_secret_env: AMF_OAUTH_SECRET

sbi-listen:
  protocol: sbi
  sbi:
    listen:
      addr: "127.0.0.1"
      port: 18443
    server:
      answer_timeout: 5s
      read_header_timeout: 30s`} />
<p><code>{`oauth2.client_secret_env`}</code> resolves the secret from an environment variable — never put secrets in YAML.</p>
<h2 id="rest-transport">REST transport</h2>
<p>Generic HTTP/2 for non-3GPP peers (FGP-admin, k8s API, internal management endpoints). Same shape as SBI but with no OpenAPI typed bodies — flow authors send arbitrary JSON via <code>{`message_body:`}</code>.</p>
<CodeBlock lang="yaml" code={`rest-out:
  protocol: rest
  rest:
    base_url: "http://127.0.0.1:18080"
    auth:
      type: bearer
      token_env: FGP_ADMIN_TOKEN

rest-listen:
  protocol: rest
  rest:
    listen:
      addr: "127.0.0.1"
      port: 18080
    server:
      answer_timeout: 5s`} />
<p>Auth <code>{`type:`}</code> values: <code>{`none`}</code>, <code>{`basic`}</code> (<code>{`username_env`}</code> + <code>{`password_env`}</code>), <code>{`bearer`}</code> (<code>{`token_env`}</code>), <code>{`api_key`}</code> (<code>{`header`}</code> + <code>{`value_env`}</code>).</p>
<h2 id="pfcp-transport">PFCP transport</h2>
<p>PFCP is UDP/8805 (3GPP TS 29.244). Conceptually NGAP-shaped (typed binary codec, per-session UE state) but on UDP rather than SCTP.</p>
<CodeBlock lang="yaml" code={`pfcp-out:
  protocol: pfcp
  pfcp:
    mode: client
    local: "0.0.0.0:0"
    peer:
      addr: "127.0.0.1"
      port: 18805
    node_id:
      type: ipv4
      value: "127.0.0.1"

pfcp-listen:
  protocol: pfcp
  pfcp:
    mode: server
    local: "127.0.0.1:18805"
    node_id:
      type: ipv4
      value: "127.0.0.1"`} />
<p><code>{`node_id.type`}</code>: <code>{`ipv4`}</code>, <code>{`ipv6`}</code>, <code>{`fqdn`}</code>. The node ID is what the binding advertises in <code>{`AssociationSetupRequest`}</code>/<code>{`Response`}</code> and other node-level messages.</p>
<h2 id="multi-nf-environments">Multi-NF environments</h2>
<p>A single env can declare every NF the daemon needs. Example: simulate a gNB pair plus an MME plus a remote UDM in one config (see <code>{`config/lab-multinf.yaml`}</code>).</p>
<CodeBlock lang="yaml" code={`nfs:
  - name: gnb-1
    role: gnb
    transport: ngap-out
    gnb: { ... }
  - name: mme-1
    role: mme
    transport: diameter-mme
  - name: udm-1
    role: udm
    transport: sbi-udm

transports:
  ngap-out: { protocol: ngap, ngap: { ... } }
  diameter-mme: { protocol: diameter, diameter: { ... } }
  sbi-udm: { protocol: sbi, sbi: { ... } }`} />
<p>Multi-protocol flows (<code>{`templates/multinf/`}</code>) drive multiple transports on a single UE — see <Link to="/guides/multi-protocol-flows">multi-protocol-flows</Link>.</p>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong><code>{`transport %q not found`}</code></strong> — an NF references a transport ID that isn't in <code>{`transports:`}</code>. Typo or stale ID.</p>
<p><strong><code>{`fsm %q references nf %q which is not declared`}</code></strong> — the flow's <code>{`nf:`}</code> field doesn't match any NF in the env. Either add an NF of that role or load the matching flow.</p>
<p><strong>Diameter peer hangs on CER</strong> — <code>{`destination_host`}</code> and <code>{`destination_realm`}</code> must match what the remote advertises in CEA. The shipped <code>{`lab-diameter.yaml`}</code> has comments showing what the remote-side <code>{`origin_host`}</code>/<code>{`origin_realm`}</code> need to be.</p>
<p><strong>Gx/Rx flows can't find AVPs</strong> — extend the embedded dictionary via <code>{`diameter_dictionary_path:`}</code> if the AMF/PCRF ships custom AVPs not in the upstream <code>{`fluxproto/diameter`}</code> set.</p>
    </DocPage>
  );
}
