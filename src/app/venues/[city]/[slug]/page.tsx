'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Venue, PartyPackage } from '@/lib/types'

interface VenueDetailPageProps {
  params: Promise<{
    city: string
    slug: string
  }>
}

export default function VenueDetailPage({ params }: VenueDetailPageProps) {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [packages, setPackages] = useState<PartyPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      if (resolvedParams.slug === 'abc-soft-play-center-london') {
        loadVenueData()
      } else {
        notFound()
      }
    }
    loadData()
  }, [params])

  async function loadVenueData() {
    try {
      // TODO: Connect to real database
      // Mock venue data for demo
      // This check is now done in useEffect
        const mockVenue: Venue = {
          id: '1',
          slug: 'abc-soft-play-center-london',
          name: 'ABC Soft Play Center',
          description: 'A fantastic indoor soft play center perfect for young children with dedicated party areas and great facilities for parents. Our venue features multi-level play equipment, dedicated toddler areas, and comfortable seating for adults.',
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
          parking_info: 'Free parking for 20 cars in rear car park',
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
          safety_certifications: ['ROSPA', 'SafeWise'],
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
          meta_description: 'Book your child&apos;s party at ABC Soft Play Center in Hackney. Dedicated party rooms, included food, and great facilities for parents.',
          status: 'published',
          featured: true,
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const mockPackages: PartyPackage[] = [
          {
            id: '1',
            venue_id: '1',
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            venue_id: '1',
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]

        setVenue(mockVenue)
        setPackages(mockPackages)
    } catch (error) {
      console.error('Error loading venue:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading venue details...</div>
      </div>
    )
  }

  if (!venue) {
    notFound()
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'packages', label: 'Packages & Pricing' },
    { id: 'parent-info', label: 'Parent Info' },
    { id: 'location', label: 'Location' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Venue Image Placeholder */}
            <div className="flex-1">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Venue Photos Coming Soon</span>
              </div>
            </div>

            {/* Venue Info */}
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                {venue.venue_type.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                  >
                    {type.replace('_', ' ')}
                  </span>
                ))}
                {venue.verified && (
                  <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{venue.name}</h1>
              
              <div className="space-y-2 text-gray-600 mb-6">
                <p className="flex items-center">
                  📍 {venue.address_line_1}, {venue.city}, {venue.postcode}
                </p>
                {venue.phone && (
                  <p className="flex items-center">
                    📞 <a href={`tel:${venue.phone}`} className="hover:text-blue-600">{venue.phone}</a>
                  </p>
                )}
                <p>👶 Ages {venue.min_age}-{venue.max_age} years</p>
                <p>👥 Up to {venue.max_children} children, {venue.max_adults} adults</p>
              </div>

              <div className="flex gap-4">
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer">
                    <Button className="flex-1">Visit Website</Button>
                  </a>
                )}
                {venue.phone && (
                  <a href={`tel:${venue.phone}`}>
                    <Button variant="outline" className="flex-1">Call Venue</Button>
                  </a>
                )}
              </div>

              {/* Quick Features */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {venue.parking_free && (
                  <div className="flex items-center text-sm text-green-600">
                    ✓ Free Parking
                  </div>
                )}
                {venue.food_provided && (
                  <div className="flex items-center text-sm text-green-600">
                    ✓ Food Included
                  </div>
                )}
                {venue.allergy_accommodations && (
                  <div className="flex items-center text-sm text-green-600">
                    ✓ Allergy Friendly
                  </div>
                )}
                {venue.private_party_room && (
                  <div className="flex items-center text-sm text-green-600">
                    ✓ Private Room
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{venue.description}</p>
              </CardContent>
            </Card>

            {venue.safety_certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Safety & Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Safety Certifications</h4>
                      <ul className="text-gray-600 space-y-1">
                        {venue.safety_certifications.map((cert) => (
                          <li key={cert}>✓ {cert}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Staff Details</h4>
                      <ul className="text-gray-600 space-y-1">
                        {venue.staff_dbs_checked && <li>✓ DBS Checked Staff</li>}
                        {venue.first_aid_trained && <li>✓ First Aid Trained</li>}
                        {venue.staff_ratio && <li>✓ Staff Ratio: {venue.staff_ratio}</li>}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-6">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{pkg.name}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      £{pkg.base_price}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {pkg.description} • {Math.floor(pkg.duration_minutes! / 60)}h {pkg.duration_minutes! % 60}min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">What&apos;s Included</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pkg.activities_included.map((activity, idx) => (
                          <li key={idx}>• {activity}</li>
                        ))}
                        {pkg.food_included.map((food, idx) => (
                          <li key={idx}>• {food}</li>
                        ))}
                        {pkg.decorations_included.map((decoration, idx) => (
                          <li key={idx}>• {decoration}</li>
                        ))}
                        {pkg.party_host_included && <li>• Dedicated party host</li>}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Pricing Details</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Base price for {pkg.base_includes_children} children</li>
                        {pkg.additional_child_price && (
                          <li>Extra children: £{pkg.additional_child_price} each</li>
                        )}
                        {pkg.adult_charge ? (
                          <li>Adults: £{pkg.adult_charge} each</li>
                        ) : (
                          <li>Adults: Free</li>
                        )}
                        {pkg.deposit_required && (
                          <li>Deposit: £{pkg.deposit_required}</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Additional Info</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Ages {pkg.suitable_age_min}-{pkg.suitable_age_max} years</li>
                        <li>{pkg.min_children}-{pkg.max_children} children</li>
                        {pkg.advance_booking_days && (
                          <li>Book {pkg.advance_booking_days} days ahead</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {pkg.additional_costs.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Additional Costs</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {pkg.additional_costs.map((cost, idx) => (
                          <li key={idx}>• {cost}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button className="w-full md:w-auto">
                      Contact Venue to Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'parent-info' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parking & Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Parking Information</h4>
                    <p className="text-gray-600">{venue.parking_info}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                        venue.wheelchair_accessible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {venue.wheelchair_accessible ? '✓' : '✗'} Wheelchair Accessible
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                        venue.baby_changing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {venue.baby_changing ? '✓' : '✗'} Baby Changing
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Food & Dietary Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Allergy Information</h4>
                    <p className="text-gray-600">{venue.allergy_info}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {venue.halal_options && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                        ✓ Halal Options
                      </span>
                    )}
                    {venue.vegetarian_options && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                        ✓ Vegetarian Options
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parent Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {venue.parent_seating_area && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                      ✓ Parent Seating Area
                    </span>
                  )}
                  {venue.cafe_onsite && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                      ✓ Cafe On-Site
                    </span>
                  )}
                  {venue.wifi_available && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                      ✓ Free WiFi
                    </span>
                  )}
                  {venue.viewing_area && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                      ✓ Viewing Area
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Party Day Rules</h4>
                  <p className="text-gray-600">
                    {venue.adults_must_stay 
                      ? "Adults must stay during the party for supervision."
                      : "Adults can drop off children and return for pickup."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Address & Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Full Address</h4>
                    <p className="text-gray-600">
                      {venue.address_line_1}<br />
                      {venue.address_line_2 && <>{venue.address_line_2}<br /></>}
                      {venue.city}, {venue.postcode}<br />
                      {venue.country}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venue.phone && (
                      <div>
                        <h4 className="font-medium mb-1">Phone</h4>
                        <a href={`tel:${venue.phone}`} className="text-blue-600 hover:underline">
                          {venue.phone}
                        </a>
                      </div>
                    )}
                    {venue.email && (
                      <div>
                        <h4 className="font-medium mb-1">Email</h4>
                        <a href={`mailto:${venue.email}`} className="text-blue-600 hover:underline">
                          {venue.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.opening_hours && Object.entries(venue.opening_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize font-medium">{day}:</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Interactive Map Coming Soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}