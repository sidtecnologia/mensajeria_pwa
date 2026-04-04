import { serve } from "std/http/server.ts"
import { createClient } from "supabase"
import webPush from "web-push"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@ttraigo.com'
    const ADMIN_SECRET = Deno.env.get('ADMIN_PANEL_SECRET') ?? ''
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const authHeader = req.headers.get('x-admin-secret')
    const authBearer = req.headers.get('Authorization')?.split(' ')[1]

    if (authHeader !== ADMIN_SECRET && authBearer !== SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SERVICE_ROLE
    )

    const bodyJson = await req.json().catch(() => ({}))
    let notificationsToSend = []

    if (bodyJson.is_scheduler) {
      const now = new Date().toISOString()
      const { data: jobs } = await supabase
        .from('push_jobs')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', now)

      if (jobs && jobs.length > 0) {
        notificationsToSend = jobs
      }
    } else {
      notificationsToSend = [bodyJson]
    }

    if (notificationsToSend.length === 0) {
      return new Response(JSON.stringify({ message: 'No tasks' }), { headers: corsHeaders })
    }

    const { data: subs } = await supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth')
    
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No subs' }), { headers: corsHeaders })
    }

    webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

    const results = await Promise.all(notificationsToSend.map(async (notif) => {
      const payload = JSON.stringify({
        title: notif.title,
        body: notif.body,
        url: notif.url || '/',
        image: notif.image || null,
        icon: notif.icon || 'https://ttraigo.com/logo.png',
        badge: 'https://ttraigo.com/badge.png'
      })

      let sentCount = 0
      const expired = []

      for (const sub of subs) {
        try {
          const res = await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
          if (res.statusCode === 200 || res.statusCode === 201) sentCount++
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            expired.push(sub.id)
          }
        }
      }

      if (expired.length > 0) {
        await supabase.from('push_subscriptions').delete().in('id', expired)
      }

      if (notif.id && bodyJson.is_scheduler) {
        await supabase.from('push_jobs').update({ 
          status: 'sent', 
          last_sent_at: new Date().toISOString() 
        }).eq('id', notif.id)
      }

      return sentCount
    }))

    const totalSent = results.reduce((a, b) => a + b, 0)

    return new Response(
      JSON.stringify({ sent: totalSent, jobs_processed: notificationsToSend.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})