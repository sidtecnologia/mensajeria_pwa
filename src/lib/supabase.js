import { createClient } from '@supabase/supabase-js'

const CENTRAL_URL = import.meta.env.VITE_CENTRAL_SUPABASE_URL
const CENTRAL_KEY = import.meta.env.VITE_CENTRAL_SUPABASE_ANON_KEY

if (!CENTRAL_URL || !CENTRAL_KEY) {
  console.error("ERROR: Variables de entorno de Supabase no encontradas.")
}

export const supabase = createClient(CENTRAL_URL, CENTRAL_KEY)