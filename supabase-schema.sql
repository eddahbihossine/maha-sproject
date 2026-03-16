-- Supabase SQL Schema for Student Accommodation Platform
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- User Profiles (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('student', 'owner', 'admin')) default 'student',
  verification_status text check (verification_status in ('pending', 'verified', 'rejected')) default 'pending',
  avatar_url text,
  phone_number text,
  preferred_language text default 'en',
  
  -- Student fields
  university text,
  study_program text,
  study_start_date date,
  study_end_date date,
  budget_min decimal(10,2),
  budget_max decimal(10,2),
  
  -- Owner fields
  company_name text,
  total_listings integer default 0,
  avg_rating decimal(3,2) default 0,
  response_rate decimal(5,2) default 0,
  response_time_hours integer,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Listings
create table if not exists public.listings (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.user_profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  property_type text check (property_type in ('studio', 'apartment', 'room', 'shared', 'residence')) not null,
  status text check (status in ('draft', 'active', 'paused', 'rented', 'archived')) default 'draft',
  
  -- Location
  address text not null,
  city text not null,
  postal_code text not null,
  latitude decimal(9,6),
  longitude decimal(9,6),
  hide_exact_address boolean default true,
  
  -- Property details
  surface_area integer not null check (surface_area > 0),
  num_bedrooms integer not null check (num_bedrooms >= 0),
  num_bathrooms integer not null check (num_bathrooms >= 1),
  floor_number integer,
  total_floors integer,
  furnished boolean default true,
  
  -- Pricing
  rent_monthly decimal(10,2) not null check (rent_monthly >= 0),
  charges_included boolean default false,
  charges_amount decimal(10,2),
  deposit_amount decimal(10,2) not null check (deposit_amount >= 0),
  agency_fees decimal(10,2),
  
  -- Availability
  available_from date not null,
  minimum_stay_months integer not null check (minimum_stay_months >= 1),
  maximum_stay_months integer,
  
  -- Features
  amenities jsonb default '[]'::jsonb,
  nearby_transport jsonb default '[]'::jsonb,
  nearby_universities jsonb default '[]'::jsonb,
  
  -- Rules
  smoking_allowed boolean default false,
  pets_allowed boolean default false,
  couples_allowed boolean default true,
  parties_allowed boolean default false,
  
  -- Metrics
  view_count integer default 0,
  favorite_count integer default 0,
  avg_rating decimal(3,2) default 0,
  review_count integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Listing Images
create table if not exists public.listing_images (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  image_url text not null,
  alt_text text,
  is_primary boolean default false,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  student_id uuid references public.user_profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed')) default 'pending',
  
  -- Booking details
  check_in_date date not null,
  check_out_date date not null,
  num_guests integer default 1 check (num_guests >= 1),
  
  -- Pricing
  monthly_rent decimal(10,2) not null,
  total_months integer not null check (total_months >= 1),
  total_amount decimal(10,2) not null,
  deposit_paid boolean default false,
  
  -- Messages
  student_message text,
  owner_response text,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  accepted_at timestamp with time zone,
  rejected_at timestamp with time zone,
  cancelled_at timestamp with time zone
);

-- Reviews
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  cleanliness_rating integer check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
  location_rating integer check (location_rating >= 1 and location_rating <= 5),
  value_rating integer check (value_rating >= 1 and value_rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(listing_id, user_id)
);

-- Messages
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.user_profiles(id) on delete cascade not null,
  recipient_id uuid references public.user_profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  content text not null,
  is_read boolean default false,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_listings_owner on public.listings(owner_id);
create index if not exists idx_listings_city_status on public.listings(city, status);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_bookings_student on public.bookings(student_id);
create index if not exists idx_bookings_listing on public.bookings(listing_id);
create index if not exists idx_messages_recipient_unread on public.messages(recipient_id, is_read);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

-- RLS Policies

-- User Profiles: Users can read all profiles, but only update their own
create policy "Public profiles are viewable by everyone"
  on public.user_profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Listings: Everyone can read active listings, owners can manage their own
create policy "Active listings are viewable by everyone"
  on public.listings for select
  using (status = 'active' or owner_id = auth.uid());

create policy "Owners can insert their own listings"
  on public.listings for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own listings"
  on public.listings for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own listings"
  on public.listings for delete
  using (auth.uid() = owner_id);

-- Listing Images: Follow parent listing permissions
create policy "Images are viewable for viewable listings"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings
      where id = listing_id
      and (status = 'active' or owner_id = auth.uid())
    )
  );

create policy "Owners can manage images of their listings"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings
      where id = listing_id
      and owner_id = auth.uid()
    )
  );

-- Bookings: Students and listing owners can view relevant bookings
create policy "Users can view their own bookings"
  on public.bookings for select
  using (
    auth.uid() = student_id
    or auth.uid() in (
      select owner_id from public.listings where id = listing_id
    )
  );

create policy "Students can create bookings"
  on public.bookings for insert
  with check (auth.uid() = student_id);

create policy "Students and owners can update bookings"
  on public.bookings for update
  using (
    auth.uid() = student_id
    or auth.uid() in (
      select owner_id from public.listings where id = listing_id
    )
  );

-- Reviews: Everyone can read, only verified bookings can create
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Users can create reviews for completed bookings"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.bookings
      where listing_id = reviews.listing_id
      and student_id = auth.uid()
      and status = 'completed'
    )
  );

-- Messages: Users can view messages they sent or received
create policy "Users can view their messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Recipients can update message read status"
  on public.messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger set_updated_at before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();
create trigger set_updated_at before update on public.listings
  for each row execute procedure public.handle_updated_at();
create trigger set_updated_at before update on public.bookings
  for each row execute procedure public.handle_updated_at();
create trigger set_updated_at before update on public.reviews
  for each row execute procedure public.handle_updated_at();

-- Success message
do $$
begin
  raise notice '✅ Supabase schema created successfully!';
  raise notice 'Next steps:';
  raise notice '1. Enable Email auth in Authentication > Providers';
  raise notice '2. Copy your project URL and anon key to .env.local';
  raise notice '3. Start your Next.js app: pnpm dev';
end $$;
