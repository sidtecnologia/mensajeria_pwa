import { useState, useEffect, useCallback, useRef } from 'react'

const DISMISSED_KEY = 'pwa_install_dismissed'
const TOAST_DURATION_MS = 10000

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.__pwaPrompt || null)
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    const show = (e) => {
      setDeferredPrompt(e)
      setIsVisible(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setIsVisible(false), TOAST_DURATION_MS)
    }

    if (window.__pwaPrompt) {
      show(window.__pwaPrompt)
    }

    const handler = (e) => {
      e.preventDefault()
      window.__pwaPrompt = e
      show(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timerRef.current)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    clearTimeout(timerRef.current)
    setIsVisible(false)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    window.__pwaPrompt = null
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, '1')
    }
  }, [deferredPrompt])

  const closeToast = useCallback(() => {
    clearTimeout(timerRef.current)
    setIsVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }, [])

  return { isVisible, handleInstall, closeToast }
}