import { createClient } from '@supabase/supabase-api'

const CENTRAL_URL = import.meta.env.VITE_CENTRAL_SUPABASE_URL
const CENTRAL_KEY = import.meta.env.VITE_CENTRAL_SUPABASE_ANON_KEY

export const supabaseCentral = createClient(CENTRAL_URL, CENTRAL_KEY)

export const restaurants = [
  { id: 'negocio1', url: import.meta.env.VITE_RESTAURANT_1_URL, key: import.meta.env.VITE_RESTAURANT_1_KEY, name: 'Restaurante A' },
  { id: 'negocio2', url: import.meta.env.VITE_RESTAURANT_2_URL, key: import.meta.env.VITE_RESTAURANT_2_KEY, name: 'Restaurante B' }
]

export const getRestaurantClient = (config) => createClient(config.url, config.key)