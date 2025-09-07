import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/SignOutButton';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login?callbackUrl=/profile');
  return (
    <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
      <pre className="text-sm text-green-400 font-mono leading-relaxed">
        {JSON.stringify(session, null, 2)}
      </pre>
      <SignOutButton />
    </div>
  );
}
