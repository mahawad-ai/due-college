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
        className="sticky top-0 z-50 h-[56px] flex items-center justify-center">
        <div className="max-w-[1080px] w-full px-6 flex items-center justify-between">
          {/* Wordmark */}
          <div className="flex items-baseline">
            <span className="text-[19px] font-[800] tracking-[-1px] text-[#1d1d1f]">due</span>
            <span className="text-[22px] font-[800] text-[#ff3b30] leading-none relative top-[1px]">.</span>
            <span className="text-[17px] font-[400] tracking-[-0.3px] text-[#1d1d1f]">college</span>
          </div>
          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-[14px] font-[500] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors no-underline px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/start"
              className="text-[14px] font-[600] text-white bg-[#ff3b30] hover:opacity-85 transition-opacity no-underline px-4 py-2 rounded-full">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[680px] mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-[12px] font-[600] text-[#ff3b30] tracking-[0.8px] uppercase mb-5">243 colleges · Free for every student</p>
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

      {/* How it works */}
      <section className="max-w-[860px] mx-auto px-6 py-20">
        <h2 className="text-[32px] sm:text-[38px] font-[800] tracking-[-1.5px] text-[#1d1d1f] text-center mb-12">Three steps to peace of mind</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            { step: '1', title: 'Add your schools', desc: 'Search and select all the colleges you\'re applying to in seconds.' },
            { step: '2', title: 'We load your deadlines', desc: 'Every ED, EA, RD, FAFSA, and scholarship date — pulled in automatically.' },
            { step: '3', title: 'Get reminders before every one', desc: 'We\'ll remind you before deadlines hit so you\'re never caught off guard.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#ff3b30] text-white text-[16px] font-[800] flex items-center justify-center mx-auto mb-4">{s.step}</div>
              <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-2">{s.title}</h3>
              <p className="text-[14px] text-[#86868b] leading-[1.55]">{s.desc}</p>
            </div>
          ))}
        </div>
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
            { icon: '👪', title: 'Keep parents in the loop', desc: 'Share a read-only link so your parents always know where things stand — no nagging required.' },
            { icon: '✨', title: 'AI college suggestions', desc: 'Get a personalized Reach / Match / Safety list based on your GPA, test scores, and preferences.' },
            { icon: '💰', title: 'Scholarships & interviews', desc: 'Track every scholarship deadline and interview — all in the same place as your applications.' },
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
        {/* Social links */}
        <div className="flex items-center justify-center gap-5 mb-5">
          {/* Instagram */}
          <a href="https://www.instagram.com/due.college" target="_blank" rel="noopener noreferrer"
            className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            aria-label="due.college on Instagram"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          {/* TikTok */}
          <a href="https://www.tiktok.com/@due.college" target="_blank" rel="noopener noreferrer"
            className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            aria-label="due.college on TikTok"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
            </svg>
          </a>
          {/* YouTube */}
          <a href="https://www.youtube.com/@due.college" target="_blank" rel="noopener noreferrer"
            className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            aria-label="due.college on YouTube"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
        <p className="mb-1">due.college · Free for students · No spam</p>
        <div className="flex items-center justify-center gap-4 mt-1">
          <Link href="/privacy" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors no-underline">Privacy</Link>
          <span className="text-[#e8e8ed]">·</span>
          <a href="mailto:hello@due.college" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors no-underline">
            Contact (hello@due.college)
          </a>
        </div>
      </footer>
    </main>
  );
}
