export const businessesConfig = [
  {
    id: 'negocio-1',
    name: 'Donde Peter',
    slug_url: 'https://comidarapida.vercel.app',
    supabaseUrl: import.meta.env.VITE_PETER_SB_URL,
    supabaseKey: import.meta.env.VITE_PETER_SB_ANON_KEY,
    priority: 10
  },
  {
    id: 'negocio-2',
    name: 'Perfumero',
    slug_url: 'https://perfumero.vercel.app',
    supabaseUrl: import.meta.env.VITE_PERFUME_SB_URL,
    supabaseKey: import.meta.env.VITE_PERFUME_SB_ANON_KEY,
    priority: 5
  }
];