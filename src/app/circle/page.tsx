'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import {
  CircleData,
  CircleMember,
  CircleActivity,
  CircleChallenge,
  CirclePrivacyMode,
  CircleReaction,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// ── Helpers ────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

const AVATAR_COLORS = [
  '#ff3b30', '#ff9500', '#34c759', '#007aff',
  '#5856d6', '#af52de', '#ff2d55', '#00c7be',
];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Sub-components ─────────────────────────────────────────────

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
}

function Avatar({ name, imageUrl, size = 44 }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || '?')[0].toUpperCase();

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor(name),
        fontSize: Math.round(size * 0.4),
        color: '#fff',
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {initial}
    </div>
  );
}

interface ProgressRingProps {
  progress: number; // 0–100
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

function ProgressRing({
  progress,
  size = 52,
  strokeWidth = 3,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8e8ed"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ff3b30"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Reaction emoji map ─────────────────────────────────────────

const REACTION_EMOJI: Record<CircleReaction, string> = {
  fire: '🔥',
  muscle: '💪',
  heart: '❤️',
};

const ALL_REACTIONS: CircleReaction[] = ['fire', 'muscle', 'heart'];

// ── Privacy pill labels ────────────────────────────────────────

const PRIVACY_LABELS: Record<CirclePrivacyMode, string> = {
  open: 'Open',
  effort_only: 'Effort Only',
  private: 'Private',
};

const PRIVACY_DESCRIPTIONS: Record<CirclePrivacyMode, string> = {
  open: 'Friends see everything',
  effort_only: 'Friends see effort, not details',
  private: 'Only you see your progress',
};

const PRIVACY_ORDER: CirclePrivacyMode[] = ['effort_only', 'open', 'private'];

// ── Main Page ──────────────────────────────────────────────────

export default function CirclePage() {
  const { user } = useUser();

  const [data, setData] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [togglingReaction, setTogglingReaction] = useState<string | null>(null);

  // Fetch circle data
  const fetchCircle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/circle');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string })?.error || `Error ${res.status}`);
      }
      const json: CircleData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Circle');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCircle();
  }, [fetchCircle]);

  // Update privacy mode
  async function handlePrivacyChange(mode: CirclePrivacyMode) {
    if (!data || privacyLoading) return;
    setPrivacyLoading(true);
    try {
      const res = await fetch('/api/circle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy_mode: mode }),
      });
      if (!res.ok) throw new Error('Failed to update privacy');
      const updated: Partial<CircleData> = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              circle: {
                ...prev.circle,
                privacy_mode: updated.circle?.privacy_mode ?? mode,
              },
            }
          : prev
      );
    } catch {
      // silently keep existing state
    } finally {
      setPrivacyLoading(false);
    }
  }

  // Toggle reaction on an activity
  async function handleReaction(activityId: string, reaction: CircleReaction) {
    if (!data) return;
    const key = `${activityId}:${reaction}`;
    if (togglingReaction === key) return;
    setTogglingReaction(key);

    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        activities: prev.activities.map((a) => {
          if (a.id !== activityId) return a;
          const userReactions = a.user_reactions ?? [];
          const alreadyReacted = userReactions.includes(reaction);
          const newUserReactions = alreadyReacted
            ? userReactions.filter((r) => r !== reaction)
            : [...userReactions, reaction];

          const existingCounts = a.reactions ?? [];
          const reactionExists = existingCounts.some((rc) => rc.reaction === reaction);
          const updatedReactions = reactionExists
            ? existingCounts.map((rc) =>
                rc.reaction !== reaction
                  ? rc
                  : { ...rc, count: Math.max(0, rc.count + (alreadyReacted ? -1 : 1)) }
              )
            : [...existingCounts, { reaction, count: 1 }];

          return { ...a, user_reactions: newUserReactions, reactions: updatedReactions };
        }),
      };
    });

    try {
      await fetch('/api/circle/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_id: activityId, reaction }),
      });
    } catch {
      // Revert on failure
      await fetchCircle();
    } finally {
      setTogglingReaction(null);
    }
  }

  // Join a challenge
  async function handleJoinChallenge(challengeId: string) {
    if (!data || joiningChallenge) return;
    setJoiningChallenge(challengeId);
    try {
      const res = await fetch(`/api/circle/challenges/${challengeId}/join`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to join challenge');
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          challenges: prev.challenges.map((c) =>
            c.id === challengeId
              ? { ...c, user_joined: true, member_count: (c.member_count ?? 0) + 1 }
              : c
          ),
        };
      });
    } catch {
      // silently fail
    } finally {
      setJoiningChallenge(null);
    }
  }

  // Copy invite URL
  async function handleCopy() {
    if (!data?.invite_url) return;
    try {
      await navigator.clipboard.writeText(data.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — nothing to do
    }
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <>
      <TopNav />

      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-[680px] mx-auto px-6">

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#e8e8ed] border-t-[#ff3b30] animate-spin" />
              <p className="text-[14px] text-[#86868b]">Loading your Circle…</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <p className="text-[16px] font-[600] text-[#1d1d1f]">Couldn't load Circle</p>
              <p className="text-[14px] text-[#86868b]">{error}</p>
              <button
                onClick={fetchCircle}
                className="mt-2 px-5 py-2.5 bg-[#ff3b30] text-white text-[14px] font-[600] rounded-full transition-opacity hover:opacity-80"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Main content */}
          {!loading && !error && data && (
            <div className="flex flex-col gap-10">

              {/* ── Hero ───────────────────────────────────────── */}
              <section className="pt-2">
                <h1 className="text-[32px] font-[800] tracking-[-1px] text-[#1d1d1f] leading-tight">
                  <span className="text-[#ff3b30]">{data.members.length}</span>{' '}
                  {data.members.length === 1 ? 'friend' : 'friends'}. One mission.
                </h1>
                <p className="mt-1 text-[15px] text-[#86868b]">
                  Stay accountable with your college crew.
                </p>
              </section>

              {/* ── Privacy Mode Toggle ────────────────────────── */}
              <section>
                <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
                  Your Privacy
                </h2>
                <div className="flex flex-wrap gap-2">
                  {PRIVACY_ORDER.map((mode) => {
                    const active = data.circle.privacy_mode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => handlePrivacyChange(mode)}
                        disabled={privacyLoading}
                        className={cn(
                          'px-4 py-2 rounded-full text-[13px] font-[600] border transition-all duration-200',
                          active
                            ? 'bg-[#ff3b30] border-[#ff3b30] text-white'
                            : 'bg-white border-[#e8e8ed] text-[#1d1d1f] hover:border-[#ff3b30] hover:text-[#ff3b30]',
                          privacyLoading && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {PRIVACY_LABELS[mode]}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[13px] text-[#86868b]">
                  {PRIVACY_DESCRIPTIONS[data.circle.privacy_mode]}
                </p>
              </section>

              {/* ── Friend Grid ────────────────────────────────── */}
              <section>
                <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
                  Your Circle
                </h2>
                {data.members.length === 0 ? (
                  <p className="text-[14px] text-[#86868b]">
                    No members yet — share your invite link below!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {data.members.map((member: CircleMember) => {
                      const name = member.display_name || 'Friend';
                      const isMe = user?.id === member.user_id;
                      return (
                        <div
                          key={member.id}
                          className="bg-[#f5f5f7] rounded-[22px] p-4 flex flex-col items-center gap-2 text-center"
                        >
                          <ProgressRing progress={isMe ? 72 : 50} size={52} strokeWidth={3}>
                            <Avatar
                              name={name}
                              imageUrl={isMe ? user?.imageUrl : member.avatar_url}
                              size={40}
                            />
                          </ProgressRing>
                          <div>
                            <p className="text-[13px] font-[600] text-[#1d1d1f] leading-tight truncate w-full">
                              {name}
                            </p>
                            {isMe && (
                              <p className="text-[11px] font-[400] text-[#86868b] mt-0.5">You</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ── Activity Feed ──────────────────────────────── */}
              <section>
                <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
                  Recent Activity
                </h2>
                {data.activities.length === 0 ? (
                  <p className="text-[14px] text-[#86868b]">
                    No activity yet. Start working on your apps!
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {data.activities.map((activity: CircleActivity) => {
                      const name = activity.display_name || 'Someone';
                      return (
                        <li
                          key={activity.id}
                          className="bg-[#f5f5f7] rounded-[18px] p-4"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar
                              name={name}
                              imageUrl={activity.avatar_url}
                              size={36}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[13px] font-[600] text-[#1d1d1f] truncate">
                                  {name}
                                </span>
                                <span className="text-[12px] text-[#86868b] flex-shrink-0">
                                  {timeAgo(activity.created_at)}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[14px] text-[#1d1d1f] leading-snug">
                                {activity.content}
                              </p>
                              {/* Reaction chips */}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {ALL_REACTIONS.map((reaction) => {
                                  const countObj = (activity.reactions ?? []).find(
                                    (rc) => rc.reaction === reaction
                                  );
                                  const count = countObj?.count ?? 0;
                                  const reacted = (activity.user_reactions ?? []).includes(reaction);
                                  const key = `${activity.id}:${reaction}`;
                                  return (
                                    <button
                                      key={reaction}
                                      onClick={() => handleReaction(activity.id, reaction)}
                                      disabled={togglingReaction === key}
                                      className={cn(
                                        'flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-[600] border transition-all duration-150',
                                        reacted
                                          ? 'bg-[#ff3b30]/10 border-[#ff3b30]/30 text-[#ff3b30]'
                                          : 'bg-white border-[#e8e8ed] text-[#6e6e73] hover:border-[#ff3b30]/40',
                                        togglingReaction === key && 'opacity-50 cursor-not-allowed'
                                      )}
                                    >
                                      <span>{REACTION_EMOJI[reaction]}</span>
                                      {count > 0 && <span>{count}</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* ── Challenges ─────────────────────────────────── */}
              {data.challenges.length > 0 && (
                <section>
                  <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
                    Challenges
                  </h2>
                  <div className="flex flex-col gap-3">
                    {data.challenges.map((challenge: CircleChallenge) => (
                      <div
                        key={challenge.id}
                        className="relative overflow-hidden rounded-[22px] p-6"
                        style={{
                          background:
                            'linear-gradient(135deg, #1d1d1f 0%, #2d2d30 50%, #3a1a18 100%)',
                        }}
                      >
                        {/* Decorative coral glow */}
                        <div
                          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                          style={{
                            background: 'radial-gradient(circle, #ff3b30 0%, transparent 70%)',
                          }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-[600] text-[#ff3b30] uppercase tracking-[0.08em] mb-1">
                                Challenge
                              </p>
                              <h3 className="text-[18px] font-[700] text-white leading-tight">
                                {challenge.title}
                              </h3>
                              {challenge.description && (
                                <p className="mt-1.5 text-[13px] text-[#86868b] leading-snug">
                                  {challenge.description}
                                </p>
                              )}
                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                {challenge.due_date && (
                                  <span className="text-[12px] text-[#86868b]">
                                    Due{' '}
                                    {new Date(challenge.due_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                )}
                                {(challenge.member_count ?? 0) > 0 && (
                                  <span className="text-[12px] text-[#86868b]">
                                    {challenge.member_count}{' '}
                                    {challenge.member_count === 1 ? 'member' : 'members'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            {challenge.user_joined ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-white text-[13px] font-[600]">
                                <span>&#10003;</span> Joined
                              </span>
                            ) : (
                              <button
                                onClick={() => handleJoinChallenge(challenge.id)}
                                disabled={joiningChallenge === challenge.id}
                                className={cn(
                                  'px-5 py-2.5 rounded-full bg-[#ff3b30] text-white text-[14px] font-[700] transition-all duration-200',
                                  'hover:opacity-90 active:scale-[0.97]',
                                  joiningChallenge === challenge.id && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                {joiningChallenge === challenge.id ? 'Joining…' : 'Join Challenge'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Invite Section ─────────────────────────────── */}
              <section className="pb-4">
                <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
                  Invite Friends
                </h2>
                <div className="bg-[#f5f5f7] rounded-[18px] p-5">
                  <p className="text-[14px] text-[#1d1d1f] mb-3 leading-snug">
                    Share your invite link and build your accountability circle.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white border border-[#e8e8ed] rounded-[12px] px-3 py-2.5">
                      <p className="text-[13px] text-[#6e6e73] truncate font-mono select-all">
                        {data.invite_url}
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        'flex-shrink-0 px-4 py-2.5 rounded-[12px] text-[13px] font-[700] transition-all duration-200',
                        copied
                          ? 'bg-[#34c759] text-white'
                          : 'bg-[#ff3b30] text-white hover:opacity-90 active:scale-[0.97]'
                      )}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </section>

            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </>
  );
}
