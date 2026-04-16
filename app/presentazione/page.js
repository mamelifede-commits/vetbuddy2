'use client';

import { PawPrint, Check, Phone, Mail, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BrochurePage() {
  return (
    <div className="brochure-container">
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .brochure-container { width: 100%; }
          .brochure-page { page-break-after: always; page-break-inside: avoid; min-height: 100vh; }
          .brochure-page:last-child { page-break-after: auto; }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4; }
        }
        .brochure-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .brochure-page { min-height: 100vh; position: relative; overflow: hidden; }
      `}</style>

      {/* ====== DOWNLOAD BUTTON (screen only) ====== */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-3">
        <button onClick={() => window.print()} className="bg-coral-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-coral-600 transition text-sm">
          Scarica PDF
        </button>
        <Link href="/" className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition text-sm border">
          Torna al sito
        </Link>
      </div>

      {/* ====== PAGINA 1 — COPERTINA ====== */}
      <div className="brochure-page flex flex-col items-center justify-center px-12 py-12 text-center text-white relative" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #f97316 50%, #FF6B6B 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}></div>

        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: '#ffffff' }}>
          <PawPrint className="w-14 h-14" style={{ color: '#FF6B6B' }} />
        </div>
        
        <h1 className="text-6xl font-black tracking-tight mb-2" style={{ color: '#ffffff' }}>
          vetbuddy
        </h1>
        <div className="w-16 h-1 mx-auto mb-8 rounded-full" style={{ background: '#ffffff', opacity: 0.5 }}></div>

        {/* Claim */}
        <p className="text-2xl leading-relaxed font-medium mb-8" style={{ color: '#ffffff' }}>
          La piattaforma digitale che connette<br/>
          <strong className="font-black">cliniche veterinarie</strong>,{' '}
          <strong className="font-black">proprietari</strong><br/>
          e <strong className="font-black">laboratori di analisi</strong>.
        </p>

        {/* Pilot Badge */}
        <div className="inline-flex items-center gap-3 px-7 py-3 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }}></div>
          <span className="text-lg font-bold" style={{ color: '#ffffff' }}>Pilot Milano 2025</span>
        </div>

        <p className="text-sm mb-8" style={{ color: '#ffffff', opacity: 0.8 }}>Accesso su invito per cliniche selezionate</p>

        {/* 3 key numbers */}
        <div className="flex gap-10">
          {[
            { n: '44+', l: 'Automazioni' },
            { n: '100%', l: 'Gratis per proprietari' },
            { n: '€0', l: 'Per 90 giorni' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{s.n}</div>
              <div className="text-xs font-medium" style={{ color: '#ffffff', opacity: 0.8 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs" style={{ color: '#ffffff', opacity: 0.5 }}>vetbuddy.it &bull; info@vetbuddy.it</p>
        </div>
      </div>

      {/* =====================================================
          PAGINA 2 — CHI SIAMO + PROPOSTA DI VALORE
      ===================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />
        
        <h2 className="text-4xl font-black text-gray-900 mb-2 mt-6">Perché VetBuddy?</h2>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">Gestisci appuntamenti, documenti e comunicazione tra cliniche, proprietari e laboratori. Zero carta, zero caos.</p>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <StatBox number="70%" label="delle cliniche veterinarie usa ancora agenda cartacea o telefono" />
          <StatBox number="12 min" label="tempo medio sprecato per ogni prenotazione telefonica" />
          <StatBox number="40%" label="dei proprietari dimentica appuntamenti senza reminder" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6">Due ecosistemi, una piattaforma</h3>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #FF6B6B, #f97316)' }}>
            <h4 className="text-xl font-bold mb-3">Per le Cliniche Veterinarie</h4>
            <p className="text-white/80 text-sm mb-4">Tutto ciò che serve per gestire la tua clinica in modo digitale.</p>
            <ul className="space-y-1.5 text-sm text-white/90">
              {['Agenda digitale e prenotazioni online', 'Gestione pazienti e cartelle cliniche', 'Fatturazione, ricevute e listino servizi', 'Documenti PDF con invio automatico via email', 'Ricette Elettroniche REV (integrazione Vetinfo)', 'Team inbox e messaggistica clienti', '44+ automazioni attive 24/7', 'Metriche, report e dashboard fatturato'].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="font-bold">Pro Clinica: €0 per 90 giorni</p>
              <p className="text-white/70 text-xs">Poi €79/mese + IVA</p>
            </div>
          </div>
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <h4 className="text-xl font-bold mb-3">Per i Proprietari di Animali</h4>
            <p className="text-white/80 text-sm mb-4">La salute dei tuoi animali in un'unica app.</p>
            <ul className="space-y-1.5 text-sm text-white/90">
              {['Prenota visite online in pochi click', 'Ricevi documenti e referti digitali', 'Profilo completo per ogni animale', 'Reminder automatici per visite e vaccini', 'Programma fedeltà e premi', 'Chat diretta con la clinica'].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="font-bold">100% Gratuito</p>
              <p className="text-white/70 text-xs">Per sempre, nessun costo nascosto</p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PAGINA 3 — FUNZIONALITÀ CLINICA (dettaglio)
      ===================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />
        <h2 className="text-3xl font-black text-gray-900 mb-1 mt-6">Funzionalità per la Clinica</h2>
        <p className="text-gray-500 mb-8">Tutto ciò che serve per digitalizzare la gestione della tua clinica veterinaria.</p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <FeatureBlock
            title="Agenda Digitale"
            desc="Calendario condiviso tra tutto lo staff. Visualizzazione per giorno, settimana e mese. Gestione delle disponibilità per veterinario e servizio."
          />
          <FeatureBlock
            title="Prenotazioni Online"
            desc="I clienti prenotano direttamente dal profilo pubblico della clinica o tramite link diretto e QR code. Nessuna telefonata necessaria."
          />
          <FeatureBlock
            title="Gestione Pazienti"
            desc="Cartella clinica digitale per ogni animale: specie, razza, peso, allergie, vaccinazioni, storico visite. Tutto consultabile in un click."
          />
          <FeatureBlock
            title="Documenti e PDF"
            desc="Carica referti, prescrizioni, fatture in PDF. Invia automaticamente via email al proprietario. Il cliente li ritrova anche nell'app."
          />
          <FeatureBlock
            title="Fatturazione e Pagamenti"
            desc="Crea fatture e ricevute direttamente dalla piattaforma. Listino servizi con prezzi preimpostati. Export CSV e PDF. Statistiche fatturato mensile, pagato e in sospeso."
          />
          <FeatureBlock
            title="Team Inbox"
            desc="Messaggistica centralizzata con assegnazione ticket allo staff. Chat diretta con i clienti per comunicazioni rapide."
          />
          <FeatureBlock
            title="Metriche e Report"
            desc="Dashboard con prenotazioni generate, telefonate evitate, fatturato, tassi di conversione, analisi servizi più richiesti e trend mensili."
          />
          <FeatureBlock
            title="Google Calendar Sync"
            desc="Sincronizzazione bidirezionale con Google Calendar. Gli appuntamenti VetBuddy appaiono nel calendario del veterinario e viceversa."
          />
          <FeatureBlock
            title="Video-Consulti"
            desc="Consulenze veterinarie a distanza con videochiamata integrata. Ideale per follow-up, controlli post-operatori e consulti rapidi."
          />
          <FeatureBlock
            title="Link Prenotazione + QR Code"
            desc="Link diretto personalizzato da condividere su social, WhatsApp, sito web. QR Code stampabile da esporre in clinica."
          />
          <FeatureBlock
            title="Profilo Pubblico"
            desc="Pagina pubblica della clinica con servizi, orari, mappa, recensioni. Visibile su Google e condivisibile con un link."
          />
          <FeatureBlock
            title="Programma Fedeltà"
            desc="Sistema a punti per fidelizzare i clienti. I proprietari accumulano punti ad ogni visita (100 punti = €5 di sconto). Configurabile dalla clinica."
          />
        </div>
      </div>

      {/* =====================================================
          PAGINA 3B — MODULO RICETTA ELETTRONICA VETERINARIA
      ===================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />
        <div className="mt-6 mb-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold">
            💊 NUOVA FUNZIONALITÀ
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-1">Modulo Ricetta Elettronica Veterinaria</h2>
        <p className="text-gray-500 mb-5 text-sm">VetBuddy aiuta la clinica a gestire il flusso prescrittivo in modo ordinato e digitale: dalla preparazione della prescrizione alla sua archiviazione nella cartella clinica del paziente.</p>

        {/* Cosa fa VetBuddy vs Cosa resta al veterinario */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="border-2 border-emerald-200 rounded-2xl p-5 bg-emerald-50/30">
            <h4 className="font-bold text-emerald-800 text-base mb-3 flex items-center gap-1.5">✅ Cosa fa VetBuddy</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {[
                'Prepara la bozza dalla scheda paziente',
                'Centralizza farmaci, posologia e durata',
                'Riduce errori e passaggi manuali',
                'Archivia prescrizioni e storico',
                'Rende consultabili i dati autorizzati',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="border-2 border-amber-200 rounded-2xl p-5 bg-amber-50/30">
            <h4 className="font-bold text-amber-800 text-base mb-3 flex items-center gap-1.5">🩺 Cosa resta in capo al veterinario</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {[
                'Conferma finale dell\'emissione',
                'Utilizzo delle credenziali e dell\'abilitazione previste',
                'Responsabilità professionale della prescrizione',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modalità operative */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="border-2 border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 relative">
            <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-xs px-3 py-0.5 rounded-full font-bold">ATTIVO</div>
            <h4 className="font-bold text-emerald-800 text-sm mb-2 mt-1">Modalità guidata/manuale</h4>
            <p className="text-gray-600 text-xs leading-snug">VetBuddy prepara il flusso e consente di registrare successivamente gli estremi della ricetta emessa nel sistema ufficiale.</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 relative opacity-80">
            <div className="absolute -top-2.5 left-4 bg-gray-400 text-white text-xs px-3 py-0.5 rounded-full font-bold">PROSSIMAMENTE</div>
            <h4 className="font-bold text-gray-700 text-sm mb-2 mt-1">Integrazione ufficiale</h4>
            <p className="text-gray-500 text-xs leading-snug">VetBuddy invia e riceve i dati tramite integrazione tecnica con il sistema ufficiale, quando configurata e disponibile.</p>
          </div>
        </div>

        {/* Flusso */}
        <h3 className="text-lg font-bold text-gray-900 mb-3">Flusso in 4 passaggi</h3>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { num: '01', icon: '📝', title: 'Prepara', desc: 'Wizard guidato: paziente, farmaci, posologia, diagnosi.' },
            { num: '02', icon: '🌐', title: 'Emissione ufficiale', desc: 'Il veterinario abilitato completa l\'emissione nel sistema nazionale.' },
            { num: '03', icon: '📋', title: 'Registra', desc: 'Inserisci N° ricetta e PIN. Stato aggiornato.' },
            { num: '04', icon: '📦', title: 'Archivia', desc: 'VetBuddy archivia e rende consultabile per clinica e proprietario.' },
          ].map((step, i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-xl mb-1">{step.icon}</div>
              <div className="text-xs font-bold text-emerald-600 mb-0.5">STEP {step.num}</div>
              <h4 className="font-bold text-gray-900 text-xs mb-0.5">{step.title}</h4>
              <p className="text-gray-500 text-[10px] leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Nota compliance brochure */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Nota:</strong> L&apos;emissione ufficiale della Ricetta Elettronica Veterinaria richiede l&apos;abilitazione del medico veterinario al sistema nazionale competente. 
            VetBuddy supporta il flusso operativo della clinica ma non sostituisce il sistema pubblico di emissione.
          </p>
        </div>

        {/* Box laterale versione breve */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-sm text-emerald-800 font-medium">VetBuddy ti dà la struttura pronta. L&apos;emissione ufficiale resta subordinata ai requisiti del veterinario e del sistema nazionale.</p>
        </div>
      </div>

      {/* =====================================================
          PAGINA 4 — 44+ AUTOMAZIONI (lista completa)
      ===================================================== */}
      <div className="brochure-page text-white px-12 py-14" style={{ background: 'linear-gradient(135deg, #312E81, #581C87, #312E81)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white/60 text-sm">vetbuddy</span>
        </div>

        <h2 className="text-3xl font-black mb-1 mt-2">44+ Automazioni che lavorano per te</h2>
        <p className="text-white/60 mb-8">Mentre ti occupi dei pazienti, VetBuddy gestisce automaticamente comunicazioni, promemoria e follow-up.</p>

        <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-sm">
          <div>
            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">Promemoria & Reminder</h4>
            <AutoList items={[
              'Reminder appuntamento 24h prima (email)',
              'Reminder appuntamento 1h prima (email)',
              'Reminder vaccino in scadenza',
              'Reminder richiamo vaccino annuale',
              'Reminder trattamento antiparassitario',
              'Reminder controllo peso periodico',
              'Reminder visita annuale di routine',
              'Reminder pulizia dentale',
              'Reminder rinnovo prescrizione',
            ]} />

            <h4 className="text-green-400 font-bold text-xs uppercase tracking-wider mb-3 mt-5">Conferme & Stato</h4>
            <AutoList items={[
              'Conferma prenotazione al cliente',
              'Notifica nuova prenotazione alla clinica',
              'Conferma cancellazione appuntamento',
              'Notifica modifica appuntamento',
              'Notifica lista d\'attesa (posto libero)',
              'Conferma pagamento ricevuto',
            ]} />
          </div>
          <div>
            <h4 className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-3">Follow-up & Fidelizzazione</h4>
            <AutoList items={[
              'Follow-up post-visita (1 giorno dopo)',
              'Follow-up post-chirurgia (3 giorni dopo)',
              'Follow-up post-chirurgia (7 giorni dopo)',
              'Richiesta recensione dopo visita',
              'Email di benvenuto nuovo cliente',
              'Auguri compleanno animale',
              'Auguri compleanno proprietario',
              'Email di riepilogo visite semestrale',
              'Invito rinnovo piano fedeltà',
              'Notifica nuovi punti fedeltà guadagnati',
            ]} />

            <h4 className="text-purple-300 font-bold text-xs uppercase tracking-wider mb-3 mt-5">Documenti & Lab</h4>
            <AutoList items={[
              'Invio automatico documento PDF via email',
              'Notifica nuovo documento caricato',
              'Notifica referto lab pronto',
              'Notifica nuova richiesta lab (al laboratorio)',
              'Notifica stato richiesta aggiornato',
              'Report mensile prenotazioni alla clinica',
              'Report mensile pazienti attivi',
              'Notifica slot agenda vuoti (alert)',
              'Email onboarding staff (nuovo membro)',
            ]} />
          </div>
        </div>
        <p className="text-white/40 text-xs mt-6">+ altre automazioni in arrivo con ogni aggiornamento. Le automazioni si attivano automaticamente con il piano Pro Clinica.</p>
      </div>

      {/* =====================================================
          PAGINA 5 — MODULO LABORATORIO + PROPRIETARI
      ===================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />

        <h2 className="text-3xl font-black text-gray-900 mb-1 mt-6">Modulo Laboratorio di Analisi</h2>
        <p className="text-gray-500 mb-6">Connetti la clinica con i laboratori partner. Richiedi esami, ricevi referti, confronta prezzi e tempi.</p>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h4 className="font-bold text-blue-800 text-lg mb-3">Per la Clinica</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Invia richieste di esame direttamente dalla scheda paziente',
                'Seleziona laboratorio per distanza, prezzo e tempi',
                'Ricevi notifica quando il referto è pronto',
                'Rivedi il referto, aggiungi note cliniche, e invialo al proprietario',
                'Storico completo richieste e referti per paziente',
                'Marketplace laboratori con confronto visivo',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h4 className="font-bold text-indigo-800 text-lg mb-3">Per il Laboratorio</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Dashboard dedicata per gestire le richieste ricevute',
                'Aggiorna stato: Ricevuto, In Lavorazione, Pronto',
                'Carica referti PDF con note tecniche',
                'Profilo pubblico nel marketplace VetBuddy',
                'Inserisci listino prezzi indicativo e tempi medi',
                'Indica disponibilità ritiro campioni',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-1">Per i Proprietari di Animali</h2>
        <p className="text-gray-500 mb-6">VetBuddy è gratuito per sempre per i proprietari. Ecco cosa possono fare:</p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Prenota online', desc: 'Scegli clinica, servizio, veterinario e orario. Conferma in pochi click.' },
            { title: 'Profilo animale', desc: 'Scheda completa con peso, allergie, vaccini, storico visite e documenti.' },
            { title: 'Documenti e referti', desc: 'Tutti i PDF, referti e prescrizioni in un unico posto, accessibili sempre.' },
            { title: 'Reminder', desc: 'Non perdi mai un appuntamento. Ricevi promemoria automatici via email.' },
            { title: 'Programma fedeltà', desc: 'Accumula punti con ogni visita. 100 punti = €5 di sconto.' },
            { title: 'Chat con la clinica', desc: 'Comunicazione diretta, veloce e senza telefonate.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <h5 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h5>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          PAGINA 6 — COME FUNZIONA + ANIMALI
      ===================================================== */}
      <div className="brochure-page bg-gray-50 px-12 py-14">
        <PageHeader />
        
        <h2 className="text-3xl font-black text-gray-900 mb-1 mt-6">Come funziona</h2>
        <p className="text-gray-500 mb-8">Inizia in meno di 10 minuti. Nessuna installazione, nessun hardware.</p>

        <div className="grid grid-cols-4 gap-5 mb-14">
          {[
            { num: '01', title: 'Registrati', desc: 'Crea il tuo account clinica su vetbuddy.it. Compila il profilo: nome, indirizzo, P.IVA, orari di apertura.' },
            { num: '02', title: 'Configura', desc: 'Aggiungi servizi con prezzi e durate. Imposta le disponibilità dell\'agenda per ogni veterinario.' },
            { num: '03', title: 'Importa', desc: 'Invita i tuoi clienti a registrarsi su VetBuddy. Possono trovare la clinica tramite il profilo pubblico.' },
            { num: '04', title: 'Parti!', desc: 'I clienti prenotano online. Tu gestisci tutto da un\'unica dashboard. Le automazioni fanno il resto.' },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="text-3xl font-black text-coral-500 mb-2">{step.num}</div>
              <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Per tutti gli animali</h3>
        <p className="text-gray-500 text-center mb-8">VetBuddy supporta qualsiasi tipo di paziente</p>
        <div className="flex justify-center gap-6 mb-10">
          {[
            { emoji: '🐕', name: 'Cani' },
            { emoji: '🐈', name: 'Gatti' },
            { emoji: '🐴', name: 'Cavalli' },
            { emoji: '🐇', name: 'Conigli' },
            { emoji: '🐦', name: 'Uccelli' },
            { emoji: '🦎', name: 'Rettili' },
            { emoji: '🐹', name: 'Roditori' },
            { emoji: '🐠', name: 'Pesci' },
          ].map((a, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-1">{a.emoji}</div>
              <p className="text-xs font-semibold text-gray-600">{a.name}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center max-w-xl mx-auto">
          <p className="text-gray-900 font-bold text-lg mb-2">Dashboard del valore generato</p>
          <p className="text-gray-500 text-sm">Ogni mese VetBuddy ti mostra quante prenotazioni ha generato, quante telefonate ti ha evitato e quanto tempo hai risparmiato. Numeri concreti per misurare il ritorno dell'investimento.</p>
        </div>
      </div>

      {/* =====================================================
          PAGINA 7 — PREZZI
      ===================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />

        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center gap-2 bg-coral-50 text-coral-700 px-4 py-2 rounded-full border border-coral-200 mb-3">
            <span className="font-bold text-sm">Pilot Milano</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Abbonamento VetBuddy</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">Accesso su invito per cliniche selezionate e onboarding gratuito per i primi laboratori partner.</p>
          <p className="text-xs text-gray-400 mt-1">Prezzi IVA esclusa.</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Starter */}
          <div className="border-2 border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Starter Clinica</p>
            <div className="mb-2"><span className="text-3xl font-black text-gray-800">€0</span><span className="text-sm text-gray-400">/mese</span></div>
            <p className="text-xs text-gray-500 mb-4">Per veterinari freelance e micro-cliniche in fase di valutazione.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['1 sede', '1 utente', 'Fino a 30 richieste/mese', 'Profilo pubblico', 'Link prenotazione', 'Agenda base'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-4">Solo per cliniche ammesse al Pilot.</p>
          </div>

          {/* Pro Clinica */}
          <div className="border-2 border-coral-400 rounded-2xl p-5 bg-coral-50/30 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">Consigliato</div>
            <p className="text-xs font-bold text-coral-500 uppercase tracking-wider mb-2 mt-1">Pro Clinica</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-900">€0</span><span className="text-sm text-gray-500 ml-1">per 90 giorni</span></div>
            <p className="text-sm text-gray-600 mb-1">Poi <strong>€79/mese</strong> + IVA</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mb-3">
              <p className="text-xs font-bold text-amber-700">Early adopter: €49/mese + IVA</p>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Fino a 10 staff', 'Prenotazioni online', 'Agenda digitale', 'Reminder automatici', 'Documenti e PDF', 'Google Calendar sync', 'Report e analytics', 'Lab Marketplace', 'Dashboard valore'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-coral-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-3">90gg gratis. Estendibile a 6 mesi.</p>
          </div>

          {/* Lab Partner */}
          <div className="border-2 border-blue-200 rounded-2xl p-5 bg-blue-50/30">
            <div className="absolute -top-2.5 left-4"></div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Laboratorio Partner</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-800">€0</span><span className="text-sm text-gray-500 ml-1">per 6 mesi</span></div>
            <p className="text-sm text-gray-600 mb-3">Poi <strong>€29/mese</strong> + IVA</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Dashboard laboratorio', 'Profilo marketplace', 'Listino prezzi', 'Tempi refertazione', 'Ritiro campioni', 'Ricezione richieste', 'Upload referti PDF', 'Storico richieste', 'Notifiche email'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-3">Gratis 6 mesi o 50 richieste.</p>
          </div>

          {/* Enterprise */}
          <div className="border-2 border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enterprise</p>
            <div className="mb-2"><span className="text-3xl font-black text-gray-800">Custom</span><span className="text-sm text-gray-400 ml-1">+ IVA</span></div>
            <p className="text-xs text-gray-500 mb-4">Per gruppi veterinari, cliniche multi-sede e network di laboratori.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Multi-sede illimitate', 'Laboratori multipli', 'API dedicata', 'SLA garantito', 'Onboarding dedicato', 'Reportistica avanzata', 'Gestione centralizzata', 'Integrazioni custom'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-gray-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-3">Soluzione su misura.</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mb-6">Non è una prova libera: stiamo selezionando cliniche e laboratori partner per validare VetBuddy nel Pilot Milano.</p>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-center">Domande frequenti</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { q: 'Il piano Pro Clinica è davvero gratis per 90 giorni?', a: 'Sì, per le cliniche selezionate nel Pilot Milano.' },
              { q: 'Cosa succede dopo i 90 giorni?', a: 'Il piano passa a €79/mese + IVA, con tariffa early adopter di €49/mese + IVA per le prime cliniche.' },
              { q: 'I laboratori possono iscriversi senza invito?', a: 'Sì, possono registrarsi gratuitamente come Laboratorio Partner e attendere approvazione.' },
              { q: 'I prezzi includono IVA?', a: 'No, tutti i prezzi sono IVA esclusa.' },
            ].map((item, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900 text-xs mb-0.5">{item.q}</p>
                <p className="text-gray-500 text-xs">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          PAGINA 8 — CONTATTI + CTA FINALE
      ===================================================== */}
      <div className="brochure-page text-white px-12 py-14 flex flex-col" style={{ background: 'linear-gradient(135deg, #FF6B6B, #f97316)' }}>
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white/80 text-sm">vetbuddy</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-5xl font-black mb-6 leading-tight">Pronto a digitalizzare<br/>la tua clinica?</h2>
          <p className="text-white/80 text-xl max-w-xl mb-12">Unisciti alle cliniche veterinarie che stanno già testando VetBuddy nel Pilot Milano.</p>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full border border-white/20 mb-10">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Sito web</p>
                  <p className="font-bold">vetbuddy.it</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Email</p>
                  <p className="font-bold">info@vetbuddy.it</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Telefono</p>
                  <p className="font-bold">Contattaci via email</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-auto">
          <p className="text-white/50 text-xs">© 2025 VetBuddy — Tutti i diritti riservati</p>
        </div>
      </div>
    </div>
  );
}

/* ====== COMPONENTI HELPER ====== */

function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FF6B6B' }}>
        <PawPrint className="w-4 h-4 text-white" />
      </div>
      <span className="font-bold text-gray-400 text-sm">vet<span className="text-coral-400">buddy</span></span>
    </div>
  );
}

function StatBox({ number, label }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
      <div className="text-4xl font-black text-coral-500 mb-2">{number}</div>
      <p className="text-gray-500 text-sm leading-snug">{label}</p>
    </div>
  );
}

function FeatureBlock({ title, desc }) {
  return (
    <div className="border-l-4 border-coral-400 pl-4 py-1">
      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function AutoList({ items }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-white/85">
          <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
