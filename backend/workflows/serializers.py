from rest_framework import serializers
from .models import Workflow, ExecutionLog


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = ["id", "name", "description", "json_definition", "created_at", "updated_at"]


class ExecutionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionLog
        fields = ["id", "workflow", "status", "started_at", "finished_at", "logs", "error_message"]
