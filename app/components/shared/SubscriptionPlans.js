'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Inbox, CheckCircle, RefreshCw } from 'lucide-react';
import api from '@/app/lib/api';

function SubscriptionPlans({ user }) {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(user?.subscriptionPlan || 'pilot');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Controlla se c'è un session_id nell'URL (ritorno da Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentStatus = urlParams.get('payment');
    
    if (sessionId && paymentStatus === 'success') {
      pollPaymentStatus(sessionId);
    }
  }, []);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    if (attempts >= maxAttempts) return;

    try {
      const res = await api.get(`payments/status/${sessionId}`);
      if (res.paymentStatus === 'paid') {
        setPaymentSuccess(true);
        setCurrentPlan(res.metadata?.planId || 'pro');
        // Rimuovi i parametri dall'URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (res.status !== 'expired') {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'starter' || planId === 'pilot') return; // Piani gratuiti
    
    setLoading(true);
    try {
      const originUrl = window.location.origin;
      const res = await api.post('payments/checkout', {
        planId,
        clinicId: user?.id,
        originUrl
      });
      
      if (res.url) {
        window.location.href = res.url; // Redirect a Stripe Checkout
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Errore durante la creazione del pagamento');
    } finally {
      setLoading(false);
    }
  };

  const isPilotActive = currentPlan === 'pilot' || currentPlan === 'pro';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 text-center mb-6">Piani disponibili solo tramite Pilot (su invito). Prezzi IVA esclusa.</p>
      
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-green-800">Pagamento completato!</p>
            <p className="text-sm text-green-600">Il tuo abbonamento è ora attivo.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Starter */}
        <div className="border rounded-lg p-4 bg-white relative">
          <div className="absolute -top-2.5 left-3 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">👨‍⚕️ Per Freelance</div>
          <h3 className="font-semibold mt-2">Starter</h3>
          <p className="text-xs text-gray-500 mb-2">Per veterinari freelance e cliniche in fase di valutazione</p>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-400">Gratis</span>
            <p className="text-xs text-gray-500">solo su invito – Pilot Milano</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">Prezzi IVA esclusa</p>
          <p className="text-xs font-medium text-gray-700 mb-2">Include:</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>• 1 sede, 1 utente</li>
            <li>• Fino a 30 richieste/mese</li>
            <li>• Posizione su mappa</li>
          </ul>
          <Button 
            variant="outline" 
            className="w-full mb-2" 
            disabled={currentPlan === 'starter'}
          >
            {currentPlan === 'starter' ? 'Piano attuale' : 'Richiedi invito'}
          </Button>
          <p className="text-xs text-gray-500 text-center">Accesso disponibile solo per cliniche ammesse al Pilot Milano.</p>
        </div>
        
        {/* Pro - Pilot */}
        <div className={`border-2 rounded-lg p-4 bg-white relative ${isPilotActive ? 'border-amber-500' : 'border-coral-500'}`}>
          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 whitespace-nowrap">PILOT MILANO (su invito)</Badge>
          <h3 className="font-semibold mt-2">Pro</h3>
          <p className="text-xs text-gray-500 mb-2">Tutto incluso per la tua clinica</p>
          <div className="mb-1">
            {isPilotActive ? (
              <>
                <span className="text-2xl font-bold text-coral-500">€0</span>
                <span className="text-sm text-gray-500 ml-1">(Pilot)</span>
                <span className="text-lg text-gray-400 line-through ml-2">€129/mese</span>
                <span className="text-xs text-gray-400 ml-1">+IVA</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-coral-500">€129/mese</span>
                <span className="text-xs text-gray-400 ml-1">+IVA</span>
              </>
            )}
          </div>
          {isPilotActive && (
            <>
              <p className="text-xs text-amber-600 font-semibold">90 giorni gratuiti per cliniche selezionate nel Pilot</p>
              <p className="text-xs text-gray-500 italic mb-2">(Estendibile fino a 6 mesi per cliniche attive che completano onboarding e feedback.)</p>
            </>
          )}
          <p className="text-xs text-gray-400 mb-3">Prezzi IVA esclusa</p>
          <p className="text-xs font-medium text-gray-700 mb-2">Include:</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>• Fino a 10 staff</li>
            <li>• Team Inbox + ticket</li>
            <li>• Documenti + invio email automatico (PDF allegato)</li>
            <li>• Google Calendar sync</li>
            <li>• Report e analytics</li>
          </ul>
          {isPilotActive ? (
            <Button className="w-full bg-amber-500 hover:bg-amber-600" disabled>
              ✓ Attivo nel Pilot
            </Button>
          ) : (
            <Button 
              className="w-full bg-coral-500 hover:bg-coral-600" 
              onClick={() => handleSubscribe('pro')}
              disabled={loading}
            >
              {loading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Caricamento...</> : <>Candidati al Pilot →</>}
            </Button>
          )}
        </div>
        
        {/* Enterprise */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-semibold">Enterprise</h3>
          <p className="text-xs text-gray-500 mb-2">Per gruppi e catene veterinarie</p>
          <div className="mb-2">
            <span className="text-2xl font-bold text-coral-500">Custom</span>
            <span className="text-xs text-gray-400 ml-1">+IVA</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Prezzi IVA esclusa</p>
          <p className="text-xs font-medium text-gray-700 mb-2">Include:</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>• Multi-sede illimitate</li>
            <li>• API dedicata</li>
            <li>• SLA garantito</li>
            <li>• Onboarding dedicato</li>
          </ul>
          <Button 
            className="w-full bg-gray-800 hover:bg-gray-900 mb-2" 
            onClick={() => window.location.href = 'mailto:info@vetbuddy.it?subject=Richiesta%20Enterprise'}
          >
            Contattaci
          </Button>
          <Badge variant="outline" className="w-full justify-center text-amber-700 border-amber-300 bg-amber-50">Solo con Pilot (su invito)</Badge>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Non è una prova libera: stiamo selezionando un numero limitato di cliniche.
      </p>
    </div>
  );
}

// ==================== CLINIC REVIEWS SECTION ====================

export default SubscriptionPlans;
