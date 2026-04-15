// modules/clinic.js - Clinic Booking Link + Analytics/Metrics
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { corsHeaders } from './constants';

// Helper: generate slug from clinic name
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

// ==================== CLINIC GET HANDLERS ====================
export async function handleClinicGet(path, request) {

  // Get clinic booking link info
  if (path === 'clinic/booking-link') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.id });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
    }

    // Auto-generate slug if missing
    let slug = clinic.slug;
    if (!slug) {
      slug = generateSlug(clinic.clinicName || clinic.name || 'clinica');
      // Ensure uniqueness
      const existing = await users.findOne({ slug, id: { $ne: user.id } });
      if (existing) slug = `${slug}-${user.id.slice(0, 6)}`;
      await users.updateOne({ id: user.id }, { $set: { slug } });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const bookingUrl = `${baseUrl}/clinica/${slug}`;

    return NextResponse.json({
      slug,
      bookingUrl,
      clinicName: clinic.clinicName || clinic.name,
      city: clinic.city || '',
      phone: clinic.phone || '',
      address: clinic.address || '',
      services: clinic.services || [],
      profileComplete: !!(clinic.city && clinic.phone && clinic.address)
    }, { headers: corsHeaders });
  }

  // Public clinic profile by slug
  if (path.match(/^clinica\/[^/]+$/)) {
    const slug = path.split('/')[1];

    const users = await getCollection('users');
    const clinic = await users.findOne({ slug, role: 'clinic' }, { projection: { password: 0, stripeSecretKey: 0 } });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
    }

    // Track profile view
    const events = await getCollection('clinic_analytics_events');
    await events.insertOne({
      id: uuidv4(),
      clinicId: clinic.id,
      eventType: 'profile_view',
      source: 'booking_link',
      sessionId: request.headers.get('x-session-id') || uuidv4(),
      metadata: { slug, userAgent: request.headers.get('user-agent')?.substring(0, 200) || '' },
      createdAt: new Date().toISOString()
    });

    // Get available services and appointment slots
    const appointments = await getCollection('appointments');
    const recentAppointments = await appointments.countDocuments({ clinicId: clinic.id, status: 'completato' });

    return NextResponse.json({
      id: clinic.id,
      clinicName: clinic.clinicName || clinic.name,
      slug: clinic.slug,
      city: clinic.city,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      description: clinic.description || '',
      services: clinic.services || ['Visita generica', 'Vaccinazione', 'Chirurgia', 'Dermatologia', 'Odontoiatria'],
      workingHours: clinic.workingHours || { lun: '09:00-18:00', mar: '09:00-18:00', mer: '09:00-18:00', gio: '09:00-18:00', ven: '09:00-18:00', sab: '09:00-13:00' },
      completedAppointments: recentAppointments,
      province: clinic.province || '',
      logoUrl: clinic.logoUrl || null,
      specializations: clinic.specializations || []
    }, { headers: corsHeaders });
  }

  // Get clinic metrics/analytics
  if (path === 'clinic/metrics') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const events = await getCollection('clinic_analytics_events');
    const appointments = await getCollection('appointments');
    const bookingSessions = await getCollection('booking_sessions');

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // This month events
    const thisMonthProfileViews = await events.countDocuments({ clinicId: user.id, eventType: 'profile_view', createdAt: { $gte: thisMonthStart } });
    const thisMonthBookingStarted = await events.countDocuments({ clinicId: user.id, eventType: 'booking_started', createdAt: { $gte: thisMonthStart } });
    const thisMonthBookingCompleted = await events.countDocuments({ clinicId: user.id, eventType: 'booking_completed', createdAt: { $gte: thisMonthStart } });
    const thisMonthBookingAbandoned = await events.countDocuments({ clinicId: user.id, eventType: 'booking_abandoned', createdAt: { $gte: thisMonthStart } });

    // Last month events
    const lastMonthProfileViews = await events.countDocuments({ clinicId: user.id, eventType: 'profile_view', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });
    const lastMonthBookingCompleted = await events.countDocuments({ clinicId: user.id, eventType: 'booking_completed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });

    // Appointment stats this month
    const thisMonthAppointments = await appointments.countDocuments({ clinicId: user.id, createdAt: { $gte: thisMonthStart } });
    const completedAppointments = await appointments.countDocuments({ clinicId: user.id, status: 'completato', createdAt: { $gte: thisMonthStart } });
    const cancelledAppointments = await appointments.countDocuments({ clinicId: user.id, status: { $in: ['cancellato', 'annullato'] }, createdAt: { $gte: thisMonthStart } });
    const noShowAppointments = await appointments.countDocuments({ clinicId: user.id, status: 'no_show', createdAt: { $gte: thisMonthStart } });

    // Overall totals
    const totalProfileViews = await events.countDocuments({ clinicId: user.id, eventType: 'profile_view' });
    const totalBookingsCompleted = await events.countDocuments({ clinicId: user.id, eventType: 'booking_completed' });
    const totalAppointments = await appointments.countDocuments({ clinicId: user.id });

    // Conversion rate
    const conversionRate = thisMonthProfileViews > 0 
      ? Math.round((thisMonthBookingCompleted / thisMonthProfileViews) * 100) 
      : 0;

    // Phone calls saved estimate (1 booking = 1 phone call saved)
    const phoneCallsSaved = thisMonthBookingCompleted;

    // Bookings by source
    const bookingsBySource = await events.aggregate([
      { $match: { clinicId: user.id, eventType: 'booking_completed', createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]).toArray();

    // Weekly bookings (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekBookings = await events.countDocuments({
        clinicId: user.id,
        eventType: 'booking_completed',
        createdAt: { $gte: weekStart.toISOString(), $lt: weekEnd.toISOString() }
      });
      const weekViews = await events.countDocuments({
        clinicId: user.id,
        eventType: 'profile_view',
        createdAt: { $gte: weekStart.toISOString(), $lt: weekEnd.toISOString() }
      });
      
      weeklyData.push({
        weekStart: weekStart.toISOString(),
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        bookings: weekBookings,
        views: weekViews
      });
    }

    // Recent bookings
    const recentBookings = await appointments.find({ clinicId: user.id })
      .sort({ createdAt: -1 }).limit(10).toArray();

    // ===== REVENUE (Fatturato) =====
    const documents = await getCollection('documents');
    // Revenue from invoices/fatture this month
    const thisMonthInvoices = await documents.find({
      clinicId: user.id,
      $or: [{ type: 'fattura' }, { type: 'invoice' }, { category: 'fattura' }],
      createdAt: { $gte: thisMonthStart }
    }).toArray();
    const thisMonthRevenue = thisMonthInvoices.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    // Revenue from completed appointments this month (fallback if no invoices)
    const completedAppts = await appointments.find({
      clinicId: user.id,
      status: 'completato',
      createdAt: { $gte: thisMonthStart }
    }).toArray();
    const thisMonthApptRevenue = completedAppts.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);

    // Last month revenue
    const lastMonthInvoices = await documents.find({
      clinicId: user.id,
      $or: [{ type: 'fattura' }, { type: 'invoice' }, { category: 'fattura' }],
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    }).toArray();
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    const lastMonthCompletedAppts = await appointments.find({
      clinicId: user.id,
      status: 'completato',
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    }).toArray();
    const lastMonthApptRevenue = lastMonthCompletedAppts.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);

    // Total revenue (all time)
    const allInvoices = await documents.find({
      clinicId: user.id,
      $or: [{ type: 'fattura' }, { type: 'invoice' }, { category: 'fattura' }]
    }).toArray();
    const totalInvoiceRevenue = allInvoices.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const allCompletedAppts = await appointments.find({ clinicId: user.id, status: 'completato' }).toArray();
    const totalApptRevenue = allCompletedAppts.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);

    // Use the higher of the two sources as the revenue figure
    const thisMonthFatturato = Math.max(thisMonthRevenue, thisMonthApptRevenue);
    const lastMonthFatturato = Math.max(lastMonthRevenue, lastMonthApptRevenue);
    const totalFatturato = Math.max(totalInvoiceRevenue, totalApptRevenue);

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const mInvoices = await documents.find({
        clinicId: user.id,
        $or: [{ type: 'fattura' }, { type: 'invoice' }, { category: 'fattura' }],
        createdAt: { $gte: mStart.toISOString(), $lte: mEnd.toISOString() }
      }).toArray();
      const mAppts = await appointments.find({
        clinicId: user.id,
        status: 'completato',
        createdAt: { $gte: mStart.toISOString(), $lte: mEnd.toISOString() }
      }).toArray();
      const invRev = mInvoices.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const apptRev = mAppts.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
      monthlyRevenue.push({
        month: mStart.toLocaleDateString('it-IT', { month: 'short' }),
        year: mStart.getFullYear(),
        revenue: Math.max(invRev, apptRev),
        invoices: mInvoices.length,
        appointments: mAppts.length
      });
    }

    // New patients this month
    const users2 = await getCollection('users');
    const newPatientsThisMonth = await users2.countDocuments({
      role: 'owner',
      clinicId: user.id,
      createdAt: { $gte: thisMonthStart }
    });
    const newPatientsLastMonth = await users2.countDocuments({
      role: 'owner',
      clinicId: user.id,
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    const totalPatients = await users2.countDocuments({ role: 'owner', clinicId: user.id });

    // Lab requests this month
    const labRequests = await getCollection('lab_requests');
    const thisMonthLabRequests = await labRequests.countDocuments({ clinicId: user.id, createdAt: { $gte: thisMonthStart } });
    const lastMonthLabRequests = await labRequests.countDocuments({ clinicId: user.id, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } });

    return NextResponse.json({
      thisMonth: {
        profileViews: thisMonthProfileViews,
        bookingStarted: thisMonthBookingStarted,
        bookingCompleted: thisMonthBookingCompleted,
        bookingAbandoned: thisMonthBookingAbandoned,
        appointments: thisMonthAppointments,
        completedAppointments: completedAppointments,
        cancelledAppointments: cancelledAppointments,
        noShowAppointments: noShowAppointments,
        conversionRate,
        phoneCallsSaved,
        fatturato: thisMonthFatturato,
        newPatients: newPatientsThisMonth,
        labRequests: thisMonthLabRequests
      },
      lastMonth: {
        profileViews: lastMonthProfileViews,
        bookingCompleted: lastMonthBookingCompleted,
        fatturato: lastMonthFatturato,
        newPatients: newPatientsLastMonth,
        labRequests: lastMonthLabRequests
      },
      totals: {
        profileViews: totalProfileViews,
        bookingsCompleted: totalBookingsCompleted,
        appointments: totalAppointments,
        fatturato: totalFatturato,
        patients: totalPatients
      },
      comparison: {
        profileViewsDelta: thisMonthProfileViews - lastMonthProfileViews,
        bookingsDelta: thisMonthBookingCompleted - lastMonthBookingCompleted,
        fatturatoDelta: thisMonthFatturato - lastMonthFatturato,
        patientsDelta: newPatientsThisMonth - newPatientsLastMonth,
        labRequestsDelta: thisMonthLabRequests - lastMonthLabRequests
      },
      bookingsBySource: bookingsBySource.map(s => ({ source: s._id || 'direct', count: s.count })),
      weeklyData,
      monthlyRevenue,
      recentBookings: recentBookings.map(a => ({
        id: a.id, petName: a.petName, service: a.service || a.reason, date: a.date, time: a.time, status: a.status, ownerName: a.ownerName, price: a.price, createdAt: a.createdAt
      })),
      message: thisMonthBookingCompleted > 0 
        ? `Questo mese VetBuddy ti ha portato ${thisMonthBookingCompleted} prenotazion${thisMonthBookingCompleted === 1 ? 'e' : 'i'} e ti ha evitato ${phoneCallsSaved} telefonat${phoneCallsSaved === 1 ? 'a' : 'e'}.`
        : 'Le metriche inizieranno ad apparire quando riceverai le prime prenotazioni online.'
    }, { headers: corsHeaders });
  }

  return null;
}

// ==================== CLINIC POST HANDLERS ====================
export async function handleClinicPost(path, request, body) {

  // Update clinic booking link (slug)
  if (path === 'clinic/booking-link') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const { slug: newSlug } = body;
    if (!newSlug || newSlug.trim().length < 3) {
      return NextResponse.json({ error: 'Lo slug deve essere almeno 3 caratteri' }, { status: 400, headers: corsHeaders });
    }

    const cleanSlug = generateSlug(newSlug);
    
    const users = await getCollection('users');
    const existing = await users.findOne({ slug: cleanSlug, id: { $ne: user.id } });
    if (existing) {
      return NextResponse.json({ error: 'Questo link è già in uso. Prova un altro nome.' }, { status: 409, headers: corsHeaders });
    }

    await users.updateOne({ id: user.id }, { $set: { slug: cleanSlug, updatedAt: new Date().toISOString() } });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    return NextResponse.json({ 
      success: true, 
      slug: cleanSlug, 
      bookingUrl: `${baseUrl}/clinica/${cleanSlug}` 
    }, { headers: corsHeaders });
  }

  // Track analytics event
  if (path === 'analytics/track') {
    const { clinicId, eventType, source, sessionId, metadata } = body;

    if (!clinicId || !eventType) {
      return NextResponse.json({ error: 'clinicId e eventType sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const validEvents = ['profile_view', 'booking_started', 'booking_completed', 'booking_abandoned', 'booking_cancelled', 'appointment_completed', 'appointment_no_show', 'booking_link_clicked', 'reminder_sent'];
    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ error: 'Tipo evento non valido' }, { status: 400, headers: corsHeaders });
    }

    const events = await getCollection('clinic_analytics_events');
    const eventId = uuidv4();

    await events.insertOne({
      id: eventId,
      clinicId,
      userId: body.userId || null,
      eventType,
      source: source || 'direct',
      sessionId: sessionId || uuidv4(),
      metadata: metadata || {},
      createdAt: new Date().toISOString()
    });

    // If booking_completed, also update booking_sessions
    if (eventType === 'booking_completed' || eventType === 'booking_started' || eventType === 'booking_abandoned') {
      const sessions = await getCollection('booking_sessions');
      const sessId = sessionId || eventId;

      if (eventType === 'booking_started') {
        await sessions.insertOne({
          id: sessId,
          clinicId,
          userId: body.userId || null,
          petId: body.petId || null,
          source: source || 'direct',
          status: 'started',
          startedAt: new Date().toISOString()
        });
      } else if (eventType === 'booking_completed') {
        await sessions.updateOne(
          { id: sessId },
          { $set: { status: 'completed', completedAt: new Date().toISOString() } },
          { upsert: true }
        );
      } else if (eventType === 'booking_abandoned') {
        await sessions.updateOne(
          { id: sessId },
          { $set: { status: 'abandoned', abandonedAt: new Date().toISOString() } },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ success: true, eventId }, { headers: corsHeaders });
  }

  // Generate QR code for booking link
  if (path === 'clinic/qr-code') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.id });

    if (!clinic?.slug) {
      return NextResponse.json({ error: 'Configura prima il tuo link di prenotazione' }, { status: 400, headers: corsHeaders });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const bookingUrl = `${baseUrl}/clinica/${clinic.slug}`;

    try {
      const QRCode = require('qrcode');
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#7C3AED', light: '#FFFFFF' }
      });
      
      return NextResponse.json({ 
        success: true, 
        qrCodeDataUrl: qrDataUrl, 
        bookingUrl 
      }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json({ error: 'Errore generazione QR code' }, { status: 500, headers: corsHeaders });
    }
  }

  // Public booking - create appointment request from public link (no auth required)
  if (path.match(/^clinica\/[^/]+\/book$/)) {
    const slug = path.split('/')[1];

    const users = await getCollection('users');
    const clinic = await users.findOne({ slug, role: 'clinic' });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
    }

    const { ownerName, ownerEmail, ownerPhone, petName, petSpecies, service, date, time, notes } = body;

    if (!ownerName || !ownerPhone || !petName || !date) {
      return NextResponse.json({ error: 'Campi obbligatori: nome, telefono, nome animale, data' }, { status: 400, headers: corsHeaders });
    }

    const appointments = await getCollection('appointments');
    const appointmentId = uuidv4();

    const appointment = {
      id: appointmentId,
      clinicId: clinic.id,
      clinicName: clinic.clinicName || clinic.name,
      ownerName,
      ownerEmail: ownerEmail || '',
      ownerPhone,
      petName,
      petSpecies: petSpecies || '',
      date,
      time: time || 'mattina',
      reason: service || 'Visita generica',
      serviceId: service || 'Visita generica',
      notes: notes || '',
      status: 'pending',
      type: 'richiesta',
      source: 'booking_link',
      createdAt: new Date().toISOString()
    };

    await appointments.insertOne(appointment);

    // Track analytics event
    const events = await getCollection('clinic_analytics_events');
    await events.insertOne({
      id: uuidv4(),
      clinicId: clinic.id,
      eventType: 'booking_completed',
      source: 'booking_link',
      sessionId: body.sessionId || uuidv4(),
      metadata: { slug, petName, service, ownerName },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Richiesta di appuntamento inviata con successo! La clinica ti contatterà per confermare.',
      appointmentId
    }, { headers: corsHeaders });
  }

  return null;
}
