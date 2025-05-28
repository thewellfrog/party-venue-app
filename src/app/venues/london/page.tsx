import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Kids Party Venues in London - Compare 100+ Options',
  description: 'Find the perfect party venue for your child in London. Compare packages, prices, and facilities across 100+ venues with detailed parent information.',
}

export default function LondonVenuesPage() {
  const popularBoroughs = [
    { name: 'Hackney', slug: 'hackney', venueCount: 12 },
    { name: 'Camden', slug: 'camden', venueCount: 8 },
    { name: 'Islington', slug: 'islington', venueCount: 6 },
    { name: 'Greenwich', slug: 'greenwich', venueCount: 10 },
    { name: 'Wandsworth', slug: 'wandsworth', venueCount: 15 },
    { name: 'Richmond upon Thames', slug: 'richmond', venueCount: 7 },
  ]

  const venueTypes = [
    { name: 'Soft Play Centers', count: 25, emoji: '🎪' },
    { name: 'Trampoline Parks', count: 18, emoji: '🤸' },
    { name: 'Bowling Alleys', count: 12, emoji: '🎳' },
    { name: 'Swimming Pools', count: 8, emoji: '🏊' },
    { name: 'Adventure Centers', count: 15, emoji: '🧗' },
    { name: 'Arts & Crafts', count: 10, emoji: '🎨' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Kids Party Venues in London
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing party venues for children across London&apos;s 32 boroughs. 
              From soft play centers in Hackney to trampoline parks in Wandsworth, 
              find the perfect venue with detailed package information and parent-focused details.
            </p>
            <div className="mt-8">
              <Link href="/venues?location=london">
                <Button size="lg">Browse All London Venues</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Boroughs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular London Boroughs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularBoroughs.map((borough) => (
              <Card key={borough.slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{borough.name}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {borough.venueCount} venues
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Explore party venues in {borough.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/venues/london/boroughs/${borough.slug}`}>
                    <Button variant="outline" className="w-full">
                      View {borough.name} Venues
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Venue Types */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Venue Types in London</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {venueTypes.map((type) => (
              <Card key={type.name} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-3">{type.emoji}</div>
                  <h3 className="font-medium text-sm mb-1">{type.name}</h3>
                  <p className="text-xs text-gray-500">{type.count} venues</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose London */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose London for Your Child&apos;s Party?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Incredible Variety</h3>
                  <p className="text-gray-600 mb-4">
                    London offers the widest selection of children&apos;s party venues in the UK. 
                    From traditional soft play centers to unique adventure experiences, 
                    you&apos;ll find something perfect for every child&apos;s interests.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">Excellent Transport Links</h3>
                  <p className="text-gray-600">
                    With extensive tube, bus, and rail networks, London venues are 
                    easily accessible for guests traveling from across the capital 
                    and surrounding areas.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Parent-Friendly Facilities</h3>
                  <p className="text-gray-600 mb-4">
                    Many London venues understand that parents need comfort too. 
                    You&apos;ll find dedicated parent seating areas, cafes, free WiFi, 
                    and excellent facilities to make your experience stress-free.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">Competitive Pricing</h3>
                  <p className="text-gray-600">
                    Despite being in the capital, many London venues offer 
                    competitive package pricing with transparent costs and 
                    no hidden surprises.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Tips */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Planning a Party in London? Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">🚗 Parking Considerations</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Check parking availability and costs. Many venues offer free parking, 
                    but some central London locations may require street parking or paid car parks.
                  </p>
                  
                  <h4 className="font-semibold mb-2">📅 Book Early</h4>
                  <p className="text-sm text-gray-600">
                    Popular London venues book up quickly, especially for weekend slots. 
                    Aim to book 3-4 weeks in advance for the best availability.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🍕 Food Options</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Most venues offer comprehensive food packages, but check dietary 
                    requirements and allergy policies, especially important in diverse London.
                  </p>
                  
                  <h4 className="font-semibold mb-2">🚇 Consider Transport</h4>
                  <p className="text-sm text-gray-600">
                    Choose venues near tube or bus stops if guests will be using public transport. 
                    This is especially helpful for central London venues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}