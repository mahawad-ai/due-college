'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

/**
 * /circle/join/[code]
 * Legacy invite link handler. Redirects signed-in users after auto-joining,
 * or prompts sign-up for anonymous visitors.
 */
export default function CircleJoinPage() {
  const { code } = useParams<{ code: string }>();
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'joining' | 'error' | 'needs_auth'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStatus('needs_auth');
      return;
    }

    // Auto-join then redirect
    setStatus('joining');
    fetch('/api/circle/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: code }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          setErrorMsg(body.error || 'Could not join circle.');
          setStatus('error');
          return;
        }
        router.push('/circle');
      })
      .catch(() => {
        setErrorMsg('Network error. Please try again.');
        setStatus('error');
      });
  }, [isLoaded, isSignedIn, code, router]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <span className="text-[22px] font-[800] text-[#1a1f36] tracking-tight">
            <span>due</span>
            <span className="text-[#ff3b30]">.</span>
            <span>college</span>
          </span>
        </div>

        <div className="bg-white rounded-[28px] border border-[#e5e7eb] shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#ff3b30] via-[#ff6b6b] to-[#ff9500]" />

          <div className="p-8 text-center">
            {(status === 'loading' || status === 'joining') && (
              <>
                <div className="w-12 h-12 rounded-full border-3 border-[#e8e8ed] border-t-[#ff3b30] animate-spin mx-auto mb-5" />
                <h1 className="text-[20px] font-[800] text-[#1d1d1f] mb-2">
                  {status === 'loading' ? 'Loading…' : 'Joining circle…'}
                </h1>
                <p className="text-[14px] text-[#86868b]">Just a moment.</p>
              </>
            )}

            {status === 'needs_auth' && (
              <>
                <div className="w-20 h-20 rounded-full mx-auto mb-5 bg-gradient-to-br from-[#ff3b30] to-[#ff6b6b] flex items-center justify-center shadow-[0_4px_16px_rgba(255,59,48,0.2)]">
                  <span className="text-[32px]">🎯</span>
                </div>
                <h1 className="text-[24px] font-[800] text-[#1d1d1f] leading-tight mb-2">
                  You&apos;re invited to
                  <br />a Circle
                </h1>
                <p className="text-[15px] text-[#86868b] leading-relaxed mb-6">
                  Sign up for due.college to join this accountability circle and track college deadlines together.
                </p>
                <a
                  href={`/start?redirect_url=/circle/join/${code}`}
                  className="block w-full py-4 rounded-[16px] bg-[#ff3b30] text-white text-[16px] font-[700] text-center transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                >
                  Sign up to join
                </a>
                <p className="text-[13px] text-[#86868b] mt-4">
                  Already have an account?{' '}
                  <a
                    href={`/login?redirect_url=/circle/join/${code}`}
                    className="text-[#ff3b30] font-[600] hover:underline"
                  >
                    Sign in
                  </a>
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-[#fff5f5] flex items-center justify-center">
                  <span className="text-[28px]">😕</span>
                </div>
                <h1 className="text-[20px] font-[800] text-[#1d1d1f] mb-2">
                  Couldn&apos;t join
                </h1>
                <p className="text-[14px] text-[#86868b] mb-6">{errorMsg}</p>
                <button
                  onClick={() => router.push('/circle')}
                  className="w-full py-3 rounded-[14px] bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-[600] transition-all hover:bg-[#e8e8ed]"
                >
                  Go to my Circle
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
