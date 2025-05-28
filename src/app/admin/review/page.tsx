'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getVenuesForReview, createVenueFromExtraction } from '@/lib/database'

interface ExtractionItem {
  id: string
  url: string
  venue_name?: string
  search_query?: string
  status: string
  confidence_score?: number
  extracted_data?: any
  created_at: string
  processed_at?: string
}

export default function ReviewPage() {
  const [items, setItems] = useState<ExtractionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ExtractionItem | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectingItem, setRejectingItem] = useState<ExtractionItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadReviewItems()
  }, [])

  async function loadReviewItems() {
    try {
      const { venues, error } = await getVenuesForReview(20)
      
      if (error) {
        console.error('Error loading review items:', error)
        return
      }

      setItems(venues)
    } catch (error) {
      console.error('Error loading review items:', error)
    } finally {
      setLoading(false)
    }
  }

  async function approveVenue(item: ExtractionItem) {
    if (!item.extracted_data) return

    setProcessing(item.id)
    
    try {
      const { venue, error } = await createVenueFromExtraction(
        item.extracted_data, 
        item.id
      )

      if (error) {
        console.error('Error creating venue:', error)
        alert('Error creating venue. Please try again.')
        return
      }

      console.log('Venue created:', venue)
      alert('Venue approved and created successfully!')
      
      // Remove from list
      setItems(items.filter(i => i.id !== item.id))
      setSelectedItem(null)
      
    } catch (error) {
      console.error('Error approving venue:', error)
      alert('Error approving venue. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  function startRejectVenue(item: ExtractionItem) {
    setRejectingItem(item)
    setRejectionReason('')
  }

  async function confirmRejectVenue() {
    if (!rejectingItem) return
    
    setProcessing(rejectingItem.id)
    
    try {
      // TODO: Implement actual rejection API call
      console.log('Rejecting venue:', rejectingItem.id, 'Reason:', rejectionReason)
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove from list
      setItems(prev => prev.filter(item => item.id !== rejectingItem.id))
      setRejectingItem(null)
      setRejectionReason('')
      
      if (selectedItem?.id === rejectingItem.id) {
        setSelectedItem(null)
      }
      
    } catch (error) {
      console.error('Error rejecting venue:', error)
      alert('Error rejecting venue. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-700'
    if (score >= 0.8) return 'bg-green-100 text-green-700'
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading review items...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Review Extracted Venues
          </h1>
          <p className="mt-2 text-gray-600">
            Review and approve AI-extracted venue data before publishing
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No items for review</h3>
              <p className="text-gray-600">
                All extracted venues have been processed. Run the scraping pipeline to get more data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Items List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {items.length} Items Pending Review
              </h2>
              
              {items.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {item.extracted_data?.venue?.name || 'Unknown Venue'}
                      </CardTitle>
                      <Badge className={getConfidenceColor(item.confidence_score)}>
                        {item.confidence_score 
                          ? `${Math.round(item.confidence_score * 100)}%` 
                          : 'N/A'
                        }
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {item.url}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-600">
                      <div>Query: {item.search_query}</div>
                      <div>Processed: {item.processed_at ? new Date(item.processed_at).toLocaleDateString() : 'Unknown'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detail View */}
            <div>
              {selectedItem ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Details</CardTitle>
                    <CardDescription>
                      Extracted data for {selectedItem.extracted_data?.venue?.name || 'Unknown Venue'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Venue Info */}
                    {selectedItem.extracted_data?.venue && (
                      <div>
                        <h4 className="font-medium mb-2">Venue Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                          <div><strong>Name:</strong> {selectedItem.extracted_data.venue.name}</div>
                          {selectedItem.extracted_data.venue.description && (
                            <div><strong>Description:</strong> {selectedItem.extracted_data.venue.description}</div>
                          )}
                          <div><strong>Address:</strong> {selectedItem.extracted_data.venue.address_line_1}, {selectedItem.extracted_data.venue.city} {selectedItem.extracted_data.venue.postcode}</div>
                          {selectedItem.extracted_data.venue.phone && (
                            <div><strong>Phone:</strong> {selectedItem.extracted_data.venue.phone}</div>
                          )}
                          {selectedItem.extracted_data.venue.website && (
                            <div><strong>Website:</strong> {selectedItem.extracted_data.venue.website}</div>
                          )}
                          <div><strong>Type:</strong> {selectedItem.extracted_data.venue.venue_type?.join(', ') || 'Unknown'}</div>
                          {selectedItem.extracted_data.venue.min_age && selectedItem.extracted_data.venue.max_age && (
                            <div><strong>Age Range:</strong> {selectedItem.extracted_data.venue.min_age}-{selectedItem.extracted_data.venue.max_age} years</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Packages */}
                    {selectedItem.extracted_data?.packages && selectedItem.extracted_data.packages.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Party Packages</h4>
                        <div className="space-y-3">
                          {selectedItem.extracted_data.packages.map((pkg: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg text-sm">
                              <div className="font-medium">{pkg.name}</div>
                              {pkg.description && <div className="text-gray-600 mb-2">{pkg.description}</div>}
                              {pkg.base_price && (
                                <div><strong>Price:</strong> £{pkg.base_price} for {pkg.base_includes_children || 'N/A'} children</div>
                              )}
                              {pkg.duration_minutes && (
                                <div><strong>Duration:</strong> {pkg.duration_minutes} minutes</div>
                              )}
                              {pkg.activities_included && pkg.activities_included.length > 0 && (
                                <div><strong>Includes:</strong> {pkg.activities_included.join(', ')}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence & Notes */}
                    <div>
                      <h4 className="font-medium mb-2">Extraction Quality</h4>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                        <div><strong>Confidence Score:</strong> {selectedItem.confidence_score ? `${Math.round(selectedItem.confidence_score * 100)}%` : 'N/A'}</div>
                        {selectedItem.extracted_data?.extraction_notes && (
                          <div><strong>Notes:</strong> {selectedItem.extracted_data.extraction_notes}</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        onClick={() => approveVenue(selectedItem)}
                        disabled={processing === selectedItem.id}
                        className="flex-1"
                      >
                        {processing === selectedItem.id ? 'Creating...' : 'Approve & Create Venue'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => startRejectVenue(selectedItem)}
                        disabled={processing === selectedItem.id}
                      >
                        Reject
                      </Button>
                    </div>

                    {/* Source URL */}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <strong>Source:</strong> <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{selectedItem.url}</a>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">
                      Select an item from the list to review its details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Reject Venue</CardTitle>
              <CardDescription>
                Please provide a reason for rejecting &ldquo;{rejectingItem.venue_name || 'this venue'}&rdquo;
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="e.g., Incomplete information, not a party venue, duplicate entry..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectingItem(null)
                    setRejectionReason('')
                  }}
                  disabled={processing === rejectingItem.id}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRejectVenue}
                  disabled={!rejectionReason.trim() || processing === rejectingItem.id}
                  className="flex-1"
                >
                  {processing === rejectingItem.id ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}