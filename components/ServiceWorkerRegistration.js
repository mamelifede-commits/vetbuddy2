'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [swStatus, setSwStatus] = useState('pending');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Only register in browser and production-like environments
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[App] Service Worker registered:', registration.scope);
        setSwStatus('registered');

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('[App] New Service Worker available');
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[App] Service Worker controller changed');
        });

      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
        setSwStatus('error');
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  // Handle update action
  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    // Reload page to get new version
    window.location.reload();
  };

  // Show update banner if new version available
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-coral-200 rounded-xl shadow-lg p-4 z-50 animate-slide-in-up">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-coral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Aggiornamento disponibile</p>
            <p className="text-sm text-gray-500 mt-1">Una nuova versione di VetBuddy è pronta</p>
            <button
              onClick={handleUpdate}
              className="mt-3 w-full bg-coral-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-coral-600 transition-colors"
            >
              Aggiorna ora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
