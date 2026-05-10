import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Mermaid from '../../components/Mermaid';
import { Link } from 'react-router-dom';

export default function Environments() {
  return (
    <DocPage slug="concepts/environments" lede="An environment declares the network functions in scope and the wire-level transports they use. CLI runs load it from a YAML file; daemon runs store one row per env in the database. This page is the conceptual model — the exact field tables live in reference/config-schema.md.">
<h2 id="the-two-table-model">The two-table model</h2>
<p>Every env has exactly two top-level tables:</p>
<CodeBlock lang="yaml" code={`nfs:
  - name: GNBENF
    role: gnb
    plmn: { mcc: "901", mnc: "70" }
    transport: ngap-out
    gnb: { ... }

transports:
  ngap-out:
    protocol: ngap
    ngap: { ... }`} />
<ul>
<li><strong><code>{`nfs`}</code></strong> — what NFs exist, what role each one plays, which transport each one uses.</li>
<li><strong><code>{`transports`}</code></strong> — wire stacks, indexed by ID. Each one declares one protocol stack plus the local + peer details that protocol needs.</li>
</ul>
<p>NFs reference transports by ID. Multiple NFs can share a transport (two MMEs on one Diameter peer pool). Most labs use one NF per transport for clarity.</p>
<p>This split is deliberate. The same Diameter transport can serve multiple Diameter-side NFs without duplicating peer tables; the same gNB-properties block can pair with different NGAP transports across envs.</p>
<p>A typical multi-NF env, visualised — two gNBs sharing one NGAP transport, plus an MME on its own Diameter transport, plus a remote UDM on SBI:</p>
<Mermaid code={`flowchart LR
    subgraph NFs[" nfs: "]
        gnb1[gnb-1]
        gnb2[gnb-2]
        mme[mme-1]
        udm[udm-1]
    end

    subgraph Transports[" transports: "]
        T1[ngap-out<br/><span style='font-size:10px'>protocol: ngap</span>]
        T2[diameter-mme<br/><span style='font-size:10px'>protocol: diameter</span>]
        T3[sbi-udm<br/><span style='font-size:10px'>protocol: sbi</span>]
    end

    gnb1 --> T1
    gnb2 --> T1
    mme --> T2
    udm --> T3

    classDef nf fill:#1a1a1f,stroke:#3b82f6,stroke-width:1.5px,color:#ededf0
    classDef tr fill:#131217,stroke:#2a2a30,stroke-width:1px,color:#a1a1aa
    class gnb1,gnb2,mme,udm nf
    class T1,T2,T3 tr`} />
<h2 id="nf-roles">NF roles</h2>
<p>Twelve roles ship today, covering 5G core, 4G EPC, and a generic external escape hatch:</p>
<CodeBlock lang="" code={`5G core:    gnb, amf, smf, ausf, udm, pcf, nrf, upf
4G EPC:     mme, pgw, af
non-3GPP:   external`} />
<p>(The role enum is the source of truth — see <code>{`fpl/fsm/fsm.go`}</code>.)</p>
<p>Each shipped flow declares the role it simulates. The engine validates this against the env at startup: a flow with <code>{`nf: gnb`}</code> won't run against an env that declares no gNB. Mistakes fail fast at engine init, not mid-flow.</p>
<p><code>{`external`}</code> is the convention for non-3GPP peers — vendor admin APIs, k8s control planes, internal management endpoints. The shipped REST flows use it.</p>
<h2 id="role-specific-properties">Role-specific properties</h2>
<p>Two NFs need additional identity beyond name + transport:</p>
<p><strong>gNB</strong> carries the identity it advertises in NGSetupRequest:</p>
<CodeBlock lang="yaml" code={`gnb:
  global_id:
    plmn: { mcc: "901", mnc: "70" }
    gnb_id: "123456"
    bit_length: 24
  supported_tas: [ ... ]
  paging_drx: 32
  uplane: { ... }      # user-plane traffic generator config
  auto_reply:
    handover_request: true`} />
<p><strong>AMF</strong> carries the identity it advertises in NGSetupResponse:</p>
<CodeBlock lang="yaml" code={`amf:
  served_guami: { plmn, amf_region_id, amf_set_id, amf_pointer }
  relative_capacity: 100
  allowed_gnbs: [ ... ]   # empty = accept any gNB`} />
<p>Other roles (MME, UDM, AUSF, …) don't need a properties block — their identity is fully captured by the transport's protocol-specific config.</p>
<h2 id="transport-blocks-per-protocol">Transport blocks per protocol</h2>
<CodeBlock lang="yaml" code={`transports:
  <id>:
    protocol: ngap | diameter | sbi | rest | pfcp
    ngap: { ... }       # only when protocol: ngap
    diameter: { ... }   # only when protocol: diameter
    sbi: { ... }
    rest: { ... }
    pfcp: { ... }`} />
<p>Each protocol has its own sub-block.</p>
<ul>
<li><strong>NGAP</strong> — <code>{`mode: client | server`}</code>, <code>{`local_sctp`}</code>, <code>{`local_gtpu`}</code>, <code>{`peers: [{ address, port }]`}</code>.</li>
<li><strong>Diameter</strong> — RFC 6733 shape: a <code>{`local`}</code> identity, a <code>{`peers`}</code> table, a <code>{`routes`}</code> realm-based routing table.</li>
<li><strong>SBI</strong> — HTTP/2 client (<code>{`base_url`}</code>) or server (<code>{`listen.addr/port`}</code>) + optional <code>{`tls`}</code>, <code>{`oauth2`}</code>.</li>
<li><strong>REST</strong> — same shape as SBI without OpenAPI typed bodies + per-binding <code>{`auth: { type, token_env, … }`}</code>.</li>
<li><strong>PFCP</strong> — UDP/8805; <code>{`mode: client | server`}</code>, <code>{`local`}</code>, <code>{`peer`}</code>, <code>{`node_id`}</code>.</li>
</ul>
<p>Full field tables: <Link to="/reference/config-schema">reference/config-schema.md</Link>.</p>
<h2 id="validation-at-load">Validation at load</h2>
<p>When the engine loads an env, it cross-checks every NF reference:</p>
<ul>
<li>Every <code>{`nfs[].transport`}</code> must point to an existing <code>{`transports[]`}</code> ID.</li>
<li>Every transport's <code>{`protocol:`}</code> must match exactly one populated sub-block (e.g. <code>{`protocol: ngap`}</code> requires <code>{`ngap:`}</code> set; <code>{`diameter:`}</code> must be empty).</li>
<li>gNB-role NFs must have an NGAP transport. AMF-role NFs same.</li>
<li>A flow loaded against this env must have an NF of the role it declares.</li>
</ul>
<p>Failures fail-fast at startup, not mid-run. CLI prints the offending field and line.</p>
<h2 id="multi-nf-envs">Multi-NF envs</h2>
<p>A single env can declare every NF the daemon needs. Example: simulate two gNBs sharing one NGAP transport, plus an MME on Diameter, plus a remote UDM on SBI — see <code>{`config/lab-multinf.yaml`}</code>.</p>
<CodeBlock lang="yaml" code={`nfs:
  - { name: gnb-1, role: gnb,  transport: ngap-out,    gnb: {...} }
  - { name: gnb-2, role: gnb,  transport: ngap-out,    gnb: {...} }
  - { name: mme-1, role: mme,  transport: diameter-mme }
  - { name: udm-1, role: udm,  transport: sbi-udm }

transports:
  ngap-out:     { protocol: ngap,     ngap:     { ... } }
  diameter-mme: { protocol: diameter, diameter: { ... } }
  sbi-udm:      { protocol: sbi,      sbi:      { ... } }`} />
<p>Multi-protocol flows drive multiple transports on a single UE — see <Link to="/guides/multi-protocol-flows">Multi-protocol flows guide</Link>.</p>
<h2 id="where-envs-live-in-the-daemon">Where envs live in the daemon</h2>
<p>In CLI mode, the env is <code>{`-c &lt;file&gt;`}</code> — read once, discarded after the run. In daemon mode, envs are persisted as <code>{`EnvironmentEntity`}</code> rows in the DB and managed via the <code>{`/environments`}</code> REST endpoint or the web UI's Environments page. Schedules and on-demand <code>{`/execute`}</code> calls reference an env by UUID.</p>
<p>The same YAML schema in both modes — the daemon stores it as the body of an env row.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/guides/configuring-environments">Configuring environments guide</Link> — practical how-to with examples per protocol</li>
<li><Link to="/reference/config-schema">Config schema reference</Link> — exact field tables</li>
<li><Link to="/concepts/environments">Protocols and NF roles</Link> — which protocols pair which NFs</li>
</ul>
<p>fluxproto-light's protocol set spans five wire stacks across both 5G core and 4G EPC — chosen to cover the surfaces a 5G/4G test engineer actually needs to drive. This page lists the supported protocols, the NF roles that pair with each one, and which way the pairing typically runs.</p>
<h2 id="supported-protocols">Supported protocols</h2>
<table>
<thead><tr><th>Protocol</th><th>3GPP / IETF spec</th><th>Wire</th><th>Role-pair</th></tr></thead>
<tbody><tr><td>NGAP</td><td>3GPP TS 38.413</td><td>SCTP</td><td>gNB ↔ AMF</td></tr>
<tr><td>NAS-5GS</td><td>3GPP TS 24.501</td><td>tunneled in NGAP</td><td>UE ↔ AMF</td></tr>
<tr><td>Diameter base</td><td>IETF RFC 6733</td><td>SCTP / TCP</td><td>(peer to peer)</td></tr>
<tr><td>Diameter S6a</td><td>3GPP TS 29.272</td><td>over Diameter</td><td>MME ↔ HSS</td></tr>
<tr><td>Diameter Gx</td><td>3GPP TS 29.212</td><td>over Diameter</td><td>PGW ↔ PCRF</td></tr>
<tr><td>Diameter Rx</td><td>3GPP TS 29.214</td><td>over Diameter</td><td>AF ↔ PCRF</td></tr>
<tr><td>5GC SBI</td><td>3GPP TS 29.500-series</td><td>HTTP/2</td><td>NF service consumer ↔ NF service producer</td></tr>
<tr><td>REST</td><td>(vendor-specific)</td><td>HTTP/2</td><td>client ↔ vendor admin / k8s API / management API</td></tr>
<tr><td>PFCP</td><td>3GPP TS 29.244</td><td>UDP</td><td>SMF ↔ UPF</td></tr>
<tr><td>GTP-U</td><td>3GPP TS 29.281</td><td>UDP</td><td>gNB ↔ UPF (N3)</td></tr></tbody>
</table>
<h2 id="supported-nf-roles">Supported NF roles</h2>
<p><code>{`gnb`}</code>, <code>{`amf`}</code>, <code>{`smf`}</code>, <code>{`ausf`}</code>, <code>{`udm`}</code>, <code>{`pcf`}</code>, <code>{`nrf`}</code>, <code>{`upf`}</code>, <code>{`mme`}</code>, <code>{`pgw`}</code>, <code>{`af`}</code>, <code>{`external`}</code>. Each flow declares the role it simulates in its top-level <code>{`nf:`}</code> field; the engine validates that role against the env at startup so a gNB-side flow cannot run against an AMF-only env.</p>
<p><code>{`external`}</code> is the convention for non-3GPP peers (vendor admin APIs, internal control planes) — used by the shipped REST flows.</p>
<h2 id="which-protocol-pairs-which-nf">Which protocol pairs which NF</h2>
<Mermaid code={`graph LR
  subgraph 5G_core
    gNB((gNB))
    AMF((AMF))
    SMF((SMF))
    UPF((UPF))
    AUSF((AUSF))
    UDM((UDM))
    PCF((PCF))
    NRF((NRF))
  end
  subgraph 4G_EPC
    MME((MME))
    HSS((HSS))
    PGW((PGW))
    PCRF((PCRF))
    AF((AF))
  end
  Vendor((External))

  gNB ---|NGAP / NAS-5GS| AMF
  gNB ---|GTP-U N3| UPF
  SMF ---|PFCP N4| UPF
  AMF ---|SBI Namf| NRF
  AMF ---|SBI Nausf| AUSF
  AMF ---|SBI Nudm| UDM
  AUSF ---|SBI Nudm| UDM
  SMF ---|SBI Nudm| UDM
  PCF ---|SBI Npcf| AMF
  MME ---|S6a / Diameter| HSS
  PGW ---|Gx / Diameter| PCRF
  AF ---|Rx / Diameter| PCRF
  Vendor ---|REST HTTP/2| Vendor`} />
<h2 id="ngap-and-nas-5gs">NGAP and NAS-5GS</h2>
<p>NGAP (3GPP TS 38.413) is the N2 control-plane protocol between gNB and AMF, riding SCTP. NAS-5GS (3GPP TS 24.501) is the per-UE NAS layer that NGAP transports — it isn't a separate transport but appears as a payload field inside many NGAP messages (<code>{`InitialUEMessage.NasPdu`}</code>, <code>{`NASDownlinkTransport.NasPdu`}</code>, etc.). fluxproto-light models inner NAS messages as dotted event names — a NAS Authentication Request riding inside <code>{`NASDownlinkTransport`}</code> surfaces as the event <code>{`NASDownlinkTransport.AuthenticationRequest`}</code>.</p>
<p>The NGAP NF pair is gNB ↔ AMF in either direction. Most shipped flows are gNB-side (client mode against an AMF); the <code>{`registration_amf`}</code> flow is the AMF-side server-mode counterpart.</p>
<h2 id="diameter-three-application-ids-four-nf-pairings">Diameter — three application IDs, four NF pairings</h2>
<p>Diameter base (RFC 6733) is the framing and peer state machine. Three application IDs the tool ships enrichers for:</p>
<ul>
<li><strong>S6a (16777251, 3GPP TS 29.272)</strong> — MME ↔ HSS. Authentication, location updates, subscriber profile fetch.</li>
<li><strong>Gx (16777238, 3GPP TS 29.212)</strong> — PGW ↔ PCRF. Policy and charging rules.</li>
<li><strong>Rx (16777236, 3GPP TS 29.214)</strong> — AF ↔ PCRF. Application-function-driven policy authorisation.</li>
</ul>
<p>The MME, PGW, AF, HSS, and PCRF nodes are all reached via Diameter; the env's NF <code>{`role:`}</code> distinguishes who's which side of the peer pair.</p>
<p><code>{`fgp`}</code> (a separate dflux project) acts as the canonical responder for all three apps in shipped Diameter flows; the lab YAMLs <code>{`lab-diameter.yaml`}</code>, <code>{`lab-diameter-gx.yaml`}</code>, <code>{`lab-diameter-rx.yaml`}</code>, <code>{`lab-diameter-multiapp.yaml`}</code>, <code>{`lab-diameter-responder.yaml`}</code>, <code>{`lab-fgp.yaml`}</code> cover the canonical setups.</p>
<h2 id="sbi-service-based-interfaces">SBI — service-based interfaces</h2>
<p>5GC SBI (3GPP TS 29.500-series) is HTTP/2 with JSON bodies, with services named <code>{`Nudm_*`}</code>, <code>{`Nausf_*`}</code>, <code>{`Namf_*`}</code>, <code>{`Npcf_*`}</code>, etc. Every NF runs both as a service producer (server) and as a service consumer (client) for different services. The shipped enrichers cover:</p>
<ul>
<li><code>{`Nudm_SDM_GetSubscriptionData`}</code>, <code>{`Nudm_UEAuthentication_GetAuthData`}</code> (UDM as producer)</li>
<li><code>{`Nausf_UEAuthentication_Authenticate`}</code> (AUSF as producer)</li>
<li><code>{`Namf_Communication_N1N2MessageTransfer`}</code> (AMF as producer)</li>
</ul>
<p>Each enricher has a matching <code>{`*_Answer`}</code> form for server-mode flows. SBI client and server flows pair by message label — a <code>{`nudm_sdm_get_client`}</code> flow and a <code>{`nudm_sdm_get_server`}</code> flow loopback through localhost h2c in the shipped <code>{`lab-sbi.yaml`}</code>.</p>
<h2 id="rest-non-3gpp-peers">REST — non-3GPP peers</h2>
<p>REST is generic HTTP/2 with arbitrary JSON bodies. The flow author declares the message label inline; one shipped enricher (<code>{`EnrichRESTGeneric`}</code>) sends/receives the JSON body verbatim. Used for vendor admin APIs (FGP-admin, k8s API, internal management endpoints) — anything that isn't a 3GPP NF and doesn't fit the SBI typed-bodies model.</p>
<p>The role for REST NFs is <code>{`external`}</code> by convention — REST role-validation accepts any role, but <code>{`external`}</code> keeps the role enum honest.</p>
<h2 id="pfcp-and-gtp-u-split-user-plane">PFCP and GTP-U — split user-plane</h2>
<p>PFCP (3GPP TS 29.244) is the SMF ↔ UPF control protocol on N4 (UDP/8805). GTP-U (3GPP TS 29.281) is the per-PDU-session N3 user-plane tunnel between gNB and UPF.</p>
<p>PFCP is conceptually NGAP-shaped (typed binary codec, per-message Go enrichers, per-session UE state) but rides UDP rather than SCTP. The application-layer association handshake happens via the <code>{`AssociationSetupRequest`}</code>/<code>{`Response`}</code> message pair.</p>
<p>GTP-U doesn't have flow-author-driven enrichers — it's terminated by the user-plane backends (<code>{`uspace`}</code> or <code>{`dpdk`}</code>, see <Link to="/concepts/user-plane">user-plane</Link>). The <code>{`uplane_start`}</code> action arms the gNB-side traffic generator after a PDU session is established; the receiver side is a separate <code>{`fluxproto-light server`}</code> invocation.</p>
<h2 id="which-protocol-fits-which-test">Which protocol fits which test</h2>
<p>A few rules of thumb:</p>
<ul>
<li><strong>5G UE registration / PDU session lifecycle / handover</strong> — NGAP gNB-side (and NAS5G as nested events).</li>
<li><strong>5GC AMF/AUSF/UDM service interactions</strong> — SBI; pair a client and server flow for self-loop tests.</li>
<li><strong>4G EPC subscriber profile lookups</strong> — Diameter S6a MME-side.</li>
<li><strong>Policy and charging rules</strong> — Diameter Gx (PGW-side) and Rx (AF-side).</li>
<li><strong>PCC rule lifecycle on a vendor admin plane</strong> — REST against the vendor's admin API.</li>
<li><strong>SMF/UPF session lifecycle</strong> — PFCP (and the FGP project for the UPF responder side).</li>
<li><strong>GTP-U throughput / latency / drop</strong> — <code>{`server uspace`}</code> or <code>{`server dpdk`}</code> plus the <code>{`uplane_traffic`}</code> flow on the gNB side.</li>
</ul>
<p>A multi-protocol flow (<code>{`templates/multinf/ngap_plus_diameter.yaml`}</code>) drives more than one of these on the same UE — useful when correctness depends on cross-protocol ordering on a single UE.</p>
    </DocPage>
  );
}
