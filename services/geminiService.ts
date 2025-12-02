import { GoogleGenAI } from "@google/genai";
import { LogEntry, MachineStatus, SensorData } from "../types";

// This service allows for direct connection to Gemini API from the frontend,
// bypassing the CopilotKit backend if needed.

export const analyzeDiagnostics = async (
  logs: LogEntry[], 
  status: MachineStatus, 
  userQuery: string,
  sensorData?: SensorData[]
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Error: API_KEY is missing. Please set the environment variable.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct context from machine state
    const recentLogs = logs.slice(-10).map(l => `[${l.timestamp}] ${l.level}: ${l.message} (Code: ${l.code || 'N/A'})`).join('\n');
    const recentTelemetry = sensorData ? sensorData.slice(-1).map(s => `Temp: ${s.temperature.toFixed(1)}°C, Pressure: ${s.pressure.toFixed(1)} Pa`).join('') : 'N/A';
    
    const contextPrompt = `
      You are an expert Semiconductor Equipment Diagnostics Agent for a TEL Track System.
      
      CURRENT MACHINE STATUS: ${status}
      LATEST TELEMETRY: ${recentTelemetry}
      
      RECENT LOGS (CEID Events):
      ${recentLogs}
      
      USER QUERY: "${userQuery}"
      
      Analyze the logs and status to answer the user's query. 
      If there is an error code, explain it. 
      If the sequence of events is abnormal (e.g. timeout, missing step), point it out.
      Provide a concise, technical recommendation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
    });

    return response.text || "Analysis complete, but no text returned.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Diagnostic Error: ${(error as Error).message}. Ensure your API Key is valid.`;
  }
};
