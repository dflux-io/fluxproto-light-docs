import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';
import Mermaid from '../../components/Mermaid';
import { Link } from 'react-router-dom';

export default function Subscribers() {
  return (
    <DocPage slug="concepts/subscribers" lede="A subscriber is a reusable UE identity — SUPI, key material, sequence number — that flows draw from a shared pool across NGAP, Diameter S6a, and SBI.">

<h2 id="what-a-subscriber-is">What a subscriber is</h2>
<p>A subscriber is a first-class object in the model: one stored UE identity, plus the cryptographic material a core needs to authenticate it. It is not tied to a single flow or protocol. The same subscriber row drives a 5G registration over NGAP, an authentication-information request over Diameter S6a, and a Nudm or Nausf call over SBI. You define subscribers once; flows reference them at run time.</p>
<p>This separation matters because most procedures need a real identity to be meaningful. A registration flow has to present a SUPI the simulated core recognizes; an authentication exchange has to derive the right response from the right key and sequence number. Keeping that identity in one place — instead of baking it into each flow — lets you point the same flow catalog at different identity sets without editing a line of YAML.</p>

<h2 id="the-fields">The fields</h2>
<p>A subscriber carries three groups of fields: identity, authentication material, and serving-network context. Here is a single entry as it appears in a subscribers YAML file.</p>
<CodeBlock lang="yaml" code={`config:
  mcc: "901"
  mnc: "070"
  snn: 5G:mnc070.mcc901.3gppnetwork.org

subscribers:
  - supi: "imsi-901-70-0000000001"
    imsi: "901700000000001"
    key: "465B5CE8B199B49FAA5F0A2EE238A6BC"
    opc: "E8ED289DEBA952E4283B54E88E6183CA"
    sqn: "000000000000"
    snn: "5G:mnc070.mcc901.3gppnetwork.org"
    ciphering: "NEA0"
    integrity: "NIA2"`} />

<h3 id="identity">Identity</h3>
<p>The identity fields name the UE on the wire.</p>
<ul>
<li><code>{`supi`}</code> — the Subscription Permanent Identifier, in IMSI form <code>{`imsi-MCC-MNC-MSIN`}</code>. This is the only identity field you must supply; the engine parses it to derive MCC, MNC, MSIN, and IMSI. Anything else is rejected with an <code>{`expected imsi-MCC-MNC-MSIN`}</code> error.</li>
<li><code>{`imsi`}</code> — the 15-digit IMSI (MCC + MNC + MSIN). Diameter flows read this directly for the User-Name AVP on S6a; when an entry carries no IMSI, the engine falls back to a UE-stable synthetic identifier so load runs still produce a unique identity per UE.</li>
<li>MCC, MNC, MSIN, SUCI, and IMSISV are also part of the model. MCC, MNC, and MSIN are derived from the SUPI; the rest are optional.</li>
</ul>

<h3 id="auth-material">Authentication material</h3>
<p>These fields let the engine answer an authentication challenge the way a real UE would.</p>
<ul>
<li><code>{`key`}</code> — the permanent subscriber key K, a 32-character hex string. Stored on the model as <code>{`ki`}</code>. Required.</li>
<li><code>{`opc`}</code> — the operator-variant algorithm configuration field for Milenage, also 32-character hex. Required. (If your provisioning uses the operator key OP instead of the derived OPc, the model carries an <code>{`op`}</code> field as well.)</li>
<li><code>{`sqn`}</code> — the authentication sequence number, 12-character hex. Optional; defaults to <code>{`000000000000`}</code>.</li>
</ul>

<h3 id="serving-network">Serving-network context</h3>
<p>These fields describe the network the UE belongs to and the security algorithms it negotiates.</p>
<ul>
<li><code>{`snn`}</code> — the Serving Network Name, used in 5G key derivation. Inherited from the top-level <code>{`config.snn`}</code> when an entry omits it.</li>
<li><code>{`ciphering`}</code> — the NAS ciphering algorithm, one of <code>{`NEA0`}</code> through <code>{`NEA3`}</code>. Defaults to <code>{`NEA0`}</code>.</li>
<li><code>{`integrity`}</code> — the NAS integrity algorithm, one of <code>{`NIA0`}</code> through <code>{`NIA3`}</code>. Defaults to <code>{`NIA2`}</code>.</li>
</ul>
<p>The top-level <code>{`config`}</code> block sets <code>{`mcc`}</code>, <code>{`mnc`}</code>, and <code>{`snn`}</code> defaults that apply to every entry below it, so a homogeneous set stays compact.</p>

<Callout type="note">
The test keys above (K and OPc from the 3GPP test vectors) are safe to commit and reuse. Real network keys are secrets — keep them out of version control and out of shared environments.
</Callout>

<h2 id="the-pool">The subscriber pool</h2>
<p>At run time, subscribers live in a shared pool. The pool is the contention point that lets many concurrent UEs run against a finite identity set without two of them claiming the same identity.</p>
<p>Each subscriber row has a lock. When a flow needs an identity for a UE, it acquires the first unlocked subscriber and stamps the lock with that UE's context ID and the execution ID of the run. While the lock is held, no other UE — in this run or a concurrent one sharing the same database — can take that subscriber. When the UE finishes, the lock is released and the subscriber returns to the pool.</p>

<Mermaid code={`flowchart LR
    subgraph Pool["Subscriber pool"]
      S1["subscriber 1<br/>free"]
      S2["subscriber 2<br/>locked → UE-a"]
      S3["subscriber 3<br/>locked → UE-b"]
      S4["subscriber 4<br/>free"]
    end
    UEa["UE-a"] -->|holds| S2
    UEb["UE-b"] -->|holds| S3
    UEc["UE-c"] -.->|waiting| Pool`} />

<p>The pool blocks rather than fails when it is empty. If every subscriber is locked, an acquiring UE waits in a first-in-first-out queue until one is released or its acquire timeout elapses. This gives a run with more UEs than subscribers a natural back-pressure: UEs proceed in waves as identities free up, instead of erroring out. You can watch the live state — total, locked, free, and waiting counts — through the daemon's subscriber pool endpoint.</p>

<h2 id="how-flows-draw">How flows draw a subscriber</h2>
<p>A flow does not name a specific subscriber. The engine binds one to each UE as the UE spawns, then every action in that flow reads identity from the bound subscriber:</p>
<ul>
<li>NGAP and NAS actions take the SUPI, K, OPc, SQN, and algorithm fields to build registration and authentication messages.</li>
<li>Diameter S6a actions take the IMSI for the User-Name AVP.</li>
<li>SBI actions take the SUPI in <code>{`imsi-<digits>`}</code> form for the request path and body.</li>
</ul>
<p>Whether a flow draws a subscriber at all depends on the procedure. UE-associated flows — registration, PDU session establishment, authentication — each pull one identity per UE. Flows that are not bound to a UE, such as an NG setup between a gNB and an AMF, skip acquisition entirely, so they never block on an empty pool.</p>
<p>There is also a pool-free mode for pure load testing. With <code>{`-gen-subscriber`}</code>, the engine synthesizes a fresh identity per UE in memory from the active network function's PLMN — no database, no pool, no release. Use it when you need thousands of distinct UEs and do not care about the specific identities.</p>

<h2 id="model-vs-recipe">Model versus recipe</h2>
<p>This page describes <em>what</em> a subscriber is and how flows consume it. It does not cover <em>how</em> to populate the pool. Generating identity sets, importing a YAML file, provisioning into the database, and inspecting or clearing the pool are operational steps — they live in the how-to guide. The field-by-field grammar of the subscribers YAML file is in the reference.</p>
<ul>
<li><Link to="/guides/subscribers">Managing subscribers</Link> — generate, import, provision, and inspect the pool.</li>
<li><Link to="/reference/config-schema">Environment schema</Link> — how a flow run is wired to a database and a network function role, which together determine the pool a flow draws from.</li>
</ul>

<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/guides/subscribers">Managing subscribers</Link> — the recipe for filling and maintaining the pool.</li>
<li><Link to="/concepts/flows">Flows</Link> — how a flow binds a subscriber to each UE it spawns.</li>
</ul>

    </DocPage>
  );
}
