export const businessesConfig = [
  {
    id: 'negocio-1',
    name: 'Donde Peter',
    slug_url: 'https://comidarapida.vercel.app',
    supabaseUrl: import.meta.env.VITE_PETER_SB_URL,
    supabaseKey: import.meta.env.VITE_PETER_SB_ANON_KEY,
    priority: 5
  },
  {
    id: 'negocio-3',
    name: 'Asadero',
    slug_url: 'https://polloasado.vercel.app',
    supabaseUrl: import.meta.env.VITE_ASADERO_SB_URL,
    supabaseKey: import.meta.env.VITE_ASADERO_SB_ANON_KEY,
    priority: 10
  },
{
  id: 'negocio-4',
  name: 'Pizza Pizza',
  slug_url: 'https://menupizza.vercel.app',
  supabaseUrl: import.meta.env.VITE_PIZZA_SB_URL,
  supabaseKey: import.meta.env.VITE_PIZZA_SB_ANON_KEY,
  priority: 10
}
];
