import { serve } from "std/http/server.ts"
import { createClient } from "supabase"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: configs, error: configError } = await supabaseAdmin
      .from('businesses')
      .select('id, name, slug_url, supabase_url, supabase_key, logo_url, priority')
      .eq('is_active', true)
      .eq('priority', 10)
      .limit(20)

    if (configError) throw configError

    const { data: globalMeta } = await supabaseAdmin
      .from('global_config')
      .select('value')
      .eq('key', 'banners')
      .single()

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ products: [], banners: globalMeta?.value || [], businesses: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const fetchPromises = configs.map(async (b) => {
      try {
        const client = createClient(b.supabase_url, b.supabase_key)
        const { data } = await client
          .from('products')
          .select('id, name, description, price, image, category, stock, isOffer, featured')
          .gt('stock', 0)

        const isExcluded = (cat: string) => {
          const c = cat?.toLowerCase() || ''
          return c.includes('aderezo') || c.includes('adicional')
        }

        return (data || [])
          .filter(p => !isExcluded(p.category))
          .map(p => ({
            ...p,
            business_id: b.id,
            business_name: b.name,
            business_url: b.slug_url,
            business_priority: b.priority
          }))
      } catch {
        return []
      }
    })

    const allResults = await Promise.all(fetchPromises)
    const products = allResults.flat()

    return new Response(
      JSON.stringify({ 
        products, 
        banners: globalMeta?.value || [], 
        businesses: configs 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})