from rest_framework import serializers
from .models import Booking, Message
from users.models import User
from listings.models import Listing


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages between users"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar_url', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    recipient_avatar = serializers.CharField(source='recipient.avatar_url', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'sender_avatar',
            'recipient', 'recipient_name', 'recipient_avatar',
            'listing', 'listing_title', 'booking',
            'content', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'created_at']

    def create(self, validated_data):
        # Set sender to the current user
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ConversationSerializer(serializers.Serializer):
    """Serializer for conversation threads"""
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    user_avatar = serializers.CharField()
    user_role = serializers.CharField()
    listing_id = serializers.IntegerField(allow_null=True)
    listing_title = serializers.CharField(allow_null=True)
    last_message = serializers.CharField()
    last_message_date = serializers.DateTimeField()
    unread_count = serializers.IntegerField()


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings"""
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_address = serializers.CharField(source='listing.address', read_only=True)
    listing_city = serializers.CharField(source='listing.city', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    owner_id = serializers.IntegerField(source='listing.owner.id', read_only=True)
    owner_name = serializers.CharField(source='listing.owner.get_full_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'listing', 'listing_title', 'listing_address', 'listing_city',
            'student', 'student_name', 'student_email',
            'owner_id', 'owner_name',
            'status', 'check_in_date', 'check_out_date', 'num_guests',
            'monthly_rent', 'total_months', 'total_amount', 'deposit_paid',
            'student_message', 'owner_response',
            'created_at', 'updated_at', 'accepted_at', 'rejected_at', 'cancelled_at'
        ]
        read_only_fields = [
            'id', 'student', 'total_amount', 'created_at', 'updated_at',
            'accepted_at', 'rejected_at', 'cancelled_at'
        ]

    def create(self, validated_data):
        # Set student to the current user
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, data):
        # Ensure check_out_date is after check_in_date
        if data.get('check_out_date') and data.get('check_in_date'):
            if data['check_out_date'] <= data['check_in_date']:
                raise serializers.ValidationError("Check-out date must be after check-in date")
        
        # Ensure the user is a student
        if self.context['request'].user.role != 'student':
            raise serializers.ValidationError("Only students can create bookings")
        
        return data
