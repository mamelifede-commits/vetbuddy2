'use client';
// SubscriptionPlans - Piani abbonamento VetBuddy

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, RefreshCw, Crown, Sparkles, FlaskConical, Building2, Check, X } from 'lucide-react';
import api from '@/app/lib/api';

function SubscriptionPlans({ user }) {
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
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

  const currentPlan = subscriptionStatus?.plan || user?.subscriptionPlan;
  const isActive = subscriptionStatus?.hasSubscription || false;
  const isLab = user?.role === 'lab';
  const isClinic = user?.role === 'clinic';

  const planConfigs = [
    {
      id: 'starter',
      name: 'Clinica Starter',
      price: 29,
      icon: Sparkles,
      color: 'violet',
      borderColor: 'border-violet-300',
      bgColor: 'bg-violet-50',
      buttonColor: 'bg-violet-600 hover:bg-violet-700',
      popular: false,
      forRole: 'clinic',
      features: [
        { text: 'Fino a 2 veterinari', included: true },
        { text: 'Agenda appuntamenti', included: true },
        { text: 'Schede pazienti', included: true },
        { text: 'Link prenotazione', included: true },
        { text: 'Messaggistica', included: true },
        { text: 'Supporto email', included: true },
        { text: 'Metriche avanzate', included: false },
        { text: 'Automazioni', included: false },
        { text: 'Video-consulti', included: false },
      ]
    },
    {
      id: 'pro',
      name: 'Clinica Pro',
      price: 59,
      icon: Crown,
      color: 'amber',
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-50',
      buttonColor: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      popular: true,
      forRole: 'clinic',
      features: [
        { text: 'Veterinari illimitati', included: true },
        { text: 'Tutto di Starter', included: true },
        { text: 'Metriche avanzate', included: true },
        { text: 'Automazioni (21+)', included: true },
        { text: 'Lab Marketplace', included: true },
        { text: 'Video-consulti', included: true },
        { text: 'Report avanzati', included: true },
        { text: 'Google Calendar sync', included: true },
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
      features: [
        { text: 'Dashboard richieste', included: true },
        { text: 'Caricamento referti PDF', included: true },
        { text: 'Listino prezzi', included: true },
        { text: 'Connessione cliniche', included: true },
        { text: 'API esterne (webhook)', included: true },
        { text: 'Notifiche automatiche', included: true },
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
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-semibold text-green-800">Abbonamento attivato! 🎉</p>
            <p className="text-sm text-green-600">Hai 30 giorni di prova gratuita. Benvenuto/a in VetBuddy!</p>
          </div>
        </div>
      )}

      {isActive && !paymentSuccess && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-3">
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
                  ⭐ PIÙ POPOLARE
                </Badge>
              )}
              
              <div className={`inline-flex items-center gap-2 ${plan.bgColor} rounded-lg px-3 py-1.5 w-fit mb-3 ${plan.popular ? 'mt-2' : ''}`}>
                <Icon className={`h-4 w-4 text-${plan.color}-600`} />
                <span className={`text-sm font-semibold text-${plan.color}-700`}>{plan.name}</span>
              </div>
              
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                <span className="text-gray-500 text-sm">/mese</span>
                <p className="text-xs text-gray-400 mt-0.5">IVA esclusa (22%)</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
                <p className="text-xs font-semibold text-green-700">🎁 30 giorni di prova GRATUITA</p>
                <p className="text-xs text-green-600">Nessun addebito fino alla fine del periodo di prova</p>
              </div>
              
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
                <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" /> Piano Attivo
                </Button>
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
