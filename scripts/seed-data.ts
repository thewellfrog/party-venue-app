#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local')
console.log('Loading env from:', envPath)
const result = config({ path: envPath })
console.log('Env loaded:', !!result.parsed)
console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)

async function seedVenues(supabaseAdmin: any) {
  const venues = [
    {
      slug: 'abc-soft-play-center-london',
      name: 'ABC Soft Play Center',
      description: 'A fantastic indoor soft play center perfect for young children with dedicated party areas and great facilities for parents.',
      venue_type: ['soft_play'],
      address_line_1: '123 High Street',
      city: 'London',
      borough: 'Hackney',
      postcode: 'E8 2AA',
      country: 'UK',
      latitude: 51.5074,
      longitude: -0.1278,
      phone: '020 7123 4567',
      email: 'parties@abcsoftplay.co.uk',
      website: 'https://abcsoftplay.co.uk',
      parking_info: 'Free parking for 20 cars',
      parking_free: true,
      wheelchair_accessible: true,
      baby_changing: true,
      max_children: 25,
      max_adults: 30,
      private_party_room: true,
      exclusive_hire_available: false,
      simultaneous_parties: true,
      min_age: 1,
      max_age: 8,
      age_groups: ['toddler', 'preschool'],
      staff_dbs_checked: true,
      first_aid_trained: true,
      safety_certifications: ['ROSPA'],
      staff_ratio: '1:8 for under 5s',
      food_provided: true,
      outside_food_allowed: false,
      allergy_accommodations: true,
      allergy_info: 'Full allergen information available. Can accommodate most dietary requirements with advance notice.',
      halal_options: true,
      vegetarian_options: true,
      parent_seating_area: true,
      cafe_onsite: true,
      wifi_available: true,
      viewing_area: true,
      adults_must_stay: true,
      images: [],
      opening_hours: {
        monday: '9:00-17:00',
        tuesday: '9:00-17:00', 
        wednesday: '9:00-17:00',
        thursday: '9:00-17:00',
        friday: '9:00-17:00',
        saturday: '9:00-18:00',
        sunday: '10:00-17:00'
      },
      meta_title: 'ABC Soft Play Center - Kids Party Venue in Hackney, London',
      meta_description: 'Book your child\'s party at ABC Soft Play Center in Hackney. Dedicated party rooms, included food, and great facilities for parents.',
      status: 'published',
      featured: true,
      verified: true,
    },
    {
      slug: 'bounce-trampoline-park-manchester',
      name: 'Bounce Trampoline Park',
      description: 'High-energy trampoline park with dedicated party areas, perfect for active kids who love to jump and bounce.',
      venue_type: ['trampoline'],
      address_line_1: '456 Industrial Estate',
      city: 'Manchester',
      postcode: 'M1 2BB',
      country: 'UK',
      latitude: 53.4808,
      longitude: -2.2426,
      phone: '0161 123 4567',
      email: 'parties@bouncepark.co.uk',
      website: 'https://bouncepark.co.uk',
      parking_info: 'Large free car park',
      parking_free: true,
      wheelchair_accessible: false,
      baby_changing: true,
      max_children: 20,
      max_adults: 25,
      private_party_room: true,
      exclusive_hire_available: true,
      simultaneous_parties: false,
      min_age: 5,
      max_age: 16,
      age_groups: ['primary', 'tween'],
      staff_dbs_checked: true,
      first_aid_trained: true,
      safety_certifications: ['SafeWise'],
      staff_ratio: '1:10',
      food_provided: true,
      outside_food_allowed: true,
      allergy_accommodations: true,
      allergy_info: 'Please inform us of any allergies when booking',
      halal_options: false,
      vegetarian_options: true,
      parent_seating_area: true,
      cafe_onsite: false,
      wifi_available: true,
      viewing_area: true,
      adults_must_stay: false,
      images: [],
      opening_hours: {
        monday: '10:00-21:00',
        tuesday: '10:00-21:00',
        wednesday: '10:00-21:00', 
        thursday: '10:00-21:00',
        friday: '10:00-22:00',
        saturday: '9:00-22:00',
        sunday: '10:00-20:00'
      },
      meta_title: 'Bounce Trampoline Park - Kids Party Venue in Manchester',
      meta_description: 'Book an action-packed party at Bounce Trampoline Park Manchester. Private party rooms and exciting activities for active kids.',
      status: 'published',
      featured: false,
      verified: true,
    }
  ]

  const { data, error } = await supabaseAdmin
    .from('venues')
    .insert(venues)
    .select()

  if (error) {
    console.error('Error inserting venues:', JSON.stringify(error, null, 2))
    return
  }

  console.log(`✓ Inserted ${data?.length} venues`)
  return data
}

async function seedPackages(venues: any[], supabaseAdmin: any) {
  const packages = [
    // ABC Soft Play packages
    {
      venue_id: venues[0].id,
      name: 'Classic Party Package',
      description: 'Perfect for younger children with 2 hours of soft play and dedicated party room.',
      base_price: 180,
      base_includes_children: 10,
      additional_child_price: 12,
      adult_charge: 0,
      duration_minutes: 120,
      setup_time_included: true,
      cleanup_time_included: true,
      min_children: 8,
      max_children: 25,
      max_adults: 30,
      suitable_age_min: 1,
      suitable_age_max: 8,
      activities_included: ['2 hours soft play access', '45 minutes party room', 'Party games with staff'],
      food_included: ['Pizza slices', 'Juice boxes', 'Birthday cake'],
      party_host_included: true,
      decorations_included: ['Balloons', 'Table decorations', 'Party hats'],
      additional_costs: ['Face painter £50', 'Extra adult food £8 per person'],
      what_to_bring: ['Birthday cake if not included', 'Party bags if desired'],
      deposit_required: 50,
      advance_booking_days: 14,
      cancellation_policy: 'Full refund up to 48 hours before party. 50% refund within 48 hours.',
    },
    {
      venue_id: venues[0].id,
      name: 'Premium Party Package',
      description: 'Our deluxe package with exclusive use of party room and extra activities.',
      base_price: 280,
      base_includes_children: 15,
      additional_child_price: 15,
      adult_charge: 8,
      duration_minutes: 150,
      setup_time_included: true,
      cleanup_time_included: true,
      min_children: 10,
      max_children: 25,
      max_adults: 30,
      suitable_age_min: 1,
      suitable_age_max: 8,
      activities_included: ['2.5 hours soft play access', '1 hour private party room', 'Party games', 'Treasure hunt'],
      food_included: ['Hot meal', 'Drinks', 'Birthday cake', 'Party bags'],
      party_host_included: true,
      decorations_included: ['Themed decorations', 'Balloons', 'Table setup'],
      additional_costs: ['Photography package £30'],
      what_to_bring: ['Nothing - everything included!'],
      deposit_required: 75,
      advance_booking_days: 21,
      cancellation_policy: 'Full refund up to 7 days before party. 50% refund within 7 days.',
    },
    // Bounce Trampoline packages
    {
      venue_id: venues[1].id,
      name: 'Jump Party Package',
      description: 'High-energy trampoline party perfect for active kids.',
      base_price: 220,
      base_includes_children: 12,
      additional_child_price: 18,
      adult_charge: 0,
      duration_minutes: 90,
      setup_time_included: true,
      cleanup_time_included: false,
      min_children: 8,
      max_children: 20,
      max_adults: 25,
      suitable_age_min: 5,
      suitable_age_max: 16,
      activities_included: ['1 hour trampoline access', '30 minutes party room', 'Safety briefing'],
      food_included: ['Pizza', 'Soft drinks', 'Ice cream'],
      party_host_included: true,
      decorations_included: ['Basic decorations'],
      additional_costs: ['Grip socks £2.50 per child', 'Extra adults £5 each'],
      what_to_bring: ['Birthday cake', 'Comfortable clothes', 'Water bottles'],
      deposit_required: 60,
      advance_booking_days: 10,
      cancellation_policy: 'Full refund up to 72 hours before party.',
    }
  ]

  const { data, error } = await supabaseAdmin
    .from('party_packages')
    .insert(packages)
    .select()

  if (error) {
    console.error('Error inserting packages:', JSON.stringify(error, null, 2))
    return
  }

  console.log(`✓ Inserted ${data?.length} party packages`)
}

async function main() {
  console.log('Seeding development data...')
  
  // Import supabase client after env vars are loaded
  const { supabaseAdmin } = await import('./lib/supabase-script')
  
  try {
    const venues = await seedVenues(supabaseAdmin)
    if (venues) {
      await seedPackages(venues, supabaseAdmin)
    }
    
    console.log('✓ Seeding complete!')
    
  } catch (error) {
    console.error('Seeding failed:', error)
  }
}

if (require.main === module) {
  main()
}