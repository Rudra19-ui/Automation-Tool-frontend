import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import WorkflowBuilder from "../components/WorkflowBuilder";
import NodeSidebar from "../components/NodeSidebar";
import NodeConfigPanel from "../components/NodeConfigPanel";
import ExecutionLogs from "../components/ExecutionLogs";
import { getWorkflow, updateWorkflow, runWorkflow, aiGenerateWorkflow } from "../api/workflowApi";

export default function WorkflowEditor({ workflowId }) {
  const [wf, setWf] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [panelHeight, setPanelHeight] = useState(300);
  const isResizing = useRef(false);
  const saveTimeoutRef = useRef(null);

  const startResizing = useCallback((e) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 100 && newHeight < window.innerHeight - 200) {
      setPanelHeight(newHeight);
    }
  }, []);

  const stretchToTop = () => {
    if (panelHeight > window.innerHeight - 250) {
      setPanelHeight(300); // Toggle back to default
    } else {
      setPanelHeight(window.innerHeight - 200);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWorkflow(workflowId)
      .then((res) => {
        setWf(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.status === 404 ? "Workflow Not Found" : "Failed to load workflow");
        setLoading(false);
      });
  }, [workflowId]);

  const onUpdate = useCallback(
    (definition) => {
      setWf((prev) => ({ ...prev, json_definition: definition }));

      // Auto-save with debounce
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await updateWorkflow(workflowId, {
            name: wf.name,
            description: wf.description,
            json_definition: definition,
          });
        } catch (err) {
          console.error("Save failed", err);
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
    [workflowId, wf?.name, wf?.description]
  );

  const onAddNode = (node) => {
    const nodes = [...(wf?.json_definition?.nodes || []), node];
    const edges = wf?.json_definition?.edges || [];
    onUpdate({ nodes, edges });
  };

  const onUpdateNode = (updatedNode) => {
    const nodes = (wf?.json_definition?.nodes || []).map((n) => (n.id === updatedNode.id ? updatedNode : n));
    onUpdate({ nodes, edges: wf?.json_definition?.edges || [] });
  };

  const onDeleteNode = (nodeToDelete) => {
    if (!nodeToDelete) return;
    const nodes = (wf?.json_definition?.nodes || []).filter((n) => n.id !== nodeToDelete.id);
    const edges = (wf?.json_definition?.edges || []).filter(
      (e) => e.source !== nodeToDelete.id && e.target !== nodeToDelete.id
    );
    onUpdate({ nodes, edges });
    setSelectedNodeId(null);
  };

  const onRun = async () => {
    // Basic validation before running
    const nodes = wf?.json_definition?.nodes || [];
    for (const node of nodes) {
      if (node.type === "email") {
        const { to, subject, body } = node.data || {};
        if (!to || !subject || !body) {
          alert(`Email Node (${node.data?.label || node.id}) is missing required fields.`);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
          alert(`Email Node (${node.data?.label || node.id}) has an invalid recipient email address.`);
          return;
        }
      }
    }

    setRunning(true);
    try {
      await runWorkflow(workflowId);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const onGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    setSaving(true);
    try {
      const res = await aiGenerateWorkflow(aiPrompt);
      if (res.data) {
        onUpdate(res.data);
        setShowAiModal(false);
        setAiPrompt("");
      }
    } catch (err) {
      alert("AI Generation failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800">Loading Workflow...</h2>
        <p className="text-slate-500">Retrieving your canvas data</p>
      </div>
    );
  }

  if (error || !wf) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-6 rounded-3xl mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{error || "Something went wrong"}</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          We couldn't find the workflow you're looking for or there was a system error.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const selectedNode = (wf?.json_definition?.nodes || []).find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm z-30">
        <div className="flex items-center space-x-3">
          <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all active:scale-90" style={{ width: '40px', height: '40px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Workflow Editor</div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{wf?.name || 'Loading...'}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all active:scale-90"
            title="Toggle Theme"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-purple-100 active:scale-95 group"
          >
            <span className="group-hover:rotate-12 transition-transform">✨</span>
            <span>AI Assist</span>
          </button>
          <button
            onClick={onRun}
            disabled={running}
            className={`flex items-center space-x-2 px-8 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-xl active:scale-95 ${running
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"
              }`}
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                <span>Run Workflow</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <NodeSidebar onAdd={onAddNode} />

        {/* Canvas Area */}
        <main className="flex-1 relative flex flex-col bg-slate-100">
          <div className="flex-1 relative">
            <WorkflowBuilder 
              value={wf?.json_definition} 
              onChange={onUpdate} 
              onNodeSelect={(node) => setSelectedNodeId(node.id)} 
            />
          </div>

          {/* Logs Panel */}
          <div 
            style={{ height: `${panelHeight}px` }} 
            className="border-t bg-white overflow-hidden flex flex-col font-display relative group"
          >
            {/* Resize Handle */}
            <div 
              onMouseDown={startResizing}
              className="absolute top-0 left-0 right-0 h-1.5 cursor-row-resize bg-transparent hover:bg-blue-500/30 transition-colors z-40"
            />
            
            {/* Stretch Button */}
            <button 
              onClick={stretchToTop}
              className="absolute top-4 right-10 z-40 p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
              title={panelHeight > 500 ? "Restore size" : "Stretch to top"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${panelHeight > 500 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
              </svg>
            </button>

            <ExecutionLogs workflowId={wf?.id} />
          </div>
        </main>

        {/* Config Panel */}
        <NodeConfigPanel selectedNode={selectedNode} onUpdate={onUpdateNode} onDelete={onDeleteNode} />
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 flex items-center mb-2">
                    <span className="mr-3 text-4xl">✨</span> AI Architect
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Describe your automation goals and let our AI build the logic for you instantly.
                  </p>
                </div>
                <button onClick={() => setShowAiModal(false)} className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 p-3 rounded-2xl transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <textarea
                  className="relative w-full bg-white border border-slate-100 rounded-[1.8rem] p-6 text-slate-700 text-base focus:ring-0 outline-none h-40 resize-none shadow-inner"
                  placeholder="e.g. When a new customer is added, check their credit score, and if it's over 700, send them a welcome email via API."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="bg-slate-50 p-10 flex justify-end space-x-6">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-8 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={onGenerateAi}
                className="bg-slate-800 hover:bg-slate-900 text-white font-black px-10 py-3 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                Generate Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
