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
    'Trova una clinica veterinaria o usa il link di prenotazione',
    'Prenota la tua prima visita'
  ],
  
  sections: [
    {
      title: 'REGISTRAZIONE E PRIMO ACCESSO',
      content: [
        'Vai su vetbuddy.it e clicca "Registrati"',
        'Seleziona "Proprietario di Animali"',
        'Inserisci la tua email e crea una password sicura',
        'Completa il profilo con nome, telefono e codice fiscale',
        'Puoi anche registrarti con il tuo account Google'
      ],
      tip: 'La registrazione e completamente gratuita per i proprietari!'
    },
    {
      title: 'AGGIUNGERE I TUOI ANIMALI',
      content: [
        'Dalla dashboard, clicca su "I Miei Animali"',
        'Premi il pulsante "+" per aggiungere un nuovo animale',
        'Inserisci: nome, specie, razza, data di nascita',
        'Aggiungi peso, numero microchip e foto',
        'Indica eventuali allergie o condizioni particolari'
      ],
      tip: 'vetbuddy supporta: cani, gatti, conigli, uccelli, rettili, pesci, cavalli e altri!'
    },
    {
      title: 'PRENOTARE CON IL LINK DIRETTO',
      content: [
        'Hai ricevuto un link dalla tua clinica? Aprilo nel browser',
        'Vedrai il profilo della clinica con servizi e orari',
        'Clicca "Prenota Appuntamento" e compila il modulo',
        'Inserisci: nome, telefono, nome animale, data preferita',
        'La clinica ti contattera per confermare data e orario',
        'NON serve registrarsi per prenotare tramite link!'
      ],
      tip: 'Il link di prenotazione funziona anche senza account vetbuddy!'
    },
    {
      title: 'GESTIRE GLI APPUNTAMENTI',
      content: [
        'Clicca su "Agenda" nella dashboard',
        'Vedi tutti i tuoi appuntamenti in arrivo',
        'Puoi cancellare o modificare gli appuntamenti',
        'Ricevi promemoria automatici prima della visita',
        'Lo stato si aggiorna in tempo reale'
      ],
      tip: 'Puoi gestire, modificare o cancellare i tuoi appuntamenti dalla dashboard.'
    },
    {
      title: 'DOCUMENTI E PRESCRIZIONI',
      content: [
        'Accedi a "I Miei Documenti" dalla dashboard',
        'Visualizza prescrizioni, referti e certificati',
        'Scarica singoli documenti in formato PDF',
        'Scarica TUTTI i documenti in un file ZIP',
        'I documenti della clinica arrivano automaticamente'
      ],
      tip: 'Tutti i tuoi documenti sono sempre disponibili!'
    },
    {
      title: 'REFERTI LABORATORIO',
      content: [
        'Apri il profilo del tuo animale',
        'Vai alla tab "Referti"',
        'Visualizza i referti delle analisi di laboratorio',
        'Il veterinario aggiunge note cliniche prima di inviarti il referto',
        'Scarica il referto PDF per i tuoi archivi',
        'Ricevi una notifica quando un nuovo referto e disponibile'
      ],
      tip: 'I referti lab sono visibili solo dopo la revisione del veterinario.'
    },
    {
      title: 'PRESCRIZIONI ELETTRONICHE (REV)',
      content: [
        'Quando il veterinario pubblica una prescrizione, ricevi una email',
        'Apri il profilo del tuo animale -> tab "Prescrizioni"',
        'Consulta dettagli: farmaci, posologia, durata del trattamento',
        'Trovi il N. ricetta e PIN per la farmacia',
        'Le prescrizioni sono visibili solo dopo la pubblicazione del veterinario'
      ],
      tip: 'Le informazioni sulle prescrizioni sono rese disponibili dal veterinario secondo il flusso previsto.'
    },
    {
      title: 'FATTURE E PAGAMENTI',
      content: [
        'Vai su "Fatture" nella dashboard',
        'Visualizza tutte le fatture proforma ricevute',
        'Scarica le fatture in PDF',
        'I pagamenti avvengono direttamente con la clinica',
        'La clinica gestisce i propri metodi di pagamento'
      ],
      tip: 'Le fatture proforma sono documenti non fiscali.'
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
    },
    {
      title: 'MESSAGGISTICA',
      content: [
        'Vai su "Messaggi" per comunicare con la clinica',
        'Scrivi messaggi diretti al veterinario',
        'Ricevi risposte e aggiornamenti',
        'Allega foto o documenti ai messaggi',
        'Ricevi notifiche per nuovi messaggi'
      ],
      tip: 'Usa la messaggistica per domande rapide senza dover chiamare!'
    }
  ],
  
  faqs: [
    { q: 'Quanto costa usare vetbuddy?', a: 'Completamente GRATUITO per i proprietari di animali.' },
    { q: 'Posso usare vetbuddy con qualsiasi clinica?', a: 'Solo con le cliniche registrate su vetbuddy.' },
    { q: 'Come posso prenotare senza account?', a: 'Usa il link di prenotazione della tua clinica, non serve registrarsi!' },
    { q: 'Come vedo i referti del laboratorio?', a: 'Apri il profilo del tuo animale e vai alla tab Referti.' },
    { q: 'Come vedo le prescrizioni del veterinario?', a: 'Apri il profilo del tuo animale e vai alla tab Prescrizioni. Sono visibili solo dopo la pubblicazione del veterinario.' },
    { q: 'I miei dati sono al sicuro?', a: 'Si, crittografia avanzata e conformita GDPR.' }
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
    'Attiva il link di prenotazione',
    'Inizia a ricevere prenotazioni online'
  ],
  
  sections: [
    {
      title: 'CONFIGURAZIONE INIZIALE',
      content: [
        'Registrati come clinica su vetbuddy.it',
        'Completa il profilo: nome clinica, indirizzo, P.IVA, orari',
        'Aggiungi logo e foto della struttura',
        'Configura i servizi offerti con prezzi e durata',
        'Scegli il piano: Starter Clinica (EUR 0/mese) o Pro Clinica (EUR 79/mese + IVA)',
        'Pilot Milano: Pro Clinica gratis per 90 giorni, early adopter EUR 49/mese'
      ],
      tip: 'Il Piano Starter e perfetto per veterinari freelance e piccole cliniche.'
    },
    {
      title: 'LINK DI PRENOTAZIONE DIRETTO',
      content: [
        'Vai su "Link Prenotazione" nel menu laterale',
        'Troverai il tuo link personalizzato (es. vetbuddy.it/clinica/nome-clinica)',
        'Copia il link e condividilo su WhatsApp, social, email',
        'Genera un QR Code da stampare in reception',
        'Personalizza lo slug del link (es. /clinica/studio-rossi)',
        'I clienti prenotano SENZA registrarsi - solo nome, telefono e data',
        'Le prenotazioni arrivano come richieste nella tua agenda'
      ],
      tip: 'Condividi il link su WhatsApp ai clienti dopo ogni visita per fidelizzarli!'
    },
    {
      title: 'GESTIONE APPUNTAMENTI',
      content: [
        'Visualizza il calendario dalla dashboard principale',
        'Vedi appuntamenti: giornalieri, settimanali o mensili',
        'Clicca su uno slot per creare un appuntamento',
        'Gestisci richieste: accetta, rifiuta o riprogramma',
        'Aggiungi note interne per ogni appuntamento',
        'Le prenotazioni dal link diretto hanno fonte "booking_link"'
      ],
      tip: 'Usa i codici colore per distinguere i tipi di appuntamento.'
    },
    {
      title: 'GESTIONE CLIENTI E PAZIENTI',
      content: [
        'Accedi a "Pazienti" per vedere tutti i clienti',
        'Visualizza la scheda completa di ogni animale',
        'Consulta lo storico visite e trattamenti',
        'Importa clienti esistenti da file CSV',
        'Esporta i dati per backup o analisi'
      ],
      tip: 'La funzione import CSV permette di migrare da altri gestionali in pochi minuti.'
    },
    {
      title: 'LAB MARKETPLACE - ANALISI DI LABORATORIO',
      content: [
        'Vai su "Analisi Lab" nel menu laterale',
        'Sfoglia i laboratori partner disponibili',
        'Crea una richiesta di analisi per un paziente',
        'Seleziona il tipo di esame e il laboratorio',
        'Segui lo stato della richiesta in tempo reale',
        'Ricevi il referto quando il laboratorio lo carica',
        'Rivedi il referto, aggiungi note cliniche e invialo al proprietario'
      ],
      tip: 'I referti lab sono nascosti al proprietario fino a quando non li rivedi e approvi.'
    },
    {
      title: 'DOCUMENTI E PRESCRIZIONI',
      content: [
        'Vai a "Documenti" dalla dashboard',
        'Crea: prescrizioni, referti, certificati, vaccinazioni',
        'Carica PDF esistenti o genera da template',
        'Associa il documento al paziente e proprietario',
        'Il documento viene inviato automaticamente al proprietario'
      ],
      tip: 'I documenti digitali riducono le chiamate del 90%!'
    },
    {
      title: 'RICETTE ELETTRONICHE VETERINARIE (REV)',
      content: [
        'Vai su "Prescrizioni REV" nel menu laterale',
        'Prepara la bozza con il wizard guidato: paziente, farmaci, posologia, diagnosi',
        'Completa l\'emissione ufficiale sul sistema nazionale (es. Vetinfo)',
        'Registra il N. ricetta e PIN in VetBuddy',
        'Pubblica al proprietario: riceve email + vede nel profilo pet',
        'Dashboard statistiche: bozze, emesse oggi, errori, totale',
        'Audit trail completo di ogni passaggio',
        'Configura il modulo da "Impostazioni REV"'
      ],
      tip: 'L\'emissione ufficiale della REV richiede l\'abilitazione del veterinario al sistema nazionale. VetBuddy prepara e organizza il flusso.'
    },
    {
      title: 'FATTURAZIONE PROFORMA',
      content: [
        'Vai a "Fatturazione" nella dashboard',
        'Crea nuova fattura proforma selezionando il cliente',
        'Aggiungi servizi prestati con prezzi e quantita',
        'Applica IVA 22% e marca da bollo se necessario',
        'Genera PDF professionale con tutti i dati',
        'Esporta in CSV, JSON o PDF per il commercialista'
      ],
      tip: 'Le fatture proforma sono documenti non fiscali.'
    },
    {
      title: 'DASHBOARD METRICHE E ANALYTICS',
      content: [
        'Vai su "Metriche" nel menu laterale',
        'Visualizza i KPI principali: fatturato, appuntamenti, pazienti',
        'Grafico andamento fatturato ultimi 6 mesi',
        'Stato appuntamenti del mese (completati, cancellati, no-show)',
        'Prenotazioni settimanali e funnel conversione',
        'Visite al profilo, tasso di conversione, telefonate risparmiate',
        'Analisi lab richieste e completate'
      ],
      tip: 'Usa le metriche per capire quali canali portano piu prenotazioni!'
    },
    {
      title: 'ABBONAMENTO E PAGAMENTI',
      content: [
        'Vai su "Impostazioni" -> "Abbonamento"',
        'Starter Clinica: EUR 0/mese (1 sede, 1 utente)',
        'Pro Clinica: EUR 79/mese + IVA (early adopter EUR 49/mese)',
        'Pro Clinica gratis per 90 giorni nel Pilot Milano',
        'Pagamento sicuro con carta tramite Stripe',
        'Annulla in qualsiasi momento senza vincoli',
        'I pagamenti dei clienti vanno direttamente a te (non passano da vetbuddy)'
      ],
      tip: 'Tutti i prezzi sono IVA esclusa.'
    },
    {
      title: 'AUTOMAZIONI (PIANO PRO)',
      content: [
        'Promemoria automatici 24h prima dell\'appuntamento',
        'Follow-up post visita con istruzioni personalizzate',
        'Reminder per vaccini e controlli periodici',
        'Report settimanale automatico',
        'Notifiche per nuove richieste lab'
      ],
      tip: 'Le automazioni fanno risparmiare in media 2 ore al giorno!'
    }
  ],
  
  faqs: [
    { q: 'Quanto costa vetbuddy?', a: 'Starter Clinica EUR 0/mese. Pro Clinica EUR 79/mese + IVA (EUR 49/mese early adopter). Laboratorio Partner EUR 29/mese + IVA. Prezzi IVA esclusa.' },
    { q: 'Come funziona il link di prenotazione?', a: 'E un link condivisibile che permette ai clienti di prenotare senza registrarsi.' },
    { q: 'Come funziona il Lab Marketplace?', a: 'Scegli un laboratorio partner, invia la richiesta, ricevi il referto e invialo al proprietario.' },
    { q: 'VetBuddy emette direttamente la Ricetta Elettronica Veterinaria?', a: 'No. VetBuddy supporta la preparazione e l\'archiviazione. L\'emissione ufficiale richiede l\'abilitazione del veterinario al sistema nazionale.' },
    { q: 'I pagamenti dei clienti passano da vetbuddy?', a: 'No! I pagamenti vanno direttamente alla clinica. vetbuddy incassa solo l\'abbonamento.' },
    { q: 'Posso importare dati dal gestionale attuale?', a: 'Si! Supportiamo import da CSV.' }
  ],
  
  contacts: {
    website: 'www.vetbuddy.it',
    email: 'support@vetbuddy.it'
  }
};

// ==================== LAB TUTORIAL CONTENT ====================
const labTutorial = {
  title: 'vetbuddy - Guida per Laboratori',
  subtitle: 'Il marketplace che collega il tuo laboratorio alle cliniche veterinarie',
  
  quickStart: [
    'Registrati come laboratorio su vetbuddy.it',
    'Completa il profilo e configura i prezzi',
    'Configura Stripe per ricevere pagamenti',
    'Inizia a ricevere richieste dalle cliniche'
  ],
  
  sections: [
    {
      title: 'CONFIGURAZIONE INIZIALE',
      content: [
        'Registrati come laboratorio su vetbuddy.it',
        'Completa il profilo: nome lab, indirizzo, P.IVA, telefono',
        'Aggiungi descrizione, specializzazioni e area geografica',
        'Indica se offri il ritiro campioni a domicilio',
        'Il tuo profilo apparira nel Marketplace delle cliniche'
      ],
      tip: 'Un profilo completo attira piu cliniche partner!'
    },
    {
      title: 'CONFIGURARE STRIPE (PAGAMENTI)',
      content: [
        'Crea un account Stripe su stripe.com (gratuito)',
        'Vai su dashboard.stripe.com/apikeys',
        'Copia la Publishable key (inizia con pk_live_)',
        'Copia la Secret key (inizia con sk_live_)',
        'Su VetBuddy: Profilo -> Pagamenti -> Configura Stripe',
        'Incolla le chiavi e salva. I pagamenti arrivano direttamente a te'
      ],
      tip: 'Le chiavi API Stripe si trovano su dashboard.stripe.com/apikeys'
    },
    {
      title: 'LISTINO PREZZI',
      content: [
        'Vai su "Listino Prezzi" nel menu laterale',
        'Crea categorie (es. Ematologia, Biochimica)',
        'Aggiungi esami con nome, codice, prezzo e tempi di consegna',
        'Il listino e visibile alle cliniche nel Marketplace',
        'Modifica i prezzi in qualsiasi momento'
      ],
      tip: 'Un listino completo e aggiornato ti rende piu competitivo.'
    },
    {
      title: 'GESTIONE RICHIESTE',
      content: [
        'Le richieste delle cliniche arrivano nella tua dashboard',
        'Per ogni richiesta vedi: paziente, esame, clinica, urgenza',
        'Aggiorna lo stato: Ricevuta -> In lavorazione -> Completata',
        'Puoi inviare un preventivo personalizzato',
        'La clinica puo accettare e pagare direttamente'
      ],
      tip: 'Aggiorna lo stato in tempo reale per mantenere informata la clinica.'
    },
    {
      title: 'CARICAMENTO REFERTI',
      content: [
        'Quando l\'analisi e completata, carica il referto PDF',
        'Aggiungi note tecniche al referto',
        'Il veterinario riceve notifica e rivede il referto',
        'Solo dopo la revisione del veterinario, il proprietario puo vederlo',
        'Mantieni uno storico completo di tutti i referti'
      ],
      tip: 'I referti sono nascosti al proprietario fino alla revisione del veterinario.'
    },
    {
      title: 'FATTURAZIONE E PAGAMENTI',
      content: [
        'Quando la clinica paga un preventivo, ricevi il pagamento via Stripe',
        'Una fattura proforma viene generata automaticamente',
        'Visualizza tutte le fatture nella sezione "Fatture"',
        'Esporta i dati per il commercialista',
        'Le commissioni Stripe standard si applicano (circa 1.4% + 0.25 EUR)'
      ],
      tip: 'Le fatture proforma sono documenti di cortesia, non fiscali. La fattura fiscale la emetti tu.'
    },
    {
      title: 'DASHBOARD E METRICHE',
      content: [
        'Visualizza le statistiche principali nella dashboard',
        'Richieste ricevute, completate, in attesa',
        'Fatturato totale e andamento mensile',
        'Cliniche partner attive',
        'Tempi medi di consegna'
      ],
      tip: 'Usa le metriche per ottimizzare i tempi e attirare piu cliniche!'
    },
    {
      title: 'ABBONAMENTO',
      content: [
        'Lab Partner: EUR 29/mese + IVA',
        'Gratis per i primi 6 mesi o le prime 50 richieste',
        'Include: profilo marketplace, gestione richieste, fatturazione',
        'Pagamento sicuro tramite Stripe',
        'Annulla in qualsiasi momento'
      ],
      tip: 'Il piano Lab Partner include tutto il necessario per iniziare.'
    }
  ],
  
  faqs: [
    { q: 'Quanto costa per il laboratorio?', a: 'Lab Partner EUR 29/mese + IVA. Gratis per 6 mesi o 50 richieste.' },
    { q: 'Come ricevo i pagamenti dalle cliniche?', a: 'Direttamente sul tuo account Stripe. VetBuddy non trattiene nulla.' },
    { q: 'Posso iscrivermi senza invito?', a: 'Si! Puoi registrarti gratuitamente e attendere approvazione.' },
    { q: 'Le fatture proforma sono fiscalmente valide?', a: 'No, sono documenti di cortesia. La fattura fiscale la emetti tu direttamente.' },
    { q: 'Come funziona la revisione dei referti?', a: 'Il veterinario rivede il tuo referto e aggiunge note cliniche prima di condividerlo con il proprietario.' }
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
  
  // Title - New Brand Style: "vet" in NERO (darkGray), "buddy" in BIANCO
  page.drawText('vet', {
    x: margin, y: pageHeight - 70, size: 36, font: boldFont, color: darkGray
  });
  page.drawText('buddy', {
    x: margin + 55, y: pageHeight - 70, size: 36, font: font, color: rgb(1, 1, 1)
  });
  
  // Subtitle
  const coverSubtitle = tutorial.title.includes('Laboratori') ? 'Guida per Laboratori di Analisi' :
    (isClinic ? 'Guida per Cliniche Veterinarie' : 'Guida per Proprietari di Animali');
  page.drawText(coverSubtitle, {
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
  
  page.drawText('Assistente virtuale disponibile 24/7 nella dashboard vetbuddy.', {
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
    
    let tutorial, isClinic, isLab, filename, subtitle;
    if (type === 'clinic') {
      tutorial = clinicTutorial;
      isClinic = true;
      isLab = false;
      filename = 'vetbuddy_Tutorial_Cliniche.pdf';
    } else if (type === 'lab') {
      tutorial = labTutorial;
      isClinic = false;
      isLab = true;
      filename = 'vetbuddy_Tutorial_Laboratori.pdf';
    } else {
      tutorial = ownerTutorial;
      isClinic = false;
      isLab = false;
      filename = 'vetbuddy_Tutorial_Proprietari.pdf';
    }
    
    const pdfBytes = await generateTutorialPDF(tutorial, isClinic || isLab);
    
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
