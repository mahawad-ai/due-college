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
        </div>
      </main>
      <MobileNav />
    </>
  );
}
