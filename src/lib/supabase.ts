import { createClient } from '@supabase/supabase-js';

// Ces variables seront lues depuis ton fichier .env en local 
// et depuis les "Environment Variables" sur Vercel en ligne
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Les variables Supabase sont manquantes ! Vérifie ton fichier .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);