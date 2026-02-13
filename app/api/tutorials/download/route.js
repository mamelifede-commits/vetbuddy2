import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

// Helper to sanitize text for PDF (remove unsupported unicode characters)
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/€/g, 'EUR')
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/✅/g, '[OK]')
    .replace(/❌/g, '[X]')
    .replace(/⚠️/g, '[!]')
    .replace(/💡/g, '*')
    .replace(/📱/g, '')
    .replace(/📧/g, '')
    .replace(/📅/g, '')
    .replace(/📊/g, '')
    .replace(/📄/g, '')
    .replace(/📤/g, '')
    .replace(/📝/g, '')
    .replace(/📋/g, '')
    .replace(/📞/g, '')
    .replace(/💬/g, '')
    .replace(/💳/g, '')
    .replace(/💰/g, '')
    .replace(/💉/g, '')
    .replace(/🎁/g, '')
    .replace(/🐾/g, '')
    .replace(/🏥/g, '')
    .replace(/🔐/g, '')
    .replace(/🚀/g, '')
    .replace(/⭐/g, '*')
    .replace(/🎂/g, '')
    .replace(/🔔/g, '')
    .replace(/🤖/g, '')
    .replace(/⚡/g, '')
    .replace(/🩺/g, '')
    .replace(/✂️/g, '')
    .replace(/🦷/g, '')
    .replace(/🔬/g, '')
    .replace(/🎬/g, '')
    .replace(/📹/g, '')
    .replace(/🖼️/g, '')
    .replace(/🎥/g, '')
    .replace(/🎤/g, '')
    .replace(/🌐/g, '')
    .replace(/💻/g, '')
    .replace(/🏆/g, '')
    .replace(/📥/g, '')
    .replace(/⏳/g, '')
    .replace(/🔴/g, '')
    .replace(/🟢/g, '')
    .replace(/🟡/g, '')
    .replace(/⬆️/g, '^')
    .replace(/🆓/g, '[FREE]')
    .replace(/💶/g, '')
    .replace(/👨‍⚕️/g, '')
    .replace(/👤/g, '')
    .replace(/🏠/g, '')
    .replace(/🚐/g, '')
    .replace(/🤝/g, '')
    .replace(/🗺️/g, '')
    .replace(/⏰/g, '')
    .replace(/✨/g, '')
    .replace(/❓/g, '?')
    .replace(/[^\x00-\x7F]/g, ''); // Remove any remaining non-ASCII characters
}

// ==================== OWNER TUTORIAL CONTENT ====================
const ownerTutorial = {
  title: 'VetBuddy',
  subtitle: 'Guida Completa per Proprietari di Animali',
  tagline: 'Tutto quello che devi sapere per gestire la salute dei tuoi amici pelosi',
  
  quickStart: [
    { step: '1', text: 'Registrati gratis su vetbuddy.it' },
    { step: '2', text: 'Aggiungi i tuoi animali al profilo' },
    { step: '3', text: 'Trova una clinica veterinaria' },
    { step: '4', text: 'Prenota la tua prima visita' }
  ],
  
  sections: [
    {
      title: 'REGISTRAZIONE E PRIMO ACCESSO',
      icon: 'user',
      content: [
        'Vai su vetbuddy.it e clicca "Registrati"',
        'Seleziona "Proprietario di Animali"',
        'Inserisci la tua email e crea una password sicura',
        'Conferma l\'email cliccando sul link ricevuto',
        'Completa il profilo con nome, telefono e codice fiscale'
      ],
      tip: 'Puoi anche registrarti rapidamente con il tuo account Google!'
    },
    {
      title: 'AGGIUNGERE I TUOI ANIMALI',
      icon: 'pet',
      content: [
        'Dalla dashboard, clicca su "I Miei Animali"',
        'Premi il pulsante "+" per aggiungere un nuovo animale',
        'Inserisci: nome, specie, razza, data di nascita',
        'Aggiungi peso attuale, numero microchip e foto',
        'Indica eventuali allergie o condizioni particolari',
        'Puoi aggiungere note comportamentali importanti'
      ],
      tip: 'VetBuddy supporta: cani, gatti, conigli, uccelli, rettili, pesci, cavalli e altri!'
    },
    {
      title: 'TROVARE UNA CLINICA VETERINARIA',
      icon: 'map',
      content: [
        'Vai alla sezione "Trova Clinica"',
        'Usa la mappa interattiva per vedere le cliniche vicine',
        'Filtra per citta o servizi offerti',
        'Clicca su una clinica per vedere dettagli e recensioni',
        'Visualizza orari di apertura e contatti',
        'Salva le cliniche preferite per accesso rapido'
      ],
      tip: 'La mappa mostra tutte le cliniche partner in Italia!'
    },
    {
      title: 'PRENOTARE UN APPUNTAMENTO',
      icon: 'calendar',
      content: [
        'Clicca su "Prenota Visita" dalla dashboard',
        'Seleziona la clinica desiderata',
        'Scegli il tipo di servizio (visita, vaccino, chirurgia...)',
        'Seleziona l\'animale per cui stai prenotando',
        'Scegli data e orario tra quelli disponibili',
        'Aggiungi note per il veterinario (sintomi, urgenze)',
        'Conferma la prenotazione e ricevi email di conferma'
      ],
      tip: 'Puoi gestire, modificare o cancellare i tuoi appuntamenti dalla dashboard.'
    },
    {
      title: 'GESTIRE I TUOI DOCUMENTI',
      icon: 'document',
      content: [
        'Accedi a "I Miei Documenti" dalla dashboard',
        'Visualizza prescrizioni, referti e fatture ricevute',
        'Scarica singoli documenti in formato PDF',
        'Scarica TUTTI i documenti in un file ZIP',
        'Organizza i documenti per animale o per data',
        'I documenti della clinica arrivano automaticamente'
      ],
      tip: 'Tutti i tuoi documenti sono sempre disponibili, anche offline!'
    },
    {
      title: 'NOTIFICHE E PROMEMORIA',
      icon: 'bell',
      content: [
        'Ricevi notifiche per appuntamenti in arrivo',
        'Promemoria automatici per vaccini e controlli',
        'Avvisi quando ricevi nuovi documenti',
        'Notifiche via email, app e WhatsApp',
        'Personalizza le preferenze nelle Impostazioni'
      ],
      tip: 'Attiva le notifiche WhatsApp per non perdere mai un promemoria!'
    },
    {
      title: 'PROGRAMMA FEDELTA',
      icon: 'star',
      content: [
        'Accumula punti con ogni prenotazione completata',
        'Ricevi punti bonus per recensioni e referral',
        'Riscatta i punti per sconti sulle visite',
        'Visualizza il tuo saldo punti nella dashboard',
        'Invita amici e guadagna punti extra'
      ],
      tip: 'Ogni 100 punti = 5 EUR di sconto sulla prossima visita!'
    },
    {
      title: 'INSTALLARE L\'APP',
      icon: 'phone',
      content: [
        'VetBuddy funziona come app installabile (PWA)',
        'Su iPhone: Safari -> Condividi -> Aggiungi a Home',
        'Su Android: Chrome -> Menu -> Installa app',
        'L\'app funziona anche offline',
        'Ricevi notifiche push come un\'app nativa'
      ],
      tip: 'L\'app non occupa spazio e si aggiorna automaticamente!'
    }
  ],
  
  faqs: [
    { q: 'Quanto costa usare VetBuddy?', a: 'VetBuddy e completamente GRATUITO per i proprietari di animali. Nessun costo nascosto!' },
    { q: 'Posso usare VetBuddy con qualsiasi clinica?', a: 'Puoi prenotare solo presso le cliniche registrate su VetBuddy. Invita la tua clinica di fiducia!' },
    { q: 'I miei dati sono al sicuro?', a: 'Assolutamente si! Utilizziamo crittografia avanzata e rispettiamo il GDPR.' },
    { q: 'Posso gestire piu animali?', a: 'Si, puoi aggiungere tutti gli animali che desideri al tuo profilo.' },
    { q: 'Come annullo un appuntamento?', a: 'Dalla dashboard, vai su "I Miei Appuntamenti", seleziona l\'appuntamento e clicca "Annulla".' },
    { q: 'Posso caricare documenti per la clinica?', a: 'Si! Puoi caricare foto, referti esterni e documenti nella sezione "I Miei Documenti".' }
  ],
  
  contacts: {
    website: 'www.vetbuddy.it',
    email: 'supporto@vetbuddy.it',
    support: 'Assistente virtuale disponibile 24/7 nella dashboard'
  }
};

// ==================== CLINIC TUTORIAL CONTENT ====================
const clinicTutorial = {
  title: 'VetBuddy',
  subtitle: 'Guida Completa per Cliniche Veterinarie',
  tagline: 'Il gestionale veterinario che semplifica il lavoro quotidiano',
  
  quickStart: [
    { step: '1', text: 'Registrati come clinica' },
    { step: '2', text: 'Configura servizi e orari' },
    { step: '3', text: 'Importa i pazienti esistenti' },
    { step: '4', text: 'Inizia a ricevere prenotazioni' }
  ],
  
  sections: [
    {
      title: 'CONFIGURAZIONE INIZIALE',
      icon: 'settings',
      content: [
        'Registrati come clinica su vetbuddy.it',
        'Completa il profilo: nome clinica, indirizzo, P.IVA, orari',
        'Aggiungi logo e foto della struttura',
        'Configura i servizi offerti con prezzi e durata',
        'Imposta la posizione sulla mappa (indirizzo o coordinate)',
        'Scegli il piano: Starter (gratuito) o Premium'
      ],
      tip: 'Il Piano Starter e perfetto per veterinari freelance. Premium sblocca tutte le automazioni.'
    },
    {
      title: 'GESTIONE SERVIZI E LISTINO',
      icon: 'list',
      content: [
        'Vai a "Impostazioni" -> "Servizi"',
        'Aggiungi servizi: nome, descrizione, prezzo, durata',
        'Categorizza (visite, vaccini, chirurgia, diagnostica...)',
        'Imposta prezzi differenti per specie se necessario',
        'Attiva/disattiva servizi in base alla stagione',
        'I servizi saranno visibili ai clienti durante la prenotazione'
      ],
      tip: 'Servizi ben descritti aumentano le prenotazioni del 40%!'
    },
    {
      title: 'GESTIONE APPUNTAMENTI',
      icon: 'calendar',
      content: [
        'Visualizza il calendario dalla dashboard principale',
        'Vedi appuntamenti: giornalieri, settimanali o mensili',
        'Clicca su uno slot per creare un appuntamento',
        'Gestisci richieste: accetta, rifiuta o riprogramma',
        'Aggiungi note interne per ogni appuntamento',
        'Imposta promemoria automatici via email/WhatsApp'
      ],
      tip: 'Usa i codici colore per distinguere i tipi di appuntamento a colpo d\'occhio.'
    },
    {
      title: 'GESTIONE CLIENTI E PAZIENTI',
      icon: 'users',
      content: [
        'Accedi a "Pazienti" per vedere tutti i clienti',
        'Visualizza la scheda completa di ogni animale',
        'Consulta lo storico visite e trattamenti',
        'Aggiungi note, allergie e patologie croniche',
        'IMPORTA clienti esistenti da file CSV',
        'Esporta i dati per backup o analisi'
      ],
      tip: 'La funzione import CSV permette di migrare da altri gestionali in pochi minuti.'
    },
    {
      title: 'DOCUMENTI E PRESCRIZIONI',
      icon: 'document',
      content: [
        'Vai a "Documenti" dalla dashboard',
        'Crea: prescrizioni, referti, certificati, vaccinazioni',
        'Carica PDF esistenti o genera da template',
        'Associa il documento al paziente e proprietario',
        'Il documento viene inviato automaticamente via email',
        'Il cliente lo ritrova anche nell\'app VetBuddy'
      ],
      tip: 'I documenti digitali riducono le chiamate "ho perso la prescrizione" del 90%!'
    },
    {
      title: 'FATTURAZIONE PROFORMA',
      icon: 'invoice',
      content: [
        'Vai a "Fatturazione" nella dashboard',
        'Crea nuova fattura PROFORMA selezionando il cliente',
        'Aggiungi servizi prestati con prezzi e quantita',
        'Applica IVA 22% e marca da bollo se necessario',
        'Genera PDF professionale con tutti i dati',
        'Invia via email o salva per stampa',
        'Esporta in CSV, JSON o PDF per il commercialista'
      ],
      tip: 'Le fatture PROFORMA sono documenti non fiscali. Per la fatturazione elettronica usa il tuo gestionale fiscale.'
    },
    {
      title: 'PAGAMENTI ONLINE',
      icon: 'payment',
      content: [
        'I proprietari possono pagare online prima della visita',
        'Pagamento sicuro tramite Stripe',
        'Accetta carte, Apple Pay, Google Pay',
        'Ricevi notifica immediata del pagamento',
        'Lo stato "pagato" e visibile nella scheda appuntamento',
        'Report mensile dei pagamenti ricevuti',
        'NESSUNA commissione VetBuddy sulle transazioni'
      ],
      tip: 'Il pagamento anticipato riduce i no-show del 60% e migliora il cash flow!'
    },
    {
      title: 'AUTOMAZIONI (PIANO PREMIUM)',
      icon: 'automation',
      content: [
        'Promemoria automatici 24h prima dell\'appuntamento',
        'Follow-up post visita con istruzioni personalizzate',
        'Reminder per vaccini e controlli periodici',
        'Richiesta recensioni automatica',
        'Notifiche WhatsApp Business',
        'Auto-assegnazione slot disponibili',
        'Report settimanale automatico'
      ],
      tip: 'Le automazioni fanno risparmiare in media 2 ore al giorno di lavoro!'
    },
    {
      title: 'NOTIFICHE WHATSAPP',
      icon: 'whatsapp',
      content: [
        'Vai a "Impostazioni" -> "Notifiche WhatsApp"',
        'Inserisci le credenziali Twilio',
        'Configura il numero WhatsApp Business',
        'Personalizza i template dei messaggi',
        'Attiva/disattiva tipi di notifica specifici',
        'I clienti riceveranno promemoria su WhatsApp'
      ],
      tip: 'WhatsApp ha un tasso di apertura del 98% vs 20% delle email!'
    },
    {
      title: 'ANALYTICS E REPORT',
      icon: 'chart',
      content: [
        'Dashboard con KPI principali in tempo reale',
        'Visualizza: visite, fatturato, nuovi clienti',
        'Confronta con periodi precedenti',
        'Report esportabili in CSV',
        'Analisi per tipo di servizio e specie animale',
        'Trend mensili e stagionali'
      ],
      tip: 'Usa i dati per identificare i servizi piu richiesti e ottimizzare l\'offerta.'
    },
    {
      title: 'SICUREZZA E PRIVACY',
      icon: 'security',
      content: [
        'Tutti i dati sono crittografati',
        'Backup automatici giornalieri',
        'Conforme al GDPR',
        'Log di accesso e modifiche',
        'Esportazione/cancellazione dati su richiesta',
        'Autenticazione sicura'
      ],
      tip: 'VetBuddy non condivide mai i dati dei tuoi clienti con terze parti.'
    },
    {
      title: 'IMPORT PAZIENTI DA CSV',
      icon: 'import',
      content: [
        'Vai a "Pazienti" -> "Importa"',
        'Scarica il template CSV',
        'Compila con i dati dei tuoi pazienti',
        'Carica il file compilato',
        'VetBuddy importa: proprietari, animali, vaccini',
        'Gestisce automaticamente i duplicati'
      ],
      tip: 'Migra da qualsiasi gestionale in pochi minuti!'
    }
  ],
  
  faqs: [
    { q: 'Quanto costa VetBuddy per le cliniche?', a: 'Piano Starter: GRATUITO per sempre. Piano Premium: EUR 49/mese con tutte le automazioni. Pilot Milano: 90 giorni gratis Premium.' },
    { q: 'Posso importare dati dal mio gestionale attuale?', a: 'Si! Supportiamo import da CSV. Contattaci per assistenza nella migrazione.' },
    { q: 'VetBuddy sostituisce il software di fatturazione?', a: 'No, VetBuddy genera PROFORMA. Per la fatturazione elettronica usa il tuo gestionale fiscale.' },
    { q: 'Come funziona il pagamento dei clienti?', a: 'I clienti pagano via Stripe. I fondi vanno sul tuo conto. Nessuna commissione VetBuddy.' },
    { q: 'Posso avere piu utenti per la clinica?', a: 'Si, nel Piano Premium puoi aggiungere collaboratori con ruoli diversi.' },
    { q: 'I dati dei miei pazienti sono al sicuro?', a: 'Assolutamente. Crittografia, backup automatici e conformita GDPR garantiti.' }
  ],
  
  contacts: {
    website: 'www.vetbuddy.it',
    email: 'cliniche@vetbuddy.it',
    support: 'Assistente virtuale disponibile 24/7 nella dashboard'
  }
};

// ==================== PDF GENERATION ====================
async function generateTutorialPDF(tutorial, isClinic = false) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 16;
  
  // Colors
  const coralColor = rgb(0.96, 0.42, 0.42);
  const coralLight = rgb(0.99, 0.93, 0.93);
  const darkGray = rgb(0.15, 0.15, 0.15);
  const mediumGray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const white = rgb(1, 1, 1);
  const blueColor = rgb(0.23, 0.51, 0.98);
  const greenColor = rgb(0.16, 0.65, 0.40);
  const purpleColor = rgb(0.55, 0.36, 0.87);
  const orangeColor = rgb(0.96, 0.58, 0.27);
  
  // Section colors rotation
  const sectionColors = [coralColor, blueColor, greenColor, purpleColor, orangeColor, rgb(0.89, 0.32, 0.53)];
  
  // Helper functions
  const addPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    return { page, yPosition: pageHeight - margin };
  };
  
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
  
  // ==================== COVER PAGE ====================
  let { page, yPosition } = addPage();
  
  // Full page coral header
  page.drawRectangle({
    x: 0, y: pageHeight - 280, width: pageWidth, height: 280,
    color: coralColor
  });
  
  // Decorative circles
  page.drawCircle({ x: 80, y: pageHeight - 80, size: 60, color: rgb(1, 1, 1, 0.1) });
  page.drawCircle({ x: pageWidth - 100, y: pageHeight - 200, size: 80, color: rgb(1, 1, 1, 0.1) });
  
  // Logo text
  page.drawText('VetBuddy', {
    x: margin, y: pageHeight - 100, size: 56, font: boldFont, color: white
  });
  
  // Paw icon (simulated with circles)
  const pawX = pageWidth - 130;
  const pawY = pageHeight - 100;
  page.drawCircle({ x: pawX, y: pawY, size: 20, color: white });
  page.drawCircle({ x: pawX - 18, y: pawY + 22, size: 10, color: white });
  page.drawCircle({ x: pawX + 18, y: pawY + 22, size: 10, color: white });
  page.drawCircle({ x: pawX - 28, y: pawY + 5, size: 8, color: white });
  page.drawCircle({ x: pawX + 28, y: pawY + 5, size: 8, color: white });
  
  // Subtitle
  page.drawText('Gestionale Veterinario', {
    x: margin, y: pageHeight - 145, size: 20, font: font, color: white
  });
  
  // Badge
  const badgeText = isClinic ? 'GUIDA PER CLINICHE' : 'GUIDA PER PROPRIETARI';
  const badgeWidth = boldFont.widthOfTextAtSize(badgeText, 12) + 30;
  page.drawRectangle({
    x: margin, y: pageHeight - 200, width: badgeWidth, height: 28,
    color: white, borderRadius: 14
  });
  page.drawText(badgeText, {
    x: margin + 15, y: pageHeight - 192, size: 12, font: boldFont, color: coralColor
  });
  
  // Main title below header
  yPosition = pageHeight - 330;
  page.drawText(sanitizeText(tutorial.subtitle), {
    x: margin, y: yPosition, size: 28, font: boldFont, color: darkGray
  });
  
  yPosition -= 35;
  yPosition = drawWrappedText(page, tutorial.tagline, margin, yPosition, pageWidth - 2 * margin, 14, font, mediumGray);
  
  // Quick Start box
  yPosition -= 40;
  const qsBoxHeight = 120;
  page.drawRectangle({
    x: margin, y: yPosition - qsBoxHeight + 30, width: pageWidth - 2 * margin, height: qsBoxHeight,
    color: coralLight
  });
  page.drawRectangle({
    x: margin, y: yPosition - qsBoxHeight + 30, width: 5, height: qsBoxHeight,
    color: coralColor
  });
  
  page.drawText('QUICK START - ' + (isClinic ? 'Operativi in 15 minuti' : 'Inizia in 5 minuti'), {
    x: margin + 20, y: yPosition + 10, size: 14, font: boldFont, color: coralColor
  });
  
  yPosition -= 15;
  for (let i = 0; i < tutorial.quickStart.length; i++) {
    const item = tutorial.quickStart[i];
    // Circle with number
    page.drawCircle({ x: margin + 35, y: yPosition - 5, size: 12, color: coralColor });
    page.drawText(item.step, {
      x: margin + 31, y: yPosition - 9, size: 10, font: boldFont, color: white
    });
    page.drawText(sanitizeText(item.text), {
      x: margin + 55, y: yPosition - 9, size: 11, font: font, color: darkGray
    });
    yPosition -= 22;
  }
  
  // Footer info
  yPosition = margin + 80;
  page.drawText(`Generato il ${new Date().toLocaleDateString('it-IT')}`, {
    x: margin, y: yPosition, size: 10, font: font, color: lightGray
  });
  
  page.drawText('www.vetbuddy.it', {
    x: pageWidth - margin - 80, y: yPosition, size: 10, font: boldFont, color: coralColor
  });
  
  // ==================== TABLE OF CONTENTS ====================
  ({ page, yPosition } = addPage());
  
  // Header
  page.drawRectangle({
    x: 0, y: pageHeight - 80, width: pageWidth, height: 80,
    color: coralLight
  });
  page.drawText('INDICE', {
    x: margin, y: pageHeight - 50, size: 24, font: boldFont, color: coralColor
  });
  
  yPosition = pageHeight - 120;
  
  for (let i = 0; i < tutorial.sections.length; i++) {
    const section = tutorial.sections[i];
    const sectionColor = sectionColors[i % sectionColors.length];
    
    // Colored bullet
    page.drawCircle({ x: margin + 8, y: yPosition - 3, size: 6, color: sectionColor });
    
    // Section number
    page.drawText(`${i + 1}.`, {
      x: margin + 25, y: yPosition - 8, size: 12, font: boldFont, color: sectionColor
    });
    
    // Section title
    page.drawText(sanitizeText(section.title), {
      x: margin + 50, y: yPosition - 8, size: 12, font: font, color: darkGray
    });
    
    yPosition -= 28;
    
    if (yPosition < margin + 100) {
      ({ page, yPosition } = addPage());
      yPosition = pageHeight - margin;
    }
  }
  
  // Add FAQ entry
  yPosition -= 20;
  page.drawCircle({ x: margin + 8, y: yPosition - 3, size: 6, color: coralColor });
  page.drawText('FAQ', {
    x: margin + 25, y: yPosition - 8, size: 12, font: boldFont, color: coralColor
  });
  page.drawText('Domande Frequenti', {
    x: margin + 60, y: yPosition - 8, size: 12, font: font, color: darkGray
  });
  
  // ==================== CONTENT SECTIONS ====================
  for (let i = 0; i < tutorial.sections.length; i++) {
    const section = tutorial.sections[i];
    const sectionColor = sectionColors[i % sectionColors.length];
    
    ({ page, yPosition } = addPage());
    
    // Section header bar
    page.drawRectangle({
      x: 0, y: pageHeight - 100, width: pageWidth, height: 100,
      color: sectionColor
    });
    
    // Section number badge
    page.drawCircle({ x: margin + 25, y: pageHeight - 50, size: 22, color: white });
    const numText = `${i + 1}`;
    const numWidth = boldFont.widthOfTextAtSize(numText, 20);
    page.drawText(numText, {
      x: margin + 25 - numWidth / 2, y: pageHeight - 57, size: 20, font: boldFont, color: sectionColor
    });
    
    // Section title
    page.drawText(sanitizeText(section.title), {
      x: margin + 60, y: pageHeight - 55, size: 20, font: boldFont, color: white
    });
    
    yPosition = pageHeight - 140;
    
    // Content items
    for (let j = 0; j < section.content.length; j++) {
      const item = section.content[j];
      
      if (yPosition < margin + 80) {
        ({ page, yPosition } = addPage());
        // Mini header on continuation pages
        page.drawRectangle({
          x: 0, y: pageHeight - 40, width: pageWidth, height: 40,
          color: sectionColor
        });
        page.drawText(sanitizeText(section.title) + ' (continua)', {
          x: margin, y: pageHeight - 28, size: 12, font: boldFont, color: white
        });
        yPosition = pageHeight - 70;
      }
      
      // Bullet point
      page.drawCircle({ x: margin + 8, y: yPosition - 4, size: 4, color: sectionColor });
      
      // Item text
      yPosition = drawWrappedText(page, item, margin + 25, yPosition, pageWidth - 2 * margin - 30, 12, font, darkGray);
      yPosition -= 8;
    }
    
    // Tip box
    if (section.tip) {
      yPosition -= 15;
      
      if (yPosition < margin + 80) {
        ({ page, yPosition } = addPage());
        yPosition = pageHeight - margin - 30;
      }
      
      const tipBoxHeight = 60;
      page.drawRectangle({
        x: margin, y: yPosition - tipBoxHeight + 20, width: pageWidth - 2 * margin, height: tipBoxHeight,
        color: coralLight
      });
      page.drawRectangle({
        x: margin, y: yPosition - tipBoxHeight + 20, width: 4, height: tipBoxHeight,
        color: coralColor
      });
      
      page.drawText('SUGGERIMENTO', {
        x: margin + 15, y: yPosition + 2, size: 10, font: boldFont, color: coralColor
      });
      
      drawWrappedText(page, section.tip, margin + 15, yPosition - 15, pageWidth - 2 * margin - 35, 11, font, mediumGray);
    }
  }
  
  // ==================== FAQ PAGE ====================
  ({ page, yPosition } = addPage());
  
  // Header
  page.drawRectangle({
    x: 0, y: pageHeight - 100, width: pageWidth, height: 100,
    color: coralColor
  });
  
  page.drawText('DOMANDE FREQUENTI', {
    x: margin, y: pageHeight - 55, size: 24, font: boldFont, color: white
  });
  page.drawText('Le risposte alle domande piu comuni', {
    x: margin, y: pageHeight - 80, size: 12, font: font, color: white
  });
  
  yPosition = pageHeight - 140;
  
  for (let i = 0; i < tutorial.faqs.length; i++) {
    const faq = tutorial.faqs[i];
    
    if (yPosition < margin + 100) {
      ({ page, yPosition } = addPage());
      page.drawRectangle({
        x: 0, y: pageHeight - 40, width: pageWidth, height: 40,
        color: coralLight
      });
      page.drawText('DOMANDE FREQUENTI (continua)', {
        x: margin, y: pageHeight - 28, size: 12, font: boldFont, color: coralColor
      });
      yPosition = pageHeight - 70;
    }
    
    // Question
    page.drawText(`D: ${sanitizeText(faq.q)}`, {
      x: margin, y: yPosition, size: 12, font: boldFont, color: darkGray
    });
    yPosition -= 20;
    
    // Answer
    yPosition = drawWrappedText(page, `R: ${faq.a}`, margin, yPosition, pageWidth - 2 * margin, 11, font, mediumGray);
    yPosition -= 20;
  }
  
  // ==================== CONTACT PAGE ====================
  ({ page, yPosition } = addPage());
  
  // Full coral background
  page.drawRectangle({
    x: 0, y: 0, width: pageWidth, height: pageHeight,
    color: coralColor
  });
  
  // Content
  yPosition = pageHeight - 150;
  
  page.drawText('HAI BISOGNO DI AIUTO?', {
    x: margin, y: yPosition, size: 28, font: boldFont, color: white
  });
  
  yPosition -= 50;
  page.drawText('Il nostro team e sempre a disposizione', {
    x: margin, y: yPosition, size: 16, font: font, color: white
  });
  
  yPosition -= 80;
  
  // Contact cards
  const cardWidth = (pageWidth - 2 * margin - 30) / 2;
  const cardHeight = 120;
  
  // Website card
  page.drawRectangle({
    x: margin, y: yPosition - cardHeight, width: cardWidth, height: cardHeight,
    color: white
  });
  page.drawText('SITO WEB', {
    x: margin + 20, y: yPosition - 30, size: 10, font: boldFont, color: mediumGray
  });
  page.drawText(sanitizeText(tutorial.contacts.website), {
    x: margin + 20, y: yPosition - 55, size: 14, font: boldFont, color: coralColor
  });
  
  // Email card
  page.drawRectangle({
    x: margin + cardWidth + 30, y: yPosition - cardHeight, width: cardWidth, height: cardHeight,
    color: white
  });
  page.drawText('EMAIL', {
    x: margin + cardWidth + 50, y: yPosition - 30, size: 10, font: boldFont, color: mediumGray
  });
  page.drawText(sanitizeText(tutorial.contacts.email), {
    x: margin + cardWidth + 50, y: yPosition - 55, size: 14, font: boldFont, color: coralColor
  });
  
  yPosition -= cardHeight + 40;
  
  // Support info
  page.drawRectangle({
    x: margin, y: yPosition - 80, width: pageWidth - 2 * margin, height: 80,
    color: white
  });
  page.drawText('SUPPORTO', {
    x: margin + 20, y: yPosition - 25, size: 10, font: boldFont, color: mediumGray
  });
  page.drawText(sanitizeText(tutorial.contacts.support), {
    x: margin + 20, y: yPosition - 50, size: 12, font: font, color: darkGray
  });
  
  // Footer
  page.drawText('Grazie per aver scelto VetBuddy!', {
    x: pageWidth / 2 - 100, y: margin + 30, size: 14, font: boldFont, color: white
  });
  
  // ==================== ADD PAGE NUMBERS ====================
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];
    
    // Skip first page (cover)
    if (i === 0) continue;
    
    // Page number
    pg.drawText(`${i}`, {
      x: pageWidth / 2 - 5, y: 25, size: 10, font: font, color: lightGray
    });
    
    // Footer line
    pg.drawRectangle({
      x: margin, y: 20, width: pageWidth - 2 * margin, height: 1,
      color: rgb(0.9, 0.9, 0.9)
    });
    
    pg.drawText('VetBuddy - www.vetbuddy.it', {
      x: margin, y: 8, size: 8, font: font, color: lightGray
    });
  }
  
  return await pdfDoc.save();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'owner';
    
    const isClinic = type === 'clinic';
    const tutorial = isClinic ? clinicTutorial : ownerTutorial;
    const filename = isClinic ? 'VetBuddy_Tutorial_Cliniche.pdf' : 'VetBuddy_Tutorial_Proprietari.pdf';
    
    const pdfBytes = await generateTutorialPDF(tutorial, isClinic);
    
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
