import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

// ====================== A4 PORTRAIT ======================
const W = 595;  // A4 portrait width
const H = 842;  // A4 portrait height
const M = 50;   // generous margin

// Colors as [r,g,b] for gradients
const _coral = [1.0, 0.42, 0.42];
const _orange = [0.976, 0.451, 0.086];
const _purple = [0.192, 0.180, 0.506];
const _purpleMid = [0.345, 0.110, 0.529];
const _blue = [0.145, 0.388, 0.922];
const _indigo = [0.310, 0.275, 0.898];

// rgb shortcuts
const CORAL = rgb(1.0, 0.42, 0.42);
const ORANGE = rgb(0.976, 0.451, 0.086);
const PURPLE = rgb(0.192, 0.180, 0.506);
const BLUE = rgb(0.145, 0.388, 0.922);
const INDIGO = rgb(0.310, 0.275, 0.898);
const EMERALD = rgb(0.063, 0.725, 0.506);
const EMERALD_BG = rgb(0.93, 0.98, 0.94);
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
const INDIGO_BG = rgb(0.94, 0.94, 0.99);

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

function cx(text, font, size) {
  return (W - font.widthOfTextAtSize(text, size)) / 2;
}

// Gradient fill (top to bottom)
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

// Draw paw print
function drawPaw(page, pcx, pcy, s, color) {
  page.drawEllipse({ x: pcx, y: pcy - 1.5 * s, xScale: 5.5 * s, yScale: 4.2 * s, color });
  page.drawEllipse({ x: pcx - 4.2 * s, y: pcy + 5.5 * s, xScale: 2 * s, yScale: 2.5 * s, color });
  page.drawEllipse({ x: pcx - 1.4 * s, y: pcy + 7.8 * s, xScale: 2 * s, yScale: 2.5 * s, color });
  page.drawEllipse({ x: pcx + 1.4 * s, y: pcy + 7.8 * s, xScale: 2 * s, yScale: 2.5 * s, color });
  page.drawEllipse({ x: pcx + 4.2 * s, y: pcy + 5.5 * s, xScale: 2 * s, yScale: 2.5 * s, color });
}

// Draw VetBuddy logo block (white square + coral paw)
function drawLogo(page, lcx, lcy, size, pawColor, bgColor) {
  const half = size / 2;
  page.drawRectangle({ x: lcx - half, y: lcy - half, width: size, height: size, color: bgColor });
  drawPaw(page, lcx, lcy, size / 28, pawColor);
}

// Bullet dot
function dot(page, x, y, color) {
  page.drawCircle({ x: x + 3, y: y + 3, size: 2.8, color });
}

// Page header with coral bar + logo
function pageHdr(page, f) {
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: CORAL });
  page.drawCircle({ x: 34, y: H - 30, size: 14, color: CORAL });
  drawPaw(page, 34, H - 32, 0.8, WHITE);
  page.drawText('Vet', { x: 54, y: H - 36, size: 12, font: f.b, color: G900 });
  page.drawText('Buddy', { x: 54 + f.b.widthOfTextAtSize('Vet', 12), y: H - 36, size: 12, font: f.b, color: CORAL });
}

// Page number footer
function pageNum(page, num, total, f, light) {
  const t = `${num} / ${total}`;
  page.drawText(t, { x: cx(t, f.r, 8), y: 20, size: 8, font: f.r, color: light ? WHITE : G400, opacity: light ? 0.4 : 1 });
}

// Draw a list of items with dots
function drawList(page, items, x, startY, dotColor, font, fontSize, textColor, lineH, maxW, opacity) {
  let y = startY;
  items.forEach(item => {
    dot(page, x, y - 3, dotColor);
    const lines = wrap(san(item), font, fontSize, maxW - 16);
    lines.forEach(l => {
      page.drawText(l, { x: x + 14, y, size: fontSize, font, color: textColor, opacity: opacity || 1 });
      y -= lineH;
    });
  });
  return y;
}

// ====================================================================
//  PAGE 1: COVER
// ====================================================================
function drawCover(doc, f) {
  const page = doc.addPage([W, H]);
  grad(page, 0, 0, W, H, _coral, _orange);

  // Decorative circles
  page.drawCircle({ x: W - 40, y: H - 60, size: 130, color: WHITE, opacity: 0.07 });
  page.drawCircle({ x: 50, y: 120, size: 90, color: WHITE, opacity: 0.05 });
  page.drawCircle({ x: W - 120, y: 200, size: 50, color: WHITE, opacity: 0.04 });

  // Logo block (white square + coral paw)
  const logoY = H - 220;
  drawLogo(page, W / 2, logoY, 70, CORAL, WHITE);

  // Brand name
  let y = logoY - 60;
  const title = 'VetBuddy';
  page.drawText(title, { x: cx(title, f.b, 48), y, size: 48, font: f.b, color: WHITE });

  // Divider
  y -= 18;
  page.drawRectangle({ x: W / 2 - 30, y, width: 60, height: 2, color: WHITE, opacity: 0.5 });

  // Tagline
  y -= 40;
  const t1 = san('Piu prenotazioni. Meno telefonate.');
  page.drawText(t1, { x: cx(t1, f.r, 16), y, size: 16, font: f.r, color: WHITE });
  y -= 26;
  const t2 = san('Clienti sempre seguiti.');
  page.drawText(t2, { x: cx(t2, f.b, 18), y, size: 18, font: f.b, color: WHITE });

  // Subtitle
  y -= 36;
  const st = san('Il copilota operativo che automatizza prenotazioni,');
  page.drawText(st, { x: cx(st, f.r, 11), y, size: 11, font: f.r, color: WHITE, opacity: 0.85 });
  y -= 16;
  const st2 = san('reminder, comunicazioni, referti e follow-up.');
  page.drawText(st2, { x: cx(st2, f.r, 11), y, size: 11, font: f.r, color: WHITE, opacity: 0.85 });

  // Pilot badge
  y -= 40;
  const bw = 230;
  const bx = (W - bw) / 2;
  page.drawRectangle({ x: bx, y: y - 4, width: bw, height: 36, color: WHITE, opacity: 0.18 });
  page.drawCircle({ x: bx + 20, y: y + 13, size: 5, color: rgb(0.29, 0.87, 0.50) });
  page.drawText('Pilot Milano 2025', { x: bx + 34, y: y + 6, size: 14, font: f.b, color: WHITE });

  y -= 32;
  const pt = san('90 giorni per misurare il valore che generiamo');
  page.drawText(pt, { x: cx(pt, f.r, 9), y, size: 9, font: f.r, color: WHITE, opacity: 0.7 });

  // 3 key numbers
  y -= 65;
  const nums = [
    { n: '-70%', l: 'Telefonate' },
    { n: '+40%', l: 'Prenotazioni online' },
    { n: '15h', l: 'Risparmiate/mese' },
  ];
  const spacing = 155;
  const startX = W / 2 - spacing;
  nums.forEach((s, i) => {
    const nx = startX + i * spacing;
    page.drawText(s.n, { x: nx - f.b.widthOfTextAtSize(s.n, 28) / 2, y: y + 18, size: 28, font: f.b, color: WHITE });
    page.drawText(s.l, { x: nx - f.r.widthOfTextAtSize(s.l, 9) / 2, y, size: 9, font: f.r, color: WHITE, opacity: 0.7 });
  });

  // Footer
  const foot = 'vetbuddy.it  |  info@vetbuddy.it';
  page.drawText(foot, { x: cx(foot, f.r, 8), y: 28, size: 8, font: f.r, color: WHITE, opacity: 0.45 });
}

// ====================================================================
//  PAGE 2: PERCHÉ VETBUDDY
// ====================================================================
function drawWhyPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  pageHdr(page, f);

  let y = H - 70;
  page.drawText(san('Perche VetBuddy?'), { x: M, y, size: 26, font: f.b, color: G900 });
  y -= 22;
  const sub = san("Non e l'ennesimo gestionale. E il copilota che riduce il caos operativo e aumenta le visite ricorrenti.");
  const subL = wrap(sub, f.r, 11, W - 2 * M);
  for (const l of subL) { page.drawText(l, { x: M, y, size: 11, font: f.r, color: G500 }); y -= 16; }
  y -= 20;

  // 3 stat boxes
  const bw = (W - 2 * M - 20) / 3;
  const bh = 80;
  const stats = [
    { n: '-70%', l: 'telefonate evitate grazie a prenotazioni online e reminder' },
    { n: '15h', l: 'risparmiate ogni mese dallo staff della clinica' },
    { n: '+25%', l: 'clienti che tornano grazie a follow-up e richiami' },
  ];
  stats.forEach((s, i) => {
    const sx = M + i * (bw + 10);
    page.drawRectangle({ x: sx, y: y - bh, width: bw, height: bh, color: G50 });
    page.drawRectangle({ x: sx, y: y - 4, width: bw, height: 4, color: CORAL });
    page.drawText(s.n, { x: sx + bw / 2 - f.b.widthOfTextAtSize(s.n, 22) / 2, y: y - 32, size: 22, font: f.b, color: CORAL });
    const sl = wrap(san(s.l), f.r, 7.5, bw - 16);
    let sly = y - 48;
    for (const l of sl) { page.drawText(l, { x: sx + 8, y: sly, size: 7.5, font: f.r, color: G500 }); sly -= 10; }
  });
  y -= bh + 28;

  // Title
  page.drawText('Due ecosistemi, una piattaforma', { x: M, y, size: 16, font: f.b, color: G900 });
  y -= 24;

  // Full width cards stacked
  const cardW = W - 2 * M;
  const cardH = 190;

  // Clinic card
  grad(page, M, y - cardH, cardW, cardH, _coral, _orange);
  let cly = y - 18;
  page.drawText('Per le Cliniche Veterinarie', { x: M + 18, y: cly, size: 15, font: f.b, color: WHITE });
  cly -= 18;
  page.drawText(san("Tutto cio che serve per gestire la tua clinica in modo digitale."), { x: M + 18, y: cly, size: 9, font: f.r, color: WHITE, opacity: 0.8 });
  cly -= 20;
  const clinicF = [
    'Agenda digitale e prenotazioni online', 'Gestione pazienti e cartelle cliniche',
    'Fatturazione, ricevute e listino servizi', 'Documenti PDF con invio automatico via email',
    'Ricette Elettroniche REV (integrazione Vetinfo)', 'Team inbox e messaggistica clienti',
    '44+ automazioni attive 24/7', 'Metriche, report e dashboard fatturato',
  ];
  cly = drawList(page, clinicF, M + 16, cly, WHITE, f.r, 8.5, WHITE, 15, cardW - 32, 0.9);
  // Footer bar
  page.drawRectangle({ x: M + 18, y: y - cardH + 32, width: cardW - 36, height: 0.5, color: WHITE, opacity: 0.3 });
  page.drawText('Growth: Piano consigliato', { x: M + 18, y: y - cardH + 18, size: 9, font: f.b, color: WHITE });
  page.drawText(san('EUR 69/mese + IVA  |  Pilot: gratis 90 giorni'), { x: M + 18, y: y - cardH + 6, size: 7.5, font: f.r, color: WHITE, opacity: 0.7 });

  y -= cardH + 14;

  // Owner card
  const oH = 155;
  grad(page, M, y - oH, cardW, oH, _blue, _indigo);
  let oly = y - 18;
  page.drawText('Per i Proprietari di Animali', { x: M + 18, y: oly, size: 15, font: f.b, color: WHITE });
  oly -= 18;
  page.drawText(san("La salute dei tuoi animali in un'unica app."), { x: M + 18, y: oly, size: 9, font: f.r, color: WHITE, opacity: 0.8 });
  oly -= 20;
  const ownerF = [
    'Prenota visite online in pochi click', 'Ricevi documenti e referti digitali',
    'Profilo completo per ogni animale', 'Reminder automatici per visite e vaccini',
    'Programma fedelta e premi', 'Chat diretta con la clinica',
  ];
  drawList(page, ownerF, M + 16, oly, WHITE, f.r, 8.5, WHITE, 15, cardW - 32, 0.9);
  page.drawRectangle({ x: M + 18, y: y - oH + 24, width: cardW - 36, height: 0.5, color: WHITE, opacity: 0.3 });
  page.drawText('100% Gratuito', { x: M + 18, y: y - oH + 10, size: 9, font: f.b, color: WHITE });

  pageNum(page, 2, 11, f, false);
}

// ====================================================================
//  PAGE 3: FUNZIONALITÀ CLINICA
// ====================================================================
function drawFeaturesPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  pageHdr(page, f);

  let y = H - 68;
  page.drawText(san('Funzionalita per la Clinica'), { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 20;
  page.drawText(san('Tutto cio che serve per digitalizzare la gestione della tua clinica.'), { x: M, y, size: 10, font: f.r, color: G500 });
  y -= 30;

  const features = [
    ['Agenda Digitale', 'Calendario condiviso tra lo staff. Visualizzazione giorno, settimana, mese.'],
    ['Prenotazioni Online', 'I clienti prenotano dal profilo pubblico o tramite link diretto e QR code.'],
    ['Gestione Pazienti', 'Cartella clinica digitale: specie, razza, peso, allergie, vaccini, storico visite.'],
    ['Documenti e PDF', 'Carica referti, prescrizioni, fatture. Invio automatico via email al proprietario.'],
    ['Fatturazione e Pagamenti', 'Fatture, ricevute, listino servizi. Export CSV/PDF. Statistiche fatturato.'],
    ['Team Inbox', 'Messaggistica centralizzata con ticket, assegnazione staff, priorita, template.'],
    ['Metriche e Report', 'Dashboard: prenotazioni, telefonate evitate, fatturato, trend mensili.'],
    ['Google Calendar Sync', 'Sincronizzazione bidirezionale. Appuntamenti visibili su entrambi i calendari.'],
    ['Video-Consulti', 'Consulenze a distanza con videochiamata. Ideale per follow-up post-operatori.'],
    ['Link Prenotazione + QR', 'Link personalizzato da condividere su social, WhatsApp. QR stampabile.'],
    ['Profilo Pubblico', 'Pagina pubblica: servizi, orari, mappa, recensioni. Visibile su Google.'],
    ['Programma Fedelta', 'Sistema a punti per fidelizzare. 100 punti = EUR 5 di sconto. Configurabile.'],
  ];

  const colW = (W - 2 * M - 20) / 2;
  features.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = M + col * (colW + 20);
    const fy = y - row * 58;

    page.drawRectangle({ x: fx, y: fy - 30, width: 3.5, height: 40, color: CORAL });
    page.drawText(san(item[0]), { x: fx + 12, y: fy, size: 10, font: f.b, color: G900 });
    const dL = wrap(san(item[1]), f.r, 8.5, colW - 16);
    let dy = fy - 14;
    for (const l of dL) { page.drawText(l, { x: fx + 12, y: dy, size: 8.5, font: f.r, color: G500 }); dy -= 12; }
  });

  pageNum(page, 3, 11, f, false);
}

// ====================================================================
//  PAGE 4: MODULO REV
// ====================================================================
function drawREVPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  pageHdr(page, f);

  let y = H - 62;
  // Badge
  page.drawRectangle({ x: M, y: y - 1, width: 155, height: 18, color: EMERALD_BG });
  page.drawText('NUOVA FUNZIONALITA', { x: M + 10, y: y + 2, size: 8, font: f.b, color: EMERALD });
  y -= 30;

  page.drawText('Modulo Ricetta Elettronica', { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 24;
  page.drawText('Veterinaria (REV)', { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 20;
  const revSub = wrap(san("VetBuddy aiuta la clinica a gestire il flusso prescrittivo: dalla preparazione alla archiviazione nella cartella clinica."), f.r, 10, W - 2 * M);
  for (const l of revSub) { page.drawText(l, { x: M, y, size: 10, font: f.r, color: G500 }); y -= 15; }
  y -= 18;

  // Two boxes side by side
  const bw = (W - 2 * M - 14) / 2;

  // Green box
  const gbH = 140;
  page.drawRectangle({ x: M, y: y - gbH, width: bw, height: gbH, color: EMERALD_BG });
  page.drawRectangle({ x: M, y: y - gbH, width: bw, height: gbH, borderColor: EMERALD, borderWidth: 1.5 });
  let gy = y - 18;
  page.drawText('Cosa fa VetBuddy', { x: M + 14, y: gy, size: 11, font: f.b, color: rgb(0.04, 0.45, 0.32) });
  gy -= 20;
  gy = drawList(page, [
    'Prepara la bozza dalla scheda paziente',
    'Centralizza farmaci, posologia e durata',
    'Riduce errori e passaggi manuali',
    'Archivia prescrizioni e storico',
    'Rende consultabili i dati autorizzati',
  ], M + 12, gy, EMERALD, f.r, 8.5, G700, 16, bw - 28);

  // Amber box
  const ax = M + bw + 14;
  page.drawRectangle({ x: ax, y: y - gbH, width: bw, height: gbH, color: AMBER_BG });
  page.drawRectangle({ x: ax, y: y - gbH, width: bw, height: gbH, borderColor: AMBER, borderWidth: 1.5 });
  let ay = y - 18;
  page.drawText('Resta al veterinario', { x: ax + 14, y: ay, size: 11, font: f.b, color: rgb(0.55, 0.35, 0.02) });
  ay -= 20;
  drawList(page, [
    "Conferma finale dell'emissione",
    "Utilizzo credenziali e abilitazione",
    "Responsabilita professionale",
  ], ax + 12, ay, AMBER, f.r, 8.5, G700, 16, bw - 28);

  y -= gbH + 24;

  // Two mode boxes
  const mH = 70;
  // Active
  page.drawRectangle({ x: M, y: y - mH, width: bw, height: mH, color: EMERALD_BG });
  page.drawRectangle({ x: M, y: y - mH, width: bw, height: mH, borderColor: EMERALD, borderWidth: 1.5 });
  page.drawRectangle({ x: M + 12, y: y - 4, width: 52, height: 15, color: EMERALD });
  page.drawText('ATTIVO', { x: M + 18, y: y - 1, size: 7.5, font: f.b, color: WHITE });
  page.drawText(san('Modalita guidata/manuale'), { x: M + 14, y: y - 24, size: 9.5, font: f.b, color: rgb(0.04, 0.45, 0.32) });
  const md1 = wrap(san('VetBuddy prepara il flusso e consente di registrare gli estremi della ricetta nel sistema ufficiale.'), f.r, 8, bw - 28);
  let mdy = y - 38;
  for (const l of md1) { page.drawText(l, { x: M + 14, y: mdy, size: 8, font: f.r, color: G500 }); mdy -= 11; }

  // Coming soon
  page.drawRectangle({ x: ax, y: y - mH, width: bw, height: mH, color: G50 });
  page.drawRectangle({ x: ax, y: y - mH, width: bw, height: mH, borderColor: G300, borderWidth: 1 });
  page.drawRectangle({ x: ax + 12, y: y - 4, width: 90, height: 15, color: G400 });
  page.drawText('PROSSIMAMENTE', { x: ax + 16, y: y - 1, size: 7.5, font: f.b, color: WHITE });
  page.drawText('Integrazione ufficiale', { x: ax + 14, y: y - 24, size: 9.5, font: f.b, color: G700 });
  const md2 = wrap(san('VetBuddy inviera e ricevera dati tramite integrazione tecnica con il sistema nazionale.'), f.r, 8, bw - 28);
  mdy = y - 38;
  for (const l of md2) { page.drawText(l, { x: ax + 14, y: mdy, size: 8, font: f.r, color: G500 }); mdy -= 11; }

  y -= mH + 28;

  // Flow in 4 steps
  page.drawText('Flusso in 4 passaggi', { x: M, y, size: 15, font: f.b, color: G900 });
  y -= 24;
  const steps = [
    { num: '01', title: 'Prepara', desc: 'Wizard guidato: paziente, farmaci, posologia, diagnosi.' },
    { num: '02', title: 'Emissione ufficiale', desc: 'Il veterinario completa nel sistema nazionale.' },
    { num: '03', title: 'Registra', desc: 'Inserisci N. ricetta e PIN. Stato aggiornato.' },
    { num: '04', title: 'Archivia', desc: 'Consultabile per clinica e proprietario.' },
  ];
  const sw = (W - 2 * M - 18) / 4;
  const sH = 80;
  steps.forEach((s, i) => {
    const sx = M + i * (sw + 6);
    page.drawRectangle({ x: sx, y: y - sH, width: sw, height: sH, color: G50 });
    page.drawRectangle({ x: sx, y: y - sH, width: sw, height: sH, borderColor: G200, borderWidth: 0.5 });
    page.drawText(`STEP ${s.num}`, { x: sx + 8, y: y - 16, size: 7, font: f.b, color: EMERALD });
    page.drawText(san(s.title), { x: sx + 8, y: y - 30, size: 8.5, font: f.b, color: G900 });
    const dl = wrap(san(s.desc), f.r, 7, sw - 16);
    let dly = y - 44;
    for (const l of dl) { page.drawText(l, { x: sx + 8, y: dly, size: 7, font: f.r, color: G500 }); dly -= 9; }
  });

  y -= sH + 20;

  // Compliance note
  page.drawRectangle({ x: M, y: y - 30, width: W - 2 * M, height: 30, color: AMBER_BG });
  const noteT = san("Nota: L'emissione ufficiale della REV richiede l'abilitazione del medico veterinario. VetBuddy supporta il flusso ma non sostituisce il sistema pubblico.");
  const noteL = wrap(noteT, f.r, 7.5, W - 2 * M - 24);
  let ny = y - 10;
  for (const l of noteL) { page.drawText(l, { x: M + 12, y: ny, size: 7.5, font: f.r, color: rgb(0.55, 0.35, 0.02) }); ny -= 10; }

  pageNum(page, 4, 11, f, false);
}

// ====================================================================
//  PAGE 5: 44+ AUTOMAZIONI (dark)
// ====================================================================
function drawAutoPage(doc, f) {
  const page = doc.addPage([W, H]);
  grad(page, 0, 0, W, H, _purple, _purpleMid);

  // Logo
  page.drawCircle({ x: 36, y: H - 34, size: 16, color: WHITE, opacity: 0.1 });
  drawPaw(page, 36, H - 36, 0.8, WHITE);
  page.drawText('VetBuddy', { x: 58, y: H - 40, size: 11, font: f.b, color: WHITE, opacity: 0.5 });

  let y = H - 76;
  page.drawText('44+ Automazioni che', { x: M, y, size: 24, font: f.b, color: WHITE });
  y -= 28;
  page.drawText('lavorano per te', { x: M, y, size: 24, font: f.b, color: WHITE });
  y -= 18;
  page.drawText(san("Mentre ti occupi dei pazienti, VetBuddy gestisce tutto il resto."), { x: M, y, size: 10, font: f.r, color: WHITE, opacity: 0.55 });
  y -= 32;

  const colW = (W - 2 * M - 30) / 2;
  const lx = M;
  const rx = M + colW + 30;

  // LEFT COLUMN
  let ly = y;
  page.drawText('Promemoria & Reminder', { x: lx, y: ly, size: 9, font: f.b, color: rgb(0.96, 0.76, 0.26) });
  ly -= 16;
  ly = drawList(page, [
    'Reminder appuntamento 24h prima',
    'Reminder appuntamento 1h prima',
    'Reminder vaccino in scadenza',
    'Reminder richiamo vaccino annuale',
    'Reminder antiparassitario',
    'Reminder controllo peso',
    'Reminder visita annuale',
    'Reminder pulizia dentale',
    'Reminder rinnovo prescrizione',
  ], lx - 2, ly, GREEN_CK, f.r, 8, WHITE, 14, colW, 0.85);
  ly -= 14;

  page.drawText('Conferme & Stato', { x: lx, y: ly, size: 9, font: f.b, color: rgb(0.29, 0.87, 0.50) });
  ly -= 16;
  drawList(page, [
    'Conferma prenotazione al cliente',
    'Notifica nuova prenotazione alla clinica',
    'Conferma cancellazione appuntamento',
    'Notifica modifica appuntamento',
    "Notifica lista d'attesa",
    'Conferma pagamento ricevuto',
  ], lx - 2, ly, GREEN_CK, f.r, 8, WHITE, 14, colW, 0.85);

  // RIGHT COLUMN
  let ry = y;
  page.drawText(san('Follow-up & Fidelizzazione'), { x: rx, y: ry, size: 9, font: f.b, color: rgb(0.38, 0.65, 1.0) });
  ry -= 16;
  ry = drawList(page, [
    'Follow-up post-visita (1 giorno)',
    'Follow-up post-chirurgia (3 giorni)',
    'Follow-up post-chirurgia (7 giorni)',
    'Richiesta recensione dopo visita',
    'Email di benvenuto nuovo cliente',
    'Auguri compleanno animale',
    'Auguri compleanno proprietario',
    'Riepilogo visite semestrale',
    'Invito rinnovo piano fedelta',
    'Notifica punti fedelta guadagnati',
  ], rx - 2, ry, GREEN_CK, f.r, 8, WHITE, 14, colW, 0.85);
  ry -= 14;

  page.drawText('Documenti & Lab', { x: rx, y: ry, size: 9, font: f.b, color: rgb(0.73, 0.55, 1.0) });
  ry -= 16;
  drawList(page, [
    'Invio automatico PDF via email',
    'Notifica nuovo documento caricato',
    'Notifica referto lab pronto',
    'Notifica nuova richiesta lab',
    'Report mensile prenotazioni',
    'Report mensile pazienti attivi',
    'Notifica slot agenda vuoti',
    'Email onboarding staff',
  ], rx - 2, ry, GREEN_CK, f.r, 8, WHITE, 14, colW, 0.85);

  page.drawText(san('+ altre automazioni in arrivo. Si attivano con il piano Pro Clinica.'), {
    x: M, y: 28, size: 7, font: f.r, color: WHITE, opacity: 0.3,
  });
  pageNum(page, 5, 11, f, true);
}

// ====================================================================
//  PAGE 6: LAB + OWNER
// ====================================================================
function drawLabOwnerPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  pageHdr(page, f);

  let y = H - 68;
  page.drawText('Modulo Laboratorio', { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 18;
  page.drawText(san('Connetti la clinica con i laboratori partner.'), { x: M, y, size: 10, font: f.r, color: G500 });
  y -= 26;

  const cw = W - 2 * M;
  // Clinic lab card
  const clH = 140;
  page.drawRectangle({ x: M, y: y - clH, width: cw, height: clH, color: BLUE_BG });
  page.drawRectangle({ x: M, y: y - clH, width: cw, height: clH, borderColor: rgb(0.82, 0.87, 1.0), borderWidth: 1 });
  let cly = y - 18;
  page.drawText('Per la Clinica', { x: M + 16, y: cly, size: 13, font: f.b, color: BLUE });
  cly -= 18;
  drawList(page, [
    'Invia richieste di esame dalla scheda paziente',
    'Seleziona laboratorio per distanza, prezzo e tempi',
    'Ricevi notifica quando il referto e pronto',
    'Rivedi il referto, aggiungi note cliniche, invialo al proprietario',
    'Storico completo richieste e referti per paziente',
    'Marketplace laboratori con confronto visivo',
  ], M + 14, cly, BLUE, f.r, 9, G700, 15, cw - 32);

  y -= clH + 14;

  // Lab card
  const lbH = 140;
  page.drawRectangle({ x: M, y: y - lbH, width: cw, height: lbH, color: INDIGO_BG });
  page.drawRectangle({ x: M, y: y - lbH, width: cw, height: lbH, borderColor: rgb(0.80, 0.80, 0.95), borderWidth: 1 });
  let lby = y - 18;
  page.drawText('Per il Laboratorio', { x: M + 16, y: lby, size: 13, font: f.b, color: INDIGO });
  lby -= 18;
  drawList(page, [
    'Dashboard dedicata per gestire richieste ricevute',
    'Aggiorna stato: Ricevuto, In Lavorazione, Pronto',
    'Carica referti PDF con note tecniche',
    'Profilo pubblico nel marketplace VetBuddy',
    'Listino prezzi indicativo e tempi medi',
    'Disponibilita ritiro campioni',
  ], M + 14, lby, INDIGO, f.r, 9, G700, 15, cw - 32);

  y -= lbH + 24;

  // Owner section
  page.drawText(san("Perche l'esperienza Owner aiuta la Clinica"), { x: M, y, size: 16, font: f.b, color: G900 });
  y -= 14;
  page.drawText(san("Il proprietario e il miglior alleato della clinica."), { x: M, y, size: 9.5, font: f.r, color: G500 });
  y -= 22;

  const benefits = [
    ['Riduce le telefonate', 'Il proprietario prenota e consulta da solo.'],
    ['Aumenta i ritorni', 'Reminder e follow-up riportano i clienti.'],
    ['Fidelizza a lungo termine', 'Fedelta, comunicazioni, cura costante.'],
    ['Meno no-show', 'Promemoria automatici (-60% assenze).'],
    ['Referti senza caos', 'Tutto in app, niente WhatsApp perse.'],
    ['Passaparola positivo', 'Esperienza digitale = nuovi clienti.'],
  ];
  const benW = (W - 2 * M - 10) / 2;
  const benH = 50;
  benefits.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = M + col * (benW + 10);
    const by = y - row * (benH + 8) - benH;
    page.drawRectangle({ x: bx, y: by, width: benW, height: benH, color: G50 });
    page.drawText(san(b[0]), { x: bx + 10, y: by + benH - 17, size: 9, font: f.b, color: G900 });
    const bl = wrap(san(b[1]), f.r, 8, benW - 20);
    let bly = by + benH - 32;
    for (const l of bl) { page.drawText(l, { x: bx + 10, y: bly, size: 8, font: f.r, color: G500 }); bly -= 11; }
  });

  pageNum(page, 6, 11, f, false);
}

// ====================================================================
//  PAGE 7: PIANI SALUTE + AI
// ====================================================================
function drawHealthAIPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  pageHdr(page, f);

  let y = H - 62;
  page.drawRectangle({ x: M, y: y - 1, width: 150, height: 18, color: rgb(0.93, 0.93, 1.0) });
  page.drawText('NUOVE FUNZIONALITA', { x: M + 10, y: y + 2, size: 8, font: f.b, color: INDIGO });
  y -= 32;

  page.drawText(san('Piani Salute + AI Assistant'), { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 18;
  page.drawText(san('Programmi di prevenzione e strumenti AI integrati.'), { x: M, y, size: 10, font: f.r, color: G500 });
  y -= 28;

  const cw = W - 2 * M;

  // Health Plans card
  const hpH = 170;
  page.drawRectangle({ x: M, y: y - hpH, width: cw, height: hpH, color: EMERALD_BG });
  page.drawRectangle({ x: M, y: y - hpH, width: cw, height: hpH, borderColor: EMERALD, borderWidth: 1.5 });
  let hy = y - 20;
  page.drawText('Piani Salute', { x: M + 18, y: hy, size: 15, font: f.b, color: rgb(0.04, 0.45, 0.32) });
  hy -= 20;
  page.drawText(san('Programmi di prevenzione strutturati per ogni paziente.'), { x: M + 18, y: hy, size: 9, font: f.r, color: G500 });
  hy -= 22;
  drawList(page, [
    'Crea programmi: Piano Cucciolo, Piano Senior, Prevenzione',
    'Servizi inclusi: visite, vaccini, esami, trattamenti',
    'Assegna piani ai pazienti e monitora il progresso',
    'Segna i servizi completati con un click',
    'Dashboard: piani attivi, pazienti iscritti, prossimi 30gg',
  ], M + 16, hy, EMERALD, f.r, 9, G700, 17, cw - 36);

  y -= hpH + 18;

  // AI Assistant card
  const aiH = 160;
  page.drawRectangle({ x: M, y: y - aiH, width: cw, height: aiH, color: rgb(0.95, 0.93, 1.0) });
  page.drawRectangle({ x: M, y: y - aiH, width: cw, height: aiH, borderColor: INDIGO, borderWidth: 1.5 });
  let aiy = y - 20;
  page.drawText('AI Assistant', { x: M + 18, y: aiy, size: 15, font: f.b, color: INDIGO });
  aiy -= 16;
  page.drawText('Powered by AI', { x: M + 18, y: aiy, size: 8.5, font: f.r, color: G500 });
  aiy -= 22;
  drawList(page, [
    'Riassumi Visita: riassunto strutturato dalle note cliniche',
    'Scrivi Messaggio: comunicazioni professionali per i proprietari',
    'Traduci Note Cliniche: da termini tecnici a linguaggio semplice',
    'Risposta Intelligente: risposte ai messaggi dei clienti',
  ], M + 16, aiy, INDIGO, f.r, 9, G700, 17, cw - 36);

  y -= aiH + 24;

  // Value Dashboard
  const vH = 65;
  page.drawRectangle({ x: M, y: y - vH, width: cw, height: vH, color: G50 });
  page.drawRectangle({ x: M, y: y - vH, width: cw, height: vH, borderColor: G200, borderWidth: 0.5 });
  page.drawText('Dashboard del Valore Generato', { x: M + 18, y: y - 20, size: 13, font: f.b, color: G900 });
  const vdL = wrap(san("Ogni mese VetBuddy ti mostra prenotazioni generate, telefonate evitate, tempo risparmiato e stima fatturato dalla piattaforma."), f.r, 9, cw - 36);
  let vdy = y - 38;
  for (const l of vdL) { page.drawText(l, { x: M + 18, y: vdy, size: 9, font: f.r, color: G500 }); vdy -= 13; }

  pageNum(page, 7, 11, f, false);
}

// ====================================================================
//  PAGE 8: COME FUNZIONA
// ====================================================================
function drawHowItWorks(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: G50 });
  pageHdr(page, f);

  let y = H - 68;
  page.drawText('Come funziona', { x: M, y, size: 24, font: f.b, color: G900 });
  y -= 18;
  page.drawText(san('Inizia in meno di 10 minuti. Nessuna installazione.'), { x: M, y, size: 10, font: f.r, color: G500 });
  y -= 32;

  const steps = [
    { num: '01', title: 'Registrati', desc: 'Crea il tuo account clinica su vetbuddy.it. Compila il profilo: nome, indirizzo, P.IVA, orari di apertura.' },
    { num: '02', title: 'Configura', desc: "Aggiungi servizi con prezzi e durate. Imposta le disponibilita dell'agenda per ogni veterinario." },
    { num: '03', title: 'Importa', desc: 'Invita i tuoi clienti a registrarsi su VetBuddy. Possono trovare la clinica tramite il profilo pubblico.' },
    { num: '04', title: 'Parti!', desc: "I clienti prenotano online. Tu gestisci tutto da un'unica dashboard. Le automazioni fanno il resto." },
  ];

  const sw = (W - 2 * M - 12) / 2;
  const sH = 110;
  steps.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = M + col * (sw + 12);
    const sy = y - row * (sH + 12) - sH;
    page.drawRectangle({ x: sx, y: sy, width: sw, height: sH, color: WHITE });
    page.drawRectangle({ x: sx, y: sy, width: sw, height: sH, borderColor: G200, borderWidth: 1 });
    page.drawText(s.num, { x: sx + 16, y: sy + sH - 34, size: 30, font: f.b, color: CORAL });
    page.drawText(san(s.title), { x: sx + 16, y: sy + sH - 58, size: 12, font: f.b, color: G900 });
    const dl = wrap(san(s.desc), f.r, 8.5, sw - 32);
    let dly = sy + sH - 74;
    for (const l of dl) { page.drawText(l, { x: sx + 16, y: dly, size: 8.5, font: f.r, color: G500 }); dly -= 12; }
  });

  y -= 2 * (sH + 12) + 32;

  // Animals
  const anTitle = 'Per tutti gli animali';
  page.drawText(anTitle, { x: cx(anTitle, f.b, 18), y, size: 18, font: f.b, color: G900 });
  y -= 16;
  const anSub = 'VetBuddy supporta qualsiasi tipo di paziente';
  page.drawText(anSub, { x: cx(anSub, f.r, 9), y, size: 9, font: f.r, color: G500 });
  y -= 30;

  const animals = ['Cani', 'Gatti', 'Cavalli', 'Conigli', 'Uccelli', 'Rettili', 'Roditori', 'Pesci'];
  const anSp = 56;
  const anStart = W / 2 - (animals.length * anSp) / 2 + anSp / 2;
  animals.forEach((a, i) => {
    const ax = anStart + i * anSp;
    page.drawCircle({ x: ax, y: y + 8, size: 16, color: WHITE });
    page.drawCircle({ x: ax, y: y + 8, size: 16, borderColor: G200, borderWidth: 0.5 });
    page.drawText(a, { x: ax - f.b.widthOfTextAtSize(a, 7.5) / 2, y: y - 14, size: 7.5, font: f.b, color: G700 });
  });

  y -= 50;

  // Value box
  const vbw = W - 2 * M - 40;
  const vbx = (W - vbw) / 2;
  page.drawRectangle({ x: vbx, y: y - 60, width: vbw, height: 60, color: WHITE });
  page.drawRectangle({ x: vbx, y: y - 60, width: vbw, height: 60, borderColor: G200, borderWidth: 1 });
  page.drawText('Dashboard del valore generato', { x: vbx + 16, y: y - 18, size: 11, font: f.b, color: G900 });
  const vdL = wrap(san("Ogni mese VetBuddy mostra prenotazioni generate, telefonate evitate e tempo risparmiato."), f.r, 8.5, vbw - 32);
  let vdy = y - 34;
  for (const l of vdL) { page.drawText(l, { x: vbx + 16, y: vdy, size: 8.5, font: f.r, color: G500 }); vdy -= 12; }

  pageNum(page, 8, 11, f, false);
}

// ====================================================================
//  PAGE 9: PREZZI
// ====================================================================
function drawPricingPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  pageHdr(page, f);

  let y = H - 62;
  const title = 'Scegli il piano adatto';
  page.drawText(san(title), { x: cx(san(title), f.b, 22), y, size: 22, font: f.b, color: G900 });
  y -= 16;
  const sub = 'Tutti i prezzi sono IVA esclusa. Annulla quando vuoi.';
  page.drawText(sub, { x: cx(sub, f.r, 9), y, size: 9, font: f.r, color: G500 });
  y -= 28;

  // 2x2 grid
  const cw = (W - 2 * M - 14) / 2;
  const cH = 260;

  const plans = [
    {
      name: 'STARTER', price: '29', sub: 'Per veterinari freelance e micro-cliniche.',
      nameColor: G400, dotColor: GREEN_CK, bg: null, border: G200, borderW: 1, badge: null,
      feats: ['1 sede', '1 utente', 'Profilo pubblico', 'Link prenotazione', 'Agenda base', 'Reminder base', 'Fino a 30 prenotazioni/mese'],
      footer: null,
    },
    {
      name: 'GROWTH', price: '69', sub: 'Per cliniche piccole e medie.',
      nameColor: CORAL, dotColor: CORAL, bg: CORAL_BG, border: CORAL, borderW: 2, badge: 'Consigliato',
      feats: ['Fino a 5 utenti', 'Prenotazioni illimitate', 'Agenda digitale', 'Reminder automatici', 'Documenti e PDF', 'App proprietario', 'Inbox', 'Dashboard valore', 'Lab request base'],
      footer: 'Pilot: Growth gratis 90 giorni',
    },
    {
      name: 'PRO', price: '99', sub: 'Per cliniche strutturate.',
      nameColor: G400, dotColor: GREEN_CK, bg: null, border: G200, borderW: 1, badge: null,
      feats: ['Tutto Growth piu:', 'Fino a 15 utenti', 'Automazioni avanzate', 'Piani salute', 'Programma fedelta', 'Lab Network completo', 'Analytics avanzati', 'Report mensili', 'AI assistente'],
      footer: null,
    },
    {
      name: 'LAB PARTNER', price: '39', sub: 'Per laboratori di analisi.',
      nameColor: BLUE, dotColor: BLUE, bg: BLUE_BG, border: BLUE, borderW: 1.5, badge: null,
      feats: ['Dashboard laboratorio', 'Profilo marketplace', 'Listino prezzi', 'Gestione richieste', 'Upload referti PDF', 'Notifiche email', 'Disponibilita ritiro'],
      footer: 'Pilot: gratis per 6 mesi',
    },
  ];

  plans.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const px = M + col * (cw + 14);
    const py = y - row * (cH + 14) - cH;

    if (p.bg) page.drawRectangle({ x: px, y: py, width: cw, height: cH, color: p.bg });
    page.drawRectangle({ x: px, y: py, width: cw, height: cH, borderColor: p.border, borderWidth: p.borderW });

    // Badge
    if (p.badge) {
      const bw = f.b.widthOfTextAtSize(p.badge, 8) + 18;
      page.drawRectangle({ x: px + cw / 2 - bw / 2, y: py + cH - 5, width: bw, height: 18, color: CORAL });
      page.drawText(p.badge, { x: px + cw / 2 - f.b.widthOfTextAtSize(p.badge, 8) / 2, y: py + cH - 1, size: 8, font: f.b, color: WHITE });
    }

    let ty = py + cH - 28;
    page.drawText(p.name, { x: px + 14, y: ty, size: 8.5, font: f.b, color: p.nameColor });
    ty -= 28;
    page.drawText(san(`EUR ${p.price}`), { x: px + 14, y: ty, size: 26, font: f.b, color: G900 });
    const pw = f.b.widthOfTextAtSize(san(`EUR ${p.price}`), 26);
    page.drawText('/mese + IVA', { x: px + 18 + pw, y: ty + 6, size: 8, font: f.r, color: G500 });
    ty -= 18;
    const sl = wrap(san(p.sub), f.r, 8, cw - 28);
    for (const l of sl) { page.drawText(l, { x: px + 14, y: ty, size: 8, font: f.r, color: G500 }); ty -= 12; }
    ty -= 8;
    page.drawRectangle({ x: px + 14, y: ty + 4, width: cw - 28, height: 0.5, color: G200 });
    ty -= 10;

    p.feats.forEach((feat, fi) => {
      dot(page, px + 12, ty - 3, p.dotColor);
      const bold = fi === 0 && feat.includes(':');
      page.drawText(san(feat), { x: px + 26, y: ty, size: 8.5, font: bold ? f.b : f.r, color: G700 });
      ty -= 15;
    });

    if (p.footer) {
      const fy = py + 14;
      page.drawRectangle({ x: px + 14, y: fy + 12, width: cw - 28, height: 0.5, color: p.nameColor === CORAL ? CORAL : BLUE });
      page.drawText(san(p.footer), { x: px + 14, y: fy, size: 8, font: f.b, color: p.nameColor === CORAL ? CORAL : BLUE });
    }
  });

  // Pilot note
  const noteY = y - 2 * (cH + 14) - 16;
  page.drawRectangle({ x: M, y: noteY, width: W - 2 * M, height: 24, color: CORAL_BG });
  const pilotN = san('Pilot Milano: Growth gratuito 90 giorni. Nessun vincolo.');
  page.drawText(pilotN, { x: cx(pilotN, f.b, 8.5), y: noteY + 7, size: 8.5, font: f.b, color: rgb(0.65, 0.22, 0.22) });

  pageNum(page, 9, 11, f, false);
}

// ====================================================================
//  PAGE 10: FAQ
// ====================================================================
function drawFAQPage(doc, f) {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
  pageHdr(page, f);

  let y = H - 68;
  page.drawText('Domande frequenti', { x: M, y, size: 22, font: f.b, color: G900 });
  y -= 32;

  const faqs = [
    ['VetBuddy sostituisce il mio gestionale?', "No. VetBuddy e un copilota operativo che lavora accanto ai tuoi strumenti attuali per automatizzare prenotazioni, reminder e follow-up."],
    ['VetBuddy emette la Ricetta Elettronica?', "No. VetBuddy supporta il flusso prescrittivo. L'emissione ufficiale resta in capo al medico veterinario abilitato sul sistema nazionale."],
    ['Quanto costa VetBuddy?', 'Starter EUR 29, Growth EUR 69 (consigliato), Pro EUR 99. Laboratori EUR 39. Tutti IVA esclusa.'],
    ["Cos'e il Pilot Milano?", '90 giorni di Growth gratuito per cliniche selezionate. Include onboarding, configurazione e supporto. Nessun vincolo.'],
    ['I pagamenti dei clienti passano da VetBuddy?', "No. I pagamenti delle visite vanno alla clinica. VetBuddy incassa solo l'abbonamento."],
    ["Come funziona l'invio dei referti?", 'Il laboratorio carica il referto. Il veterinario lo rivede, aggiunge note cliniche e lo pubblica al proprietario.'],
    ['Gratuito per i proprietari?', 'Si, completamente gratuito per sempre. Nessun costo nascosto.'],
    ['Posso annullare quando voglio?', 'Si. Nessun vincolo contrattuale. Annulla quando vuoi.'],
    ['Serve formazione tecnica?', "No. VetBuddy e intuitivo. Onboarding incluso e supporto sempre disponibile."],
  ];

  const maxW = W - 2 * M;
  faqs.forEach((faq, i) => {
    if (y < 55) return;
    // Subtle alternating background
    if (i % 2 === 0) {
      page.drawRectangle({ x: M - 8, y: y - 38, width: maxW + 16, height: 52, color: G50 });
    }
    page.drawText(san(faq[0]), { x: M, y, size: 10, font: f.b, color: G900 });
    y -= 16;
    const aL = wrap(san(faq[1]), f.r, 9, maxW);
    for (const l of aL) { page.drawText(l, { x: M, y, size: 9, font: f.r, color: G500 }); y -= 13; }
    y -= 16;
  });

  pageNum(page, 10, 11, f, false);
}

// ====================================================================
//  PAGE 11: CTA FINALE
// ====================================================================
function drawCTAPage(doc, f) {
  const page = doc.addPage([W, H]);
  grad(page, 0, 0, W, H, _coral, _orange);

  // Decorative
  page.drawCircle({ x: W - 30, y: H - 30, size: 100, color: WHITE, opacity: 0.06 });
  page.drawCircle({ x: 60, y: 80, size: 70, color: WHITE, opacity: 0.04 });

  // Logo
  page.drawCircle({ x: 38, y: H - 38, size: 18, color: WHITE, opacity: 0.15 });
  drawPaw(page, 38, H - 40, 0.9, WHITE);
  page.drawText('VetBuddy', { x: 62, y: H - 44, size: 12, font: f.b, color: WHITE, opacity: 0.75 });

  // Main CTA
  let y = H / 2 + 120;
  const c1 = 'Pronto a digitalizzare';
  page.drawText(c1, { x: cx(c1, f.b, 32), y, size: 32, font: f.b, color: WHITE });
  y -= 40;
  const c2 = 'la tua clinica?';
  page.drawText(c2, { x: cx(c2, f.b, 32), y, size: 32, font: f.b, color: WHITE });
  y -= 30;

  const ctaSub = san('Unisciti alle cliniche veterinarie che stanno');
  page.drawText(ctaSub, { x: cx(ctaSub, f.r, 12), y, size: 12, font: f.r, color: WHITE, opacity: 0.8 });
  y -= 18;
  const ctaSub2 = 'gia testando VetBuddy nel Pilot Milano.';
  page.drawText(ctaSub2, { x: cx(ctaSub2, f.r, 12), y, size: 12, font: f.r, color: WHITE, opacity: 0.8 });
  y -= 55;

  // Contact box
  const boxW = 280;
  const boxH = 150;
  const bx = (W - boxW) / 2;
  page.drawRectangle({ x: bx, y: y - boxH, width: boxW, height: boxH, color: WHITE, opacity: 0.12 });

  let cy = y - 28;
  // Web
  page.drawCircle({ x: bx + 28, y: cy + 4, size: 14, color: WHITE, opacity: 0.12 });
  page.drawText('Sito web', { x: bx + 50, y: cy + 6, size: 7.5, font: f.r, color: WHITE, opacity: 0.6 });
  page.drawText('vetbuddy.it', { x: bx + 50, y: cy - 8, size: 12, font: f.b, color: WHITE });
  cy -= 42;

  // Email
  page.drawCircle({ x: bx + 28, y: cy + 4, size: 14, color: WHITE, opacity: 0.12 });
  page.drawText('Email', { x: bx + 50, y: cy + 6, size: 7.5, font: f.r, color: WHITE, opacity: 0.6 });
  page.drawText('info@vetbuddy.it', { x: bx + 50, y: cy - 8, size: 12, font: f.b, color: WHITE });
  cy -= 42;

  // Phone
  page.drawCircle({ x: bx + 28, y: cy + 4, size: 14, color: WHITE, opacity: 0.12 });
  page.drawText('Telefono', { x: bx + 50, y: cy + 6, size: 7.5, font: f.r, color: WHITE, opacity: 0.6 });
  page.drawText('Contattaci via email', { x: bx + 50, y: cy - 8, size: 12, font: f.b, color: WHITE });

  // Footer
  const foot = san('(c) 2025 VetBuddy - Tutti i diritti riservati');
  page.drawText(foot, { x: cx(foot, f.r, 8), y: 28, size: 8, font: f.r, color: WHITE, opacity: 0.4 });
}

// ====================== MAIN GENERATOR ======================
async function generateBrochurePDF() {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const f = { r: reg, b: bold };

  drawCover(doc, f);
  drawWhyPage(doc, f);
  drawFeaturesPage(doc, f);
  drawREVPage(doc, f);
  drawAutoPage(doc, f);
  drawLabOwnerPage(doc, f);
  drawHealthAIPage(doc, f);
  drawHowItWorks(doc, f);
  drawPricingPage(doc, f);
  drawFAQPage(doc, f);
  drawCTAPage(doc, f);

  return doc.save();
}

// ====================== API HANDLER ======================
export async function GET(request) {
  try {
    const pdfBytes = await generateBrochurePDF();
    const { searchParams } = new URL(request.url);
    const forceDownload = searchParams.get('download') === '1';
    
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': forceDownload 
          ? 'attachment; filename="VetBuddy_Brochure_2025.pdf"'
          : 'inline; filename="VetBuddy_Brochure_2025.pdf"',
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Brochure PDF generation error:', error);
    return NextResponse.json({ error: 'Errore nella generazione del PDF' }, { status: 500 });
  }
}
