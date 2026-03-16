from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Listing, ListingImage
from .serializers import ListingSerializer, ListingDetailSerializer, ListingImageSerializer


class ListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Listing CRUD operations
    """
    queryset = Listing.objects.select_related('owner').prefetch_related('images')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'property_type', 'furnished', 'status']
    search_fields = ['title', 'description', 'city', 'address']
    ordering_fields = ['rent_monthly', 'created_at', 'surface_area']
    ordering = ['-created_at']

    def get_permissions(self):
        # Public read access
        if self.action in ['list', 'retrieve', 'featured']:
            return [AllowAny()]

        # Write access requires auth + role check (handled in perform_* methods)
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ListingDetailSerializer
        return ListingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        user = self.request.user

        # Anonymous and students only see active listings
        if not user.is_authenticated or getattr(user, 'role', None) == 'student':
            queryset = queryset.filter(status='active')
            user = None

        # Admin can see everything
        if user is not None and getattr(user, 'role', None) == 'admin':
            return queryset
        
        # Owners see active listings + their own drafts/paused/etc.
        if user is not None and getattr(user, 'role', None) == 'owner':
            queryset = queryset.filter(Q(status='active') | Q(owner=user))
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(rent_monthly__gte=min_price)
        if max_price:
            queryset = queryset.filter(rent_monthly__lte=max_price)
        
        # Filter by bedrooms
        bedrooms = self.request.query_params.get('bedrooms')
        if bedrooms:
            queryset = queryset.filter(num_bedrooms__gte=bedrooms)
        
        # Filter by surface area
        min_surface = self.request.query_params.get('min_surface')
        max_surface = self.request.query_params.get('max_surface')
        if min_surface:
            queryset = queryset.filter(surface_area__gte=min_surface)
        if max_surface:
            queryset = queryset.filter(surface_area__lte=max_surface)
        
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'role', None) not in ['owner', 'admin']:
            raise PermissionDenied("Only owners/admins can create listings")

        # If an owner does not specify a status, publish by default.
        # (Serializer/model defaults can otherwise keep it as 'draft')
        if getattr(user, 'role', None) == 'owner' and 'status' not in getattr(self.request, 'data', {}):
            serializer.save(owner=user, status='active')
            return

        serializer.save(owner=user)

    def perform_update(self, serializer):
        user = self.request.user
        listing = self.get_object()

        if getattr(user, 'role', None) == 'admin':
            serializer.save()
            return

        if getattr(user, 'role', None) != 'owner' or listing.owner != user:
            raise PermissionDenied("You don't have permission to update this listing")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if getattr(user, 'role', None) == 'admin':
            instance.delete()
            return

        if getattr(user, 'role', None) != 'owner' or instance.owner != user:
            raise PermissionDenied("You don't have permission to delete this listing")

        instance.delete()

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured listings"""
        # Return latest active listings for now
        featured_listings = self.get_queryset().filter(status='active')[:4]
        
        serializer = self.get_serializer(featured_listings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get current user's listings"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        listings = self.get_queryset().filter(owner=request.user)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Increment view count for a listing"""
        listing = self.get_object()
        listing.view_count += 1
        listing.save()
        return Response({'view_count': listing.view_count})


class ListingImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing listing images
    """
    queryset = ListingImage.objects.all()
    serializer_class = ListingImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        listing_id = self.request.query_params.get('listing_id')
        if listing_id:
            queryset = queryset.filter(listing_id=listing_id)
        return queryset

    def perform_create(self, serializer):
        listing = serializer.validated_data['listing']
        # Check if user owns the listing
        if listing.owner != self.request.user:
            raise PermissionDenied("You don't own this listing")
        serializer.save()

