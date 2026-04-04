import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date().toISOString();
  console.log("--- INICIO DE PROCESAMIENTO ---");
  console.log("Hora actual del servidor (UTC):", now);

  // Consultamos los jobs
  const { data: jobs, error } = await supabase
    .from('push_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)

  if (error) {
    console.error("Error consultando push_jobs:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  console.log(`Jobs encontrados pendientes para envío: ${jobs?.length || 0}`);

  if (!jobs || jobs.length === 0) {
    // Si no hay jobs, revisamos si existen aunque sea para el futuro para descartar errores de tabla
    const { count } = await supabase.from('push_jobs').select('*', { count: 'exact', head: true });
    console.log(`Total de registros en push_jobs (cualquier fecha): ${count || 0}`);
    return new Response(JSON.stringify({ processed: 0, message: "No hay tareas para esta hora" }));
  }

  const results = await Promise.all(jobs.map(async (job) => {
    try {
      console.log(`Procesando Job ID: ${job.id} - Título: ${job.title}`);
      
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
      console.log(`Resultado de send-push para ${job.id}:`, pushResult);

      await supabase.from('push_history').insert({
        title: job.title,
        body: job.body,
        image: job.image,
        url: job.url,
        sent_count: pushResult.sent || 0,
        status: 'success'
      })

      await supabase.from('push_jobs').delete().eq('id', job.id)
      console.log(`Job ${job.id} eliminado tras envío exitoso.`);
      
      return { id: job.id, success: true }
    } catch (e) {
      console.error(`Error procesando job ${job.id}:`, e);
      await supabase.from('push_jobs').update({ status: 'error' }).eq('id', job.id)
      return { id: job.id, success: false }
    }
  }))

  return new Response(JSON.stringify({ processed: results.length }), { headers: { "Content-Type": "application/json" } })
})