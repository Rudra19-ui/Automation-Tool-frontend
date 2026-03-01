from django.urls import include, path

urlpatterns = [
    path("api/", include("workflows.urls")),
]

try:
    from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

    urlpatterns += [
        path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
        path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    ]
except Exception:
    pass
