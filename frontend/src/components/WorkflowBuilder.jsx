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
  email: CustomNode,
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

  // Initialize or sync when value changes from outside
  useEffect(() => {
    if (value) {
      // Only update if the number of nodes/edges changed or if we're not currently interacting
      // This prevents the "snapping back" behavior during drags
      const currentNodesIds = nodes.map(n => n.id).join(',');
      const incomingNodesIds = (value.nodes || []).map(n => n.id).join(',');
      
      const currentEdgesIds = edges.map(e => e.id).join(',');
      const incomingEdgesIds = (value.edges || []).map(e => e.id).join(',');

      if (currentNodesIds !== incomingNodesIds || currentEdgesIds !== incomingEdgesIds) {
        setNodes(value.nodes || []);
        setEdges(value.edges || []);
      } else {
        // Even if IDs are same, data might have changed (from config panel)
        // We sync data but avoid overwriting positions if possible
        setNodes((nds) => 
          nds.map((node) => {
            const incomingNode = value.nodes?.find((n) => n.id === node.id);
            if (incomingNode && JSON.stringify(incomingNode.data) !== JSON.stringify(node.data)) {
              return { ...node, data: incomingNode.data };
            }
            return node;
          })
        );
      }
    }
  }, [value]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({
        ...params,
        ...edgeOptions,
        id: `e-${params.source}-${params.target}-${Date.now()}`
      }, edges);
      setEdges(newEdges);
      onChange && onChange({ nodes, edges: newEdges });
    },
    [nodes, edges, onChange, setEdges]
  );

  const onNodeDragStop = useCallback(() => {
    onChange && onChange({ nodes, edges });
  }, [nodes, edges, onChange]);

  const onNodesDelete = useCallback((deleted) => {
    const deletedIds = deleted.map(n => n.id);
    const nextNodes = nodes.filter(n => !deletedIds.includes(n.id));
    const nextEdges = edges.filter(e => !deletedIds.includes(e.source) && !deletedIds.includes(e.target));
    setNodes(nextNodes);
    setEdges(nextEdges);
    onChange && onChange({ nodes: nextNodes, edges: nextEdges });
  }, [nodes, edges, onChange, setNodes, setEdges]);

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(evt, node) => onNodeSelect && onNodeSelect(node)}
        onNodeDragStop={onNodeDragStop}
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
