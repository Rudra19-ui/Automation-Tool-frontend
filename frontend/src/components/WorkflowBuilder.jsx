import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";

const nodeTypes = {
  trigger: CustomNode,
  http: CustomNode,
  condition: CustomNode,
  delay: CustomNode,
  logger: CustomNode,
  ai: CustomNode,
};

const edgeOptions = {
  animated: true,
  style: { strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#3b82f6",
  },
};

export default function WorkflowBuilder({ value, onChange, onNodeSelect }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize only once or when workflow changes significantly
  useEffect(() => {
    if (value && nodes.length === 0) {
      setNodes(value.nodes || []);
      setEdges(value.edges || []);
    }
  }, [value, setNodes, setEdges, nodes.length]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const newEdges = addEdge({
          ...params,
          ...edgeOptions,
          id: `e-${params.source}-${params.target}-${Date.now()}`
        }, eds);
        onChange && onChange({ nodes, edges: newEdges });
        return newEdges;
      });
    },
    [nodes, onChange, setEdges]
  );

  const onInternalNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    // Only sync back to parent on structural changes or drag end
    if (changes.some(c => c.type === 'remove' || c.type === 'position' || c.type === 'add')) {
      // Debounce or wait for position to settle
      if (changes.some(c => c.dragging === false || c.type === 'remove')) {
        onChange && onChange({ nodes, edges });
      }
    }
  }, [onNodesChange, nodes, edges, onChange]);

  const onNodesDelete = useCallback((deleted) => {
    const deletedIds = deleted.map(n => n.id);
    const nextNodes = nodes.filter(n => !deletedIds.includes(n.id));
    const nextEdges = edges.filter(e => !deletedIds.includes(e.source) && !deletedIds.includes(e.target));
    onChange && onChange({ nodes: nextNodes, edges: nextEdges });
  }, [nodes, edges, onChange]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = { x: event.clientX - 400, y: event.clientY - 150 }; // Offset for sidebar and header
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
      };

      const nextNodes = nodes.concat(newNode);
      setNodes(nextNodes);
      onChange && onChange({ nodes: nextNodes, edges });
    },
    [nodes, edges, onChange, setNodes]
  );

  return (
    <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onInternalNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(evt, node) => onNodeSelect && onNodeSelect(node)}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={25} color="#94a3b8" variant="dots" opacity={0.2} />
        <Controls className="bg-white border-slate-200 rounded-xl shadow-lg fill-slate-500" />
      </ReactFlow>
    </div>
  );
}
