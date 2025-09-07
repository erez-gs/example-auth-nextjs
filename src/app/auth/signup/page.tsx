"use client";
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
  const zitadelDomain = process.env.NEXT_PUBLIC_ZITADEL_DOMAIN || process.env.ZITADEL_DOMAIN;
  const clientId = process.env.ZITADEL_CLIENT_ID;
  const signupUrl = `${zitadelDomain}/ui/login/signup?client_id=${clientId}`;
  const recoverUrl = `${zitadelDomain}/ui/login/recover?client_id=${clientId}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Account creation is securely handled by ZITADEL.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg px-8 py-8 space-y-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            When you click the button below you&apos;ll be redirected to ZITADEL&apos;s hosted
            signup screen. After confirming your email (if required) you&apos;ll return here
            and be signed in automatically.
          </p>

          <div className="space-y-4">
            <a
              href={signupUrl}
              className="w-full flex justify-center py-3 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to secure signup
            </a>
            <button
              type="button"
              onClick={() => signIn('zitadel')}
              className="w-full flex justify-center py-3 px-4 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              I already have an account
            </button>
          </div>

          <div className="pt-4 border-t text-xs text-gray-500 space-y-2">
            <p>
              Forgot your password?{' '}
              <a className="text-blue-600 hover:underline" href={recoverUrl}>
                Reset it
              </a>
            </p>
            <p>
              Need to sign in instead?{' '}
              <Link className="text-blue-600 hover:underline" href="/auth/login">
                Go to login
              </Link>
            </p>
            <p className="pt-2">Powered by ZITADEL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
