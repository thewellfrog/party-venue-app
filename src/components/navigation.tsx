'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

          {/* CTA Button & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link href="/venues" className="hidden sm:block">
              <Button>
                Find Venues
              </Button>
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                // Close icon
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href="/venues" 
              className={`block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors ${
                pathname === '/venues' ? 'text-blue-600 bg-blue-50 font-medium' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Venues
            </Link>
            <Link 
              href="/venues/london" 
              className={`block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors ${
                pathname?.startsWith('/venues/london') ? 'text-blue-600 bg-blue-50 font-medium' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              London
            </Link>
            <Link 
              href="/venues/manchester" 
              className={`block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors ${
                pathname?.startsWith('/venues/manchester') ? 'text-blue-600 bg-blue-50 font-medium' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Manchester
            </Link>
            <Link 
              href="/venues/birmingham" 
              className={`block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors ${
                pathname?.startsWith('/venues/birmingham') ? 'text-blue-600 bg-blue-50 font-medium' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Birmingham
            </Link>
            
            {/* Mobile CTA Button */}
            <div className="pt-4 pb-2">
              <Link href="/venues" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">
                  Find Venues
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}