import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const CONSENT_TITLES = {
  chirurgia: 'Consenso Informato alla Procedura Chirurgica',
  anestesia: 'Consenso Informato all\'Anestesia',
  trattamento: 'Consenso al Trattamento Terapeutico',
  privacy: 'Informativa Privacy e Trattamento Dati (GDPR)',
  pubblicazione: 'Autorizzazione alla Pubblicazione di Immagini',
  passport: 'Autorizzazione alla Condivisione del Passport Sanitario',
  preventivo: 'Approvazione Preventivo'
};

const CONSENT_TEXTS = {
  chirurgia: 'Dichiaro di essere stato informato dal medico veterinario sulla natura della procedura chirurgica proposta, sulle modalit\u00e0 di esecuzione, sui rischi connessi e sulle possibili alternative. Autorizzo l\'esecuzione della procedura indicata sul mio animale.',
  anestesia: 'Dichiaro di essere stato informato sui rischi connessi alla sedazione/anestesia, che verranno adottate tutte le precauzioni del caso e che potrebbero rendersi necessari esami pre-anestesiologici. Autorizzo la procedura anestesiologica indicata.',
  trattamento: 'Dichiaro di essere stato informato sulla terapia proposta, sulle modalit\u00e0 di somministrazione e sui possibili effetti collaterali. Autorizzo il trattamento indicato e mi impegno a seguire le indicazioni del veterinario.',
  privacy: 'Dichiaro di aver preso visione dell\'informativa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR). Acconsento al trattamento dei miei dati personali e di quelli del mio animale per finalit\u00e0 di gestione sanitaria, amministrativa e di comunicazione da parte della clinica.',
  pubblicazione: 'Autorizzo la clinica a utilizzare fotografie e/o video del mio animale per le finalit\u00e0 indicate (es. documentazione clinica, sito web, social media), senza riconoscimento di compensi e con possibilit\u00e0 di revoca in qualsiasi momento.',
  passport: 'Autorizzo la condivisione dei dati sanitari contenuti nel Passport del mio animale con i soggetti indicati (es. pet sitter, familiare, altra struttura veterinaria), limitatamente alle finalit\u00e0 di cura e custodia.',
  preventivo: 'Dichiaro di aver preso visione del preventivo indicato e di approvarne il contenuto e gli importi. Resta inteso che eventuali prestazioni aggiuntive necessarie verranno comunicate e concordate.'
};

function detailOf(c) {
  return c.procedure || c.anesthesiaType || c.treatment || c.services || c.purpose || c.sharedWith || c.detail || '';
}

function toClientShape(c) {
  return {
    id: c.id,
    type: c.type,
    petName: c.petName || null,
    ownerName: c.ownerName || '',
    status: c.status,
    sentAt: c.sentAt || null,
    signedAt: c.signedAt || null,
    viewedAt: c.viewedAt || null,
    procedure: c.type === 'chirurgia' ? detailOf(c) : undefined,
    anesthesiaType: c.type === 'anestesia' ? detailOf(c) : undefined,
    treatment: c.type === 'trattamento' ? detailOf(c) : undefined,
    services: c.type === 'preventivo' ? detailOf(c) : undefined,
    purpose: c.type === 'pubblicazione' ? detailOf(c) : undefined,
    sharedWith: c.type === 'passport' ? detailOf(c) : undefined,
    total: c.total || undefined,
    signedName: c.signedName || undefined
  };
}

// GET: pubblico ?id&t= (pagina firma) oppure lista clinica
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const token = searchParams.get('t');
    const consents = await getCollection('consents');

    if (id && token) {
      const consent = await consents.findOne({ id, token });
      if (!consent) return NextResponse.json({ error: 'Consenso non trovato o link non valido' }, { status: 404 });
      // marca come visto
      if (consent.status === 'inviato') {
        await consents.updateOne({ id }, { $set: { status: 'visto', viewedAt: new Date().toISOString() } });
      }
      return NextResponse.json({
        success: true,
        consent: {
          id: consent.id,
          type: consent.type,
          title: CONSENT_TITLES[consent.type] || 'Consenso',
          text: CONSENT_TEXTS[consent.type] || '',
          detail: detailOf(consent),
          notes: consent.notes || '',
          petName: consent.petName,
          ownerName: consent.ownerName,
          clinicName: consent.clinicName,
          status: consent.status === 'inviato' ? 'visto' : consent.status,
          signedAt: consent.signedAt || null,
          signedName: consent.signedName || null
        }
      });
    }

    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;

    // Scadenza automatica: inviati/visti da pi\u00f9 di 30 giorni
    const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    await consents.updateMany(
      { clinicId, status: { $in: ['inviato', 'visto'] }, sentAt: { $lt: thirtyAgo } },
      { $set: { status: 'scaduto', expiredAt: new Date().toISOString() } }
    );

    const list = await consents.find({ clinicId }).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ success: true, consents: list.map(toClientShape) });
  } catch (error) {
    console.error('Consents GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: firma pubblica (id+token) oppure creazione+invio dalla clinica
export async function POST(request) {
  try {
    const body = await request.json();
    const consents = await getCollection('consents');

    // Firma pubblica del proprietario
    if (body.id && body.token && body.sign === true) {
      const consent = await consents.findOne({ id: body.id, token: body.token });
      if (!consent) return NextResponse.json({ error: 'Consenso non trovato' }, { status: 404 });
      if (consent.status === 'firmato') return NextResponse.json({ error: 'Consenso gi\u00e0 firmato' }, { status: 400 });
      if (consent.status === 'scaduto') return NextResponse.json({ error: 'Consenso scaduto: richiedi un nuovo invio alla clinica' }, { status: 400 });
      if (!body.signedName || String(body.signedName).trim().length < 3) {
        return NextResponse.json({ error: 'Inserisci nome e cognome per firmare' }, { status: 400 });
      }
      await consents.updateOne(
        { id: consent.id },
        { $set: { status: 'firmato', signedAt: new Date().toISOString(), signedName: String(body.signedName).trim().slice(0, 100), acceptedText: true } }
      );

      // Notifica la clinica + log
      try {
        const users = await getCollection('users');
        const clinic = await users.findOne({ id: consent.clinicId });
        if (clinic?.email) {
          await sendEmail({
            to: clinic.email,
            subject: `\u2705 Consenso firmato: ${CONSENT_TITLES[consent.type] || consent.type} - ${consent.ownerName}`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#27AE60;">\u2705 Consenso Firmato</h2><p style="color:#666;"><strong>${consent.ownerName}</strong> ha firmato digitalmente:</p><ul style="color:#666;"><li><strong>Tipo:</strong> ${CONSENT_TITLES[consent.type] || consent.type}</li>${consent.petName ? `<li><strong>Animale:</strong> ${consent.petName}</li>` : ''}${detailOf(consent) ? `<li><strong>Dettaglio:</strong> ${detailOf(consent)}</li>` : ''}<li><strong>Firmato da:</strong> ${String(body.signedName).trim()}</li><li><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</li></ul><p style="color:#999;font-size:12px;">Il documento \u00e8 archiviato nel modulo Consensi Digitali.</p></div>`
          });
        }
        const logs = await getCollection('automation_logs');
        await logs.insertOne({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          clinicId: consent.clinicId,
          type: 'missingConsentCheck',
          title: 'Consenso firmato',
          details: `${consent.ownerName} ha firmato "${CONSENT_TITLES[consent.type] || consent.type}"${consent.petName ? ' per ' + consent.petName : ''}`,
          executedAt: new Date().toISOString(),
          source: 'firma-proprietario'
        });
      } catch (e) { console.error('Consent signed notify error:', e); }

      return NextResponse.json({ success: true, status: 'firmato' });
    }

    // Creazione + invio dalla clinica
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
    const { type, ownerName, ownerEmail, petName, detail, notes, total } = body;
    if (!type || !CONSENT_TITLES[type]) return NextResponse.json({ error: 'Tipo consenso non valido' }, { status: 400 });
    if (!ownerName || !ownerEmail) return NextResponse.json({ error: 'Nome ed email del proprietario sono obbligatori' }, { status: 400 });

    const users = await getCollection('users');
    const clinic = await users.findOne({ id: clinicId });
    const owner = await users.findOne({ email: String(ownerEmail).toLowerCase() });

    const token = uuidv4();
    const consent = {
      id: uuidv4(),
      token,
      clinicId,
      clinicName: clinic?.clinicName || clinic?.name || '',
      ownerId: owner?.id || null,
      ownerName: String(ownerName).trim(),
      ownerEmail: String(ownerEmail).toLowerCase().trim(),
      petName: petName || null,
      type,
      detail: detail || '',
      notes: notes || '',
      total: total || null,
      status: 'inviato',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await consents.insertOne(consent);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
    const signUrl = `${baseUrl}/consent/${consent.id}?t=${token}`;
    await sendEmail({
      to: consent.ownerEmail,
      subject: `\u270D\uFE0F Documento da firmare: ${CONSENT_TITLES[type]} - ${consent.clinicName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#3B82F6,#06B6D4);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">\u{1F43E} vetbuddy</h1></div><div style="padding:30px;background:#f9f9f9;"><h2 style="color:#333;">\u270D\uFE0F Documento da firmare</h2><p style="color:#666;">Ciao ${consent.ownerName},</p><p style="color:#666;"><strong>${consent.clinicName || 'La clinica'}</strong> ti chiede di leggere e firmare digitalmente:</p><div style="background:white;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #3B82F6;"><p style="margin:5px 0;"><strong>\u{1F4C4}</strong> ${CONSENT_TITLES[type]}</p>${consent.petName ? `<p style=\"margin:5px 0;\"><strong>\u{1F43E}</strong> ${consent.petName}</p>` : ''}${consent.detail ? `<p style=\"margin:5px 0;\"><strong>\u2139\uFE0F</strong> ${consent.detail}</p>` : ''}</div><div style="text-align:center;margin:30px 0;"><a href="${signUrl}" style="display:inline-block;background:#3B82F6;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">\u270D\uFE0F Leggi e Firma</a></div><p style="color:#999;font-size:12px;">La firma avviene tramite accettazione esplicita con nome e cognome (firma elettronica semplice). Il link \u00e8 personale: non condividerlo.</p></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">\u00A9 2026 vetbuddy</p></div></div>`
    });

    const logs = await getCollection('automation_logs');
    await logs.insertOne({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      clinicId,
      type: 'missingConsentCheck',
      title: 'Consenso inviato',
      details: `"${CONSENT_TITLES[type]}" inviato a ${consent.ownerName}${consent.petName ? ' per ' + consent.petName : ''}`,
      executedAt: new Date().toISOString(),
      source: 'manuale'
    });

    return NextResponse.json({ success: true, consent: toClientShape(consent) }, { status: 201 });
  } catch (error) {
    console.error('Consents POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
