from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowViewSet, generate_workflow, ai_node

router = DefaultRouter()
router.register(r"workflows", WorkflowViewSet, basename="workflow")

urlpatterns = [
    path("", include(router.urls)),
    path("ai/generate-workflow/", generate_workflow),
    path("ai/node/", ai_node),
]
