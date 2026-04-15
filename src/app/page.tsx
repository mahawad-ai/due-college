'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import CollegeSearch from '@/components/CollegeSearch';
import { College } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);

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
    <main className="min-h-screen bg-white" style={{ fontFamily: "-apple-system,'Inter',BlinkMacSystemFont,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'saturate(180%) blur(24px)', WebkitBackdropFilter: 'saturate(180%) blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        className="sticky top-0 z-50 h-[52px] flex items-center justify-center">
        <div className="max-w-[1080px] w-full px-6 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-[19px] font-[800] tracking-[-1px] text-[#1d1d1f]">due</span>
            <span className="text-[22px] font-[800] text-[#ff3b30] leading-none relative top-[1px]">.</span>
            <span className="text-[17px] font-[400] tracking-[-0.3px] text-[#1d1d1f]">college</span>
          </div>
          <Link href="/login"
            className="text-[13px] font-[500] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors no-underline min-h-0">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[680px] mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-[12px] font-[600] text-[#ff3b30] tracking-[0.8px] uppercase mb-5">Free for students</p>
        <h1 className="text-[52px] sm:text-[64px] font-[800] tracking-[-3px] leading-[1.02] text-[#1d1d1f] mb-5">
          Never miss a<br/>
          <span className="text-[#ff3b30]">college deadline.</span>
        </h1>
        <p className="text-[19px] text-[#6e6e73] mb-12 leading-[1.55] font-[400]">
          Add your colleges. We handle the rest — deadlines, essays, recommendations, and more. All in one place.
        </p>

        {/* Search */}
        <CollegeSearch
          selectedColleges={selectedColleges}
          onAdd={addCollege}
          onRemove={removeCollege}
        />

        {/* CTA */}
        {selectedColleges.length >= 1 && (
          <div className="mt-8">
            <button
              onClick={handleSeDeadlines}
              className="inline-flex items-center gap-2 bg-[#ff3b30] text-white font-[600] text-[16px] px-8 py-3.5 rounded-xl hover:opacity-85 transition-opacity min-h-0"
            >
              See My Deadlines
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-[13px] text-[#86868b] mt-3">
              {selectedColleges.length} school{selectedColleges.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-[#e8e8ed] max-w-[860px] mx-auto" />

      {/* Features */}
      <section className="max-w-[860px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {[
            { icon: '📅', title: 'Every deadline, organized', desc: 'ED1, EA, RD, FAFSA, and more — automatically tracked and color-coded by urgency.' },
            { icon: '✍️', title: 'Essays & recommendations', desc: 'Track word counts, deadlines, and recommender status across every school.' },
            { icon: '👥', title: 'Your Circle', desc: 'Go through it with friends. Cheer each other on, share milestones, and stay accountable.' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-[36px] mb-4">{f.icon}</div>
              <h3 className="text-[16px] font-[600] text-[#1d1d1f] mb-2">{f.title}</h3>
              <p className="text-[14px] text-[#86868b] leading-[1.55]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark CTA band */}
      <section className="bg-[#1d1d1f] py-20 px-6 text-center">
        <h2 className="text-[38px] font-[800] tracking-[-2px] text-white mb-4">Ready to get started?</h2>
        <p className="text-[16px] text-white/50 mb-8 max-w-[400px] mx-auto">Free for every student. No credit card needed.</p>
        <button
          onClick={handleSeDeadlines}
          className="inline-flex items-center gap-2 bg-[#ff3b30] text-white font-[600] text-[15px] px-7 py-3 rounded-xl hover:opacity-85 transition-opacity min-h-0"
        >
          Get started free →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e8ed] py-10 text-center text-[13px] text-[#86868b]">
        <p className="mb-1">due.college · Free for students · No spam</p>
        <a href="mailto:hello@due.college" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors no-underline">
          hello@due.college
        </a>
      </footer>
    </main>
  );
}
