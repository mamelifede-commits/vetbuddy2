import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';

export const TASK_CATEGORIES = ['call', 'document', 'send', 'estimate', 'passport', 'review', 'confirm', 'questionnaire'];
export const TASK_PRIORITIES = ['alta', 'media', 'bassa'];
export const TASK_STATUSES = ['nuovo', 'in_lavorazione', 'completato'];

// Crea un task automatico per lo staff della clinica (idempotente via dedupeKey).
// Usato dalle automazioni cron e dagli hook API (es. questionario con urgenza ALTA).
// Accetta opzionalmente un'istanza db (per i cron che hanno gia' la connessione aperta).
export async function createAutoTask({ db = null, clinicId, title, category = 'call', priority = 'media', dueDate = null, reason = '', assignedTo = '', relatedId = null, dedupeKey = null }) {
  try {
    if (!clinicId || !title) return { created: false, error: 'clinicId e title obbligatori' };
    const col = db ? db.collection('staff_tasks') : await getCollection('staff_tasks');

    // Idempotenza: se esiste gia' un task con la stessa dedupeKey per la clinica, non duplicare
    if (dedupeKey) {
      const existing = await col.findOne({ clinicId, dedupeKey });
      if (existing) return { created: false, duplicate: true };
    }

    const task = {
      id: uuidv4(),
      clinicId,
      title: String(title).slice(0, 200),
      category: TASK_CATEGORIES.includes(category) ? category : 'call',
      priority: TASK_PRIORITIES.includes(priority) ? priority : 'media',
      assignedTo: assignedTo || 'Staff',
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString(),
      status: 'nuovo',
      source: 'auto',
      reason: String(reason || '').slice(0, 500),
      relatedId: relatedId || null,
      dedupeKey: dedupeKey || null,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    };
    await col.insertOne(task);
    return { created: true, task };
  } catch (e) {
    console.error('createAutoTask error:', e);
    return { created: false, error: e.message };
  }
}
