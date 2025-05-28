import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Party Venues in Hackney, London - Local Options & Prices',
  description: 'Find kids party venues in Hackney with free parking, great facilities and competitive packages. Compare local options for your child\'s birthday.',
}

export default function HackneyVenuesPage() {
  // Mock venue data for Hackney
  const hackneyVenues = [
    {
      id: '1',
      name: 'ABC Soft Play Center',
      type: 'Soft Play',
      address: '123 High Street, E8 2AA',
      priceFrom: 180,
      ageRange: '1-8 years',
      features: ['Free Parking', 'Food Included', 'Private Room']
    },
    {
      id: '2', 
      name: 'Hackney Adventure Zone',
      type: 'Adventure Center',
      address: '456 Mare Street, E8 3RF',
      priceFrom: 220,
      ageRange: '5-12 years',
      features: ['Climbing Walls', 'Party Host', 'Allergy Friendly']
    },
    {
      id: '3',
      name: 'Little Explorers Hackney',
      type: 'Soft Play',
      address: '789 Morning Lane, E9 6ND',
      priceFrom: 160,
      ageRange: '1-6 years',
      features: ['Toddler Area', 'Cafe On-Site', 'Free Parking']
    }
  ]

  const nearbyAreas = [
    { name: 'Camden', distance: '2.5 miles' },
    { name: 'Islington', distance: '1.8 miles' },
    { name: 'Tower Hamlets', distance: '2.0 miles' },
    { name: 'Newham', distance: '3.2 miles' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/venues" className="hover:text-blue-600">Venues</Link>
            <span className="mx-2">/</span>
            <Link href="/venues/london" className="hover:text-blue-600">London</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Hackney</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Party Venues in Hackney, London
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing children&apos;s party venues in Hackney. From soft play centers 
              to adventure zones, find the perfect local venue with great facilities, 
              competitive pricing, and easy parking.
            </p>
            <div className="mt-8">
              <Link href="/venues?location=hackney">
                <Button size="lg">Browse All Hackney Venues</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Venues List */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {hackneyVenues.length} Venues in Hackney
            </h2>
            <Link href="/venues?location=hackney">
              <Button variant="outline">View All with Filters</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {hackneyVenues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg">{venue.name}</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {venue.type}
                    </span>
                  </CardTitle>
                  <CardDescription>{venue.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ages:</span>
                      <span className="font-medium">{venue.ageRange}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">From:</span>
                      <span className="font-bold text-blue-600">£{venue.priceFrom}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {venue.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                        >
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Link href={`/venues/london/abc-soft-play-center-london`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About Hackney */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>About Party Venues in Hackney</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Local Family Area</h3>
                  <p className="text-gray-600 mb-4">
                    Hackney has become one of London&apos;s most family-friendly boroughs, 
                    with excellent party venues that cater specifically to local families. 
                    Many venues offer competitive pricing and great facilities.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">Great Transport Links</h3>
                  <p className="text-gray-600">
                    Hackney is well-connected with multiple transport options including 
                    Hackney Central, Hackney Downs, and London Fields stations, plus 
                    excellent bus connections throughout the borough.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Parking & Access</h3>
                  <p className="text-gray-600 mb-4">
                    Most Hackney venues offer free parking or are located near 
                    residential areas with good street parking availability. 
                    Check individual venue parking details when booking.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">Local Community</h3>
                  <p className="text-gray-600">
                    Hackney&apos;s strong community spirit means many venues are 
                    locally-owned and really understand what local families want 
                    from a children&apos;s party experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Nearby Areas */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nearbyAreas.map((area) => (
              <Card key={area.name} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-1">{area.name}</h3>
                  <p className="text-sm text-gray-500">{area.distance}</p>
                  <Link href={`/venues/london/boroughs/${area.name.toLowerCase()}`} className="mt-3 block">
                    <Button variant="outline" size="sm">View Venues</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}