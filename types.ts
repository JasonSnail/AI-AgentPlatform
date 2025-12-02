
export enum MachineStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CEID';
  message: string;
  code?: string; // e.g., CEID 3303
}

export interface SensorData {
  time: string;
  temperature: number;
  pressure: number;
  flowRate: number;
}

export interface WorkflowNodeData {
  label: string;
  description?: string;
  status?: 'active' | 'pending' | 'completed' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

// New Types for FOUP/Wafer Visualization
export interface Wafer {
  slot: number;
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR' | 'EMPTY';
  location: string; // The specific unit the wafer is currently in (e.g., LP1, CHAMBER-A)
}

export interface AutomationStep {
  id: string;
  name: string;
  status: 'DONE' | 'ACTIVE' | 'PENDING';
  description?: string;
}