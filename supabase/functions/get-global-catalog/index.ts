import { serve } from "std/http/server.ts"
import { createClient } from "supabase"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXCLUDED_CATEGORIES = ['aderezo', 'adicional', 'complemento', 'extra']
const CONCURRENCY_LIMIT = 10
const PRODUCTS_PER_BUSINESS = 80
const MAX_BUSINESSES = 100

function isExcluded(category: string): boolean {
  const c = (category || '').toLowerCase()
  return EXCLUDED_CATEGORIES.some(ex => c.includes(ex))
}

async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = []
  let index = 0

  async function runNext(): Promise<void> {
    if (index >= tasks.length) return
    const currentIndex = index++
    results[currentIndex] = await tasks[currentIndex]()
    await runNext()
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, runNext)
  await Promise.all(workers)
  return results
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
    const offset = (page - 1) * pageSize

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const [{ data: configs, error: configError }, { data: globalMeta }, { count: totalBusinesses }] = await Promise.all([
      supabaseAdmin
        .from('businesses')
        .select('id, name, slug_url, supabase_url, supabase_key, logo_url, priority')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .range(offset, offset + pageSize - 1)
        .limit(Math.min(pageSize, MAX_BUSINESSES)),
      supabaseAdmin
        .from('global_config')
        .select('value')
        .eq('key', 'banners')
        .single(),
      supabaseAdmin
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
    ])

    if (configError) throw configError

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ products: [], banners: globalMeta?.value || [], businesses: [], pagination: { page, pageSize, total: 0, totalPages: 0 } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      )
    }

    const tasks = configs.map((b) => async () => {
      try {
        const client = createClient(b.supabase_url, b.supabase_key)
        const { data, error } = await client
          .from('products')
          .select('id, name, description, price, image, category, stock, isOffer, featured')
          .gt('stock', 0)
          .limit(PRODUCTS_PER_BUSINESS)

        if (error) return []

        return (data || [])
          .filter(p => !isExcluded(p.category))
          .map(p => ({
            ...p,
            business_id: b.id,
            business_name: b.name,
            business_url: b.slug_url,
            business_priority: b.priority,
          }))
      } catch {
        return []
      }
    })

    const allResults = await withConcurrencyLimit(tasks, CONCURRENCY_LIMIT)
    const products = allResults.flat()
    const total = totalBusinesses ?? 0
    const totalPages = Math.ceil(total / pageSize)

    return new Response(
      JSON.stringify({
        products,
        banners: page === 1 ? (globalMeta?.value || []) : [],
        businesses: page === 1 ? configs : [],
        pagination: { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})