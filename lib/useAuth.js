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

  const logout = async () => {
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

  return { user, loading, logout };
}
