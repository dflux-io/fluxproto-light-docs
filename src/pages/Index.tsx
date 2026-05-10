import DocPage from '../components/DocPage';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <DocPage slug="">
<h1>fluxproto-light documentation</h1>
<p>5G/4G protocol load and conformance tester for AMF, HSS, UDM, SMF/UPF, and vendor admin APIs. One Go binary that drives NGAP, Diameter, SBI, REST, and PFCP from declarative YAML flow definitions.</p>
<p>Latest release: <Link to="/release-notes/20260509-1822-2148cf89">20260509-1822-2148cf89</Link>. See <Link to="/release-notes/index">release-notes/index.md</Link> for the full history.</p>
<h2 id="introduction">Introduction</h2>
<p>Start here if you're new.</p>
<ul>
<li><Link to="/introduction">What is fluxproto-light</Link> — product overview, what ships, what it's not.</li>
<li><Link to="/introduction">Why fluxproto-light</Link> — when to pick it, what it replaces.</li>
<li><Link to="/introduction/quickstart">Quickstart</Link> — build, run a flow, read a report. About 10 minutes.</li>
</ul>
<h2 id="concepts">Concepts</h2>
<p>The mental model behind the tool. Read these in order if you have time, otherwise skim and refer.</p>
<ul>
<li><Link to="/concepts/architecture">Concepts overview</Link> — entry to the section.</li>
<li><Link to="/concepts/architecture">Architecture</Link> — where fluxproto-light sits, CLI vs daemon.</li>
<li><Link to="/concepts/flows">Flows</Link> — what a flow is, why state machines.</li>
<li><Link to="/concepts/flows">States and transitions</Link> — building blocks.</li>
<li><Link to="/concepts/flows">Actions</Link> — <code>{`send`}</code>, <code>{`check`}</code>, <code>{`extract`}</code>, <code>{`uplane_start`}</code>.</li>
<li><Link to="/concepts/suites">Suites</Link> — composing flows.</li>
<li><Link to="/concepts/environments">Environments and NFs</Link> — the env model.</li>
<li><Link to="/concepts/environments">Protocols and NF roles</Link> — which protocols pair which NFs.</li>
<li><Link to="/concepts/user-plane">User plane</Link> — why GTP-U testing is its own subsystem.</li>
</ul>
<h2 id="tutorials">Tutorials</h2>
<p>Step-by-step walk-throughs. Each leaves you with something working.</p>
<ul>
<li><Link to="/tutorials/first-yaml-flow">Your first YAML flow</Link> — copy a template, edit a transition, run the change.</li>
<li><Link to="/tutorials/first-server-flow">Your first server-mode flow</Link> — run AMF + gNB processes against each other.</li>
</ul>
<h2 id="guides">Guides</h2>
<p>Recipes for everyday tasks.</p>
<ul>
<li><Link to="/guides/writing">Writing flows</Link> — flow YAML anatomy in depth.</li>
<li><Link to="/guides/writing">Writing suites</Link> — composing into ordered runs.</li>
<li><Link to="/guides/configuring-environments">Configuring environments</Link> — <code>{`nfs:`}</code> and <code>{`transports:`}</code> for every protocol.</li>
<li><Link to="/guides/running">Running flows</Link> — <code>{`run-flow`}</code>, workload knobs, output formats.</li>
<li><Link to="/guides/running">Running suites</Link> — <code>{`run-suite`}</code>, suite reports.</li>
<li><Link to="/guides/daemon">Daemon mode</Link> — HTTP API, login, JWT, web UI.</li>
<li><Link to="/guides/daemon">Scheduling jobs</Link> — cron-style schedules.</li>
<li><Link to="/guides/user-plane-testing">User-plane testing</Link> — <code>{`server uspace`}</code> and <code>{`server dpdk`}</code>.</li>
<li><Link to="/guides/subscribers">Subscribers</Link> — provision, generate, list.</li>
<li><Link to="/guides/multi-protocol-flows">Multi-protocol flows</Link> — interleave NGAP, Diameter, SBI on one UE.</li>
<li><Link to="/guides/ci-integration">CI integration</Link> — exit codes, JSON, GitHub Actions / GitLab CI examples.</li>
</ul>
<h2 id="reference">Reference</h2>
<p>Authoritative schemas and catalogs.</p>
<ul>
<li><Link to="/reference/cli">CLI</Link> — every subcommand and flag.</li>
<li><Link to="/reference/flow-schema">Flow schema</Link> — every field of a flow YAML.</li>
<li><Link to="/reference/suite-schema">Suite schema</Link> — every field of a suite YAML.</li>
<li><Link to="/reference/config-schema">Config schema</Link> — every field of a lab YAML.</li>
<li><Link to="/reference/catalogs">Flow catalog</Link> — every shipped flow.</li>
<li><Link to="/reference/catalogs">Suite catalog</Link> — every shipped suite.</li>
<li><Link to="/reference/metrics">Metrics</Link> — every Prometheus metric on <code>{`/metrics`}</code>.</li>
</ul>
<h2 id="api">API</h2>
<p>The daemon's REST surface, broken out per resource.</p>
<ul>
<li><Link to="/api/overview">Overview</Link> — auth, errors, conventions.</li>
<li><Link to="/api/overview">Authentication</Link> — login, change-password, me.</li>
<li><Link to="/api/users">Users</Link> — admin-only CRUD.</li>
<li><Link to="/api/flows">Flows</Link> — built-in + custom catalog operations.</li>
<li><Link to="/api/environments">Environments</Link> — stored env configs.</li>
<li><Link to="/api/executions">Executions</Link> — <code>{`/execute`}</code>, queue, cancel.</li>
<li><Link to="/api/executions">Reports</Link> — list + detail; the same JSON <code>{`run-flow`}</code> emits.</li>
<li><Link to="/api/schedules">Schedules</Link> — cron + once + run-now.</li>
<li><Link to="/api/subscribers">Subscribers</Link> — pool stats, CRUD, bulk import.</li>
<li><Link to="/api/settings">Settings</Link> — runtime tuning.</li>
<li><Link to="/api/overview">Transport check</Link> — connectivity probe.</li>
</ul>
<h2 id="glossary">Glossary</h2>
<ul>
<li><Link to="/glossary">Glossary</Link> — product-specific terms.</li>
</ul>
    </DocPage>
  );
}
