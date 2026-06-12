import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_FILES = 3; // max allegati per modulo
const MAX_CHUNKS = 40; // ~20MB con chunk da 512KB
const MAX_CHUNK_B64 = 800000; // ~585KB raw per chunk

async function canAccessForm(request, form, token) {
  if (!form) return false;
  if (token && form.token === token) return true;
  const user = getUserFromRequest(request);
  if (user && (user.role === 'clinic' || user.role === 'staff')) {
    const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
    return form.clinicId === clinicId;
  }
  return false;
}

// POST - carica un chunk (pubblico via token del modulo)
// body: { formId, token, uploadId, chunkIndex, totalChunks, fileName, mimeType, dataBase64 }
export async function POST(request) {
  try {
    const body = await request.json();
    const { formId, token, uploadId, fileName, mimeType, dataBase64 } = body;
    const idx = parseInt(body.chunkIndex);
    const tot = parseInt(body.totalChunks);

    if (!formId || !token || !uploadId || dataBase64 === undefined || isNaN(idx) || isNaN(tot)) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }
    if (idx < 0 || tot < 1 || idx >= tot) {
      return NextResponse.json({ error: 'Indice chunk non valido' }, { status: 400 });
    }
    if (tot > MAX_CHUNKS) {
      return NextResponse.json({ error: 'File troppo grande: massimo 20MB' }, { status: 400 });
    }
    if (typeof dataBase64 !== 'string' || dataBase64.length === 0 || dataBase64.length > MAX_CHUNK_B64) {
      return NextResponse.json({ error: 'Chunk troppo grande o vuoto' }, { status: 400 });
    }
    const mime = String(mimeType || '');
    if (!mime.startsWith('image/') && !mime.startsWith('video/')) {
      return NextResponse.json({ error: 'Sono ammessi solo foto e video' }, { status: 400 });
    }

    const forms = await getCollection('previsit_forms');
    const form = await forms.findOne({ id: formId, token });
    if (!form) return NextResponse.json({ error: 'Modulo non trovato o link non valido' }, { status: 404 });
    if (['compilato', 'da_revisionare', 'revisionato'].includes(form.status)) {
      return NextResponse.json({ error: 'Modulo gi\u00e0 inviato: non \u00e8 pi\u00f9 possibile allegare file' }, { status: 400 });
    }

    const media = await getCollection('previsit_media');
    if (idx === 0) {
      const count = await media.countDocuments({ formId, status: 'completo' });
      if (count >= MAX_FILES) {
        return NextResponse.json({ error: `Massimo ${MAX_FILES} allegati per modulo` }, { status: 400 });
      }
    }

    const chunks = await getCollection('previsit_media_chunks');
    await chunks.updateOne(
      { uploadId, chunkIndex: idx },
      { $set: { uploadId, formId, chunkIndex: idx, data: dataBase64, createdAt: new Date().toISOString() } },
      { upsert: true }
    );

    const received = await chunks.countDocuments({ uploadId });
    if (received >= tot) {
      // Upload completo: registra i metadati
      const sizeDocs = await chunks.find({ uploadId }).project({ data: 1 }).toArray();
      const size = sizeDocs.reduce((s, c) => s + Math.floor((c.data?.length || 0) * 3 / 4), 0);
      await media.updateOne(
        { id: uploadId },
        {
          $set: {
            id: uploadId,
            formId,
            clinicId: form.clinicId,
            fileName: String(fileName || 'allegato').slice(0, 120),
            mimeType: mime,
            size,
            totalChunks: tot,
            status: 'completo',
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
      return NextResponse.json({ success: true, completed: true, mediaId: uploadId, size });
    }

    return NextResponse.json({ success: true, completed: false, received, totalChunks: tot });
  } catch (error) {
    console.error('Previsit upload POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - download (?mediaId=...) o lista (?formId=...). Accesso: token modulo (?t=) oppure clinica autenticata
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const formId = searchParams.get('formId');
    const token = searchParams.get('t');

    const media = await getCollection('previsit_media');
    const forms = await getCollection('previsit_forms');

    if (mediaId) {
      const m = await media.findOne({ id: mediaId, status: 'completo' });
      if (!m) return NextResponse.json({ error: 'Allegato non trovato' }, { status: 404 });
      const form = await forms.findOne({ id: m.formId });
      if (!(await canAccessForm(request, form, token))) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
      }
      const chunksCol = await getCollection('previsit_media_chunks');
      const chunkDocs = await chunksCol.find({ uploadId: mediaId }).sort({ chunkIndex: 1 }).toArray();
      const buffer = Buffer.concat(chunkDocs.map(c => Buffer.from(c.data, 'base64')));
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': m.mimeType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${encodeURIComponent(m.fileName)}"`,
          'Content-Length': String(buffer.length),
          'Cache-Control': 'private, max-age=3600'
        }
      });
    }

    if (formId) {
      const form = await forms.findOne({ id: formId });
      if (!(await canAccessForm(request, form, token))) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
      }
      const list = await media.find({ formId, status: 'completo' }).sort({ createdAt: 1 }).toArray();
      return NextResponse.json({
        success: true,
        media: list.map(({ _id, ...rest }) => rest)
      });
    }

    return NextResponse.json({ error: 'Specificare mediaId o formId' }, { status: 400 });
  } catch (error) {
    console.error('Previsit upload GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - rimuovi un allegato (?mediaId=...&t=token | clinica autenticata)
// Il proprietario pu\u00f2 rimuovere solo prima dell'invio del modulo; la clinica sempre.
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const token = searchParams.get('t');
    if (!mediaId) return NextResponse.json({ error: 'mediaId obbligatorio' }, { status: 400 });

    const media = await getCollection('previsit_media');
    const forms = await getCollection('previsit_forms');
    const m = await media.findOne({ id: mediaId });
    if (!m) return NextResponse.json({ error: 'Allegato non trovato' }, { status: 404 });
    const form = await forms.findOne({ id: m.formId });
    if (!(await canAccessForm(request, form, token))) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    // Se accesso tramite token pubblico, blocca dopo l'invio
    const user = getUserFromRequest(request);
    const isClinic = user && (user.role === 'clinic' || user.role === 'staff');
    if (!isClinic && ['compilato', 'da_revisionare', 'revisionato'].includes(form.status)) {
      return NextResponse.json({ error: 'Modulo gi\u00e0 inviato: non \u00e8 pi\u00f9 possibile rimuovere allegati' }, { status: 400 });
    }

    const chunksCol = await getCollection('previsit_media_chunks');
    await chunksCol.deleteMany({ uploadId: mediaId });
    await media.deleteOne({ id: mediaId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Previsit upload DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
