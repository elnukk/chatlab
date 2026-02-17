import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Verifies the current request is from an authenticated researcher.
 * Uses Supabase SSR to read the auth cookie set during login.
 *
 * @returns {{ user: Object, supabase: Object } | null} The authenticated user and supabase client, or null if not authenticated.
 */
export async function getAuthenticatedUser() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { user, supabase };
}
