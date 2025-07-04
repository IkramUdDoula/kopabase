// Centralized dynamic/user/environment settings

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const FEATURE_FLAGS = {
  enableMetrics: true,
  enableStorage: true,
};
/**
 * Supabase project URL and anon key, loaded from environment variables.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
// Add more settings as needed 