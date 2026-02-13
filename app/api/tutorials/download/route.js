import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

// Owner tutorial content
const ownerTutorial = {
  title: 'VetBuddy - Guida per Proprietari di Animali',
  subtitle: 'Tutto quello che devi sapere per gestire la salute dei tuoi amici pelosi',
  sections: [
    {
      title: 'Registrazione e Primo Accesso',
      content: [
        '1. Vai su vetbuddy.it e clicca "Registrati"',
        '2. Seleziona "Proprietario di Animali"',
        '3. Inserisci email e crea una password sicura',
        '4. Conferma l\'email cliccando sul link ricevuto',
        '5. Completa il profilo con i tuoi dati'
      ]
    },
    {
      title: 'Aggiungere i Tuoi Animali',
      content: [
        '1. Dalla dashboard, clicca "I Miei Animali"',
        '2. Premi il pulsante "+" o "Aggiungi Animale"',
        '3. Inserisci: nome, specie, razza, data di nascita',
        '4. Aggiungi peso, microchip, foto',
        '5. Indica allergie o condizioni particolari',
        '',
        'Specie supportate: cani, gatti, conigli, uccelli, rettili, pesci e altri!'
      ]
    },
    {
      title: 'Trovare una Clinica',
      content: [
        '1. Vai alla sezione "Trova Clinica"',
        '2. Usa la mappa interattiva',
        '3. Filtra per città o servizi offerti',
        '4. Visualizza orari, servizi e recensioni',
        '5. Salva le cliniche preferite'
      ]
    },
    {
      title: 'Prenotare un Appuntamento',
      content: [
        '1. Clicca "Prenota Visita" dalla dashboard',
        '2. Seleziona la clinica desiderata',
        '3. Scegli il tipo di servizio',
        '4. Seleziona l\'animale',
        '5. Scegli data e orario',
        '6. Aggiungi note per il veterinario',
        '7. Conferma la prenotazione'
      ]
    },
    {
      title: 'Gestire i Documenti',
      content: [
        '1. Accedi a "I Miei Documenti"',
        '2. Visualizza prescrizioni, referti, fatture',
        '3. Scarica i documenti in PDF',
        '4. Organizza per animale o data',
        '5. I documenti arrivano automaticamente dalla clinica'
      ]
    },
    {
      title: 'Notifiche e Promemoria',
      content: [
        '- Notifiche per appuntamenti in arrivo',
        '- Promemoria per vaccini e controlli',
        '- Avvisi per nuovi documenti',
        '- Notifiche via email, app e WhatsApp',
        '- Personalizza nelle Impostazioni'
      ]
    },
    {
      title: 'Programma Fedeltà',
      content: [
        '- Accumula punti con ogni prenotazione',
        '- Punti bonus per recensioni e referral',
        '- Riscatta per sconti sulle visite',
        '- 100 punti = €5 di sconto'
      ]
    },
    {
      title: 'Installare l\'App',
      content: [
        'VetBuddy è una PWA (Progressive Web App):',
        '',
        'iPhone: Safari → Condividi → Aggiungi a Home',
        'Android: Chrome → Menu → Installa app',
        '',
        'Funziona anche offline!'
      ]
    }
  ],
  faqs: [
    { q: 'Quanto costa usare VetBuddy?', a: 'Completamente gratuito per i proprietari!' },
    { q: 'I miei dati sono al sicuro?', a: 'Sì, crittografia avanzata e conformità GDPR.' },
    { q: 'Posso gestire più animali?', a: 'Sì, aggiungi tutti gli animali che desideri.' }
  ]
};

// Clinic tutorial content
const clinicTutorial = {
  title: 'VetBuddy - Guida per Cliniche Veterinarie',
  subtitle: 'La guida completa per sfruttare al massimo il gestionale VetBuddy',
  sections: [
    {
      title: 'Configurazione Iniziale',
      content: [
        '1. Registrati come clinica su vetbuddy.it',
        '2. Completa il profilo: nome, indirizzo, P.IVA, orari',
        '3. Aggiungi logo e foto della struttura',
        '4. Configura i servizi e i prezzi',
        '5. Imposta la posizione sulla mappa',
        '6. Attiva il piano desiderato'
      ]
    },
    {
      title: 'Gestione Servizi',
      content: [
        '1. Vai a "Impostazioni" → "Servizi"',
        '2. Aggiungi: nome, descrizione, prezzo, durata',
        '3. Categorizza (visite, vaccini, chirurgia...)',
        '4. Prezzi diversi per specie se necessario',
        '5. Attiva/disattiva servizi stagionalmente'
      ]
    },
    {
      title: 'Gestione Appuntamenti',
      content: [
        '1. Visualizza il calendario dalla dashboard',
        '2. Vista giornaliera, settimanale o mensile',
        '3. Crea appuntamenti manualmente',
        '4. Gestisci richieste: accetta/rifiuta/riprogramma',
        '5. Aggiungi note interne',
        '6. Imposta promemoria automatici'
      ]
    },
    {
      title: 'Gestione Clienti e Pazienti',
      content: [
        '1. Accedi a "Pazienti"',
        '2. Visualizza schede complete degli animali',
        '3. Consulta storico visite e trattamenti',
        '4. Aggiungi note e allergie',
        '5. Importa clienti da CSV',
        '6. Esporta dati per backup'
      ]
    },
    {
      title: 'Documenti e Prescrizioni',
      content: [
        '1. Vai a "Documenti"',
        '2. Crea: prescrizioni, referti, certificati',
        '3. Carica PDF o genera da template',
        '4. Associa al paziente',
        '5. Invia automaticamente via email',
        '6. Disponibile nell\'app del cliente'
      ]
    },
    {
      title: 'Fatturazione PROFORMA',
      content: [
        '1. Vai a "Fatturazione"',
        '2. Crea nuova fattura PROFORMA',
        '3. Aggiungi servizi, prezzi, quantità',
        '4. Applica IVA e sconti',
        '5. Genera PDF',
        '6. Invia via email o stampa',
        '7. Esporta CSV per il commercialista',
        '',
        'Nota: Per fatturazione elettronica usa il tuo gestionale fiscale'
      ]
    },
    {
      title: 'Pagamenti Online',
      content: [
        '- I proprietari pagano online via Stripe',
        '- Carte, Apple Pay, Google Pay',
        '- Notifica immediata del pagamento',
        '- Report mensile transazioni',
        '- Nessuna commissione VetBuddy'
      ]
    },
    {
      title: 'Automazioni (Piano Premium)',
      content: [
        '- Promemoria automatici 24h prima',
        '- Follow-up post visita',
        '- Reminder vaccini e controlli',
        '- Notifiche WhatsApp',
        '- Auto-assegnazione slot',
        '- Reportistica automatica',
        '',
        'Risparmia 2 ore al giorno di lavoro!'
      ]
    },
    {
      title: 'Notifiche WhatsApp',
      content: [
        '1. Vai a "Impostazioni" → "Notifiche WhatsApp"',
        '2. Inserisci credenziali Twilio',
        '3. Configura numero WhatsApp Business',
        '4. Personalizza i template',
        '5. Attiva/disattiva tipi di notifica',
        '',
        'WhatsApp: 98% tasso apertura vs 20% email!'
      ]
    },
    {
      title: 'Analytics e Report',
      content: [
        '- Dashboard KPI in tempo reale',
        '- Visite, fatturato, nuovi clienti',
        '- Confronto con periodi precedenti',
        '- Report esportabili in CSV',
        '- Analisi per servizio e specie',
        '- Trend mensili e stagionali'
      ]
    }
  ],
  faqs: [
    { q: 'Quanto costa VetBuddy?', a: 'Starter: gratis. Premium: €49/mese. Pilot: 90 giorni gratis.' },
    { q: 'Posso importare dati?', a: 'Sì, supportiamo import da CSV.' },
    { q: 'VetBuddy sostituisce la fatturazione?', a: 'No, genera PROFORMA. Usa il tuo gestionale per fatture elettroniche.' }
  ]
};

async function generateTutorialPDF(tutorial) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 18;
  
  const coralColor = rgb(0.96, 0.42, 0.42);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);
  const white = rgb(1, 1, 1);
  
  // Helper to add new page
  const addPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    return { page, yPosition: pageHeight - margin };
  };
  
  // Helper to draw text with word wrap
  const drawWrappedText = (page, text, x, y, maxWidth, fontSize, textFont, color) => {
    const words = text.split(' ');
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
  
  // Cover page
  let { page, yPosition } = addPage();
  
  // Logo area (coral rectangle)
  page.drawRectangle({
    x: 0, y: pageHeight - 200, width: pageWidth, height: 200,
    color: coralColor
  });
  
  page.drawText('VetBuddy', {
    x: margin, y: pageHeight - 100, size: 48, font: boldFont, color: white
  });
  
  page.drawText('Gestionale Veterinario', {
    x: margin, y: pageHeight - 140, size: 18, font: font, color: white
  });
  
  // Title
  yPosition = pageHeight - 280;
  page.drawText(tutorial.title, {
    x: margin, y: yPosition, size: 24, font: boldFont, color: darkGray
  });
  
  yPosition -= 40;
  yPosition = drawWrappedText(page, tutorial.subtitle, margin, yPosition, pageWidth - 2 * margin, 14, font, lightGray);
  
  // Generated date
  yPosition = margin + 50;
  page.drawText(`Generato il ${new Date().toLocaleDateString('it-IT')}`, {
    x: margin, y: yPosition, size: 10, font: font, color: lightGray
  });
  
  page.drawText('www.vetbuddy.it', {
    x: pageWidth - margin - 80, y: yPosition, size: 10, font: font, color: coralColor
  });
  
  // Content pages
  for (const section of tutorial.sections) {
    // Check if we need a new page
    const estimatedHeight = 80 + section.content.length * lineHeight;
    if (yPosition < margin + estimatedHeight) {
      ({ page, yPosition } = addPage());
    }
    
    // Section header
    yPosition -= 30;
    page.drawRectangle({
      x: margin - 10, y: yPosition - 5, width: pageWidth - 2 * margin + 20, height: 30,
      color: rgb(0.98, 0.95, 0.95)
    });
    page.drawRectangle({
      x: margin - 10, y: yPosition - 5, width: 4, height: 30,
      color: coralColor
    });
    
    page.drawText(section.title, {
      x: margin + 5, y: yPosition + 5, size: 14, font: boldFont, color: darkGray
    });
    
    yPosition -= 35;
    
    // Section content
    for (const line of section.content) {
      if (yPosition < margin + 30) {
        ({ page, yPosition } = addPage());
      }
      
      if (line === '') {
        yPosition -= 10;
        continue;
      }
      
      yPosition = drawWrappedText(page, line, margin + 10, yPosition, pageWidth - 2 * margin - 20, 11, font, darkGray);
      yPosition -= 5;
    }
    
    yPosition -= 15;
  }
  
  // FAQ section
  if (tutorial.faqs && tutorial.faqs.length > 0) {
    if (yPosition < margin + 150) {
      ({ page, yPosition } = addPage());
    }
    
    yPosition -= 30;
    page.drawText('Domande Frequenti', {
      x: margin, y: yPosition, size: 16, font: boldFont, color: coralColor
    });
    yPosition -= 30;
    
    for (const faq of tutorial.faqs) {
      if (yPosition < margin + 60) {
        ({ page, yPosition } = addPage());
      }
      
      page.drawText(`D: ${faq.q}`, {
        x: margin, y: yPosition, size: 11, font: boldFont, color: darkGray
      });
      yPosition -= lineHeight;
      
      yPosition = drawWrappedText(page, `R: ${faq.a}`, margin, yPosition, pageWidth - 2 * margin, 11, font, lightGray);
      yPosition -= 15;
    }
  }
  
  // Add page numbers to all pages
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];
    pg.drawText(`Pagina ${i + 1} di ${pages.length}`, {
      x: pageWidth - margin - 60, y: 30, size: 9, font, color: lightGray
    });
    pg.drawText('VetBuddy - www.vetbuddy.it', {
      x: margin, y: 30, size: 9, font, color: lightGray
    });
  }
  
  return await pdfDoc.save();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'owner';
    
    const tutorial = type === 'clinic' ? clinicTutorial : ownerTutorial;
    const filename = type === 'clinic' ? 'VetBuddy_Tutorial_Cliniche.pdf' : 'VetBuddy_Tutorial_Proprietari.pdf';
    
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
