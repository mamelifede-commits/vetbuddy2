import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, ' - ')
    .replace(/\u2013/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x00-\xFF\u00C0-\u024F]/g, '');
}

// Brochure content structure
const BROCHURE_PAGES = [
  {
    title: 'VetBuddy',
    subtitle: 'Il copilota operativo per cliniche veterinarie',
    isCover: true,
    lines: [
      '',
      'Pi\u00F9 prenotazioni. Meno telefonate.',
      'Clienti sempre seguiti.',
      '',
      'Automatizza prenotazioni, reminder, comunicazioni,',
      'referti e follow-up per la tua clinica.',
      '',
      'Pilot Milano 2025',
      '90 giorni per misurare il valore che generiamo per la tua clinica',
      '',
      '-70% Telefonate evitate',
      '+40% Prenotazioni online',
      '15h Risparmiate ogni mese dallo staff',
      '',
      'vetbuddy.it \u2022 info@vetbuddy.it'
    ]
  },
  {
    title: 'Perch\u00E9 VetBuddy?',
    subtitle: 'Non \u00E8 l\'ennesimo gestionale. \u00C8 il copilota operativo.',
    lines: [
      '-70% telefonate evitate grazie a prenotazioni online e reminder',
      '15h risparmiate ogni mese dallo staff della clinica',
      '+25% clienti che tornano grazie a follow-up e richiami automatici',
      '',
      'DUE ECOSISTEMI, UNA PIATTAFORMA:',
      '',
      'Per le Cliniche Veterinarie:',
      '\u2022 Agenda digitale e prenotazioni online',
      '\u2022 Gestione pazienti e cartelle cliniche',
      '\u2022 Fatturazione, ricevute e listino servizi',
      '\u2022 Documenti PDF con invio automatico via email',
      '\u2022 Ricette Elettroniche REV (integrazione Vetinfo)',
      '\u2022 Team inbox e messaggistica clienti',
      '\u2022 44+ automazioni attive 24/7',
      '\u2022 Metriche, report e dashboard fatturato',
      '\u2022 Growth: \u20AC69/mese + IVA - Pilot: gratis 90 giorni',
      '',
      'Per i Proprietari di Animali:',
      '\u2022 Prenota visite online in pochi click',
      '\u2022 Ricevi documenti e referti digitali',
      '\u2022 Profilo completo per ogni animale',
      '\u2022 Reminder automatici per visite e vaccini',
      '\u2022 Programma fedelt\u00E0 e premi',
      '\u2022 100% Gratuito per sempre'
    ]
  },
  {
    title: 'Funzionalit\u00E0 per la Clinica',
    subtitle: 'Tutto ci\u00F2 che serve per digitalizzare la gestione della clinica.',
    lines: [
      'Agenda Digitale:',
      '  Calendario condiviso tra tutto lo staff. Visualizzazione giorno, settimana, mese.',
      '',
      'Prenotazioni Online:',
      '  I clienti prenotano dal profilo pubblico o tramite link diretto e QR code.',
      '',
      'Gestione Pazienti:',
      '  Cartella clinica digitale: specie, razza, peso, allergie, vaccini, storico visite.',
      '',
      'Documenti e PDF:',
      '  Carica referti, prescrizioni, fatture. Invio automatico via email.',
      '',
      'Fatturazione e Pagamenti:',
      '  Fatture, ricevute, listino servizi con prezzi. Export CSV e PDF.',
      '',
      'Team Inbox:',
      '  Messaggistica con ticket, assegnazione staff, priorit\u00E0, template rapidi.',
      '',
      'Metriche e Report:',
      '  Dashboard: prenotazioni, telefonate evitate, fatturato, trend mensili.',
      '',
      'Google Calendar Sync / Video-Consulti / Profilo Pubblico / Programma Fedelt\u00E0'
    ]
  },
  {
    title: 'Modulo Ricetta Elettronica Veterinaria (REV)',
    subtitle: 'VetBuddy \u00E8 un assistente per il flusso prescrittivo, non un emettitore.',
    lines: [
      'IMPORTANTE: VetBuddy supporta la preparazione, organizzazione e',
      'archiviazione del flusso REV. L\'emissione ufficiale della ricetta',
      '\u00E8 sempre responsabilit\u00E0 del medico veterinario abilitato.',
      '',
      'Funzionalit\u00E0 REV:',
      '\u2022 Wizard guidato per la preparazione della prescrizione',
      '\u2022 Selezione farmaco, posologia e durata del trattamento',
      '\u2022 Registrazione manuale numero ricetta e PIN dopo emissione',
      '\u2022 Pubblicazione al proprietario (controllo del veterinario)',
      '\u2022 Storico prescrizioni completo con audit trail',
      '\u2022 Supporto per medicinali ad uso veterinario',
      '',
      'Stato attuale: Modalit\u00E0 assistente/manuale',
      'Prossimo passo: Integrazione diretta API Vetinfo (in sviluppo)'
    ]
  },
  {
    title: '44+ Automazioni Configurabili',
    subtitle: 'Meno lavoro ripetitivo, pi\u00F9 tempo per i pazienti.',
    lines: [
      'Appuntamenti e Prenotazioni:',
      '\u2022 Reminder 24h prima \u2022 Conferma automatica \u2022 Follow-up no-show',
      '',
      'Salute e Prevenzione:',
      '\u2022 Richiami vaccini \u2022 Antiparassitario \u2022 Check-up annuale',
      '\u2022 Ricarica farmaci \u2022 Allerta peso \u2022 Igiene dentale',
      '',
      'Comunicazione e CRM:',
      '\u2022 Compleanno pet \u2022 Benvenuto nuovo paziente \u2022 Richiesta recensione',
      '\u2022 Riattivazione clienti inattivi (6+ mesi)',
      '',
      'Report e Analisi:',
      '\u2022 Report settimanale \u2022 Report mensile \u2022 Riepilogo giornaliero',
      '',
      'Personalizzazione:',
      '\u2022 Timing configurabile (24h, 48h, 14gg, 6 mesi...)',
      '\u2022 Canale: email, notifica app o entrambi',
      '\u2022 Template messaggio con variabili (nome_pet, nome_cliente, data)',
      '\u2022 Cronologia esecuzioni completa'
    ]
  },
  {
    title: 'Lab Marketplace + Esperienza Proprietario',
    subtitle: 'Connetti cliniche e laboratori. Fidelizza i proprietari.',
    lines: [
      'LAB MARKETPLACE:',
      '\u2022 Sfoglia laboratori partner nel marketplace integrato',
      '\u2022 Crea richieste di analisi selezionando paziente ed esame',
      '\u2022 Segui lo stato della richiesta in tempo reale',
      '\u2022 Ricevi il referto, aggiungi note cliniche e pubblica al proprietario',
      '\u2022 Il referto resta riservato fino alla tua revisione',
      '',
      'PERCH\u00C9 L\'ESPERIENZA OWNER AIUTA LA CLINICA:',
      '\u2022 Riduce le telefonate: il proprietario prenota e consulta da solo',
      '\u2022 Aumenta i ritorni: reminder e follow-up riportano i clienti',
      '\u2022 Fidelizza a lungo termine: fedelt\u00E0, comunicazioni, cura costante',
      '\u2022 Meno no-show: promemoria 24h e 1h prima (-60% assenze)',
      '\u2022 Referti senza caos: tutto in app, niente WhatsApp o email perse',
      '\u2022 Passaparola positivo: esperienza digitale moderna = nuovi clienti'
    ]
  },
  {
    title: 'Nuove Funzionalit\u00E0: Piani Salute + AI Assistant',
    subtitle: 'Programmi di prevenzione strutturati e strumenti AI integrati.',
    lines: [
      'PIANI SALUTE:',
      '\u2022 Crea programmi di prevenzione: Piano Cucciolo, Piano Senior, Prevenzione',
      '\u2022 Servizi inclusi: visite, vaccini, esami, trattamenti programmati',
      '\u2022 Assegna piani ai pazienti e monitora il progresso',
      '\u2022 Segna i servizi completati con un click',
      '\u2022 Dashboard: piani attivi, pazienti iscritti, servizi prossimi 30gg',
      '',
      'AI ASSISTANT (Powered by AI):',
      '\u2022 Riassumi Visita: riassunto strutturato dalle note cliniche',
      '\u2022 Scrivi Messaggio: comunicazioni professionali per i proprietari',
      '\u2022 Traduci Note Cliniche: da termini tecnici a linguaggio semplice',
      '\u2022 Risposta Intelligente: risposte ai messaggi dei clienti',
      '',
      'DASHBOARD VALORE GENERATO:',
      '\u2022 Tempo risparmiato \u2022 Telefonate evitate \u2022 Appuntamenti generati',
      '\u2022 Stima fatturato generato dalla piattaforma'
    ]
  },
  {
    title: 'Prezzi',
    subtitle: 'Tutti i prezzi sono IVA esclusa. Annulla quando vuoi.',
    lines: [
      'STARTER - \u20AC29/mese + IVA',
      '  Per veterinari freelance e micro-cliniche.',
      '  1 sede, 1 utente, profilo pubblico, link prenotazione,',
      '  agenda base, reminder base, fino a 30 prenotazioni/mese.',
      '',
      'GROWTH - \u20AC69/mese + IVA (Consigliato)',
      '  Per cliniche piccole e medie.',
      '  Fino a 5 utenti, prenotazioni illimitate, agenda digitale,',
      '  reminder automatici, documenti e PDF, app proprietario,',
      '  inbox, dashboard valore, lab request base.',
      '  Pilot: Growth gratis 90 giorni.',
      '',
      'PRO - \u20AC99/mese + IVA',
      '  Per cliniche strutturate.',
      '  Tutto Growth pi\u00F9: fino a 15 utenti, automazioni avanzate,',
      '  piani salute, programma fedelt\u00E0, lab network completo,',
      '  analytics avanzati, report mensili, AI assistente.',
      '',
      'LAB PARTNER - \u20AC39/mese + IVA',
      '  Per laboratori di analisi.',
      '  Dashboard laboratorio, profilo marketplace, listino prezzi,',
      '  gestione richieste, upload referti PDF, notifiche email.',
      '  Pilot: gratis per 6 mesi.',
      '',
      'Pilot Milano: Piano Growth gratuito per 90 giorni.',
      'Nessun vincolo, nessun costo iniziale.'
    ]
  },
  {
    title: 'Domande Frequenti',
    subtitle: '',
    lines: [
      'D: VetBuddy sostituisce il mio gestionale?',
      'R: No. VetBuddy \u00E8 un copilota operativo che lavora accanto ai tuoi strumenti.',
      '',
      'D: VetBuddy emette la Ricetta Elettronica Veterinaria?',
      'R: No. VetBuddy supporta il flusso. L\'emissione \u00E8 responsabilit\u00E0 del veterinario.',
      '',
      'D: Quanto costa VetBuddy?',
      'R: Starter \u20AC29, Growth \u20AC69 (consigliato), Pro \u20AC99. Lab \u20AC39. IVA esclusa.',
      '',
      'D: Cos\'\u00E8 il Pilot Milano?',
      'R: 90 giorni di Growth gratuito. Nessun vincolo. Se non ti convince, non paghi.',
      '',
      'D: I pagamenti dei clienti passano da VetBuddy?',
      'R: No. VetBuddy incassa solo l\'abbonamento della piattaforma.',
      '',
      'D: Come funziona l\'invio dei referti?',
      'R: Il laboratorio carica il referto. Il veterinario lo rivede e lo pubblica.',
      '',
      'D: VetBuddy \u00E8 gratuito per i proprietari?',
      'R: S\u00EC, completamente gratuito per sempre.',
      '',
      'D: Posso annullare in qualsiasi momento?',
      'R: S\u00EC. Nessun vincolo contrattuale.',
      '',
      'D: Serve formazione tecnica?',
      'R: No. VetBuddy \u00E8 intuitivo. Onboarding incluso e supporto sempre disponibile.'
    ]
  },
  {
    title: 'Contatti',
    subtitle: 'Inizia il Pilot Milano',
    isCTA: true,
    lines: [
      '',
      'Candidati al Pilot Milano 2025:',
      '90 giorni gratuiti per misurare il valore di VetBuddy.',
      '',
      'Web: vetbuddy.it',
      'Email: info@vetbuddy.it',
      '',
      'VetBuddy - Il copilota operativo per cliniche veterinarie.',
      'Pi\u00F9 prenotazioni. Meno telefonate. Clienti sempre seguiti.'
    ]
  }
];

async function generateBrochurePDF() {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 842; // A4 landscape
  const pageHeight = 595;
  const margin = 50;
  const coral = rgb(0.976, 0.42, 0.42);
  const darkGray = rgb(0.15, 0.15, 0.15);
  const medGray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const white = rgb(1, 1, 1);
  const blue = rgb(0.15, 0.39, 0.92);

  for (const pageData of BROCHURE_PAGES) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    if (pageData.isCover) {
      // Cover page with coral background
      page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: coral });
      
      // Paw icon circle
      page.drawCircle({ x: pageWidth / 2, y: pageHeight - 100, size: 30, color: white });
      
      // Title
      const titleText = sanitizeText(pageData.title);
      const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 48);
      page.drawText(titleText, { x: (pageWidth - titleWidth) / 2, y: pageHeight - 180, size: 48, font: helveticaBold, color: white });
      
      // Subtitle
      const subText = sanitizeText(pageData.subtitle);
      const subWidth = helvetica.widthOfTextAtSize(subText, 14);
      page.drawText(subText, { x: (pageWidth - subWidth) / 2, y: pageHeight - 210, size: 14, font: helvetica, color: rgb(1, 1, 1) });

      // Content lines
      y = pageHeight - 260;
      for (const line of pageData.lines) {
        const text = sanitizeText(line);
        if (!text) { y -= 16; continue; }
        const isBold = text.startsWith('-') || text.startsWith('+') || text.includes('Telefonate') || text.includes('Prenotazioni') || text.includes('Risparmiate') || text.includes('Pilot');
        const font = isBold ? helveticaBold : helvetica;
        const size = isBold ? 14 : 12;
        const w = font.widthOfTextAtSize(text, size);
        page.drawText(text, { x: (pageWidth - w) / 2, y, size, font, color: white });
        y -= 20;
      }
    } else if (pageData.isCTA) {
      // CTA page with coral accent
      page.drawRectangle({ x: 0, y: pageHeight - 80, width: pageWidth, height: 80, color: coral });
      
      const titleText = sanitizeText(pageData.title);
      const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 28);
      page.drawText(titleText, { x: (pageWidth - titleWidth) / 2, y: pageHeight - 55, size: 28, font: helveticaBold, color: white });
      
      y = pageHeight - 130;
      for (const line of pageData.lines) {
        const text = sanitizeText(line);
        if (!text) { y -= 18; continue; }
        const isBold = text.includes('vetbuddy') || text.includes('VetBuddy') || text.includes('Candidati') || text.includes('Email') || text.includes('Web');
        const font = isBold ? helveticaBold : helvetica;
        const size = isBold ? 14 : 12;
        const w = font.widthOfTextAtSize(text, size);
        page.drawText(text, { x: (pageWidth - w) / 2, y, size, font, color: isBold ? coral : darkGray });
        y -= 22;
      }
    } else {
      // Normal content page
      // Header bar
      page.drawRectangle({ x: 0, y: pageHeight - 8, width: pageWidth, height: 8, color: coral });
      
      // VetBuddy small logo text
      page.drawText('VetBuddy', { x: pageWidth - margin - 60, y: pageHeight - 30, size: 10, font: helveticaBold, color: coral });
      
      // Title
      const titleText = sanitizeText(pageData.title);
      page.drawText(titleText, { x: margin, y: y - 20, size: 24, font: helveticaBold, color: darkGray });
      y -= 50;
      
      // Subtitle
      if (pageData.subtitle) {
        const subText = sanitizeText(pageData.subtitle);
        page.drawText(subText, { x: margin, y, size: 11, font: helvetica, color: medGray });
        y -= 28;
      }

      // Separator
      page.drawRectangle({ x: margin, y: y + 4, width: 60, height: 3, color: coral });
      y -= 16;

      // Content lines
      for (const line of pageData.lines) {
        if (y < 40) break;
        const text = sanitizeText(line);
        if (!text) { y -= 12; continue; }
        
        const isHeader = text.endsWith(':') && !text.startsWith(' ') && !text.startsWith('\u2022') && !text.startsWith('D:') && !text.startsWith('R:');
        const isBullet = text.startsWith('\u2022');
        const isQuestion = text.startsWith('D:');
        const isAnswer = text.startsWith('R:');
        const isIndented = text.startsWith('  ');
        const isPriceTitle = text.includes('\u20AC') && text.includes('/mese') && !isIndented;

        let font = helvetica;
        let size = 11;
        let color = darkGray;
        let xOffset = margin;

        if (isHeader) { font = helveticaBold; size = 13; color = darkGray; y -= 4; }
        else if (isPriceTitle) { font = helveticaBold; size = 13; color = coral; y -= 4; }
        else if (isBullet) { xOffset = margin + 10; color = medGray; }
        else if (isQuestion) { font = helveticaBold; size = 11; color = darkGray; }
        else if (isAnswer) { color = medGray; xOffset = margin + 5; }
        else if (isIndented) { xOffset = margin + 15; color = medGray; size = 10; }

        // Word wrap for long lines
        const maxWidth = pageWidth - xOffset - margin;
        const words = text.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (font.widthOfTextAtSize(testLine, size) > maxWidth && currentLine) {
            page.drawText(currentLine, { x: xOffset, y, size, font, color });
            y -= size + 4;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          page.drawText(currentLine, { x: xOffset, y, size, font, color });
          y -= size + 5;
        }

        if (isHeader || isPriceTitle) y -= 2;
      }

      // Page number
      const pageNum = BROCHURE_PAGES.indexOf(pageData) + 1;
      const numText = `${pageNum} / ${BROCHURE_PAGES.length}`;
      const numWidth = helvetica.widthOfTextAtSize(numText, 8);
      page.drawText(numText, { x: (pageWidth - numWidth) / 2, y: 20, size: 8, font: helvetica, color: lightGray });
    }
  }

  return pdfDoc.save();
}

export async function GET() {
  try {
    const pdfBytes = await generateBrochurePDF();
    
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="VetBuddy_Brochure_2025.pdf"',
        'Content-Length': pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('Brochure PDF generation error:', error);
    return NextResponse.json({ error: 'Errore nella generazione del PDF' }, { status: 500 });
  }
}
