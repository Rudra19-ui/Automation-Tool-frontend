import time
from typing import Dict, Any, List
from django.utils import timezone
from .logger import start_log, log_entry
from .models import ExecutionLog, Workflow
from .node_registry import node_registry


def _build_adjacency(edges: List[Dict[str, Any]]):
    adj = {}
    for e in edges:
        s = e.get("source")
        t = e.get("target")
        c = e.get("condition")
        if s not in adj:
            adj[s] = []
        adj[s].append({"target": t, "condition": c})
    return adj


def _select_next(adj, current_id, output):
    options = adj.get(current_id, [])
    if not options:
        return None
    
    # If the output from the node specifically points to a branch
    branch = None
    if isinstance(output, dict):
        branch = output.get("branch")
    
    if branch is not None:
        # Search for an edge with matching condition
        for o in options:
            if str(o.get("condition")).lower() == str(branch).lower():
                return o["target"]
    
    # Default to the first edge if no branch specified or found
    return options[0]["target"] if options else None


def execute_workflow(workflow_json: Dict[str, Any], wf: Workflow = None):
    nodes = workflow_json.get("nodes", [])
    edges = workflow_json.get("edges", [])
    adj = _build_adjacency(edges)
    
    # Find start nodes (triggers)
    start_nodes = [n for n in nodes if n.get("type") == "trigger"]
    if not start_nodes:
        # Fallback to any node without incoming edges if no trigger type
        incoming = {e.get("target") for e in edges}
        start_nodes = [n for n in nodes if n.get("id") not in incoming]
        
    if not start_nodes:
        raise ValueError("No starting node found in workflow definition.")

    current = start_nodes[0]
    context: Dict[str, Any] = {"_steps": 0, "_visited": {}}
    max_steps = int(workflow_json.get("max_steps", 100))
    logs = start_log()
    exec_log = None
    
    if wf:
        exec_log = ExecutionLog.objects.create(workflow=wf, status="running", logs=[])
    
    final_output = None
    try:
        while current:
            cid = current.get("id")
            if context["_steps"] >= max_steps:
                raise RuntimeError(f"Execution step limit ({max_steps}) reached. Possible infinite loop.")
            
            context["_steps"] += 1
            context["_visited"][cid] = context["_visited"].get(cid, 0) + 1
            if context["_visited"][cid] > int(workflow_json.get("max_visits_per_node", 10)):
                raise RuntimeError(f"Node {cid} visit limit reached. Possible loop detected.")

            node_type = current.get("type")
            config = current.get("data", {})
            executor = node_registry.get(node_type)
            
            if executor is None:
                raise ValueError(f"Unknown node type: {node_type}")

            started = time.time()
            try:
                # Core execution
                output = executor(config=config, input_data=final_output, context=context)
                final_output = output
                logs = log_entry(logs, cid, node_type, final_output, output, "success", started)
            except Exception as e:
                logs = log_entry(logs, cid, node_type, final_output, {"error": str(e)}, "failed", started)
                raise

            next_id = _select_next(adj, cid, final_output)
            if next_id is None:
                break
            
            next_node = next((n for n in nodes if n.get("id") == next_id), None)
            if not next_node:
                break
            current = next_node

        if exec_log:
            exec_log.status = "success"
            exec_log.finished_at = timezone.now()
            exec_log.logs = logs
            exec_log.save()
            
    except Exception as e:
        if exec_log:
            exec_log.status = "failed"
            exec_log.error_message = str(e)
            exec_log.finished_at = timezone.now()
            exec_log.logs = logs
            exec_log.save()
        return {"status": "failed", "error": str(e), "logs": logs}

    return {"status": "success", "result": final_output, "logs": logs}
