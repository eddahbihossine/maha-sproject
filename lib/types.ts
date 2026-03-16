// User types
export type UserRole = 'student' | 'owner' | 'admin'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: UserRole
  verificationStatus: VerificationStatus
  preferredLanguage: 'en' | 'fr'
  createdAt: string
}

export interface StudentProfile extends User {
  role: 'student'
  university?: string
  studyProgram?: string
  studyStartDate?: string
  studyEndDate?: string
  budgetMin?: number
  budgetMax?: number
  preferredCities?: string[]
}

export interface OwnerProfile extends User {
  role: 'owner'
  companyName?: string
  totalListings: number
  avgRating: number
  responseRate: number
  responseTimeHours?: number
}

// Listing types
export type PropertyType = 'studio' | 'apartment' | 'room' | 'shared' | 'residence'
export type ListingStatus = 'draft' | 'active' | 'paused' | 'rented' | 'archived'

export interface ListingImage {
  id: string
  url: string
  thumbnailUrl?: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
}

export interface Listing {
  id: string
  ownerId: string
  ownerName: string
  ownerAvatar?: string
  title: string
  description: string
  propertyType: PropertyType
  status: ListingStatus
  
  // Location
  address: string
  city: string
  postalCode: string
  latitude?: number
  longitude?: number
  hideExactAddress: boolean
  
  // Property details
  surfaceArea: number
  numBedrooms: number
  numBathrooms: number
  floorNumber?: number
  totalFloors?: number
  furnished: boolean
  
  // Pricing (in MAD)
  rentMonthly: number
  chargesIncluded: boolean
  chargesAmount?: number
  depositAmount: number
  agencyFees?: number
  
  // Availability
  availableFrom: string
  minimumStayMonths: number
  maximumStayMonths?: number
  
  // Features
  amenities: string[]
  rules: {
    smoking: boolean
    pets: boolean
    couples: boolean
    parties: boolean
  }
  nearbyTransport: {
    type: string
    name: string
    distance: number
  }[]
  nearbyUniversities: {
    name: string
    distance: number
  }[]
  
  // Media
  images: ListingImage[]
  
  // Stats
  viewCount: number
  favoriteCount: number
  
  // Verification
  verified: boolean
  verifiedAt?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface ListingFilters {
  city?: string
  propertyType?: PropertyType
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  furnished?: boolean
  minSurface?: number
  maxSurface?: number
}

// Booking types
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'

export interface BookingRequest {
  id: string
  listingId: string
  listing: Pick<Listing, 'id' | 'title' | 'city' | 'rentMonthly' | 'images'>
  studentId: string
  student: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>
  ownerId: string
  status: BookingStatus
  moveInDate: string
  moveOutDate?: string
  introductionMessage: string
  rentAmount: number
  depositAmount: number
  ownerResponse?: string
  respondedAt?: string
  createdAt: string
  expiresAt: string
}

// Message types
export type MessageType = 'text' | 'image' | 'document' | 'system'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  messageType: MessageType
  content: string
  attachmentUrl?: string
  attachmentName?: string
  readAt?: string
  createdAt: string
}

export interface Conversation {
  id: string
  listingId?: string
  listingTitle?: string
  listingImage?: string
  studentId: string
  studentName: string
  studentAvatar?: string
  ownerId: string
  ownerName: string
  ownerAvatar?: string
  lastMessageText?: string
  lastMessageAt?: string
  lastMessageBy?: string
  unreadCount: number
  isActive: boolean
  createdAt: string
}

// Favorites
export interface Favorite {
  id: string
  userId: string
  listingId: string
  listing: Pick<Listing, 'id' | 'title' | 'city' | 'rentMonthly' | 'images' | 'surfaceArea' | 'numBedrooms' | 'propertyType'>
  notes?: string
  createdAt: string
}

// Reviews
export interface Review {
  id: string
  listingId: string
  bookingId: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  overallRating: number
  accuracyRating?: number
  communicationRating?: number
  locationRating?: number
  valueRating?: number
  content?: string
  response?: string
  responseAt?: string
  createdAt: string
}

// Search & Filters
export interface SearchFilters {
  query?: string
  city?: string
  minRent?: number
  maxRent?: number
  propertyType?: PropertyType[]
  minSurface?: number
  maxSurface?: number
  bedrooms?: number[]
  furnished?: boolean
  availableFrom?: string
  amenities?: string[]
  nearUniversity?: string
  verified?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'distance'
}

// Admin types
export interface AdminStats {
  totalUsers: number
  totalListings: number
  activeListings: number
  pendingVerifications: number
  pendingReports: number
  totalBookings: number
  monthlyRevenue: number
  userGrowthPercent: number
  listingGrowthPercent: number
}

export interface Report {
  id: string
  reporterId: string
  reporterName: string
  entityType: 'user' | 'listing' | 'message' | 'review'
  entityId: string
  reason: string
  description?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  resolvedBy?: string
  resolutionNotes?: string
  createdAt: string
  resolvedAt?: string
}
