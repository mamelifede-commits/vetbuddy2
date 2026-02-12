'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already accepted cookies
    const consent = localStorage.getItem('vetbuddy_cookie_consent');
    if (!consent) {
      // Small delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('vetbuddy_cookie_consent', JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      essential: true,
      functional: true,
      analytics: true
    }));
    setShowBanner(false);
  };

  const acceptEssentialOnly = () => {
    localStorage.setItem('vetbuddy_cookie_consent', JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      essential: true,
      functional: false,
      analytics: false
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">🍪 Utilizziamo i cookie</h3>
              <p className="text-sm text-gray-600 mt-1">
                Utilizziamo cookie per migliorare la tua esperienza su VetBuddy. 
                I cookie essenziali sono necessari per il funzionamento del sito.{' '}
                <Link href="/cookie-policy" className="text-coral-500 hover:underline">
                  Scopri di più
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={acceptEssentialOnly}
              className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Solo essenziali
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-coral-500 hover:bg-coral-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              Accetta tutti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
