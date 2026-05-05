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

      {/* ====================================================================
          PAGINA 1 — COPERTINA
      ==================================================================== */}
      <div className="brochure-page flex flex-col items-center justify-center px-12 py-12 text-center text-white relative" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #f97316 50%, #FF6B6B 100%)' }}>
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}></div>

        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: '#ffffff' }}>
          <PawPrint className="w-14 h-14" style={{ color: '#FF6B6B' }} />
        </div>
        
        <h1 className="text-6xl font-black tracking-tight mb-2" style={{ color: '#ffffff' }}>VetBuddy</h1>
        <div className="w-16 h-1 mx-auto mb-8 rounded-full" style={{ background: '#ffffff', opacity: 0.5 }}></div>

        <p className="text-2xl leading-relaxed font-medium mb-3" style={{ color: '#ffffff' }}>
          Più prenotazioni. Meno telefonate.<br/>
          <strong className="font-black">Clienti sempre seguiti.</strong>
        </p>
        <p className="text-base mb-8" style={{ color: '#ffffff', opacity: 0.85 }}>
          Il copilota operativo che automatizza prenotazioni, promemoria,<br/>comunicazioni, referti e ricontatti per la tua clinica.
        </p>

        <div className="inline-flex items-center gap-3 px-7 py-3 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }}></div>
          <span className="text-lg font-bold" style={{ color: '#ffffff' }}>Progetto pilota Milano 2025</span>
        </div>

        <p className="text-sm mb-8" style={{ color: '#ffffff', opacity: 0.8 }}>90 giorni per misurare il valore generato da VetBuddy nella tua clinica.</p>

        <div className="flex gap-10">
          {[
            { n: 'Fino a -70%', l: 'Telefonate (obiettivo del progetto pilota)' },
            { n: 'Fino a +40%', l: 'Prenotazioni online (obiettivo del progetto pilota)' },
            { n: 'Fino a 15h', l: 'Risparmiate/mese (obiettivo del progetto pilota)' },
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

      {/* ====================================================================
          PAGINA 2 — PERCHÉ VETBUDDY + PROPOSTA DI VALORE
      ==================================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />
        
        <h2 className="text-4xl font-black text-gray-900 mb-2 mt-6">Perché VetBuddy?</h2>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl">Non è l&apos;ennesimo gestionale. È il copilota operativo che riduce il caos quotidiano e aumenta le visite ricorrenti.</p>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <StatBox number="Fino a -70%" label="telefonate evitate grazie a prenotazioni online e promemoria automatici (obiettivo del progetto pilota)" />
          <StatBox number="Fino a 15h" label="risparmiate ogni mese dallo staff della clinica (obiettivo del progetto pilota)" />
          <StatBox number="Fino a +25%" label="clienti che tornano grazie a ricontatti e richiami automatici (obiettivo del progetto pilota)" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6">Due ecosistemi, una piattaforma</h3>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #FF6B6B, #f97316)' }}>
            <h4 className="text-xl font-bold mb-3">Per le Cliniche Veterinarie</h4>
            <p className="text-white/80 text-sm mb-4">Gli strumenti operativi per ridurre telefonate, automatizzare comunicazioni e seguire meglio i clienti.</p>
            <ul className="space-y-1.5 text-sm text-white/90">
              {['Agenda digitale e prenotazioni online', 'Schede animale, documenti e storico visite', 'Listino servizi, ricevute operative ed esportazioni', 'Documenti PDF con invio automatico al proprietario', 'Assistente al flusso Ricetta Elettronica Veterinaria', 'Casella messaggi condivisa', 'Oltre 40 automazioni operative', 'Cruscotto del valore generato'].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="font-bold">Piano Crescita: consigliato</p>
              <p className="text-white/70 text-xs">€69/mese + IVA • Progetto pilota: gratis 90 giorni</p>
            </div>
          </div>
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <h4 className="text-xl font-bold mb-3">Per i Proprietari di Animali</h4>
            <p className="text-white/80 text-sm mb-4">L&apos;area proprietario è il canale digitale con cui la clinica segue il cliente anche dopo la visita.</p>
            <ul className="space-y-1.5 text-sm text-white/90">
              {['Prenotazione online in pochi click', 'Profilo animale completo', 'Documenti e referti autorizzati dalla clinica', 'Promemoria visite e vaccini', 'Comunicazioni dalla clinica', 'Programma fedeltà configurabile', 'Storico visite e documenti', 'Accesso tramite area riservata'].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="font-bold">100% Gratuito per il proprietario</p>
              <p className="text-white/70 text-xs">Per sempre, nessun costo nascosto</p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          PAGINA 3 — FUNZIONALITÀ CLINICA
      ==================================================================== */}
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
            desc="Carica referti, prescrizioni, documenti e riepiloghi in PDF. Invia automaticamente al proprietario. Il proprietario può consultarli tramite area riservata, solo quando autorizzati dalla clinica."
          />
          <FeatureBlock
            title="Listino e riepiloghi economici"
            desc="VetBuddy consente di organizzare listini, ricevute operative, esportazioni e riepiloghi economici. Gli adempimenti fiscali e contabili restano in capo alla clinica e ai suoi strumenti amministrativi."
          />
          <FeatureBlock
            title="Casella messaggi condivisa"
            desc="Messaggistica centralizzata con assegnazione allo staff, priorità, stato e modelli di risposta. Comunicazioni rapide e ordinate con i proprietari."
          />
          <FeatureBlock
            title="Cruscotto del valore generato"
            desc="Prenotazioni generate, telefonate evitate, promemoria inviati, tempo risparmiato, clienti riattivati, richieste laboratorio gestite e riepiloghi economici mensili."
          />
          <FeatureBlock
            title="Google Calendar Sync"
            desc="Sincronizzazione bidirezionale con Google Calendar. Gli appuntamenti VetBuddy appaiono nel calendario del veterinario e viceversa."
          />
          <FeatureBlock
            title="Video-Consulti"
            desc="Consulenze veterinarie a distanza con videochiamata integrata. Ideale per ricontatti, controlli post-operatori e consulti rapidi."
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
            desc="Sistema a punti configurabile dalla clinica, con premi o vantaggi definiti secondo le proprie regole commerciali. La clinica decide in autonomia regole, vantaggi e condizioni del programma."
          />
        </div>
      </div>

      {/* ====================================================================
          PAGINA 4 — ASSISTENTE AL FLUSSO REV
      ==================================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />
        <div className="mt-6 mb-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold">
            💊 FUNZIONALITÀ
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-1">Assistente al flusso Ricetta Elettronica Veterinaria</h2>
        <p className="text-gray-500 mb-5 text-sm">VetBuddy aiuta la clinica a preparare, organizzare e archiviare il flusso relativo alla Ricetta Elettronica Veterinaria. L&apos;emissione ufficiale resta in capo al medico veterinario abilitato, che opera con le proprie credenziali e sotto la propria responsabilità professionale.</p>

        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="border-2 border-emerald-200 rounded-2xl p-5 bg-emerald-50/30">
            <h4 className="font-bold text-emerald-800 text-base mb-3 flex items-center gap-1.5">✅ Cosa fa VetBuddy</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {[
                'Prepara la bozza dalla scheda animale',
                'Organizza farmaci, posologia e durata',
                'Riduce passaggi manuali',
                'Archivia numero ricetta, PIN e storico',
                'Rende consultabili solo i dati autorizzati dalla clinica',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="border-2 border-amber-200 rounded-2xl p-5 bg-amber-50/30">
            <h4 className="font-bold text-amber-800 text-base mb-3 flex items-center gap-1.5">🩺 Cosa resta in capo al veterinario</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {[
                'Emissione ufficiale',
                'Uso delle credenziali personali',
                'Abilitazione al sistema nazionale',
                'Verifica delle informazioni',
                'Responsabilità professionale',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="border-2 border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 relative">
            <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-xs px-3 py-0.5 rounded-full font-bold">ATTIVO</div>
            <h4 className="font-bold text-emerald-800 text-sm mb-2 mt-1">Modalità guidata/manuale</h4>
            <p className="text-gray-600 text-xs leading-snug">VetBuddy prepara il flusso e consente di registrare gli estremi della ricetta emessa nel sistema ufficiale.</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 relative opacity-80">
            <div className="absolute -top-2.5 left-4 bg-gray-400 text-white text-xs px-3 py-0.5 rounded-full font-bold">PROSSIMAMENTE</div>
            <h4 className="font-bold text-gray-700 text-sm mb-2 mt-1">Integrazione tecnica futura</h4>
            <p className="text-gray-500 text-xs leading-snug">Eventuali integrazioni tecniche con sistemi ufficiali saranno disponibili solo se autorizzate, configurate e compatibili con i requisiti previsti.</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3">Flusso in 4 passaggi</h3>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { num: '01', icon: '📝', title: 'Prepara', desc: 'Preparazione guidata: paziente, farmaci, posologia, diagnosi.' },
            { num: '02', icon: '🩺', title: 'Emissione ufficiale', desc: 'Il veterinario abilitato completa l\'emissione nel sistema nazionale.' },
            { num: '03', icon: '📋', title: 'Registra', desc: 'Inserisci numero ricetta e PIN. Stato aggiornato automaticamente.' },
            { num: '04', icon: '📦', title: 'Archivia', desc: 'VetBuddy archivia e rende consultabile solo su autorizzazione della clinica.' },
          ].map((step, i) => (
            <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-xl mb-1">{step.icon}</div>
              <div className="text-xs font-bold text-emerald-600 mb-0.5">STEP {step.num}</div>
              <h4 className="font-bold text-gray-900 text-xs mb-0.5">{step.title}</h4>
              <p className="text-gray-500 text-[10px] leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Nota:</strong> L&apos;emissione ufficiale della Ricetta Elettronica Veterinaria richiede l&apos;abilitazione del medico veterinario al sistema nazionale competente.
            VetBuddy supporta il flusso operativo della clinica ma non sostituisce il sistema pubblico di emissione.
          </p>
        </div>
      </div>

      {/* ====================================================================
          PAGINA 5 — OLTRE 40 AUTOMAZIONI OPERATIVE
      ==================================================================== */}
      <div className="brochure-page text-white px-12 py-14" style={{ background: 'linear-gradient(135deg, #312E81, #581C87, #312E81)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white/60 text-sm">VetBuddy</span>
        </div>

        <h2 className="text-3xl font-black mb-1 mt-2">Oltre 40 automazioni operative</h2>
        <p className="text-white/60 mb-8">Mentre ti occupi dei pazienti, VetBuddy gestisce automaticamente comunicazioni, promemoria e ricontatti.</p>

        <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-sm">
          <div>
            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">Promemoria</h4>
            <AutoList items={[
              'Promemoria appuntamento 24 ore prima',
              'Promemoria appuntamento 1 ora prima',
              'Promemoria vaccino in scadenza',
              'Promemoria richiamo annuale',
              'Promemoria trattamento antiparassitario',
              'Promemoria visita periodica',
              'Promemoria pulizia dentale',
              'Promemoria rinnovo prescrizione',
            ]} />

            <h4 className="text-green-400 font-bold text-xs uppercase tracking-wider mb-3 mt-5">Conferme e stati</h4>
            <AutoList items={[
              'Conferma prenotazione al proprietario',
              'Notifica nuova prenotazione alla clinica',
              'Conferma cancellazione',
              'Notifica modifica appuntamento',
              'Notifica posto libero',
              'Conferma pagamento ricevuto, se gestito dalla clinica',
            ]} />
          </div>
          <div>
            <h4 className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-3">Ricontatti e fidelizzazione</h4>
            <AutoList items={[
              'Ricontatto post-visita',
              'Ricontatto post-chirurgia',
              'Richiesta recensione',
              'Messaggio di benvenuto nuovo cliente',
              'Auguri compleanno animale',
              'Riepilogo visite periodico',
              'Promemoria piano salute',
              'Notifica punti o vantaggi fedeltà',
            ]} />

            <h4 className="text-purple-300 font-bold text-xs uppercase tracking-wider mb-3 mt-5">Documenti e laboratori</h4>
            <AutoList items={[
              'Invio automatico documento PDF',
              'Notifica nuovo documento caricato',
              'Notifica referto pronto',
              'Notifica nuova richiesta al laboratorio',
              'Notifica stato richiesta aggiornato',
              'Riepilogo mensile prenotazioni',
              'Riepilogo pazienti attivi',
              'Avviso slot agenda disponibili',
            ]} />
          </div>
        </div>
        <p className="text-white/40 text-xs mt-6">+ altre automazioni in arrivo. Le automazioni si attivano automaticamente con il piano Pro.</p>
      </div>

      {/* ====================================================================
          PAGINA 6 — RETE LABORATORI + PROPRIETARI
      ==================================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />

        <h2 className="text-3xl font-black text-gray-900 mb-1 mt-6">Rete laboratori VetBuddy</h2>
        <p className="text-gray-500 mb-6">VetBuddy collega cliniche e laboratori partner in un flusso semplice: richiesta esame, aggiornamento stato, caricamento referto, revisione della clinica e pubblicazione al proprietario tramite area riservata.</p>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h4 className="font-bold text-blue-800 text-lg mb-3">Per la Clinica</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Invia richieste di esame dalla scheda animale',
                'Seleziona il laboratorio in base a distanza, prezzo indicativo e tempi medi',
                'Riceve notifiche sullo stato della richiesta',
                'Rivede il referto prima di renderlo visibile al proprietario',
                'Conserva lo storico richieste e referti',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h4 className="font-bold text-indigo-800 text-lg mb-3">Per il Laboratorio</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Riceve richieste dalla clinica',
                'Aggiorna lo stato della lavorazione',
                'Carica referti PDF',
                'Inserisce listino indicativo',
                'Indica tempi medi',
                'Segnala disponibilità ritiro campioni',
                'Gestisce lo storico delle richieste',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-1">Perché l&apos;area proprietario aiuta la clinica</h2>
        <p className="text-gray-500 mb-6">L&apos;area proprietario è il canale digitale con cui la clinica segue il cliente anche dopo la visita.</p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Riduce le telefonate', desc: 'Il proprietario prenota, consulta documenti e riceve promemoria in autonomia.' },
            { title: 'Aumenta i ritorni', desc: 'Promemoria e ricontatti automatici riportano i clienti per vaccini, controlli e richiami.' },
            { title: 'Fidelizza a lungo termine', desc: 'Programma fedeltà configurabile, comunicazioni dirette e cura costante creano un legame duraturo.' },
            { title: 'Meno assenze agli appuntamenti', desc: 'Promemoria automatici 24 ore e 1 ora prima aiutano a ridurre le assenze. Durante il progetto pilota misuriamo l\'impatto reale sulla tua clinica.' },
            { title: 'Referti organizzati', desc: 'Il proprietario può consultare referti e documenti autorizzati tramite area riservata. La clinica mantiene sempre il controllo su cosa rendere visibile.' },
            { title: 'Passaparola positivo', desc: 'Un\'esperienza digitale moderna e ordinata genera recensioni positive e nuovi clienti.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <h5 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h5>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          PAGINA 7 — PIANI SALUTE + ASSISTENTE INTELLIGENTE
      ==================================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />

        <div className="mt-6 mb-3">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold">
            🚀 FUNZIONALITÀ
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-1">Piani Salute + Assistente intelligente</h2>
        <p className="text-gray-500 mb-8 text-sm">Programmi di prevenzione strutturati e strumenti basati su intelligenza artificiale per il veterinario.</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-emerald-800 mb-3">Piani Salute</h4>
            <p className="text-gray-500 text-sm mb-4">Crea percorsi di prevenzione per trasformare visite occasionali in richiami ricorrenti.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Piano Cucciolo, Piano Senior, Piano Prevenzione Annuale',
                'Piano Antiparassitario, Piano Dental Care, Piano Post-Operatorio',
                'Servizi inclusi con frequenza consigliata',
                'Promemoria automatici e stato avanzamento',
                'Prossimi servizi in evidenza',
                'Prezzo configurabile dalla clinica',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-indigo-800 mb-3">Assistente intelligente</h4>
            <p className="text-gray-500 text-sm mb-4">Basato su intelligenza artificiale, al servizio del veterinario.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Riassunto visita strutturato dalle note cliniche',
                'Scrittura messaggio al proprietario',
                'Traduzione note tecniche in linguaggio semplice',
                'Suggerimento risposta ai messaggi frequenti',
                'Riepilogo referto in linguaggio comprensibile',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <p className="text-xs text-indigo-600/70 mt-4 italic border-t border-indigo-200 pt-3">L&apos;assistente intelligente non sostituisce il veterinario. Aiuta a scrivere, riassumere e organizzare comunicazioni, ma ogni contenuto generato deve essere verificato e approvato dal personale della clinica prima dell&apos;invio.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-amber-800 mb-3">Casella messaggi condivisa</h4>
            <p className="text-gray-500 text-sm mb-4">Gestione messaggi centralizzata per tutto lo staff.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Messaggi dei proprietari e richieste appuntamento',
                'Notifiche laboratorio e documenti caricati',
                'Assegnazione allo staff',
                'Stato: nuovo, in lavorazione, risolto',
                'Priorità: alta, media, bassa',
                'Modelli di risposta configurabili',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-purple-800 mb-3">Automazioni avanzate</h4>
            <p className="text-gray-500 text-sm mb-4">Configurazione completa e registro di esecuzione.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Frequenza personalizzabile (24h, 48h, 7gg, 30gg...)',
                'Registro di esecuzione per ogni automazione',
                'Modelli con variabili dinamiche',
                'Attivazione/disattivazione singola',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ====================================================================
          PAGINA 8 — COME FUNZIONA
      ==================================================================== */}
      <div className="brochure-page bg-gray-50 px-12 py-14">
        <PageHeader />
        
        <h2 className="text-3xl font-black text-gray-900 mb-1 mt-6">Come funziona</h2>
        <p className="text-gray-500 mb-8">Inizia in meno di 10 minuti. Nessuna installazione, nessun hardware.</p>

        <div className="grid grid-cols-4 gap-5 mb-14">
          {[
            { num: '01', title: 'Registrati', desc: 'Crea il tuo account clinica su vetbuddy.it. Compila il profilo: nome, indirizzo, P.IVA, orari di apertura.' },
            { num: '02', title: 'Configura', desc: 'Aggiungi servizi con prezzi e durate. Imposta le disponibilità dell\'agenda per ogni veterinario.' },
            { num: '03', title: 'Invita', desc: 'Invita i tuoi clienti a registrarsi. Possono trovare la clinica tramite il profilo pubblico o il link diretto.' },
            { num: '04', title: 'Parti', desc: 'I clienti prenotano online. Tu gestisci tutto da un\'unica interfaccia. Le automazioni fanno il resto.' },
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
          <p className="text-gray-900 font-bold text-lg mb-2">Cruscotto del valore generato</p>
          <p className="text-gray-500 text-sm">Ogni mese VetBuddy ti mostra quante prenotazioni ha generato, quante telefonate ti ha evitato e quanto tempo hai risparmiato. Numeri concreti per misurare il ritorno dell&apos;investimento.</p>
        </div>

        <div className="mt-6 bg-coral-50 border border-coral-200 rounded-xl p-4 text-center max-w-xl mx-auto">
          <p className="text-xs text-coral-800 font-medium">VetBuddy lavora accanto agli strumenti già usati dalla clinica, senza obbligare a migrare tutti i dati o cambiare i flussi principali.</p>
        </div>
      </div>

      {/* ====================================================================
          PAGINA 9 — PREZZI
      ==================================================================== */}
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
              {['1 sede', '1 utente', 'Profilo pubblico', 'Link prenotazione', 'Agenda base', 'Promemoria base', 'Fino a 30 prenotazioni/mese'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>

          {/* Growth — Consigliato */}
          <div className="border-2 border-coral-400 rounded-2xl p-5 bg-coral-50/30 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">⭐ Consigliato</div>
            <p className="text-xs font-bold text-coral-500 uppercase tracking-wider mb-2 mt-1">Crescita (Growth)</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-900">€69</span><span className="text-sm text-gray-500 ml-1">/mese + IVA</span></div>
            <p className="text-xs text-gray-500 mb-3">Piano consigliato per cliniche piccole e medie.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Fino a 5 utenti', 'Prenotazioni illimitate', 'Agenda digitale', 'Promemoria automatici', 'Documenti e PDF', 'Area proprietario', 'Casella messaggi', 'Cruscotto valore', 'Richieste laboratorio'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-coral-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-3 pt-2 border-t border-coral-200">
              <p className="text-xs font-bold text-coral-600">Progetto pilota: gratis 90 giorni</p>
            </div>
          </div>

          {/* Pro */}
          <div className="border-2 border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pro</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-800">€99</span><span className="text-sm text-gray-500 ml-1">/mese + IVA</span></div>
            <p className="text-xs text-gray-500 mb-3">Per cliniche strutturate.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Tutto Crescita più:', 'Fino a 15 utenti', 'Automazioni avanzate', 'Piani salute', 'Programma fedeltà', 'Rete laboratori completa', 'Riepiloghi avanzati', 'Rendiconti mensili', 'Assistente intelligente'].map((f, i) => (
                <li key={i} className={`flex items-center gap-1.5 ${i === 0 ? 'font-semibold' : ''}`}><Check className="w-3 h-3 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>

          {/* Laboratorio Partner */}
          <div className="border-2 border-blue-200 rounded-2xl p-5 bg-blue-50/30">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Laboratorio Partner</p>
            <div className="mb-1"><span className="text-3xl font-black text-gray-800">€39</span><span className="text-sm text-gray-500 ml-1">/mese + IVA</span></div>
            <p className="text-xs text-gray-500 mb-3">Per laboratori di analisi.</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {['Pannello di gestione richieste', 'Profilo nella vetrina laboratori', 'Listino prezzi indicativo', 'Gestione richieste', 'Caricamento referti PDF', 'Notifiche automatiche', 'Disponibilità ritiro'].map((f, i) => (
                <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-xs font-bold text-blue-600">Progetto pilota: gratis per 6 mesi</p>
            </div>
          </div>
        </div>

        <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-coral-800 leading-relaxed text-center">
            <strong>🏙️ Progetto pilota Milano:</strong> 90 giorni per misurare il valore generato da VetBuddy nella tua clinica. Nessun vincolo, nessun costo iniziale. Alla fine del progetto pilota ricevi un riepilogo con prenotazioni generate, telefonate evitate, promemoria inviati, tempo risparmiato e clienti riattivati.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">VetBuddy lavora accanto agli strumenti già usati dalla clinica, senza obbligare a migrare tutti i dati o cambiare i flussi principali.</p>
      </div>

      {/* ====================================================================
          PAGINA 10 — DOMANDE FREQUENTI
      ==================================================================== */}
      <div className="brochure-page bg-white px-12 py-14">
        <PageHeader />
        <h2 className="text-2xl font-black text-gray-900 mt-6 mb-6">Domande frequenti</h2>
        
        <div className="space-y-4">
          {[
            { q: 'VetBuddy sostituisce il mio gestionale?', a: 'No. VetBuddy non è un gestionale veterinario completo. È un copilota operativo che lavora accanto agli strumenti già usati dalla clinica per automatizzare prenotazioni, promemoria, comunicazioni, documenti e ricontatti. Puoi iniziare senza migrare tutti i dati o cambiare i flussi principali.' },
            { q: 'VetBuddy emette la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy supporta la preparazione, la gestione e l\'archiviazione del flusso prescrittivo. L\'emissione ufficiale resta in capo al medico veterinario abilitato, che opera con le proprie credenziali e responsabilità professionale.' },
            { q: 'Come funziona l\'invio dei referti?', a: 'Il laboratorio carica il referto. La clinica lo rivede, aggiunge eventuali note e decide se e quando renderlo visibile al proprietario tramite area riservata.' },
            { q: 'I pagamenti dei clienti passano da VetBuddy?', a: 'No. I pagamenti delle visite restano gestiti dalla clinica. VetBuddy incassa esclusivamente l\'abbonamento della piattaforma, salvo eventuali servizi aggiuntivi concordati.' },
            { q: 'Il proprietario paga VetBuddy?', a: 'No. L\'area proprietario è gratuita per il proprietario dell\'animale.' },
            { q: 'Posso annullare l\'abbonamento?', a: 'Sì. L\'abbonamento è mensile, senza vincolo annuale obbligatorio. Puoi annullare prima del rinnovo successivo.' },
            { q: 'Devo cambiare tutti i miei strumenti?', a: 'No. VetBuddy può lavorare accanto agli strumenti già usati dalla clinica. Il progetto pilota serve proprio a misurare il valore senza stravolgere l\'organizzazione.' },
            { q: 'I dati e i referti sono visibili automaticamente al proprietario?', a: 'No. La clinica mantiene il controllo sui documenti e decide quali informazioni rendere visibili al proprietario tramite area riservata.' },
            { q: 'Serve una formazione tecnica?', a: 'No. VetBuddy è progettato per essere intuitivo. L\'onboarding è incluso e il supporto è sempre disponibile.' },
          ].map((item, i) => (
            <div key={i} className="pb-3 border-b border-gray-100 last:border-0">
              <p className="font-semibold text-gray-900 text-sm mb-1">{item.q}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          PAGINA 11 — CTA FINALE
      ==================================================================== */}
      <div className="brochure-page text-white px-12 py-14 flex flex-col" style={{ background: 'linear-gradient(135deg, #FF6B6B, #f97316)' }}>
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white/80 text-sm">VetBuddy</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl font-black mb-4 leading-tight">Vuoi ridurre telefonate e misurare<br/>quante prenotazioni VetBuddy può<br/>generare per la tua clinica?</h2>
          <p className="text-white/80 text-lg max-w-xl mb-12">Candidati al Progetto pilota Milano e ricevi un riepilogo concreto del valore generato in 90 giorni.</p>

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
                  <p className="text-white/60 text-xs">Candidatura</p>
                  <p className="font-bold">Scrivici per entrare nella lista delle cliniche selezionate</p>
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
