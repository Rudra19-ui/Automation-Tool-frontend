import json
import os
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Workflow, ExecutionLog
from .serializers import WorkflowSerializer, ExecutionLogSerializer
from .engine import execute_workflow

class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all().order_by("-updated_at")
    serializer_class = WorkflowSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        workflow = self.get_object()
        result = execute_workflow(workflow.json_definition, workflow)
        return Response(result)

    @action(detail=True, methods=["get"])
    def logs(self, request, pk=None):
        workflow = self.get_object()
        logs = ExecutionLog.objects.filter(workflow=workflow).order_by("-started_at")
        serializer = ExecutionLogSerializer(logs, many=True)
        return Response(serializer.data)

@api_view(["POST"])
@permission_classes([AllowAny])
def generate_workflow(request):
    prompt = request.data.get("prompt", "")
    # Placeholder for OpenAI integration
    # For now, return a basic template
    definition = {
        "nodes": [
            {"id": "node-1", "type": "trigger", "position": {"x": 250, "y": 5}, "data": {"label": "Trigger"}},
            {"id": "node-2", "type": "logger", "position": {"x": 250, "y": 100}, "data": {"label": "Logger", "message": "Pipeline started"}},
        ],
        "edges": [
            {"id": "e1-2", "source": "node-1", "target": "node-2", "animated": True}
        ]
    }
    return Response(definition)

@api_view(["POST"])
@permission_classes([AllowAny])
def ai_node(request):
    from .executors.ai_node import execute_ai_node
    config = request.data.get("config", {})
    input_data = request.data.get("input", {})
    out = execute_ai_node(config=config, input_data=input_data, context={})
    return Response(out)
