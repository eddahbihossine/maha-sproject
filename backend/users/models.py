from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('owner', 'Property Owner'),
        ('admin', 'Administrator'),
    ]
    
    VERIFICATION_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    verification_status = models.CharField(max_length=10, choices=VERIFICATION_CHOICES, default='pending')
    avatar_url = models.URLField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    preferred_language = models.CharField(max_length=2, default='en')
    
    # Student specific fields
    university = models.CharField(max_length=200, blank=True, null=True)
    study_program = models.CharField(max_length=200, blank=True, null=True)
    study_start_date = models.DateField(blank=True, null=True)
    study_end_date = models.DateField(blank=True, null=True)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Owner specific fields
    company_name = models.CharField(max_length=200, blank=True, null=True)
    total_listings = models.IntegerField(default=0)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    response_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    response_time_hours = models.IntegerField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
