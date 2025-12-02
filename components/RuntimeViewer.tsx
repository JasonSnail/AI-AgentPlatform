
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Terminal, Activity, AlertCircle, PlayCircle, PauseCircle, Layers, CircuitBoard, CheckCircle2, Circle, MapPin, Clock } from 'lucide-react';
import { LogEntry, SensorData, MachineStatus, Wafer, AutomationStep } from '../types';
import { MOCK_SENSOR_DATA, MOCK_WAFERS, MOCK_STEPS } from '../constants';

interface RuntimeViewerProps {
  logs: LogEntry[];
  status: MachineStatus;
}

const RuntimeViewer: React.FC<RuntimeViewerProps> = ({ logs, status }) => {
  // We use local state for these mocks to simulate potential updates, 
  // in a real app these would come from the context/props
  const [wafers] = useState<Wafer[]>(MOCK_WAFERS);
  const [steps] = useState<AutomationStep[]>(MOCK_STEPS);

  return (
    <div className="flex flex-col gap-4 h-full">
      
      {/* Top Row: Machine Status & Automation Flow */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[300px]">
        
        {/* Column 1: Automation Flow (Visual Steps) */}
        <div className="xl:col-span-1 bg-fecp-800 rounded-lg border border-fecp-700 shadow-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-fecp-700 bg-fecp-900 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CircuitBoard className="w-4 h-4 text-fecp-accent" />
              <h3 className="font-semibold text-white">Automation Control Flow</h3>
            </div>
            <span className="text-xs font-mono text-gray-400">Main_Workflow_v3.cs</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="relative pl-2">
              
              <div className="space-y-0">
                {steps.map((step, index) => {
                  const isLast = index === steps.length - 1;
                  const isCompleted = step.status === 'DONE';
                  const isActive = step.status === 'ACTIVE';

                  return (
                    <div key={step.id} className="flex gap-4 relative pb-6 group">
                      {/* Connecting Line Segment */}
                      {!isLast && (
                        <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 transition-colors duration-500 ${
                          isCompleted ? 'bg-fecp-success' : 'bg-fecp-700'
                        }`} />
                      )}

                      {/* Step Indicator Icon */}
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                        isCompleted ? 'bg-fecp-800 border-fecp-success text-fecp-success' :
                        isActive ? 'bg-fecp-800 border-fecp-accent text-fecp-accent shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110' :
                        'bg-fecp-800 border-fecp-700 text-fecp-700'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                         isActive ? <Activity className="w-5 h-5 animate-pulse" /> :
                         <Circle className="w-4 h-4" />}
                      </div>

                      {/* Step Content Card */}
                      <div className={`flex-1 p-3 rounded-lg border transition-all duration-300 relative ${
                        isActive ? 'bg-fecp-700/60 border-fecp-accent/40 shadow-lg translate-x-1' :
                        isCompleted ? 'bg-transparent border-transparent opacity-75' :
                        'bg-transparent border-transparent opacity-50'
                      }`}>
                        {/* Tooltip on Hover */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-fecp-900 text-xs text-gray-300 px-2 py-1 rounded border border-fecp-700 shadow-lg whitespace-nowrap z-50">
                                {step.description}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className={`font-medium text-sm ${
                            isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                            {step.name}
                            </div>
                            {isActive && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-fecp-accent/20 text-blue-300 rounded border border-blue-500/30 animate-pulse">
                                    IN PROGRESS
                                </span>
                            )}
                        </div>
                        
                        {isActive && (
                            <div className="text-xs text-blue-200/70 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Processing... {step.description}</span>
                            </div>
                        )}
                        {!isActive && (
                             <div className="text-xs text-gray-500 mt-1 truncate">
                                {step.description}
                            </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: FOUP & Wafer Map */}
        <div className="xl:col-span-1 bg-fecp-800 rounded-lg border border-fecp-700 shadow-xl flex flex-col">
          <div className="p-3 border-b border-fecp-700 bg-fecp-900 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-white">FOUP Content (LP1)</h3>
            </div>
            <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
              Lot: L883921
            </span>
          </div>
          
          <div className="flex-1 p-4 flex gap-4">
             {/* Visual Wafer Stack */}
             <div className="w-16 flex flex-col gap-0.5 bg-fecp-900/50 p-2 rounded border border-fecp-700">
                {wafers.map((wafer) => (
                  <div 
                    key={wafer.slot} 
                    className={`h-2.5 rounded-sm w-full transition-all duration-300 ${
                      wafer.status === 'EMPTY' ? 'bg-gray-800/30' :
                      wafer.status === 'PROCESSING' ? 'bg-fecp-accent shadow-[0_0_8px_rgba(59,130,246,0.6)]' :
                      wafer.status === 'COMPLETED' ? 'bg-fecp-success' :
                      wafer.status === 'ERROR' ? 'bg-fecp-error' :
                      'bg-gray-500'
                    }`}
                    title={`Slot ${wafer.slot}: ${wafer.status}`}
                  />
                ))}
             </div>
             
             {/* Detailed List for Hover/Reference (Scrollable) */}
             <div className="flex-1 overflow-y-auto max-h-[300px] text-xs space-y-1 pr-2 custom-scrollbar">
                {wafers.map((wafer) => (
                  <div key={wafer.slot} className="flex items-center gap-2 p-1.5 rounded hover:bg-fecp-700/50 transition">
                    <span className="w-6 font-mono text-gray-500">#{wafer.slot.toString().padStart(2, '0')}</span>
                    <div className="flex-1 min-w-0">
                      {wafer.status === 'EMPTY' ? (
                        <span className="text-gray-600 italic">Empty</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-gray-300 font-mono truncate" title={wafer.id}>{wafer.id}</span>
                          {wafer.location && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {wafer.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {wafer.status !== 'EMPTY' && (
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] uppercase font-bold shrink-0 ${
                        wafer.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-300' :
                        wafer.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                        wafer.status === 'ERROR' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {wafer.status}
                      </span>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Column 3: Machine Status & Telemetry */}
        <div className="xl:col-span-1 flex flex-col gap-4">
            {/* Status Card */}
            <div className="bg-fecp-800 rounded-lg border border-fecp-700 p-4 shadow-xl shrink-0">
              <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">Machine State</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    status === MachineStatus.ERROR ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                    status === MachineStatus.RUNNING ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  }`}>
                    {status === MachineStatus.ERROR ? <AlertCircle className="w-8 h-8" /> :
                     status === MachineStatus.RUNNING ? <PlayCircle className="w-8 h-8" /> :
                     <PauseCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white tracking-tight">{status}</div>
                    <div className="text-sm text-gray-400">Recipe: <span className="text-fecp-accent">RCP_POLY_ETCH_V3</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-fecp-800 rounded-lg border border-fecp-700 shadow-xl flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-fecp-accent" />
                  <h3 className="font-semibold text-white">Telemetry</h3>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-gray-300"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Temp</span>
                  <span className="flex items-center gap-1 text-gray-300"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Press</span>
                </div>
              </div>
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_SENSOR_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickMargin={5} />
                    <YAxis stroke="#64748b" fontSize={10} width={30} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="pressure" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>

      </div>

      {/* Bottom Row: Logs */}
      <div className="bg-fecp-800 rounded-lg border border-fecp-700 shadow-xl flex flex-col flex-1 min-h-[200px]">
        <div className="p-3 border-b border-fecp-700 bg-fecp-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            <h3 className="font-semibold text-white">System Logs (CEID/Events)</h3>
          </div>
          <span className="text-xs bg-fecp-700 px-2 py-0.5 rounded text-gray-300">Live</span>
        </div>
        <div className="flex-1 overflow-y-auto p-0 font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-fecp-700 text-gray-400 sticky top-0">
              <tr>
                <th className="p-2 w-20">Time</th>
                <th className="p-2 w-16">Level</th>
                <th className="p-2">Message</th>
                <th className="p-2 w-20">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fecp-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-fecp-700/50 transition-colors">
                  <td className="p-2 text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.level === 'ERROR' ? 'bg-red-900 text-red-200' :
                      log.level === 'WARNING' ? 'bg-yellow-900 text-yellow-200' :
                      log.level === 'CEID' ? 'bg-blue-900 text-blue-200' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className={`p-2 ${log.level === 'ERROR' ? 'text-red-400' : 'text-gray-200'}`}>
                    {log.message}
                  </td>
                  <td className="p-2 text-gray-500">{log.code || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RuntimeViewer;
