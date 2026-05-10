import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Index from './pages/Index';
import Glossary from './pages/Glossary';

import Introduction from './pages/introduction/Introduction';
import Quickstart from './pages/introduction/Quickstart';

import Architecture from './pages/concepts/Architecture';
import Flows from './pages/concepts/Flows';
import Suites from './pages/concepts/Suites';
import Environments from './pages/concepts/Environments';
import UserPlane from './pages/concepts/UserPlane';

import FirstYamlFlow from './pages/tutorials/FirstYamlFlow';
import FirstServerFlow from './pages/tutorials/FirstServerFlow';

import Writing from './pages/guides/Writing';
import Running from './pages/guides/Running';
import ConfiguringEnvironments from './pages/guides/ConfiguringEnvironments';
import Daemon from './pages/guides/Daemon';
import UserPlaneTesting from './pages/guides/UserPlaneTesting';
import GuideSubscribers from './pages/guides/Subscribers';
import MultiProtocolFlows from './pages/guides/MultiProtocolFlows';
import CiIntegration from './pages/guides/CiIntegration';

import Cli from './pages/reference/Cli';
import FlowSchema from './pages/reference/FlowSchema';
import SuiteSchema from './pages/reference/SuiteSchema';
import ConfigSchema from './pages/reference/ConfigSchema';
import Catalogs from './pages/reference/Catalogs';
import Metrics from './pages/reference/Metrics';

import ApiOverview from './pages/api/Overview';
import ApiUsers from './pages/api/Users';
import ApiFlows from './pages/api/Flows';
import ApiEnvironments from './pages/api/Environments';
import ApiExecutions from './pages/api/Executions';
import ApiSchedules from './pages/api/Schedules';
import ApiSubscribers from './pages/api/Subscribers';
import ApiSettings from './pages/api/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/glossary" element={<Glossary />} />

        <Route path="/introduction" element={<Introduction />} />
        <Route path="/introduction/quickstart" element={<Quickstart />} />

        <Route path="/concepts/architecture" element={<Architecture />} />
        <Route path="/concepts/flows" element={<Flows />} />
        <Route path="/concepts/suites" element={<Suites />} />
        <Route path="/concepts/environments" element={<Environments />} />
        <Route path="/concepts/user-plane" element={<UserPlane />} />

        <Route path="/tutorials/first-yaml-flow" element={<FirstYamlFlow />} />
        <Route path="/tutorials/first-server-flow" element={<FirstServerFlow />} />

        <Route path="/guides/writing" element={<Writing />} />
        <Route path="/guides/running" element={<Running />} />
        <Route path="/guides/configuring-environments" element={<ConfiguringEnvironments />} />
        <Route path="/guides/daemon" element={<Daemon />} />
        <Route path="/guides/user-plane-testing" element={<UserPlaneTesting />} />
        <Route path="/guides/subscribers" element={<GuideSubscribers />} />
        <Route path="/guides/multi-protocol-flows" element={<MultiProtocolFlows />} />
        <Route path="/guides/ci-integration" element={<CiIntegration />} />

        <Route path="/reference/cli" element={<Cli />} />
        <Route path="/reference/flow-schema" element={<FlowSchema />} />
        <Route path="/reference/suite-schema" element={<SuiteSchema />} />
        <Route path="/reference/config-schema" element={<ConfigSchema />} />
        <Route path="/reference/catalogs" element={<Catalogs />} />
        <Route path="/reference/metrics" element={<Metrics />} />

        <Route path="/api/overview" element={<ApiOverview />} />
        <Route path="/api/users" element={<ApiUsers />} />
        <Route path="/api/flows" element={<ApiFlows />} />
        <Route path="/api/environments" element={<ApiEnvironments />} />
        <Route path="/api/executions" element={<ApiExecutions />} />
        <Route path="/api/schedules" element={<ApiSchedules />} />
        <Route path="/api/subscribers" element={<ApiSubscribers />} />
        <Route path="/api/settings" element={<ApiSettings />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return (
    <main className="flex-1 px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-ink-muted">No page is registered at this path.</p>
      </div>
    </main>
  );
}
