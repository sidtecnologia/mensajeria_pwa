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

    const authHeader = req.headers.get('x-admin-secret')
    if (authHeader !== ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const { title, body, url, icon } = await req.json()
    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body are required' }), { status: 400, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: subscriptions, error: dbError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')

    if (dbError) throw dbError
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No subscriptions found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    webPush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: icon || '/img/favicon.png'
    })

    const expiredIds: string[] = []
    let sent = 0

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const res = await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          )

          if (res.statusCode === 201 || res.statusCode === 200) {
            sent++
          }
        } catch (err) {
          expiredIds.push(sub.id)
        }
      })
    )

    if (expiredIds.length > 0) {
      await supabaseAdmin.from('push_subscriptions').delete().in('id', expiredIds)
    }

    return new Response(
      JSON.stringify({ 
        sent, 
        expired_removed: expiredIds.length, 
        total: subscriptions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})