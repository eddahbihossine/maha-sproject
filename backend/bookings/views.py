from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Max, Count, Prefetch
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Booking, Message
from .serializers import BookingSerializer, MessageSerializer, ConversationSerializer
from listings.models import Listing

User = get_user_model()


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Booking CRUD operations
    """
    queryset = Booking.objects.select_related('listing', 'student').all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'check_in_date']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        # Students see their own bookings
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        
        # Owners see bookings for their listings
        elif user.role == 'owner':
            queryset = queryset.filter(listing__owner=user)
        
        # Admins see all
        elif user.role == 'admin':
            pass
        else:
            queryset = queryset.none()
        
        return queryset

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a booking (owners only)"""
        booking = self.get_object()
        
        # Check if user is the owner
        if booking.listing.owner != request.user:
            return Response(
                {'error': 'Only the property owner can accept this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'pending':
            return Response(
                {'error': 'Only pending bookings can be accepted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'accepted'
        booking.accepted_at = timezone.now()
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a booking (owners only)"""
        booking = self.get_object()
        
        # Check if user is the owner
        if booking.listing.owner != request.user:
            return Response(
                {'error': 'Only the property owner can reject this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'pending':
            return Response(
                {'error': 'Only pending bookings can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'rejected'
        booking.rejected_at = timezone.now()
        booking.owner_response = request.data.get('message', '')
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking (students only)"""
        booking = self.get_object()
        
        # Check if user is the student
        if booking.student != request.user:
            return Response(
                {'error': 'Only the student can cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status not in ['pending', 'accepted']:
            return Response(
                {'error': 'Only pending or accepted bookings can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.cancelled_at = timezone.now()
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Message CRUD operations
    """
    queryset = Message.objects.select_related('sender', 'recipient', 'listing').all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        # Users see messages they sent or received
        queryset = queryset.filter(Q(sender=user) | Q(recipient=user))
        
        # Filter by conversation partner
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(
                Q(sender=user, recipient_id=user_id) |
                Q(sender_id=user_id, recipient=user)
            )
        
        # Filter by listing
        listing_id = self.request.query_params.get('listing_id')
        if listing_id:
            queryset = queryset.filter(listing_id=listing_id)
        
        return queryset

    def perform_create(self, serializer):
        """Create a new message"""
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get all conversation threads for the current user"""
        user = request.user
        
        # Get all users the current user has exchanged messages with
        sent_to = Message.objects.filter(sender=user).values_list('recipient', flat=True).distinct()
        received_from = Message.objects.filter(recipient=user).values_list('sender', flat=True).distinct()
        
        # Combine and get unique user IDs
        conversation_user_ids = set(sent_to) | set(received_from)
        
        conversations = []
        for user_id in conversation_user_ids:
            # Get the last message in the conversation
            last_message = Message.objects.filter(
                Q(sender=user, recipient_id=user_id) |
                Q(sender_id=user_id, recipient=user)
            ).order_by('-created_at').first()
            
            if last_message:
                # Get unread count
                unread_count = Message.objects.filter(
                    sender_id=user_id,
                    recipient=user,
                    is_read=False
                ).count()
                
                # Get the other user's details
                try:
                    other_user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    continue
                
                # Get associated listing if any
                listing = last_message.listing
                
                conversations.append({
                    'user_id': other_user.id,
                    'user_name': other_user.get_full_name() or other_user.username,
                    'user_avatar': other_user.avatar_url or '',
                    'user_role': other_user.role,
                    'listing_id': listing.id if listing else None,
                    'listing_title': listing.title if listing else None,
                    'last_message': last_message.content,
                    'last_message_date': last_message.created_at,
                    'unread_count': unread_count
                })
        
        # Sort by last message date
        conversations.sort(key=lambda x: x['last_message_date'], reverse=True)
        
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get', 'post'],
        url_path=r'threads/(?P<user_id>[^/.]+)',
    )
    def threads(self, request, user_id=None):
        """Compatibility endpoint for chat UIs.

        - GET  /threads/{user_id}/  -> messages between request.user and user_id (ascending)
        - POST /threads/{user_id}/  -> send message to user_id
        """
        if not user_id:
            raise ValidationError({'user_id': 'user_id is required'})

        if request.method == 'GET':
            qs = Message.objects.select_related('sender', 'recipient', 'listing').filter(
                Q(sender=request.user, recipient_id=user_id)
                | Q(sender_id=user_id, recipient=request.user)
            ).order_by('created_at')
            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)

        # POST
        content = (request.data.get('content') or '').strip()
        listing_id = request.data.get('listingId') or request.data.get('listing_id')
        booking_id = request.data.get('booking') or request.data.get('booking_id')

        if not content:
            raise ValidationError({'content': 'Message content is required'})

        payload = {
            'recipient': user_id,
            'content': content,
        }
        if listing_id is not None:
            payload['listing'] = listing_id
        if booking_id is not None:
            payload['booking'] = booking_id

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        serializer.save(sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        
        # Only the recipient can mark as read
        if message.recipient != request.user:
            return Response(
                {'error': 'Only the recipient can mark this message as read'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.is_read = True
        message.read_at = timezone.now()
        message.save()
        
        serializer = self.get_serializer(message)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_conversation_as_read(self, request):
        """Mark all messages in a conversation as read"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark all unread messages from this user as read
        messages = Message.objects.filter(
            sender_id=user_id,
            recipient=request.user,
            is_read=False
        )
        
        count = messages.update(is_read=True, read_at=timezone.now())
        
        return Response({'marked_as_read': count})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get total unread message count"""
        count = Message.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        # Keep legacy shape
        return Response({'unread_count': count})

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count_dash(self, request):
        """Alias for clients that expect /unread-count."""
        count = Message.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'count': count})
