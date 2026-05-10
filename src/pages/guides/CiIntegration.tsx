import DocPage from '../../components/DocPage';
import CodeBlock from '../../components/CodeBlock';

export default function CiIntegration() {
  return (
    <DocPage slug="guides/ci-integration">
<h1>CI integration</h1>
<p>fluxproto-light is built to gate CI pipelines: deterministic exit codes, structured JSON output, no interactive prompts. This guide covers exit-code semantics, JSON output, useful CI flags, and snippet templates for GitHub Actions and GitLab CI.</p>
<h2 id="exit-codes">Exit codes</h2>
<p>Two outcomes:</p>
<table>
<thead><tr><th>Exit code</th><th>Meaning</th></tr></thead>
<tbody><tr><td><code>{`0`}</code></td><td>Every check passed; every UE reached a passing terminal state</td></tr>
<tr><td><code>{`1`}</code></td><td>One or more check failures, or the engine returned an error</td></tr></tbody>
</table>
<p><code>{`run-flow`}</code> and <code>{`run-suite`}</code> both follow this contract. <code>{`subscriber generate`}</code> / <code>{`provision`}</code> exit non-zero on failure too. <code>{`flow list`}</code>, <code>{`suite list`}</code>, <code>{`report list`}</code> exit <code>{`0`}</code> regardless of catalog content (their job is to print, not to assert).</p>
<h2 id="json-output">JSON output</h2>
<p><code>{`-output json`}</code> switches the table to a JSON document. The shape is <code>{`EngineResult`}</code> (or an array of <code>{`EngineResult`}</code> for suites) — stable across releases.</p>
<CodeBlock lang="bash" code={`fluxproto-light run-flow -flow registration \\
    -templates templates -c config/lab.yaml -s config/subscribers.yaml \\
    -output json > result.json`} />
<p>Key fields you'll typically gate on:</p>
<ul>
<li><code>{`all_passed`}</code> (bool)</li>
<li><code>{`flow_name`}</code> (string)</li>
<li><code>{`duration`}</code> (Go duration; <code>{`187ms`}</code>)</li>
<li><code>{`metrics`}</code> — flat <code>{`map[string]float64`}</code> with bucketed timings</li>
<li><code>{`event_log`}</code> — timestamped progress events, useful for failure forensics</li>
<li><code>{`post_checks`}</code> — per-named-check pass/fail with diagnostics</li>
</ul>
<p><code>{`jq`}</code> extracts:</p>
<CodeBlock lang="bash" code={`jq -e '.all_passed' result.json   # exit 1 if false
jq '.metrics["flow.duration_p95_ms"]' result.json`} />
<h2 id="ci-specific-flags">CI-specific flags</h2>
<p><code>{`run-flow`}</code> takes a few flags that exist mainly for CI gating:</p>
<table>
<thead><tr><th>Flag</th><th>Purpose</th></tr></thead>
<tbody><tr><td><code>{`-output json`}</code></td><td>JSON instead of table</td></tr>
<tr><td><code>{`-failfast`}</code></td><td>Stop the run on the first check failure</td></tr>
<tr><td><code>{`-expect &lt;path&gt;`}</code></td><td>Assert the run took a specific FSM path (e.g. <code>{`success`}</code>, <code>{`auth_failure`}</code>)</td></tr>
<tr><td><code>{`-max-latency &lt;ms&gt;`}</code></td><td>Assert average flow latency below this threshold</td></tr>
<tr><td><code>{`-trace`}</code></td><td>Hex dumps for failed-run forensics — strip from green pipelines</td></tr></tbody>
</table>
<p><code>{`-expect`}</code> and <code>{`-max-latency`}</code> are post-run checks: they run after the engine finishes and add to the report's <code>{`post_checks`}</code> array, contributing to <code>{`all_passed`}</code>.</p>
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
            -output json \\
            -max-latency 500 \\
            > result.json
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: fluxproto-result
          path: result.json`} />
<p>The <code>{`if: always()`}</code> keeps the artifact upload firing on red builds so the JSON report is available for triage.</p>
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
    - ./bin/fluxproto-light run-flow
        -flow registration
        -templates templates
        -c config/lab.yaml
        -s config/subscribers.yaml
        -repetitions 5
        -rate 1
        -output json
        -max-latency 500 | tee result.json
  artifacts:
    when: always
    paths:
      - result.json
    reports:
      junit: result.json`} />
<h2 id="suites-in-ci">Suites in CI</h2>
<p><code>{`run-suite`}</code> exposes the same <code>{`-output json`}</code>, <code>{`-failfast`}</code>, and exit-code contract; the JSON is a <code>{`[]SuiteResult`}</code>. Use suites when one logical PR check needs multiple flows in order — for example: provision PCC rules → run a load burst → tear down the rules.</p>
<CodeBlock lang="bash" code={`./bin/fluxproto-light run-suite -suite gnb-register-deregister \\
    -templates templates -c config/lab.yaml -s config/subscribers.yaml \\
    -repetitions 3 -output json > suite-result.json`} />
<h2 id="daemon-driven-ci">Daemon-driven CI</h2>
<p>If your test plane is a long-lived fluxproto-light daemon, drive it from CI over the REST API (with a JWT token stored as a CI secret):</p>
<CodeBlock lang="bash" code={`TOKEN=$(curl -s -X POST $DAEMON/api/v1/auth/login \\
    -H 'Content-Type: application/json' \\
    -d "{\\"username\\":\\"$USER\\",\\"password\\":\\"$PASS\\"}" | jq -r .token)

curl -X POST $DAEMON/api/v1/execute \\
    -H "Authorization: Bearer $TOKEN" \\
    -H 'Content-Type: application/json' \\
    -d '{"flow_id":"registration","environment_id":"<env-uuid>","repetitions":5,"rate":1}'`} />
<p>The execute response includes an <code>{`execution_id`}</code>. Poll <code>{`/executions/&lt;id&gt;`}</code> until it leaves <code>{`running`}</code>; then fetch <code>{`/reports/&lt;id&gt;`}</code> for the same JSON shape the CLI emits.</p>
<h2 id="determinism-and-isolation">Determinism and isolation</h2>
<ul>
<li>Use <code>{`-gen-subscriber`}</code> for runs that don't depend on real auth, to avoid contention on a shared subscriber pool.</li>
<li>Use <code>{`-db /tmp/ci-$CI_JOB_ID.db`}</code> for CLI runs to keep each job's reports in its own DB file.</li>
<li>Pin the templates dir; a stale catalog can mask a flow rename.</li>
</ul>
<h2 id="troubleshooting">Troubleshooting</h2>
<p><strong>Flaky timeouts on small AMFs</strong> — the AMF takes longer to respond under cold load. Bump <code>{`-timeout 60s`}</code> on the first run of the day, or warm with a <code>{`check`}</code> invocation first.</p>
<p><strong>Reports artifact is empty</strong> — the run hard-failed before writing JSON. Add <code>{`-trace`}</code> and <code>{`2&gt;&amp;1`}</code> the stderr to a logfile so forensics has something to read.</p>
<p><strong>Exit <code>{`1`}</code> but tests "should" have passed</strong> — read the JSON's <code>{`event_log`}</code> and <code>{`post_checks`}</code>. A <code>{`-max-latency`}</code> post-check failing is reported there even when every check inside the flow passed.</p>
    </DocPage>
  );
}
