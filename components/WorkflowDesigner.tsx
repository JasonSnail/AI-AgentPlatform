import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  MiniMap
} from 'reactflow';
import { 
  Square, 
  Circle, 
  GitFork, 
  ArrowRightCircle, 
  Plus,
  Loader2,
  FileCode,
  X,
  Copy,
  Check
} from 'lucide-react';
import { INITIAL_NODES, INITIAL_EDGES } from '../constants';

const WorkflowDesigner: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  
  // Code Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      // transform graph to payload
      const graphPayload = {
        nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })),
        edges: edges.map(e => ({ source: e.source, target: e.target, label: e.label }))
      };

      // Attempt to hit the backend API
      const response = await fetch('/api/codegen/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineModel: "VisualDesigner_Export",
          requirement: "Generated from React Flow Designer",
          graph: graphPayload
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code || JSON.stringify(data, null, 2));
      } else {
        throw new Error("Backend unavailable");
      }
    } catch (error) {
      console.warn("API Error, falling back to client-side generation:", error);
      
      // Client-side fallback generator for demo purposes
      const dsl = [
        `// ---------------------------------------------------------`,
        `// GENERATED WORKFLOW DSL (C#)`,
        `// Timestamp: ${new Date().toISOString()}`,
        `// ---------------------------------------------------------\n`,
        `public class VisualWorkflow_${Date.now()} : EquipmentWorkflow`,
        `{`,
        `    public override void Configure()`,
        `    {`,
        `        // Define States & Activities`,
        ...nodes.map(n => `        Step("${n.data.label}")\n            .SetPosition(${Math.round(n.position.x)}, ${Math.round(n.position.y)});`),
        ``,
        `        // Define Transitions`,
        ...edges.map(e => {
            const source = nodes.find(n => n.id === e.source)?.data.label || e.source;
            const target = nodes.find(n => n.id === e.target)?.data.label || e.target;
            return `        Transition(from: "${source}", to: "${target}")\n            .When("${e.label || 'OnComplete'}");`;
        }),
        `    }`,
        `}`
      ].join('\n');
      
      setGeneratedCode(dsl);
    } finally {
      setIsGenerating(false);
      setShowCodeModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addNode = (type: 'state' | 'activity' | 'condition' | 'transition') => {
    const id = `node-${Date.now()}`;
    // Place roughly in center or randomized slightly
    const position = {
      x: Math.random() * 200 + 200,
      y: Math.random() * 200 + 100,
    };

    let newNode: Node = {
      id,
      position,
      data: { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` },
      type: 'default', 
    };

    // Apply specific styling based on type
    switch (type) {
      case 'state':
        newNode.style = { 
          borderRadius: '50px', 
          backgroundColor: '#3b82f6', // blue-500
          color: 'white', 
          border: '2px solid #2563eb',
          minWidth: '100px',
          textAlign: 'center',
          padding: '10px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        };
        newNode.data.label = 'State';
        break;
      case 'activity':
        newNode.style = { 
          borderRadius: '4px', 
          backgroundColor: '#1e293b', // slate-800
          color: '#e2e8f0', 
          border: '1px solid #64748b',
          minWidth: '140px',
          textAlign: 'center',
          padding: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        };
        newNode.data.label = 'Activity';
        break;
      case 'condition':
        newNode.style = { 
          borderRadius: '8px', 
          backgroundColor: '#451a03', // amber-950
          color: '#fbbf24', // amber-400
          border: '2px solid #f59e0b',
          minWidth: '100px',
          textAlign: 'center',
          padding: '10px',
          fontWeight: '500'
        };
        newNode.data.label = 'Condition ?';
        break;
      case 'transition':
        // Represented as a vertical bar/event node
        newNode.style = { 
          borderRadius: '0px', 
          backgroundColor: '#cbd5e1', 
          color: '#0f172a', 
          width: '20px', 
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #475569',
          padding: 0
        };
        newNode.data.label = ''; 
        break;
    }

    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="h-full w-full bg-fecp-800 rounded-lg overflow-hidden border border-fecp-700 shadow-xl flex flex-col relative">
      <div className="p-4 border-b border-fecp-700 bg-fecp-900 flex justify-between items-center z-20 relative">
        <div>
          <h2 className="text-xl font-bold text-white">Flow Designer</h2>
          <p className="text-sm text-gray-400">Drag to edit • Backed by C# Workflow DSL</p>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-1 bg-fecp-700 hover:bg-fecp-600 text-white rounded text-sm transition">
            Auto Layout
          </button>
          <button 
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="px-3 py-1 bg-fecp-accent hover:bg-blue-600 text-white rounded text-sm transition font-medium flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
            Generate Code
          </button>
        </div>
      </div>

      {/* Node Palette */}
      <div className="absolute top-20 left-4 z-10 flex flex-col gap-2 bg-fecp-900/95 backdrop-blur-sm p-3 rounded-lg border border-fecp-700 shadow-2xl">
        <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-3 h-3" /> Add Node
        </div>
        
        <button 
          onClick={() => addNode('state')}
          className="flex items-center gap-3 px-3 py-2 bg-fecp-800 hover:bg-fecp-700 text-gray-200 rounded border border-fecp-700 transition w-full text-left group"
          title="Add State Node"
        >
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center shrink-0">
             <Circle className="w-3 h-3 text-blue-400" />
          </div>
          <span className="text-sm font-medium group-hover:text-white">State</span>
        </button>

        <button 
          onClick={() => addNode('activity')}
          className="flex items-center gap-3 px-3 py-2 bg-fecp-800 hover:bg-fecp-700 text-gray-200 rounded border border-fecp-700 transition w-full text-left group"
          title="Add Activity Node"
        >
           <div className="w-6 h-6 rounded border border-gray-400 bg-gray-700 flex items-center justify-center shrink-0">
             <Square className="w-3 h-3 text-gray-300" />
          </div>
          <span className="text-sm font-medium group-hover:text-white">Activity</span>
        </button>

        <button 
          onClick={() => addNode('condition')}
          className="flex items-center gap-3 px-3 py-2 bg-fecp-800 hover:bg-fecp-700 text-gray-200 rounded border border-fecp-700 transition w-full text-left group"
          title="Add Condition Node"
        >
          <div className="w-6 h-6 rounded border-2 border-amber-600 bg-amber-900/50 flex items-center justify-center shrink-0">
             <GitFork className="w-3 h-3 text-amber-500" />
          </div>
          <span className="text-sm font-medium group-hover:text-white">Condition</span>
        </button>

        <button 
          onClick={() => addNode('transition')}
          className="flex items-center gap-3 px-3 py-2 bg-fecp-800 hover:bg-fecp-700 text-gray-200 rounded border border-fecp-700 transition w-full text-left group"
          title="Add Transition Node"
        >
          <div className="w-6 h-6 rounded border border-gray-400 bg-gray-200 flex items-center justify-center shrink-0">
             <ArrowRightCircle className="w-4 h-4 text-gray-800" />
          </div>
          <span className="text-sm font-medium group-hover:text-white">Transition</span>
        </button>
      </div>

      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-fecp-900"
        >
          <Background color="#334155" gap={16} />
          <Controls className="bg-fecp-800 border-fecp-700 fill-white text-white" />
          <MiniMap 
            nodeColor={(node) => {
                if (node.style?.backgroundColor?.includes('#3b82f6')) return '#3b82f6'; // State
                if (node.style?.backgroundColor?.includes('#1e293b')) return '#94a3b8'; // Activity
                if (node.style?.backgroundColor?.includes('#451a03')) return '#f59e0b'; // Condition
                if (node.style?.backgroundColor?.includes('#cbd5e1')) return '#cbd5e1'; // Transition
                return '#1e293b';
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} 
          />
        </ReactFlow>
      </div>

      {/* Generated Code Modal */}
      {showCodeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-fecp-900 w-full max-w-2xl rounded-lg border border-fecp-700 shadow-2xl flex flex-col max-h-[90%]">
            <div className="flex items-center justify-between p-4 border-b border-fecp-700 bg-fecp-800 rounded-t-lg">
              <div className="flex items-center gap-2">
                <FileCode className="text-fecp-accent w-5 h-5" />
                <h3 className="font-bold text-white">Generated C# DSL</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={copyToClipboard}
                  className="p-1.5 hover:bg-fecp-700 rounded text-gray-400 hover:text-white transition"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setShowCodeModal(false)}
                  className="p-1.5 hover:bg-fecp-700 rounded text-gray-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-fecp-900">
              <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
            <div className="p-4 border-t border-fecp-700 bg-fecp-800 rounded-b-lg flex justify-end">
              <button 
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 bg-fecp-700 hover:bg-fecp-600 text-white rounded transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDesigner;