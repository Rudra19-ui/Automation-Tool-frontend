import { useMemo, useState } from "react";

export default function NodeConfigPanel({ selectedNode, onUpdate, onDelete }) {
  const node = selectedNode;
  const [fileInputKey, setFileInputKey] = useState(Date.now());

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
      case "email":
        fields.push(
          { name: "subject", label: "Subject", type: "text", placeholder: "Hello {{name}} 📧" },
          { name: "body", label: "Email Body", type: "textarea", placeholder: "Welcome {{name}}!..." }
        );
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      alert("Only .xlsx files are allowed.");
      setFileInputKey(Date.now());
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result.split(',')[1];
      onChange('excel_file', {
        name: file.name,
        data: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const addManualEmail = () => {
    const emails = node.data?.manual_emails || [];
    if (emails.length >= 5) {
      alert("If you want to send more than 5 emails, please upload an Excel file.");
      return;
    }
    onChange('manual_emails', [...emails, ""]);
  };

  const updateManualEmail = (index, value) => {
    const emails = [...(node.data?.manual_emails || [])];
    emails[index] = value;
    onChange('manual_emails', emails);
  };

  const removeManualEmail = (index) => {
    const emails = (node.data?.manual_emails || []).filter((_, i) => i !== index);
    onChange('manual_emails', emails);
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
              {f.type === "textarea" ? (
                <textarea
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.3rem] p-5 text-sm font-bold text-slate-700 shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none h-32 resize-none transition-all"
                  value={node.data?.[f.name] || ""}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(f.name, e.target.value)}
                />
              ) : f.type === "select" ? (
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
                </div>
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

          {node.type === "email" && (
            <div className="space-y-8 pt-4 border-t border-slate-50">
              {/* Manual Emails */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Recipients</label>
                  <button 
                    onClick={addManualEmail}
                    disabled={node.data?.excel_file}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest disabled:opacity-30"
                  >
                    + Add Email
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(node.data?.manual_emails || []).map((email, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <input
                        type="email"
                        disabled={node.data?.excel_file}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 outline-none disabled:opacity-50"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => updateManualEmail(idx, e.target.value)}
                      />
                      <button onClick={() => removeManualEmail(idx)} className="text-slate-300 hover:text-red-500 p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {(!node.data?.manual_emails || node.data.manual_emails.length === 0) && !node.data?.excel_file && (
                    <div className="text-[10px] text-slate-300 italic ml-1">No manual recipients added.</div>
                  )}
                </div>
              </div>

              {/* Excel Upload */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bulk Upload (.xlsx)</label>
                <div className="relative">
                  <input
                    key={fileInputKey}
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${node.data?.excel_file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-blue-200'}`}>
                    {node.data?.excel_file ? (
                      <>
                        <div className="text-2xl mb-2">📊</div>
                        <div className="text-xs font-bold text-emerald-700">{node.data.excel_file.name}</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onChange('excel_file', null); setFileInputKey(Date.now()); }}
                          className="mt-2 text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest"
                        >
                          Remove File
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-2">📁</div>
                        <div className="text-xs font-bold text-slate-400 text-center">Click or drag to upload Excel</div>
                        <div className="text-[9px] text-slate-300 mt-2 text-center uppercase tracking-widest leading-relaxed">
                          Column 1: Email<br/>Column 2: First Name
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {node.data?.excel_file && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="text-[9px] text-amber-600 font-black uppercase tracking-widest mb-1 flex items-center">
                      <span className="mr-2">⚠️</span> Note
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium leading-relaxed">
                      Manual recipients are ignored when an Excel file is uploaded.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
