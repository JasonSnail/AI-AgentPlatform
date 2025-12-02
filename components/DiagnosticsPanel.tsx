import React from 'react';
import { Bot, Zap } from 'lucide-react';
import { CopilotChat } from "@copilotkit/react-ui";
import { LogEntry, MachineStatus } from '../types';

interface DiagnosticsPanelProps {
  logs: LogEntry[];
  status: MachineStatus;
}

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ logs, status }) => {
  return (
    <div className="flex flex-col h-full bg-fecp-800 border-l border-fecp-700">
      {/* Custom Header */}
      <div className="p-4 bg-fecp-900 border-b border-fecp-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="text-fecp-accent w-5 h-5" />
          <h2 className="font-bold text-white">Diagnostics Agent</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-fecp-success">
            <Zap className="w-3 h-3 fill-current" />
            <span>Connected</span>
          </div>
        </div>
      </div>

      {/* Copilot Chat UI Container */}
      <div className="flex-1 relative bg-fecp-800 overflow-hidden">
        {/* We use specific classNames to ensure it fills the parent flex container */}
        <CopilotChat
          instructions="You are the FECP AI Agent. You monitor semiconductor equipment logs (CEID), status, and sensor data. Diagnose issues, explain error codes, and suggest fixes. Be technical but concise."
          labels={{
            title: "Agent Chat",
            initial: "Diagnostics Layer Active. I am monitoring the CEID stream and Plugin activity. Ask me about the current state or specific error codes.",
            placeholder: "Type a command or question..."
          }}
          className="h-full w-full"
        />
      </div>
    </div>
  );
};

export default DiagnosticsPanel;