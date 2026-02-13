'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PawPrint, Building2, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Pagina di smistamento tutorial - verifica ruolo e reindirizza
export default function TutorialRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = sessionStorage.getItem('vetbuddy_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Auto-redirect based on role
          if (userData.role === 'owner') {
            router.push('/tutorial/proprietari');
            return;
          } else if (userData.role === 'clinic') {
            router.push('/tutorial/cliniche');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
      setLoading(false);
    };
    
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // If user is logged in but has unknown role
  if (user && user.role !== 'owner' && user.role !== 'clinic') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ruolo Non Riconosciuto</h1>
          <p className="text-gray-600 mb-6">
            Il tuo account ha un ruolo ({user.role}) per cui non è disponibile un tutorial specifico.
          </p>
          <Link href="/">
            <Button className="w-full bg-coral-500 hover:bg-coral-600">
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Not logged in - show access denied
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Richiesto</h1>
        <p className="text-gray-600 mb-6">
          I tutorial sono riservati agli utenti registrati. Effettua l'accesso per visualizzare il tutorial dedicato al tuo ruolo.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Tutorial disponibili:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              Tutorial Proprietari (per chi ha animali)
            </li>
            <li className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tutorial Cliniche (per veterinari)
            </li>
          </ul>
        </div>
        <Link href="/">
          <Button className="w-full bg-gradient-to-r from-coral-500 to-orange-600 hover:from-coral-600 hover:to-orange-700">
            Vai alla Home e Accedi <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
