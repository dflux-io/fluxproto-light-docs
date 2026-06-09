import DocPage from '../../components/DocPage';
import CliReference from '../../components/CliReference';
import { Link } from 'react-router-dom';

export default function Cli() {
  return (
    <DocPage
      slug="reference/cli"
      lede="fluxproto-light is one binary that runs as a daemon (no subcommand) or as a CLI tool with a subcommand. This reference is generated from fluxproto-light --help, so it always matches the binary."
    >
      <p>
        The CLI subcommands (<code>{`run-flow`}</code>, <code>{`run-suite`}</code>, <code>{`flow`}</code>,{' '}
        <code>{`suite`}</code>, <code>{`report`}</code>, <code>{`subscriber`}</code>, <code>{`server`}</code>) are
        the one-shot side; running with no subcommand starts the{' '}
        <Link to="/guides/daemon">daemon</Link>. Flow and suite YAML lives in the{' '}
        <Link to="/reference/catalogs">templates repo</Link>.
      </p>
      <CliReference cliKey="cli" />
    </DocPage>
  );
}
