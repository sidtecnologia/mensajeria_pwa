import { useState, useEffect, useCallback, useRef } from 'react'

const DISMISSED_KEY = 'pwa_install_dismissed'
const TOAST_DURATION_MS = 10000

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    const show = (prompt) => {
      setDeferredPrompt(prompt)
      setIsVisible(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setIsVisible(false), TOAST_DURATION_MS)
    }

    if (window.__pwaPrompt) {
      show(window.__pwaPrompt)
    }

    const onReady = () => {
      if (window.__pwaPrompt) show(window.__pwaPrompt)
    }

    const onNative = (e) => {
      e.preventDefault()
      window.__pwaPrompt = e
      show(e)
    }

    window.addEventListener('pwaPromptReady', onReady)
    window.addEventListener('beforeinstallprompt', onNative)

    return () => {
      window.removeEventListener('pwaPromptReady', onReady)
      window.removeEventListener('beforeinstallprompt', onNative)
      clearTimeout(timerRef.current)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    const prompt = deferredPrompt || window.__pwaPrompt
    if (!prompt) return
    clearTimeout(timerRef.current)
    setIsVisible(false)
    prompt.prompt()
    const { outcome } = await prompt.userChoice
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