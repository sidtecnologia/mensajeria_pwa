import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
const DISMISSED_KEY = 'push_toast_dismissed'

function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    console.error('VAPID_PUBLIC_KEY no encontrada')
    return null
  }
  try {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  } catch (e) {
    console.error('Error al convertir VAPID_PUBLIC_KEY:', e)
    return null
  }
}

export function usePushNotifications() {
  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (permission !== 'default' || localStorage.getItem(DISMISSED_KEY)) return

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setSubscribed(true)
        } else {
          const timer = setTimeout(() => setShowToast(true), 8000)
          return () => clearTimeout(timer)
        }
      })
    })
  }, [permission])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub)
      })
    })
  }, [])

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setLoading(true)
    
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setShowToast(false)
        localStorage.setItem(DISMISSED_KEY, '1')
        setLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        throw new Error("Service Worker no activo")
      }

      // Limpieza de suscripción vieja para evitar AbortError
      const existingSub = await registration.pushManager.getSubscription()
      if (existingSub) {
        await existingSub.unsubscribe()
      }

      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      })

      const { endpoint, keys } = subscription.toJSON()
      const { error } = await supabase.from('push_subscriptions').upsert(
        { endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: 'endpoint' }
      )

      if (error) throw error

      setSubscribed(true)
      setShowToast(false)
      console.log('Suscripción exitosa')
    } catch (err) {
      console.error('Error detallado en subscribe:', err)
      if (err.name === 'AbortError') {
        alert("Error de conexión con el servicio de notificaciones. Verifica tu red o configuración del navegador.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const dismissToast = useCallback(() => {
    setShowToast(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }, [])

  const unsubscribe = useCallback(async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
        await subscription.unsubscribe()
        setSubscribed(false)
      }
    } catch (err) {
      console.error('Push unsubscribe error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { permission, subscribed, loading, showToast, subscribe, dismissToast, unsubscribe }
}