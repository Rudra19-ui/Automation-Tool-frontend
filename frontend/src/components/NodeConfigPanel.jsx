import { useMemo } from "react";

export default function NodeConfigPanel({ selectedNode, onUpdate, onDelete }) {
  const node = selectedNode;

  const configFields = useMemo(() => {
    if (!node) return [];
    const fields = [
      { name: "label", label: "Display Name", type: "text" }
    ];

    switch (node.type) {
      case "http":
        fields.push(
          { name: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "DELETE"] },
          { name: "url", label: "URL", type: "text", placeholder: "https://api.example.com" }
        );
        break;
      case "condition":
        fields.push(
          { name: "field", label: "Field to Check", type: "text", placeholder: "e.g. status" },
          { name: "operator", label: "Operator", type: "select", options: ["==", "!=", ">", "<", ">=", "<=", "in"] },
          { name: "value", label: "Value", type: "text" }
        );
        break;
      case "delay":
        fields.push({ name: "seconds", label: "Delay (seconds)", type: "number" });
        break;
      case "logger":
        fields.push({ name: "message", label: "Log Message", type: "textarea" });
        break;
      case "ai":
        fields.push(
          { name: "model", label: "Model", type: "select", options: ["gpt-3.5-turbo", "gpt-4"] },
          { name: "prompt", label: "System Prompt", type: "textarea" }
        );
        break;
      case "trigger":
        fields.push({ name: "initial_data", label: "Initial JSON Payload", type: "textarea" });
        break;
    }
    return fields;
  }, [node]);

  if (!node) {
    return (
      <aside className="w-[450px] bg-white border-l border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-2xl shadow-slate-100 z-20">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner animate-pulse text-4xl">
          ⚙️
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">Properties</h3>
        <p className="text-slate-400 font-medium leading-relaxed">Select a node on the canvas to configure its settings and parameters.</p>
      </aside>
    );
  }

  const onChange = (k, v) => {
    onUpdate({ ...node, data: { ...node.data, [k]: v } });
  };

  return (
    <aside className="w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-2xl shadow-slate-100 z-20 overflow-hidden font-display">
      <div className="p-10 border-b border-slate-50 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Configure</h2>
          <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-widest">{node.type}</span>
        </div>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">Node Settings</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10">
        <div className="space-y-8">
          {configFields.map((f) => (
            <div key={f.name}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5 ml-1">{f.label}</label>
              {f.type === "select" ? (
                <div className="relative group">
                  <select
                    className="w-full bg-slate-50 border border-slate-100 appearance-none rounded-[1.3rem] p-5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer shadow-sm"
                    value={node.data?.[f.name] || ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : f.type === "textarea" ? (
                <textarea
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.3rem] p-5 text-sm font-bold text-slate-700 shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-48 resize-none transition-all"
                  value={node.data?.[f.name] || ""}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              ) : (
                <input
                  type={f.type}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.3rem] p-5 text-sm font-bold text-slate-700 shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={node.data?.[f.name] || ""}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Runtime Identity</div>
            <code className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">ID_{node.id.split('-').pop()}</code>
          </div>
          <button
            onClick={() => onDelete && onDelete(node)}
            className="text-slate-200 hover:text-red-500 hover:bg-red-50 p-3 rounded-2xl transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
