'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, ArrowLeft, BookOpen, Check, CheckCircle, ChevronDown, ChevronRight,
  ClipboardCheck, ExternalLink, HelpCircle, Info, Pill, Settings, Shield, Stethoscope,
  Zap, Mail, Lock, FileText, Users, Eye, Archive
} from 'lucide-react';

// ==================== COMPLIANCE BANNER (RIUTILIZZABILE) ====================
export function REVComplianceBanner({ variant = 'full', className = '' }) {
  const [expanded, setExpanded] = useState(false);

  if (variant === 'tooltip') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded ${className}`}>
        <Info className="h-3 w-3 flex-shrink-0" />
        Solo il medico veterinario può confermare l&apos;emissione ufficiale della REV.
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm ${className}`}>
        <Shield className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800 leading-snug">
            Per emettere una REV è necessaria l&apos;abilitazione del veterinario al sistema ufficiale. VetBuddy ti guida nel processo e ti fornisce la struttura pronta.
          </p>
        </div>
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl overflow-hidden ${className}`}>
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-amber-900 text-sm">Nota di Compliance</h4>
            <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">Importante</Badge>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            L&apos;emissione ufficiale della Ricetta Elettronica Veterinaria richiede l&apos;abilitazione del medico veterinario ai sistemi nazionali competenti. 
            VetBuddy supporta la preparazione, l&apos;organizzazione e l&apos;archiviazione del flusso prescrittivo, ma non sostituisce il sistema pubblico di emissione.
          </p>
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium mt-2 transition">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {expanded ? 'Chiudi dettagli' : 'Come funziona'}
          </button>
          {expanded && (
            <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-700 space-y-2">
              <p>• VetBuddy <strong>prepara</strong> la bozza prescrittiva partendo dalla scheda paziente.</p>
              <p>• VetBuddy <strong>organizza</strong> i dati clinici: farmaci, posologia, durata e diagnosi.</p>
              <p>• VetBuddy <strong>guida</strong> il veterinario nel processo prescrittivo.</p>
              <p>• VetBuddy <strong>archivia</strong> e rende consultabile la prescrizione nella cartella clinica.</p>
              <p>• L&apos;<strong>emissione ufficiale</strong> resta in capo al medico veterinario abilitato, secondo le regole del sistema nazionale.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== TUTORIAL REV ====================
function REVTutorial({ onOpenModule, onClose }) {
  const [openStep, setOpenStep] = useState(null);

  const steps = [
    {
      num: 1,
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100',
      title: 'Verifica dei requisiti',
      text: 'Prima di utilizzare la REV in VetBuddy, verifica che il medico veterinario disponga dei requisiti e delle credenziali necessarie per operare nel sistema ufficiale.',
    },
    {
      num: 2,
      icon: Settings,
      color: 'text-indigo-600 bg-indigo-100',
      title: 'Attivazione del modulo in clinica',
      text: 'Configura il modulo REV nelle impostazioni della clinica. Puoi iniziare in modalità guidata/manuale oppure collegare l\'integrazione ufficiale quando disponibile.',
    },
    {
      num: 3,
      icon: FileText,
      color: 'text-emerald-600 bg-emerald-100',
      title: 'Preparazione della prescrizione',
      text: 'VetBuddy ti permette di compilare la bozza prescrittiva partendo dalla scheda paziente, con dati clinici, farmaco, quantità, posologia e durata del trattamento.',
    },
    {
      num: 4,
      icon: Shield,
      color: 'text-amber-600 bg-amber-100',
      title: 'Emissione ufficiale',
      text: 'L\'emissione ufficiale della REV avviene solo con conferma del medico veterinario abilitato e secondo il flusso previsto dal sistema nazionale.',
    },
    {
      num: 5,
      icon: Archive,
      color: 'text-purple-600 bg-purple-100',
      title: 'Salvataggio e consultazione',
      text: 'Dopo l\'emissione, VetBuddy archivia la prescrizione nella cartella clinica del paziente e rende consultabili le informazioni disponibili alla clinica e, se previsto, al proprietario.',
    },
    {
      num: 6,
      icon: ClipboardCheck,
      color: 'text-teal-600 bg-teal-100',
      title: 'Modalità manuale/ponte',
      text: 'Se l\'integrazione ufficiale non è ancora attiva, VetBuddy consente di preparare la prescrizione, completare l\'emissione nel sistema ufficiale e registrare poi numero ricetta, PIN e data all\'interno della piattaforma.',
    },
  ];

  const checklist = [
    'Requisiti del veterinario verificati',
    'Credenziali del sistema ufficiale disponibili',
    'Modulo REV attivato in VetBuddy',
    'Modalità scelta: guidata/manuale o integrazione API',
    'Test del flusso completato',
    'Personale informato su ruoli e permessi',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-1" />Torna alle impostazioni
          </Button>
        )}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Come attivare la Ricetta Elettronica Veterinaria con VetBuddy</h2>
            <p className="text-sm text-gray-500">VetBuddy ti aiuta a organizzare il flusso prescrittivo. L&apos;emissione ufficiale richiede l&apos;abilitazione del medico veterinario al sistema nazionale.</p>
          </div>
        </div>
      </div>

      <REVComplianceBanner variant="compact" />

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(s => {
          const Icon = s.icon;
          const isOpen = openStep === s.num;
          return (
            <Card key={s.num} className={`border ${isOpen ? 'border-emerald-300 shadow-md' : 'border-gray-200'} transition-all cursor-pointer`}
              onClick={() => setOpenStep(isOpen ? null : s.num)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">STEP {s.num}</span>
                      <h4 className="font-semibold text-gray-800">{s.title}</h4>
                    </div>
                    {isOpen && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.text}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checklist */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            Checklist attivazione REV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-emerald-300 bg-white flex items-center justify-center group-hover:border-emerald-500 transition">
                <Check className="h-3 w-3 text-emerald-600 opacity-0 group-hover:opacity-50 transition" />
              </div>
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        {onOpenModule && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onOpenModule}>
            <Pill className="h-4 w-4 mr-2" />Apri modulo REV
          </Button>
        )}
        <Button variant="outline" onClick={() => window.open('mailto:info@vetbuddy.it?subject=Supporto REV', '_blank')}>
          <Mail className="h-4 w-4 mr-2" />Contatta supporto
        </Button>
      </div>
    </div>
  );
}

// ==================== SETTINGS PAGE ====================
function ClinicREVSettings({ user, onNavigate }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeMode, setActiveMode] = useState('manual'); // manual | api

  if (showTutorial) {
    return <REVTutorial
      onClose={() => setShowTutorial(false)}
      onOpenModule={() => onNavigate?.('prescriptions')}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-600" />
            Attivazione e Impostazioni REV
          </h2>
          <p className="text-gray-500 text-sm mt-1">Configura il modulo Ricetta Elettronica Veterinaria della clinica e scegli la modalità operativa.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
          <BookOpen className="h-4 w-4 mr-1" />Tutorial
        </Button>
      </div>

      {/* Compliance Banner */}
      <REVComplianceBanner variant="full" />

      {/* Status di attivazione */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Stato attivazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg border-2 ${activeMode === 'manual' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${activeMode === 'manual' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className={`font-semibold text-sm ${activeMode === 'manual' ? 'text-emerald-700' : 'text-gray-500'}`}>Modalità guidata/manuale</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 border-dashed ${activeMode === 'api' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${activeMode === 'api' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className={`font-semibold text-sm ${activeMode === 'api' ? 'text-blue-700' : 'text-gray-400'}`}>Integrazione ufficiale</span>
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">Non disponibile</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requisiti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-600" />
            Requisiti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 leading-relaxed">
            Per utilizzare la REV in emissione ufficiale è necessario che il medico veterinario disponga delle abilitazioni e credenziali previste dal sistema nazionale.
          </p>
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <h5 className="font-semibold text-blue-800 text-sm mb-1 flex items-center gap-1.5"><Stethoscope className="h-4 w-4" />Medico Veterinario</h5>
              <p className="text-xs text-blue-700">Iscrizione all&apos;Ordine dei Medici Veterinari e abilitazione al sistema nazionale per l&apos;emissione della REV.</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
              <h5 className="font-semibold text-purple-800 text-sm mb-1 flex items-center gap-1.5"><Lock className="h-4 w-4" />Credenziali Sistema Ufficiale</h5>
              <p className="text-xs text-purple-700">Accesso al portale nazionale (es. Vetinfo) con le credenziali personali del veterinario.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalità operative */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            Modalità operative
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manuale */}
          <div className={`p-4 rounded-xl border-2 cursor-pointer transition ${activeMode === 'manual' ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => setActiveMode('manual')}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMode === 'manual' ? 'border-emerald-500' : 'border-gray-300'}`}>
                {activeMode === 'manual' && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Modalità guidata/manuale</h4>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs mt-0.5">Attiva</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-8">
              VetBuddy prepara il flusso e consente di registrare successivamente gli estremi della ricetta emessa nel sistema ufficiale.
            </p>
          </div>

          {/* API */}
          <div className={`p-4 rounded-xl border-2 border-dashed cursor-not-allowed transition ${activeMode === 'api' ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200'} opacity-60`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center" />
              <div>
                <h4 className="font-semibold text-gray-700">Modalità integrazione ufficiale</h4>
                <Badge variant="outline" className="text-gray-400 text-xs mt-0.5">Prossimamente</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-500 ml-8">
              VetBuddy invia e riceve i dati tramite integrazione tecnica con il sistema ufficiale, quando configurata e disponibile.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ruoli e Permessi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Ruoli e permessi nel modulo REV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <h5 className="font-semibold text-emerald-800 text-sm mb-2">🩺 Medico Veterinario</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />Crea e modifica prescrizioni</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />Conferma emissione ufficiale</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />Registra N° ricetta e PIN</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />Pubblica al proprietario</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />Audit trail completo</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <h5 className="font-semibold text-blue-800 text-sm mb-2">👥 Staff Clinica</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />Visualizza prescrizioni</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />Filtra per stato e paziente</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />Stampa dettagli</li>
                <li className="flex items-start gap-1.5"><Eye className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />Solo lettura</li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <h5 className="font-semibold text-amber-800 text-sm mb-2">🐾 Proprietario</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />Consulta prescrizioni pubblicate</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />Dettagli farmaci e posologia</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />N° ricetta e PIN</li>
                <li className="flex items-start gap-1.5"><Check className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />Notifica email automatica</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onNavigate?.('prescriptions')}>
          <Pill className="h-4 w-4 mr-2" />Apri modulo REV
        </Button>
        <Button variant="outline" onClick={() => setShowTutorial(true)}>
          <BookOpen className="h-4 w-4 mr-2" />Apri tutorial
        </Button>
        <Button variant="outline" onClick={() => window.open('mailto:info@vetbuddy.it?subject=Supporto REV', '_blank')}>
          <Mail className="h-4 w-4 mr-2" />Contatta supporto
        </Button>
      </div>
    </div>
  );
}

export default ClinicREVSettings;
