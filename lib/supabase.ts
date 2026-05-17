import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseJsClient } from '@supabase/supabase-js';

const missingEnvError = new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.');

function createNoopQueryBuilder() {
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    gte: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    upsert: () => builder,
    single: async () => ({ data: null, error: missingEnvError }),
  };

  return builder;
}

function createMockSupabaseClient() {
  const queryBuilder = createNoopQueryBuilder();

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: missingEnvError }),
      signUp: async () => ({ data: { session: null, user: null }, error: missingEnvError }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: missingEnvError }),
    },
    from: () => queryBuilder,
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __mindfulSupabaseClient: SupabaseJsClient | undefined;
  // eslint-disable-next-line no-var
  var __mindfulSupabaseClientConfig: string | undefined;
}

export const createClient = () =>
  (() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const clientConfig = supabaseUrl && supabaseAnonKey ? `${supabaseUrl}:${supabaseAnonKey}` : 'mock';

    if (globalThis.__mindfulSupabaseClient && globalThis.__mindfulSupabaseClientConfig === clientConfig) {
      return globalThis.__mindfulSupabaseClient;
    }

    const client = supabaseUrl && supabaseAnonKey
      ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
      : (createMockSupabaseClient() as unknown as SupabaseJsClient);

    globalThis.__mindfulSupabaseClient = client;
    globalThis.__mindfulSupabaseClientConfig = clientConfig;

    return client;
  })();

export type SupabaseClient = ReturnType<typeof createClient>;
