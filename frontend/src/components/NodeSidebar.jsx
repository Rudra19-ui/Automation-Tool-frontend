const nodeTypes = [
  { type: "trigger", label: "Trigger", icon: "⚡", description: "Start of workflow" },
  { type: "http", label: "HTTP Request", icon: "🌐", description: "Call external API" },
  { type: "condition", label: "Condition", icon: "⚖️", description: "Branching logic" },
  { type: "delay", label: "Delay", icon: "⏱️", description: "Wait for seconds" },
  { type: "logger", label: "Logger", icon: "📜", description: "Log message" },
  { type: "ai", label: "AI Node", icon: "✨", description: "AI processing" },
];

export default function NodeSidebar({ onAdd }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-2xl shadow-slate-100 z-20">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Build</h2>
        <h3 className="text-xl font-bold text-slate-800">Components</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {nodeTypes.map((n) => (
          <button
            key={n.type}
            draggable
            onDragStart={(e) => onDragStart(e, n.type)}
            className="w-full flex items-center p-4 rounded-[1.5rem] border-2 border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all group text-left relative overflow-hidden active:scale-95"
            onClick={() =>
              onAdd({
                id: `${n.type}-${Date.now()}`,
                type: n.type,
                position: { x: 250, y: 150 },
                data: { label: n.label },
              })
            }
          >
            <div className="bg-white shadow-lg shadow-slate-100 rounded-2xl p-3 mr-5 text-2xl group-hover:scale-110 transition-transform">
              {n.icon}
            </div>
            <div>
              <div className="font-bold text-slate-700 leading-tight mb-1">{n.label}</div>
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{n.description}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-8 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 mb-4 uppercase">
          <span>Engine Status</span>
          <span className="flex items-center text-emerald-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
            Online
          </span>
        </div>
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="w-2/3 h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        </div>
      </div>
    </aside>
  );
}
