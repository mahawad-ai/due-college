import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { RESERVED_HANDLES } from '@/lib/usernames';
import { InviteLanding } from './invite-client';

interface Props {
  params: { username: string };
}

/* ── Dynamic OG metadata ─────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = params.username.toLowerCase();

  if (RESERVED_HANDLES.has(handle)) return {};

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('user_handles')
    .select('user_id')
    .eq('handle', handle)
    .maybeSingle();

  if (!data) return {};

  // Fetch the owner's display name from their circle membership
  const { data: member } = await supabase
    .from('circle_members')
    .select('display_name, avatar_url')
    .eq('user_id', data.user_id)
    .limit(1)
    .maybeSingle();

  const displayName = member?.display_name || handle;
  const title = `${displayName} invited you to their Circle — due.college`;
  const description = `Join ${displayName}'s accountability circle on due.college. Track college deadlines together and keep each other on track.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://due.college/${handle}`,
      siteName: 'due.college',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

/* ── Page (server component) ──────────────────────────────── */
export default async function UsernamePage({ params }: Props) {
  const handle = params.username.toLowerCase();

  // If this matches a reserved route, let Next.js fall through to the real route
  if (RESERVED_HANDLES.has(handle)) {
    notFound();
  }

  const supabase = createServerSupabaseClient();

  // 1. Look up the handle owner
  const { data: handleRow } = await supabase
    .from('user_handles')
    .select('user_id')
    .eq('handle', handle)
    .maybeSingle();

  if (!handleRow) {
    notFound();
  }

  const ownerId = handleRow.user_id;

  // 2. Get the owner's circle + display info
  const { data: ownerMembership } = await supabase
    .from('circle_members')
    .select('circle_id, display_name, avatar_url')
    .eq('user_id', ownerId)
    .limit(1)
    .maybeSingle();

  if (!ownerMembership) {
    notFound();
  }

  const { circle_id: circleId, display_name: ownerName, avatar_url: ownerAvatar } = ownerMembership;

  // Get circle details (for invite_code used to join)
  const { data: circle } = await supabase
    .from('circles')
    .select('invite_code')
    .eq('id', circleId)
    .single();

  // Get member count
  const { count: memberCount } = await supabase
    .from('circle_members')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', circleId);

  // 3. Check if there's a logged-in user
  const viewer = await currentUser();

  if (viewer) {
    // State 4: Owner viewing their own page → redirect to dashboard
    if (viewer.id === ownerId) {
      redirect('/dashboard');
    }

    // State 3: Already in the circle → redirect to /circle
    const { data: viewerMembership } = await supabase
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', viewer.id)
      .eq('circle_id', circleId)
      .maybeSingle();

    if (viewerMembership) {
      redirect('/circle');
    }
  }

  // States 1 & 2: Show invite landing page
  return (
    <InviteLanding
      handle={handle}
      ownerName={ownerName || handle}
      ownerAvatar={ownerAvatar || null}
      inviteCode={circle?.invite_code || ''}
      memberCount={memberCount || 1}
      isSignedIn={!!viewer}
    />
  );
}
