import { serve } from "std/http/server.ts"
import { createClient } from "supabase"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function base64UrlToUint8Array(base64UrlData: string): Uint8Array {
  const padding = '='.repeat((4 - (base64UrlData.length % 4)) % 4)
  const base64 = (base64UrlData + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

async function importVapidPrivateKey(privateKeyB64: string): Promise<CryptoKey> {
  const keyData = base64UrlToUint8Array(privateKeyB64)
  return crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )
}

async function buildVapidAuthHeader(audience: string, subject: string, publicKey: string, privateKeyB64: string): Promise<string> {
  const expiration = Math.floor(Date.now() / 1000) + 12 * 3600
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = { aud: audience, exp: expiration, sub: subject }

  const encode = (obj: object) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signingInput = `${encode(header)}.${encode(payload)}`

  const privateKey = await importVapidPrivateKey(privateKeyB64)
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput)
  )

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const token = `${signingInput}.${sigB64}`

  return `vapid t=${token},k=${publicKey}`
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

    const payload = JSON.stringify({ title, body, url: url || '/', icon: icon || '/img/icon-192.png' })
    const expiredIds: string[] = []
    let sent = 0

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const audience = new URL(sub.endpoint).origin
          const vapidAuth = await buildVapidAuthHeader(audience, VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

          const res = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'Authorization': vapidAuth,
              'TTL': '86400',
            },
            body: new TextEncoder().encode(payload),
          })

          if (res.status === 201 || res.status === 200) {
            sent++
          } else if (res.status === 404 || res.status === 410) {
            expiredIds.push(sub.id)
          }
        } catch {
          expiredIds.push(sub.id)
        }
      })
    )

    if (expiredIds.length > 0) {
      await supabaseAdmin.from('push_subscriptions').delete().in('id', expiredIds)
    }

    return new Response(
      JSON.stringify({ sent, expired_removed: expiredIds.length, total: subscriptions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
