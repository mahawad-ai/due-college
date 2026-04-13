'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Deadlines', path: '/school', icon: '📅' },
  { name: 'Activities', path: '/activities', icon: '⭐' },
  { name: 'Essays', path: '/essays', icon: '✍️' },
  { name: 'Interviews', path: '/interviews', icon: '🎤' },
  { name: 'Recommendations', path: '/recommendations', icon: '💬' },
  { name: 'Test Scores', path: '/test-scores', icon: '📝' },
  { name: 'Scholarships', path: '/scholarships', icon: '💰' },
  { name: 'Decisions', path: '/decisions', icon: '✔️' },
  { name: '---', path: '', icon: '' },
  { name: 'College Discovery', path: '/discover/profile', icon: '🎓' },
  { name: 'Search Colleges', path: '/discover/search', icon: '🔍' },
  { name: 'AI Recommendations', path: '/discover/recommendations', icon: '🤖' },
  { name: 'App Feedback', path: '/discover/feedback', icon: '💡' },
  { name: '---', path: '', icon: '' },
  { name: 'More', path: '/more', icon: '⚙️' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-navy/30">
        <Link href="/dashboard" className="text-2xl font-bold">
          due.college
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) =>
            item.name === '---' ? (
              <li key={Math.random()} className="my-3 border-t border-navy/30" />
            ) : (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    pathname === item.path || pathname.startsWith(item.path)
                      ? 'bg-coral text-white font-semibold'
                      : 'text-blue-100 hover:bg-navy/50'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-navy/30 flex items-center justify-between">
        <span className="text-sm text-blue-100">Account</span>
        <UserButton />
      </div>
    </aside>
  );
}
