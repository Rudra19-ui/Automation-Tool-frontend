import { useEffect, useState, useRef } from "react";
import { getLogs } from "../api/workflowApi";

export default function ExecutionLogs({ workflowId }) {
  const [logs, setLogs] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchLogs = async () => {
      try {
        const res = await getLogs(workflowId);
        if (mounted) setLogs(res.data || []);
      } catch (err) { }
    };

    if (workflowId) fetchLogs();
    const i = setInterval(fetchLogs, 3000);
    return () => {
      mounted = false;
      clearInterval(i);
    };
  }, [workflowId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-white border-t border-slate-200 shadow-2xl z-30 font-display">
      <div className="px-10 py-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Execution Timeline</h2>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          <span>Live Sync</span>
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-200">
            <div className="text-6xl mb-6">📡</div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Awaiting Signal...</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-6 pl-12 space-y-10">
            {logs.map((l) => (
              <div key={l.id} className="relative group">
                {/* Timeline Connector Dot */}
                <div className={`absolute -left-[57px] top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-xl ring-4 transition-all duration-300 ${l.status === "success" ? "bg-emerald-500 ring-emerald-50" :
                    l.status === "failed" ? "bg-red-500 ring-red-50" : "bg-blue-500 ring-blue-50 animate-pulse"
                  }`} />

                <div
                  className={`bg-white border rounded-[2rem] p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-slate-100 group/item ${expandedLog === l.id ? "border-blue-200 shadow-xl" : "border-slate-100"
                    }`}
                  onClick={() => setExpandedLog(expandedLog === l.id ? null : l.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-sm font-black text-slate-800 tracking-tight">Run {l.id.slice(-6).toUpperCase()}</span>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${l.status === "success" ? "bg-emerald-50 text-emerald-600" :
                            l.status === "failed" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                          }`}>
                          {l.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Launched at {new Date(l.started_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-xs font-bold font-mono transition-all duration-300 ${expandedLog === l.id ? "text-blue-500" : "text-slate-300"}`}>
                        {expandedLog === l.id ? "CLOSE" : "DETAILS"}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-slate-300 transition-transform duration-500 ${expandedLog === l.id ? "rotate-180 text-blue-500" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {expandedLog === l.id && (
                    <div className="mt-8 pt-8 border-t border-slate-50 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      {l.logs && Array.isArray(l.logs) ? (
                        <div className="space-y-4">
                          {l.logs.map((entry, idx) => (
                            <div key={idx} className="bg-slate-900 rounded-[1.5rem] p-6 shadow-2xl shadow-indigo-900/10">
                              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-lg">
                                    🧩
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{entry.node_type}</div>
                                    <div className="text-xs font-bold text-white tracking-tight">{entry.node_id}</div>
                                  </div>
                                </div>
                                <div className="text-[10px] font-black text-white/30 tracking-widest uppercase">
                                  {(entry.duration * 1000).toFixed(0)} ms
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <div className="text-[9px] text-white/20 uppercase font-black tracking-widest ml-1">Input Payload</div>
                                  <div className="bg-white/5 rounded-xl p-4 overflow-x-auto border border-white/5">
                                    <pre className="text-[11px] text-white/60 font-mono leading-relaxed">
                                      {JSON.stringify(entry.input, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className="text-[9px] text-indigo-400/50 uppercase font-black tracking-widest ml-1">Processed Output</div>
                                  <div className="bg-indigo-500/5 rounded-xl p-4 overflow-x-auto border border-indigo-500/10">
                                    <pre className="text-[11px] text-indigo-300 font-mono leading-relaxed">
                                      {JSON.stringify(entry.output, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                          No telemetry data captured for this run
                        </div>
                      )}

                      {l.error_message && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 ring-4 ring-red-500/5">
                          <div className="flex items-center space-x-3 mb-2 text-red-500">
                            <span className="text-lg">🚨</span>
                            <span className="text-xs font-black uppercase tracking-widest">Runtime Exception</span>
                          </div>
                          <pre className="text-xs text-red-600 font-bold font-mono whitespace-pre-wrap leading-relaxed">
                            {l.error_message}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={logEndRef} className="h-10" />
      </div>
    </div>
  );
}
