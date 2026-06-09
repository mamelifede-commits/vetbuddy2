'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, AlertTriangle, BarChart3, Bell, Building2, Calendar, Check, CheckCircle, Euro, FileCheck, FileText, Gift, Heart, History, Info, Lock, Mail, MessageCircle, PawPrint, RefreshCw, Scissors, Settings2, Shield, Star, Stethoscope, Syringe, Ticket, Timer, TrendingUp, Users, Weight, Zap, Send, Eye } from 'lucide-react';
import api from '@/app/lib/api';
import BackToDashboard from '@/app/components/shared/BackToDashboard';

function ClinicAutomations({ user, onNavigate }) {
  const [automationSettings, setAutomationSettings] = useState({});
  const [automationLoading, setAutomationLoading] = useState(true);
  const [automationSaving, setAutomationSaving] = useState(null);
  const [clinicPlan, setClinicPlan] = useState('starter');
  const [allowedAutomations, setAllowedAutomations] = useState([]);
  const [planAutomationsCount, setPlanAutomationsCount] = useState(0);
  const [automationConfig, setAutomationConfig] = useState({});
  const [automationLogs, setAutomationLogs] = useState([]);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showLogSection, setShowLogSection] = useState(false);
  const [configTarget, setConfigTarget] = useState(null);
  const [configForm, setConfigForm] = useState({ timing: '', messageTemplate: '', channel: 'email' });

  useEffect(() => {
    loadAutomationSettings();
  }, []);

  const loadAutomationSettings = async () => {
    try {
      const [settingsRes, logRes] = await Promise.all([
        api.get('automations/settings'),
        api.get('automations/log')
      ]);
      if (settingsRes.success) {
        setAutomationSettings(settingsRes.settings || {});
        setAutomationConfig(settingsRes.config || {});
        setClinicPlan(settingsRes.plan || 'starter');
        setAllowedAutomations(settingsRes.allowedAutomations || []);
        setPlanAutomationsCount(settingsRes.automationsCount || 0);
      }
      if (logRes.success) {
        setAutomationLogs(logRes.logs || []);
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

  const openConfig = (settingKey, title) => {
    const existingConfig = automationConfig[settingKey] || {};
    setConfigTarget({ key: settingKey, title });
    setConfigForm({
      timing: existingConfig.timing || '',
      messageTemplate: existingConfig.messageTemplate || '',
      channel: existingConfig.channel || 'email'
    });
    setShowConfigDialog(true);
  };

  const saveConfig = async () => {
    if (!configTarget) return;
    try {
      await api.post('automations/config', {
        key: configTarget.key,
        ...configForm
      });
      setAutomationConfig(prev => ({ ...prev, [configTarget.key]: { ...configForm } }));
      setShowConfigDialog(false);
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  // Helper component for automation item
  const AutomationItem = ({ settingKey, icon, title, description, gradient, forceDisabled = false }) => {
    const allowed = isAutomationAllowed(settingKey);
    const isDisabled = forceDisabled || !allowed;
    const hasConfig = automationConfig[settingKey];
    
    return (
      <div className={`flex items-center justify-between p-3 ${gradient} rounded-lg ${isDisabled ? 'opacity-50' : ''} relative group`}>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="text-sm font-medium flex items-center gap-1">
              {title}
              {!allowed && <Lock className="h-3 w-3 text-gray-400" />}
              {hasConfig && <Settings2 className="h-3 w-3 text-purple-400" />}
            </p>
            <p className="text-xs text-gray-500">
              {hasConfig?.timing ? hasConfig.timing : description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allowed && !isDisabled && (
            <button onClick={() => openConfig(settingKey, title)} className="p-1 rounded text-gray-400 hover:text-purple-500 hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition-all">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          )}
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
          <Button variant="outline" size="sm" onClick={() => setShowLogSection(!showLogSection)} className="text-xs">
            <History className="h-3.5 w-3.5 mr-1" /> Cronologia
          </Button>
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

      {/* ========== CAMPAGNE MIRATE (NUOVO - PHASE 2) ========== */}
      {!automationLoading && (
        <Card className="border-coral-300 bg-gradient-to-br from-coral-50 to-orange-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-coral-500" /> Campagne Mirate
              <Badge className="bg-purple-100 text-purple-700 text-xs">✨ Nuovo</Badge>
            </CardTitle>
            <CardDescription>
              Crea campagne di marketing mirate per coinvolgere i tuoi clienti su temi specifici (dentale, vaccini, sterilizzazione, prevenzione)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Campagna Dentale */}
              <Card className="border-blue-300 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-2xl">🦷</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">Campagna Igiene Dentale</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Invia promemoria per pulizia denti e controlli dentali ai proprietari di pet con più di 3 anni. 
                        <span className="text-blue-600 font-medium"> Target: Pet 3+ anni senza visita dentale negli ultimi 12 mesi.</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">📧 Email</Badge>
                        <Badge variant="outline" className="text-xs">💬 WhatsApp (demo)</Badge>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">~120 clienti target</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                          <Send className="h-3 w-3 mr-1" /> Lancia Campagna
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Anteprima
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campagna Vaccini */}
              <Card className="border-purple-300 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <Syringe className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900">Campagna Richiami Vaccini</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Contatta proprietari con vaccini in scadenza nei prossimi 30 giorni per confermare appuntamento.
                        <span className="text-purple-600 font-medium"> Target: Vaccini scadenza entro 30gg.</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">📧 Email</Badge>
                        <Badge variant="outline" className="text-xs">💬 WhatsApp (demo)</Badge>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">~85 clienti target</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                          <Send className="h-3 w-3 mr-1" /> Lancia Campagna
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Anteprima
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campagna Sterilizzazione */}
              <Card className="border-pink-300 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-2xl">✂️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-pink-900">Campagna Sterilizzazione</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Offri consulenza gratuita su sterilizzazione per cuccioli tra 6-12 mesi non ancora sterilizzati.
                        <span className="text-pink-600 font-medium"> Target: Cuccioli 6-12 mesi, non sterilizzati.</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">📧 Email</Badge>
                        <Badge variant="outline" className="text-xs">💬 WhatsApp (demo)</Badge>
                        <Badge className="bg-pink-100 text-pink-700 text-xs">~42 clienti target</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
                          <Send className="h-3 w-3 mr-1" /> Lancia Campagna
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Anteprima
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campagna Antiparassitari */}
              <Card className="border-green-300 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">Campagna Antiparassitari Stagionale</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Promemoria stagionale (primavera/estate) per antiparassitari e protezione da zecche/pulci.
                        <span className="text-green-600 font-medium"> Target: Tutti i clienti attivi.</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">📧 Email</Badge>
                        <Badge variant="outline" className="text-xs">💬 WhatsApp (demo)</Badge>
                        <Badge className="bg-green-100 text-green-700 text-xs">~380 clienti target</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <Send className="h-3 w-3 mr-1" /> Lancia Campagna
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Anteprima
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campagna Check-up Senior */}
              <Card className="border-amber-300 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <Stethoscope className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900">Campagna Check-up Pet Senior</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Invita proprietari di pet over 7 anni a controlli preventivi e esami del sangue.
                        <span className="text-amber-600 font-medium"> Target: Pet 7+ anni senza check-up negli ultimi 12 mesi.</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">📧 Email</Badge>
                        <Badge variant="outline" className="text-xs">💬 WhatsApp (demo)</Badge>
                        <Badge className="bg-amber-100 text-amber-700 text-xs">~95 clienti target</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                          <Send className="h-3 w-3 mr-1" /> Lancia Campagna
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Anteprima
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info box */}
              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800 flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Campagne Smart:</strong> VetBuddy analizza automaticamente il tuo database clienti e identifica i target più rilevanti per ogni campagna. 
                    I messaggi sono personalizzati con nome pet/cliente. Le campagne WhatsApp sono simulate in modalità demo.
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cronologia Esecuzioni */}
      {showLogSection && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" /> Cronologia Esecuzioni
            </CardTitle>
            <CardDescription>Ultime 50 automazioni eseguite</CardDescription>
          </CardHeader>
          <CardContent>
            {automationLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna esecuzione registrata</p>
                <p className="text-xs mt-1">Le automazioni verranno registrate qui quando si attivano</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {automationLogs.map((log, i) => (
                  <div key={log.id || i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'completed' ? 'bg-green-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <span className="font-medium text-gray-700">{log.automationName}</span>
                      {log.petName && <Badge variant="outline" className="text-xs">🐾 {log.petName}</Badge>}
                      {log.ownerName && <span className="text-gray-400">• {log.ownerName}</span>}
                    </div>
                    <span className="text-gray-400">{new Date(log.executedAt).toLocaleString('it-IT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-purple-500" /> Configura: {configTarget?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tempistica</Label>
              <Input
                value={configForm.timing}
                onChange={e => setConfigForm(f => ({...f, timing: e.target.value}))}
                placeholder="Es. 24 ore dopo, 14 giorni prima, ogni 6 mesi..."
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Personalizza quando questa automazione si attiva</p>
            </div>
            <div>
              <Label>Canale di invio</Label>
              <Select value={configForm.channel} onValueChange={v => setConfigForm(f => ({...f, channel: v}))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="app">📱 Notifica App</SelectItem>
                  <SelectItem value="both">📧+📱 Entrambi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template messaggio (opzionale)</Label>
              <Textarea
                value={configForm.messageTemplate}
                onChange={e => setConfigForm(f => ({...f, messageTemplate: e.target.value}))}
                placeholder="Scrivi il testo del messaggio automatico...&#10;&#10;Usa {{nome_pet}}, {{nome_cliente}}, {{data}} come variabili."
                rows={4}
                className="mt-1 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Annulla</Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={saveConfig}>
                <Check className="h-4 w-4 mr-1" /> Salva Config
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClinicAutomations;
