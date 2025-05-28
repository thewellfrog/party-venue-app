export interface Venue {
  id: string
  slug: string
  name: string
  description?: string
  venue_type: string[]
  
  // Location
  address_line_1: string
  address_line_2?: string
  city: string
  borough?: string
  county?: string
  postcode: string
  country: string
  latitude?: number
  longitude?: number
  
  // Contact
  phone?: string
  email?: string
  website?: string
  booking_link?: string
  
  // Parent info
  parking_info?: string
  parking_free?: boolean
  wheelchair_accessible?: boolean
  baby_changing?: boolean
  
  // Capacity
  max_children?: number
  max_adults?: number
  private_party_room?: boolean
  exclusive_hire_available?: boolean
  simultaneous_parties?: boolean
  
  // Age suitability
  min_age?: number
  max_age?: number
  age_groups: string[]
  
  // Safety
  staff_dbs_checked?: boolean
  first_aid_trained?: boolean
  safety_certifications: string[]
  staff_ratio?: string
  
  // Food
  food_provided?: boolean
  outside_food_allowed?: boolean
  allergy_accommodations?: boolean
  allergy_info?: string
  halal_options?: boolean
  vegetarian_options?: boolean
  
  // Parent amenities
  parent_seating_area?: boolean
  cafe_onsite?: boolean
  wifi_available?: boolean
  viewing_area?: boolean
  adults_must_stay?: boolean
  
  // Media
  images: string[]
  featured_image?: string
  
  // Business hours
  opening_hours?: Record<string, string>
  
  // SEO
  meta_title?: string
  meta_description?: string
  
  // Status
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  verified: boolean
  last_scraped_at?: string
  source_url?: string
  
  created_at: string
  updated_at: string
}

export interface PartyPackage {
  id: string
  venue_id: string
  name: string
  description?: string
  
  // Pricing
  base_price?: number
  base_includes_children?: number
  additional_child_price?: number
  adult_charge?: number
  
  // Duration
  duration_minutes?: number
  setup_time_included?: boolean
  cleanup_time_included?: boolean
  
  // Capacity
  min_children?: number
  max_children?: number
  max_adults?: number
  
  // Age suitability
  suitable_age_min?: number
  suitable_age_max?: number
  
  // Inclusions
  activities_included: string[]
  food_included: string[]
  party_host_included?: boolean
  decorations_included: string[]
  
  // Additional costs
  additional_costs: string[]
  what_to_bring: string[]
  
  // Booking
  deposit_required?: number
  advance_booking_days?: number
  cancellation_policy?: string
  
  created_at: string
  updated_at: string
}

export interface City {
  id: string
  slug: string
  name: string
  county?: string
  meta_title?: string
  meta_description?: string
  content?: string
  venue_count: number
  created_at: string
  updated_at: string
}

export interface CityDistrict {
  id: string
  city_id: string
  slug: string
  name: string
  district_type: string
  meta_title?: string
  meta_description?: string
  content?: string
  venue_count: number
  created_at: string
  updated_at: string
}

export interface ScrapingQueueItem {
  id: string
  url: string
  venue_name?: string
  search_query?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'review'
  error_message?: string
  raw_html?: string
  extracted_data?: Record<string, unknown>
  confidence_score?: number
  created_at: string
  processed_at?: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface SearchFilters {
  location?: string
  radius?: number
  ageMin?: number
  ageMax?: number
  childrenCount?: number
  budgetPerChild?: number
  venueTypes?: string[]
  amenities?: string[]
  freeParking?: boolean
  foodIncluded?: boolean
  allergyFriendly?: boolean
  privateRoom?: boolean
  exclusiveHire?: boolean
}