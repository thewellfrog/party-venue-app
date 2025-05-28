'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const pathname = usePathname()

  // Don't show navigation on admin pages (they have their own layout)
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Party Venue Directory
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/venues" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                pathname === '/venues' ? 'text-blue-600 font-medium' : ''
              }`}
            >
              Browse Venues
            </Link>
            <Link 
              href="/venues/london" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              London
            </Link>
            <Link 
              href="/venues/manchester" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Manchester
            </Link>
            <Link 
              href="/venues/birmingham" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Birmingham
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link href="/venues">
              <Button>
                Find Venues
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <div className="px-4 py-3 space-y-1">
          <Link 
            href="/venues" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            Browse Venues
          </Link>
          <Link 
            href="/venues/london" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            London
          </Link>
          <Link 
            href="/venues/manchester" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            Manchester
          </Link>
          <Link 
            href="/venues/birmingham" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            Birmingham
          </Link>
        </div>
      </div>
    </nav>
  )
}