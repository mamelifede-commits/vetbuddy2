import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

// Helper: sanitize text for PDF — keeps Italian accented chars (WinAnsi supported)
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/[^\x00-\xFF]/g, '');
}

// ==========================================================================
//  TUTORIAL PROPRIETARIO
// ==========================================================================
const ownerTutorial = {
  title: 'VetBuddy \u2014 Guida per Proprietari di Animali',
  subtitle: 'Tutto quello che serve per gestire la salute dei tuoi animali, in un unico posto.',

  quickStart: [
    'Registrati gratuitamente su vetbuddy.it',
    'Aggiungi i tuoi animali al profilo',
    'Trova la tua clinica o usa il link di prenotazione ricevuto',
    'Prenota il primo appuntamento'
  ],

  sections: [
    {
      title: 'REGISTRAZIONE E PRIMO ACCESSO',
      content: [
        'Vai su vetbuddy.it e clicca \u201CRegistrati\u201D',
        'Seleziona \u201CProprietario di Animali\u201D',
        'Inserisci email e crea una password sicura',
        'Completa il profilo: nome, cognome, telefono',
        'La registrazione \u00E8 gratuita per i proprietari'
      ],
      tip: 'VetBuddy \u00E8 gratuito per i proprietari. Nessun costo nascosto.'
    },
    {
      title: 'AGGIUNGERE I TUOI ANIMALI',
      content: [
        'Dalla dashboard clicca su \u201CI Miei Animali\u201D',
        'Premi \u201C+\u201D per aggiungere un nuovo animale',
        'Inserisci: nome, specie, razza, data di nascita',
        'Aggiungi peso, numero microchip e foto se disponibili',
        'Indica eventuali allergie o condizioni particolari',
        'VetBuddy supporta cani, gatti, conigli, cavalli, uccelli, rettili e altri'
      ],
      tip: 'Un profilo completo aiuta il veterinario a offrire cure migliori.'
    },
    {
      title: 'PRENOTARE CON IL LINK DIRETTO',
      content: [
        'Se la tua clinica ti ha inviato un link, aprilo nel browser',
        'Vedrai il profilo della clinica con servizi e disponibilit\u00E0',
        'Compila il modulo: nome, telefono, animale, data preferita',
        'La richiesta arriva alla clinica, che ti contatter\u00E0 per confermare',
        'Non serve un account VetBuddy per inviare una richiesta tramite link'
      ],
      tip: 'Il link diretto permette di inviare una richiesta rapida. La clinica conferma poi data e orario.'
    },
    {
      title: 'GESTIRE GLI APPUNTAMENTI',
      content: [
        'Clicca su \u201CAgenda\u201D nella dashboard',
        'Vedi tutti gli appuntamenti confermati e in attesa',
        'Ricevi promemoria automatici prima della visita',
        'Lo stato dell\u2019appuntamento si aggiorna in tempo reale'
      ],
      tip: 'Controlla regolarmente la sezione Agenda per eventuali aggiornamenti.'
    },
    {
      title: 'DOCUMENTI E REFERTI',
      content: [
        'Accedi a \u201CI Miei Documenti\u201D dalla dashboard',
        'Trovi prescrizioni, referti, certificati e altri documenti',
        'Scarica singoli documenti in PDF o tutti insieme in formato ZIP',
        'I documenti sono disponibili quando la clinica li pubblica'
      ],
      tip: 'Trovi tutti i documenti in un unico posto, accessibili in qualsiasi momento.'
    },
    {
      title: 'REFERTI DI LABORATORIO',
      content: [
        'Apri il profilo del tuo animale e vai alla tab \u201CReferti\u201D',
        'I referti di laboratorio sono visibili solo dopo la revisione del veterinario',
        'Il veterinario pu\u00F2 aggiungere note cliniche per aiutarti a comprendere i risultati',
        'Ricevi una notifica quando un nuovo referto \u00E8 disponibile',
        'Puoi scaricare il referto PDF per i tuoi archivi'
      ],
      tip: 'Il veterinario rivede ogni referto prima di renderlo visibile. Questo garantisce che le informazioni siano accompagnate da un commento clinico.'
    },
    {
      title: 'PRESCRIZIONI ELETTRONICHE (REV)',
      content: [
        'Quando il veterinario pubblica una prescrizione, ricevi una notifica email',
        'Apri il profilo del tuo animale e vai alla tab \u201CPrescrizioni\u201D',
        'Consulta i dettagli: farmaci, posologia, durata del trattamento',
        'Trovi il numero ricetta e PIN utili per il ritiro in farmacia',
        'Le prescrizioni sono visibili solo quando il veterinario decide di pubblicarle'
      ],
      tip: 'Le informazioni sulle prescrizioni sono rese disponibili dal veterinario secondo il flusso previsto dal sistema nazionale.'
    },
    {
      title: 'PAGAMENTI E FATTURE',
      content: [
        'I pagamenti per visite e servizi avvengono direttamente con la clinica',
        'La clinica gestisce i propri metodi di pagamento (contanti, carta, bonifico)',
        'VetBuddy non \u00E8 un intermediario di pagamento per i servizi veterinari',
        'Eventuali documenti di cortesia (proforma) possono essere consultati nella sezione Fatture'
      ],
      tip: 'Per qualsiasi chiarimento sui pagamenti, fai riferimento direttamente alla tua clinica.'
    },
    {
      title: 'MESSAGGISTICA',
      content: [
        'Vai su \u201CMessaggi\u201D per comunicare con la clinica',
        'Scrivi messaggi e ricevi risposte dal team veterinario',
        'Puoi allegare foto o documenti ai messaggi',
        'Ricevi notifiche per ogni nuovo messaggio ricevuto'
      ],
      tip: 'La messaggistica \u00E8 utile per domande rapide senza dover telefonare.'
    },
    {
      title: 'PROGRAMMA FEDELT\u00C0',
      content: [
        'Accumula punti con le prenotazioni completate',
        'Visualizza il tuo saldo punti nella dashboard',
        'I punti possono essere convertiti in vantaggi presso la clinica',
        'Consulta i dettagli del programma nella sezione dedicata'
      ],
      tip: 'Il programma fedelt\u00E0 \u00E8 gestito dalla clinica. Verifica con il tuo veterinario le condizioni attive.'
    }
  ],

  onboarding: {
    title: 'COME USARE VETBUDDY AL MEGLIO',
    subtitle: 'Suggerimenti per sfruttare tutte le funzionalit\u00E0 della piattaforma.',
    first10: {
      title: 'Cosa fare nei primi 10 minuti',
      items: [
        'Completa il tuo profilo con nome e telefono',
        'Aggiungi almeno un animale con le informazioni principali',
        'Esplora la dashboard e le sezioni disponibili'
      ]
    },
    firstWeek: {
      title: 'Cosa fare nella prima settimana',
      items: [
        'Prova a prenotare un appuntamento (o usa il link diretto della clinica)',
        'Consulta la sezione documenti per verificare eventuali referti disponibili',
        'Attiva le notifiche per non perdere aggiornamenti',
        'Controlla la sezione Prescrizioni nel profilo animale'
      ]
    },
    checklist: {
      title: 'Checklist di configurazione',
      items: [
        'Profilo completato',
        'Almeno un animale aggiunto',
        'Link di prenotazione della clinica provato',
        'Sezione documenti e referti esplorata',
        'Notifiche attivate',
        'Sezione appuntamenti verificata'
      ]
    }
  },

  faqs: [
    { q: 'Quanto costa usare VetBuddy?', a: 'Completamente gratuito per i proprietari di animali. Nessun costo nascosto.' },
    { q: 'Posso usare VetBuddy con qualsiasi clinica?', a: 'VetBuddy funziona con le cliniche registrate sulla piattaforma.' },
    { q: 'Posso prenotare senza creare un account?', a: 'S\u00EC. Tramite il link diretto della clinica puoi inviare una richiesta rapida senza account. La clinica conferma successivamente.' },
    { q: 'Come vedo i referti del laboratorio?', a: 'Nel profilo del tuo animale, alla tab Referti. Sono visibili solo dopo la revisione del veterinario.' },
    { q: 'Come vedo le prescrizioni del veterinario?', a: 'Nel profilo del tuo animale, alla tab Prescrizioni. Sono visibili solo quando il veterinario le pubblica.' },
    { q: 'VetBuddy emette la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy supporta la preparazione e l\u2019archiviazione del flusso. L\u2019emissione ufficiale \u00E8 responsabilit\u00E0 del medico veterinario abilitato al sistema nazionale.' },
    { q: 'Come funzionano i pagamenti?', a: 'I pagamenti per visite e servizi avvengono direttamente con la clinica, secondo i metodi da essa previsti. VetBuddy non gestisce pagamenti per servizi veterinari.' },
    { q: 'I miei dati sono al sicuro?', a: 'S\u00EC. VetBuddy utilizza crittografia avanzata e opera nel rispetto della normativa sulla protezione dei dati.' }
  ],

  contacts: {
    website: 'www.vetbuddy.it',
    email: 'support@vetbuddy.it'
  }
};

// ==========================================================================
//  TUTORIAL CLINICA
// ==========================================================================
const clinicTutorial = {
  title: 'VetBuddy \u2014 Guida per Cliniche Veterinarie',
  subtitle: 'La piattaforma digitale che semplifica la gestione quotidiana della clinica.',

  quickStart: [
    'Registrati come clinica su vetbuddy.it',
    'Completa il profilo e configura i servizi',
    'Attiva il link di prenotazione e condividilo',
    'Inizia a ricevere e gestire le prenotazioni'
  ],

  sections: [
    {
      title: 'CONFIGURAZIONE INIZIALE',
      content: [
        'Registrati come clinica su vetbuddy.it',
        'Completa il profilo: nome clinica, indirizzo, P.IVA, orari di apertura',
        'Carica il logo e le foto della struttura',
        'Configura i servizi offerti con prezzi e durata stimata',
        'Pilot Milano: Piano Pro Clinica gratuito per 90 giorni',
        'Dopo il periodo gratuito: \u20AC79/mese + IVA (\u20AC49/mese per early adopter)'
      ],
      tip: 'Un profilo completo e professionale aiuta i clienti a scegliere la tua clinica.'
    },
    {
      title: 'LINK DI PRENOTAZIONE DIRETTO',
      content: [
        'Vai su \u201CLink Prenotazione\u201D nel menu laterale',
        'Trovi il link personalizzato della tua clinica',
        'Condividilo su WhatsApp, social, email o sito web',
        'Puoi generare un QR Code da stampare in reception',
        'I clienti possono inviare una richiesta rapida senza registrarsi',
        'Le richieste arrivano nella tua agenda e le confermi tu'
      ],
      tip: 'Il link permette ai clienti di inviare una richiesta rapida. La clinica conferma poi data, orario e disponibilit\u00E0.'
    },
    {
      title: 'GESTIONE APPUNTAMENTI',
      content: [
        'Visualizza il calendario dalla dashboard principale',
        'Gestisci le viste: giornaliera, settimanale o mensile',
        'Clicca su uno slot vuoto per creare un appuntamento',
        'Gestisci le richieste in arrivo: accetta, rifiuta o riprogramma',
        'Aggiungi note interne per ogni appuntamento',
        'Le prenotazioni dal link diretto sono contrassegnate come tali'
      ],
      tip: 'Usa i codici colore per distinguere i tipi di appuntamento e servizio.'
    },
    {
      title: 'GESTIONE CLIENTI E PAZIENTI',
      content: [
        'Accedi a \u201CPazienti\u201D per consultare l\u2019elenco clienti',
        'Visualizza la scheda completa di ogni animale',
        'Consulta lo storico visite, trattamenti e documenti',
        'Importa clienti da file CSV per migrare da altri gestionali',
        'Esporta i dati per backup o per esigenze amministrative'
      ],
      tip: 'La funzione import CSV consente di migrare dati da altri sistemi in modo semplice.'
    },
    {
      title: 'DOCUMENTI E PDF',
      content: [
        'Vai a \u201CDocumenti\u201D dalla dashboard',
        'Crea documenti: prescrizioni, referti, certificati, vaccinazioni',
        'Carica PDF esistenti o genera da template',
        'Associa il documento al paziente e al proprietario',
        'Il documento viene inviato automaticamente via email'
      ],
      tip: 'I documenti digitali aiutano a ridurre richieste ripetitive e telefonate non necessarie.'
    },
    {
      title: 'LAB MARKETPLACE \u2014 ANALISI DI LABORATORIO',
      content: [
        'Vai su \u201CAnalisi Lab\u201D nel menu laterale',
        'Sfoglia i laboratori partner disponibili nel marketplace',
        'Crea una richiesta di analisi selezionando paziente ed esame',
        'Segui lo stato della richiesta in tempo reale',
        'Ricevi il referto quando il laboratorio lo carica',
        'Rivedi il referto, aggiungi note cliniche e decidi quando renderlo visibile al proprietario'
      ],
      tip: 'I referti di laboratorio restano riservati fino a quando non li rivedi e li approvi. Il proprietario vede solo ci\u00F2 che tu decidi di pubblicare.'
    },
    {
      title: 'RICETTE ELETTRONICHE VETERINARIE (REV)',
      content: [
        'Vai su \u201CPrescrizioni REV\u201D nel menu laterale',
        'Prepara la bozza con il wizard guidato: paziente, farmaci, posologia, diagnosi',
        'Completa l\u2019emissione ufficiale sul portale del sistema nazionale (es. Vetinfo)',
        'Registra il numero ricetta e PIN in VetBuddy',
        'Pubblica al proprietario quando opportuno: riceve email e consulta nel profilo',
        'Dashboard statistiche: bozze, emesse, errori, totale',
        'Audit trail completo di ogni passaggio',
        'Configura il modulo da \u201CImpostazioni REV\u201D'
      ],
      tip: 'L\u2019emissione ufficiale della REV richiede l\u2019abilitazione del medico veterinario al sistema nazionale. VetBuddy prepara, organizza e archivia il flusso, ma non sostituisce il sistema pubblico di emissione.'
    },
    {
      title: 'FATTURAZIONE PROFORMA',
      content: [
        'Vai a \u201CFatturazione\u201D nella dashboard',
        'Crea una nuova fattura proforma selezionando il cliente',
        'Aggiungi servizi prestati con prezzi e quantit\u00E0',
        'Genera il documento PDF con tutti i dati',
        'Esporta i dati per backup o per esigenze amministrative'
      ],
      tip: 'Le fatture proforma sono documenti di cortesia e non hanno valore fiscale. La fattura fiscale va emessa secondo le normative vigenti.'
    },
    {
      title: 'DASHBOARD METRICHE',
      content: [
        'Vai su \u201CMetriche\u201D nel menu laterale',
        'Visualizza i dati principali: appuntamenti, pazienti, documenti',
        'Consulta l\u2019andamento nel tempo',
        'Analizza le prenotazioni per canale di provenienza',
        'Monitora le richieste lab e lo stato di completamento'
      ],
      tip: 'Le metriche aiutano a comprendere il valore generato dalla piattaforma e a identificare aree di miglioramento.'
    },
    {
      title: 'ABBONAMENTO E PAGAMENTI',
      content: [
        'Vai su \u201CImpostazioni\u201D -> \u201CAbbonamento\u201D',
        'Starter Clinica: \u20AC0/mese (funzionalit\u00E0 base, 1 utente)',
        'Pro Clinica: \u20AC79/mese + IVA (\u20AC49/mese per early adopter)',
        'Pilot Milano: Piano Pro gratuito per 90 giorni',
        'Pagamento sicuro con carta tramite Stripe',
        'I pagamenti dei clienti alla clinica non passano da VetBuddy',
        'VetBuddy incassa esclusivamente l\u2019abbonamento della piattaforma'
      ],
      tip: 'Tutti i prezzi indicati sono IVA esclusa. Puoi annullare l\u2019abbonamento in qualsiasi momento.'
    },
    {
      title: 'AUTOMAZIONI (PIANO PRO)',
      content: [
        'Promemoria automatici prima dell\u2019appuntamento via email',
        'Follow-up post visita con istruzioni personalizzabili',
        'Reminder per vaccini e controlli periodici',
        'Report settimanale automatico con riepilogo attivit\u00E0',
        'Notifiche per nuove richieste dal Lab Marketplace'
      ],
      tip: 'Le automazioni aiutano la clinica a risparmiare tempo nelle attivit\u00E0 ripetitive e a mantenere una comunicazione costante con i clienti.'
    }
  ],

  onboarding: {
    title: 'PRIME AZIONI CONSIGLIATE PER IL TEAM CLINICO',
    subtitle: 'Segui questi passaggi per configurare VetBuddy al meglio e iniziare a lavorare.',
    first10: {
      title: 'Cosa fare nei primi 10 minuti',
      items: [
        'Completa il profilo clinica con logo, indirizzo e orari',
        'Configura almeno 3 servizi con durata e prezzo',
        'Attiva il link di prenotazione e prova ad aprirlo',
        'Verifica che la pagina pubblica della clinica sia corretta'
      ]
    },
    firstWeek: {
      title: 'Cosa attivare nella prima settimana',
      items: [
        'Importa i clienti esistenti tramite CSV (se necessario)',
        'Condividi il link di prenotazione ai primi clienti',
        'Prova a creare un appuntamento di test',
        'Carica un documento di prova e verifica l\u2019invio al cliente',
        'Attiva il modulo REV da \u201CImpostazioni REV\u201D e scegli la modalit\u00E0',
        'Configura il team: aggiungi collaboratori con i rispettivi ruoli',
        'Verifica la dashboard metriche'
      ]
    },
    checklist: {
      title: 'Checklist finale di configurazione',
      items: [
        'Profilo clinica completato (logo, foto, orari, indirizzo)',
        'Servizi configurati con prezzi e durate',
        'Link di prenotazione attivato e testato',
        'Clienti importati o primi pazienti inseriti',
        'Modulo REV configurato (modalit\u00E0 guidata/manuale)',
        'Documento di prova creato e inviato',
        'Prenotazione di test completata',
        'Dashboard metriche verificata',
        'Team informato su ruoli e permessi'
      ]
    }
  },

  faqs: [
    { q: 'Quanto costa VetBuddy per la clinica?', a: 'Starter Clinica: \u20AC0/mese. Pro Clinica: \u20AC79/mese + IVA (\u20AC49/mese per early adopter). Pilot Milano: Pro gratuito per 90 giorni. Prezzi IVA esclusa.' },
    { q: 'Come funziona il link di prenotazione?', a: '\u00C8 un link condivisibile che permette ai clienti di inviare una richiesta rapida senza registrarsi. La clinica conferma poi data e orario.' },
    { q: 'I pagamenti dei clienti passano da VetBuddy?', a: 'No. I pagamenti per visite e servizi avvengono direttamente tra clinica e cliente. VetBuddy incassa esclusivamente l\u2019abbonamento della piattaforma.' },
    { q: 'Come funziona il Lab Marketplace?', a: 'Scegli un laboratorio partner, invia la richiesta di analisi, ricevi il referto e decidine la pubblicazione al proprietario dopo la tua revisione.' },
    { q: 'VetBuddy emette direttamente la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy supporta la preparazione, l\u2019organizzazione e l\u2019archiviazione del flusso prescrittivo. L\u2019emissione ufficiale richiede l\u2019abilitazione del medico veterinario al sistema nazionale.' },
    { q: 'Le fatture proforma hanno valore fiscale?', a: 'No. Sono documenti di cortesia. La fattura fiscale va emessa secondo le normative vigenti.' },
    { q: 'Posso importare dati dal gestionale attuale?', a: 'S\u00EC. VetBuddy supporta l\u2019importazione da file CSV.' },
    { q: 'Posso annullare l\u2019abbonamento?', a: 'S\u00EC, in qualsiasi momento, senza vincoli o penali.' }
  ],

  contacts: {
    website: 'www.vetbuddy.it',
    email: 'support@vetbuddy.it'
  }
};

// ==========================================================================
//  TUTORIAL LABORATORIO
// ==========================================================================
const labTutorial = {
  title: 'VetBuddy \u2014 Guida per Laboratori di Analisi',
  subtitle: 'Il marketplace che connette il tuo laboratorio alle cliniche veterinarie partner.',

  quickStart: [
    'Registrati come laboratorio su vetbuddy.it',
    'Completa il profilo e inserisci il listino prezzi',
    'Configura il collegamento pagamenti',
    'Inizia a ricevere richieste dalle cliniche'
  ],

  sections: [
    {
      title: 'CONFIGURAZIONE INIZIALE',
      content: [
        'Registrati come laboratorio su vetbuddy.it',
        'Completa il profilo: nome, indirizzo, P.IVA, telefono',
        'Aggiungi descrizione, specializzazioni e area geografica',
        'Indica se offri il servizio di ritiro campioni a domicilio',
        'Il tuo profilo sar\u00E0 visibile alle cliniche nel marketplace'
      ],
      tip: 'Un profilo completo e dettagliato migliora la visibilit\u00E0 verso le cliniche partner.'
    },
    {
      title: 'COLLEGAMENTO PAGAMENTI',
      content: [
        'VetBuddy utilizza Stripe per gestire i pagamenti tra cliniche e laboratori',
        'Dalla dashboard, vai su \u201CProfilo\u201D -> \u201CPagamenti\u201D',
        'Segui la procedura guidata per collegare il tuo account Stripe',
        'Autorizza VetBuddy a ricevere i dati necessari tramite collegamento sicuro',
        'Non \u00E8 necessario condividere manualmente chiavi o credenziali',
        'Il collegamento pagamenti \u00E8 disponibile quando attivato per il tuo account'
      ],
      tip: 'Il collegamento avviene tramite procedura guidata e sicura. Non devi mai condividere chiavi segrete o password.'
    },
    {
      title: 'LISTINO PREZZI',
      content: [
        'Vai su \u201CListino Prezzi\u201D nel menu laterale',
        'Crea categorie di esami (es. Ematologia, Biochimica, Microbiologia)',
        'Per ogni esame indica: nome, codice, prezzo e tempi medi di consegna',
        'Il listino \u00E8 visibile alle cliniche che consultano il marketplace',
        'Puoi aggiornare i prezzi e i tempi in qualsiasi momento'
      ],
      tip: 'Un listino chiaro e aggiornato facilita la scelta delle cliniche e aumenta le richieste.'
    },
    {
      title: 'GESTIONE RICHIESTE',
      content: [
        'Le richieste dalle cliniche arrivano nella tua dashboard',
        'Per ogni richiesta vedi: paziente, tipo di esame, clinica richiedente',
        'Aggiorna lo stato: Ricevuta -> In lavorazione -> Completata',
        'Puoi inviare un preventivo personalizzato alla clinica',
        'La clinica accetta il preventivo e procede al pagamento'
      ],
      tip: 'Aggiornare lo stato in tempo reale aiuta a mantenere una comunicazione chiara con la clinica.'
    },
    {
      title: 'CARICAMENTO REFERTI',
      content: [
        'Quando l\u2019analisi \u00E8 completata, carica il referto in formato PDF',
        'Puoi aggiungere note tecniche a corredo del referto',
        'La clinica riceve una notifica e il veterinario rivede il referto',
        'Solo dopo la revisione del veterinario il referto pu\u00F2 essere reso visibile al proprietario',
        'Tutti i referti caricati restano archiviati nel sistema'
      ],
      tip: 'La condivisione del referto al proprietario \u00E8 gestita dalla clinica, non dal laboratorio. Il veterinario aggiunge note cliniche prima della pubblicazione.'
    },
    {
      title: 'FATTURAZIONE',
      content: [
        'Quando la clinica accetta e paga un preventivo, il pagamento arriva sul tuo conto Stripe',
        'Una fattura proforma viene generata automaticamente da VetBuddy',
        'Le fatture proforma sono documenti di cortesia e non hanno valore fiscale',
        'La fattura fiscale va emessa dal laboratorio secondo le normative vigenti',
        'Puoi consultare e scaricare tutte le fatture proforma dalla sezione \u201CFatture\u201D'
      ],
      tip: 'Le fatture proforma sono documenti non fiscali. Ricorda di emettere fattura fiscale autonomamente per ogni transazione.'
    },
    {
      title: 'DASHBOARD E METRICHE',
      content: [
        'La dashboard mostra una panoramica delle attivit\u00E0 del laboratorio',
        'Richieste ricevute, in lavorazione e completate',
        'Andamento delle richieste nel tempo',
        'Cliniche partner attive e nuove collaborazioni',
        'Tempi medi di consegna dei referti'
      ],
      tip: 'Le metriche aiutano a monitorare le performance e a identificare opportunit\u00E0 di miglioramento nel servizio.'
    },
    {
      title: 'ABBONAMENTO',
      content: [
        'Piano Lab Partner: \u20AC29/mese + IVA',
        'Gratuito per i primi 6 mesi o le prime 50 richieste ricevute',
        'Include: profilo nel marketplace, gestione richieste, fatturazione, dashboard',
        'Pagamento dell\u2019abbonamento tramite Stripe',
        'Puoi annullare in qualsiasi momento senza vincoli'
      ],
      tip: 'Tutti i prezzi indicati sono IVA esclusa.'
    }
  ],

  onboarding: {
    title: 'COME RENDERE IL TUO LABORATORIO PI\u00D9 VISIBILE',
    subtitle: 'Segui questi passaggi per ottimizzare il profilo e iniziare a ricevere richieste.',
    first10: {
      title: 'Cosa fare nei primi 10 minuti',
      items: [
        'Completa il profilo laboratorio con tutti i dettagli',
        'Inserisci almeno le categorie e gli esami principali nel listino',
        'Indica i tempi medi di consegna per ciascun esame'
      ]
    },
    firstWeek: {
      title: 'Cosa attivare nella prima settimana',
      items: [
        'Definisci l\u2019area geografica di operativit\u00E0',
        'Indica se offri il ritiro campioni a domicilio',
        'Completa il collegamento pagamenti tramite procedura guidata',
        'Prova a ricevere e gestire una richiesta di test',
        'Prova a caricare un referto di esempio',
        'Verifica la dashboard metriche'
      ]
    },
    checklist: {
      title: 'Checklist finale di configurazione',
      items: [
        'Profilo laboratorio completo (nome, indirizzo, P.IVA, descrizione)',
        'Listino prezzi con almeno le categorie principali',
        'Tempi di consegna indicati per ogni esame',
        'Disponibilit\u00E0 ritiro campioni specificata',
        'Collegamento pagamenti configurato (se disponibile)',
        'Richiesta di test ricevuta e gestita',
        'Referto di prova caricato',
        'Dashboard metriche verificata'
      ]
    }
  },

  faqs: [
    { q: 'Quanto costa VetBuddy per il laboratorio?', a: 'Piano Lab Partner: \u20AC29/mese + IVA. Gratuito per i primi 6 mesi o le prime 50 richieste. Prezzi IVA esclusa.' },
    { q: 'Come ricevo i pagamenti dalle cliniche?', a: 'I pagamenti arrivano direttamente sul tuo conto tramite Stripe. VetBuddy non trattiene commissioni sui pagamenti tra clinica e laboratorio.' },
    { q: 'Posso iscrivermi senza invito?', a: 'S\u00EC. Puoi registrarti gratuitamente come Laboratorio Partner.' },
    { q: 'Le fatture proforma sono documenti fiscali?', a: 'No. Le fatture proforma generate da VetBuddy sono documenti di cortesia. La fattura fiscale va emessa dal laboratorio secondo le normative vigenti.' },
    { q: 'Chi vede i referti che carico?', a: 'Il referto viene prima revisionato dal veterinario della clinica. Solo dopo la revisione del veterinario pu\u00F2 essere reso visibile al proprietario dell\u2019animale.' },
    { q: 'Posso annullare l\u2019abbonamento?', a: 'S\u00EC, in qualsiasi momento, senza vincoli o penali.' }
  ],

  contacts: {
    website: 'www.vetbuddy.it',
    email: 'support@vetbuddy.it'
  }
};

// ==========================================================================
//  PDF GENERATION (PROFESSIONAL STYLE)
// ==========================================================================
async function generateTutorialPDF(tutorial) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const lineHeight = 14;
  const sectionGap = 25;

  // Colors
  const coralColor = rgb(0.96, 0.42, 0.42);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const mediumGray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.7, 0.7, 0.7);
  const bgLight = rgb(0.97, 0.97, 0.97);

  // Helper: Add new page
  const addPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    return { page, y: pageHeight - margin };
  };

  // Helper: Draw wrapped text
  const drawWrappedText = (page, text, x, y, maxWidth, fontSize, textFont, color) => {
    const safeText = sanitizeText(text);
    const words = safeText.split(' ');
    let currentLine = '';
    let currentY = y;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = textFont.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth && currentLine) {
        page.drawText(currentLine, { x, y: currentY, size: fontSize, font: textFont, color });
        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, { x, y: currentY, size: fontSize, font: textFont, color });
      currentY -= lineHeight;
    }

    return currentY;
  };

  // ==================== PAGE 1: COVER ====================
  let { page, y } = addPage();

  page.drawRectangle({
    x: 0, y: pageHeight - 120, width: pageWidth, height: 120,
    color: coralColor
  });

  // Brand: "VetBuddy" with consistent casing
  page.drawText('Vet', {
    x: margin, y: pageHeight - 70, size: 36, font: boldFont, color: rgb(1, 1, 1)
  });
  page.drawText('Buddy', {
    x: margin + boldFont.widthOfTextAtSize('Vet', 36), y: pageHeight - 70, size: 36, font: font, color: rgb(1, 1, 1)
  });

  // Dynamic subtitle
  let coverSubtitle = 'Guida per Proprietari di Animali';
  if (tutorial.title.includes('Cliniche')) coverSubtitle = 'Guida per Cliniche Veterinarie';
  else if (tutorial.title.includes('Laboratori')) coverSubtitle = 'Guida per Laboratori di Analisi';

  page.drawText(sanitizeText(coverSubtitle), {
    x: margin, y: pageHeight - 100, size: 14, font: font, color: rgb(1, 1, 1)
  });

  y = pageHeight - 170;

  y = drawWrappedText(page, tutorial.subtitle, margin, y, contentWidth, 16, font, darkGray);
  y -= 40;

  // Quick Start Box
  page.drawRectangle({
    x: margin, y: y - 120, width: contentWidth, height: 130,
    color: bgLight
  });
  page.drawRectangle({
    x: margin, y: y - 120, width: 4, height: 130,
    color: coralColor
  });

  page.drawText('PER INIZIARE', {
    x: margin + 20, y: y - 20, size: 12, font: boldFont, color: coralColor
  });

  let qsY = y - 45;
  tutorial.quickStart.forEach((step, i) => {
    page.drawText(`${i + 1}.`, {
      x: margin + 20, y: qsY, size: 11, font: boldFont, color: coralColor
    });
    page.drawText(sanitizeText(step), {
      x: margin + 40, y: qsY, size: 11, font: font, color: darkGray
    });
    qsY -= 20;
  });

  y -= 160;

  page.drawText(`Generato il ${new Date().toLocaleDateString('it-IT')}`, {
    x: margin, y: margin + 20, size: 9, font: font, color: lightGray
  });
  page.drawText('www.vetbuddy.it', {
    x: pageWidth - margin - 80, y: margin + 20, size: 9, font: boldFont, color: coralColor
  });

  // ==================== PAGE 2: INDEX ====================
  ({ page, y } = addPage());

  page.drawText('INDICE', {
    x: margin, y, size: 18, font: boldFont, color: coralColor
  });
  y -= 30;

  tutorial.sections.forEach((section, i) => {
    page.drawText(`${i + 1}. ${sanitizeText(section.title)}`, {
      x: margin, y, size: 11, font: font, color: darkGray
    });
    y -= 20;
  });

  y -= 10;
  let idxNum = tutorial.sections.length + 1;
  if (tutorial.onboarding) {
    page.drawText(`${idxNum}. ${sanitizeText(tutorial.onboarding.title)}`, {
      x: margin, y, size: 11, font: font, color: darkGray
    });
    y -= 20;
    idxNum++;
  }
  page.drawText(`${idxNum}. DOMANDE FREQUENTI`, {
    x: margin, y, size: 11, font: font, color: darkGray
  });
  y -= 20;
  page.drawText(`${idxNum + 1}. CONTATTI E SUPPORTO`, {
    x: margin, y, size: 11, font: font, color: darkGray
  });

  // ==================== CONTENT SECTIONS ====================
  // Always start content on a new page after index
  ({ page, y } = addPage());

  for (let i = 0; i < tutorial.sections.length; i++) {
    const section = tutorial.sections[i];

    // Check if we need a new page
    if (y < 250) {
      ({ page, y } = addPage());
    }

    y -= sectionGap;

    page.drawRectangle({
      x: margin, y: y - 5, width: contentWidth, height: 30,
      color: coralColor
    });

    page.drawText(`${i + 1}. ${sanitizeText(section.title)}`, {
      x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
    });

    y -= 40;

    for (const item of section.content) {
      if (y < 100) {
        ({ page, y } = addPage());
      }

      page.drawText('-', {
        x: margin, y, size: 10, font: font, color: coralColor
      });

      y = drawWrappedText(page, item, margin + 15, y, contentWidth - 15, 10, font, darkGray);
      y -= 6;
    }

    if (section.tip) {
      y -= 10;

      if (y < 80) {
        ({ page, y } = addPage());
      }

      // Measure tip height
      const tipLines = Math.ceil(sanitizeText(section.tip).length / 70);
      const tipBoxHeight = Math.max(40, 22 + tipLines * 14);

      page.drawRectangle({
        x: margin, y: y - tipBoxHeight + 10, width: contentWidth, height: tipBoxHeight,
        color: bgLight
      });

      page.drawText('Nota:', {
        x: margin + 10, y: y - 10, size: 9, font: boldFont, color: coralColor
      });

      drawWrappedText(page, section.tip, margin + 10, y - 22, contentWidth - 20, 9, font, mediumGray);

      y -= tipBoxHeight + 10;
    }
  }

  // ==================== ONBOARDING SECTION ====================
  if (tutorial.onboarding) {
    const ob = tutorial.onboarding;
    ({ page, y } = addPage());

    // Section header - CORAL
    page.drawRectangle({
      x: margin, y: y - 5, width: contentWidth, height: 30,
      color: coralColor
    });

    const obIdx = tutorial.sections.length + 1;
    page.drawText(`${obIdx}. ${sanitizeText(ob.title)}`, {
      x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
    });

    y -= 45;
    y = drawWrappedText(page, ob.subtitle, margin, y, contentWidth, 10, font, mediumGray);
    y -= 20;

    // First 10 minutes
    page.drawText(sanitizeText(ob.first10.title), {
      x: margin, y, size: 11, font: boldFont, color: darkGray
    });
    y -= 20;

    for (const item of ob.first10.items) {
      if (y < 80) ({ page, y } = addPage());
      page.drawText('-', { x: margin + 10, y, size: 10, font: font, color: coralColor });
      y = drawWrappedText(page, item, margin + 25, y, contentWidth - 25, 10, font, darkGray);
      y -= 6;
    }

    y -= 15;

    // First week
    if (y < 200) ({ page, y } = addPage());
    page.drawText(sanitizeText(ob.firstWeek.title), {
      x: margin, y, size: 11, font: boldFont, color: darkGray
    });
    y -= 20;

    for (const item of ob.firstWeek.items) {
      if (y < 80) ({ page, y } = addPage());
      page.drawText('-', { x: margin + 10, y, size: 10, font: font, color: coralColor });
      y = drawWrappedText(page, item, margin + 25, y, contentWidth - 25, 10, font, darkGray);
      y -= 6;
    }

    y -= 15;

    // Checklist
    if (y < 200) ({ page, y } = addPage());

    const checklistHeight = ob.checklist.items.length * 18 + 40;
    page.drawRectangle({
      x: margin, y: y - checklistHeight + 10, width: contentWidth,
      height: checklistHeight,
      color: bgLight
    });

    page.drawText(sanitizeText(ob.checklist.title), {
      x: margin + 10, y, size: 11, font: boldFont, color: coralColor
    });
    y -= 22;

    for (const item of ob.checklist.items) {
      if (y < 60) ({ page, y } = addPage());
      page.drawText('[ ]', { x: margin + 10, y, size: 10, font: font, color: coralColor });
      page.drawText(sanitizeText(item), { x: margin + 32, y, size: 10, font: font, color: darkGray });
      y -= 18;
    }

    y -= 15;
  }

  // ==================== FAQ PAGE (always new page) ====================
  ({ page, y } = addPage());

  page.drawRectangle({
    x: margin, y: y - 5, width: contentWidth, height: 30,
    color: coralColor
  });

  const faqIdx = tutorial.sections.length + (tutorial.onboarding ? 2 : 1);
  page.drawText(`${faqIdx}. DOMANDE FREQUENTI`, {
    x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
  });

  y -= 45;

  for (const faq of tutorial.faqs) {
    if (y < 100) {
      ({ page, y } = addPage());
    }

    y = drawWrappedText(page, `D: ${faq.q}`, margin, y, contentWidth, 10, boldFont, darkGray);
    y -= 4;

    y = drawWrappedText(page, `R: ${faq.a}`, margin, y, contentWidth, 10, font, mediumGray);
    y -= 15;
  }

  // ==================== CONTACT PAGE ====================
  if (y < 250) {
    ({ page, y } = addPage());
  }

  y -= sectionGap;

  page.drawRectangle({
    x: margin, y: y - 5, width: contentWidth, height: 30,
    color: coralColor
  });

  page.drawText(`${faqIdx + 1}. CONTATTI E SUPPORTO`, {
    x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
  });

  y -= 50;

  page.drawText('Sito web:', {
    x: margin, y, size: 10, font: boldFont, color: darkGray
  });
  page.drawText(sanitizeText(tutorial.contacts.website), {
    x: margin + 80, y, size: 10, font: font, color: coralColor
  });

  y -= 20;

  page.drawText('Email:', {
    x: margin, y, size: 10, font: boldFont, color: darkGray
  });
  page.drawText(sanitizeText(tutorial.contacts.email), {
    x: margin + 80, y, size: 10, font: font, color: coralColor
  });

  y -= 40;

  page.drawText('Per assistenza puoi contattarci via email o tramite la piattaforma.', {
    x: margin, y, size: 10, font: font, color: mediumGray
  });

  // ==================== ADD PAGE NUMBERS & FOOTER ====================
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];

    pg.drawRectangle({
      x: margin, y: 15, width: contentWidth, height: 0.5,
      color: rgb(0.9, 0.9, 0.9)
    });

    if (i > 0) {
      pg.drawText(`Pagina ${i}`, {
        x: pageWidth / 2 - 20, y: 5, size: 8, font: font, color: lightGray
      });
    }

    // Footer brand: "VetBuddy"
    pg.drawText('Vet', {
      x: margin, y: 5, size: 8, font: boldFont, color: darkGray
    });
    pg.drawText('Buddy', {
      x: margin + boldFont.widthOfTextAtSize('Vet', 8), y: 5, size: 8, font: font, color: coralColor
    });
  }

  return await pdfDoc.save();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'owner';

    let tutorial, filename;
    if (type === 'clinic') {
      tutorial = clinicTutorial;
      filename = 'VetBuddy_Guida_Cliniche.pdf';
    } else if (type === 'lab') {
      tutorial = labTutorial;
      filename = 'VetBuddy_Guida_Laboratori.pdf';
    } else {
      tutorial = ownerTutorial;
      filename = 'VetBuddy_Guida_Proprietari.pdf';
    }

    const pdfBytes = await generateTutorialPDF(tutorial);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error('Tutorial PDF generation error:', error);
    return NextResponse.json(
      { error: 'Errore durante la generazione del PDF', details: error.message },
      { status: 500 }
    );
  }
}
