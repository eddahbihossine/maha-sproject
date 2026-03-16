from django.db import models
from django.core.validators import MinValueValidator
from users.models import User
from listings.models import Listing


class Booking(models.Model):
    """Booking/Reservation Model"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='bookings')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Booking details
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    num_guests = models.IntegerField(validators=[MinValueValidator(1)], default=1)
    
    # Pricing
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    total_months = models.IntegerField(validators=[MinValueValidator(1)])
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_paid = models.BooleanField(default=False)
    
    # Messages
    student_message = models.TextField(blank=True)
    owner_response = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['listing', 'status']),
        ]
    
    def __str__(self):
        return f"Booking by {self.student.username} for {self.listing.title}"
    
    def save(self, *args, **kwargs):
        # Calculate total amount
        if self.monthly_rent and self.total_months:
            self.total_amount = self.monthly_rent * self.total_months
        super().save(*args, **kwargs)


class Message(models.Model):
    """Messaging between users"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', 'recipient']),
            models.Index(fields=['recipient', 'is_read']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"
