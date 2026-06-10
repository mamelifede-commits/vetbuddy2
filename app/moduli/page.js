'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ModuliPage() {
  const [activeTab, setActiveTab] = useState('genius');

  const categories = {
    genius: {
      title: 'Genius',
      count: 40,
      color: 'text-purple-600',
      modules: [
        'VetBuddy Brain - Super-Assistente AI multimodale',
        'Drug Interaction Checker - Controllo interazioni farmaci',
        'AI Vision Diagnostics - Diagnostica AI immagini mediche',
        'Remote Patient Monitoring - Monitoraggio remoto pazienti',
        'VetBuddy Pharmacy - Farmacia online 24/7',
        'VetBuddy Academy - Piattaforma formazione ECM',
        'Blockchain Health Records - Cartelle blockchain immutabili',
        'VetBuddy Consult - Marketplace consulenze specialistiche',
        'Smart Clinic Hub - IoT clinica intelligente',
        'Genetic Precision Medicine - Test genomici razze',
        'Predictive Hospitalization AI - Predice rischio ospedalizzazione',
        'Mental Wellness Hub for Vets - Benessere psicologico veterinari',
        'Veterinary Litigation Shield - Assicurazione + supporto legale',
        'Pet Behavior AI Profiling - Predice ansia/aggressività',
        'VetBuddy Time Machine - Simulazione invecchiamento animale',
        'Predictive Equipment Maintenance - AI predice guasti attrezzature',
        'Cross-Species Learning AI - Transfer learning tra specie',
        'VetBuddy Residency Program - Mentorship 1-to-1',
        'Fisioterapia & Riabilitazione - Dual-mode: In-House + Network',
        'VetBuddy Autopsy AI - Necropsie AI 5 minuti',
        'Smart Referral Revenue Share - Guadagna 15-20% su referral',
        'Veterinary Talent Marketplace - LinkedIn per veterinari',
        'Pet Loss Grief Support - Supporto post-eutanasia',
        'VetBuddy Carbon Offset - Certificazione Carbon Neutral',
        'Dynamic Appointment Pricing - Prezzi dinamici Uber-style',
        'Veterinary Podcast Platform - Netflix educazione veterinaria',
        'AI-Powered Medical Photography - Foto mediche perfette AI',
        'Veterinary Invoice Financing - BNPL Klarna integrato',
        'Smart Queue Management - Code virtuali sala d\'attesa',
        'Supply Chain Intelligence AI - Gestione supply chain intelligente',
        'Client LTV Predictor AI - Previsione lifetime value clienti',
        'Vet-to-Vet Knowledge Marketplace - Marketplace conoscenze veterinarie',
        'Smart Appointment Orchestration AI - Orchestrazione intelligente appuntamenti',
        'Veterinary Crisis Communication AI - Comunicazione crisi automatizzata',
        'Pet Nutrition AI Chef - Piano nutrizionale AI personalizzato',
        'Predictive Client Churn AI - Previsione abbandono clienti',
        'Smart Surgery Scheduling AI - Scheduling chirurgie intelligente',
        'Emergency Triage AI - Triage automatico emergenze',
        'Veterinary Franchise Builder - Costruttore rete franchising veterinari',
        'Alert Pazienti Fragili & Cronici - Monitoraggio continuo pazienti speciali',
      ]
    },
    base: {
      title: 'Base',
      count: 18,
      color: 'text-coral-600',
      modules: [
        'Agenda Smart - Prenotazioni online 24/7',
        'WhatsApp Business - Inbox unificata messaggi',
        'Cartella Clinica Digitale - EHR completo',
        'AI Reception - Assistente virtuale prenotazioni',
        'Promemoria Automatici - SMS/WhatsApp 24h/1h prima',
        'Recovery No-Show - Recupero appuntamenti persi',
        'Documenti Clinici - Referti, certificati, ricette digitali',
        'Comunicazioni Clienti - Template email/SMS/WhatsApp',
        'Anagrafe Completa - Gestione clienti e pazienti',
        'Timeline Paziente - Storico visite completo',
        'Preventivi Digitali - Genera e invia preventivi',
        'Gestione Appuntamenti - Calendario multi-vista',
        'Check-in Veloce - Accoglienza rapida pazienti',
        'Note Cliniche - Annotazioni rapide visite',
        'Allegati Documenti - Upload file, immagini, referti',
        'Stampa Rapida - Template stampa personalizzabili',
        'Backup Automatico - Backup giornaliero sicuro',
        'Dashboard Operativa - KPI clinica real-time',
      ]
    },
    marketit: {
      title: 'Mercato IT',
      count: 16,
      color: 'text-red-600',
      modules: [
        'REV Registro Europeo - Iscrizione animali automatica',
        'Fatturazione Elettronica XML - SDI conforme',
        'Microchip & Anagrafe Canina - Iscrizione automatica',
        'Consensi Informati Digitali - Firma elettronica valida',
        'Malattie Denunciabili - Notifica ASL automatica',
        'Farmaco-Sorveglianza - Tracciabilità farmaci',
        'Prescrizioni Elettroniche - Ricette digitali conformi',
        'Registri Stupefacenti - Carico/scarico automatico',
        'Privacy GDPR - Gestione consensi privacy',
        'Certificati Veterinari - Export, viaggi EU',
        'Passaporto Europeo - Generazione automatica',
        'Sterilizzazioni Obbligatorie - Tracking + notifiche',
        'Vaccinazioni Obbligatorie - Scadenzario + alert',
        'Modulistica ASL - Template conformi regionali',
        'Archiviazione Legale - Conservazione 10 anni',
        'Report Fiscali - Quadro RV, registri IVA',
      ]
    },
    enterprise: {
      title: 'Enterprise',
      count: 12,
      color: 'text-indigo-600',
      modules: [
        'Multi-Sede & Gestione Catene - Dashboard consolidata',
        'App Mobile iOS/Android - App nativa completa',
        'POS Integrato - Pagamenti carta/contactless',
        'E-commerce Prodotti - Shop online integrato',
        'Inventario & Stock - Gestione magazzino automatica',
        'Contabilità Semplificata - Prima nota, scadenzario',
        'Gestione HR & Turni - Planning staff automatico',
        'CRM Avanzato - Segmentazione clienti, lifetime value',
        'Marketing Automation - Campagne email/SMS automatiche',
        'Business Intelligence - Report avanzati, previsioni',
        'API & Integrazioni - Connetti software esterni',
        'White Label - Personalizzazione brand completa',
      ]
    },
    innovation: {
      title: 'Innovation',
      count: 8,
      color: 'text-blue-600',
      modules: [
        'AI Diagnostico - Suggerimenti diagnosi AI',
        'Telemedicina Video - Visite online sicure',
        'Wearables IoT - Integrazione collari smart',
        'Assicurazioni White-Label - Polizze personalizzate',
        'Clinical Trials - Gestione studi clinici',
        'Voice Assistant - Comandi vocali Alexa/Google',
        'Emergency Network - Rete emergenze h24',
        'Pet Adoption Platform - Integrazione canili/gattili',
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-coral-50/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-coral-600 hover:text-coral-700 mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Torna alla Homepage</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Tutti i 92 Moduli VetBuddy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            La piattaforma veterinaria più completa al mondo. Organizzati per categoria per facilitare l'esplorazione.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white shadow-sm">
            <TabsTrigger value="genius" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Genius <Badge className="ml-2 bg-purple-600">{categories.genius.count}</Badge>
            </TabsTrigger>
            <TabsTrigger value="base" className="data-[state=active]:bg-coral-100 data-[state=active]:text-coral-700">
              Base <Badge className="ml-2 bg-coral-500">{categories.base.count}</Badge>
            </TabsTrigger>
            <TabsTrigger value="marketit" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              Mercato IT <Badge className="ml-2 bg-red-600">{categories.marketit.count}</Badge>
            </TabsTrigger>
            <TabsTrigger value="enterprise" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
              Enterprise <Badge className="ml-2 bg-indigo-600">{categories.enterprise.count}</Badge>
            </TabsTrigger>
            <TabsTrigger value="innovation" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Innovation <Badge className="ml-2 bg-blue-600">{categories.innovation.count}</Badge>
            </TabsTrigger>
          </TabsList>

          {Object.entries(categories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h2 className={`text-2xl font-bold ${category.color} mb-2`}>
                  {category.title}
                </h2>
                <p className="text-gray-600">
                  {category.count} moduli in questa categoria
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.modules.map((module, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`min-w-[32px] h-8 w-8 rounded-lg ${key === 'genius' ? 'bg-purple-100' : key === 'base' ? 'bg-coral-100' : key === 'marketit' ? 'bg-red-100' : key === 'enterprise' ? 'bg-indigo-100' : 'bg-blue-100'} flex items-center justify-center font-bold ${category.color} text-sm`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug">
                            {module}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 text-center">
          <Link href="/#faq" className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all">
            Hai domande? Leggi le FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
