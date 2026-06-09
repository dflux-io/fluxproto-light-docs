import { Link } from 'react-router-dom';
import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';

export default function MultiProtocolFlows() {
  return (
    <DocPage slug="guides/multi-protocol-flows" lede="A multi-protocol flow drives more than one wire protocol from a single FSM on a single UE. Use it to model end-to-end procedures that span the radio plane and the policy plane simultaneously — for example, attaching a UE on NGAP while an MME concurrently fetches subscription data over S6a Diameter. This guide covers when to reach for multi-protocol flows, how to wire them up in YAML, and how to configure the environment so each protocol's transport is reachable.">
<h2 id="when-to-use-one">When to use one</h2>
<p>Most flows are single-protocol: NGAP gNB-side, Diameter S6a MME-side, SBI client/server. Reach for a multi-protocol flow when the test really needs cross-protocol semantics on one UE — when correctness depends on the order of arrivals across protocols, or when one UE's state evolves under inputs from multiple protocols.</p>
<p>The shipped reference is <code>{`multinf/ngap_plus_diameter.yaml`}</code> (flow name <code>{`multinf_ngap_plus_diameter`}</code>) — the gNB starts NGAP registration <em>and</em> an MME-side S6a <code>{`ULR`}</code> in the same transition, then waits for either response to land first and continues only when both have echoed back. Read the full, un-elided flow in the <a href="https://github.com/dflux-io/fluxproto-light-templates/blob/main/multinf/ngap_plus_diameter.yaml">templates repository</a>.</p>
<p>The engine resolves <code>{`-flow`}</code> by name, not by path, so invoke the reference with its flow name:</p>
<CodeBlock lang="bash" code={`fluxproto-light run-flow \\
  -c config/lab-multinf.yaml \\
  -s config/subscribers.yaml \\
  -flow multinf_ngap_plus_diameter \\
  -templates ./templates \\
  -trace`} />
<h2 id="anatomy-of-a-multi-protocol-transition">Anatomy of a multi-protocol transition</h2>
<CodeBlock lang="yaml" code={`states:
  idle:
    transitions:
      - event: Start
        target: wait_first
        actions:
          # NGAP send — protocol resolved from the enricher registry.
          - type: send
            message: InitialUEMessage
            message_body: |
              { "criticality": 1, "rrc_establishment_cause": 0, "ue_context_request": 1 }

          # Diameter send — explicit protocol override on the same burst.
          - type: send
            protocol: diameter
            message: ULR`} />
<p>The action executor groups frames by protocol and posts each group to <code>{`&lt;protocol&gt;.tx.enrich`}</code> on the bus, so both sends fan out to their respective transports in parallel.</p>
<p>The flow's top-level <code>{`protocol:`}</code> and <code>{`nf:`}</code> declare the <em>primary</em> protocol — the one the FSM uses for inbound demux, and the NF the UE attaches to. Cross-protocol sends override per-action via <code>{`protocol:`}</code>. UE state (subscriber, ContextID) is shared — both protocol pipelines see the same <code>{`ue.*`}</code> fields.</p>
<h2 id="routing-inbound-events">Routing inbound events</h2>
<p>Each protocol's RX pipeline emits events into the bus tagged with the protocol. The FSM's <code>{`event:`}</code> clause can match either bare names (<code>{`ULA`}</code>) or protocol-prefixed names (<code>{`diameter.ULA`}</code>); the matcher strips one leading prefix on either side. The recognized prefixes are <code>{`ngap.`}</code>, <code>{`diameter.`}</code>, and <code>{`sbi.`}</code> — any other prefix is left intact and matched literally. Use the prefixed form when the same suffix is ambiguous across protocols:</p>
<CodeBlock lang="yaml" code={`wait_first:
  on_timeout: { duration: 10s, target: failed }
  transitions:
    - event: ngap.NASDownlinkTransport.AuthenticationRequest
      target: wait_diameter_only
    - event: diameter.ULA
      target: wait_ngap_only
      actions:
        - type: check
          field: Result-Code
          op: equals
          expected: 2001`} />
<h2 id="sharing-ue-state">Sharing UE state</h2>
<p>Both pipelines see one UE per execution. Examples of cross-protocol state sharing already in the shipped flows:</p>
<ul>
<li>The Diameter S6a User-Name AVP populates from the UE's IMSI, which the NGAP NAS pipeline also consumes.</li>
<li>A <code>{`check`}</code> on <code>{`Result-Code`}</code> in a Diameter-side transition reads off the most recent inbound Diameter message; the NGAP pipeline doesn't see it.</li>
<li>An <code>{`extract`}</code> action stores into <code>{`ue.Params[&lt;key&gt;]`}</code>, which any later <code>{`send`}</code> from any protocol can reference via <code>{`{{ue.Params.&lt;key&gt;}}`}</code>.</li>
</ul>
<h2 id="configuring-the-environment">Configuring the environment</h2>
<p>A multi-protocol flow needs the environment to declare every transport it touches. Use <code>{`config/lab-multinf.yaml`}</code> as the starting point — the excerpt below shows the two NFs this flow exercises:</p>
<CodeBlock lang="yaml" code={`nfs:
  - name: gnb-1
    role: gnb
    transport: ngap-out
    gnb: { ... }

  - name: mme-1
    role: mme
    transport: diameter-mme

transports:
  ngap-out:
    protocol: ngap
    ngap: { mode: client, local_sctp: "0.0.0.0:0", peers: [...] }

  diameter-mme:
    protocol: diameter
    diameter: { local: { ... }, peers: [...], routes: [...] }`} />
<p>Two NFs (<code>{`gnb-1`}</code>, <code>{`mme-1`}</code>) on two transports — one NGAP client, one Diameter S6a peer. The flow's primary <code>{`nf: gnb`}</code> matches <code>{`gnb-1`}</code>; the per-action <code>{`protocol: diameter`}</code> send routes through whichever NF in the environment has a Diameter transport. The full <code>{`config/lab-multinf.yaml`}</code> also declares a second gNB (<code>{`gnb-2`}</code>, sharing <code>{`ngap-out`}</code>) and a SBI UDM (<code>{`udm-1`}</code>); this flow ignores both.</p>
<p>If your environment declares more than one NF per protocol (e.g. two MMEs on two different Diameter transports), use <code>{`peer:`}</code> on the action to disambiguate:</p>
<CodeBlock lang="yaml" code={`- type: send
  protocol: diameter
  peer: mme-2          # routes to the diameter transport mme-2 references
  message: ULR`} />
<h2 id="ordering-and-timing">Ordering and timing</h2>
<p>The action executor dispatches sends concurrently — both protocol pipelines start enriching at the same time. The order in which messages hit the wire depends on each protocol's own latency. The FSM tolerates either response landing first by branching at <code>{`wait_first`}</code> into <code>{`wait_ngap_only`}</code> or <code>{`wait_diameter_only`}</code>.</p>
<p>If your test requires strict ordering, drive sends sequentially across multiple transitions instead of bundling them into one.</p>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong>Send dispatched on the wrong transport</strong> — check the action's <code>{`protocol:`}</code> field. Without it, the dispatcher uses the enricher's registered protocol (every shipped enricher is registered to exactly one protocol).</p>
<p><strong><code>{`event %q didn&#39;t match any transition`}</code> for a Diameter message</strong> — the matcher strips one prefix on either side. <code>{`event: diameter.ULA`}</code> matches a bus event of either <code>{`diameter.ULA`}</code> or <code>{`ULA`}</code>; mismatched casing or a typo in the event name won't match.</p>
<p><strong>Cross-protocol race makes the test flaky</strong> — split the burst into separate transitions so each protocol's response lands before the next send fires. Acceptable when you don't actually need true concurrency — most cross-protocol tests don't.</p>
<p><strong>One protocol's transport fails to start</strong> — environment validation catches missing <code>{`transports:`}</code> blocks, but a bad peer address fails at first dial. Run <code>{`fluxproto-light check -c <env>`}</code> to surface every transport's reachability before launching the flow.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/concepts/flows">Flows</Link> — how a single-protocol FSM is structured, before you span two.</li>
<li><Link to="/guides/configuring-environments">Configuring environments</Link> — full NF and transport reference for the YAML above.</li>
<li><Link to="/reference/flow-schema">Flow schema</Link> — every action and transition field, including <code>{`protocol:`}</code> and <code>{`peer:`}</code>.</li>
</ul>
    </DocPage>
  );
}
