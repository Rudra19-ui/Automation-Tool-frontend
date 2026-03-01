from django.db import models


class Workflow(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    json_definition = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ExecutionLog(models.Model):
    STATUS_CHOICES = (
        ("success", "Success"),
        ("failed", "Failed"),
        ("running", "Running"),
    )
    workflow = models.ForeignKey(Workflow, related_name="execution_logs", on_delete=models.CASCADE)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="running")
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    logs = models.JSONField(default=list)
    error_message = models.TextField(blank=True)
