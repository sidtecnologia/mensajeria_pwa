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

  // Margen de seguridad: busca todo lo programado hasta el final del minuto actual
  const now = new Date()
  now.setSeconds(now.getSeconds() + 59) 
  const searchTime = now.toISOString()

  console.log("--- EJECUCIÓN CRON ---")
  console.log("Buscando pendientes hasta:", searchTime)

  const { data: jobs, error } = await supabase
    .from('push_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', searchTime)

  if (error) {
    console.error("Error SQL:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }

  if (!jobs || jobs.length === 0) {
    console.log("No hay tareas para procesar en este ciclo.")
    return new Response(JSON.stringify({ processed: 0 }), { headers: corsHeaders })
  }

  console.log(`Procesando ${jobs.length} notificaciones...`)

  const results = await Promise.all(jobs.map(async (job) => {
    try {
      // Llamada a la función que hace el envío real
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
          url: job.url,
          is_scheduler: true // Flag para que send-push sepa que viene del cron
        })
      })

      const pushResult = await res.json()

      // Registrar en historial
      await supabase.from('push_history').insert({
        title: job.title,
        body: job.body,
        image: job.image,
        url: job.url,
        sent_count: pushResult.sent || 0,
        status: 'success'
      })

      // IMPORTANTE: Borramos el job para que no se repita en el siguiente minuto
      await supabase.from('push_jobs').delete().eq('id', job.id)
      
      return { id: job.id, success: true }
    } catch (e) {
      console.error(`Fallo en Job ${job.id}:`, e)
      await supabase.from('push_jobs').update({ status: 'error' }).eq('id', job.id)
      return { id: job.id, success: false }
    }
  }))

  return new Response(JSON.stringify({ processed: results.length }), { headers: corsHeaders })
})