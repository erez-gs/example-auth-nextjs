'use client';

import { signIn } from 'next-auth/react';

export default function Home() {
  return (
    <>
      <button
        onClick={() => signIn('zitadel')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 mb-6 cursor-pointer"
      ></button>

      
    </>
  );
}
