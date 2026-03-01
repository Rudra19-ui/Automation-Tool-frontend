import json
import os
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Workflow, ExecutionLog
from .serializers import WorkflowSerializer, ExecutionLogSerializer
from .engine import execute_workflow


from rest_framework.permissions import IsAuthenticated, AllowAny


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all().order_by("-updated_at")
    serializer_class = WorkflowSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        wf = self.get_object()
        try:
            summary = execute_workflow(wf.json_definition, wf)
            return Response(summary)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def logs(self, request, pk=None):
        wf = self.get_object()
        logs = wf.execution_logs.all().order_by("-started_at")
        return Response(ExecutionLogSerializer(logs, many=True).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def generate_workflow(request):
    prompt = request.data.get("prompt", "")
    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        # Better mock response for educational purposes
        nodes = [
            {"id": "t1", "type": "trigger", "position": {"x": 100, "y": 100}, "data": {"initial_data": {"value": 150}}},
            {"id": "c1", "type": "condition", "position": {"x": 300, "y": 100}, "data": {"field": "value", "operator": ">", "value": 100}},
            {"id": "l1", "type": "logger", "position": {"x": 500, "y": 50}, "data": {"message": "Value is large!"}},
            {"id": "l2", "type": "logger", "position": {"x": 500, "y": 150}, "data": {"message": "Value is small."}},
        ]
        edges = [
            {"id": "e1-2", "source": "t1", "target": "c1"},
            {"id": "e2-3", "source": "c1", "target": "l1", "condition": "true"},
            {"id": "e2-4", "source": "c1", "target": "l2", "condition": "false"},
        ]
        return Response({"nodes": nodes, "edges": edges, "mock": True})

    import json as pyjson
    from urllib import request as ureq

    system_prompt = (
        "You are an AI that generates React Flow compatible workflow definitions in JSON format."
        "The output should contain 'nodes' and 'edges'. Node types: 'trigger', 'http', 'condition', 'delay', 'logger', 'ai'."
        "Conditions should have 'true' or 'false' labels for outgoing edges."
        "Return ONLY valid JSON."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Generate a workflow for: {prompt}"},
    ]
    
    payload = {"model": "gpt-3.5-turbo", "messages": messages, "temperature": 0.2}
    data = pyjson.dumps(payload).encode("utf-8")
    
    try:
        req = ureq.Request("https://api.openai.com/v1/chat/completions", data=data, method="POST")
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Content-Type", "application/json")
        
        with ureq.urlopen(req, timeout=30) as resp:
            content = resp.read().decode("utf-8")
            response_json = pyjson.loads(content)
            text = response_json.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Clean text if AI added markdown backticks
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                text = text.replace("```", "").strip()
                
            parsed_workflow = pyjson.loads(text)
            return Response(parsed_workflow)
    except Exception as e:
        return Response({"error": f"AI Generation failed: {str(e)}", "nodes": [], "edges": []}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_node(request):
    from .executors.ai_node import execute_ai_node

    config = request.data.get("config", {})
    input_data = request.data.get("input", {})
    out = execute_ai_node(config=config, input_data=input_data, context={})
    return Response(out)
