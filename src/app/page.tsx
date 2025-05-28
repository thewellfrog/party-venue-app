'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Select, SelectOption } from '@/components/ui/select'

export default function Home() {
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (age) params.set('age', age)
    
    router.push(`/venues?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find the Perfect Party Venue for Your Child
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Compare packages, prices, and facilities across the UK&apos;s best kids party venues. 
            See what&apos;s included, hidden costs, and everything parents actually need to know.
          </p>
          
          {/* Search Form */}
          <div className="mt-10 max-w-md mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter your location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="sm:w-32">
                <Select 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <SelectOption value="">Age</SelectOption>
                  <SelectOption value="1-3">1-3 years</SelectOption>
                  <SelectOption value="4-6">4-6 years</SelectOption>
                  <SelectOption value="7-10">7-10 years</SelectOption>
                  <SelectOption value="11+">11+ years</SelectOption>
                </Select>
              </div>
              <button 
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Search Venues
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Popular Cities
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Bristol'].map((city) => (
              <Link
                key={city}
                href={`/venues?location=${city.toLowerCase()}`}
                className="relative rounded-lg border border-gray-200 p-6 text-center hover:border-blue-300 hover:shadow-md transition-all cursor-pointer block"
              >
                <h3 className="font-medium text-gray-900">{city}</h3>
                <p className="text-sm text-gray-500 mt-1">50+ venues</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Popular Venue Types
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Soft Play Centers', icon: '🎪', count: '120+' },
              { name: 'Trampoline Parks', icon: '🤸', count: '85+' },
              { name: 'Bowling Alleys', icon: '🎳', count: '60+' },
              { name: 'Swimming Pools', icon: '🏊', count: '45+' },
            ].map((type) => (
              <div
                key={type.name}
                className="relative rounded-lg border border-gray-200 p-6 text-center hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="font-medium text-gray-900">{type.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{type.count} venues</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Parents Choose Us
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Complete Package Details',
                description: 'See exactly what&apos;s included in each package - no hidden surprises on party day.',
                icon: '📋'
              },
              {
                title: 'Real Pricing',
                description: 'Compare actual costs including extras, deposits, and additional child charges.',
                icon: '💰'
              },
              {
                title: 'Parent-Focused Info',
                description: 'Parking details, allergy handling, and whether you can stay or drop off.',
                icon: '👨‍👩‍👧‍👦'
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}