'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import CollegeSearch from '@/components/CollegeSearch';
import { College } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedColleges');
      if (saved) setSelectedColleges(JSON.parse(saved));
    } catch {}
  }, []);

  function addCollege(college: College) {
    const updated = [...selectedColleges, college];
    setSelectedColleges(updated);
    localStorage.setItem('selectedColleges', JSON.stringify(updated));
  }

  function removeCollege(id: string) {
    const updated = selectedColleges.filter((c) => c.id !== id);
    setSelectedColleges(updated);
    localStorage.setItem('selectedColleges', JSON.stringify(updated));
  }

  function handleSeDeadlines() {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      router.push('/start');
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-container mx-auto px-4 pt-16 pb-8 text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-12">
          <span className="text-2xl font-extrabold text-navy tracking-tight">due.college</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy leading-tight mb-4 text-balance">
          Make sure you actually hit every deadline
        </h1>
        <p className="text-xl text-gray-500 mb-12 text-balance">
          Add your colleges. We handle the rest.
        </p>

        {/* Search */}
        <CollegeSearch
          selectedColleges={selectedColleges}
          onAdd={addCollege}
          onRemove={removeCollege}
        />

        {/* CTA */}
        {selectedColleges.length >= 1 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={handleSeDeadlines}
              className="inline-flex items-center gap-2 bg-coral text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-coral/25 hover:bg-coral/90 transition-all hover:scale-[1.02] active:scale-100"
            >
              See My Deadlines
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-sm text-gray-400 mt-3">
              {selectedColleges.length} school{selectedColleges.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="max-w-container mx-auto px-4 py-16 border-t border-gray-100">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            {
              icon: '📅',
              title: 'Every deadline in one place',
              desc: 'ED1, EA, RD, FAFSA, and more — all organized and color-coded.',
            },
            {
              icon: '⏰',
              title: 'Reminders before it matters',
              desc: 'Email and SMS at 30, 14, 7, 3, and 1 day before each deadline.',
            },
            {
              icon: '👪',
              title: 'Keep parents in the loop',
              desc: 'Share a read-only dashboard so parents stay informed, not stressed.',
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-navy mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>due.college · Free for students · No spam</p>
        <p className="mt-1">
          <a href="mailto:hello@due.college" className="hover:text-gray-600">
            hello@due.college
          </a>
        </p>
      </footer>
    </main>
  );
}
