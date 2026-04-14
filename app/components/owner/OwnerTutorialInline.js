'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, PawPrint, MapPin, Calendar, FileText, MessageCircle, Bell, Gift, Smartphone, ChevronRight, CheckCircle, Heart } from 'lucide-react';

function OwnerTutorialInline() {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/tutorials/download?type=owner');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'vetbuddy_Tutorial_Proprietari.pdf';
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
    } catch (error) {
      alert('Errore durante il download. Riprova più tardi.');
    } finally { setDownloadingPDF(false); }
  };
  
  const sections = [
    { icon: PawPrint, title: 'Aggiungere i Tuoi Animali', color: 'bg-pink-500', content: ['Dalla dashboard, clicca "I Miei Animali"', 'Inserisci nome, specie, razza, data di nascita', 'Aggiungi peso, microchip e una foto', 'Specie supportate: cani, gatti, conigli, uccelli, rettili, pesci, cavalli e altri!'], tip: 'Puoi aggiungere animali di qualsiasi specie!' },
    { icon: MapPin, title: 'Trovare una Clinica', color: 'bg-green-500', content: ['Vai alla sezione "Trova Clinica"', 'Usa la mappa interattiva per vedere le cliniche vicine', 'Filtra per città o servizi offerti', 'Salva le cliniche preferite per un accesso rapido'], tip: 'La mappa mostra cliniche in tutta Italia.' },
    { icon: Calendar, title: 'Prenotare un Appuntamento', color: 'bg-purple-500', content: ['Clicca "Prenota Visita" dalla dashboard', 'Seleziona la clinica e il servizio', 'Scegli data e orario disponibili', 'Conferma e ricevi email di riepilogo'], tip: 'Riceverai promemoria automatici prima della visita.' },
    { icon: FileText, title: 'Gestire i Documenti', color: 'bg-amber-500', content: ['Visualizza prescrizioni, referti, fatture', 'Scarica i documenti in PDF', 'I documenti arrivano automaticamente dalla clinica'], tip: 'Tutti i documenti sono sempre disponibili!' },
    { icon: MessageCircle, title: 'Notifiche WhatsApp', color: 'bg-green-600', content: ['Vai su "Profilo e Notifiche" nel menu', 'Inserisci il tuo numero di telefono con prefisso (+39)', 'Attiva le notifiche WhatsApp', 'Ricevi promemoria appuntamenti e documenti su WhatsApp'], tip: 'Attiva WhatsApp per non perdere mai un appuntamento!' },
    { icon: Bell, title: 'Notifiche e Promemoria', color: 'bg-red-500', content: ['Ricevi notifiche per appuntamenti in arrivo', 'Promemoria per vaccini e controlli periodici', 'Scegli tra Email, WhatsApp o entrambi', 'Personalizza quando ricevere i promemoria'], tip: 'Non dimenticare mai un vaccino!' },
    { icon: Gift, title: 'Programma Fedeltà', color: 'bg-yellow-500', content: ['Accumula punti con ogni prenotazione completata', 'Invita amici e guadagna punti extra', '100 punti = €5 di sconto sulla prossima visita'], tip: 'Ogni visita ti premia!' },
    { icon: Smartphone, title: 'Installare l\'App', color: 'bg-teal-500', content: ['vetbuddy è una PWA installabile', 'Su iPhone: Safari → Condividi → Aggiungi a Home', 'Su Android: Chrome → Menu → Installa app'], tip: 'L\'app funziona anche offline!' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tutorial Proprietari</h2>
          <p className="text-gray-500 text-sm">Guida per gestire la salute dei tuoi animali</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={downloadingPDF} className="bg-blue-500 hover:bg-blue-600">
          <Download className="h-4 w-4 mr-2" />
          {downloadingPDF ? 'Download...' : 'Scarica PDF'}
        </Button>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Quick Start - Inizia in 5 minuti</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {['1. Registrati gratis', '2. Aggiungi i tuoi animali', '3. Trova una clinica', '4. Prenota la prima visita'].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/20 rounded-xl p-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">{i+1}</div>
              <span>{item.substring(3)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((section, i) => (
          <Card key={i} className="hover:shadow-lg transition">
            <CardHeader className={`${section.color} text-white rounded-t-lg py-3`}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <section.icon className="h-5 w-5" /> {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2 mb-3 text-sm">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                <p className="text-xs text-blue-700"><strong>💡</strong> {section.tip}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Heart className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-bold text-gray-800 mb-2">vetbuddy è gratuito per i proprietari!</h3>
        <p className="text-sm text-gray-600">Nessun costo nascosto. Prenota visite, ricevi documenti, gestisci la salute dei tuoi animali senza spendere nulla.</p>
      </div>
    </div>
  );
}

export default OwnerTutorialInline;
