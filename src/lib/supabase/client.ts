import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { authStorage } from '@/lib/supabase/authStorage';
import { createFetchWithTimeout } from '@/lib/supabase/fetchWithTimeout';
import { resolveSupabaseUrl } from '@/lib/supabase/supabaseUrl';
import type { Database } from '@/types/database.types';

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!configuredUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.',
  );
}

const isClientRuntime = Platform.OS !== 'web' || typeof window !== 'undefined';

/**
 * The app's only Supabase client: the shared Kiburan project, anon key only.
 * Authorization is enforced by RLS and RPCs on the server, never by this client.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  resolveSupabaseUrl(configuredUrl),
  supabaseAnonKey,
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: isClientRuntime,
      persistSession: isClientRuntime,
      detectSessionInUrl: Platform.OS === 'web' && typeof window !== 'undefined',
      flowType: 'pkce',
    },
    global: {
      fetch: createFetchWithTimeout(),
    },
  },
);
