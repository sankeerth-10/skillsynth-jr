
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Prevent the SDK from crashing if keys are not yet provided
const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      // Mock object to prevent runtime crashes in components that expect the client
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: { message: "Supabase URL/Key not configured." } }),
        signUp: async () => ({ error: { message: "Supabase URL/Key not configured." } }),
        signOut: async () => {},
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
            limit: () => ({ data: [], error: null })
          }),
          order: () => ({ limit: () => ({ data: [], error: null }) })
        }),
        update: () => ({ eq: async () => ({ error: { message: "Supabase not configured" } }) }),
        insert: async () => ({ error: { message: "Supabase not configured" } }),
      })
    } as any);

if (!isConfigured) {
  console.warn("SkillSynth: Supabase is not configured. Cloud sync and Auth will be disabled. Update your index.html process.env keys.");
}
