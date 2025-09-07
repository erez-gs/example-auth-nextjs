'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

import { SignOutButton } from '@/components/SignOutButton';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your session…</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
      <pre className="text-sm text-green-400 font-mono leading-relaxed">
        {JSON.stringify(session, null, 2)}
      </pre>
      <SignOutButton />
    </div>
  );
}
