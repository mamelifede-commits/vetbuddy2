'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PawPrint, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Pagina di smistamento tutorial - reindirizza ai tutorial specifici
export default function TutorialRedirect() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tutorial VetBuddy</h1>
        <p className="text-gray-600 mb-8">Seleziona il tutorial più adatto a te:</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tutorial Proprietari */}
          <Link href="/tutorial/proprietari">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-blue-300">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Per Proprietari di Animali</h2>
              <p className="text-gray-600 text-sm mb-4">
                Scopri come prenotare visite, gestire i tuoi animali e accedere ai documenti.
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Vai al Tutorial <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Link>
          
          {/* Tutorial Cliniche */}
          <Link href="/tutorial/cliniche">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-coral-300">
              <div className="h-16 w-16 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Per Cliniche Veterinarie</h2>
              <p className="text-gray-600 text-sm mb-4">
                Configura la clinica, gestisci appuntamenti, fatturazione e automazioni.
              </p>
              <Button className="w-full bg-coral-500 hover:bg-coral-600">
                Vai al Tutorial <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Link>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  );
}
