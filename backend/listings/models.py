from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User


class Listing(models.Model):
    """Property Listing Model"""
    PROPERTY_TYPE_CHOICES = [
        ('studio', 'Studio'),
        ('apartment', 'Apartment'),
        ('room', 'Room'),
        ('shared', 'Shared Room'),
        ('residence', 'Student Residence'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('rented', 'Rented'),
        ('archived', 'Archived'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=200)
    description = models.TextField()
    property_type = models.CharField(max_length=15, choices=PROPERTY_TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    
    # Location
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    hide_exact_address = models.BooleanField(default=True)
    
    # Property details
    surface_area = models.IntegerField(validators=[MinValueValidator(1)])
    num_bedrooms = models.IntegerField(validators=[MinValueValidator(0)])
    num_bathrooms = models.IntegerField(validators=[MinValueValidator(1)])
    floor_number = models.IntegerField(blank=True, null=True)
    total_floors = models.IntegerField(blank=True, null=True)
    furnished = models.BooleanField(default=True)
    
    # Pricing (in EUR)
    rent_monthly = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    charges_included = models.BooleanField(default=False)
    charges_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    agency_fees = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Availability
    available_from = models.DateField()
    minimum_stay_months = models.IntegerField(validators=[MinValueValidator(1)])
    maximum_stay_months = models.IntegerField(blank=True, null=True)
    
    # Features
    amenities = models.JSONField(default=list, blank=True)
    nearby_transport = models.JSONField(default=list, blank=True)
    nearby_universities = models.JSONField(default=list, blank=True)
    
    # Rules
    smoking_allowed = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)
    couples_allowed = models.BooleanField(default=True)
    parties_allowed = models.BooleanField(default=False)
    
    # Metrics
    view_count = models.IntegerField(default=0)
    favorite_count = models.IntegerField(default=0)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'listings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['city', 'status']),
            models.Index(fields=['property_type', 'status']),
            models.Index(fields=['rent_monthly']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.city}"


class ListingImage(models.Model):
    """Images for listings"""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listings/%Y/%m/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'listing_images'
        ordering = ['sort_order', '-is_primary']
    
    def __str__(self):
        return f"Image for {self.listing.title}"


class Review(models.Model):
    """Reviews for listings"""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    cleanliness_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], blank=True, null=True)
    location_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], blank=True, null=True)
    value_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ['listing', 'user']
    
    def __str__(self):
        return f"Review by {self.user.username} for {self.listing.title}"
