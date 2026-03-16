from __future__ import annotations

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from listings.models import Listing


class Command(BaseCommand):
    help = "Seed demo owner + active listings for local development"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=6,
            help="Number of demo listings to create (default: 6)",
        )
        parser.add_argument(
            "--owner-email",
            type=str,
            default="owner@example.com",
            help="Owner email to create/use (default: owner@example.com)",
        )
        parser.add_argument(
            "--owner-password",
            type=str,
            default="OwnerPassword123!",
            help="Owner password if owner is created (default: OwnerPassword123!)",
        )

    def handle(self, *args, **options):
        count: int = options["count"]
        owner_email: str = options["owner_email"]
        owner_password: str = options["owner_password"]

        User = get_user_model()

        owner, created = User.objects.get_or_create(
            email=owner_email,
            defaults={
                "username": owner_email,
                "first_name": "Demo",
                "last_name": "Owner",
                "role": "owner",
                "verification_status": "verified",
            },
        )
        if created:
            owner.set_password(owner_password)
            owner.save(update_fields=["password"])
            self.stdout.write(self.style.SUCCESS(f"Created owner: {owner_email}"))
        else:
            # Ensure role is owner for demo
            if getattr(owner, "role", None) != "owner":
                owner.role = "owner"
                owner.save(update_fields=["role"])

        existing = Listing.objects.filter(owner=owner).count()
        to_create = max(0, count - existing)

        if to_create == 0:
            self.stdout.write(self.style.WARNING("Demo listings already exist; nothing to do."))
            return

        demo_data = [
            {
                "title": "Studio near Sorbonne",
                "description": "Bright studio, 10 min walk to university, bills optional.",
                "property_type": "studio",
                "city": "Paris",
                "postal_code": "75005",
                "address": "5 Rue des Écoles",
                "surface_area": 18,
                "num_bedrooms": 0,
                "num_bathrooms": 1,
                "furnished": True,
                "rent_monthly": 920,
                "charges_included": False,
                "charges_amount": 80,
                "deposit_amount": 920,
                "available_from": date.today() + timedelta(days=14),
                "minimum_stay_months": 3,
                "amenities": ["wifi", "heating"],
                "nearby_transport": ["Metro Line 10"],
                "nearby_universities": ["Sorbonne University"],
            },
            {
                "title": "Room in shared apartment - Lyon 7",
                "description": "Quiet room in a 3-bedroom flat, close to tram and shops.",
                "property_type": "shared",
                "city": "Lyon",
                "postal_code": "69007",
                "address": "21 Avenue Jean Jaurès",
                "surface_area": 72,
                "num_bedrooms": 3,
                "num_bathrooms": 1,
                "furnished": True,
                "rent_monthly": 520,
                "charges_included": True,
                "charges_amount": 0,
                "deposit_amount": 520,
                "available_from": date.today() + timedelta(days=7),
                "minimum_stay_months": 2,
                "amenities": ["wifi"],
                "nearby_transport": ["Tram T2"],
                "nearby_universities": ["Université Lyon 2"],
            },
            {
                "title": "Student residence - Montpellier",
                "description": "Modern residence with security and study spaces.",
                "property_type": "residence",
                "city": "Montpellier",
                "postal_code": "34000",
                "address": "8 Rue de l'Université",
                "surface_area": 20,
                "num_bedrooms": 0,
                "num_bathrooms": 1,
                "furnished": True,
                "rent_monthly": 610,
                "charges_included": True,
                "charges_amount": 0,
                "deposit_amount": 610,
                "available_from": date.today() + timedelta(days=21),
                "minimum_stay_months": 1,
                "amenities": ["wifi", "security"],
                "nearby_transport": ["Bus 6"],
                "nearby_universities": ["Université de Montpellier"],
            },
            {
                "title": "Apartment near campus - Toulouse",
                "description": "1-bedroom apartment, great for a couple, close to metro.",
                "property_type": "apartment",
                "city": "Toulouse",
                "postal_code": "31000",
                "address": "12 Rue du Taur",
                "surface_area": 35,
                "num_bedrooms": 1,
                "num_bathrooms": 1,
                "furnished": False,
                "rent_monthly": 780,
                "charges_included": False,
                "charges_amount": 60,
                "deposit_amount": 780,
                "available_from": date.today() + timedelta(days=30),
                "minimum_stay_months": 6,
                "amenities": ["heating"],
                "nearby_transport": ["Metro A"],
                "nearby_universities": ["Université Toulouse Capitole"],
                "couples_allowed": True,
            },
            {
                "title": "Cozy room - Bordeaux",
                "description": "Cozy furnished room with fast Wi‑Fi, near the river.",
                "property_type": "room",
                "city": "Bordeaux",
                "postal_code": "33000",
                "address": "3 Quai des Chartrons",
                "surface_area": 60,
                "num_bedrooms": 2,
                "num_bathrooms": 1,
                "furnished": True,
                "rent_monthly": 560,
                "charges_included": True,
                "charges_amount": 0,
                "deposit_amount": 560,
                "available_from": date.today() + timedelta(days=10),
                "minimum_stay_months": 3,
                "amenities": ["wifi"],
                "nearby_transport": ["Tram B"],
                "nearby_universities": ["Université de Bordeaux"],
            },
            {
                "title": "Studio - Lille center",
                "description": "Central studio, close to train station and universities.",
                "property_type": "studio",
                "city": "Lille",
                "postal_code": "59000",
                "address": "10 Rue Faidherbe",
                "surface_area": 16,
                "num_bedrooms": 0,
                "num_bathrooms": 1,
                "furnished": True,
                "rent_monthly": 670,
                "charges_included": False,
                "charges_amount": 50,
                "deposit_amount": 670,
                "available_from": date.today() + timedelta(days=5),
                "minimum_stay_months": 1,
                "amenities": ["wifi", "heating"],
                "nearby_transport": ["Gare Lille-Flandres"],
                "nearby_universities": ["Université de Lille"],
            },
        ]

        created_count = 0
        for i in range(to_create):
            payload = demo_data[i % len(demo_data)].copy()
            title = payload["title"]
            if Listing.objects.filter(owner=owner, title=title).exists():
                continue

            Listing.objects.create(
                owner=owner,
                status="active",
                **payload,
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created_count} demo active listings."))
