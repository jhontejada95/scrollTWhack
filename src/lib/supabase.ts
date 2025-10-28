import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type EmotionType = 'great' | 'good' | 'okay' | 'stressed' | 'exhausted';

export interface User {
  id: string;
  email: string;
  role: 'employee' | 'manager';
  company_id: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  company_id: string;
  emotion: EmotionType;
  score: number;
  comment: string;
  blockchain_hash: string;
  created_at: string;
  date: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  company_id: string;
  used: boolean;
  used_by: string | null;
  created_at: string;
}
