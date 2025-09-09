'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import { signIn } from 'next-auth/react';

function LoginPage() {
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Pass login_hint to prefill on ZITADEL hosted page
      await signIn('zitadel', {
        callbackUrl: '/profile',
        login_hint: loginName || undefined,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to start sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg px-8 py-8">
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="loginName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="loginName"
                type="email"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!loginName || loading}
            >
              {loading ? 'Redirecting…' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex flex-col space-y-2 text-sm">
              <button
                type="button"
                onClick={() => signIn('zitadel')}
                className="text-blue-600 hover:underline"
              >
                Sign in without email prefill
              </button>
              {/* <a
                href={`${process.env.NEXT_PUBLIC_ZITADEL_DOMAIN || process.env.ZITADEL_DOMAIN}/ui/login/signup?client_id=${process.env.ZITADEL_CLIENT_ID}`}
                className="text-blue-600 hover:underline"
              >
                Create an account
              </a>
              <a
                href={`${process.env.NEXT_PUBLIC_ZITADEL_DOMAIN || process.env.ZITADEL_DOMAIN}/ui/login/recover?client_id=${process.env.ZITADEL_CLIENT_ID}`}
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </a> */}
            </div>
          </div>
        </div>
      </div>
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
