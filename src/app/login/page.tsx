import { SignIn } from '@clerk/nextjs';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Log In — due.college',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-container">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-xl font-extrabold text-navy mb-8 tracking-tight">
            due.college
          </Link>
          <h1 className="text-3xl font-extrabold text-navy mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to see your deadlines</p>
        </div>

        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/login"
            appearance={{
              elements: {
                rootBox: 'w-full max-w-md',
                card: 'shadow-none border border-gray-200 rounded-3xl p-6',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border-2 border-gray-200 rounded-xl font-semibold hover:border-navy transition-colors',
                formButtonPrimary:
                  'bg-coral hover:bg-coral/90 rounded-xl font-semibold shadow-md shadow-coral/20',
                footerActionLink: 'text-coral',
              },
            }}
            fallbackRedirectUrl="/dashboard"
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/start" className="text-coral font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
