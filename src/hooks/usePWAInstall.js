import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches 
                          || window.navigator.standalone 
                          || localStorage.getItem('pwa-installed') === 'true';

      const isDismissed = sessionStorage.getItem('pwa-toast-dismissed');

      if (!isInstalled && !isDismissed) {
        setTimeout(() => {
          setIsVisible(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    let autoCloseTimer;
    if (isVisible) {
      autoCloseTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
    return () => clearTimeout(autoCloseTimer);
  }, [isVisible]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const closeToast = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-toast-dismissed', 'true');
  };

  return { isVisible, handleInstall, closeToast };
};