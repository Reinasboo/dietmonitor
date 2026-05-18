import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

function extractBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export async function createAuthenticatedSupabase(request: Request): Promise<{
  supabase: SupabaseClient<Database>;
  user: Awaited<ReturnType<SupabaseClient<Database>['auth']['getUser']>>['data']['user'] | null;
  error: Error | null;
}> {
  const bearerToken = extractBearerToken(request.headers.get('authorization'));

  if (bearerToken && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(bearerToken);

    if (user && !error) {
      return { supabase: supabase as SupabaseClient<Database>, user, error: null };
    }
  }

  const supabase = createRouteHandlerClient<Database>({ cookies }) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user, error };
}