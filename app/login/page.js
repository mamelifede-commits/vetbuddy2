'use client';

import { useState, useEffect } from 'react';
import { AuthForm } from '@/app/components/auth';
import NewBrandLogo from '@/app/components/shared/NewBrandLogo';
import api from '@/app/lib/api';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vetbuddy_token') : null;
    if (token) {
      api.get('auth/me')
        .then(() => { window.location.href = '/'; })
        .catch(() => {
          localStorage.removeItem('vetbuddy_token');
          api.token = null;
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, []);

  const handleLogin = () => {
    // Il token è già salvato da AuthForm: torna alla home che mostra la dashboard del ruolo
    window.location.href = '/';
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coral-50">
        <div className="text-center">
          <NewBrandLogo size="lg" />
          <p className="mt-4 text-coral-700">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <button onClick={() => { window.location.href = '/'; }} className="inline-flex flex-col items-center gap-2" aria-label="Torna alla home">
            <NewBrandLogo size="lg" showText={false} />
            <span className="text-2xl font-bold"><span className="text-gray-900">vet</span><span className="text-coral-500">buddy</span></span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Accedi a VetBuddy' : 'Registrati su VetBuddy'}
          </h1>
          <p className="text-sm text-gray-500 mb-5">
            {mode === 'login' ? 'Inserisci le tue credenziali per accedere alla piattaforma.' : 'Crea il tuo account gratuito in pochi secondi.'}
          </p>
          <AuthForm mode={mode} setMode={setMode} onLogin={handleLogin} />
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <button onClick={() => { window.location.href = '/'; }} className="hover:text-coral-500 transition underline-offset-2 hover:underline">← Torna alla home</button>
        </p>
      </div>
    </div>
  );
}
