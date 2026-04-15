'use client';

import { PawPrint, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomeScreen({ user, onContinue }) {
  const firstName = user?.name?.split(' ')[0] || user?.clinicName || 'Utente';
  const roleMessages = {
    clinic: { title: 'Benvenuta nella tua nuova dashboard!', subtitle: 'Configura i servizi, gestisci l\'agenda e connettiti con i tuoi clienti.' },
    owner: { title: 'Benvenuto su VetBuddy!', subtitle: 'Aggiungi i tuoi animali, prenota visite e gestisci la loro salute in un unico posto.' },
    lab: { title: 'Benvenuto nel network VetBuddy!', subtitle: 'Ricevi richieste dalle cliniche e gestisci i referti dalla tua dashboard.' },
    admin: { title: 'Benvenuto, Admin!', subtitle: 'Gestisci la piattaforma dal pannello di controllo.' },
  };
  const msg = roleMessages[user?.role] || roleMessages.owner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-20 w-20 bg-gradient-to-br from-coral-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
          <PawPrint className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ciao, {firstName}!</h1>
          <h2 className="text-xl font-semibold text-coral-600 mb-3">{msg.title}</h2>
          <p className="text-gray-600">{msg.subtitle}</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Heart className="h-4 w-4 text-coral-400" />
          <span>Grazie per far parte della community VetBuddy</span>
        </div>
        <Button 
          onClick={onContinue} 
          className="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg"
        >
          Inizia <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
