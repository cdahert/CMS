/**
 * Supabase Server Client (for Server Components & Server Actions)
 *
 * Install: npm install @supabase/supabase-js @supabase/ssr
 * Add to .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  ← for server-side only
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Read-only context (Server Component) — safe to ignore
          }
        },
      },
    }
  );
}

/**
 * Admin client — bypasses Row Level Security.
 * Use ONLY in trusted Server Actions / API Routes.
 */
export async function createSupabaseAdminClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
