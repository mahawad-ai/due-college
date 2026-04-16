'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard',   path: '/dashboard' },
  { name: 'Deadlines',   path: '/deadlines' },
  { name: 'Essays',      path: '/essays' },
  { name: 'Discover',    path: '/discover/search' },
  { name: 'Activities',  path: '/activities' },
  { name: 'Circle',      path: '/circle' },
  { name: 'Parent',      path: '/invite' },
];

export default function TopNav() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || (path !== '/dashboard' && pathname.startsWith(path));

  return (
    <nav className="frosted-nav fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-center">
      <div className="max-w-[1080px] w-full px-6 flex items-center justify-between">

        {/* Wordmark */}
        <Link href="/dashboard" className="flex items-baseline gap-0 no-underline select-none flex-shrink-0">
          <span className="text-[19px] font-[800] tracking-[-1px] text-[#1d1d1f]">due</span>
          <span className="text-[22px] font-[800] text-[#ff3b30] leading-none relative top-[1px]">.</span>
          <span className="text-[17px] font-[400] tracking-[-0.3px] text-[#1d1d1f]">college</span>
        </Link>

        {/* Nav links — centered */}
        <ul className="hidden md:flex items-center gap-7 list-none absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={cn(
                  'text-[13px] font-[400] text-[#6e6e73] no-underline pb-[2px] transition-all duration-200',
                  'border-b-[1.5px] border-transparent',
                  isActive(item.path) && 'text-[#1d1d1f] font-[600] border-b-[#ff3b30]'
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right — avatar */}
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-[30px] h-[30px]',
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </div>
    </nav>
  );
}
