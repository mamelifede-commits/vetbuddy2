import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { createAutoTask } from '@/lib/tasks';
import { createAndSendPrevisitForm } from '@/lib/previsit';

export const dynamic = 'force-dynamic';

function toClientShape(f) {
  const a = f.answers || {};
  return {
    id: f.id,
    type: f.type || 'generale',
    petName: f.petName || '',
    ownerName: f.ownerName || '',
    appointmentDate: f.appointmentDate || null,
    status: f.status || 'inviato',
    sentAt: f.sentAt || null,
    completedAt: f.completedAt || null,
    reason: a.reason || f.reason || '',
    symptoms: a.symptoms || '',
    duration: a.symptomsSince || '',
    urgency: a.urgency || '',
    diet: a.diet || '',
    behavior: a.behavior || '',
    medications: a.medications || '',
    conditions: a.conditions || '',
    allergies: a.allergies || '',
    notes: a.notes || ''
  };
}

// GET: pubblico con ?id&t= (compilazione) oppure lista per la clinica autenticata
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const token = searchParams.get('t');
    const forms = await getCollection('previsit_forms');

    // Accesso pubblico tramite token (pagina di compilazione)
    if (id && token) {
      const form = await forms.findOne({ id, token });
      if (!form) return NextResponse.json({ error: 'Modulo non trovato o link non valido' }, { status: 404 });
      return NextResponse.json({
        success: true,
        form: {
          id: form.id,
          petName: form.petName,
          ownerName: form.ownerName,
          clinicName: form.clinicName,
          appointmentDate: form.appointmentDate,
          reason: form.reason,
          status: form.status,
          answers: form.answers || null
        }
      });
    }

    // Lista per la clinica
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
    const list = await forms.find({ clinicId }).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({ success: true, questionnaires: list.map(toClientShape) });
  } catch (error) {
    console.error('Previsit GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: submit pubblico (id+token+answers) oppure invio manuale dalla clinica
export async function POST(request) {
  try {
    const body = await request.json();
    const forms = await getCollection('previsit_forms');

    // Submit pubblico dal proprietario
    if (body.id && body.token && body.answers) {
      const form = await forms.findOne({ id: body.id, token: body.token });
      if (!form) return NextResponse.json({ error: 'Modulo non trovato' }, { status: 404 });
      if (form.status === 'compilato' || form.status === 'da_revisionare') {
        return NextResponse.json({ error: 'Modulo gi\u00e0 compilato' }, { status: 400 });
      }
      const answers = {
        reason: String(body.answers.reason || '').slice(0, 500),
        symptoms: String(body.answers.symptoms || '').slice(0, 1000),
        symptomsSince: String(body.answers.symptomsSince || '').slice(0, 200),
        medications: String(body.answers.medications || '').slice(0, 500),
        conditions: String(body.answers.conditions || '').slice(0, 500),
        allergies: String(body.answers.allergies || '').slice(0, 500),
        diet: String(body.answers.diet || '').slice(0, 500),
        behavior: String(body.answers.behavior || '').slice(0, 500),
        urgency: ['Bassa', 'Media', 'Alta'].includes(body.answers.urgency) ? body.answers.urgency : 'Bassa',
        notes: String(body.answers.notes || '').slice(0, 1000)
      };
      const isUrgent = answers.urgency === 'Alta';
      const newStatus = isUrgent ? 'da_revisionare' : 'compilato';
      await forms.updateOne({ id: form.id }, { $set: { answers, status: newStatus, completedAt: new Date().toISOString() } });

      // Urgenza alta percepita: avvisa subito la clinica
      if (isUrgent) {
        try {
          const users = await getCollection('users');
          const clinic = await users.findOne({ id: form.clinicId });
          if (clinic?.email) {
            await sendEmail({
              to: clinic.email,
              subject: `\u26A0\uFE0F Pre-visita con urgenza ALTA: ${form.petName || 'paziente'} (${form.ownerName})`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#E74C3C;">\u26A0\uFE0F Urgenza percepita ALTA</h2><p style="color:#666;">Il proprietario <strong>${form.ownerName}</strong> ha compilato il modulo pre-visita ${form.petName ? `per <strong>${form.petName}</strong>` : ''} indicando urgenza <strong>ALTA</strong>.</p><ul style="color:#666;"><li><strong>Motivo:</strong> ${answers.reason || '-'}</li><li><strong>Sintomi:</strong> ${answers.symptoms || '-'}</li><li><strong>Da quando:</strong> ${answers.symptomsSince || '-'}</li>${form.appointmentDate ? `<li><strong>Appuntamento:</strong> ${form.appointmentDate}</li>` : ''}</ul><p style="color:#666;">Valuta se anticipare l'appuntamento o contattare il proprietario.</p></div>`
            });
          }
          const logs = await getCollection('automation_logs');
          await logs.insertOne({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            clinicId: form.clinicId,
            type: 'previsitForm',
            title: 'Pre-visita: urgenza ALTA segnalata',
            details: `${form.ownerName} (${form.petName || 'paziente'}): ${answers.reason || 'vedi modulo'}`,
            executedAt: new Date().toISOString(),
            source: 'compilazione-proprietario'
          });
          // Task automatico per lo staff: verificare il questionario urgente
          await createAutoTask({
            clinicId: form.clinicId,
            title: `Verificare questionario urgenza ${form.petName || form.ownerName}`,
            category: 'questionnaire',
            priority: 'alta',
            dueDate: new Date(Date.now() + 2 * 3600000).toISOString(),
            reason: `Questionario pre-visita compilato da ${form.ownerName} con urgenza ALTA`,
            relatedId: form.id,
            dedupeKey: `previsit_urgent_${form.id}`
          });
        } catch (e) { console.error('Urgent previsit alert error:', e); }
      }
      return NextResponse.json({ success: true, status: newStatus });
    }

    // Invio manuale dalla clinica
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
    const { ownerName, ownerEmail, petName, appointmentDate, type } = body;
    if (!ownerEmail || !ownerName) {
      return NextResponse.json({ error: 'Nome ed email del proprietario sono obbligatori' }, { status: 400 });
    }
    const result = await createAndSendPrevisitForm(
      { clinicId, ownerName, petName: petName || '', date: appointmentDate || null, id: null },
      { manual: true, ownerEmail, ownerName, type: type || 'generale' }
    );
    if (!result.sent) {
      return NextResponse.json({ error: result.error || 'Invio non riuscito' }, { status: 400 });
    }
    return NextResponse.json({ success: true, formId: result.formId }, { status: 201 });
  } catch (error) {
    console.error('Previsit POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: la clinica segna un modulo come revisionato
export async function PUT(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
    const { id, status } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    const forms = await getCollection('previsit_forms');
    const result = await forms.updateOne(
      { id, clinicId },
      { $set: { status: status === 'compilato' ? 'compilato' : status, reviewedAt: new Date().toISOString() } }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Modulo non trovato' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
