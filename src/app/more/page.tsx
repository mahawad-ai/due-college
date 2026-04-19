'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';

const SECTIONS = [
  {
    title: 'College Discovery',
    items: [
      { href: '/strategy', emoji: '🤖', label: 'AI Strategy', desc: 'Your complete plan in 2 minutes — list, ED pick, essay angle' },
      { href: '/explore', emoji: '🔍', label: 'Explore Colleges', desc: 'Search & filter 1,000+ schools' },
      { href: '/suggest', emoji: '✨', label: 'AI College List', desc: 'Get AI-powered Reach/Match/Safety picks' },
      { href: '/profile', emoji: '🎓', label: 'Academic Profile', desc: 'GPA, scores, preferences' },
    ],
  },
  {
    title: 'Application Tools',
    items: [
      { href: '/essays', emoji: '✍️', label: 'Essay Tracker', desc: 'Common App + supplementals' },
      { href: '/recommendations', emoji: '📬', label: 'Recommendations', desc: 'Track letter requests & submissions' },
      { href: '/decisions', emoji: '🏆', label: 'Decision Board', desc: 'Application status per school' },
      { href: '/document-checklist', emoji: '✅', label: 'Document Checklist', desc: 'Transcripts, scores, essays' },
    ],
  },
  {
    title: 'Experience & Scores',
    items: [
      { href: '/activities', emoji: '🌟', label: 'Activities', desc: 'Volunteering, internships, clubs' },
      { href: '/test-scores', emoji: '📊', label: 'Test Scores', desc: 'SAT, ACT, AP, IB' },
      { href: '/interviews', emoji: '🎙️', label: 'Interviews', desc: 'Track alumni & admissions interviews' },
      { href: '/scholarships', emoji: '💰', label: 'Scholarships', desc: 'Deadlines, amounts, status' },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/settings', emoji: '⚙️', label: 'Settings', desc: 'Notifications & profile' },
      { href: '/invite', emoji: '👪', label: 'Invite Parent', desc: 'Share read-only view' },
    ],
  },
];

export default function MorePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) router.push('/login');
  }, [isLoaded, user, router]);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <a href="/" className="text-sm font-[800] text-[#ff3b30] tracking-tight mb-1 block">due.college</a>
              <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-none">All Tools</h1>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {SECTIONS.map(section => (
            <div key={section.title} className="mb-6">
              <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">{section.title}</h2>
              <div className="bg-[#f5f5f7] rounded-2xl divide-y divide-[#e8e8ed] overflow-hidden">
                {section.items.map(item => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-4 px-4 py-3.5 hover:bg-[#e8e8ed] transition-colors">
                    <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1d1d1f] text-sm">{item.label}</p>
                      <p className="text-xs text-[#86868b]">{item.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-[#86868b] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Social links */}
          <div className="mt-2 mb-4">
            <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">Follow Us</h2>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/due.college" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 flex-1 bg-[#f5f5f7] rounded-2xl px-4 py-3.5 hover:bg-[#e8e8ed] transition-colors no-underline">
                <svg className="w-5 h-5 text-[#1d1d1f] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm font-semibold text-[#1d1d1f]">Instagram</span>
              </a>
              <a href="https://www.tiktok.com/@due.college" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 flex-1 bg-[#f5f5f7] rounded-2xl px-4 py-3.5 hover:bg-[#e8e8ed] transition-colors no-underline">
                <svg className="w-5 h-5 text-[#1d1d1f] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
                <span className="text-sm font-semibold text-[#1d1d1f]">TikTok</span>
              </a>
              <a href="https://www.youtube.com/@due.college" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 flex-1 bg-[#f5f5f7] rounded-2xl px-4 py-3.5 hover:bg-[#e8e8ed] transition-colors no-underline">
                <svg className="w-5 h-5 text-[#ff3b30] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-sm font-semibold text-[#1d1d1f]">YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
