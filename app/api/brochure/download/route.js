import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

// ====================== CONSTANTS ======================
const W = 842; // A4 landscape
const H = 595;
const M = 48;  // margin

// Brand colors as [r, g, b] arrays for gradient math
const _coral = [1.0, 0.42, 0.42];
const _orange = [0.976, 0.451, 0.086];
const _purple = [0.192, 0.180, 0.506];
const _purpleMid = [0.345, 0.110, 0.529];
const _blue = [0.145, 0.388, 0.922];
const _indigo = [0.310, 0.275, 0.898];

// Handy rgb shortcuts
const CORAL = rgb(1.0, 0.42, 0.42);
const CORAL_DARK = rgb(0.88, 0.30, 0.30);
const ORANGE = rgb(0.976, 0.451, 0.086);
const PURPLE = rgb(0.192, 0.180, 0.506);
const PURPLE_MID = rgb(0.345, 0.110, 0.529);
const BLUE = rgb(0.145, 0.388, 0.922);
const INDIGO = rgb(0.310, 0.275, 0.898);
const EMERALD = rgb(0.063, 0.725, 0.506);
const EMERALD_BG = rgb(0.92, 0.97, 0.93);
const AMBER = rgb(0.961, 0.620, 0.043);
const AMBER_BG = rgb(0.99, 0.96, 0.91);
const WHITE = rgb(1, 1, 1);
const G900 = rgb(0.11, 0.11, 0.14);
const G700 = rgb(0.30, 0.30, 0.36);
const G500 = rgb(0.42, 0.42, 0.48);
const G400 = rgb(0.60, 0.60, 0.64);
const G300 = rgb(0.78, 0.78, 0.81);
const G200 = rgb(0.87, 0.87, 0.89);
const G100 = rgb(0.94, 0.94, 0.95);
const G50 = rgb(0.97, 0.97, 0.97);
const GREEN_CK = rgb(0.22, 0.80, 0.44);
const CORAL_BG = rgb(1.0, 0.95, 0.94);
const BLUE_BG = rgb(0.94, 0.96, 1.0);
const INDIGO_BG = rgb(0.93, 0.93, 0.99);

// ====================== HELPERS ======================
function san(t) {
  if (!t) return '';
  return t.replace(/[\u2018\u2019\u0060]/g, "'").replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, ' - ').replace(/\u2013/g, '-').replace(/\u2026/g, '...');
}

function wrap(text, font, size, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function centerX(text, font, size) {
  return (W - font.widthOfTextAtSize(text, size)) / 2;
}

// Vertical gradient (top color → bottom color)
function grad(page, x, y, w, h, c1, c2, steps = 50) {
  const sh = h / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    page.drawRectangle({
      x, y: y + h - (i + 1) * sh, width: w, height: sh + 0.5,
      color: rgb(c1[0] + t * (c2[0] - c1[0]), c1[1] + t * (c2[1] - c1[1]), c1[2] + t * (c2[2] - c1[2])),
    });
  }
}

// Draw a paw print icon using circles/ellipses
function paw(page, cx, cy, s, color) {
  // Main pad
  page.drawEllipse({ x: cx, y: cy - 1.5 * s, xScale: 5 * s, yScale: 4 * s, color });
  // Toes
  page.drawEllipse({ x: cx - 4 * s, y: cy + 5 * s, xScale: 1.8 * s, yScale: 2.3 * s, color });
  page.drawEllipse({ x: cx - 1.3 * s, y: cy + 7.2 * s, xScale: 1.8 * s, yScale: 2.3 * s, color });
  page.drawEllipse({ x: cx + 1.3 * s, y: cy + 7.2 * s, xScale: 1.8 * s, yScale: 2.3 * s, color });
  page.drawEllipse({ x: cx + 4 * s, y: cy + 5 * s, xScale: 1.8 * s, yScale: 2.3 * s, color });
}

// Small colored bullet dot
function dot(page, x, y, color) {
  page.drawCircle({ x: x + 3, y: y + 3.5, size: 3, color });
}

// Header bar + VetBuddy logo for content pages
function hdr(page, f) {
  page.drawRectangle({ x: 0, y: H - 10, width: W, height: 10, color: CORAL });
  // Paw icon
  page.drawCircle({ x: 32, y: H - 32, size: 12, color: CORAL });
  paw(page, 32, H - 34, 0.7, WHITE);
  page.drawText('VetBuddy', { x: 50, y: H - 37, size: 11, font: f.b, color: CORAL });
}

// Page number
function pNum(page, num, total, f, dark = false) {
  const t = `${num} / ${total}`;
  page.drawText(t, { x: centerX(t, f.r, 8), y: 16, size: 8, font: f.r, color: dark ? rgb(1, 1, 1, 0.4) : G400 });
}

// Draw feature item with left colored bar
function feat(page, x, y, title, desc, f, maxW) {
  page.drawRectangle({ x, y: y - 1, width: 3, height: 30, color: CORAL });
  page.drawText(san(title), { x: x + 10, y: y + 15, size: 10, font: f.b, color: G900 });
  const lines = wrap(san(desc), f.r, 8.5, maxW - 14);
  let ly = y + 2;
  for (const l of lines) {
    page.drawText(l, { x: x + 10, y: ly, size: 8.5, font: f.r, color: G500 });
    ly -= 11;
  }
  return ly;
}

// ====================== PAGE GENERATORS ======================

// ─── PAGE 1: COVER ───
function drawCover(doc, f) {
  const page = doc.addPage([W, H]);

  // Background gradient
  grad(page, 0, 0, W, H, _coral, _orange);

  // Decorative circles
  page.drawCircle({ x: W - 90, y: H - 80, size: 120, color: WHITE, opacity: 0.08 });
  page.drawCircle({ x: 80, y: 80, size: 80, color: WHITE, opacity: 0.06 });
  page.drawCircle({ x: W - 200, y: 50, size: 50, color: WHITE, opacity: 0.05 });

  // Logo box
  const lcx = W / 2;
  const lcy = H - 115;
  page.drawRectangle({ x: lcx - 30, y: lcy - 30, width: 60, height: 60, color: WHITE });
  paw(page, lcx, lcy, 1.8, CORAL);

  // Title
  const title = 'VetBuddy';
  page.drawText(title, { x: centerX(title, f.b, 52), y: H - 195, size: 52, font: f.b, color: WHITE });

  // Divider
  page.drawRectangle({ x: W / 2 - 30, y: H - 210, width: 60, height: 2, color: WHITE, opacity: 0.5 });

  // Tagline line 1
  const t1 = san('Piu prenotazioni. Meno telefonate.');
  page.drawText(t1, { x: centerX(t1, f.r, 18), y: H - 240, size: 18, font: f.r, color: WHITE });
  // Tagline line 2
  const t2 = san('Clienti sempre seguiti.');
  page.drawText(t2, { x: centerX(t2, f.b, 20), y: H - 265, size: 20, font: f.b, color: WHITE });

  // Sub-tagline
  const st1 = san('Il copilota operativo che automatizza prenotazioni, reminder,');
  const st2 = san('comunicazioni, referti e follow-up per la tua clinica.');
  page.drawText(st1, { x: centerX(st1, f.r, 11), y: H - 295, size: 11, font: f.r, color: WHITE, opacity: 0.85 });
  page.drawText(st2, { x: centerX(st2, f.r, 11), y: H - 310, size: 11, font: f.r, color: WHITE, opacity: 0.85 });

  // Pilot badge
  const bw = 240;
  const bx = (W - bw) / 2;
  const by = H - 360;
  page.drawRectangle({ x: bx, y: by, width: bw, height: 34, color: WHITE, opacity: 0.2 });
  page.drawRectangle({ x: bx, y: by, width: bw, height: 34, borderColor: WHITE, borderWidth: 1.5, opacity: 0.3 });
  // Green dot
  page.drawCircle({ x: bx + 18, y: by + 17, size: 5, color: rgb(0.29, 0.87, 0.50) });
  const pilotT = 'Pilot Milano 2025';
  page.drawText(pilotT, { x: bx + 30, y: by + 10, size: 13, font: f.b, color: WHITE });

  // Sub-pilot text
  const pt = san('90 giorni per misurare il valore che generiamo per la tua clinica');
  page.drawText(pt, { x: centerX(pt, f.r, 9), y: by - 18, size: 9, font: f.r, color: WHITE, opacity: 0.75 });

  // 3 key numbers
  const nums = [
    { n: '-70%', l: 'Telefonate' },
    { n: '+40%', l: 'Prenotazioni online' },
    { n: '15h', l: 'Risparmiate/mese' },
  ];
  const numY = 75;
  const numSpacing = 180;
  const numStartX = W / 2 - numSpacing;
  nums.forEach((s, i) => {
    const nx = numStartX + i * numSpacing;
    page.drawText(s.n, { x: nx - f.b.widthOfTextAtSize(s.n, 28) / 2, y: numY + 15, size: 28, font: f.b, color: WHITE });
    page.drawText(s.l, { x: nx - f.r.widthOfTextAtSize(s.l, 9) / 2, y: numY - 5, size: 9, font: f.r, color: WHITE, opacity: 0.7 });
  });

  // Footer
  const foot = 'vetbuddy.it  -  info@vetbuddy.it';
  page.drawText(foot, { x: centerX(foot, f.r, 8), y: 22, size: 8, font: f.r, color: WHITE, opacity: 0.5 });
}

// ─── PAGE 2: PERCHÉ VETBUDDY ───
function drawWhyPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  hdr(page, f);

  let y = H - 65;
  page.drawText(san('Perche VetBuddy?'), { x: M, y, size: 28, font: f.b, color: G900 });
  y -= 22;
  const sub = san("Non e l'ennesimo gestionale. E il copilota che riduce il caos operativo e aumenta le visite ricorrenti.");
  const subLines = wrap(sub, f.r, 11, W - 2 * M);
  for (const l of subLines) { page.drawText(l, { x: M, y, size: 11, font: f.r, color: G500 }); y -= 15; }
  y -= 10;

  // 3 stat boxes
  const statW = (W - 2 * M - 24) / 3;
  const stats = [
    { n: '-70%', l: 'telefonate evitate grazie a prenotazioni online e reminder automatici' },
    { n: '15h', l: 'risparmiate ogni mese dallo staff della clinica' },
    { n: '+25%', l: 'clienti che tornano grazie a follow-up e richiami automatici' },
  ];
  stats.forEach((s, i) => {
    const sx = M + i * (statW + 12);
    const sy = y - 70;
    page.drawRectangle({ x: sx, y: sy, width: statW, height: 70, color: G50 });
    page.drawRectangle({ x: sx, y: sy + 64, width: statW, height: 6, color: CORAL });
    page.drawText(s.n, { x: sx + statW / 2 - f.b.widthOfTextAtSize(s.n, 26) / 2, y: sy + 38, size: 26, font: f.b, color: CORAL });
    const sLines = wrap(san(s.l), f.r, 8, statW - 16);
    let sly = sy + 20;
    for (const l of sLines) {
      page.drawText(l, { x: sx + 8, y: sly, size: 8, font: f.r, color: G500 });
      sly -= 10;
    }
  });
  y -= 100;

  // Two ecosystems title
  page.drawText('Due ecosistemi, una piattaforma', { x: M, y, size: 16, font: f.b, color: G900 });
  y -= 20;

  // Clinic card (coral gradient)
  const cardW = (W - 2 * M - 16) / 2;
  const cardH = 215;
  const cy = y - cardH;

  // Clinic card background
  grad(page, M, cy, cardW, cardH, _coral, _orange);
  let cly = cy + cardH - 22;
  page.drawText('Per le Cliniche Veterinarie', { x: M + 14, y: cly, size: 14, font: f.b, color: WHITE });
  cly -= 16;
  page.drawText(san("Tutto cio che serve per gestire la tua clinica in modo digitale."), { x: M + 14, y: cly, size: 8.5, font: f.r, color: WHITE, opacity: 0.8 });
  cly -= 18;
  const clinicFeats = [
    'Agenda digitale e prenotazioni online',
    'Gestione pazienti e cartelle cliniche',
    'Fatturazione, ricevute e listino servizi',
    'Documenti PDF con invio automatico via email',
    'Ricette Elettroniche REV (integrazione Vetinfo)',
    'Team inbox e messaggistica clienti',
    '44+ automazioni attive 24/7',
    'Metriche, report e dashboard fatturato',
  ];
  clinicFeats.forEach(feat => {
    dot(page, M + 12, cly - 3, WHITE);
    page.drawText(san(feat), { x: M + 24, y: cly, size: 8, font: f.r, color: WHITE, opacity: 0.9 });
    cly -= 13;
  });
  // Divider
  page.drawRectangle({ x: M + 14, y: cly + 2, width: cardW - 28, height: 0.5, color: WHITE, opacity: 0.3 });
  cly -= 10;
  page.drawText('Growth: Piano consigliato', { x: M + 14, y: cly, size: 9, font: f.b, color: WHITE });
  cly -= 12;
  page.drawText(san('EUR 69/mese + IVA - Pilot: gratis 90 giorni'), { x: M + 14, y: cly, size: 7.5, font: f.r, color: WHITE, opacity: 0.7 });

  // Owner card (blue gradient)
  const ox = M + cardW + 16;
  grad(page, ox, cy, cardW, cardH, _blue, _indigo);
  let oly = cy + cardH - 22;
  page.drawText('Per i Proprietari di Animali', { x: ox + 14, y: oly, size: 14, font: f.b, color: WHITE });
  oly -= 16;
  page.drawText(san("La salute dei tuoi animali in un'unica app."), { x: ox + 14, y: oly, size: 8.5, font: f.r, color: WHITE, opacity: 0.8 });
  oly -= 18;
  const ownerFeats = [
    'Prenota visite online in pochi click',
    'Ricevi documenti e referti digitali',
    'Profilo completo per ogni animale',
    'Reminder automatici per visite e vaccini',
    'Programma fedelta e premi',
    'Chat diretta con la clinica',
  ];
  ownerFeats.forEach(feat => {
    dot(page, ox + 12, oly - 3, WHITE);
    page.drawText(san(feat), { x: ox + 24, y: oly, size: 8, font: f.r, color: WHITE, opacity: 0.9 });
    oly -= 13;
  });
  page.drawRectangle({ x: ox + 14, y: oly + 2, width: cardW - 28, height: 0.5, color: WHITE, opacity: 0.3 });
  oly -= 10;
  page.drawText('100% Gratuito', { x: ox + 14, y: oly, size: 9, font: f.b, color: WHITE });
  oly -= 12;
  page.drawText('Per sempre, nessun costo nascosto', { x: ox + 14, y: oly, size: 7.5, font: f.r, color: WHITE, opacity: 0.7 });

  pNum(page, 2, 10, f);
}

// ─── PAGE 3: FUNZIONALITÀ CLINICA ───
function drawFeaturesPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  hdr(page, f);

  let y = H - 62;
  page.drawText(san('Funzionalita per la Clinica'), { x: M, y, size: 24, font: f.b, color: G900 });
  y -= 18;
  page.drawText(san('Tutto cio che serve per digitalizzare la gestione della tua clinica veterinaria.'), { x: M, y, size: 10, font: f.r, color: G500 });
  y -= 24;

  const features = [
    ['Agenda Digitale', 'Calendario condiviso tra tutto lo staff. Visualizzazione per giorno, settimana e mese. Gestione disponibilita per veterinario.'],
    ['Prenotazioni Online', 'I clienti prenotano dal profilo pubblico della clinica o tramite link diretto e QR code. Nessuna telefonata.'],
    ['Gestione Pazienti', 'Cartella clinica digitale per ogni animale: specie, razza, peso, allergie, vaccinazioni, storico visite.'],
    ['Documenti e PDF', 'Carica referti, prescrizioni, fatture in PDF. Invia automaticamente via email al proprietario.'],
    ['Fatturazione e Pagamenti', 'Crea fatture e ricevute dalla piattaforma. Listino servizi, export CSV/PDF. Statistiche fatturato.'],
    ['Team Inbox', 'Messaggistica centralizzata con assegnazione ticket allo staff. Priorita, template, chat diretta.'],
    ['Metriche e Report', 'Dashboard con prenotazioni, telefonate evitate, fatturato, tassi di conversione, trend mensili.'],
    ['Google Calendar Sync', 'Sincronizzazione bidirezionale con Google Calendar. Appuntamenti visibili su entrambi.'],
    ['Video-Consulti', 'Consulenze veterinarie a distanza con videochiamata integrata. Ideale per follow-up.'],
    ['Link Prenotazione + QR Code', 'Link personalizzato da condividere su social, WhatsApp, sito web. QR Code stampabile.'],
    ['Profilo Pubblico', 'Pagina pubblica con servizi, orari, mappa, recensioni. Visibile su Google.'],
    ['Programma Fedelta', 'Sistema a punti per fidelizzare i clienti. 100 punti = EUR 5 di sconto. Configurabile.'],
  ];

  const colW = (W - 2 * M - 24) / 2;
  const leftX = M;
  const rightX = M + colW + 24;
  let ly = y;
  let ry = y;

  features.forEach((item, i) => {
    const isRight = i % 2 === 1;
    const x = isRight ? rightX : leftX;
    let cy = isRight ? ry : ly;

    // Left accent bar
    page.drawRectangle({ x, y: cy - 24, width: 3, height: 36, color: CORAL });
    page.drawText(san(item[0]), { x: x + 10, y: cy, size: 10, font: f.b, color: G900 });
    const dLines = wrap(san(item[1]), f.r, 8, colW - 14);
    let dl = cy - 13;
    for (const l of dLines) {
      page.drawText(l, { x: x + 10, y: dl, size: 8, font: f.r, color: G500 });
      dl -= 10;
    }

    const bottom = dl - 8;
    if (isRight) ry = bottom; else ly = bottom;
  });

  pNum(page, 3, 10, f);
}

// ─── PAGE 4: MODULO REV ───
function drawREVPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  hdr(page, f);

  let y = H - 58;
  // Badge
  page.drawRectangle({ x: M, y: y - 2, width: 150, height: 18, color: EMERALD_BG });
  page.drawText('NUOVA FUNZIONALITA', { x: M + 10, y: y + 1, size: 8, font: f.b, color: EMERALD });
  y -= 26;
  page.drawText('Modulo Ricetta Elettronica Veterinaria', { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 17;
  const revSub = wrap(san("VetBuddy aiuta la clinica a gestire il flusso prescrittivo in modo ordinato e digitale: dalla preparazione della prescrizione alla sua archiviazione."), f.r, 9, W - 2 * M);
  for (const l of revSub) { page.drawText(l, { x: M, y, size: 9, font: f.r, color: G500 }); y -= 12; }
  y -= 10;

  // Two columns
  const colW = (W - 2 * M - 16) / 2;

  // Green box - Cosa fa VetBuddy
  page.drawRectangle({ x: M, y: y - 120, width: colW, height: 120, color: EMERALD_BG });
  page.drawRectangle({ x: M, y: y - 120, width: colW, height: 120, borderColor: EMERALD, borderWidth: 1.5 });
  let gy = y - 14;
  page.drawText('Cosa fa VetBuddy', { x: M + 12, y: gy, size: 11, font: f.b, color: rgb(0.04, 0.45, 0.32) });
  gy -= 16;
  const greenItems = [
    'Prepara la bozza dalla scheda paziente',
    'Centralizza farmaci, posologia e durata',
    'Riduce errori e passaggi manuali',
    'Archivia prescrizioni e storico',
    'Rende consultabili i dati autorizzati',
  ];
  greenItems.forEach(item => {
    dot(page, M + 10, gy - 3, EMERALD);
    page.drawText(san(item), { x: M + 22, y: gy, size: 8.5, font: f.r, color: G700 });
    gy -= 14;
  });

  // Amber box - Cosa resta al veterinario
  const ax = M + colW + 16;
  page.drawRectangle({ x: ax, y: y - 120, width: colW, height: 120, color: AMBER_BG });
  page.drawRectangle({ x: ax, y: y - 120, width: colW, height: 120, borderColor: AMBER, borderWidth: 1.5 });
  let ay = y - 14;
  page.drawText('Cosa resta in capo al veterinario', { x: ax + 12, y: ay, size: 11, font: f.b, color: rgb(0.55, 0.35, 0.02) });
  ay -= 16;
  const amberItems = [
    "Conferma finale dell'emissione",
    "Utilizzo delle credenziali e dell'abilitazione previste",
    "Responsabilita professionale della prescrizione",
  ];
  amberItems.forEach(item => {
    dot(page, ax + 10, ay - 3, AMBER);
    page.drawText(san(item), { x: ax + 22, y: ay, size: 8.5, font: f.r, color: G700 });
    ay -= 14;
  });

  y -= 140;

  // Two mode boxes
  const modeW = (W - 2 * M - 16) / 2;
  const modeH = 60;

  // Active mode
  page.drawRectangle({ x: M, y: y - modeH, width: modeW, height: modeH, color: EMERALD_BG });
  page.drawRectangle({ x: M, y: y - modeH, width: modeW, height: modeH, borderColor: EMERALD, borderWidth: 1.5 });
  page.drawRectangle({ x: M + 10, y: y - 5, width: 50, height: 14, color: EMERALD });
  page.drawText('ATTIVO', { x: M + 16, y: y - 2, size: 7, font: f.b, color: WHITE });
  page.drawText(san('Modalita guidata/manuale'), { x: M + 12, y: y - 22, size: 9, font: f.b, color: rgb(0.04, 0.45, 0.32) });
  const modeDesc1 = wrap(san('VetBuddy prepara il flusso e consente di registrare gli estremi della ricetta emessa nel sistema ufficiale.'), f.r, 7.5, modeW - 24);
  let md1y = y - 35;
  for (const l of modeDesc1) { page.drawText(l, { x: M + 12, y: md1y, size: 7.5, font: f.r, color: G500 }); md1y -= 10; }

  // Coming soon mode
  const mx = M + modeW + 16;
  page.drawRectangle({ x: mx, y: y - modeH, width: modeW, height: modeH, color: G50 });
  page.drawRectangle({ x: mx, y: y - modeH, width: modeW, height: modeH, borderColor: G300, borderWidth: 1 });
  page.drawRectangle({ x: mx + 10, y: y - 5, width: 85, height: 14, color: G400 });
  page.drawText('PROSSIMAMENTE', { x: mx + 14, y: y - 2, size: 7, font: f.b, color: WHITE });
  page.drawText('Integrazione ufficiale', { x: mx + 12, y: y - 22, size: 9, font: f.b, color: G700 });
  const modeDesc2 = wrap(san('VetBuddy invia e riceve i dati tramite integrazione tecnica con il sistema ufficiale.'), f.r, 7.5, modeW - 24);
  let md2y = y - 35;
  for (const l of modeDesc2) { page.drawText(l, { x: mx + 12, y: md2y, size: 7.5, font: f.r, color: G500 }); md2y -= 10; }

  y -= modeH + 18;

  // Flow in 4 steps
  page.drawText('Flusso in 4 passaggi', { x: M, y, size: 14, font: f.b, color: G900 });
  y -= 20;

  const steps = [
    { num: '01', title: 'Prepara', desc: 'Wizard guidato: paziente, farmaci, posologia, diagnosi.' },
    { num: '02', title: 'Emissione', desc: 'Il veterinario completa nel sistema nazionale.' },
    { num: '03', title: 'Registra', desc: 'Inserisci N. ricetta e PIN. Stato aggiornato.' },
    { num: '04', title: 'Archivia', desc: 'Consultabile per clinica e proprietario.' },
  ];
  const stepW = (W - 2 * M - 24) / 4;
  steps.forEach((s, i) => {
    const sx = M + i * (stepW + 8);
    page.drawRectangle({ x: sx, y: y - 65, width: stepW, height: 65, color: G50 });
    page.drawRectangle({ x: sx, y: y - 65, width: stepW, height: 65, borderColor: G200, borderWidth: 0.5 });
    page.drawText(`STEP ${s.num}`, { x: sx + 8, y: y - 14, size: 7, font: f.b, color: EMERALD });
    page.drawText(san(s.title), { x: sx + 8, y: y - 28, size: 9, font: f.b, color: G900 });
    const dLines = wrap(san(s.desc), f.r, 7, stepW - 16);
    let dy = y - 40;
    for (const l of dLines) { page.drawText(l, { x: sx + 8, y: dy, size: 7, font: f.r, color: G500 }); dy -= 9; }
  });

  // Compliance note at bottom
  const noteY = 40;
  page.drawRectangle({ x: M, y: noteY, width: W - 2 * M, height: 28, color: AMBER_BG });
  const noteText = san("Nota: L'emissione ufficiale della REV richiede l'abilitazione del medico veterinario al sistema nazionale. VetBuddy supporta il flusso operativo ma non sostituisce il sistema pubblico.");
  const noteLines = wrap(noteText, f.r, 7, W - 2 * M - 20);
  let ny = noteY + 18;
  for (const l of noteLines) { page.drawText(l, { x: M + 10, y: ny, size: 7, font: f.r, color: rgb(0.55, 0.35, 0.02) }); ny -= 9; }

  pNum(page, 4, 10, f);
}

// ─── PAGE 5: 44+ AUTOMAZIONI ───
function drawAutomationsPage(doc, f) {
  const page = doc.addPage([W, H]);
  // Dark purple gradient background
  grad(page, 0, 0, W, H, _purple, _purpleMid);

  // Logo
  page.drawRectangle({ x: 26, y: H - 42, width: 28, height: 28, color: WHITE, opacity: 0.1 });
  paw(page, 40, H - 30, 0.8, WHITE);
  page.drawText('VetBuddy', { x: 60, y: H - 35, size: 10, font: f.b, color: WHITE, opacity: 0.6 });

  let y = H - 72;
  page.drawText('44+ Automazioni che lavorano per te', { x: M, y, size: 24, font: f.b, color: WHITE });
  y -= 17;
  page.drawText(san("Mentre ti occupi dei pazienti, VetBuddy gestisce automaticamente comunicazioni e follow-up."), { x: M, y, size: 10, font: f.r, color: WHITE, opacity: 0.6 });
  y -= 28;

  const colW = (W - 2 * M - 40) / 2;
  const leftX = M;
  const rightX = M + colW + 40;

  // Left column
  let ly = y;
  // Promemoria
  page.drawText('Promemoria & Reminder', { x: leftX, y: ly, size: 9, font: f.b, color: rgb(0.96, 0.76, 0.26) });
  ly -= 14;
  const reminders = [
    'Reminder appuntamento 24h prima (email)',
    'Reminder appuntamento 1h prima (email)',
    'Reminder vaccino in scadenza',
    'Reminder richiamo vaccino annuale',
    'Reminder trattamento antiparassitario',
    'Reminder controllo peso periodico',
    'Reminder visita annuale di routine',
    'Reminder pulizia dentale',
    'Reminder rinnovo prescrizione',
  ];
  reminders.forEach(item => {
    dot(page, leftX - 2, ly - 3, GREEN_CK);
    page.drawText(san(item), { x: leftX + 10, y: ly, size: 8, font: f.r, color: WHITE, opacity: 0.85 });
    ly -= 12;
  });
  ly -= 10;

  // Conferme
  page.drawText('Conferme & Stato', { x: leftX, y: ly, size: 9, font: f.b, color: rgb(0.29, 0.87, 0.50) });
  ly -= 14;
  const confirms = [
    'Conferma prenotazione al cliente',
    'Notifica nuova prenotazione alla clinica',
    'Conferma cancellazione appuntamento',
    'Notifica modifica appuntamento',
    "Notifica lista d'attesa (posto libero)",
    'Conferma pagamento ricevuto',
  ];
  confirms.forEach(item => {
    dot(page, leftX - 2, ly - 3, GREEN_CK);
    page.drawText(san(item), { x: leftX + 10, y: ly, size: 8, font: f.r, color: WHITE, opacity: 0.85 });
    ly -= 12;
  });

  // Right column
  let ry = y;
  // Follow-up
  page.drawText(san('Follow-up & Fidelizzazione'), { x: rightX, y: ry, size: 9, font: f.b, color: rgb(0.38, 0.65, 1.0) });
  ry -= 14;
  const followups = [
    'Follow-up post-visita (1 giorno dopo)',
    'Follow-up post-chirurgia (3 giorni dopo)',
    'Follow-up post-chirurgia (7 giorni dopo)',
    'Richiesta recensione dopo visita',
    'Email di benvenuto nuovo cliente',
    'Auguri compleanno animale',
    'Auguri compleanno proprietario',
    'Email di riepilogo visite semestrale',
    'Invito rinnovo piano fedelta',
    'Notifica nuovi punti fedelta guadagnati',
  ];
  followups.forEach(item => {
    dot(page, rightX - 2, ry - 3, GREEN_CK);
    page.drawText(san(item), { x: rightX + 10, y: ry, size: 8, font: f.r, color: WHITE, opacity: 0.85 });
    ry -= 12;
  });
  ry -= 10;

  // Documenti & Lab
  page.drawText('Documenti & Lab', { x: rightX, y: ry, size: 9, font: f.b, color: rgb(0.73, 0.55, 1.0) });
  ry -= 14;
  const docs = [
    'Invio automatico documento PDF via email',
    'Notifica nuovo documento caricato',
    'Notifica referto lab pronto',
    'Notifica nuova richiesta lab (al laboratorio)',
    'Notifica stato richiesta aggiornato',
    'Report mensile prenotazioni alla clinica',
    'Report mensile pazienti attivi',
    'Notifica slot agenda vuoti (alert)',
    'Email onboarding staff (nuovo membro)',
  ];
  docs.forEach(item => {
    dot(page, rightX - 2, ry - 3, GREEN_CK);
    page.drawText(san(item), { x: rightX + 10, y: ry, size: 8, font: f.r, color: WHITE, opacity: 0.85 });
    ry -= 12;
  });

  // Footer note
  page.drawText(san('+ altre automazioni in arrivo con ogni aggiornamento. Le automazioni si attivano automaticamente con il piano Pro Clinica.'), {
    x: M, y: 22, size: 7, font: f.r, color: WHITE, opacity: 0.35,
  });

  pNum(page, 5, 10, f, true);
}

// ─── PAGE 6: LAB + OWNER ───
function drawLabOwnerPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  hdr(page, f);

  let y = H - 62;
  page.drawText('Modulo Laboratorio di Analisi', { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 16;
  page.drawText(san('Connetti la clinica con i laboratori partner. Richiedi esami, ricevi referti, confronta prezzi e tempi.'), { x: M, y, size: 9.5, font: f.r, color: G500 });
  y -= 20;

  const cardW = (W - 2 * M - 16) / 2;
  const cardH = 150;

  // Clinic lab card
  page.drawRectangle({ x: M, y: y - cardH, width: cardW, height: cardH, color: BLUE_BG });
  page.drawRectangle({ x: M, y: y - cardH, width: cardW, height: cardH, borderColor: rgb(0.82, 0.87, 1.0), borderWidth: 1 });
  let cly = y - 16;
  page.drawText('Per la Clinica', { x: M + 12, y: cly, size: 12, font: f.b, color: BLUE });
  cly -= 16;
  const clinicLab = [
    'Invia richieste di esame dalla scheda paziente',
    'Seleziona laboratorio per distanza, prezzo e tempi',
    'Ricevi notifica quando il referto e pronto',
    'Rivedi il referto, aggiungi note cliniche, invialo al proprietario',
    'Storico completo richieste e referti per paziente',
    'Marketplace laboratori con confronto visivo',
  ];
  clinicLab.forEach(item => {
    dot(page, M + 10, cly - 3, BLUE);
    page.drawText(san(item), { x: M + 22, y: cly, size: 8, font: f.r, color: G700 });
    cly -= 13;
  });

  // Lab card
  const lx = M + cardW + 16;
  page.drawRectangle({ x: lx, y: y - cardH, width: cardW, height: cardH, color: INDIGO_BG });
  page.drawRectangle({ x: lx, y: y - cardH, width: cardW, height: cardH, borderColor: rgb(0.80, 0.80, 0.95), borderWidth: 1 });
  let lly = y - 16;
  page.drawText('Per il Laboratorio', { x: lx + 12, y: lly, size: 12, font: f.b, color: INDIGO });
  lly -= 16;
  const labFeats = [
    'Dashboard dedicata per gestire le richieste ricevute',
    'Aggiorna stato: Ricevuto, In Lavorazione, Pronto',
    'Carica referti PDF con note tecniche',
    'Profilo pubblico nel marketplace VetBuddy',
    'Inserisci listino prezzi indicativo e tempi medi',
    'Indica disponibilita ritiro campioni',
  ];
  labFeats.forEach(item => {
    dot(page, lx + 10, lly - 3, INDIGO);
    page.drawText(san(item), { x: lx + 22, y: lly, size: 8, font: f.r, color: G700 });
    lly -= 13;
  });

  y -= cardH + 18;

  // Owner section
  page.drawText(san("Perche l'esperienza Owner aiuta la Clinica"), { x: M, y, size: 16, font: f.b, color: G900 });
  y -= 14;
  page.drawText(san("Il proprietario e il miglior alleato della clinica. Piu e soddisfatto, piu torna."), { x: M, y, size: 9, font: f.r, color: G500 });
  y -= 20;

  const benefits = [
    ['Riduce le telefonate', 'Il proprietario prenota, consulta referti e riceve reminder da solo.'],
    ['Aumenta i ritorni', 'Reminder e follow-up automatici riportano i clienti per vaccini e controlli.'],
    ['Fidelizza a lungo termine', 'Programma fedelta, comunicazioni dirette e cura costante.'],
    ['Meno no-show', 'Promemoria automatici 24h e 1h prima riducono le assenze (-60%).'],
    ['Referti senza caos', 'Il proprietario riceve i referti in app. Niente WhatsApp o email perse.'],
    ['Passaparola positivo', "Un'esperienza digitale moderna genera recensioni e nuovi clienti."],
  ];
  const benW = (W - 2 * M - 16) / 3;
  const benH = 52;
  benefits.forEach((b, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = M + col * (benW + 8);
    const by = y - row * (benH + 8) - benH;
    page.drawRectangle({ x: bx, y: by, width: benW, height: benH, color: G50 });
    page.drawRectangle({ x: bx, y: by, width: benW, height: benH, borderColor: G200, borderWidth: 0.5 });
    page.drawText(san(b[0]), { x: bx + 8, y: by + benH - 16, size: 9, font: f.b, color: G900 });
    const bLines = wrap(san(b[1]), f.r, 7.5, benW - 16);
    let bly = by + benH - 30;
    for (const l of bLines) { page.drawText(l, { x: bx + 8, y: bly, size: 7.5, font: f.r, color: G500 }); bly -= 9; }
  });

  pNum(page, 6, 10, f);
}

// ─── PAGE 7: PIANI SALUTE + AI ───
function drawHealthAIPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  hdr(page, f);

  let y = H - 58;
  // Badge
  page.drawRectangle({ x: M, y: y - 2, width: 140, height: 18, color: rgb(0.93, 0.93, 1.0) });
  page.drawText('NUOVE FUNZIONALITA', { x: M + 10, y: y + 1, size: 8, font: f.b, color: INDIGO });
  y -= 28;

  page.drawText(san('Piani Salute + AI Assistant'), { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 16;
  page.drawText(san('Programmi di prevenzione strutturati e strumenti AI integrati.'), { x: M, y, size: 10, font: f.r, color: G500 });
  y -= 24;

  // Piani Salute section
  const colW = (W - 2 * M - 20) / 2;

  // Health Plans card
  page.drawRectangle({ x: M, y: y - 195, width: colW, height: 195, color: EMERALD_BG });
  page.drawRectangle({ x: M, y: y - 195, width: colW, height: 195, borderColor: EMERALD, borderWidth: 1.5 });
  let hy = y - 16;
  page.drawText('Piani Salute', { x: M + 14, y: hy, size: 14, font: f.b, color: rgb(0.04, 0.45, 0.32) });
  hy -= 18;
  const healthFeats = [
    'Crea programmi di prevenzione: Cucciolo, Senior, Prevenzione',
    'Servizi inclusi: visite, vaccini, esami, trattamenti',
    'Assegna piani ai pazienti e monitora il progresso',
    'Segna i servizi completati con un click',
    'Dashboard: piani attivi, pazienti iscritti, prossimi 30gg',
  ];
  healthFeats.forEach(item => {
    dot(page, M + 12, hy - 3, EMERALD);
    page.drawText(san(item), { x: M + 24, y: hy, size: 8.5, font: f.r, color: G700 });
    hy -= 15;
  });

  // AI Assistant card
  const aix = M + colW + 20;
  page.drawRectangle({ x: aix, y: y - 195, width: colW, height: 195, color: rgb(0.95, 0.93, 1.0) });
  page.drawRectangle({ x: aix, y: y - 195, width: colW, height: 195, borderColor: INDIGO, borderWidth: 1.5 });
  let aiy = y - 16;
  page.drawText('AI Assistant', { x: aix + 14, y: aiy, size: 14, font: f.b, color: INDIGO });
  aiy -= 16;
  page.drawText('Powered by AI', { x: aix + 14, y: aiy, size: 8, font: f.r, color: G500 });
  aiy -= 16;
  const aiFeats = [
    'Riassumi Visita: riassunto strutturato dalle note cliniche',
    'Scrivi Messaggio: comunicazioni professionali per i proprietari',
    'Traduci Note Cliniche: da termini tecnici a linguaggio semplice',
    'Risposta Intelligente: risposte ai messaggi dei clienti',
  ];
  aiFeats.forEach(item => {
    dot(page, aix + 12, aiy - 3, INDIGO);
    page.drawText(san(item), { x: aix + 24, y: aiy, size: 8.5, font: f.r, color: G700 });
    aiy -= 15;
  });

  y -= 220;

  // Dashboard Valore box
  page.drawRectangle({ x: M, y: y - 55, width: W - 2 * M, height: 55, color: G50 });
  page.drawRectangle({ x: M, y: y - 55, width: W - 2 * M, height: 55, borderColor: G200, borderWidth: 0.5 });
  page.drawText('Dashboard del Valore Generato', { x: M + 16, y: y - 18, size: 12, font: f.b, color: G900 });
  const dashDesc = wrap(san("Ogni mese VetBuddy ti mostra prenotazioni generate, telefonate evitate, tempo risparmiato e stima fatturato dalla piattaforma."), f.r, 8.5, W - 2 * M - 32);
  let dy = y - 33;
  for (const l of dashDesc) { page.drawText(l, { x: M + 16, y: dy, size: 8.5, font: f.r, color: G500 }); dy -= 11; }

  pNum(page, 7, 10, f);
}

// ─── PAGE 8: COME FUNZIONA ───
function drawHowItWorksPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: G50 });
  hdr(page, f);

  let y = H - 62;
  page.drawText('Come funziona', { x: M, y, size: 24, font: f.b, color: G900 });
  y -= 16;
  page.drawText(san('Inizia in meno di 10 minuti. Nessuna installazione, nessun hardware.'), { x: M, y, size: 10, font: f.r, color: G500 });
  y -= 28;

  const steps = [
    { num: '01', title: 'Registrati', desc: 'Crea il tuo account clinica su vetbuddy.it. Compila il profilo: nome, indirizzo, P.IVA, orari.' },
    { num: '02', title: 'Configura', desc: "Aggiungi servizi con prezzi e durate. Imposta le disponibilita dell'agenda per ogni veterinario." },
    { num: '03', title: 'Importa', desc: 'Invita i tuoi clienti a registrarsi su VetBuddy. Possono trovare la clinica tramite il profilo pubblico.' },
    { num: '04', title: 'Parti!', desc: "I clienti prenotano online. Tu gestisci tutto da un'unica dashboard. Le automazioni fanno il resto." },
  ];

  const stepW = (W - 2 * M - 24) / 4;
  const stepH = 110;
  steps.forEach((s, i) => {
    const sx = M + i * (stepW + 8);
    page.drawRectangle({ x: sx, y: y - stepH, width: stepW, height: stepH, color: WHITE });
    page.drawRectangle({ x: sx, y: y - stepH, width: stepW, height: stepH, borderColor: G200, borderWidth: 1 });
    // Number
    page.drawText(s.num, { x: sx + 12, y: y - 30, size: 28, font: f.b, color: CORAL });
    page.drawText(san(s.title), { x: sx + 12, y: y - 50, size: 11, font: f.b, color: G900 });
    const dLines = wrap(san(s.desc), f.r, 8, stepW - 24);
    let dy = y - 65;
    for (const l of dLines) { page.drawText(l, { x: sx + 12, y: dy, size: 8, font: f.r, color: G500 }); dy -= 10; }
  });
  y -= stepH + 26;

  // Animals section
  page.drawText('Per tutti gli animali', { x: centerX('Per tutti gli animali', f.b, 18), y, size: 18, font: f.b, color: G900 });
  y -= 14;
  const anSub = 'VetBuddy supporta qualsiasi tipo di paziente';
  page.drawText(anSub, { x: centerX(anSub, f.r, 9), y, size: 9, font: f.r, color: G500 });
  y -= 28;

  const animals = ['Cani', 'Gatti', 'Cavalli', 'Conigli', 'Uccelli', 'Rettili', 'Roditori', 'Pesci'];
  const anSpacing = 75;
  const anStartX = W / 2 - (animals.length * anSpacing) / 2 + anSpacing / 2;
  animals.forEach((a, i) => {
    const ax = anStartX + i * anSpacing;
    // Draw a small circle as placeholder for animal icon
    page.drawCircle({ x: ax, y: y + 10, size: 16, color: WHITE });
    page.drawCircle({ x: ax, y: y + 10, size: 16, borderColor: G200, borderWidth: 1 });
    page.drawText(a, { x: ax - f.r.widthOfTextAtSize(a, 8) / 2, y: y - 12, size: 8, font: f.b, color: G700 });
  });
  y -= 42;

  // Value dashboard box
  const boxW = 380;
  const boxH = 55;
  const bx = (W - boxW) / 2;
  page.drawRectangle({ x: bx, y: y - boxH, width: boxW, height: boxH, color: WHITE });
  page.drawRectangle({ x: bx, y: y - boxH, width: boxW, height: boxH, borderColor: G200, borderWidth: 1 });
  page.drawText('Dashboard del valore generato', { x: bx + 16, y: y - 18, size: 11, font: f.b, color: G900 });
  const vdLines = wrap(san("Ogni mese VetBuddy ti mostra quante prenotazioni ha generato, quante telefonate ti ha evitato e quanto tempo hai risparmiato."), f.r, 8, boxW - 32);
  let vdy = y - 32;
  for (const l of vdLines) { page.drawText(l, { x: bx + 16, y: vdy, size: 8, font: f.r, color: G500 }); vdy -= 10; }

  pNum(page, 8, 10, f);
}

// ─── PAGE 9: PREZZI ───
function drawPricingPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  hdr(page, f);

  let y = H - 58;
  const title = 'Scegli il piano adatto alla tua clinica';
  page.drawText(san(title), { x: centerX(san(title), f.b, 22), y, size: 22, font: f.b, color: G900 });
  y -= 16;
  const sub = 'Tutti i prezzi sono IVA esclusa. Puoi annullare in qualsiasi momento.';
  page.drawText(sub, { x: centerX(sub, f.r, 9), y, size: 9, font: f.r, color: G500 });
  y -= 28;

  const cardW = (W - 2 * M - 24) / 4;
  const cardH = 310;
  const cardY = y - cardH;

  const plans = [
    {
      name: 'STARTER', price: '29', sub: 'Per veterinari freelance e micro-cliniche.',
      color: G400, accent: GREEN_CK, bgColor: null, highlight: false,
      features: ['1 sede', '1 utente', 'Profilo pubblico', 'Link prenotazione', 'Agenda base', 'Reminder base', 'Fino a 30 prenotazioni/mese'],
      footer: null,
    },
    {
      name: 'GROWTH', price: '69', sub: 'Per cliniche piccole e medie.',
      color: CORAL, accent: CORAL, bgColor: CORAL_BG, highlight: true,
      features: ['Fino a 5 utenti', 'Prenotazioni illimitate', 'Agenda digitale', 'Reminder automatici', 'Documenti e PDF', 'App proprietario', 'Inbox', 'Dashboard valore', 'Lab request base'],
      footer: 'Pilot: Growth gratis 90 giorni',
    },
    {
      name: 'PRO', price: '99', sub: 'Per cliniche strutturate.',
      color: G400, accent: GREEN_CK, bgColor: null, highlight: false,
      features: ['Tutto Growth piu:', 'Fino a 15 utenti', 'Automazioni avanzate', 'Piani salute', 'Programma fedelta', 'Lab Network completo', 'Analytics avanzati', 'Report mensili', 'AI assistente'],
      footer: null,
    },
    {
      name: 'LAB PARTNER', price: '39', sub: 'Per laboratori di analisi.',
      color: BLUE, accent: BLUE, bgColor: BLUE_BG, highlight: false,
      features: ['Dashboard laboratorio', 'Profilo marketplace', 'Listino prezzi', 'Gestione richieste', 'Upload referti PDF', 'Notifiche email', 'Disponibilita ritiro'],
      footer: 'Pilot: gratis per 6 mesi',
    },
  ];

  plans.forEach((plan, i) => {
    const cx = M + i * (cardW + 8);

    // Card background
    if (plan.bgColor) {
      page.drawRectangle({ x: cx, y: cardY, width: cardW, height: cardH, color: plan.bgColor });
    }

    // Card border
    const bColor = plan.highlight ? CORAL : G200;
    const bWidth = plan.highlight ? 2 : 1;
    page.drawRectangle({ x: cx, y: cardY, width: cardW, height: cardH, borderColor: bColor, borderWidth: bWidth });

    // Highlight badge
    if (plan.highlight) {
      const badge = 'Consigliato';
      const bw = f.b.widthOfTextAtSize(badge, 8) + 16;
      page.drawRectangle({ x: cx + cardW / 2 - bw / 2, y: cardY + cardH - 4, width: bw, height: 16, color: CORAL });
      page.drawText(badge, { x: cx + cardW / 2 - f.b.widthOfTextAtSize(badge, 8) / 2, y: cardY + cardH, size: 8, font: f.b, color: WHITE });
    }

    let py = cardY + cardH - 24;

    // Plan name
    page.drawText(plan.name, { x: cx + 10, y: py, size: 8, font: f.b, color: plan.color });
    py -= 22;

    // Price
    page.drawText(san(`EUR ${plan.price}`), { x: cx + 10, y: py, size: 24, font: f.b, color: G900 });
    const priceW = f.b.widthOfTextAtSize(san(`EUR ${plan.price}`), 24);
    page.drawText('/mese + IVA', { x: cx + 14 + priceW, y: py + 4, size: 8, font: f.r, color: G500 });
    py -= 16;

    // Sub description
    const sLines = wrap(san(plan.sub), f.r, 7.5, cardW - 20);
    for (const l of sLines) { page.drawText(l, { x: cx + 10, y: py, size: 7.5, font: f.r, color: G500 }); py -= 10; }
    py -= 8;

    // Separator
    page.drawRectangle({ x: cx + 10, y: py + 4, width: cardW - 20, height: 0.5, color: G200 });
    py -= 10;

    // Features
    plan.features.forEach((feat, fi) => {
      dot(page, cx + 8, py - 3, plan.accent);
      const isBold = fi === 0 && feat.includes(':');
      page.drawText(san(feat), { x: cx + 20, y: py, size: 8, font: isBold ? f.b : f.r, color: G700 });
      py -= 13;
    });

    // Footer
    if (plan.footer) {
      py = cardY + 16;
      page.drawRectangle({ x: cx + 10, y: py + 10, width: cardW - 20, height: 0.5, color: plan.highlight ? CORAL : BLUE });
      page.drawText(san(plan.footer), { x: cx + 10, y: py, size: 7.5, font: f.b, color: plan.highlight ? CORAL : BLUE });
    }
  });

  // Pilot note at bottom
  const noteY = cardY - 26;
  page.drawRectangle({ x: M, y: noteY, width: W - 2 * M, height: 22, color: CORAL_BG });
  const pilotNote = san('Pilot Milano: Piano Growth gratuito per 90 giorni. Nessun vincolo, nessun costo iniziale. Se non ti convince, non paghi nulla.');
  page.drawText(pilotNote, { x: centerX(pilotNote, f.r, 8), y: noteY + 6, size: 8, font: f.r, color: rgb(0.65, 0.22, 0.22) });

  pNum(page, 9, 10, f);
}

// ─── PAGE 10: FAQ ───
function drawFAQPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  hdr(page, f);

  let y = H - 62;
  page.drawText('Domande frequenti', { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 26;

  const faqs = [
    ['VetBuddy sostituisce il mio gestionale?', "No. VetBuddy e un copilota operativo che lavora accanto ai tuoi strumenti attuali per automatizzare prenotazioni, reminder, comunicazioni e follow-up."],
    ['VetBuddy emette la Ricetta Elettronica Veterinaria?', "No. VetBuddy supporta la preparazione, la gestione e l'archiviazione del flusso prescrittivo. L'emissione ufficiale resta in capo al medico veterinario abilitato."],
    ['Quanto costa VetBuddy?', 'Starter EUR 29, Growth EUR 69 (consigliato), Pro EUR 99. Laboratori EUR 39. Tutti i prezzi IVA esclusa.'],
    ["Cos'e il Pilot Milano?", '90 giorni di piano Growth gratuito per cliniche selezionate. Include onboarding, configurazione e supporto. Nessun vincolo.'],
    ['I pagamenti dei clienti passano da VetBuddy?', "No. I pagamenti delle visite vanno direttamente alla clinica. VetBuddy incassa esclusivamente l'abbonamento della piattaforma."],
    ["Come funziona l'invio dei referti?", 'Il laboratorio carica il referto. Il veterinario lo rivede, aggiunge note cliniche e decide quando pubblicarlo al proprietario.'],
    ['VetBuddy e gratuito per i proprietari?', 'Si, completamente gratuito per sempre. Nessun costo nascosto.'],
    ['Posso annullare in qualsiasi momento?', 'Si. Nessun vincolo contrattuale. Puoi annullare quando vuoi.'],
    ['Serve una formazione tecnica?', "No. VetBuddy e progettato per essere intuitivo. L'onboarding e incluso e il supporto e sempre disponibile."],
  ];

  const maxW = W - 2 * M;
  faqs.forEach((faq, i) => {
    if (y < 50) return;
    // Alternating background
    if (i % 2 === 0) {
      page.drawRectangle({ x: M - 6, y: y - 30, width: maxW + 12, height: 44, color: G50 });
    }

    page.drawText(san(faq[0]), { x: M, y, size: 10, font: f.b, color: G900 });
    y -= 14;
    const aLines = wrap(san(faq[1]), f.r, 8.5, maxW);
    for (const l of aLines) {
      page.drawText(l, { x: M, y, size: 8.5, font: f.r, color: G500 });
      y -= 11;
    }
    y -= 10;
  });

  pNum(page, 10, 10, f);
}

// ─── PAGE 11: CTA FINALE ───
function drawCTAPage(doc, f) {
  const page = doc.addPage([W, H]);

  // Full gradient background
  grad(page, 0, 0, W, H, _coral, _orange);

  // Logo
  page.drawRectangle({ x: 30, y: H - 44, width: 30, height: 30, color: WHITE, opacity: 0.15 });
  paw(page, 45, H - 31, 0.8, WHITE);
  page.drawText('VetBuddy', { x: 66, y: H - 36, size: 11, font: f.b, color: WHITE, opacity: 0.8 });

  // Decorative circles
  page.drawCircle({ x: W - 60, y: H - 40, size: 80, color: WHITE, opacity: 0.06 });
  page.drawCircle({ x: 100, y: 60, size: 60, color: WHITE, opacity: 0.05 });

  // Main CTA text
  let y = H / 2 + 80;
  const cta1 = 'Pronto a digitalizzare';
  const cta2 = 'la tua clinica?';
  page.drawText(cta1, { x: centerX(cta1, f.b, 38), y, size: 38, font: f.b, color: WHITE });
  y -= 44;
  page.drawText(cta2, { x: centerX(cta2, f.b, 38), y, size: 38, font: f.b, color: WHITE });
  y -= 28;

  const ctaSub = san('Unisciti alle cliniche veterinarie che stanno gia testando VetBuddy nel Pilot Milano.');
  page.drawText(ctaSub, { x: centerX(ctaSub, f.r, 12), y, size: 12, font: f.r, color: WHITE, opacity: 0.8 });
  y -= 50;

  // Contact box
  const boxW = 320;
  const boxH = 130;
  const bx = (W - boxW) / 2;
  page.drawRectangle({ x: bx, y: y - boxH, width: boxW, height: boxH, color: WHITE, opacity: 0.12 });
  page.drawRectangle({ x: bx, y: y - boxH, width: boxW, height: boxH, borderColor: WHITE, borderWidth: 1, opacity: 0.2 });

  let cy = y - 24;
  // Web
  page.drawCircle({ x: bx + 28, y: cy + 4, size: 12, color: WHITE, opacity: 0.15 });
  page.drawText('Sito web', { x: bx + 48, y: cy + 4, size: 7, font: f.r, color: WHITE, opacity: 0.6 });
  page.drawText('vetbuddy.it', { x: bx + 48, y: cy - 8, size: 11, font: f.b, color: WHITE });
  cy -= 36;

  // Email
  page.drawCircle({ x: bx + 28, y: cy + 4, size: 12, color: WHITE, opacity: 0.15 });
  page.drawText('Email', { x: bx + 48, y: cy + 4, size: 7, font: f.r, color: WHITE, opacity: 0.6 });
  page.drawText('info@vetbuddy.it', { x: bx + 48, y: cy - 8, size: 11, font: f.b, color: WHITE });
  cy -= 36;

  // Phone
  page.drawCircle({ x: bx + 28, y: cy + 4, size: 12, color: WHITE, opacity: 0.15 });
  page.drawText('Telefono', { x: bx + 48, y: cy + 4, size: 7, font: f.r, color: WHITE, opacity: 0.6 });
  page.drawText('Contattaci via email', { x: bx + 48, y: cy - 8, size: 11, font: f.b, color: WHITE });

  // Footer
  const foot = san('(c) 2025 VetBuddy - Tutti i diritti riservati');
  page.drawText(foot, { x: centerX(foot, f.r, 8), y: 22, size: 8, font: f.r, color: WHITE, opacity: 0.4 });
}

// ====================== MAIN GENERATOR ======================
async function generateBrochurePDF() {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const f = { r: reg, b: bold };

  drawCover(doc, f);          // Page 1
  drawWhyPage(doc, f);        // Page 2
  drawFeaturesPage(doc, f);   // Page 3
  drawREVPage(doc, f);        // Page 4
  drawAutomationsPage(doc, f);// Page 5
  drawLabOwnerPage(doc, f);   // Page 6
  drawHealthAIPage(doc, f);   // Page 7
  drawHowItWorksPage(doc, f); // Page 8
  drawPricingPage(doc, f);    // Page 9
  drawFAQPage(doc, f);        // Page 10
  drawCTAPage(doc, f);        // Page 11

  return doc.save();
}

// ====================== API HANDLER ======================
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
