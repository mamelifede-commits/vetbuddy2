'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, Upload, FileText, Users, CheckCircle, ArrowLeft, 
  Printer, FileSpreadsheet, Database, Shield, Clock, HelpCircle,
  ChevronRight, AlertCircle, Lightbulb, Dog, Cat, PawPrint
} from 'lucide-react';
import Link from 'next/link';

// Logo Component
const VetBuddyLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="62" rx="18" ry="16" fill="#FF6B6B"/>
    <ellipse cx="28" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
    <ellipse cx="50" cy="28" rx="10" ry="12" fill="#FF6B6B"/>
    <ellipse cx="72" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
  </svg>
);

export default function GuidaImportPage() {
  const [activeSection, setActiveSection] = useState('intro');

  const downloadTemplate = () => {
    const csvContent = `nome,specie,razza,data_nascita,microchip,sesso,peso,colore,sterilizzato,allergie,farmaci,note,proprietario,email,telefono,indirizzo,vaccino,data_vaccino,scadenza_vaccino
Luna,cane,Labrador,15/03/2020,380260000123456,femmina,25,biondo,si,Allergia al pollo,,Cane molto socievole,Mario Rossi,mario.rossi@email.it,+39 333 1234567,Via Roma 123 Milano,Polivalente,01/01/2024,01/01/2025
Max,gatto,Europeo,20/06/2019,380260000789012,maschio,5,tigrato,no,,,Gatto indoor,Anna Bianchi,anna.bianchi@email.it,+39 338 9876543,Via Verdi 45 Roma,Trivalente,15/03/2024,15/03/2025
Milo,cane,Golden Retriever,10/08/2021,,maschio,28,dorato,si,,Apoquel 16mg,Dermatite atopica in cura,Luca Verdi,luca.verdi@email.it,+39 340 5551234,Via Dante 78 Torino,Rabbia,20/06/2024,20/06/2025
Bella,cane,Beagle,05/12/2018,380260000456789,femmina,12,tricolore,si,,,Campionessa di agilità,Giulia Neri,giulia.neri@email.it,+39 345 6789012,Via Garibaldi 90 Bologna,Polivalente,10/02/2024,10/02/2025
Micia,gatto,Persiano,25/09/2022,,femmina,4,bianco,no,Allergia al pesce,,Gatta molto tranquilla,Paolo Gialli,paolo.gialli@email.it,+39 347 1122334,Via Mazzini 15 Firenze,Trivalente,05/05/2024,05/05/2025`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_import_pazienti_vetbuddy.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'intro', label: 'Introduzione', icon: HelpCircle },
    { id: 'quick', label: 'Guida Rapida', icon: Clock },
    { id: 'columns', label: 'Colonne del File', icon: FileSpreadsheet },
    { id: 'export', label: 'Esporta dal Gestionale', icon: Database },
    { id: 'tips', label: 'Tips & Trucchi', icon: Lightbulb },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <VetBuddyLogo size={32} />
            <span className="font-bold text-xl text-gray-900">vetbuddy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrint} className="hidden md:flex">
              <Printer className="h-4 w-4 mr-2" />
              Stampa / Salva PDF
            </Button>
            <Button onClick={downloadTemplate} className="bg-blue-500 hover:bg-blue-600">
              <Download className="h-4 w-4 mr-2" />
              Scarica Template
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 print:hidden">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Torna alla Home
        </Link>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Upload className="h-5 w-5" />
            <span className="font-semibold">Guida Import Pazienti</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Come Importare i Tuoi Pazienti su vetbuddy
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Guida completa passo-passo per migrare i dati dal tuo gestionale attuale. 
            In pochi minuti avrai tutti i tuoi pazienti su vetbuddy!
          </p>
        </div>

        {/* Navigation - Print hidden */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 print:hidden">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Quick Start Card - Always visible */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              ⚡ Import Rapido in 3 Passi
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Scarica il Template</h3>
                <p className="text-gray-600 text-sm mb-4">File CSV pronto con esempi già compilati</p>
                <Button onClick={downloadTemplate} variant="outline" size="sm" className="print:hidden">
                  <Download className="h-4 w-4 mr-1" /> Scarica
                </Button>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Compila i Dati</h3>
                <p className="text-gray-600 text-sm">Apri con Excel, copia i tuoi pazienti dal gestionale</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Carica il File</h3>
                <p className="text-gray-600 text-sm">Vai su Pazienti → Import Dati → Carica</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                ⏱️ <strong>Tempo totale stimato:</strong> 5-10 minuti di preparazione, poi import istantaneo!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What Gets Imported */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Cosa Viene Importato Automaticamente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <PawPrint className="h-8 w-8 text-blue-500" />
                  <h3 className="font-bold text-blue-900">Animali</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Nome</li>
                  <li>• Specie e razza</li>
                  <li>• Data di nascita</li>
                  <li>• Microchip</li>
                  <li>• Peso e colore</li>
                  <li>• Allergie e farmaci</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-green-500" />
                  <h3 className="font-bold text-green-900">Proprietari</h3>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Nome completo</li>
                  <li>• Email</li>
                  <li>• Telefono</li>
                  <li>• Indirizzo</li>
                  <li className="text-green-600 font-medium">→ Creati automaticamente!</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <h3 className="font-bold text-purple-900">Vaccini</h3>
                </div>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Nome vaccino</li>
                  <li>• Data somministrazione</li>
                  <li>• Data scadenza</li>
                  <li className="text-purple-600 font-medium">→ Reminder automatici!</li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-8 w-8 text-amber-500" />
                  <h3 className="font-bold text-amber-900">Documenti</h3>
                </div>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• PDF referti</li>
                  <li>• Immagini (JPG, PNG)</li>
                  <li>• Esami e radiografie</li>
                  <li className="text-amber-600 font-medium">→ Abbinamento auto!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Columns Reference */}
        <Card className="mb-8" id="columns">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-blue-500" />
              Guida Completa alle Colonne del Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Required */}
            <div className="mb-6">
              <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Campi OBBLIGATORI (solo 2!)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="text-left p-3 font-bold">Colonna</th>
                      <th className="text-left p-3 font-bold">Descrizione</th>
                      <th className="text-left p-3 font-bold">Esempio</th>
                      <th className="text-left p-3 font-bold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-mono font-bold text-red-600">nome</td>
                      <td className="p-3">Nome dell'animale</td>
                      <td className="p-3 font-mono">Luna</td>
                      <td className="p-3 text-gray-500">Obbligatorio</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-mono font-bold text-red-600">specie</td>
                      <td className="p-3">Tipo di animale</td>
                      <td className="p-3 font-mono">cane</td>
                      <td className="p-3 text-gray-500">cane, gatto, uccello, coniglio, criceto, altro</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optional - Animal */}
            <div className="mb-6">
              <h3 className="font-bold text-blue-600 mb-3">Campi Opzionali - Animale</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="text-left p-3 font-bold">Colonna</th>
                      <th className="text-left p-3 font-bold">Descrizione</th>
                      <th className="text-left p-3 font-bold">Esempio</th>
                      <th className="text-left p-3 font-bold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-3 font-mono">razza</td><td className="p-3">Razza dell'animale</td><td className="p-3 font-mono">Labrador</td><td className="p-3 text-gray-500">Testo libero</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">data_nascita</td><td className="p-3">Data di nascita</td><td className="p-3 font-mono">15/03/2020</td><td className="p-3 text-gray-500">Formato: GG/MM/AAAA</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">microchip</td><td className="p-3">Numero microchip</td><td className="p-3 font-mono">380260000123456</td><td className="p-3 text-gray-500">15 cifre</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">sesso</td><td className="p-3">Sesso dell'animale</td><td className="p-3 font-mono">femmina</td><td className="p-3 text-gray-500">maschio o femmina</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">peso</td><td className="p-3">Peso in kg</td><td className="p-3 font-mono">25</td><td className="p-3 text-gray-500">Solo numero</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">colore</td><td className="p-3">Colore mantello</td><td className="p-3 font-mono">biondo</td><td className="p-3 text-gray-500">Testo libero</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">sterilizzato</td><td className="p-3">Se sterilizzato</td><td className="p-3 font-mono">si</td><td className="p-3 text-gray-500">si o no</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">allergie</td><td className="p-3">Allergie note</td><td className="p-3 font-mono">Allergia al pollo</td><td className="p-3 text-gray-500">Testo libero</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">farmaci</td><td className="p-3">Farmaci in corso</td><td className="p-3 font-mono">Apoquel 16mg</td><td className="p-3 text-gray-500">Testo libero</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">note</td><td className="p-3">Note aggiuntive</td><td className="p-3 font-mono">Cane molto socievole</td><td className="p-3 text-gray-500">Testo libero</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optional - Owner */}
            <div className="mb-6">
              <h3 className="font-bold text-green-600 mb-3">Campi Opzionali - Proprietario</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="text-left p-3 font-bold">Colonna</th>
                      <th className="text-left p-3 font-bold">Descrizione</th>
                      <th className="text-left p-3 font-bold">Esempio</th>
                      <th className="text-left p-3 font-bold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-3 font-mono">proprietario</td><td className="p-3">Nome completo</td><td className="p-3 font-mono">Mario Rossi</td><td className="p-3 text-gray-500">Nome e cognome</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">email</td><td className="p-3">Email proprietario</td><td className="p-3 font-mono">mario@email.it</td><td className="p-3 text-gray-500">Usata per creare account</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">telefono</td><td className="p-3">Telefono</td><td className="p-3 font-mono">+39 333 1234567</td><td className="p-3 text-gray-500">Qualsiasi formato</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">indirizzo</td><td className="p-3">Indirizzo completo</td><td className="p-3 font-mono">Via Roma 123, Milano</td><td className="p-3 text-gray-500">Testo libero</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optional - Vaccine */}
            <div>
              <h3 className="font-bold text-purple-600 mb-3">Campi Opzionali - Vaccino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="text-left p-3 font-bold">Colonna</th>
                      <th className="text-left p-3 font-bold">Descrizione</th>
                      <th className="text-left p-3 font-bold">Esempio</th>
                      <th className="text-left p-3 font-bold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-3 font-mono">vaccino</td><td className="p-3">Nome vaccino</td><td className="p-3 font-mono">Polivalente</td><td className="p-3 text-gray-500">Testo libero</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">data_vaccino</td><td className="p-3">Data somministrazione</td><td className="p-3 font-mono">01/01/2024</td><td className="p-3 text-gray-500">Formato: GG/MM/AAAA</td></tr>
                    <tr className="border-b"><td className="p-3 font-mono">scadenza_vaccino</td><td className="p-3">Data scadenza</td><td className="p-3 font-mono">01/01/2025</td><td className="p-3 text-gray-500">Formato: GG/MM/AAAA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export from Gestionale */}
        <Card className="mb-8" id="export">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-orange-500" />
              Come Esportare dal Tuo Gestionale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-orange-600">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Trova la funzione Export</h4>
                  <p className="text-gray-600">Nel tuo gestionale attuale, cerca "Esporta", "Export", "Scarica dati" o simile. Di solito si trova nelle impostazioni o nella sezione anagrafica.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-orange-600">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Seleziona formato CSV o Excel</h4>
                  <p className="text-gray-600">Scegli il formato CSV (.csv) o Excel (.xlsx). Entrambi funzionano con vetbuddy.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-orange-600">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Apri con Excel o Google Sheets</h4>
                  <p className="text-gray-600">Apri il file esportato con Microsoft Excel, Google Sheets, LibreOffice o Numbers.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-orange-600">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Adatta le colonne</h4>
                  <p className="text-gray-600">Rinomina le intestazioni delle colonne seguendo i nomi della tabella sopra. Non serve che siano perfette, basta che siano simili!</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-orange-600">5</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Salva e carica</h4>
                  <p className="text-gray-600">Salva il file come CSV (File → Salva con nome → CSV) e caricalo su vetbuddy!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mb-8" id="tips">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Tips & Trucchi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">🐾 Più animali stesso proprietario?</h4>
                <p className="text-blue-700 text-sm">Aggiungi una riga per ogni animale usando la stessa email del proprietario. vetbuddy collegherà automaticamente tutti gli animali allo stesso proprietario.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">📋 Microchip duplicato?</h4>
                <p className="text-green-700 text-sm">Se un animale con lo stesso microchip esiste già, vetbuddy lo riconosce e aggiunge solo la tua clinica ai suoi dati. Nessun duplicato!</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">📄 Documenti con nome file</h4>
                <p className="text-purple-700 text-sm">Nomina i file dei documenti con il nome dell'animale (es. "Luna_referto.pdf"). vetbuddy li abbinerà automaticamente!</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-2">⚡ Colonne mancanti?</h4>
                <p className="text-amber-700 text-sm">Non hai tutti i dati? Nessun problema! Compila solo ciò che hai. I campi obbligatori sono solo "nome" e "specie".</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8" id="faq">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-gray-500" />
              Domande Frequenti (FAQ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Quanto tempo ci vuole per l'import?</h4>
                <p className="text-gray-600">La preparazione del file richiede 5-10 minuti. L'import vero e proprio è istantaneo, anche con centinaia di pazienti!</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">I proprietari devono registrarsi manualmente?</h4>
                <p className="text-gray-600">No! vetbuddy crea automaticamente gli account dei proprietari. Riceveranno un'email per impostare la password al primo accesso.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Posso importare più volte?</h4>
                <p className="text-gray-600">Sì! vetbuddy riconosce i duplicati tramite microchip ed email. Puoi importare nuovi pazienti in qualsiasi momento.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">I dati sono sicuri?</h4>
                <p className="text-gray-600">Assolutamente! I dati vengono trasferiti in modo criptato e archiviati in conformità al GDPR. Solo la tua clinica ha accesso.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Cosa succede se faccio un errore nel file?</h4>
                <p className="text-gray-600">vetbuddy ti mostrerà un report con eventuali errori o avvisi. Puoi correggere il file e reimportare. Nessun dato viene perso!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-900 text-lg mb-2">🔒 Privacy e Sicurezza GDPR</h3>
                <ul className="text-green-800 space-y-1">
                  <li>• I dati vengono trasferiti in modo criptato (HTTPS/TLS)</li>
                  <li>• Archiviazione sicura su server europei</li>
                  <li>• Solo la tua clinica ha accesso ai dati importati</li>
                  <li>• Conforme alle normative GDPR sulla protezione dei dati</li>
                  <li>• Puoi eliminare i dati in qualsiasi momento</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8 print:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pronto per iniziare?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={downloadTemplate} size="lg" className="bg-blue-500 hover:bg-blue-600">
              <Download className="h-5 w-5 mr-2" />
              Scarica Template CSV
            </Button>
            <Link href="/">
              <Button size="lg" variant="outline">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Torna alla Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer for print */}
        <div className="hidden print:block text-center py-8 border-t mt-8">
          <p className="text-gray-500">vetbuddy - Guida Import Pazienti</p>
          <p className="text-gray-400 text-sm">www.vetbuddy.it</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header, .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { font-size: 12px; }
          .max-w-6xl { max-width: 100%; }
          card { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
