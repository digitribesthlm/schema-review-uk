import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'
// Removed old schema components - now using simplified page view

export default function Dashboard() {
  const router = useRouter()
  const { clientId } = router.query
  const [user, setUser] = useState(null)
  const [pages, setPages] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  // Removed pagination and modal state - using simplified view

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (clientId && user) {
      fetchSchemas()
    }
  }, [clientId, user, filterStatus])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchSchemas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/schema-workflow/pages?filter=${filterStatus}`)
      
      if (response.ok) {
        const data = await response.json()
        
        setPages(data)
        // Calculate stats from the workflow data
        const stats = {
          total_pages: data.length,
          total_schemas: data.filter(p => p.schema_body).length,
          pending_schemas: data.filter(p => p.status === 'pending').length,
          approved_schemas: data.filter(p => p.status === 'approved').length,
          rejected_schemas: data.filter(p => p.status === 'rejected').length,
          next_schemas: data.filter(p => p.status === 'next').length
        }
        setStats(stats)
        setPagination({ total: data.length, page: 1, pages: 1 })
      } else {
        toast.error('Failed to load pages')
      }
    } catch (error) {
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  // Removed pagination - using simplified view

  // Removed old schema handling functions - now using page-based workflow

  const handleLogout = () => {
    // Clear the user cookie by setting it to expire
    document.cookie = 'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    toast.success('Logged out successfully')
    router.push('/login')
  }

  // Filter pages based on status
  const filteredPages = pages.filter(page => {
    if (filterStatus === 'all') return true
    return page.status === filterStatus
  })

  // Removed pagination component - using simplified view

  if (loading) {
    return (
      <div className="min-h-screen bg-hubspot-light flex items-center justify-center">
        <div className="loading"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Schema Dashboard - {user?.clientName}</title>
      </Head>

      <div className="min-h-screen bg-hubspot-light">
        {/* HubSpot-style Header */}
        <div className="navbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-hubspot-orange rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-hubspot-dark">Schema Review</h1>
                <div className="hidden md:flex items-center space-x-2 text-sm text-hubspot-gray">
                  <span>•</span>
                  <span>{user?.clientName}</span>
                  <span>•</span>
                  <span className="text-hubspot-orange">{user?.domain}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">

                <button
                  onClick={() => router.push('/schema-workflow')}
                  className="btn-ghost flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Schema Workflow</span>
                </button>

                <span className="text-sm text-hubspot-gray">
                  Welcome, <span className="font-medium text-hubspot-dark">{user?.name}</span>
                </span>
                <button onClick={handleLogout} className="btn-ghost">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-hubspot-dark mb-2">Schema Review Dashboard</h2>
            <p className="text-hubspot-gray">Review, edit, and approve schemas for {user?.domain}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <div className="stat-number">{stats.total_pages || 0}</div>
              <div className="stat-label">Total Pages</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total_schemas || 0}</div>
              <div className="stat-label">Total Schemas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-hubspot-orange">{stats.pending_schemas || 0}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-number text-green-600">{stats.approved_schemas || 0}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
              {[
                { key: 'all', label: 'All Pages', count: pages.length },
                { key: 'next', label: 'No Schema', count: pages.filter(p => p.status === 'next').length },
                { key: 'pending', label: 'Pending', count: pages.filter(p => p.status === 'pending').length },
                { key: 'approved', label: 'Approved', count: pages.filter(p => p.status === 'approved').length },
                { key: 'rejected', label: 'Rejected', count: pages.filter(p => p.status === 'rejected').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === key
                      ? 'bg-hubspot-orange text-white'
                      : 'text-hubspot-gray hover:text-hubspot-dark hover:bg-gray-50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Current Page Info */}
          <div className="mb-4">
            <div className="text-sm text-hubspot-gray bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 w-fit">
              Showing {filteredPages.length} pages
              {filterStatus !== 'all' && ` (${filterStatus} status)`}
            </div>
          </div>

          {/* Simple Pages List */}
          {filteredPages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
              <p className="text-gray-500">No pages available for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPages.map((page) => (
                <div 
                  key={page._id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-hubspot-orange cursor-pointer transition-all duration-200 group"
                  onClick={() => router.push(`/schema-workflow?page=${page._id}`)}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Page info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {page.page_title || 'Untitled Page'}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          page.status === 'approved' ? 'bg-green-100 text-green-800' :
                          page.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          page.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {page.status || 'next'}
                        </span>
                        {page.schema_body && (
                          <span className="inline-flex items-center text-green-600 text-xs font-medium">
                            ✓ Has Schema
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {page.url}
                      </p>
                      {page.bq_main_topic && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {page.bq_main_topic}
                        </p>
                      )}
                    </div>
                    
                    {/* Right side - Edit indicator */}
                    <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                      <span className="text-xs text-gray-500 hidden sm:block">Click to edit</span>
                      <svg className="h-5 w-5 text-hubspot-orange group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination removed - showing all pages in table format */}
        </div>
      </div>

      {/* Modals removed - using simplified page view */}
    </>
  )
}


// Server-side authentication check
export async function getServerSideProps(context) {
  const { req } = context;
  
  // Get user cookie from request
  const userCookie = req.headers.cookie
    ?.split(';')
    .find(c => c.trim().startsWith('user='))
    ?.split('=')[1];

  // If no user cookie, redirect to login
  if (!userCookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    // Parse user data from cookie
    const user = JSON.parse(decodeURIComponent(userCookie));
    
    return {
      props: {},
    };
  } catch (error) {
    // Invalid cookie, redirect to login
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
