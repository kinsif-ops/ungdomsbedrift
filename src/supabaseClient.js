import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase-nøkler mangler. Kopier .env.example til .env og fyll inn verdiene.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
