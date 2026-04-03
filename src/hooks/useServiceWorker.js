import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [waitingWorker, setWaitingWorker] = useState(null)
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const onControllerChange = () => {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setHasUpdate(true)
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
            setHasUpdate(true)
          }
        })
      })

      const interval = setInterval(() => registration.update(), 60 * 1000)
      return () => clearInterval(interval)
    })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const applyUpdate = () => {
    if (!waitingWorker) return
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  return { hasUpdate, applyUpdate }
}
