import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Not authenticated, redirect to login
        router.push('/login');
      }
    } catch (error) {
      // Error checking auth, redirect to login
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear the user cookie by setting it to expire
    document.cookie = 'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return { user, loading, logout };
}
