'use client';
// SubscriptionPlans - Piani abbonamento VetBuddy

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, RefreshCw, Crown, Sparkles, FlaskConical, Building2, Check, X, Settings, ExternalLink } from 'lucide-react';
import api from '@/app/lib/api';

function SubscriptionPlans({ user }) {
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    loadSubscriptionStatus();
    loadPlans();
    // Check for return from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const subStatus = urlParams.get('subscription');
    if (sessionId && subStatus === 'success') {
      pollPaymentStatus(sessionId);
    }
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await api.get('stripe/subscription-status');
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const p = await api.get('stripe/plans');
      setPlans(p);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 8;
    if (attempts >= maxAttempts) return;
    try {
      const res = await api.get(`stripe/checkout/status/${sessionId}`);
      if (res.paymentStatus === 'paid' || res.status === 'complete') {
        setPaymentSuccess(true);
        loadSubscriptionStatus();
        window.history.replaceState({}, '', window.location.pathname);
      } else if (res.status !== 'expired') {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    setLoadingPlan(planId);
    try {
      const originUrl = window.location.origin;
      const res = await api.post('stripe/checkout/subscription', {
        planId,
        originUrl
      });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message || 'Errore durante la creazione del pagamento');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const originUrl = window.location.origin;
      const res = await api.post('stripe/portal', { originUrl });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert(error.message || 'Errore durante l\'apertura del portale di gestione');
    } finally {
      setLoadingPortal(false);
    }
  };

  const currentPlan = subscriptionStatus?.plan || user?.subscriptionPlan;
  const isActive = subscriptionStatus?.hasSubscription || false;
  const isLab = user?.role === 'lab';
  const isClinic = user?.role === 'clinic';

  const planConfigs = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      icon: Sparkles,
      color: 'gray',
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-50',
      buttonColor: 'bg-gray-700 hover:bg-gray-800',
      popular: false,
      forRole: 'clinic',
      tagline: 'Per freelance e micro-cliniche',
      features: [
        { text: '1 sede, 1 utente', included: true },
        { text: 'Profilo pubblico clinica', included: true },
        { text: 'Link diretto e QR prenotazione', included: true },
        { text: 'Agenda base', included: true },
        { text: 'Promemoria email automatici', included: true },
        { text: 'Passport base', included: true },
        { text: 'Fino a 50 richieste/mese', included: true },
        { text: 'Promemoria WhatsApp', included: false },
        { text: 'Automazioni avanzate', included: false },
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 69,
      icon: Sparkles,
      color: 'emerald',
      borderColor: 'border-emerald-400',
      bgColor: 'bg-emerald-50',
      buttonColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
      popular: true,
      forRole: 'clinic',
      tagline: 'Consigliato per cliniche piccole e medie',
      features: [
        { text: 'Fino a 3 utenti', included: true },
        { text: 'Tutto Starter +', included: true },
        { text: 'Promemoria WhatsApp', included: true },
        { text: 'Lab Marketplace', included: true },
        { text: 'Mini CRM clienti', included: true },
        { text: 'Documenti e referti via email', included: true },
        { text: 'Google Calendar sync', included: true },
        { text: 'Campagne clienti dormienti', included: true },
        { text: 'Richieste illimitate', included: true },
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      icon: Crown,
      color: 'amber',
      borderColor: 'border-coral-400',
      bgColor: 'bg-coral-50',
      buttonColor: 'bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600',
      popular: false,
      forRole: 'clinic',
      tagline: 'Per cliniche strutturate',
      features: [
        { text: 'Fino a 10 staff', included: true },
        { text: 'Tutto Growth +', included: true },
        { text: 'Automazioni avanzate (40+)', included: true },
        { text: 'Piani Salute', included: true },
        { text: 'Assistente AI clinica', included: true },
        { text: 'Cruscotto valore generato', included: true },
        { text: 'Recupero no-show automatico', included: true },
        { text: 'Network specialisti', included: true },
        { text: 'Supporto prioritario', included: true },
      ]
    },
    {
      id: 'lab_partner',
      name: 'Laboratorio Partner',
      price: 39,
      icon: FlaskConical,
      color: 'blue',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false,
      forRole: 'lab',
      tagline: 'Per laboratori che vogliono ricevere richieste digitali',
      features: [
        { text: 'Dashboard laboratorio', included: true },
        { text: 'Profilo nel marketplace', included: true },
        { text: 'Listino prezzi indicativo', included: true },
        { text: 'Tempi medi referti', included: true },
        { text: 'Disponibilità ritiro campioni', included: true },
        { text: 'Ricezione richieste da cliniche', included: true },
        { text: 'Upload referti PDF', included: true },
        { text: 'Invito cliniche partner', included: true },
        { text: 'Supporto dedicato', included: true },
      ]
    }
  ];

  // Filter plans based on role
  const visiblePlans = planConfigs.filter(p => {
    if (isLab) return p.forRole === 'lab';
    if (isClinic) return p.forRole === 'clinic';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Banner: Prova gratis. Poi scegli il piano. */}
      {!isActive && !paymentSuccess && (
        <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Prova gratis. Poi scegli il piano più adatto.</p>
              <p className="text-sm text-gray-600">Puoi provare VetBuddy gratuitamente. Quando inizi a generare valore reale per la tua clinica, scegli il piano più adatto al tuo team.</p>
            </div>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-semibold text-green-800">Abbonamento attivato! 🎉</p>
            <p className="text-sm text-green-600">Il tuo piano è stato attivato con successo. Benvenuto/a in VetBuddy!</p>
          </div>
        </div>
      )}

      {isActive && !paymentSuccess && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-violet-600" />
            <div>
              <p className="font-semibold text-violet-800">
                Piano attivo: {plans?.[currentPlan]?.name || currentPlan}
              </p>
              <p className="text-sm text-violet-600">
                {subscriptionStatus?.status === 'trialing' ? '🎁 Periodo di prova gratuita attivo' : '✓ Abbonamento attivo'}
                {subscriptionStatus?.trialEnd && ` — scade il ${new Date(subscriptionStatus.trialEnd).toLocaleDateString('it-IT')}`}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-violet-300 text-violet-700 hover:bg-violet-100 whitespace-nowrap"
            onClick={handleManageSubscription}
            disabled={loadingPortal}
          >
            {loadingPortal ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Caricamento...</>
            ) : (
              <><Settings className="h-4 w-4 mr-2" /> Gestisci Abbonamento</>
            )}
          </Button>
        </div>
      )}

      <div className={`grid gap-4 ${visiblePlans.length >= 3 ? 'md:grid-cols-3' : visiblePlans.length === 2 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
        {visiblePlans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const Icon = plan.icon;
          
          return (
            <div 
              key={plan.id} 
              className={`border-2 ${plan.popular ? plan.borderColor : 'border-gray-200'} rounded-xl p-5 bg-white relative flex flex-col`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white whitespace-nowrap shadow-sm">
                  Consigliato
                </Badge>
              )}
              
              <div className={`inline-flex items-center gap-2 ${plan.bgColor} rounded-lg px-3 py-1.5 w-fit mb-2 ${plan.popular ? 'mt-2' : ''}`}>
                <Icon className={`h-4 w-4 text-${plan.color}-600`} />
                <span className={`text-sm font-semibold text-${plan.color}-700`}>{plan.name}</span>
              </div>
              {plan.tagline && (
                <p className="text-xs text-gray-500 mb-3 leading-snug">{plan.tagline}</p>
              )}
              
              <div className="mb-3">
                {plan.price === 0 ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">€0</span>
                    <span className="text-gray-500 text-sm">/mese</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-500 text-sm">/mese</span>
                  </>
                )}
                <p className="text-xs text-gray-400 mt-0.5">IVA esclusa</p>
              </div>

              {plan.id === 'starter' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
                  <p className="text-xs font-semibold text-gray-700">🎁 14 giorni di prova gratuita</p>
                  <p className="text-xs text-gray-600">Poi €29/mese + IVA</p>
                </div>
              )}
              {plan.id === 'growth' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4">
                  <p className="text-xs font-semibold text-emerald-700">🎁 14 giorni di prova gratuita</p>
                  <p className="text-xs text-emerald-600">Poi €69/mese + IVA</p>
                </div>
              )}
              {plan.id === 'pro' && (
                <div className="bg-coral-50 border border-coral-200 rounded-lg px-3 py-2 mb-4">
                  <p className="text-xs font-semibold text-coral-700">🎁 Pilot 90 giorni gratis + report ROI</p>
                  <p className="text-xs text-coral-600">Poi €99/mese + IVA</p>
                </div>
              )}
              {plan.id === 'lab_partner' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
                  <p className="text-xs font-semibold text-blue-700">🎁 Pilot 6 mesi gratis</p>
                  <p className="text-xs text-blue-600">Poi €39/mese + IVA</p>
                </div>
              )}
              
              <div className="flex-1 space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {isCurrent ? (
                <div className="space-y-2">
                  <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" /> Piano Attivo
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                    onClick={handleManageSubscription}
                    disabled={loadingPortal}
                  >
                    {loadingPortal ? (
                      <><RefreshCw className="h-3 w-3 mr-1.5 animate-spin" /> Caricamento...</>
                    ) : (
                      <><ExternalLink className="h-3 w-3 mr-1.5" /> Gestisci fatturazione</>
                    )}
                  </Button>
                </div>
              ) : (
                <Button 
                  className={`w-full text-white ${plan.buttonColor}`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!!loadingPlan}
                >
                  {loadingPlan === plan.id ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Caricamento...</>
                  ) : (
                    <>Inizia la prova gratuita →</>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Enterprise */}
      {isClinic && (
        <div className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-gray-600" />
            <div>
              <p className="font-semibold text-gray-800">Enterprise — Soluzioni personalizzate</p>
              <p className="text-sm text-gray-500">Multi-sede, API dedicata, SLA garantito, onboarding dedicato</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.location.href = 'mailto:info@vetbuddy.it?subject=Richiesta%20Piano%20Enterprise'}
          >
            Contattaci
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        I pagamenti sono gestiti in sicurezza da Stripe. Puoi annullare in qualsiasi momento.
      </p>
    </div>
  );
}

export default SubscriptionPlans;
