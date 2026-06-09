import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';
import { Link } from 'react-router-dom';

export default function CiIntegration() {
  return (
    <DocPage slug="guides/ci-integration" lede="fluxproto-light gates CI pipelines with a deterministic exit code and no interactive prompts. This guide covers exit-code semantics, the two gating models (CLI exit code vs. JSON over the daemon API), useful flags, and snippet templates for GitHub Actions and GitLab CI.">
<h2 id="two-gating-models">Two ways to gate a pipeline</h2>
<p>There are two distinct ways to turn a run into a pass/fail signal, and they reach the result differently:</p>
<ul>
<li><strong>Exit code from the CLI.</strong> <code>{`run-flow`}</code> and <code>{`run-suite`}</code> exit non-zero when any check fails. This is the simplest gate and needs no parsing.</li>
<li><strong>JSON from the daemon API.</strong> The CLI prints only a human-readable table — it has no JSON output mode. To gate on individual fields (latency, per-check diagnostics), drive a long-lived <Link to="/guides/daemon">daemon</Link> over its REST API, which returns the structured report. See <a href="#daemon-driven-ci">Daemon-driven CI</a>.</li>
</ul>
<Callout type="note">For most pipelines the exit code is enough. Reach for the daemon API only when you need to assert on specific report fields, not just overall pass/fail.</Callout>
<h2 id="exit-codes">Exit codes</h2>
<p>Two outcomes:</p>
<table>
<thead><tr><th>Exit code</th><th>Meaning</th></tr></thead>
<tbody><tr><td><code>{`0`}</code></td><td>Every check passed; every UE reached a passing terminal state</td></tr>
<tr><td><code>{`1`}</code></td><td>One or more check failures, or the engine returned an error</td></tr></tbody>
</table>
<p><code>{`run-flow`}</code> and <code>{`run-suite`}</code> both follow this contract: they print the result table, then exit <code>{`1`}</code> if the run did not fully pass. <code>{`subscriber generate`}</code> and <code>{`subscriber provision`}</code> exit non-zero on failure too. <code>{`flow list`}</code>, <code>{`suite list`}</code>, and <code>{`report list`}</code> exit <code>{`0`}</code> regardless of catalog content — their job is to print, not to assert.</p>
<p>A minimal CLI gate needs nothing more than the exit code:</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-flow \\
    -flow registration \\
    -templates templates \\
    -c config/lab.yaml \\
    -s config/subscribers.yaml \\
    -repetitions 5 \\
    -rate 1
# exits 0 on full pass, 1 on any check failure`} />
<h2 id="ci-flags">Useful flags for CI</h2>
<p><code>{`run-flow`}</code> takes a few flags worth setting in a pipeline:</p>
<table>
<thead><tr><th>Flag</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td><code>{`-repetitions <n>`}</code></td><td>Number of flow starts (default <code>{`1`}</code>)</td></tr>
<tr><td><code>{`-rate <n>`}</code></td><td>Flow starts per second (<code>{`0`}</code> = burst all at once)</td></tr>
<tr><td><code>{`-timeout <dur>`}</code></td><td>Per-flow timeout (default <code>{`30s`}</code>); raise it for slow cores</td></tr>
<tr><td><code>{`-gen-subscriber`}</code></td><td>Synthesize a subscriber per UE in memory; skip the pool and DB</td></tr>
<tr><td><code>{`-db <path>`}</code></td><td>SQLite path; isolate each job's reports in its own file</td></tr>
<tr><td><code>{`-trace`}</code></td><td>TX/RX hex dumps for failed-run forensics — strip from green pipelines</td></tr>
</tbody>
</table>
<p>For latency or path assertions, encode them as post-run checks in the flow or suite YAML — they evaluate against the run's aggregated metrics and feed the overall pass/fail (and therefore the exit code). See <Link to="/reference/flow-schema">the flow schema</Link>.</p>
<h2 id="github-actions-example">GitHub Actions example</h2>
<CodeBlock lang="yaml" code={`name: 5G smoke test

on:
  pull_request:
  workflow_dispatch:

jobs:
  smoke:
    runs-on: ubuntu-latest
    services:
      open5gs:
        image: gradiant/open5gs:2.7.5
        ports:
          - 38412:38412/sctp
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25'
      - name: Build
        run: make
      - name: Wait for AMF
        run: ./bin/fluxproto-light check -c config/lab.yaml
      - name: Smoke run
        run: |
          ./bin/fluxproto-light run-flow \\
            -flow registration \\
            -templates templates \\
            -c config/lab.yaml \\
            -s config/subscribers.yaml \\
            -repetitions 5 \\
            -rate 1 \\
            | tee result.txt
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: fluxproto-result
          path: result.txt`} />
<p>The job fails when <code>{`run-flow`}</code> exits <code>{`1`}</code>; no parsing step is needed. <code>{`tee result.txt`}</code> captures the printed result table, and <code>{`if: always()`}</code> keeps the artifact upload firing on red builds so the table is available for triage.</p>
<h2 id="gitlab-ci-example">GitLab CI example</h2>
<CodeBlock lang="yaml" code={`fluxproto-smoke:
  image: golang:1.25
  services:
    - name: gradiant/open5gs:2.7.5
      alias: open5gs
  variables:
    GIT_STRATEGY: clone
  script:
    - make
    - ./bin/fluxproto-light check -c config/lab.yaml
    - |
      ./bin/fluxproto-light run-flow \\
        -flow registration \\
        -templates templates \\
        -c config/lab.yaml \\
        -s config/subscribers.yaml \\
        -repetitions 5 \\
        -rate 1 \\
        | tee result.txt
  artifacts:
    when: always
    paths:
      - result.txt`} />
<p>The job's pass/fail tracks the <code>{`run-flow`}</code> exit code. The CLI does not emit JUnit XML, so there is no <code>{`reports.junit`}</code> entry here — to feed a structured report into GitLab's test view, run against the daemon and convert its JSON yourself.</p>
<h2 id="suites-in-ci">Suites in CI</h2>
<p><code>{`run-suite`}</code> follows the same exit-code contract. Use a suite when one logical pipeline check needs several flows in order — for example: provision PCC rules, run a load burst, then tear the rules down. Each step's workload lives in the suite YAML, so <code>{`run-suite`}</code> ignores <code>{`-rate`}</code> and <code>{`-repetitions`}</code> for individual flows; <code>{`-repetitions`}</code> on the command line means full suite cycles.</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-suite \\
    -suite gnb-register-deregister \\
    -templates templates \\
    -c config/lab.yaml \\
    -s config/subscribers.yaml \\
    -repetitions 3
# exits 1 if any step's checks fail`} />
<h2 id="daemon-driven-ci">Daemon-driven CI</h2>
<p>When you need to gate on individual report fields, drive a long-lived <Link to="/guides/daemon">daemon</Link> over its REST API. This is the only path that returns the structured report. Authenticate with a JWT token, kick off an execution, poll it, then fetch the report:</p>
<CodeBlock lang="bash" code={`TOKEN=$(curl -s -X POST $DAEMON/api/v1/auth/login \\
    -H 'Content-Type: application/json' \\
    -d "{\\"username\\":\\"$USER\\",\\"password\\":\\"$PASS\\"}" | jq -r .token)

EXEC=$(curl -s -X POST $DAEMON/api/v1/execute \\
    -H "Authorization: Bearer $TOKEN" \\
    -H 'Content-Type: application/json' \\
    -d '{"flow_id":"registration","environment_id":"<env-uuid>","repetitions":5,"rate":1}' \\
    | jq -r .execution_id)`} />
<p>The execute response includes an <code>{`execution_id`}</code>. Poll <code>{`/api/v1/executions/<id>`}</code> until it leaves <code>{`running`}</code>, then fetch <code>{`/api/v1/reports/<id>`}</code> for the structured report:</p>
<CodeBlock lang="bash" code={`# wait for the execution to finish
while curl -s -H "Authorization: Bearer $TOKEN" \\
    $DAEMON/api/v1/executions/$EXEC | jq -e '.status == "running"' > /dev/null; do
  sleep 2
done

# fetch the report and gate on a field
curl -s -H "Authorization: Bearer $TOKEN" \\
    $DAEMON/api/v1/reports/$EXEC > report.json
jq -e '.all_passed' report.json   # exit 1 if false`} />
<p>The report is a flat JSON object. Fields you'll typically gate on:</p>
<ul>
<li><code>{`all_passed`}</code> (bool) — overall pass/fail</li>
<li><code>{`flow_name`}</code> (string)</li>
<li><code>{`duration`}</code> (Go duration; <code>{`187ms`}</code>)</li>
<li><code>{`metrics`}</code> — flat <code>{`map[string]float64`}</code> with bucketed timings</li>
<li><code>{`event_log`}</code> — timestamped progress events, useful for failure forensics</li>
<li><code>{`post_checks`}</code> — per-named-check pass/fail with diagnostics</li>
</ul>
<p>See <Link to="/api/executions">the executions API</Link> for the full request and response shapes.</p>
<h2 id="determinism-and-isolation">Determinism and isolation</h2>
<ul>
<li>Use <code>{`-gen-subscriber`}</code> for runs that don't depend on real auth, to avoid contention on a shared subscriber pool.</li>
<li>Use <code>{`-db /tmp/ci-$CI_JOB_ID.db`}</code> for CLI runs to keep each job's reports in its own file.</li>
<li>Pin the templates directory; a stale catalog can mask a flow rename. See the <Link to="/reference/catalogs">flow and suite catalog</Link>.</li>
</ul>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong>Flaky timeouts on small cores</strong> — the AMF takes longer to respond under cold load. Raise <code>{`-timeout 60s`}</code> on the first run of the day, or warm the core with a <code>{`check`}</code> invocation first.</p>
<p><strong>The exit code is <code>{`1`}</code> but the run "should" have passed</strong> — read the printed result table. It lists each failed check; a failing post-run check (such as a latency threshold defined in the flow YAML) is reported there even when every in-flow check passed. Add <code>{`-trace`}</code> for TX/RX hex dumps.</p>
<p><strong>The captured log is empty</strong> — the run hard-failed before printing. Redirect stderr (<code>{`2>&1`}</code>) into the same file so the error is captured alongside the result table.</p>
<h2 id="where-to-go-next">Where to go next</h2>
<ul>
<li><Link to="/guides/daemon">Running the daemon</Link> — stand up the long-lived process the JSON path drives.</li>
<li><Link to="/reference/cli">CLI reference</Link> — every flag on <code>{`run-flow`}</code> and <code>{`run-suite`}</code>.</li>
<li><Link to="/reference/flow-schema">Flow schema</Link> — encode latency and path assertions as post-run checks.</li>
</ul>
    </DocPage>
  );
}
