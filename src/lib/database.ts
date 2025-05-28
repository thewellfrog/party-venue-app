import { supabase, supabaseAdmin } from './supabase'
import type { Venue, PartyPackage, City, CityDistrict } from './types'

// Public database functions (using anon key)
export async function getPublishedVenues(filters?: {
  city?: string
  borough?: string
  venueTypes?: string[]
  minAge?: number
  maxAge?: number
  limit?: number
}) {
  try {
    let query = supabase
      .from('venues')
      .select(`
        *,
        party_packages (*)
      `)
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('name')

    // Apply filters
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }

    if (filters?.borough) {
      query = query.ilike('borough', `%${filters.borough}%`)
    }

    if (filters?.venueTypes && filters.venueTypes.length > 0) {
      query = query.overlaps('venue_type', filters.venueTypes)
    }

    if (filters?.minAge !== undefined && filters?.maxAge !== undefined) {
      query = query
        .lte('min_age', filters.maxAge)
        .gte('max_age', filters.minAge)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching venues:', error)
      return { venues: [], error }
    }

    return { venues: data || [], error: null }
  } catch (error) {
    console.error('Error in getPublishedVenues:', error)
    return { venues: [], error }
  }
}

export async function getVenueBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        party_packages (*),
        venue_faqs (*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Error fetching venue:', error)
      return { venue: null, error }
    }

    return { venue: data, error: null }
  } catch (error) {
    console.error('Error in getVenueBySlug:', error)
    return { venue: null, error }
  }
}

export async function getCities() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching cities:', error)
      return { cities: [], error }
    }

    return { cities: data || [], error: null }
  } catch (error) {
    console.error('Error in getCities:', error)
    return { cities: [], error }
  }
}

export async function getCityDistricts(cityId: string) {
  try {
    const { data, error } = await supabase
      .from('city_districts')
      .select('*')
      .eq('city_id', cityId)
      .order('name')

    if (error) {
      console.error('Error fetching districts:', error)
      return { districts: [], error }
    }

    return { districts: data || [], error: null }
  } catch (error) {
    console.error('Error in getCityDistricts:', error)
    return { districts: [], error }
  }
}

// Admin database functions (using service role key)
export async function getScrapingQueueStats() {
  try {
    const { data, error } = await supabaseAdmin
      .from('scraping_queue')
      .select('status')

    if (error) {
      console.error('Error fetching scraping stats:', error)
      return { stats: {}, error }
    }

    const stats = (data || []).reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})

    return { stats, error: null }
  } catch (error) {
    console.error('Error in getScrapingQueueStats:', error)
    return { stats: {}, error }
  }
}

export async function getVenuesForReview(limit = 20) {
  try {
    const { data, error } = await supabaseAdmin
      .from('scraping_queue')
      .select('*')
      .eq('status', 'review')
      .order('confidence_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching venues for review:', error)
      return { venues: [], error }
    }

    return { venues: data || [], error: null }
  } catch (error) {
    console.error('Error in getVenuesForReview:', error)
    return { venues: [], error }
  }
}

export async function createVenueFromExtraction(extractedData: any, scrapingQueueId: string) {
  try {
    const venueData = extractedData.venue
    if (!venueData) {
      throw new Error('No venue data in extraction')
    }

    // Create venue
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .insert({
        slug: generateSlug(venueData.name, venueData.city),
        name: venueData.name,
        description: venueData.description,
        venue_type: venueData.venue_type || ['other'],
        address_line_1: venueData.address_line_1,
        address_line_2: venueData.address_line_2,
        city: venueData.city,
        borough: venueData.borough,
        postcode: venueData.postcode,
        country: venueData.country || 'UK',
        phone: venueData.phone,
        email: venueData.email,
        website: venueData.website,
        parking_info: venueData.parking_info,
        parking_free: venueData.parking_free,
        max_children: venueData.max_children,
        max_adults: venueData.max_adults,
        min_age: venueData.min_age,
        max_age: venueData.max_age,
        safety_certifications: venueData.safety_certifications || [],
        staff_dbs_checked: venueData.staff_dbs_checked,
        first_aid_trained: venueData.first_aid_trained,
        food_provided: venueData.food_provided,
        outside_food_allowed: venueData.outside_food_allowed,
        allergy_accommodations: venueData.allergy_accommodations,
        allergy_info: venueData.allergy_info,
        private_party_room: venueData.private_party_room,
        adults_must_stay: venueData.adults_must_stay,
        status: 'draft', // Start as draft for review
        images: [],
        age_groups: []
      })
      .select()
      .single()

    if (venueError) {
      console.error('Error creating venue:', venueError)
      return { venue: null, error: venueError }
    }

    // Create packages if they exist
    if (extractedData.packages && extractedData.packages.length > 0) {
      const packagesData = extractedData.packages.map((pkg: any) => ({
        venue_id: venue.id,
        name: pkg.name,
        description: pkg.description,
        base_price: pkg.base_price,
        base_includes_children: pkg.base_includes_children,
        additional_child_price: pkg.additional_child_price,
        duration_minutes: pkg.duration_minutes,
        activities_included: pkg.activities_included || [],
        food_included: pkg.food_included || [],
        decorations_included: [],
        additional_costs: pkg.additional_costs || [],
        what_to_bring: [],
        deposit_required: pkg.deposit_required,
        advance_booking_days: pkg.advance_booking_days
      }))

      const { error: packagesError } = await supabaseAdmin
        .from('party_packages')
        .insert(packagesData)

      if (packagesError) {
        console.error('Error creating packages:', packagesError)
      }
    }

    // Update scraping queue item
    await supabaseAdmin
      .from('scraping_queue')
      .update({
        status: 'completed',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', scrapingQueueId)

    return { venue, error: null }
  } catch (error) {
    console.error('Error in createVenueFromExtraction:', error)
    return { venue: null, error }
  }
}

function generateSlug(name: string, city: string): string {
  const combined = `${name} ${city}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}