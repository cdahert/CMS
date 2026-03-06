/**
 * Supabase Browser Client
 *
 * Install: npm install @supabase/supabase-js @supabase/ssr
 * Add to .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 */

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
