'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, ArrowRight, CheckCircle, ChevronDown, ChevronRight, Clock, Euro,
  FileCheck, FileText, FlaskConical, Home, Info, Link2, Loader2, LogOut,
  Package, Phone, Settings, Truck, Upload, Building2, MapPin, Plus, Save, Trash2
} from 'lucide-react';

export default function TutorialLaboratorio() {
  const router = useRouter();
  const [expandedStep, setExpandedStep] = useState(0);

  const steps = [
    {
      title: "1. Accesso alla Dashboard",
      icon: <FlaskConical className="h-5 w-5" />,
      color: "indigo",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Dopo aver ricevuto le credenziali, accedi al sito VetBuddy e inserisci email e password del laboratorio.
          </p>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-2">La tua dashboard include:</h4>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li className="flex items-center gap-2"><FileText className="h-4 w-4" /> <strong>Richieste</strong> — Tutte le richieste di analisi dalle cliniche collegate</li>
              <li className="flex items-center gap-2"><Link2 className="h-4 w-4" /> <strong>Cliniche</strong> — Gestisci i collegamenti con le cliniche veterinarie</li>
              <li className="flex items-center gap-2"><Euro className="h-4 w-4" /> <strong>Listino Prezzi</strong> — Pubblica e gestisci i tuoi prezzi indicativi</li>
              <li className="flex items-center gap-2"><Settings className="h-4 w-4" /> <strong>Profilo</strong> — Le informazioni del tuo laboratorio</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "2. Gestire le Richieste di Analisi",
      icon: <FileText className="h-5 w-5" />,
      color: "purple",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Nella tab <strong>Richieste</strong> troverai tutte le analisi inviate dalle cliniche collegate.
          </p>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Flusso della richiesta:</h4>
            <div className="space-y-3">
              {[
                { status: 'In Attesa', desc: 'La clinica ha creato la richiesta', color: 'yellow' },
                { status: 'Ricevuta', desc: 'Hai preso in carico la richiesta', color: 'blue' },
                { status: 'Campione in Attesa', desc: 'In attesa del campione', color: 'orange' },
                { status: 'Campione Ricevuto', desc: 'Campione arrivato in laboratorio', color: 'indigo' },
                { status: 'In Analisi', desc: 'L\'analisi è in corso', color: 'purple' },
                { status: 'Referto Pronto', desc: 'Hai caricato il PDF del referto', color: 'green' },
                { status: 'Completata', desc: 'La clinica ha inviato il referto al proprietario', color: 'emerald' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                  <div>
                    <span className="font-medium text-sm">{item.status}</span>
                    <span className="text-xs text-gray-500 ml-2">— {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Clicca su una richiesta per vederne i dettagli, le note cliniche della clinica, e aggiornare lo stato.
          </p>
        </div>
      )
    },
    {
      title: "3. Caricare un Referto PDF",
      icon: <Upload className="h-5 w-5" />,
      color: "green",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Una volta completata l'analisi, puoi caricare il referto in formato PDF.
          </p>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Come caricare:</h4>
            <ol className="space-y-2 text-sm text-green-700 list-decimal pl-4">
              <li>Seleziona la richiesta nella lista</li>
              <li>Clicca <strong>"Carica Referto PDF"</strong></li>
              <li>Seleziona il file PDF dal tuo computer</li>
              <li>Aggiungi eventuali note tecniche</li>
              <li>Clicca <strong>"Carica"</strong></li>
            </ol>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              <strong>Nota:</strong> Il referto verrà prima revisionato dalla clinica, che lo invierà al proprietario con le proprie note cliniche.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "4. Gestire le Cliniche Collegate",
      icon: <Link2 className="h-5 w-5" />,
      color: "blue",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Nella tab <strong>Cliniche</strong> puoi vedere e gestire tutte le connessioni con le cliniche veterinarie.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Come funziona:</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                <div><strong>Richieste in attesa:</strong> Le cliniche che vogliono collegarsi ti inviano una richiesta. Puoi <strong>accettare</strong> o <strong>rifiutare</strong>.</div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                <div><strong>Cliniche attive:</strong> Lista delle cliniche già collegate. Solo le cliniche collegate possono inviarti richieste di analisi.</div>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            Le cliniche ti trovano attraverso il <strong>Marketplace Laboratori</strong> di VetBuddy, dove possono visualizzare il tuo profilo, le tue specializzazioni e i tuoi prezzi indicativi.
          </p>
        </div>
      )
    },
    {
      title: "5. Pubblicare il Listino Prezzi",
      icon: <Euro className="h-5 w-5" />,
      color: "emerald",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Nella tab <strong>Listino Prezzi</strong> puoi creare e gestire i prezzi indicativi visibili alle cliniche nel marketplace.
          </p>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2">Come aggiungere un esame:</h4>
            <ol className="space-y-2 text-sm text-emerald-700 list-decimal pl-4">
              <li>Seleziona il <strong>tipo di esame</strong> (sangue, urine, biopsia, ecc.)</li>
              <li>Aggiungi un <strong>titolo</strong> descrittivo (es: "Emocromo completo")</li>
              <li>Inserisci il <strong>prezzo</strong> (minimo e massimo opzionale)</li>
              <li>Indica i <strong>tempi di refertazione</strong> medi</li>
              <li>Clicca <strong>"Aggiungi"</strong> e poi <strong>"Salva Listino"</strong></li>
            </ol>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              I prezzi sono <strong>indicativi</strong>. Il prezzo finale può variare in base al caso specifico.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "6. Il tuo Profilo nel Marketplace",
      icon: <MapPin className="h-5 w-5" />,
      color: "violet",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Il tuo laboratorio ha un profilo visibile nel <strong>Marketplace Laboratori</strong> di VetBuddy. Le cliniche possono:
          </p>
          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
            <ul className="space-y-2 text-sm text-violet-700">
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Cercarti per città, tipo di esame, o disponibilità di ritiro campioni</li>
              <li className="flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Vedere le tue specializzazioni e servizi</li>
              <li className="flex items-center gap-2"><Euro className="h-4 w-4" /> Consultare il tuo listino prezzi indicativo</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Verificare i tempi medi di refertazione</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4" /> Sapere se offri il ritiro campioni</li>
              <li className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Richiederti un collegamento diretto</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 italic">
            Per aggiornare il profilo del laboratorio (indirizzo, telefono, specializzazioni), contatta il supporto VetBuddy.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Tutorial Laboratorio</h1>
              <p className="text-xs text-indigo-600">Guida al Marketplace VetBuddy</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Benvenuto nel Marketplace VetBuddy! 🧪</h2>
          <p className="text-indigo-100 mb-4">
            Questa guida ti aiuterà a utilizzare al meglio la tua dashboard laboratorio: gestire richieste, caricare referti, pubblicare il listino prezzi e connetterti con le cliniche veterinarie.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Gestisci richieste
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <Upload className="h-4 w-4" /> Carica referti
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <Euro className="h-4 w-4" /> Listino prezzi
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Cliniche collegate
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isExpanded = expandedStep === index;
            return (
              <Card key={index} className={`border-2 transition-all cursor-pointer ${isExpanded ? `border-${step.color}-300 shadow-lg` : 'border-gray-200 hover:border-gray-300'}`}>
                <div
                  className="p-4 flex items-center justify-between"
                  onClick={() => setExpandedStep(isExpanded ? -1 : index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 bg-${step.color}-100 rounded-xl flex items-center justify-center text-${step.color}-600`}>
                      {step.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                </div>
                {isExpanded && (
                  <CardContent className="pt-0 pb-6 px-6 border-t">
                    <div className="pt-4">{step.content}</div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Support */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100 text-center">
          <h3 className="font-bold text-gray-900 mb-2">Hai bisogno di aiuto?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Contatta il supporto VetBuddy per assistenza tecnica, aggiornamento del profilo o domande sul marketplace.
          </p>
          <p className="text-indigo-600 font-medium">📧 supporto@vetbuddy.it</p>
        </div>
      </div>
    </div>
  );
}
