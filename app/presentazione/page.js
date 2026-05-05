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
        <a href="/api/brochure/download?download=1" download="VetBuddy_Brochure_2025.pdf" className="bg-coral-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-coral-600 transition text-sm inline-flex items-center gap-2">
          Scarica PDF
        </a>
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
          VetBuddy
        </h1>
        <div className="w-16 h-1 mx-auto mb-8 rounded-full" style={{ background: '#ffffff', opacity: 0.5 }}></div>

        {/* Claim */}
        <p className="text-2xl leading-relaxed font-medium mb-3" style={{ color: '#ffffff' }}>
          Più prenotazioni. Meno telefonate.<br/>
          <strong className="font-black">Clienti sempre seguiti.</strong>
        </p>
        <p className="text-base mb-8" style={{ color: '#ffffff', opacity: 0.85 }}>
          Il copilota operativo che automatizza prenotazioni, reminder,<br/>comunicazioni, referti e follow-up per la tua clinica.
        </p>

        {/* Pilot Badge */}
        <div className="inline-flex items-center gap-3 px-7 py-3 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }}></div>
          <span className="text-lg font-bold" style={{ color: '#ffffff' }}>Pilot Milano 2025</span>
        </div>

        <p className="text-sm mb-8" style={{ color: '#ffffff', opacity: 0.8 }}>Pilot Milano: 90 giorni per misurare il valore generato da VetBuddy nella tua clinica</p>

        {/* 3 key numbers */}
        <div className="flex gap-10">
          {[
            { n: 'Fino a -70%', l: 'Telefonate (obiettivo pilot)' },
            { n: 'Fino a +40%', l: 'Prenotazioni online (obiettivo pilot)' },
            { n: 'Fino a 15h', l: 'Risparmiate/mese (obiettivo pilot)' },
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
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">Non è l'ennesimo gestionale. È il copilota che riduce il caos operativo e aumenta le visite ricorrenti.</p>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <StatBox number="Fino a -70%" label="telefonate evitate grazie a prenotazioni online e reminder automatici (obiettivo pilot)" />
          <StatBox number="Fino a 15h" label="risparmiate ogni mese dallo staff della clinica (obiettivo pilot)" />
          <StatBox number="Fino a +25%" label="clienti che tornano grazie a follow-up e richiami automatici (obiettivo pilot)" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6">Due ecosistemi, una piattaforma</h3>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #FF6B6B, #f97316)' }}>
            <h4 className="text-xl font-bold mb-3">Per le Cliniche Veterinarie</h4>
            <p className="text-white/80 text-sm mb-4">Gli strumenti operativi per ridurre telefonate, automatizzare comunicazioni e seguire meglio i clienti.</p>
            <ul className="space-y-1.5 text-sm text-white/90">
              {['Agenda digitale e prenotazioni online', 'Schede animale, documenti e storico visite', 'Listino servizi, ricevute operative ed esportazioni', 'Documenti PDF con invio automatico via email', 'Assistente al flusso REV: preparazione, registrazione e archiviazione', 'Team inbox e messaggistica clienti', '44+ automazioni attive 24/7', 'Metriche, report e dashboard valore generato'].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="font-bold">Growth: Piano consigliato</p>
              <p className="text-white/70 text-xs">€69/mese + IVA • Pilot: gratis 90 giorni</p>
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
        <p className="text-gray-500 mb-8">Gli strumenti operativi per ridurre telefonate, automatizzare comunicazioni e seguire meglio i clienti.</p>

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
            title="Schede Animale e Storico"
            desc="Organizza le informazioni principali di ogni animale: specie, razza, peso, allergie, documenti, referti e storico visite. Tutto resta consultabile in modo ordinato dalla clinica."
          />
          <FeatureBlock
            title="Documenti e PDF"
            desc="Carica referti, prescrizioni, fatture in PDF. Invia automaticamente via email al proprietario. Il cliente li ritrova anche nell'app."
          />
          <FeatureBlock
            title="Listino e Riepiloghi Economici"
            desc="Listino servizi con prezzi preimpostati, ricevute operative, esportazioni CSV/PDF e riepiloghi economici mensili per tenere tutto sotto controllo."
          />
          <FeatureBlock
            title="Team Inbox"
            desc="Messaggistica centralizzata con assegnazione ticket allo staff. Chat diretta con i clienti per comunicazioni rapide."
          />
          <FeatureBlock
            title="Metriche e Report"
            desc="Dashboard con prenotazioni generate, telefonate evitate, reminder inviati, tempo risparmiato, clienti riattivati, richieste laboratorio gestite e riepiloghi economici mensili."
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
            <h4 className="font-bold text-gray-700 text-sm mb-2 mt-1">Integrazione tecnica futura</h4>
            <p className="text-gray-500 text-xs leading-snug">Eventuali integrazioni tecniche con sistemi ufficiali saranno disponibili solo se autorizzate, configurate e compatibili con i requisiti previsti.</p>
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
          <span className="font-bold text-white/60 text-sm">VetBuddy</span>
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

        <h2 className="text-3xl font-black text-gray-900 mb-1">Perché l'esperienza Owner aiuta la Clinica</h2>
        <p className="text-gray-500 mb-6">Il proprietario è il miglior alleato della clinica. Più è soddisfatto, più torna.</p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Riduce le telefonate', desc: 'Il proprietario prenota, consulta referti e riceve reminder da solo. Lo staff non viene interrotto.' },
            { title: 'Aumenta i ritorni', desc: 'Reminder e follow-up automatici riportano i clienti per vaccini, controlli e richiami.' },
            { title: 'Fidelizza a lungo termine', desc: 'Programma fedeltà, comunicazioni dirette e cura costante creano un legame duraturo.' },
            { title: 'Meno no-show', desc: 'Promemoria automatici 24h e 1h prima aiutano a ridurre le assenze. Durante il progetto pilota misuriamo l\'impatto reale sulla tua clinica.' },
            { title: 'Referti senza caos', desc: 'Il proprietario riceve i referti direttamente in app. Niente WhatsApp, niente email perse.' },
            { title: 'Passaparola positivo', desc: 'Un\'esperienza digitale moderna genera recensioni positive e nuovi clienti.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <h5 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h5>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          PAGINA 5B — PIANI SALUTE + AI ASSISTANT
      ===================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />

        <div className="mt-6 mb-3">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold">
            🚀 NUOVE FUNZIONALITÀ
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-1">Piani Salute + AI Assistant</h2>
        <p className="text-gray-500 mb-8 text-sm">Programmi di prevenzione strutturati e strumenti AI integrati per il veterinario moderno.</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-emerald-800 mb-3">Piani Salute</h4>
            <p className="text-gray-500 text-sm mb-4">Crea programmi di prevenzione personalizzati per ogni paziente.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Crea programmi: Piano Cucciolo, Piano Senior, Prevenzione',
                'Servizi inclusi: visite, vaccini, esami, trattamenti programmati',
                'Assegna piani ai pazienti e monitora il progresso',
                'Segna i servizi completati con un click',
                'Dashboard: piani attivi, pazienti iscritti, servizi prossimi 30gg',
                'Prezzo configurabile per ogni piano',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-indigo-800 mb-3">AI Assistant</h4>
            <p className="text-gray-500 text-sm mb-4">Intelligenza artificiale al servizio del veterinario.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Riassumi Visita: riassunto strutturato dalle note cliniche',
                'Scrivi Messaggio: comunicazioni professionali per i proprietari',
                'Traduci Note Cliniche: da termini tecnici a linguaggio semplice',
                'Risposta Intelligente: risposte contestuali ai messaggi clienti',
                'Powered by AI — veloce, preciso, integrato nella dashboard',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <p className="text-xs text-indigo-600/70 mt-4 italic border-t border-indigo-200 pt-3">L&apos;assistente non sostituisce il veterinario: aiuta a scrivere, riassumere e organizzare comunicazioni sempre validate dalla clinica. Ogni contenuto generato deve essere verificato e approvato dal personale della clinica prima dell&apos;invio.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-amber-800 mb-3">Team Inbox Avanzata</h4>
            <p className="text-gray-500 text-sm mb-4">Gestione messaggi con priorità, stato e template.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Assegna priorità: Alta, Media, Bassa',
                'Stati messaggi: Nuovo, In lavorazione, Risolto',
                'Template di risposta rapida configurabili',
                'Filtri per stato, priorità e data',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-purple-800 mb-3">Automazioni Avanzate</h4>
            <p className="text-gray-500 text-sm mb-4">Configurazione completa e log di esecuzione.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Timing personalizzabile (24h, 48h, 7gg, 30gg...)',
                'Log di esecuzione per ogni automazione',
                'Template con variabili dinamiche',
                'Attivazione/disattivazione singola',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
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
          <h2 className="text-3xl font-black text-gray-900 mb-2">Scegli il piano adatto alla tua clinica</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">Tutti i prezzi sono IVA esclusa. Abbonamento mensile, nessun vincolo annuale obbligatorio. Puoi annullare prima del rinnovo successivo.</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Starter */}
          <div className="border-2 border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Starter</p>
            <div className="mb-2"><span className="text-3xl font-black text-gray-800">€29</span><span className="text-sm text-gray-400">/mese + IVA</span></div>
            <p className="text-xs text-gray-500 mb-4">Per veterinari freelance e micro-cliniche.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['1 sede', '1 utente', 'Profilo pubblico', 'Link prenotazione', 'Agenda base', 'Reminder base', 'Fino a 30 prenotazioni/mese'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>

          {/* Growth — Consigliato */}
          <div className="border-2 border-coral-400 rounded-2xl p-5 bg-coral-50/30 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">⭐ Consigliato</div>
            <p className="text-xs font-bold text-coral-500 uppercase tracking-wider mb-2 mt-1">Growth</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-900">€69</span><span className="text-sm text-gray-500 ml-1">/mese + IVA</span></div>
            <p className="text-xs text-gray-500 mb-3">Per cliniche piccole e medie.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Fino a 5 utenti', 'Prenotazioni illimitate', 'Agenda digitale', 'Reminder automatici', 'Documenti e PDF', 'App proprietario', 'Inbox', 'Dashboard valore', 'Lab request base'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-coral-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-3 pt-2 border-t border-coral-200">
              <p className="text-xs font-bold text-coral-600">Pilot: Growth gratis 90 giorni</p>
            </div>
          </div>

          {/* Pro */}
          <div className="border-2 border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pro</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-800">€99</span><span className="text-sm text-gray-500 ml-1">/mese + IVA</span></div>
            <p className="text-xs text-gray-500 mb-3">Per cliniche strutturate.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Tutto Growth più:', 'Fino a 15 utenti', 'Automazioni avanzate', 'Piani salute', 'Programma fedeltà', 'Lab Network completo', 'Analytics avanzati', 'Report mensili', 'AI assistente'].map((f, i) => (
                <li key={i} className={`flex items-center gap-1.5 ${i === 0 ? 'font-semibold' : ''}`}><Check className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>

          {/* Lab Partner */}
          <div className="border-2 border-blue-200 rounded-2xl p-5 bg-blue-50/30">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Lab Partner</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-800">€39</span><span className="text-sm text-gray-500 ml-1">/mese + IVA</span></div>
            <p className="text-xs text-gray-500 mb-3">Per laboratori di analisi.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Dashboard laboratorio', 'Profilo marketplace', 'Listino prezzi', 'Gestione richieste', 'Upload referti PDF', 'Notifiche email', 'Disponibilità ritiro'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-xs font-bold text-blue-600">Pilot: gratis per 6 mesi</p>
            </div>
          </div>
        </div>

        {/* Pilot nota */}
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-coral-800 leading-relaxed text-center">
            <strong>🏙️ Pilot Milano:</strong> 90 giorni per misurare il valore generato da VetBuddy nella tua clinica. Nessun vincolo, nessun costo iniziale. Alla fine del pilot ricevi un riepilogo con prenotazioni generate, telefonate evitate, reminder inviati e tempo risparmiato.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">Non sostituisce il tuo gestionale: VetBuddy lavora accanto ai tuoi strumenti attuali. Puoi iniziare senza migrare tutti i dati o cambiare i flussi principali della clinica.</p>

      </div>

      {/* =====================================================
          PAGINA 7B — FAQ DEDICATE
      ===================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />
        <h2 className="text-2xl font-black text-gray-900 mt-6 mb-6">Domande frequenti</h2>
        
        <div className="space-y-4">
          {[
            { q: 'VetBuddy sostituisce il mio gestionale?', a: 'No. VetBuddy non è un gestionale completo. È un copilota operativo che lavora accanto ai tuoi strumenti attuali per automatizzare prenotazioni, reminder, comunicazioni e follow-up. Puoi iniziare senza migrare tutti i dati o cambiare i flussi principali della clinica.' },
            { q: 'VetBuddy emette la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy supporta la preparazione, la gestione e l\'archiviazione del flusso prescrittivo. L\'emissione ufficiale resta in capo al medico veterinario abilitato sul sistema nazionale.' },
            { q: 'Quanto costa VetBuddy?', a: 'Starter €29/mese, Growth €69/mese (consigliato), Pro €99/mese. Laboratori €39/mese. Tutti i prezzi IVA esclusa.' },
            { q: 'Cos\'è il Pilot Milano?', a: 'Pilot Milano: 90 giorni per misurare il valore generato da VetBuddy nella tua clinica. Include onboarding, configurazione e supporto. Nessun vincolo: se non ti convince, non paghi nulla. Alla fine del pilot ricevi un riepilogo con prenotazioni generate, telefonate evitate, reminder inviati, tempo risparmiato e clienti riattivati.' },
            { q: 'I pagamenti dei clienti passano da VetBuddy?', a: 'No. I pagamenti delle visite vanno direttamente alla clinica. VetBuddy incassa esclusivamente l\'abbonamento della piattaforma.' },
            { q: 'Come funziona l\'invio dei referti?', a: 'Il laboratorio carica il referto. Il veterinario lo rivede, aggiunge note cliniche e decide quando pubblicarlo al proprietario.' },
            { q: 'VetBuddy è gratuito per i proprietari?', a: 'Sì, completamente gratuito per sempre. Nessun costo nascosto.' },
            { q: 'Posso annullare in qualsiasi momento?', a: 'Abbonamento mensile, nessun vincolo annuale obbligatorio. Puoi annullare prima del rinnovo successivo. Puoi iniziare senza migrare tutti i dati o cambiare i flussi principali della clinica.' },
            { q: 'Serve una formazione tecnica?', a: 'No. VetBuddy è progettato per essere intuitivo. L\'onboarding è incluso e il supporto è sempre disponibile.' },
          ].map((item, i) => (
            <div key={i} className="pb-3 border-b border-gray-100 last:border-0">
              <p className="font-semibold text-gray-900 text-sm mb-1">{item.q}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{item.a}</p>
            </div>
          ))}
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
          <span className="font-bold text-white/80 text-sm">VetBuddy</span>
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
      <span className="font-bold text-gray-400 text-sm">Vet<span className="text-coral-400">Buddy</span></span>
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
