import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/strategy/share — save strategy, return share token
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: any;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { strategy } = body ?? {};
    if (!strategy) return NextResponse.json({ error: 'strategy required' }, { status: 400 });

    const supabase = createServerSupabaseClient();

    // Upsert — one share record per user (update token if they reshare)
    const { data, error } = await supabase
      .from('shared_strategies')
      .upsert(
        {
          user_id: user.id,
          strategy,
          headline: strategy.headline ?? null,
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      )
      .select('token')
      .single();

    if (error) {
      console.error('Share upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.token) {
      console.error('Share upsert returned no token:', data);
      return NextResponse.json({ error: 'No token returned — please try again' }, { status: 500 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://due.college';
    return NextResponse.json({ token: data.token, url: `${base}/strategy/share/${data.token}` });
  } catch (err: any) {
    console.error('Share route unexpected error:', err);
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}

// GET /api/strategy/share?token=xxx — fetch a shared strategy (public)
export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('shared_strategies')
      .select('strategy, headline, created_at')
      .eq('token', token)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
