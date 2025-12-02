
import { Edge, Node } from 'reactflow';
import { LogEntry, SensorData, Wafer, AutomationStep } from './types';

export const INITIAL_NODES: Node[] = [
  { id: '1', position: { x: 50, y: 150 }, data: { label: 'Carrier Arrived', description: 'FOUP placed on LP' }, type: 'input' },
  { id: '2', position: { x: 250, y: 150 }, data: { label: 'Verify ID', description: 'RFID Scan & MES Check' } },
  { id: '3', position: { x: 450, y: 50 }, data: { label: 'SlotMap Check', description: 'Verify Wafer Presence' } },
  { id: '4', position: { x: 450, y: 250 }, data: { label: 'Hold (Error)', description: 'Invalid State' } },
  { id: '5', position: { x: 650, y: 50 }, data: { label: 'Process Job', description: 'Recipe Execution' } },
  { id: '6', position: { x: 850, y: 150 }, data: { label: 'Cool Down', description: 'Post-process cooling' } },
  { id: '7', position: { x: 1050, y: 150 }, data: { label: 'Carrier Out', description: 'Unload to OHT' }, type: 'output' },
];

export const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', label: 'ID OK' },
  { id: 'e2-4', source: '2', target: '4', label: 'ID Fail', style: { stroke: '#ef4444' } },
  { id: 'e3-5', source: '3', target: '5', label: 'Map OK' },
  { id: 'e3-4', source: '3', target: '4', label: 'Map Fail', style: { stroke: '#ef4444' } },
  { id: 'e5-6', source: '5', target: '6', animated: true },
  { id: 'e6-7', source: '6', target: '7', animated: true },
];

export const MOCK_LOGS: LogEntry[] = [
  { id: '1001', timestamp: '10:00:01', level: 'CEID', message: 'CarrierArrived (LP1)', code: '3301' },
  { id: '1002', timestamp: '10:00:05', level: 'INFO', message: 'RFID Read: F12345' },
  { id: '1003', timestamp: '10:00:06', level: 'CEID', message: 'CarrierIDRead', code: '3302' },
  { id: '1004', timestamp: '10:00:08', level: 'INFO', message: 'Querying MES for Job Info...' },
  { id: '1005', timestamp: '10:00:10', level: 'CEID', message: 'ControlJobCreated', code: '3305' },
  { id: '1006', timestamp: '10:00:15', level: 'CEID', message: 'SlotMapVerify', code: '3310' },
  { id: '1007', timestamp: '10:00:18', level: 'WARNING', message: 'SlotMap Mismatch: Slot 24 unexpected', code: 'ALARM-500' },
  { id: '1008', timestamp: '10:00:19', level: 'ERROR', message: 'Workflow Halted: Verify Failed', code: 'ERR-99' },
];

// Generate some fake sensor data for charts
export const MOCK_SENSOR_DATA: SensorData[] = Array.from({ length: 20 }, (_, i) => ({
  time: `10:00:${i < 10 ? '0' + i : i}`,
  temperature: 200 + Math.random() * 10 - 5,
  pressure: 50 + Math.random() * 5,
  flowRate: 100 + Math.random() * 20
}));

// Mock Wafer Map (Standard 25 Slot FOUP)
export const MOCK_WAFERS: Wafer[] = Array.from({ length: 25 }, (_, i): Wafer => {
    const slot = i + 1;
    // Simulate top 5 slots empty, middle processing, bottom done
    if (slot > 20) return { slot, id: '', status: 'EMPTY', location: '' };
    if (slot === 12) return { slot, id: `W-${1000+slot}`, status: 'PROCESSING', location: 'CHAMBER-A' };
    if (slot < 12) return { slot, id: `W-${1000+slot}`, status: 'COMPLETED', location: 'LP1' };
    if (slot === 18) return { slot, id: `W-${1000+slot}`, status: 'ERROR', location: 'ALIGNER' };
    return { slot, id: `W-${1000+slot}`, status: 'PENDING', location: 'LP1' };
}).reverse(); // Display Slot 25 at top

// Mock Automation Steps
export const MOCK_STEPS: AutomationStep[] = [
    { id: '1', name: 'Carrier Load', status: 'DONE', description: 'LP1 Docked' },
    { id: '2', name: 'RFID Verification', status: 'DONE', description: 'ID: F12345' },
    { id: '3', name: 'Slot Map Scan', status: 'DONE', description: '20 Wafers Detected' },
    { id: '4', name: 'Process Job Start', status: 'ACTIVE', description: 'Recipe: POLY_ETCH_V3' },
    { id: '5', name: 'Wafer Transfer', status: 'ACTIVE', description: 'Robot -> Chamber A' },
    { id: '6', name: 'Chamber Process', status: 'PENDING', description: 'Etching...' },
    { id: '7', name: 'Cool Down', status: 'PENDING', description: 'Chamber C' },
    { id: '8', name: 'Carrier Unload', status: 'PENDING', description: 'Return to OHT' },
];