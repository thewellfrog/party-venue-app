'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { supabaseAdmin } from '@/lib/supabase'

export default function TestDataPage() {
  const [url, setUrl] = useState('')
  const [venueName, setVenueName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function addTestExtraction() {
    if (!url.trim()) return

    setSubmitting(true)
    
    try {
      // Create a mock extraction with high confidence
      const mockExtraction = {
        venue: {
          name: venueName || 'Test Venue',
          description: 'A test venue for demonstration purposes',
          address_line_1: '123 Test Street',
          city: 'London',
          borough: 'Test Borough',
          postcode: 'SW1A 1AA',
          phone: '020 1234 5678',
          email: 'test@venue.co.uk',
          website: url,
          venue_type: ['soft_play'],
          parking_free: true,
          max_children: 20,
          max_adults: 25,
          min_age: 2,
          max_age: 10,
          safety_certifications: ['ROSPA'],
          staff_dbs_checked: true,
          first_aid_trained: true,
          food_provided: true,
          allergy_accommodations: true,
          private_party_room: true,
          adults_must_stay: false
        },
        packages: [
          {
            name: 'Standard Party Package',
            description: 'Perfect for kids parties',
            base_price: 200,
            base_includes_children: 10,
            additional_child_price: 15,
            duration_minutes: 120,
            activities_included: ['2 hours soft play', 'Party room for 45 mins'],
            food_included: ['Pizza', 'Juice', 'Birthday cake'],
            additional_costs: ['Extra children £15 each'],
            deposit_required: 50,
            advance_booking_days: 14
          }
        ],
        confidence_score: 0.95,
        extraction_notes: 'Mock test data for demonstration'
      }

      const { error } = await supabaseAdmin
        .from('scraping_queue')
        .insert({
          url: url,
          venue_name: venueName || 'Test Venue',
          search_query: 'test data',
          status: 'review',
          extracted_data: mockExtraction,
          confidence_score: 0.95,
          raw_html: '<html><body>Mock HTML content</body></html>',
          processed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error adding test data:', error)
        alert('Error adding test data: ' + error.message)
      } else {
        alert('Test extraction added successfully!')
        setUrl('')
        setVenueName('')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error adding test data')
    } finally {
      setSubmitting(false)
    }
  }

  async function addSampleUrls() {
    setSubmitting(true)
    
    try {
      const sampleUrls = [
        'https://example-softplay.co.uk',
        'https://test-trampoline-park.com',
        'https://sample-bowling-alley.co.uk',
        'https://demo-adventure-center.com'
      ]

      for (const sampleUrl of sampleUrls) {
        await supabaseAdmin
          .from('scraping_queue')
          .insert({
            url: sampleUrl,
            search_query: 'sample data',
            status: 'pending'
          })
      }

      alert(`Added ${sampleUrls.length} sample URLs to scraping queue`)
    } catch (error) {
      console.error('Error adding sample URLs:', error)
      alert('Error adding sample URLs')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Test Data Management
          </h1>
          <p className="mt-2 text-gray-600">
            Add test data to demonstrate the scraping and review pipeline
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Test Extraction */}
          <Card>
            <CardHeader>
              <CardTitle>Add Test Extraction</CardTitle>
              <CardDescription>
                Add a mock venue extraction to test the review interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="venue-name">Venue Name</Label>
                <Input
                  id="venue-name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Test Venue Name"
                />
              </div>
              
              <div>
                <Label htmlFor="venue-url">Website URL</Label>
                <Input
                  id="venue-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example-venue.co.uk"
                />
              </div>

              <Button 
                onClick={addTestExtraction}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Adding...' : 'Add Test Extraction'}
              </Button>
            </CardContent>
          </Card>

          {/* Add Sample URLs */}
          <Card>
            <CardHeader>
              <CardTitle>Add Sample URLs</CardTitle>
              <CardDescription>
                Add sample URLs to the scraping queue for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  This will add several sample URLs to the scraping queue with "pending" status.
                  You can then run the scraping scripts to process them.
                </div>
                
                <Button 
                  onClick={addSampleUrls}
                  disabled={submitting}
                  variant="outline"
                  className="w-full"
                >
                  {submitting ? 'Adding...' : 'Add Sample URLs'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing the Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">1. Add Test Data</h4>
                <p className="text-gray-600">
                  Use the forms above to add test extractions or sample URLs to the database.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">2. Review Extractions</h4>
                <p className="text-gray-600">
                  Go to the <a href="/admin/review" className="text-blue-600 hover:underline">Review page</a> to 
                  see test extractions and practice the approval workflow.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">3. Run Scripts</h4>
                <p className="text-gray-600">
                  With a proper Supabase setup, you can run the scraping scripts:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code>npm run scrape:urls</code> - Collect URLs from search</li>
                  <li><code>npm run scrape:venues</code> - Scrape website content</li>
                  <li><code>npm run scrape:extract</code> - Extract data with OpenAI</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}