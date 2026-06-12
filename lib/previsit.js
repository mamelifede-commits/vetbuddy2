import { getCollection } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

// Crea e invia il modulo pre-visita al proprietario (trigger: nuova prenotazione)
export async function createAndSendPrevisitForm(appointment, options = {}) {
  try {
    if (!appointment?.clinicId) return { sent: false };
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: appointment.clinicId });

    // Rispetta il toggle automazione della clinica (solo per invio automatico)
    if (!options.manual && clinic?.automationSettings && clinic.automationSettings.previsitForm === false) {
      return { sent: false, skipped: true };
    }

    let ownerEmail = options.ownerEmail || null;
    let ownerName = options.ownerName || appointment.ownerName || 'Proprietario';
    if (!ownerEmail && appointment.ownerId) {
      const owner = await users.findOne({ id: appointment.ownerId });
      ownerEmail = owner?.email || null;
      ownerName = appointment.ownerName || owner?.name || 'Proprietario';
    }
    if (!ownerEmail) return { sent: false, reason: 'no-email' };

    const forms = await getCollection('previsit_forms');
    // Evita duplicati per lo stesso appuntamento
    if (appointment.id) {
      const existing = await forms.findOne({ appointmentId: appointment.id });
      if (existing) return { sent: false, duplicate: true };
    }

    const token = uuidv4();
    const form = {
      id: uuidv4(),
      token,
      clinicId: appointment.clinicId,
      clinicName: clinic?.clinicName || clinic?.name || '',
      ownerId: appointment.ownerId || null,
      ownerName,
      ownerEmail,
      petId: appointment.petId || null,
      petName: appointment.petName || '',
      appointmentId: appointment.id || null,
      appointmentDate: appointment.date || null,
      type: options.type || 'generale',
      status: 'inviato',
      reason: appointment.reason || '',
      answers: null,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await forms.insertOne(form);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
    const fillUrl = `${baseUrl}/previsit/${form.id}?t=${token}`;

    await sendEmail({
      to: ownerEmail,
      subject: `\u{1F4CB} Prepara la visita di ${form.petName || 'il tuo animale'}: 2 minuti per il modulo pre-visita`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#8B5CF6,#6366F1);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">\u{1F43E} vetbuddy</h1></div><div style="padding:30px;background:#f9f9f9;"><h2 style="color:#333;">\u{1F4CB} Modulo Pre-Visita</h2><p style="color:#666;">Ciao ${ownerName},</p><p style="color:#666;">Per preparare al meglio la visita ${form.petName ? `di <strong>${form.petName}</strong>` : ''} ${form.appointmentDate ? `del <strong>${form.appointmentDate}</strong>` : ''} presso <strong>${form.clinicName || 'la clinica'}</strong>, ti chiediamo 2 minuti per compilare un breve questionario.</p><p style="color:#666;">Le tue risposte aiuteranno il veterinario ad arrivare preparato e a dedicare pi\u00f9 tempo al tuo animale.</p><div style="text-align:center;margin:30px 0;"><a href="${fillUrl}" style="display:inline-block;background:#8B5CF6;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">\u270D\uFE0F Compila il Modulo</a></div><p style="color:#999;font-size:12px;">Il modulo raccoglie solo informazioni utili alla visita. Non sostituisce il parere del veterinario.</p></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">\u00A9 2026 vetbuddy</p></div></div>`
    });

    const logs = await getCollection('automation_logs');
    await logs.insertOne({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      clinicId: appointment.clinicId,
      type: 'previsitForm',
      title: 'Modulo pre-visita inviato',
      details: `Inviato a ${ownerName} per ${form.petName || 'visita'}${form.appointmentDate ? ' del ' + form.appointmentDate : ''}`,
      executedAt: new Date().toISOString(),
      source: options.manual ? 'manuale' : 'trigger-prenotazione'
    });

    return { sent: true, formId: form.id };
  } catch (err) {
    console.error('createAndSendPrevisitForm error:', err);
    return { sent: false, error: err.message };
  }
}
