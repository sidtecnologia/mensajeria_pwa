import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: jobs, error } = await supabase
    .from('push_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())

  if (error || !jobs.length) {
    return new Response(JSON.stringify({ processed: 0 }), { headers: { "Content-Type": "application/json" } })
  }

  const results = await Promise.all(jobs.map(async (job) => {
    try {
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
      await supabase.from('push_jobs').update({ status: 'error' }).eq('id', job.id)
      return { id: job.id, success: false }
    }
  }))

  return new Response(JSON.stringify({ processed: results.length }), { headers: { "Content-Type": "application/json" } })
})