import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // App still loads; protected pages will surface a clear error.
  console.warn('Supabase env vars missing. Check .env');
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  created_at: string;
};

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type EmergencyReport = {
  id: string;
  user_id: string;
  patient: string | null;
  symptoms: string | null;
  risk_level: RiskLevel;
  first_aid_given: string | null;
  suggested_action: string | null;
  location: string | null;
  created_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  language: 'en' | 'te' | 'hi';
  voice_enabled: boolean;
  high_contrast: boolean;
  large_text: boolean;
  updated_at: string;
};
