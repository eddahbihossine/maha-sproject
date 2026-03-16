from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MessageViewSet

router = DefaultRouter()
# Expose messages at /api/messages/ (no extra prefix)
router.register(r'', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
