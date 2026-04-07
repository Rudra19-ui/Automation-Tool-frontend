import time
from django.utils import timezone
from .models import Workflow, ExecutionLog
from .node_registry import node_registry

def execute_workflow(workflow_json, workflow_obj=None):
    nodes = workflow_json.get("nodes", [])
    edges = workflow_json.get("edges", [])
    
    execution_log = None
    if workflow_obj:
        execution_log = ExecutionLog.objects.create(workflow=workflow_obj, status="running")

    # Find trigger node
    trigger_node = next((n for n in nodes if n["type"] == "trigger"), None)
    if not trigger_node:
        if execution_log:
            execution_log.status = "failed"
            execution_log.error_message = "No trigger node found"
            execution_log.finished_at = timezone.now()
            execution_log.save()
        return {"error": "No trigger node found"}

    logs = []
    current_node = trigger_node
    context = {}
    input_data = {}

    while current_node:
        node_id = current_node["id"]
        node_type = current_node["type"]
        config = current_node.get("data", {})

        executor = node_registry.get(node_type)
        if not executor:
            error_msg = f"Unknown node type: {node_type}"
            logs.append({"node_id": node_id, "status": "failed", "error": error_msg})
            break

        start_time = time.time()
        try:
            output_data = executor(config, input_data, context)
            execution_time = (time.time() - start_time) * 1000
            logs.append({
                "node_id": node_id,
                "node_type": node_type,
                "input": input_data,
                "output": output_data,
                "status": "success",
                "execution_time_ms": execution_time
            })
            input_data = output_data
        except Exception as e:
            error_msg = str(e)
            logs.append({"node_id": node_id, "status": "failed", "error": error_msg})
            break

        # Find next node based on edges
        # Support branching for condition nodes
        next_node_id = None
        if node_type == "condition":
            branch = output_data.get("branch", "false")
            edge = next((e for e in edges if e["source"] == node_id and e.get("sourceHandle") == branch), None)
            if not edge:
                # Fallback to any edge from this node
                edge = next((e for e in edges if e["source"] == node_id), None)
        else:
            edge = next((e for e in edges if e["source"] == node_id), None)
            
        next_node_id = edge["target"] if edge else None
        current_node = next((n for n in nodes if n["id"] == next_node_id), None) if next_node_id else None

    if execution_log:
        execution_log.status = "success" if all(l["status"] == "success" for l in logs) else "failed"
        execution_log.logs = logs
        execution_log.finished_at = timezone.now()
        execution_log.save()

    return {"status": "success", "logs": logs}
