import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard({ initialUser }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(initialUser);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchPages();
    }
  }, [user]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schema-workflow/pages');
      const data = await response.json();
      
      setPages(data);
      setStats({
        total: data.length,
        with_schema: data.filter(p => p.schema_body).length,
        pending: data.filter(p => p.status === 'pending').length,
        approved: data.filter(p => p.status === 'approved').length
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call server-side logout to clear HttpOnly cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Redirect to login regardless of API result
      router.push('/login');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Schema Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Schema Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-medium text-gray-900">{user?.name}</span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8">
              <a 
                href="/"
                className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600"
              >
                Dashboard
              </a>
              <a 
                href="/schema-workflow"
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Schema Review
              </a>
            </nav>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.with_schema}</div>
              <div className="text-sm text-gray-600">With Schema</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>

          {/* Simple Page List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Pages</h2>
            </div>
            <div className="divide-y">
              {pages.map((page) => (
                <div 
                  key={page._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => router.push(`/schema-workflow?page=${page._id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {page.page_title || 'Untitled Page'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {page.url}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                      {page.status || 'next'}
                    </span>
                    {page.schema_body && (
                      <span className="text-green-600 text-sm">✓ Schema</span>
                    )}
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
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
      props: {
        initialUser: user,
      },
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
