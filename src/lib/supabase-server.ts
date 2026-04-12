import { createClient } from '@supabase/supabase-js';

// Server-side client with service role — never expose to browser
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
