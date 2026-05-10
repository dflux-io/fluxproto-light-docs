import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';

// Every page is lazily loaded so the initial bundle stays small —
// each page becomes its own chunk, fetched on first navigation.
const Index = lazy(() => import('./pages/Index'));
const Glossary = lazy(() => import('./pages/Glossary'));

const Introduction = lazy(() => import('./pages/introduction/Introduction'));
const Quickstart = lazy(() => import('./pages/introduction/Quickstart'));

const Architecture = lazy(() => import('./pages/concepts/Architecture'));
const Flows = lazy(() => import('./pages/concepts/Flows'));
const Suites = lazy(() => import('./pages/concepts/Suites'));
const Environments = lazy(() => import('./pages/concepts/Environments'));
const UserPlane = lazy(() => import('./pages/concepts/UserPlane'));

const FirstYamlFlow = lazy(() => import('./pages/tutorials/FirstYamlFlow'));
const FirstServerFlow = lazy(() => import('./pages/tutorials/FirstServerFlow'));

const Writing = lazy(() => import('./pages/guides/Writing'));
const Running = lazy(() => import('./pages/guides/Running'));
const ConfiguringEnvironments = lazy(() => import('./pages/guides/ConfiguringEnvironments'));
const Daemon = lazy(() => import('./pages/guides/Daemon'));
const UserPlaneTesting = lazy(() => import('./pages/guides/UserPlaneTesting'));
const GuideSubscribers = lazy(() => import('./pages/guides/Subscribers'));
const MultiProtocolFlows = lazy(() => import('./pages/guides/MultiProtocolFlows'));
const CiIntegration = lazy(() => import('./pages/guides/CiIntegration'));

const Cli = lazy(() => import('./pages/reference/Cli'));
const FlowSchema = lazy(() => import('./pages/reference/FlowSchema'));
const SuiteSchema = lazy(() => import('./pages/reference/SuiteSchema'));
const ConfigSchema = lazy(() => import('./pages/reference/ConfigSchema'));
const Catalogs = lazy(() => import('./pages/reference/Catalogs'));
const Metrics = lazy(() => import('./pages/reference/Metrics'));

const ApiOverview = lazy(() => import('./pages/api/Overview'));
const ApiUsers = lazy(() => import('./pages/api/Users'));
const ApiFlows = lazy(() => import('./pages/api/Flows'));
const ApiEnvironments = lazy(() => import('./pages/api/Environments'));
const ApiExecutions = lazy(() => import('./pages/api/Executions'));
const ApiSchedules = lazy(() => import('./pages/api/Schedules'));
const ApiSubscribers = lazy(() => import('./pages/api/Subscribers'));
const ApiSettings = lazy(() => import('./pages/api/Settings'));

// Loading sentinel — keep it boring; the layout chrome is already on
// screen, so a tiny pulsing placeholder reads better than a spinner.
function PageFallback() {
  return (
    <main className="flex-1 px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="h-8 w-2/3 animate-pulse rounded-md bg-surface-muted" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-md bg-surface-muted" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded-md bg-surface-muted" />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}
