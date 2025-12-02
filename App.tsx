import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutGrid, Play, Cpu, Settings, Menu, AlertTriangle } from 'lucide-react';
import { CopilotKit, useCopilotReadable } from "@copilotkit/react-core";
import WorkflowDesigner from './components/WorkflowDesigner';
import RuntimeViewer from './components/RuntimeViewer';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import { MOCK_LOGS, MOCK_SENSOR_DATA } from './constants';
import { MachineStatus, LogEntry } from './types';

// Machine Context to share state between logs/charts and the AI Agent
interface MachineContextType {
  logs: LogEntry[];
  status: MachineStatus;
}
const MachineContext = createContext<MachineContextType>({ logs: [], status: MachineStatus.IDLE });

const MachineStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs] = useState<LogEntry[]>(MOCK_LOGS);
  const [status] = useState<MachineStatus>(MachineStatus.ERROR);

  // Global Context for Copilot - Now the Agent sees this EVERYWHERE in the app
  useCopilotReadable({
    description: "The current operational logs (CEID events) of the machine. Use this to diagnose errors.",
    value: logs,
  });

  useCopilotReadable({
    description: "The current global machine status.",
    value: status,
  });

  useCopilotReadable({
    description: "Real-time sensor telemetry (Temperature, Pressure).",
    value: MOCK_SENSOR_DATA,
  });

  return (
    <MachineContext.Provider value={{ logs, status }}>
      {children}
    </MachineContext.Provider>
  );
};

// Sidebar Component
const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-16 lg:w-64 bg-fecp-900 border-r border-fecp-700 flex flex-col items-center lg:items-stretch h-screen sticky top-0">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-fecp-700">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
          F
        </div>
        <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight text-white">FECP Agent</span>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-2 lg:px-4">
        <Link to="/runtime" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isActive('/runtime') ? 'bg-fecp-accent text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-fecp-800 hover:text-white'}`}>
          <Play className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Runtime Viewer</span>
        </Link>
        <Link to="/designer" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isActive('/designer') ? 'bg-fecp-accent text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-fecp-800 hover:text-white'}`}>
          <LayoutGrid className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Flow Designer</span>
        </Link>
        <div className="my-4 border-t border-fecp-800"></div>
        <div className="hidden lg:block px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Modules</div>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:bg-fecp-800 hover:text-white transition">
          <Cpu className="w-5 h-5" />
          <span className="hidden lg:block font-medium">APC Config</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:bg-fecp-800 hover:text-white transition">
          <Settings className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Settings</span>
        </button>
      </nav>

      <div className="p-4 border-t border-fecp-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">OP</div>
          <div className="hidden lg:block">
            <div className="text-sm font-medium text-white">Operator</div>
            <div className="text-xs text-gray-500">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode; showDiagnostics?: boolean }> = ({ children, showDiagnostics }) => {
  const { logs, status } = useContext(MachineContext);
  
  return (
    <div className="flex bg-fecp-900 min-h-screen text-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-fecp-900/50 backdrop-blur-md border-b border-fecp-700 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-semibold text-white">TEL Track System 01</h1>
             {status === MachineStatus.ERROR && (
               <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded font-medium flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> Alarm Active
               </span>
             )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Connection: <span className="text-green-400 font-mono">NATS_OK</span></span>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto relative">
            {children}
          </div>
          {showDiagnostics && (
            <div className="w-80 lg:w-96 border-l border-fecp-700 bg-fecp-800 shadow-2xl z-20 hidden md:flex flex-col">
              <DiagnosticsPanel logs={logs} status={status} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  // Use VITE_COPILOTKIT_RUNTIME_URL if available, otherwise default to a relative path.
  // Requires a running backend at this URL for the agent to reply.
  const runtimeUrl = "/api/copilotkit"; 

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      <MachineStateProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/runtime" replace />} />
            
            <Route path="/runtime" element={
              <Layout showDiagnostics={true}>
                <RuntimeViewerWrapper />
              </Layout>
            } />
            
            <Route path="/designer" element={
              <Layout showDiagnostics={true}> 
                <WorkflowDesigner />
              </Layout>
            } />
          </Routes>
        </Router>
      </MachineStateProvider>
    </CopilotKit>
  );
};

// Wrapper to consume context for RuntimeViewer
const RuntimeViewerWrapper: React.FC = () => {
  const { logs, status } = useContext(MachineContext);
  return <RuntimeViewer logs={logs} status={status} />;
};

export default App;