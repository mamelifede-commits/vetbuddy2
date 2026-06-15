'use client';

import { useState } from 'react';
import { PawPrint, ArrowRight, Heart, CheckCircle, Building2, FlaskConical, Users, Sparkles, Calendar, MessageCircle, Send, FileText, Stethoscope, QrCode, ShieldCheck, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Step-per-attore: Clinica, Proprietario, Laboratorio
const ROLE_FLOWS = {
  clinic: {
    title: 'Benvenuta nella tua dashboard!',
    subtitle: 'Configura la tua clinica in pochi minuti.',
    icon: Building2,
    color: 'coral',
    plan: { label: 'Prova gratis 14 giorni', subtext: 'Poi €29-99/mese in base al piano' },
    steps: [
      { icon: Building2, title: 'Crea profilo clinica', desc: 'Nome, indirizzo, contatti', action: 'settings' },
      { icon: Stethoscope, title: 'Configura servizi e agenda', desc: 'Visite, vaccini, orari', action: 'services' },
      { icon: QrCode, title: 'Genera link e QR prenotazione', desc: 'Condividili sui tuoi canali', action: 'bookinglink' },
      { icon: Users, title: 'Invita proprietari', desc: 'Singolo, massivo o link', action: 'vetbuddy-connect' },
      { icon: FlaskConical, title: 'Collega laboratori', desc: 'Invia richieste digitali', action: 'labmarketplace' },
      { icon: Sparkles, title: 'Attiva automazioni', desc: 'Promemoria automatici', action: 'automations' },
      { icon: CheckCircle, title: 'Misura valore generato', desc: 'Cruscotto KPI', action: 'value-dashboard' }
    ]
  },
  owner: {
    title: 'Benvenuto su VetBuddy!',
    subtitle: 'Gestisci la salute dei tuoi animali in un unico posto.',
    icon: Heart,
    color: 'emerald',
    plan: { label: 'Gratis per sempre', subtext: 'Nessun costo nascosto' },
    steps: [
      { icon: Heart, title: 'Crea profilo', desc: 'Nome, contatti, emergenza', action: 'profile' },
      { icon: PawPrint, title: 'Aggiungi animale', desc: 'Specie, razza, microchip', action: 'pets' },
      { icon: FileText, title: 'Completa Passport', desc: 'Allergie, vaccini, documenti', action: 'pets' },
      { icon: Send, title: 'Invita la tua clinica', desc: 'Collega il veterinario di fiducia', action: 'inviteClinic' },
      { icon: Calendar, title: 'Prenota online', desc: 'Niente più telefonate', action: 'findClinic' },
      { icon: MessageCircle, title: 'Ricevi promemoria', desc: 'Vaccini, controlli, scadenze', action: 'appointments' },
      { icon: ShieldCheck, title: 'Condividi con pet sitter (opzionale)', desc: 'Link temporaneo Passport', action: 'pets' }
    ]
  },
  lab: {
    title: 'Benvenuto nel network VetBuddy!',
    subtitle: 'Ricevi richieste digitali dalle cliniche e gestisci i referti.',
    icon: FlaskConical,
    color: 'blue',
    plan: { label: 'Pilot gratuito 6 mesi', subtext: 'Poi €39/mese' },
    steps: [
      { icon: FlaskConical, title: 'Crea profilo laboratorio', desc: 'Nome, indirizzo, contatti', action: 'settings' },
      { icon: FileText, title: 'Aggiungi listino indicativo', desc: 'Esami, prezzi indicativi', action: 'prices' },
      { icon: ShieldCheck, title: 'Tempi medi e ritiro campioni', desc: 'Disponibilità logistica', action: 'settings' },
      { icon: Users, title: 'Invita cliniche partner', desc: 'Portale le tue cliniche', action: 'connect' },
      { icon: Send, title: 'Ricevi richieste', desc: 'Notifiche email automatiche', action: 'requests' },
      { icon: CheckCircle, title: 'Carica referti PDF', desc: 'Aggiorna stato richieste', action: 'requests' },
      { icon: Sparkles, title: 'Monitora richieste', desc: 'Dashboard centralizzata', action: 'connections' }
    ]
  },
  admin: {
    title: 'Benvenuto, Admin!',
    subtitle: 'Gestisci la piattaforma dal pannello di controllo.',
    icon: Sparkles,
    color: 'purple',
    plan: null,
    steps: []
  }
};

export default function WelcomeScreen({ user, onContinue }) {
  const [view, setView] = useState('welcome'); // 'welcome' | 'wizard'
  const flow = ROLE_FLOWS[user?.role] || ROLE_FLOWS.owner;
  const Icon = flow.icon;
  const firstName = user?.name?.split(' ')[0] || user?.clinicName || user?.labName || 'Utente';

  if (view === 'welcome') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-${flow.color}-50 via-white to-orange-50 flex items-center justify-center p-6`}>
        <div className="max-w-lg w-full text-center space-y-6">
          <div className={`h-20 w-20 bg-gradient-to-br from-${flow.color}-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl`}>
            <Icon className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ciao, {firstName}!</h1>
            <h2 className={`text-xl font-semibold text-${flow.color}-600 mb-3`}>{flow.title}</h2>
            <p className="text-gray-600">{flow.subtitle}</p>
          </div>

          {flow.plan && (
            <div className={`bg-${flow.color}-50 border border-${flow.color}-200 rounded-xl p-4`}>
              <Badge className={`bg-${flow.color}-100 text-${flow.color}-700 mb-2`}>{flow.plan.label}</Badge>
              <p className="text-sm text-gray-600">{flow.plan.subtext}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-coral-50 via-amber-50 to-emerald-50 rounded-xl p-4 border border-coral-100">
            <p className="text-sm text-gray-700 font-medium mb-1">🌐 Tre attori, un solo ecosistema</p>
            <p className="text-xs text-gray-600">Cliniche, proprietari e laboratori. Tutti collegati. Meno caos, più valore.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            {flow.steps.length > 0 && (
              <Button
                onClick={() => setView('wizard')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Mostra i prossimi passi
              </Button>
            )}
            <Button
              onClick={onContinue}
              className={`bg-gradient-to-r from-${flow.color}-500 to-orange-500 hover:from-${flow.color}-600 hover:to-orange-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg w-full sm:w-auto`}
            >
              Inizia <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Heart className="h-4 w-4 text-coral-400" />
            <span>Grazie per far parte della rete VetBuddy</span>
          </div>
        </div>
      </div>
    );
  }

  // WIZARD VIEW - mostra steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-orange-50 p-6">
      <div className="max-w-3xl mx-auto py-12">
        <div className="text-center mb-8">
          <div className={`h-14 w-14 bg-gradient-to-br from-${flow.color}-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">I tuoi prossimi passi su VetBuddy</h1>
          <p className="text-gray-600 mt-2">{firstName}, ecco la checklist consigliata per iniziare al meglio.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {flow.steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 bg-${flow.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <StepIcon className={`h-5 w-5 text-${flow.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">PASSO {idx + 1}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mt-1">{step.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setView('welcome')}>
            <ChevronLeft className="h-4 w-4 mr-1" />Indietro
          </Button>
          <Button
            onClick={onContinue}
            className={`bg-gradient-to-r from-${flow.color}-500 to-orange-500 hover:from-${flow.color}-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl shadow-lg`}
          >
            Vai alla Dashboard <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
