from rest_framework import serializers
from .models import Listing, ListingImage


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image', 'alt_text', 'sort_order', 'is_primary', 'created_at']


class ListingSerializer(serializers.ModelSerializer):
    """Serializer for listing list view"""
    images = ListingImageSerializer(many=True, read_only=True)
    owner_name = serializers.SerializerMethodField()
    owner_verified = serializers.SerializerMethodField()
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    owner_avatar = serializers.CharField(source='owner.avatar_url', read_only=True)
    
    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'property_type', 'status',
            'address', 'city', 'postal_code', 'latitude', 'longitude', 'hide_exact_address',
            'surface_area', 'num_bedrooms', 'num_bathrooms', 'floor_number', 'total_floors',
            'furnished', 'rent_monthly', 'charges_included', 'charges_amount',
            'deposit_amount', 'agency_fees', 'available_from', 'minimum_stay_months',
            'maximum_stay_months', 'amenities', 'nearby_transport', 'nearby_universities',
            'smoking_allowed', 'pets_allowed', 'couples_allowed', 'parties_allowed',
            'images', 'owner_id', 'owner_name', 'owner_avatar', 'owner_verified', 'view_count', 'avg_rating',
            'review_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'view_count', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"

    def get_owner_verified(self, obj):
        return obj.owner.verification_status == 'verified'


class ListingDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed listing view"""
    images = ListingImageSerializer(many=True, read_only=True)
    owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'view_count', 'created_at', 'updated_at']

    def get_owner(self, obj):
        return {
            'id': obj.owner.id,
            'first_name': obj.owner.first_name,
            'last_name': obj.owner.last_name,
            'avatar_url': obj.owner.avatar_url,
            'verified': obj.owner.verification_status == 'verified',
            'average_rating': obj.owner.avg_rating,
        }
