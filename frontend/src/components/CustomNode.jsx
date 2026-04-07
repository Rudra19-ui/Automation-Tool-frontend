import { memo } from "react";
import { Handle, Position } from "reactflow";

const icons = {
    trigger: "⚡",
    http: "🌐",
    condition: "⚖️",
    delay: "⏱️",
    logger: "📜",
    ai: "✨",
    email: "📧",
};

const colors = {
    trigger: "border-yellow-400 bg-yellow-50",
    http: "border-blue-400 bg-blue-50",
    condition: "border-orange-400 bg-orange-50",
    delay: "border-gray-400 bg-gray-50",
    logger: "border-green-400 bg-green-50",
    ai: "border-purple-400 bg-purple-50",
    email: "border-red-400 bg-red-50",
};

function CustomNode({ data, type, selected }) {
    const nodeColors = {
        trigger: "from-amber-400 to-orange-500 shadow-orange-100",
        http: "from-blue-500 to-indigo-600 shadow-blue-100",
        condition: "from-purple-500 to-pink-600 shadow-purple-100",
        delay: "from-slate-400 to-slate-600 shadow-slate-100",
        logger: "from-emerald-400 to-teal-600 shadow-emerald-100",
        ai: "from-indigo-400 to-violet-600 shadow-indigo-100",
        email: "from-rose-500 to-red-600 shadow-red-100",
    };

    return (
        <div className={`relative group transition-all duration-300 ${selected ? "scale-105" : "hover:scale-102"}`}>
            <div className={`absolute -inset-1 bg-gradient-to-r ${nodeColors[type] || "from-slate-200 to-slate-300"} rounded-[1.2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 uppercase font-black tracking-widest text-[8px] flex items-end justify-center pb-1 text-white`}>
                {type}
            </div>

            <div className={`relative px-5 py-4 border-2 rounded-2xl flex items-center bg-white shadow-2xl min-w-[200px] ${selected ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-50"}`}>
                <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-white !border-2 !border-slate-200 hover:!border-blue-400 transition-colors" />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${nodeColors[type] || "from-slate-200 to-slate-300"} flex items-center justify-center text-white text-2xl shadow-lg mr-4 group-hover:rotate-6 transition-transform`}>
                    {icons[type] || "📦"}
                </div>

                <div className="flex-1 overflow-hidden">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 select-none">{type}</div>
                    <div className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {data.label || type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                </div>

                <Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-white !border-2 !border-slate-200 hover:!border-blue-400 transition-colors" />
            </div>
        </div>
    );
}

export default memo(CustomNode);
