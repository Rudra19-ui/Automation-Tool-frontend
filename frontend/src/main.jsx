import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import WorkflowEditor from "./pages/WorkflowEditor.jsx";
import NotFound from "./pages/NotFound.jsx";

function EditorRoute() {
  const { id } = useParams();
  return <WorkflowEditor workflowId={id} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor/:id" element={<EditorRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
