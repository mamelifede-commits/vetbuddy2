// tutorial-content.js - Tutorial data for all roles (clinic, lab, owner)

// ==========================================================================
//  TUTORIAL PROPRIETARIO
// ==========================================================================
export const ownerTutorial = {
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
      title: 'MODULO PRE-VISITA CON FOTO E VIDEO',
      content: [
        'Quando prenoti una visita puoi ricevere via email il modulo pre-visita',
        'Compila da smartphone: motivo della visita, sintomi, farmaci, alimentazione',
        'Indica l\u2019urgenza percepita: se \u00E8 alta, la clinica viene avvisata subito',
        'Allega fino a 3 foto o video (max 20MB ciascuno): la zona interessata o il comportamento del tuo animale',
        'Il veterinario legge tutto prima della visita e arriva preparato'
      ],
      tip: 'Un breve video del sintomo (es. zoppia, tosse) vale pi\u00F9 di mille parole: caricalo nel modulo pre-visita.'
    },
    {
      title: 'CONSENSI DIGITALI',
      content: [
        'Prima di una procedura (es. chirurgia o anestesia) la clinica pu\u00F2 inviarti un consenso da firmare',
        'Ricevi il link via email e firmi direttamente dallo smartphone in 1 minuto',
        'Niente carta, niente attese in accettazione il giorno della procedura',
        'Se dimentichi di firmare, ricevi un promemoria automatico prima dell\u2019appuntamento'
      ],
      tip: 'Firma il consenso appena lo ricevi: risparmi tempo a te e alla clinica.'
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
    },
    {
      title: 'PIANI SALUTE',
      content: [
        'La clinica pu\u00F2 assegnarti un piano salute per il tuo animale',
        'I piani includono servizi programmati: visite, vaccini, esami, trattamenti',
        'Esempi: Piano Cucciolo (0-12 mesi), Piano Senior (7+ anni), Piano Prevenzione Annuale',
        'Ricevi promemoria quando un servizio del piano \u00E8 in scadenza',
        'Puoi monitorare il progresso del piano nella scheda del tuo animale',
        'I piani aiutano a non dimenticare nessun controllo importante'
      ],
      tip: 'Chiedi al tuo veterinario se c\u2019\u00E8 un piano salute adatto al tuo animale.'
    },
    {
      title: 'VETBUDDY CONNECT \u2014 INVITA LA TUA CLINICA',
      content: [
        'VetBuddy Connect collega proprietari, cliniche e laboratori in un\u2019unica rete',
        'Vai su "Invita la tua clinica" o "VetBuddy Connect" dalla sidebar',
        'Inserisci nome clinica, email, telefono (riceve email + WhatsApp automatici)',
        'La clinica accetta con un click e si collega al Passport del tuo animale',
        'Tracking automatico stato invito: inviato \u2192 aperto \u2192 accettato',
        'Una volta collegata, ricevi promemoria, documenti e referti automaticamente',
        'Puoi anche condividere temporaneamente il Passport con pet sitter o familiari'
      ],
      tip: 'Tre attori, un solo ecosistema: tu, la tua clinica e i laboratori. Pi\u00F9 sono collegati, pi\u00F9 semplice la gestione della salute del tuo animale.'
    }
  ],
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
export const clinicTutorial = {
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
        'Pilot Milano: Piano Growth gratuito per 90 giorni',
        'Piani disponibili: Starter \u20AC29/mese, Growth \u20AC69/mese, Pro \u20AC99/mese (IVA esclusa)'
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
        'Starter: \u20AC29/mese + IVA (1 utente, funzionalit\u00E0 base, fino a 30 prenotazioni/mese)',
        'Growth: \u20AC69/mese + IVA (fino a 5 utenti, prenotazioni illimitate, tutti i moduli)',
        'Pro: \u20AC99/mese + IVA (fino a 15 utenti, automazioni avanzate, AI, piani salute)',
        'Pilot Milano: Piano Growth gratuito per 90 giorni',
        'Pagamento sicuro con carta tramite Stripe',
        'I pagamenti dei clienti alla clinica non passano da VetBuddy',
        'Puoi annullare l\u2019abbonamento in qualsiasi momento senza vincoli'
      ],
      tip: 'Tutti i prezzi indicati sono IVA esclusa. VetBuddy non \u00E8 un gestionale: \u00E8 un copilota operativo che lavora accanto ai tuoi strumenti attuali.'
    },
    {
      title: 'AUTOMAZIONI CONFIGURABILI',
      content: [
        'Oltre 60 automazioni attive su email e notifiche: promemoria appuntamenti, richiami vaccini, follow-up post visita',
        'Anti no-show: previsione rischio sui clienti con storico assenze, promemoria extra e task di conferma telefonica per lo staff',
        'Recupero valore: clienti dormienti (6/9/12 mesi), slot liberati offerti alla lista d\u2019attesa, preventivi in scadenza',
        'Cura del paziente: follow-up post-operatorio (24h/3gg/7gg), fine terapia, alert variazione peso, promemoria igiene dentale annuale',
        'Magazzino: alert scorte minime e prodotti in scadenza dallo Stock Vaccini',
        'Relazione: compleanni, programma referral \u201Cporta un amico\u201D, messaggio di vicinanza dopo la perdita di un animale',
        'Morning Briefing: ogni mattina la giornata della clinica in 30 secondi via email',
        'Attiva/disattiva ogni automazione singolarmente da \u201CAutomazioni\u201D',
        'Cronologia esecuzioni: vedi quando ogni automazione si \u00E8 attivata e per chi'
      ],
      tip: 'Le automazioni lavorano ogni notte: trovi gli esiti nella Cronologia e i task generati nel Task Manager Staff.'
    },
    {
      title: 'TASK MANAGER STAFF',
      content: [
        'Vai su \u201CTask Manager\u201D nel menu laterale',
        'Crea task manuali per il team: richiami, preventivi da inviare, documenti da controllare',
        'I task automatici arrivano dalle automazioni: questionario pre-visita con urgenza alta, referto lab fermo da 48h, consenso mancante prima di una procedura, appuntamento a rischio no-show',
        'Ogni task ha categoria, priorit\u00E0, assegnatario e scadenza',
        'Stati: Nuovo -> In lavorazione -> Completato (con tracking di chi completa)',
        'Filtra per priorit\u00E0 o membro dello staff, tab dedicate per task di oggi e scaduti'
      ],
      tip: 'Controlla il Task Manager ogni mattina: i task automatici ti dicono esattamente dove intervenire per non perdere valore.'
    },
    {
      title: 'QUESTIONARI PRE-VISITA E CONSENSI DIGITALI',
      content: [
        'Questionari: invia il modulo pre-visita al proprietario via email (manuale o automatico alla prenotazione)',
        'Il proprietario compila da smartphone: motivo, sintomi, farmaci, urgenza percepita',
        'Pu\u00F2 allegare fino a 3 foto o video (max 20MB) della zona interessata o del comportamento',
        'Urgenza ALTA = alert immediato alla clinica + task automatico di verifica',
        'Rivedi le risposte e gli allegati dal modulo \u201CQuestionari Pre-Visita\u201D prima della visita',
        'Consensi: crea e invia consensi digitali (chirurgia, anestesia, privacy, ecc.) con link di firma',
        'Il proprietario firma da smartphone in 1 minuto; scadenza automatica dopo 30 giorni',
        'Se manca un consenso firmato prima di una procedura, VetBuddy avvisa clinica e proprietario'
      ],
      tip: 'Veterinario preparato + consensi gi\u00E0 firmati = visite pi\u00F9 rapide e zero carta in accettazione.'
    },
    {
      title: 'PIANI SALUTE',
      content: [
        'Crea programmi di prevenzione strutturati per i tuoi pazienti',
        'Usa i template predefiniti: Piano Cucciolo, Piano Senior, Piano Prevenzione Annuale',
        'Personalizza ogni piano con servizi inclusi (visite, vaccini, esami, trattamenti)',
        'Assegna un piano a un paziente e monitora il progresso',
        'Segna i servizi completati con un click',
        'Dashboard con statistiche: piani attivi, pazienti iscritti, servizi prossimi 30gg'
      ],
      tip: 'I piani salute aiutano a fidelizzare i clienti e a generare appuntamenti ricorrenti.'
    },
    {
      title: 'AI ASSISTANT',
      content: [
        'Vai su \u201CAI Assistant\u201D nel menu laterale',
        'Riassumi Visita: genera un riassunto strutturato dalle note cliniche',
        'Scrivi Messaggio: crea comunicazioni professionali per i proprietari',
        'Traduci Note Cliniche: trasforma termini tecnici in linguaggio semplice',
        'Risposta Intelligente: genera risposte ai messaggi dei clienti',
        'Copia il risultato con un click e incollalo dove serve'
      ],
      tip: 'L\u2019AI \u00E8 un assistente: il risultato va sempre rivisto dal medico veterinario prima dell\u2019invio.'
    },
    {
      title: 'TEAM INBOX AVANZATA',
      content: [
        'Gestisci i messaggi dei clienti come ticket di assistenza',
        'Assegna ticket ai membri del team con \u201CPrend in carico\u201D',
        'Cambia stato: Nuovo -> In lavorazione -> Risolto',
        'Imposta la priorit\u00E0: Bassa, Media, Alta',
        'Rispondi usando template rapidi predefiniti',
        'Filtra per stato, priorit\u00E0 o messaggi non letti'
      ],
      tip: 'La Team Inbox aiuta a non perdere nessun messaggio e a coordinare le risposte del team.'
    },
    {
      title: 'DASHBOARD VALORE GENERATO',
      content: [
        'Vai su \u201CValore Generato\u201D nel menu laterale',
        'Visualizza il tempo risparmiato grazie alle automazioni',
        'Conta le telefonate evitate e gli appuntamenti generati',
        'Stima del fatturato generato dalla piattaforma',
        'Dati aggiornati in tempo reale'
      ],
      tip: 'La Dashboard Valore ti aiuta a capire il ritorno sull\u2019investimento di VetBuddy.'
    },
    {
      title: 'VETBUDDY CONNECT \u2014 LA TUA RETE OPERATIVA',
      content: [
        'Modulo unificato per inviti reciproci: proprietari, cliniche e laboratori',
        'Apri "VetBuddy Connect" dalla sidebar \u2014 KPI inviti e azioni rapide',
        'Invita i proprietari: singolo, massivo (incolla email CSV) o link QR condivisibile',
        'Invita un laboratorio partner per inviare richieste e ricevere referti',
        'Tracking automatico: inviato \u2192 aperto \u2192 accettato \u2192 scaduto',
        'WhatsApp + email automatici se inserisci il telefono del destinatario',
        'Reinvio invito e revoca disponibili con un click',
        'Profili provvisori interni per chi non \u00E8 ancora registrato'
      ],
      tip: 'Tre attori, un solo ecosistema. Pi\u00F9 sono collegati alla tua rete, pi\u00F9 valore generi: meno telefonate, pi\u00F9 prenotazioni online, pi\u00F9 referral.'
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
        'Invia un questionario pre-visita di prova e verifica gli allegati foto/video',
        'Controlla il Task Manager: completa i primi task automatici generati',
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
    { q: 'Quanto costa VetBuddy per la clinica?', a: 'Starter \u20AC29/mese, Growth \u20AC69/mese (consigliato), Pro \u20AC99/mese. IVA esclusa. Pilot Milano: Growth gratuito 90 giorni.' },
    { q: 'VetBuddy sostituisce il mio gestionale?', a: 'No. VetBuddy \u00E8 un copilota operativo che lavora accanto ai tuoi strumenti attuali per automatizzare prenotazioni, comunicazioni e follow-up.' },
    { q: 'Come funziona il link di prenotazione?', a: '\u00C8 un link condivisibile che permette ai clienti di inviare una richiesta rapida senza registrarsi. La clinica conferma poi data e orario.' },
    { q: 'I pagamenti dei clienti passano da VetBuddy?', a: 'No. I pagamenti per visite e servizi avvengono direttamente tra clinica e cliente. VetBuddy incassa solo l\u2019abbonamento.' },
    { q: 'Come funziona il Lab Marketplace?', a: 'Scegli un laboratorio partner, invia la richiesta di analisi, ricevi il referto e decidine la pubblicazione al proprietario dopo la tua revisione.' },
    { q: 'VetBuddy emette la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy supporta la preparazione e l\u2019archiviazione del flusso. L\u2019emissione ufficiale \u00E8 responsabilit\u00E0 del medico veterinario al sistema nazionale.' },
    { q: 'Cosa sono i Piani Salute?', a: 'Pacchetti strutturati di servizi (visite, vaccini, esami) assegnabili ai pazienti con tracking del progresso. Ideali per cuccioli, senior e prevenzione.' },
    { q: 'Come funziona il Task Manager Staff?', a: 'Raccoglie i task operativi del team con priorit\u00E0 e scadenze. Oltre ai task manuali, le automazioni creano task automatici: questionario urgente da verificare, referto fermo, consenso mancante, appuntamento a rischio no-show.' },
    { q: 'Il proprietario pu\u00F2 inviare foto o video prima della visita?', a: 'S\u00EC. Nel modulo pre-visita pu\u00F2 allegare fino a 3 foto o video (max 20MB ciascuno) direttamente dallo smartphone. La clinica li vede nel dettaglio del questionario.' },
    { q: 'L\u2019AI Assistant \u00E8 affidabile?', a: 'L\u2019AI genera bozze e suggerimenti. Il risultato va sempre rivisto dal medico veterinario prima di qualsiasi utilizzo.' },
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
export const labTutorial = {
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
        'Se un referto completato resta fermo oltre 48 ore, VetBuddy sollecita automaticamente la clinica',
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
        'Piano Lab Partner: \u20AC39/mese + IVA',
        'Pilot: gratuito per i primi 6 mesi',
        'Include: profilo nel marketplace, gestione richieste, fatturazione, dashboard',
        'Pagamento dell\u2019abbonamento tramite Stripe',
        'Puoi annullare in qualsiasi momento senza vincoli'
      ],
      tip: 'Tutti i prezzi indicati sono IVA esclusa.'
    },
    {
      title: 'VETBUDDY CONNECT \u2014 INVITA LE TUE CLINICHE PARTNER',
      content: [
        'Modulo per inviti reciproci tra cliniche e laboratori',
        'Apri "VetBuddy Connect" dalla sidebar laboratorio',
        'Invita cliniche: singolo o massivo (CSV con nome, email, telefono)',
        'Email + WhatsApp automatici con link di accettazione',
        'Tracking stato invito: inviato \u2192 aperto \u2192 accettato',
        'Una volta accettato, la clinica pu\u00F2 inviarti richieste digitali',
        'Carichi referti PDF, la clinica riceve notifiche automatiche'
      ],
      tip: 'Pilot 6 mesi gratuito + Marketplace VetBuddy: pi\u00F9 cliniche colleghi, pi\u00F9 richieste digitali ricevi.'
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
    { q: 'Quanto costa VetBuddy per il laboratorio?', a: 'Piano Lab Partner: \u20AC39/mese + IVA. Pilot: gratuito per i primi 6 mesi. Prezzi IVA esclusa.' },
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
