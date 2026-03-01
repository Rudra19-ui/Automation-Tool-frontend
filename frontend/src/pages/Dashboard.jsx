import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listWorkflows, createWorkflow, deleteWorkflow } from "../api/workflowApi";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await listWorkflows();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async () => {
    const finalName = name.trim() || `New Workflow ${items.length + 1}`;
    const payload = {
      name: finalName,
      description: "Automated workflow",
      json_definition: { nodes: [], edges: [] }
    };
    try {
      setLoading(true);
      const res = await createWorkflow(payload);
      const newWf = res.data;
      setItems([newWf, ...items]);
      setName("");
      // Redirect to editor
      navigate(`/editor/${newWf.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteClick = (e, wf) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete(wf);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setLoading(true);
      await deleteWorkflow(itemToDelete.id);
      setItems(items.filter((i) => i.id !== itemToDelete.id));
      setShowConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation / Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200" style={{ width: '40px', height: '40px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight italic">Automater</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all active:scale-90"
              title="Toggle Theme"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <input
                className="bg-transparent border-none focus:ring-0 px-4 py-1.5 text-sm w-48 lg:w-64"
                placeholder="Workflow name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-1.5 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                onClick={onCreate}
                disabled={loading}
              >
                {loading && items.length > 0 ? "Creating..." : "Create New"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 leading-tight">My Workflows</h1>
          <p className="text-slate-500 text-lg">Manage and monitor your automated pipelines.</p>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white border border-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] shadow-sm">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No workflows found</h3>
            <p className="text-slate-400 mb-8 max-w-xs text-center">Start by creating your first automated workflow using the box above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((wf) => (
              <Link
                key={wf.id}
                to={`/editor/${wf.id}`}
                className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-0 group-hover:h-full bg-blue-500 transition-all duration-300" />

                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors" style={{ width: '48px', height: '48px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => onDeleteClick(e, wf)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all z-20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="font-exrabold text-2xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {wf.name}
                  </h3>
                  <p className="text-slate-500 line-clamp-2 mb-8 leading-relaxed">
                    {wf.description || "No description provided. Click to start editing this workflow."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                  <div className="flex items-center text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                    Updated {new Date(wf.updated_at).toLocaleDateString()}
                  </div>
                  <div className="text-blue-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3">Delete Workflow?</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you sure you want to delete <span className="text-slate-800 font-bold">"{itemToDelete?.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 p-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-8 py-3.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
