'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getScrapingQueueStats } from '@/lib/database'
// import { getCurrentUser, signOut, type AdminUser } from '@/lib/auth'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalUrls: number
  scraped: number
  processed: number
  readyForReview: number
  published: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalUrls: 0,
    scraped: 0,
    processed: 0,
    readyForReview: 0,
    published: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        // TODO: Implement actual user loading
        // Mock user for demo
        const mockUser: AdminUser = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        }
        setUser(mockUser)
        await loadStats()
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  async function loadStats() {
    try {
      const { stats: queueStats, error } = await getScrapingQueueStats()
      
      if (error) {
        console.log('Database not available, using mock stats')
        // Fallback to mock stats
        setStats({
          totalUrls: 150,
          scraped: 120,
          processed: 80,
          readyForReview: 25,
          published: 55
        })
      } else {
        // Use real stats from database
        setStats({
          totalUrls: (queueStats.pending || 0) + (queueStats.processing || 0) + (queueStats.completed || 0) + (queueStats.failed || 0) + (queueStats.review || 0),
          scraped: queueStats.completed || 0,
          processed: queueStats.review || 0,
          readyForReview: queueStats.review || 0,
          published: 55 // TODO: Get from venues table
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      // Fallback to mock stats on error
      setStats({
        totalUrls: 150,
        scraped: 120,
        processed: 80,
        readyForReview: 25,
        published: 55
      })
    }
  }

  async function handleSignOut() {
    try {
      // TODO: Implement actual sign out
      router.push('/admin/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUrls}</div>
              <p className="text-xs text-gray-500">Collected from searches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Scraped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scraped}</div>
              <p className="text-xs text-gray-500">Content extracted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processed}</div>
              <p className="text-xs text-gray-500">AI processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Review Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.readyForReview}</div>
              <p className="text-xs text-gray-500">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-gray-500">Live venues</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Pipeline</CardTitle>
              <CardDescription>Manage data collection and processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Process Pending URLs
              </Button>
              <Button className="w-full" variant="outline">
                Run Scraper
              </Button>
              <Button className="w-full" variant="outline">
                Extract with AI
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review & Publishing</CardTitle>
              <CardDescription>Review extracted data and publish venues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/review">
                <Button className="w-full">
                  Review High Confidence ({stats.readyForReview})
                </Button>
              </Link>
              <Button className="w-full" variant="outline">
                Bulk Approve {'>'}0.8
              </Button>
              <Button className="w-full" variant="outline">
                Manage Venues
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage cities, pages, and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Manage Cities
              </Button>
              <Button className="w-full" variant="outline">
                View Analytics
              </Button>
              <Button className="w-full" variant="outline">
                Site Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest scraping and publishing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500">
              Activity log will be implemented in the next phase...
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}