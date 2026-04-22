'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InviteLandingProps {
  handle: string;
  ownerName: string;
  ownerAvatar: string | null;
  inviteCode: string;
  memberCount: number;
  isSignedIn: boolean;
}

export function InviteLanding({
  handle,
  ownerName,
  ownerAvatar,
  inviteCode,
  memberCount,
  isSignedIn,
}: InviteLandingProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = ownerName.split(' ')[0];

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const res = await fetch('/api/circle/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setJoining(false);
        return;
      }
      router.push('/circle');
    } catch {
      setError('Network error. Please try again.');
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[22px] font-[800] text-[#1a1f36] tracking-tight">
            <span>due</span>
            <span className="text-[#ff3b30]">.</span>
            <span>college</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[28px] border border-[#e5e7eb] shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#ff3b30] via-[#ff6b6b] to-[#ff9500]" />

          <div className="p-8 text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden bg-gradient-to-br from-[#ff3b30] to-[#ff6b6b] flex items-center justify-center shadow-[0_4px_16px_rgba(255,59,48,0.2)]">
              {ownerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ownerAvatar}
                  alt={ownerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[32px] font-[700] text-white">
                  {ownerName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Invitation text */}
            <h1 className="text-[24px] font-[800] text-[#1d1d1f] leading-tight mb-2">
              {firstName} wants you in
              <br />
              their Circle
            </h1>
            <p className="text-[15px] text-[#86868b] leading-relaxed mb-1">
              Join {firstName}&apos;s accountability circle on due.college.
            </p>
            <p className="text-[13px] text-[#aeaeb2] mb-6">
              {memberCount} {memberCount === 1 ? 'member' : 'members'} · Track deadlines together
            </p>

            {/* What you get */}
            <div className="bg-[#f5f5f7] rounded-[18px] p-5 mb-6 text-left">
              <p className="text-[13px] font-[700] text-[#1d1d1f] mb-3">What you get</p>
              <div className="space-y-2.5">
                {[
                  { emoji: '🎯', text: 'See each other\u2019s deadline progress' },
                  { emoji: '🔥', text: 'Streak tracking & friendly competition' },
                  { emoji: '💬', text: 'React to milestones & cheer each other on' },
                  { emoji: '📋', text: 'Group challenges to stay on track' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-[16px]">{item.emoji}</span>
                    <span className="text-[14px] text-[#374151]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            {isSignedIn ? (
              <>
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full py-4 rounded-[16px] bg-[#ff3b30] text-white text-[16px] font-[700] transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {joining ? 'Joining…' : `Join ${firstName}'s Circle`}
                </button>
                {error && (
                  <p className="text-[13px] text-[#ff3b30] mt-3">{error}</p>
                )}
              </>
            ) : (
              <a
                href={`/start?redirect_url=/${handle}`}
                className="block w-full py-4 rounded-[16px] bg-[#ff3b30] text-white text-[16px] font-[700] text-center transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                Sign up to join {firstName}&apos;s Circle
              </a>
            )}

            {/* Secondary link */}
            {!isSignedIn && (
              <p className="text-[13px] text-[#86868b] mt-4">
                Already have an account?{' '}
                <a
                  href={`/login?redirect_url=/${handle}`}
                  className="text-[#ff3b30] font-[600] hover:underline"
                >
                  Sign in
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#aeaeb2] mt-6">
          due.college — Never miss a college deadline
        </p>
      </div>
    </div>
  );
}
