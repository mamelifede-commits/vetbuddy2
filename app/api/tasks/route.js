import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

function requireClinic(request) {
  const user = getUserFromRequest(request);
  if (!user) return { error: NextResponse.json({ error: 'Non autorizzato' }, { status: 401 }) };
  if (user.role !== 'clinic' && user.role !== 'staff') {
    return { error: NextResponse.json({ error: 'Solo le cliniche possono gestire i task dello staff' }, { status: 403 }) };
  }
  const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
  return { user, clinicId };
}

// Demo seed tasks (solo su richiesta esplicita e se la collection e' vuota per la clinica)
function buildDemoTasks(clinicId) {
  const now = Date.now();
  const h = 3600000;
  const d = 86400000;
  const base = [
    { title: 'Richiamare Maria Rossi per Luna', category: 'call', priority: 'alta', assignedTo: 'Dr. Rossi', dueIn: 2 * h, status: 'nuovo', source: 'auto', reason: 'Questionario pre-visita non compilato', createdAgo: 1 * d },
    { title: 'Controllare referto Rex - analisi sangue', category: 'document', priority: 'media', assignedTo: 'Dr. Bianchi', dueIn: 4 * h, status: 'in_lavorazione', source: 'auto', reason: 'Referto lab ricevuto da laboratorio', createdAgo: 2 * d },
    { title: 'Inviare preventivo sterilizzazione a Marco Ferrara', category: 'estimate', priority: 'media', assignedTo: 'Receptionist', dueIn: 1 * d, status: 'nuovo', source: 'manual', createdAgo: 6 * h },
    { title: 'Sollecitare completamento Passport Birba', category: 'passport', priority: 'bassa', assignedTo: 'Receptionist', dueIn: 3 * d, status: 'nuovo', source: 'auto', reason: 'Passport creato ma incompleto da 7 giorni', createdAgo: 7 * d },
    { title: 'Recuperare cliente insoddisfatto: Carlo Neri', category: 'review', priority: 'alta', assignedTo: 'Dr. Verdi', dueIn: 1 * h, status: 'nuovo', source: 'auto', reason: 'Recensione negativa ricevuta', createdAgo: 4 * h },
    { title: 'Confermare appuntamento Oscar domani mattina', category: 'confirm', priority: 'media', assignedTo: 'Receptionist', dueIn: 6 * h, status: 'nuovo', source: 'auto', reason: 'Appuntamento non confermato a 24h', createdAgo: 12 * h },
    { title: 'Verificare questionario urgenza Buddy', category: 'questionnaire', priority: 'alta', assignedTo: 'Dr. Rossi', dueIn: 0.5 * h, status: 'nuovo', source: 'auto', reason: 'Questionario compilato con urgenza ALTA', createdAgo: 2 * h },
    { title: 'Inviare certificato vaccinazione a Sara Colombo', category: 'send', priority: 'media', assignedTo: 'Receptionist', dueIn: 2 * d, status: 'completato', source: 'manual', createdAgo: 3 * d, completedAgo: 1 * d },
    { title: 'Richiamare Paolo Ricci per follow-up post-chirurgia', category: 'call', priority: 'media', assignedTo: 'Dr. Bianchi', dueIn: -2 * h, status: 'nuovo', source: 'auto', reason: 'Follow-up 48h post-operatorio', createdAgo: 3 * d },
    { title: 'Inviare preventivo pulizia dentale a Giulia Romano', category: 'estimate', priority: 'bassa', assignedTo: 'Receptionist', dueIn: 5 * d, status: 'nuovo', source: 'manual', createdAgo: 1 * d }
  ];
  return base.map(b => ({
    id: uuidv4(),
    clinicId,
    title: b.title,
    category: b.category,
    priority: b.priority,
    assignedTo: b.assignedTo,
    dueDate: new Date(now + b.dueIn).toISOString(),
    status: b.status,
    source: b.source,
    reason: b.reason || '',
    relatedId: null,
    dedupeKey: null,
    notes: '',
    createdAt: new Date(now - b.createdAgo).toISOString(),
    updatedAt: new Date(now - b.createdAgo).toISOString(),
    completedAt: b.completedAgo ? new Date(now - b.completedAgo).toISOString() : null
  }));
}

// GET - Lista task della clinica
export async function GET(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const col = await getCollection('staff_tasks');
    const tasks = await col.find({ clinicId: auth.clinicId }).sort({ dueDate: 1 }).toArray();

    return NextResponse.json({
      success: true,
      tasks: tasks.map(({ _id, ...rest }) => rest)
    });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Crea task manuale OPPURE seed demo ({ seedDemo: true })
export async function POST(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const col = await getCollection('staff_tasks');

    // Seed demo (solo se vuoto per questa clinica)
    if (body.seedDemo === true) {
      const existing = await col.countDocuments({ clinicId: auth.clinicId });
      if (existing > 0) {
        return NextResponse.json({ error: 'Esistono gi\u00e0 dei task: impossibile caricare i dati di esempio' }, { status: 400 });
      }
      const demoTasks = buildDemoTasks(auth.clinicId);
      await col.insertMany(demoTasks);
      return NextResponse.json({ success: true, seeded: demoTasks.length });
    }

    const { title, category, priority, assignedTo, dueDate, notes } = body;
    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: 'Il titolo del task \u00e8 obbligatorio' }, { status: 400 });
    }
    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return NextResponse.json({ error: 'La scadenza \u00e8 obbligatoria' }, { status: 400 });
    }

    const task = {
      id: uuidv4(),
      clinicId: auth.clinicId,
      title: String(title).trim().slice(0, 200),
      category: TASK_CATEGORIES.includes(category) ? category : 'call',
      priority: TASK_PRIORITIES.includes(priority) ? priority : 'media',
      assignedTo: String(assignedTo || '').trim() || (auth.user.name || auth.user.clinicName || 'Staff'),
      dueDate: new Date(dueDate).toISOString(),
      status: 'nuovo',
      source: 'manual',
      reason: '',
      relatedId: null,
      dedupeKey: null,
      notes: String(notes || '').slice(0, 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    };
    await col.insertOne(task);

    const { _id, ...cleanTask } = task;
    return NextResponse.json({ success: true, task: cleanTask }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Aggiorna stato ({ taskId, status }) o campi modificabili
export async function PUT(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { taskId, status } = body;
    if (!taskId) {
      return NextResponse.json({ error: 'ID task obbligatorio' }, { status: 400 });
    }

    const col = await getCollection('staff_tasks');
    const task = await col.findOne({ id: taskId, clinicId: auth.clinicId });
    if (!task) {
      return NextResponse.json({ error: 'Task non trovato' }, { status: 404 });
    }

    const updateData = { updatedAt: new Date().toISOString() };

    // Cambio di stato
    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Stato non valido' }, { status: 400 });
      }
      updateData.status = status;
      if (status === 'completato') {
        updateData.completedAt = new Date().toISOString();
        updateData.completedBy = auth.user.name || auth.user.clinicName || 'Staff';
      } else {
        updateData.completedAt = null;
      }
    }

    // Campi modificabili
    if (body.title !== undefined && String(body.title).trim()) updateData.title = String(body.title).trim().slice(0, 200);
    if (body.category !== undefined && TASK_CATEGORIES.includes(body.category)) updateData.category = body.category;
    if (body.priority !== undefined && TASK_PRIORITIES.includes(body.priority)) updateData.priority = body.priority;
    if (body.assignedTo !== undefined) updateData.assignedTo = String(body.assignedTo).trim().slice(0, 100);
    if (body.dueDate !== undefined && !isNaN(new Date(body.dueDate).getTime())) updateData.dueDate = new Date(body.dueDate).toISOString();
    if (body.notes !== undefined) updateData.notes = String(body.notes).slice(0, 1000);

    await col.updateOne({ id: taskId, clinicId: auth.clinicId }, { $set: updateData });

    const updated = await col.findOne({ id: taskId, clinicId: auth.clinicId });
    const { _id, ...cleanTask } = updated;
    return NextResponse.json({ success: true, task: cleanTask });
  } catch (error) {
    console.error('Tasks PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Elimina un task (?id=...)
export async function DELETE(request) {
  try {
    const auth = requireClinic(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID task obbligatorio' }, { status: 400 });
    }

    const col = await getCollection('staff_tasks');
    const result = await col.deleteOne({ id, clinicId: auth.clinicId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tasks DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
