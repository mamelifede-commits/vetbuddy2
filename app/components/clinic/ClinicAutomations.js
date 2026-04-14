'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, AlertTriangle, BarChart3, Bell, Building2, Calendar, Check, CheckCircle, Euro, FileCheck, FileText, Gift, Heart, Info, Lock, Mail, MessageCircle, PawPrint, RefreshCw, Scissors, Shield, Star, Stethoscope, Syringe, Ticket, Timer, TrendingUp, Users, Weight, Zap } from 'lucide-react';
import api from '@/app/lib/api';

function ClinicAutomations({ user, onNavigate }) {
  const [automationSettings, setAutomationSettings] = useState({});
  const [automationLoading, setAutomationLoading] = useState(true);
  const [automationSaving, setAutomationSaving] = useState(null);
  const [clinicPlan, setClinicPlan] = useState('starter');
  const [allowedAutomations, setAllowedAutomations] = useState([]);
  const [planAutomationsCount, setPlanAutomationsCount] = useState(0);

  useEffect(() => {
    loadAutomationSettings();
  }, []);

  const loadAutomationSettings = async () => {
    try {
      const response = await api.get('automations/settings');
      if (response.success) {
        setAutomationSettings(response.settings || {});
        setClinicPlan(response.plan || 'starter');
        setAllowedAutomations(response.allowedAutomations || []);
        setPlanAutomationsCount(response.automationsCount || 0);
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
    } finally {
      setAutomationLoading(false);
    }
  };

  const isAutomationAllowed = (key) => {
    if (clinicPlan === 'custom') return true;
    if (allowedAutomations === 'all') return true;
    return allowedAutomations.includes(key);
  };

  const toggleAutomation = async (key) => {
    if (!isAutomationAllowed(key)) {
      alert(`⚠️ Questa automazione non è inclusa nel piano ${clinicPlan.toUpperCase()}.\n\nEffettua l'upgrade al piano PRO o CUSTOM per sbloccarla.`);
      return;
    }

    const newValue = !automationSettings[key];
    setAutomationSaving(key);
    setAutomationSettings(prev => ({ ...prev, [key]: newValue }));
    
    try {
      const response = await api.post('automations/settings', { key, enabled: newValue });
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error saving automation setting:', error);
      setAutomationSettings(prev => ({ ...prev, [key]: !newValue }));
      alert(error.message || 'Errore nel salvataggio. Riprova.');
    } finally {
      setAutomationSaving(null);
    }
  };

  // Count active automations (only allowed ones)
  const activeAutomationsCount = Object.entries(automationSettings)
    .filter(([key, value]) => value && isAutomationAllowed(key))
    .length;
  const totalAutomations = Object.keys(automationSettings).length;

  // Plan badge color
  const getPlanBadgeColor = () => {
    switch(clinicPlan) {
      case 'custom': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'pro': return 'bg-coral-100 text-coral-700 border-coral-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Helper component for automation item
  const AutomationItem = ({ settingKey, icon, title, description, gradient, forceDisabled = false }) => {
    const allowed = isAutomationAllowed(settingKey);
    const isDisabled = forceDisabled || !allowed;
    
    return (
      <div className={`flex items-center justify-between p-3 ${gradient} rounded-lg ${isDisabled ? 'opacity-50' : ''} relative`}>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="text-sm font-medium flex items-center gap-1">
              {title}
              {!allowed && <Lock className="h-3 w-3 text-gray-400" />}
            </p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!allowed && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
              {clinicPlan === 'starter' ? 'Pro+' : 'Custom'}
            </Badge>
          )}
          <Switch 
            checked={allowed ? automationSettings[settingKey] : false}
            onCheckedChange={() => toggleAutomation(settingKey)}
            disabled={isDisabled || automationSaving === settingKey}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {onNavigate && <BackToDashboard onNavigate={onNavigate} />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-500" /> Automazioni
          </h2>
          <p className="text-gray-500 text-sm">Configura le automazioni per la tua clinica</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-sm px-3 py-1 ${getPlanBadgeColor()}`}>
            Piano: {clinicPlan === 'pro' ? 'Pro' : clinicPlan === 'custom' ? 'Custom' : 'Starter'}
          </Badge>
          <Badge className={`text-lg px-4 py-2 ${activeAutomationsCount >= planAutomationsCount - 2 ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
            {automationLoading ? '...' : `${activeAutomationsCount}/${planAutomationsCount} Attive`}
          </Badge>
        </div>
      </div>

      {automationLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-500">Caricamento automazioni...</span>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Plan Info Banner */}
          {clinicPlan === 'starter' && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold">Piano Starter - 5 Automazioni Incluse</p>
                  <p className="text-green-700 text-sm mt-1">
                    Il tuo piano include <strong>5 automazioni essenziali</strong>: Promemoria appuntamenti, Conferma prenotazione, Benvenuto nuovo pet, Compleanno pet, Conferma automatica.
                    <br/>Per sbloccare tutte le 21+ automazioni avanzate, effettua l'upgrade al piano <strong>Pro</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Promemoria</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Conferma</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Benvenuto Pet</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Compleanno</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Conferma Auto</span>
                  </div>
                  <Button size="sm" className="mt-3 bg-coral-500 hover:bg-coral-600">
                    <Zap className="h-4 w-4 mr-2" /> Upgrade a Pro - Sblocca Altre 16 Automazioni
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {clinicPlan === 'pro' && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
              <p className="text-purple-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span><strong>Piano Pro:</strong> Hai accesso a {planAutomationsCount} automazioni. Le automazioni bloccate 🔒 richiedono il piano Custom.</span>
              </p>
            </div>
          )}
          
          {clinicPlan === 'custom' && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
              <p className="text-purple-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span><strong>Piano Custom:</strong> Tutte le {planAutomationsCount} automazioni vengono eseguite ogni giorno alle 8:00. Attiva solo quelle che ti servono!</span>
              </p>
            </div>
          )}

          {/* Email Automatiche */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" /> Email Automatiche
              </CardTitle>
              <CardDescription>Comunicazioni automatiche ai clienti</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="appointmentReminders" icon={<Bell className="h-4 w-4 text-blue-500" />} title="Promemoria Appuntamenti" description="24h prima" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="bookingConfirmation" icon={<CheckCircle className="h-4 w-4 text-green-500" />} title="Conferma Prenotazione" description="Immediata" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="vaccineRecalls" icon={<Syringe className="h-4 w-4 text-purple-500" />} title="Richiami Vaccini" description="14 giorni prima" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="postVisitFollowup" icon={<Heart className="h-4 w-4 text-red-500" />} title="Follow-up Post Visita" description="24h dopo" gradient="bg-gradient-to-r from-red-50 to-red-100" />
            </CardContent>
          </Card>

          {/* Gestione Smart */}
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" /> Gestione Smart
              </CardTitle>
              <CardDescription>Automazioni per ottimizzare il flusso di lavoro</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="noShowDetection" icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} title="Rilevamento No-Show" description="Notifica automatica" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="waitlistNotification" icon={<Timer className="h-4 w-4 text-blue-500" />} title="Notifica Lista d'Attesa" description="Slot disponibili" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="suggestedSlots" icon={<Calendar className="h-4 w-4 text-green-500" />} title="Slot Suggeriti" description="AI-powered" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="documentReminders" icon={<FileText className="h-4 w-4 text-purple-500" />} title="Promemoria Documenti" description="Scadenze imminenti" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
            </CardContent>
          </Card>

          {/* Messaggi & Report */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" /> Messaggi & Report
              </CardTitle>
              <CardDescription>Comunicazioni e reportistica automatica</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="autoTicketAssignment" icon={<Ticket className="h-4 w-4 text-blue-500" />} title="Assegnazione Ticket Auto" description="Smistamento intelligente" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="aiQuickReplies" icon={<Zap className="h-4 w-4 text-purple-500" />} title="Risposte Rapide AI" description="Suggerimenti intelligenti" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="urgencyNotifications" icon={<AlertCircle className="h-4 w-4 text-red-500" />} title="Notifiche Urgenze" description="Priorità alta" gradient="bg-gradient-to-r from-red-50 to-red-100" />
              <AutomationItem settingKey="weeklyReport" icon={<TrendingUp className="h-4 w-4 text-green-500" />} title="Report Settimanale" description="Ogni lunedì" gradient="bg-gradient-to-r from-green-50 to-green-100" />
            </CardContent>
          </Card>

          {/* Engagement & Fidelizzazione */}
          <Card className="border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" /> Engagement & Fidelizzazione
              </CardTitle>
              <CardDescription>Mantieni i clienti coinvolti</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="petBirthday" icon={<Gift className="h-4 w-4 text-pink-500" />} title="Compleanno Pet" description="Auguri automatici" gradient="bg-gradient-to-r from-pink-50 to-pink-100" />
              <AutomationItem settingKey="reviewRequest" icon={<Star className="h-4 w-4 text-amber-500" />} title="Richiesta Recensione" description="Post visita positiva" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="inactiveClientReactivation" icon={<RefreshCw className="h-4 w-4 text-blue-500" />} title="Riattivazione Clienti" description="Dopo 6 mesi inattività" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="loyaltyProgram" icon={<Star className="h-4 w-4 text-purple-500" />} title="Programma Fedeltà" description="Punti e premi" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="referralProgram" icon={<Users className="h-4 w-4 text-green-500" />} title="Programma Referral" description="Invita un amico" gradient="bg-gradient-to-r from-green-50 to-green-100" />
            </CardContent>
          </Card>

          {/* Salute & Prevenzione */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" /> Salute & Prevenzione
              </CardTitle>
              <CardDescription>Reminder per la salute degli animali</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="antiparasiticReminder" icon={<Shield className="h-4 w-4 text-green-500" />} title="Antiparassitari" description="Richiamo mensile" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="annualCheckup" icon={<Stethoscope className="h-4 w-4 text-blue-500" />} title="Check-up Annuale" description="Promemoria annuale" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="medicationRefill" icon={<Syringe className="h-4 w-4 text-purple-500" />} title="Refill Farmaci" description="Scorte in esaurimento" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="weightAlert" icon={<Weight className="h-4 w-4 text-amber-500" />} title="Allarme Peso" description="Variazioni significative" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="dentalHygiene" icon={<span className="text-lg">🦷</span>} title="Igiene Dentale" description="Richiamo semestrale" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="sterilizationReminder" icon={<span className="text-lg">✂️</span>} title="Sterilizzazione" description="Età consigliata" gradient="bg-gradient-to-r from-pink-50 to-pink-100" />
              <AutomationItem settingKey="seniorPetCare" icon={<span className="text-lg">👴</span>} title="Cura Pet Senior" description="Controlli frequenti" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
            </CardContent>
          </Card>

          {/* Operatività Clinica */}
          <Card className="border-cyan-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-500" /> Operatività Clinica
              </CardTitle>
              <CardDescription>Automazioni per la gestione quotidiana</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="appointmentConfirmation" icon={<CheckCircle className="h-4 w-4 text-green-500" />} title="Conferma Appuntamento" description="1h prima" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="labResultsReady" icon={<FileCheck className="h-4 w-4 text-blue-500" />} title="Referti Pronti" description="Notifica immediata" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
              <AutomationItem settingKey="paymentReminder" icon={<Euro className="h-4 w-4 text-amber-500" />} title="Promemoria Pagamento" description="Fatture scadute" gradient="bg-gradient-to-r from-amber-50 to-amber-100" />
              <AutomationItem settingKey="postSurgeryFollowup" icon={<Scissors className="h-4 w-4 text-red-500" />} title="Follow-up Chirurgia" description="Controllo post-op" gradient="bg-gradient-to-r from-red-50 to-red-100" />
              <AutomationItem settingKey="dailySummary" icon={<BarChart3 className="h-4 w-4 text-purple-500" />} title="Riepilogo Giornaliero" description="Ogni sera" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="lowStockAlert" icon={<AlertTriangle className="h-4 w-4 text-red-500" />} title="Scorte Basse" description="Allarme magazzino" gradient="bg-gradient-to-r from-red-50 to-red-100" />
            </CardContent>
          </Card>

          {/* Stagionali */}
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">🌡️</span> Stagionali
              </CardTitle>
              <CardDescription>Alert basati sulla stagione</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="summerHeatAlert" icon={<span className="text-lg">☀️</span>} title="Allarme Caldo" description="Estate" gradient="bg-gradient-to-r from-orange-50 to-orange-100" />
              <AutomationItem settingKey="tickSeasonAlert" icon={<span className="text-lg">🕷️</span>} title="Stagione Zecche" description="Primavera/Estate" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="newYearFireworksAlert" icon={<span className="text-lg">🎆</span>} title="Capodanno Fuochi" description="Fine anno" gradient="bg-gradient-to-r from-purple-50 to-purple-100" />
              <AutomationItem settingKey="holidayClosures" icon={<Calendar className="h-4 w-4 text-red-500" />} title="Chiusure Festive" description="Notifica clienti" gradient="bg-gradient-to-r from-red-50 to-red-100" />
            </CardContent>
          </Card>

          {/* Ciclo di Vita & Onboarding */}
          <Card className="border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-teal-500" /> Ciclo di Vita Pet
              </CardTitle>
              <CardDescription>Accompagna il pet in ogni fase</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="welcomeNewPet" icon={<span className="text-lg">🎉</span>} title="Benvenuto Nuovo Pet" description="Prima registrazione" gradient="bg-gradient-to-r from-green-50 to-green-100" />
              <AutomationItem settingKey="microchipCheck" icon={<span className="text-lg">📍</span>} title="Verifica Microchip" description="Controllo annuale" gradient="bg-gradient-to-r from-blue-50 to-blue-100" />
            </CardContent>
          </Card>

          {/* Situazioni Delicate */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-gray-500" /> Situazioni Delicate
              </CardTitle>
              <CardDescription>Comunicazioni con sensibilità</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="petCondolences" icon={<span className="text-lg">🕯️</span>} title="Condoglianze" description="In caso di lutto" gradient="bg-gradient-to-r from-gray-50 to-gray-100" />
              <AutomationItem settingKey="griefFollowup" icon={<Heart className="h-4 w-4 text-gray-500" />} title="Follow-up Lutto" description="Dopo 1 mese" gradient="bg-gradient-to-r from-gray-50 to-gray-100" />
            </CardContent>
          </Card>

          {/* Multi-Canale (Coming Soon) */}
          <Card className="border-gray-300 opacity-70">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">📱</span> Multi-Canale
                <Badge className="bg-amber-100 text-amber-700 text-xs">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>Comunicazioni su più piattaforme</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="whatsappReminders" icon={<span className="text-lg">💬</span>} title="WhatsApp Business" description="Richiede integrazione" gradient="bg-gradient-to-r from-green-50 to-green-100" disabled={true} />
              <AutomationItem settingKey="smsEmergency" icon={<span className="text-lg">📲</span>} title="SMS Emergenza" description="Richiede crediti SMS" gradient="bg-gradient-to-r from-blue-50 to-blue-100" disabled={true} />
            </CardContent>
          </Card>

          {/* Staff */}
          <Card className="border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" /> Per lo Staff
              </CardTitle>
              <CardDescription>Automazioni interne per il team</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <AutomationItem settingKey="staffBirthday" icon={<Gift className="h-4 w-4 text-pink-500" />} title="Compleanno Staff" description="Auguri automatici" gradient="bg-gradient-to-r from-pink-50 to-pink-100" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}



export default ClinicAutomations;
