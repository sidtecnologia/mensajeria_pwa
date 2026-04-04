import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Margen de 1 minuto para compensar desfases de segundos entre PC y Servidor
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1) 
  const searchTime = now.toISOString()

  console.log("--- INICIO DE PROCESAMIENTO ---")
  console.log("Buscando tareas programadas hasta (UTC +1min):", searchTime)

  const { data: jobs, error } = await supabase
    .from('push_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', searchTime)

  if (error) {
    console.error("Error consultando push_jobs:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }

  console.log(`Jobs encontrados: ${jobs?.length || 0}`)

  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }

  const results = await Promise.all(jobs.map(async (job) => {
    try {
      console.log(`Enviando: ${job.title}`)
      
      const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': Deno.env.get('ADMIN_PANEL_SECRET') ?? ''
        },
        body: JSON.stringify({
          title: job.title,
          body: job.body,
          image: job.image,
          url: job.url
        })
      })

      const pushResult = await res.json()

      await supabase.from('push_history').insert({
        title: job.title,
        body: job.body,
        image: job.image,
        url: job.url,
        sent_count: pushResult.sent || 0,
        status: 'success'
      })

      await supabase.from('push_jobs').delete().eq('id', job.id)
      return { id: job.id, success: true }
    } catch (e) {
      console.error(`Error en job ${job.id}:`, e)
      await supabase.from('push_jobs').update({ status: 'error' }).eq('id', job.id)
      return { id: job.id, success: false }
    }
  }))

  return new Response(JSON.stringify({ processed: results.length }), { 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  })
})