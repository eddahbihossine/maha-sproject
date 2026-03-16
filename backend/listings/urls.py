from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, ListingImageViewSet

router = DefaultRouter()
router.register(r'listings', ListingViewSet, basename='listing')
router.register(r'listing-images', ListingImageViewSet, basename='listing-image')

urlpatterns = [
    path('', include(router.urls)),
]
