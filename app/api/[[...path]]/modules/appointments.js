// modules/appointments.js - Appointments, availability, Google Calendar
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { stripe, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, corsHeaders } from './constants';

export async function handleAppointmentsGet(path, request) {
  // Get appointments for clinic or owner
  if (path === 'appointments') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const appointments = await getCollection('appointments');
    const query = user.role === 'clinic' ? { clinicId: user.id } : { ownerId: user.id };
    const list = await appointments.find(query).sort({ date: 1 }).toArray();
    return NextResponse.json(list, { headers: corsHeaders });
  }

  // Clinic availability slots
  if (path.match(/^clinics\/[^/]+\/slots$/)) {
    const clinicId = path.split('/')[1];
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    if (!date) return NextResponse.json({ error: 'Data richiesta' }, { status: 400, headers: corsHeaders });
    
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: clinicId, role: 'clinic' });
    if (!clinic) return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
    
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
    const dayKey = dayNames[dayOfWeek];
    const workingHours = clinic.workingHours || {};
    const dayHours = workingHours[dayKey];
    
    if (!dayHours || dayHours === 'Chiuso' || dayHours === '') {
      return NextResponse.json({ slots: [], message: 'La clinica è chiusa in questo giorno' }, { headers: corsHeaders });
    }
    
    const slots = [];
    const slotDuration = 30;
    const timeRanges = dayHours.split(',').map(r => r.trim());
    
    for (const range of timeRanges) {
      const match = range.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
      if (match) {
        let startHour = parseInt(match[1]);
        let startMin = parseInt(match[2] || '0');
        let endHour = parseInt(match[3]);
        let endMin = parseInt(match[4] || '0');
        let currentMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;
        while (currentMin + slotDuration <= endTotalMin) {
          const h = Math.floor(currentMin / 60);
          const m = currentMin % 60;
          const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          slots.push({ time: timeStr, available: true });
          currentMin += slotDuration;
        }
      }
    }
    
    const appointments = await getCollection('appointments');
    const dayAppointments = await appointments.find({
      clinicId, date, status: { $nin: ['cancellato', 'annullato'] }
    }).toArray();
    const busyTimes = dayAppointments.map(a => a.time);
    const finalSlots = slots.map(slot => ({ ...slot, available: !busyTimes.includes(slot.time) }));
    
    return NextResponse.json({ 
      slots: finalSlots, totalSlots: finalSlots.length,
      availableCount: finalSlots.filter(s => s.available).length,
      date, clinicName: clinic.clinicName || clinic.name
    }, { headers: corsHeaders });
  }

  return null;
}

export async function handleAppointmentsPost(path, request, body) {
  // Request appointment from owner
  if (path === 'appointments/request') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { clinicId, clinicName, date, time, service, notes, petId } = body;
    const appointments = await getCollection('appointments');
    const users = await getCollection('users');
    const pets = await getCollection('pets');
    
    let petName = null;
    if (petId) { const pet = await pets.findOne({ id: petId }); petName = pet?.name || null; }
    const owner = await users.findOne({ id: user.id });
    
    const appointmentId = uuidv4();
    const appointment = {
      id: appointmentId, clinicId, clinicName: clinicName || null,
      ownerId: user.id, ownerName: owner?.name || owner?.email || 'Proprietario',
      ownerEmail: owner?.email, ownerPhone: owner?.phone,
      petId: petId || null, petName, date,
      time: time || 'mattina', serviceId: service, reason: service,
      notes: notes || '', status: 'pending', type: 'richiesta',
      createdAt: new Date().toISOString()
    };
    await appointments.insertOne(appointment);
    
    try {
      const clinic = await users.findOne({ id: clinicId });
      if (clinic?.email) {
        await sendEmail({
          to: clinic.email,
          subject: `📅 Nuova Richiesta Appuntamento - ${owner?.name || 'Proprietario'}`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #F97316;">🐾 Nuova Richiesta di Appuntamento</h2><p>Hai ricevuto una nuova richiesta:</p><ul><li><strong>Proprietario:</strong> ${owner?.name || 'Non specificato'}</li><li><strong>Email:</strong> ${owner?.email || '-'}</li>${petName ? `<li><strong>Animale:</strong> ${petName}</li>` : ''}<li><strong>Data:</strong> ${new Date(date).toLocaleDateString('it-IT')}</li><li><strong>Servizio:</strong> ${service}</li>${notes ? `<li><strong>Note:</strong> ${notes}</li>` : ''}</ul><p>Accedi alla dashboard di vetbuddy per confermare.</p></div>`
        });
      }
    } catch (emailError) { console.error('Error sending notification email:', emailError); }
    
    return NextResponse.json({ success: true, appointment }, { headers: corsHeaders });
  }

  // Create appointment
  if (path === 'appointments') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { petId, petName, ownerName, ownerId, date, time, reason, notes, type, serviceId, duration } = body;
    const appointments = await getCollection('appointments');
    const appointmentId = uuidv4();
    
    let videoLink = null;
    if (type === 'videoconsulto' || type === 'online' || serviceId?.includes('online') || serviceId?.includes('consulenza')) {
      const roomCode = `vetbuddy-${appointmentId.slice(0, 8)}`;
      videoLink = `https://meet.jit.si/${roomCode}`;
    }
    
    const appointment = {
      id: appointmentId,
      clinicId: user.role === 'clinic' ? user.id : body.clinicId,
      ownerId: user.role === 'owner' ? user.id : ownerId,
      petId, petName, ownerName, date, time,
      type: type || 'visita', serviceId, duration: duration || 30,
      reason, notes: notes || '', videoLink,
      status: 'scheduled', createdAt: new Date().toISOString()
    };
    await appointments.insertOne(appointment);
    
    // Send confirmation email
    try {
      const users = await getCollection('users');
      const owner = await users.findOne({ id: appointment.ownerId });
      const clinic = await users.findOne({ id: appointment.clinicId });
      if (owner?.email) {
        const clinicName = clinic?.clinicName || body.clinicName || 'Clinica Veterinaria';
        const clinicPhone = clinic?.phone || '';
        const clinicAddress = clinic?.address || '';
        const typeLabels = { visita: 'Visita generale', vaccino: 'Vaccino', videoconsulto: 'Video Consulto', online: 'Video Consulto' };
        const typeLabel = typeLabels[appointment.type] || appointment.reason || 'Appuntamento';
        const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        await sendEmail({
          to: owner.email,
          subject: `✅ Prenotazione Confermata - ${appointment.petName} | ${clinicName}`,
          html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #10B981, #059669); padding: 32px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px;">🐾 Prenotazione Confermata!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">${clinicName}</p></div><div style="padding: 32px;"><div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 16px; padding: 24px; margin-bottom: 24px;"><table style="width: 100%;"><tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 14px;">🐕 Paziente</span><br/><strong style="font-size: 18px; color: #1e293b;">${appointment.petName}</strong></td></tr><tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 14px;">📋 Tipo</span><br/><strong style="font-size: 16px; color: #1e293b;">${typeLabel}</strong></td></tr><tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 14px;">📅 Data e ora</span><br/><strong style="font-size: 18px; color: #10B981;">${formattedDate}</strong><br/><strong style="font-size: 24px; color: #1e293b;">🕐 ${appointment.time}</strong></td></tr></table></div>${appointment.videoLink ? `<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;"><h3 style="color: white; margin: 0 0 12px; font-size: 18px;">🎥 Video Consulto</h3><a href="${appointment.videoLink}" target="_blank" style="display: inline-block; background: white; color: #6366f1; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">📹 Entra nel Video Consulto</a></div>` : `<div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 16px; margin-bottom: 24px;"><p style="margin: 0; font-size: 14px; color: #166534;"><strong>📍 Dove:</strong> ${clinicAddress || clinicName}${clinicPhone ? `<br/><strong>📞 Tel:</strong> ${clinicPhone}` : ''}</p></div>`}<p style="color: #64748b; font-size: 14px; text-align: center;">Riceverai un promemoria 24h prima dell'appuntamento.</p></div><div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="color: #94a3b8; font-size: 12px; margin: 0;">Email inviata automaticamente da vetbuddy</p></div></div>`
        });
      }
    } catch (emailError) { console.error('Error sending confirmation email:', emailError); }
    
    return NextResponse.json(appointment, { headers: corsHeaders });
  }

  // Send appointment email to owner
  if (path === 'appointments/send-email') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { appointmentId, recipientEmail } = body;
    const appointments = await getCollection('appointments');
    const appt = await appointments.findOne({ id: appointmentId });
    if (!appt) return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404, headers: corsHeaders });

    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.clinicId || user.id });
    const clinicName = clinic?.clinicName || 'Clinica Veterinaria';
    const clinicPhone = clinic?.phone || '';
    const clinicAddress = clinic?.address || '';
    const typeLabels = { visita: 'Visita generale', vaccino: 'Vaccino', chirurgia: 'Chirurgia', emergenza: 'Emergenza', controllo: 'Follow-up', videoconsulto: 'Video Consulto' };
    const typeLabel = typeLabels[appt.type] || appt.type || 'Appuntamento';
    let staffName = '';
    if (appt.staffId) {
      const staffCollection = await getCollection('staff');
      const staffMember = await staffCollection.findOne({ id: appt.staffId });
      if (staffMember) staffName = staffMember.name;
    }
    const formattedDate = new Date(appt.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    await sendEmail({
      to: recipientEmail,
      subject: `📅 ${typeLabel} - ${appt.petName} | ${clinicName}`,
      html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 32px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px;">🐾 ${clinicName}</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Conferma Appuntamento</p></div><div style="padding: 32px;"><div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 16px; padding: 24px; margin-bottom: 24px;"><table style="width: 100%;"><tr><td style="padding: 8px 0;"><span style="color: #64748b;">🐕 Paziente</span><br/><strong>${appt.petName}</strong></td></tr><tr><td style="padding: 8px 0;"><span style="color: #64748b;">📋 Tipo</span><br/><strong>${typeLabel}</strong></td></tr><tr><td style="padding: 8px 0;"><span style="color: #64748b;">📅 Data e ora</span><br/><strong style="color: #FF6B6B;">${formattedDate}</strong><br/><strong style="font-size: 24px;">🕐 ${appt.time}</strong></td></tr>${staffName ? `<tr><td style="padding: 8px 0;"><span style="color: #64748b;">👨‍⚕️ Con</span><br/><strong>${staffName}</strong></td></tr>` : ''}${appt.duration ? `<tr><td style="padding: 8px 0;"><span style="color: #64748b;">⏱️ Durata</span><br/><strong>${appt.duration} min</strong></td></tr>` : ''}</table></div>${appt.videoLink ? `<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;"><h3 style="color: white;">🎥 Video Consulto</h3><a href="${appt.videoLink}" target="_blank" style="display: inline-block; background: white; color: #6366f1; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">📹 Avvia Video Consulto</a></div>` : ''}${appt.reason ? `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;"><p style="margin: 0;"><strong>Note:</strong> ${appt.reason}</p></div>` : ''}<div style="background: #f8fafc; border-radius: 12px; padding: 20px;"><h3 style="margin: 0 0 12px;">📍 Dove trovarci</h3><p style="margin: 0; color: #64748b;"><strong>${clinicName}</strong><br/>${clinicAddress ? `${clinicAddress}<br/>` : ''}${clinicPhone ? `📞 ${clinicPhone}` : ''}</p></div></div><div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;"><p style="color: #94a3b8; font-size: 12px; margin: 0;">Inviato tramite <strong>vetbuddy</strong></p></div></div>`
    });

    await appointments.updateOne(
      { id: appointmentId },
      { $set: { emailSentAt: new Date().toISOString(), emailSentTo: recipientEmail } }
    );
    return NextResponse.json({ success: true, message: 'Email inviata con successo' }, { headers: corsHeaders });
  }

  // Google Calendar disconnect
  if (path === 'google-calendar/disconnect') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    await users.updateOne({ id: user.clinicId || user.id }, { $unset: { googleCalendar: '' } });
    return NextResponse.json({ success: true, message: 'Google Calendar disconnesso' }, { headers: corsHeaders });
  }

  // Sync appointment to Google Calendar
  if (path === 'google-calendar/sync-event') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { appointmentId } = body;
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.clinicId || user.id });
    if (!clinic?.googleCalendar?.connected) return NextResponse.json({ error: 'Google Calendar non connesso' }, { status: 400, headers: corsHeaders });
    
    const appointments = await getCollection('appointments');
    const appointment = await appointments.findOne({ id: appointmentId });
    if (!appointment) return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404, headers: corsHeaders });
    
    let accessToken = clinic.googleCalendar.accessToken;
    if (new Date(clinic.googleCalendar.expiresAt) < new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, refresh_token: clinic.googleCalendar.refreshToken, grant_type: 'refresh_token' })
      });
      const refreshData = await refreshResponse.json();
      if (refreshData.access_token) {
        accessToken = refreshData.access_token;
        await users.updateOne({ id: clinic.id }, { $set: { 'googleCalendar.accessToken': accessToken, 'googleCalendar.expiresAt': new Date(Date.now() + refreshData.expires_in * 1000).toISOString() } });
      }
    }
    
    const staff = await getCollection('staff');
    const staffMember = appointment.staffId ? await staff.findOne({ id: appointment.staffId }) : null;
    const colorId = staffMember?.calendarColorId || '1';
    
    const event = {
      summary: `🐾 ${appointment.petName || 'Visita'} - ${appointment.ownerName || 'Cliente'}`,
      description: `Tipo: ${appointment.type || 'Visita'}\nNote: ${appointment.notes || 'Nessuna nota'}\n\nCreato da vetbuddy`,
      start: { dateTime: appointment.date, timeZone: 'Europe/Rome' },
      end: { dateTime: new Date(new Date(appointment.date).getTime() + (appointment.duration || 30) * 60000).toISOString(), timeZone: 'Europe/Rome' },
      colorId, reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }, { method: 'popup', minutes: 10 }] }
    };
    
    const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${clinic.googleCalendar.calendarId || 'primary'}/events`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(event)
    });
    const createdEvent = await calendarResponse.json();
    if (createdEvent.error) return NextResponse.json({ error: createdEvent.error.message }, { status: 400, headers: corsHeaders });
    
    await appointments.updateOne({ id: appointmentId }, { $set: { googleEventId: createdEvent.id, googleCalendarSynced: true } });
    await users.updateOne({ id: clinic.id }, { $set: { 'googleCalendar.lastSync': new Date().toISOString() } });
    
    return NextResponse.json({ success: true, eventId: createdEvent.id, eventLink: createdEvent.htmlLink }, { headers: corsHeaders });
  }

  // Check Google Calendar busy times
  if (path === 'google-calendar/busy') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { startDate, endDate } = body;
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.clinicId || user.id });
    if (!clinic?.googleCalendar?.connected) return NextResponse.json({ busy: [] }, { headers: corsHeaders });
    
    let accessToken = clinic.googleCalendar.accessToken;
    if (new Date(clinic.googleCalendar.expiresAt) < new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, refresh_token: clinic.googleCalendar.refreshToken, grant_type: 'refresh_token' })
      });
      const refreshData = await refreshResponse.json();
      if (refreshData.access_token) accessToken = refreshData.access_token;
    }
    
    const busyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeMin: startDate, timeMax: endDate, items: [{ id: clinic.googleCalendar.calendarId || 'primary' }] })
    });
    const busyData = await busyResponse.json();
    const busy = busyData.calendars?.[clinic.googleCalendar.calendarId || 'primary']?.busy || [];
    return NextResponse.json({ busy }, { headers: corsHeaders });
  }

  return null;
}

export async function handleAppointmentsPut(path, request, user, body) {
  if (path.startsWith('appointments/')) {
    const id = path.split('/')[1];
    const appointments = await getCollection('appointments');
    await appointments.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
    const updated = await appointments.findOne({ id });
    return NextResponse.json(updated, { headers: corsHeaders });
  }
  return null;
}

export async function handleAppointmentsDelete(path, request, user) {
  if (path.startsWith('appointments/')) {
    const id = path.split('/')[1];
    const appointments = await getCollection('appointments');
    await appointments.deleteOne({ id });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }
  return null;
}
