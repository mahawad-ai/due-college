import { SignUp } from '@clerk/nextjs';

export default function StartPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-container">
        <div className="text-center mb-10">
          <a href="/" className="inline-block text-xl font-extrabold text-navy mb-8 tracking-tight">
            due.college
          </a>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy mb-3">
            Your deadlines are ready.
          </h1>
          <p className="text-gray-500 text-lg">
            Save your list and get reminders before every deadline hits.
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
            routing="path"
            path="/start"
            fallbackRedirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full max-w-md',
                card: 'shadow-none border border-gray-200 rounded-3xl p-6',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-2 border-gray-200 rounded-xl font-semibold hover:border-navy transition-colors',
                formButtonPrimary: 'bg-coral hover:bg-coral/90 rounded-xl font-semibold shadow-md shadow-coral/20',
                footerActionLink: 'text-coral',
              },
            }}
          />
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">
          Free forever. No spam. Unsubscribe any time.
        </p>
      </div>
    </main>
  );
}
