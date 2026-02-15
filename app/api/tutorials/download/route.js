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
    .replace(/[^\x00-\x7F]/g, '');
}

// ==================== OWNER TUTORIAL CONTENT ====================
const ownerTutorial = {
  title: 'vetbuddy - Guida per Proprietari',
  subtitle: 'Tutto quello che devi sapere per gestire la salute dei tuoi animali',
  
  quickStart: [
    'Registrati gratis su vetbuddy.it',
    'Aggiungi i tuoi animali al profilo',
    'Trova una clinica veterinaria',
    'Prenota la tua prima visita'
  ],
  
  sections: [
    {
      title: 'REGISTRAZIONE E PRIMO ACCESSO',
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
      content: [
        'Dalla dashboard, clicca su "I Miei Animali"',
        'Premi il pulsante "+" per aggiungere un nuovo animale',
        'Inserisci: nome, specie, razza, data di nascita',
        'Aggiungi peso attuale, numero microchip e foto',
        'Indica eventuali allergie o condizioni particolari'
      ],
      tip: 'vetbuddy supporta: cani, gatti, conigli, uccelli, rettili, pesci, cavalli e altri!'
    },
    {
      title: 'TROVARE UNA CLINICA VETERINARIA',
      content: [
        'Vai alla sezione "Trova Clinica"',
        'Usa la mappa interattiva per vedere le cliniche vicine',
        'Filtra per citta o servizi offerti',
        'Clicca su una clinica per vedere dettagli e recensioni',
        'Salva le cliniche preferite per accesso rapido'
      ],
      tip: 'La mappa mostra tutte le cliniche partner in Italia!'
    },
    {
      title: 'PRENOTARE UN APPUNTAMENTO',
      content: [
        'Clicca su "Prenota Visita" dalla dashboard',
        'Seleziona la clinica desiderata',
        'Scegli il tipo di servizio',
        'Seleziona l\'animale per cui stai prenotando',
        'Scegli data e orario tra quelli disponibili',
        'Aggiungi note per il veterinario',
        'Conferma la prenotazione'
      ],
      tip: 'Puoi gestire, modificare o cancellare i tuoi appuntamenti dalla dashboard.'
    },
    {
      title: 'GESTIRE I TUOI DOCUMENTI',
      content: [
        'Accedi a "I Miei Documenti" dalla dashboard',
        'Visualizza prescrizioni, referti e fatture ricevute',
        'Scarica singoli documenti in formato PDF',
        'Scarica TUTTI i documenti in un file ZIP',
        'I documenti della clinica arrivano automaticamente'
      ],
      tip: 'Tutti i tuoi documenti sono sempre disponibili, anche offline!'
    },
    {
      title: 'NOTIFICHE E PROMEMORIA',
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
      title: 'CONFIGURARE WHATSAPP',
      content: [
        'Vai su "Profilo e Notifiche" nel menu laterale',
        'Inserisci il tuo numero di telefono con prefisso (+39)',
        'Attiva l\'opzione "Notifiche WhatsApp"',
        'Clicca "Invia messaggio di test" per verificare',
        'Riceverai automaticamente:',
        '  - Promemoria appuntamenti',
        '  - Notifiche documenti disponibili',
        '  - Conferme di pagamento'
      ],
      tip: 'WhatsApp ha un tasso di apertura del 98%!'
    },
    {
      title: 'PROGRAMMA FEDELTA',
      content: [
        'Accumula punti con ogni prenotazione completata',
        'Ricevi punti bonus per recensioni e referral',
        'Riscatta i punti per sconti sulle visite',
        'Visualizza il tuo saldo punti nella dashboard'
      ],
      tip: 'Ogni 100 punti = 5 EUR di sconto sulla prossima visita!'
    }
  ],
  
  faqs: [
    { q: 'Quanto costa usare vetbuddy?', a: 'Completamente GRATUITO per i proprietari.' },
    { q: 'Posso usare vetbuddy con qualsiasi clinica?', a: 'Solo con le cliniche registrate su vetbuddy.' },
    { q: 'I miei dati sono al sicuro?', a: 'Si, crittografia avanzata e conformita GDPR.' },
    { q: 'Posso gestire piu animali?', a: 'Si, puoi aggiungere tutti gli animali che desideri.' }
  ],
  
  contacts: {
    website: 'www.vetbuddy.it',
    email: 'support@vetbuddy.it'
  }
};

// ==================== CLINIC TUTORIAL CONTENT ====================
const clinicTutorial = {
  title: 'vetbuddy - Guida per Cliniche',
  subtitle: 'Il gestionale veterinario che semplifica il lavoro quotidiano',
  
  quickStart: [
    'Registrati come clinica',
    'Configura servizi e orari',
    'Importa i pazienti esistenti',
    'Inizia a ricevere prenotazioni'
  ],
  
  sections: [
    {
      title: 'CONFIGURAZIONE INIZIALE',
      content: [
        'Registrati come clinica su vetbuddy.it',
        'Completa il profilo: nome clinica, indirizzo, P.IVA, orari',
        'Aggiungi logo e foto della struttura',
        'Configura i servizi offerti con prezzi e durata',
        'Imposta la posizione sulla mappa',
        'Scegli il piano: Starter (gratuito) o Premium'
      ],
      tip: 'Il Piano Starter e perfetto per veterinari freelance.'
    },
    {
      title: 'GESTIONE SERVIZI E LISTINO',
      content: [
        'Vai a "Impostazioni" -> "Servizi"',
        'Aggiungi servizi: nome, descrizione, prezzo, durata',
        'Categorizza (visite, vaccini, chirurgia, diagnostica...)',
        'Imposta prezzi differenti per specie se necessario',
        'Attiva/disattiva servizi in base alla stagione'
      ],
      tip: 'Servizi ben descritti aumentano le prenotazioni del 40%!'
    },
    {
      title: 'GESTIONE APPUNTAMENTI',
      content: [
        'Visualizza il calendario dalla dashboard principale',
        'Vedi appuntamenti: giornalieri, settimanali o mensili',
        'Clicca su uno slot per creare un appuntamento',
        'Gestisci richieste: accetta, rifiuta o riprogramma',
        'Aggiungi note interne per ogni appuntamento'
      ],
      tip: 'Usa i codici colore per distinguere i tipi di appuntamento.'
    },
    {
      title: 'GESTIONE CLIENTI E PAZIENTI',
      content: [
        'Accedi a "Pazienti" per vedere tutti i clienti',
        'Visualizza la scheda completa di ogni animale',
        'Consulta lo storico visite e trattamenti',
        'IMPORTA clienti esistenti da file CSV',
        'Esporta i dati per backup o analisi'
      ],
      tip: 'La funzione import CSV permette di migrare da altri gestionali in pochi minuti.'
    },
    {
      title: 'DOCUMENTI E PRESCRIZIONI',
      content: [
        'Vai a "Documenti" dalla dashboard',
        'Crea: prescrizioni, referti, certificati, vaccinazioni',
        'Carica PDF esistenti o genera da template',
        'Associa il documento al paziente e proprietario',
        'Il documento viene inviato automaticamente via email'
      ],
      tip: 'I documenti digitali riducono le chiamate "ho perso la prescrizione" del 90%!'
    },
    {
      title: 'FATTURAZIONE PROFORMA',
      content: [
        'Vai a "Fatturazione" nella dashboard',
        'Crea nuova fattura PROFORMA selezionando il cliente',
        'Aggiungi servizi prestati con prezzi e quantita',
        'Applica IVA 22% e marca da bollo se necessario',
        'Genera PDF professionale con tutti i dati',
        'Esporta in CSV, JSON o PDF per il commercialista'
      ],
      tip: 'Le fatture PROFORMA sono documenti non fiscali.'
    },
    {
      title: 'PAGAMENTI ONLINE',
      content: [
        'I proprietari possono pagare online prima della visita',
        'Pagamento sicuro tramite Stripe',
        'Accetta carte, Apple Pay, Google Pay',
        'Ricevi notifica immediata del pagamento',
        'NESSUNA commissione VetBuddy sulle transazioni'
      ],
      tip: 'Il pagamento anticipato riduce i no-show del 60%!'
    },
    {
      title: 'AUTOMAZIONI (PIANO PREMIUM)',
      content: [
        'Promemoria automatici 24h prima dell\'appuntamento',
        'Follow-up post visita con istruzioni personalizzate',
        'Reminder per vaccini e controlli periodici',
        'Notifiche WhatsApp Business',
        'Report settimanale automatico'
      ],
      tip: 'Le automazioni fanno risparmiare in media 2 ore al giorno!'
    },
    {
      title: 'NOTIFICHE WHATSAPP',
      content: [
        'Vai su Impostazioni -> WhatsApp Business',
        'Configura il numero WhatsApp della clinica',
        'I clienti riceveranno automaticamente:',
        '  - Promemoria appuntamenti',
        '  - Notifiche documenti disponibili',
        '  - Conferme di pagamento',
        'Il cliente puo attivare/disattivare dal suo profilo',
        'WhatsApp ha un tasso di apertura del 98%!'
      ],
      tip: 'Assicurati che i clienti abbiano il numero di telefono nel profilo.'
    },
    {
      title: 'ANALYTICS E REPORT',
      content: [
        'Dashboard con KPI principali in tempo reale',
        'Visualizza: visite, fatturato, nuovi clienti',
        'Confronta con periodi precedenti',
        'Report esportabili in CSV',
        'Analisi per tipo di servizio e specie animale'
      ],
      tip: 'Usa i dati per identificare i servizi piu richiesti.'
    }
  ],
  
  faqs: [
    { q: 'Quanto costa vetbuddy?', a: 'Starter: GRATUITO. Premium: EUR 49/mese.' },
    { q: 'Posso importare dati dal gestionale attuale?', a: 'Si! Supportiamo import da CSV.' },
    { q: 'vetbuddy sostituisce il software di fatturazione?', a: 'No, genera solo PROFORMA.' },
    { q: 'Come funziona il pagamento dei clienti?', a: 'Via Stripe. Nessuna commissione vetbuddy.' }
  ],
  
  contacts: {
    website: 'www.vetbuddy.it',
    email: 'support@vetbuddy.it'
  }
};

// ==================== PDF GENERATION (MINIMALIST STYLE) ====================
async function generateTutorialPDF(tutorial, isClinic = false) {
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
  
  // Helper: Add new page and return starting Y position
  const addPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    return { page, y: pageHeight - margin };
  };
  
  // Helper: Draw wrapped text and return new Y position
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
  
  // Top color bar
  page.drawRectangle({
    x: 0, y: pageHeight - 120, width: pageWidth, height: 120,
    color: coralColor
  });
  
  // Title - New Brand Style (vet + buddy)
  page.drawText('vet', {
    x: margin, y: pageHeight - 70, size: 36, font: boldFont, color: rgb(1, 1, 1)
  });
  page.drawText('buddy', {
    x: margin + 72, y: pageHeight - 70, size: 36, font: boldFont, color: rgb(1, 1, 1)
  });
  
  // Subtitle
  page.drawText(isClinic ? 'Guida per Cliniche Veterinarie' : 'Guida per Proprietari di Animali', {
    x: margin, y: pageHeight - 100, size: 14, font: font, color: rgb(1, 1, 1)
  });
  
  y = pageHeight - 170;
  
  // Tagline
  y = drawWrappedText(page, tutorial.subtitle, margin, y, contentWidth, 16, font, darkGray);
  y -= 40;
  
  // Quick Start Box
  page.drawRectangle({
    x: margin, y: y - 120, width: contentWidth, height: 130,
    color: bgLight
  });
  
  // Accent bar
  page.drawRectangle({
    x: margin, y: y - 120, width: 4, height: 130,
    color: coralColor
  });
  
  page.drawText('QUICK START', {
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
  
  // Generation date
  page.drawText(`Generato il ${new Date().toLocaleDateString('it-IT')}`, {
    x: margin, y: margin + 20, size: 9, font: font, color: lightGray
  });
  
  page.drawText('www.vetbuddy.it', {
    x: pageWidth - margin - 80, y: margin + 20, size: 9, font: boldFont, color: coralColor
  });
  
  // ==================== CONTENT PAGES ====================
  ({ page, y } = addPage());
  
  // Index header
  page.drawText('INDICE', {
    x: margin, y, size: 18, font: boldFont, color: coralColor
  });
  y -= 30;
  
  // List sections
  tutorial.sections.forEach((section, i) => {
    page.drawText(`${i + 1}. ${sanitizeText(section.title)}`, {
      x: margin, y, size: 11, font: font, color: darkGray
    });
    y -= 20;
  });
  
  y -= 10;
  page.drawText(`${tutorial.sections.length + 1}. DOMANDE FREQUENTI`, {
    x: margin, y, size: 11, font: font, color: darkGray
  });
  
  y -= 20;
  page.drawText(`${tutorial.sections.length + 2}. CONTATTI`, {
    x: margin, y, size: 11, font: font, color: darkGray
  });
  
  // ==================== SECTIONS ====================
  for (let i = 0; i < tutorial.sections.length; i++) {
    const section = tutorial.sections[i];
    
    // Check if we need a new page
    if (y < 300) {
      ({ page, y } = addPage());
    }
    
    y -= sectionGap;
    
    // Section header bar
    page.drawRectangle({
      x: margin, y: y - 5, width: contentWidth, height: 30,
      color: coralColor
    });
    
    page.drawText(`${i + 1}. ${sanitizeText(section.title)}`, {
      x: margin + 10, y: y, size: 12, font: boldFont, color: rgb(1, 1, 1)
    });
    
    y -= 40;
    
    // Content items
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
    
    // Tip box
    if (section.tip) {
      y -= 10;
      
      if (y < 80) {
        ({ page, y } = addPage());
      }
      
      page.drawRectangle({
        x: margin, y: y - 30, width: contentWidth, height: 40,
        color: bgLight
      });
      
      page.drawText('Suggerimento:', {
        x: margin + 10, y: y - 10, size: 9, font: boldFont, color: coralColor
      });
      
      drawWrappedText(page, section.tip, margin + 10, y - 22, contentWidth - 20, 9, font, mediumGray);
      
      y -= 50;
    }
  }
  
  // ==================== FAQ PAGE ====================
  if (y < 300) {
    ({ page, y } = addPage());
  }
  
  y -= sectionGap;
  
  page.drawRectangle({
    x: margin, y: y - 5, width: contentWidth, height: 30,
    color: coralColor
  });
  
  page.drawText('DOMANDE FREQUENTI', {
    x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
  });
  
  y -= 45;
  
  for (const faq of tutorial.faqs) {
    if (y < 100) {
      ({ page, y } = addPage());
    }
    
    page.drawText(`D: ${sanitizeText(faq.q)}`, {
      x: margin, y, size: 10, font: boldFont, color: darkGray
    });
    y -= 16;
    
    y = drawWrappedText(page, `R: ${faq.a}`, margin, y, contentWidth, 10, font, mediumGray);
    y -= 15;
  }
  
  // ==================== CONTACT PAGE ====================
  if (y < 200) {
    ({ page, y } = addPage());
  }
  
  y -= sectionGap;
  
  page.drawRectangle({
    x: margin, y: y - 5, width: contentWidth, height: 30,
    color: coralColor
  });
  
  page.drawText('CONTATTI E SUPPORTO', {
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
  
  page.drawText('Assistente virtuale disponibile 24/7 nella dashboard VetBuddy.', {
    x: margin, y, size: 10, font: font, color: mediumGray
  });
  
  // ==================== ADD PAGE NUMBERS ====================
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];
    
    // Footer line
    pg.drawRectangle({
      x: margin, y: 15, width: contentWidth, height: 0.5,
      color: rgb(0.9, 0.9, 0.9)
    });
    
    // Page number (skip first page)
    if (i > 0) {
      pg.drawText(`Pagina ${i}`, {
        x: pageWidth / 2 - 20, y: 5, size: 8, font: font, color: lightGray
      });
    }
    
    // Brand name footer with two-color style
    pg.drawText('vet', {
      x: margin, y: 5, size: 8, font: font, color: darkGray
    });
    pg.drawText('buddy', {
      x: margin + 14, y: 5, size: 8, font: font, color: coralColor
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
