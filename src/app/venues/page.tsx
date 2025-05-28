'use client'

import { useState, useEffect } from 'react'
// import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublishedVenues } from '@/lib/database'
import type { Venue } from '@/lib/types'

// Force dynamic rendering to handle search params
export const dynamic = 'force-dynamic'

interface VenueCardProps {
  venue: Venue
}

function VenueCard({ venue }: VenueCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="text-lg">{venue.name}</span>
          <div className="flex gap-1">
            {venue.venue_type.map((type) => (
              <span
                key={type}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
        </CardTitle>
        <CardDescription>
          {venue.city}{venue.borough && `, ${venue.borough}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          {venue.description || 'Party venue with great facilities for children.'}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Ages:</strong> {venue.min_age}-{venue.max_age} years
          </div>
          <div>
            <strong>Capacity:</strong> Up to {venue.max_children} children
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {venue.parking_free && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              ✓ Free Parking
            </span>
          )}
          {venue.food_provided && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              ✓ Food Included
            </span>
          )}
          {venue.allergy_accommodations && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              ✓ Allergy Friendly
            </span>
          )}
          {venue.private_party_room && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              ✓ Private Room
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {venue.address_line_1}, {venue.postcode}
          </div>
          <Link href={`/venues/${venue.city.toLowerCase()}/${venue.slug}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VenuesPage() {
  // const searchParams = useSearchParams()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const [ageFilter, setAgeFilter] = useState('')

  useEffect(() => {
    // TODO: Get initial values from URL params when suspense is properly set up
    // const location = searchParams.get('location')
    // const age = searchParams.get('age')
    // 
    // if (location) setSearchLocation(location)
    // if (age) setAgeFilter(age)
    
    loadVenues()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadVenues() {
    try {
      // Try to load from database first
      const { venues: dbVenues, error } = await getPublishedVenues({
        city: searchLocation || undefined,
        limit: 20
      })

      if (error) {
        console.log('Database not available, using mock data')
        
        // Fallback to mock data if database is not set up
        const mockVenues: Venue[] = [
          {
            id: '1',
            slug: 'abc-soft-play-center-london',
            name: 'ABC Soft Play Center',
            description: 'A fantastic indoor soft play center perfect for young children.',
            venue_type: ['soft_play'],
            address_line_1: '123 High Street',
            city: 'London',
            borough: 'Hackney',
            postcode: 'E8 2AA',
            country: 'UK',
            latitude: 51.5074,
            longitude: -0.1278,
            parking_free: true,
            wheelchair_accessible: true,
            baby_changing: true,
            max_children: 25,
            max_adults: 30,
            private_party_room: true,
            min_age: 1,
            max_age: 8,
            age_groups: ['toddler', 'preschool'],
            safety_certifications: ['ROSPA'],
            food_provided: true,
            allergy_accommodations: true,
            images: [],
            status: 'published',
            featured: true,
            verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        
        setVenues(mockVenues)
      } else {
        console.log(`Loaded ${dbVenues.length} venues from database`)
        setVenues(dbVenues)
      }
    } catch (error) {
      console.error('Error loading venues:', error)
      // Fallback to empty array on error
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    loadVenues()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Party Venues
          </h1>
          <p className="text-gray-600">
            Find the perfect venue for your child&apos;s special day
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City or borough..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age Range</Label>
                <select
                  id="age"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">All ages</option>
                  <option value="1-3">1-3 years</option>
                  <option value="4-6">4-6 years</option>
                  <option value="7-10">7-10 years</option>
                  <option value="11-16">11-16 years</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full md:w-auto">
                  Search Venues
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div>Loading venues...</div>
          </div>
        ) : venues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No venues found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or browse all venues.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {venues.length} venue{venues.length !== 1 ? 's' : ''} found
              </h2>
              <div className="text-sm text-gray-500">
                Sorted by featured venues first
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}