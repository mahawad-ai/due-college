import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="text-[22px] font-[800] text-[#1a1f36] tracking-tight">
            <span>due</span>
            <span className="text-[#ff3b30]">.</span>
            <span>college</span>
          </Link>
        </div>

        {/* Illustration */}
        <div className="w-20 h-20 rounded-full bg-[#fff5f5] flex items-center justify-center mx-auto mb-6">
          <span className="text-[36px]">📭</span>
        </div>

        {/* Copy */}
        <h1 className="text-[28px] font-[800] text-[#1d1d1f] mb-3">
          Page not found
        </h1>
        <p className="text-[15px] text-[#86868b] leading-relaxed mb-8">
          This page doesn&apos;t exist or may have moved.
          Let&apos;s get you back on track.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-[14px] bg-[#ff3b30] text-white text-[15px] font-[700] hover:opacity-90 transition-all"
          >
            Go to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-[14px] bg-[#f5f5f7] text-[#1d1d1f] text-[15px] font-[600] hover:bg-[#e8e8ed] transition-all"
          >
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
