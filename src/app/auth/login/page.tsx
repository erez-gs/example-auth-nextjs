'use client';

import { useState } from 'react';
import { Suspense } from 'react';

export function LoginPage() {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Handle successful login
      if (data.success && data.sessionToken) {
        // Store session token (in production, use httpOnly cookies for security)
        localStorage.setItem('sessionToken', data.sessionToken);
        setSuccess(true);

        // Redirect to profile or dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/profile';
        }, 1000);
      }
    } catch {
      setError('An error occurred during login');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Logged in successfully!</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username (loginName):</label>
          <input
            type="text"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%' }}>
          Login
        </button>
      </form>
    </div>
  );
}

/**
 * Custom NextAuth sign-in page that matches the application's design system.
 *
 * Provides a clean, branded sign-in experience specifically designed for
 * single-provider authentication with ZITADEL.
 */
export default function CustomSignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
