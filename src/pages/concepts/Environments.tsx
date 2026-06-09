import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Mermaid from '../../components/Mermaid';
import { Link } from 'react-router-dom';

export default function Environments() {
  return (
    <DocPage slug="concepts/environments" lede="An environment is the model of the network the engine drives against: which network functions are in scope, and the wire-level transports they speak over. This page covers the conceptual shape — the two-table layout, NF roles, and how the engine validates a flow against it.">
<h2 id="the-two-table-model">The two-table model</h2>
<p>Every environment has exactly two top-level tables:</p>
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
<p>This split is deliberate. The same Diameter transport can serve multiple Diameter-side NFs without duplicating peer tables; the same gNB-properties block can pair with different NGAP transports across environments.</p>
<p>A typical multi-NF environment, visualised — two gNBs sharing one NGAP transport, plus an MME on its own Diameter transport, plus a remote UDM on SBI:</p>
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
<p>Thirteen roles ship today, covering 5G core, 4G EPC, and a generic external escape hatch:</p>
<CodeBlock lang="" code={`5G core:    gnb, amf, smf, ausf, udm, pcf, nrf, upf
4G EPC:     mme, pgw, af, pcrf
non-3GPP:   external`} />
<p>Each shipped flow declares the role it simulates. The engine validates this against the environment at startup: a flow with <code>{`nf: gnb`}</code> won't run against an environment that declares no gNB. Mistakes fail fast at engine init, not mid-flow.</p>
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
<p>Other roles (MME, UDM, AUSF, PCRF, …) don't need a properties block — their identity is fully captured by the transport's protocol-specific config.</p>
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
<p>Full field tables live in the <Link to="/reference/config-schema">Environment schema</Link> reference.</p>
<h2 id="validation-at-load">Validation at load</h2>
<p>When the engine loads an environment, it cross-checks every NF reference:</p>
<ul>
<li>Every <code>{`nfs[].transport`}</code> must point to an existing <code>{`transports[]`}</code> ID.</li>
<li>Every transport's <code>{`protocol:`}</code> must match exactly one populated sub-block (e.g. <code>{`protocol: ngap`}</code> requires <code>{`ngap:`}</code> set; <code>{`diameter:`}</code> must be empty).</li>
<li>gNB-role NFs must have an NGAP transport. AMF-role NFs same.</li>
<li>A flow loaded against this environment must have an NF of the role it declares.</li>
</ul>
<p>Failures fail-fast at startup, not mid-run. CLI prints the offending field and line.</p>
<h2 id="multi-nf-envs">Multi-NF environments</h2>
<p>A single environment can declare every NF the daemon needs. Example: simulate two gNBs sharing one NGAP transport, plus an MME on Diameter, plus a remote UDM on SBI — see <code>{`config/lab-multinf.yaml`}</code>.</p>
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
<h2 id="where-envs-live-in-the-daemon">Where environments live in the daemon</h2>
<p>In CLI mode, the environment is <code>{`-c &lt;file&gt;`}</code> — read once, discarded after the run. In daemon mode, environments are persisted as <code>{`EnvironmentEntity`}</code> rows in the database and managed via the <code>{`/environments`}</code> REST endpoint or the web UI's Environments page. Schedules and on-demand <code>{`/execute`}</code> calls reference an environment by UUID.</p>
<p>The same YAML schema applies in both modes — the daemon stores it as the body of an environment row.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/guides/configuring-environments">Configuring environments guide</Link> — practical how-to with examples per protocol</li>
<li><Link to="/reference/config-schema">Environment schema</Link> — exact field tables for every transport and role</li>
<li><Link to="/concepts/subscribers">Subscribers</Link> — how UEs attach to the NFs an environment declares</li>
<li><a href="https://github.com/dflux-io/fluxproto-light-templates" target="_blank" rel="noreferrer">Templates repository</a> — the shipped flows and lab environments referenced above; see the <Link to="/reference/catalogs">flow &amp; suite catalog</Link> for the full list</li>
</ul>
    </DocPage>
  );
}
