// modules/settings.js - Settings, reviews, search, profiles, services
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { VETERINARY_SERVICES, calculateDistance, corsHeaders } from './constants';

export async function handleSettingsGet(path, request) {
  // Services catalog
  if (path === 'services') {
    return NextResponse.json(VETERINARY_SERVICES, { headers: corsHeaders });
  }

  if (path === 'services/flat') {
    const flatServices = [];
    Object.entries(VETERINARY_SERVICES).forEach(([catId, cat]) => {
      cat.services.forEach(s => flatServices.push({ ...s, categoryId: catId, categoryName: cat.name, categoryIcon: cat.icon }));
    });
    return NextResponse.json(flatServices, { headers: corsHeaders });
  }

  // Automations settings
  if (path === 'automations/settings') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.id });
    const defaultSettings = {
      appointmentReminder24h: true, appointmentReminderSms: false, appointmentConfirmation: true,
      postVisitFollowUp: true, vaccineReminder: true, birthdayGreeting: false,
      noShowFollowUp: true, reviewRequest: true, documentReadyNotification: true,
      paymentReminder: false, weeklyReport: true, monthlyReport: false,
      newPatientWelcome: true, labResultReady: true, prescriptionExpiry: true,
      appointmentWaitlist: false, cancellationFollowUp: true, seasonalReminder: false,
      referralThankYou: false, inactivePatientReminder: false, emergencyAlert: true
    };
    const settings = clinic?.automationSettings || defaultSettings;
    return NextResponse.json(settings, { headers: corsHeaders });
  }

  // Video consult settings
  if (path === 'clinic/video-consult-settings') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.id });
    return NextResponse.json(clinic?.videoConsultSettings || {
      enabled: true, price: 35, duration: 20,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }],
      maxPerDay: 5, reminderEmail24h: true, reminderEmail1h: true, autoConfirm: true
    }, { headers: corsHeaders });
  }

  // Geocoding
  if (path === 'geocode') {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    if (!address) return NextResponse.json({ error: 'Indirizzo richiesto' }, { status: 400, headers: corsHeaders });
    try {
      const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return NextResponse.json({ success: true, latitude: lat, longitude: lng, formattedAddress: data.results[0].formatted_address }, { headers: corsHeaders });
      }
      return NextResponse.json({ success: false, error: 'Indirizzo non trovato' }, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json({ error: 'Errore durante la geocodifica' }, { status: 500, headers: corsHeaders });
    }
  }

  // Search clinics (public)
  if (path === 'clinics/search') {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const service = searchParams.get('service') || '';
    const userLat = parseFloat(searchParams.get('lat')) || null;
    const userLng = parseFloat(searchParams.get('lng')) || null;
    const maxDistance = parseFloat(searchParams.get('maxDistance')) || 50;
    
    const users = await getCollection('users');
    const filter = { role: 'clinic' };
    const andConditions = [];
    if (query) andConditions.push({ $or: [{ clinicName: { $regex: query, $options: 'i' } }, { name: { $regex: query, $options: 'i' } }] });
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (service) andConditions.push({ $or: [{ services: { $in: [service] } }, { services: { $regex: service, $options: 'i' } }, { servicesOffered: { $elemMatch: { id: service } } }] });
    if (andConditions.length > 0) filter.$and = andConditions;
    
    const clinics = await users.find(filter, { projection: { password: 0, resetToken: 0, resetExpiry: 0 } }).limit(50).toArray();
    const reviews = await getCollection('reviews');
    const clinicsWithReviews = await Promise.all(clinics.map(async (clinic) => {
      const clinicReviews = await reviews.find({ clinicId: clinic.id }).toArray();
      const avgRating = clinicReviews.length > 0 ? clinicReviews.reduce((sum, r) => sum + r.overallRating, 0) / clinicReviews.length : 0;
      let distance = null;
      if (userLat && userLng && clinic.latitude && clinic.longitude) distance = calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude);
      return { ...clinic, reviewCount: clinicReviews.length, avgRating: Math.round(avgRating * 10) / 10, distance: distance ? Math.round(distance * 10) / 10 : null };
    }));
    let filteredClinics = clinicsWithReviews;
    if (userLat && userLng) {
      filteredClinics = clinicsWithReviews.filter(c => c.distance === null || c.distance <= maxDistance).sort((a, b) => { if (a.distance === null) return 1; if (b.distance === null) return -1; return a.distance - b.distance; });
    }
    return NextResponse.json(filteredClinics, { headers: corsHeaders });
  }

  // Clinic reviews (authenticated)
  if (path === 'clinic/reviews') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const reviews = await getCollection('reviews');
    const list = await reviews.find({ clinicId: user.id }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ reviews: list }, { headers: corsHeaders });
  }

  // Owner reviews
  if (path === 'reviews/my-reviews') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const reviews = await getCollection('reviews');
    const users = await getCollection('users');
    const myReviews = await reviews.find({ ownerId: user.id }).sort({ createdAt: -1 }).toArray();
    const enrichedReviews = await Promise.all(myReviews.map(async (review) => {
      const clinic = await users.findOne({ id: review.clinicId, role: 'clinic' });
      return { ...review, clinicName: clinic?.clinicName || clinic?.name || 'Clinica', clinicAddress: clinic?.address || '' };
    }));
    return NextResponse.json(enrichedReviews, { headers: corsHeaders });
  }

  // Public clinic reviews
  if (path.startsWith('clinics/') && path.endsWith('/reviews')) {
    const clinicId = path.split('/')[1];
    const reviews = await getCollection('reviews');
    const list = await reviews.find({ clinicId }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(list, { headers: corsHeaders });
  }

  // Single clinic (public)
  if (path.startsWith('clinics/') && !path.includes('/reviews') && !path.includes('/slots')) {
    const clinicId = path.split('/')[1];
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: clinicId, role: 'clinic' }, { projection: { password: 0 } });
    if (!clinic) return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
    const reviews = await getCollection('reviews');
    const clinicReviews = await reviews.find({ clinicId }).toArray();
    const avgRating = clinicReviews.length > 0 ? clinicReviews.reduce((sum, r) => sum + r.overallRating, 0) / clinicReviews.length : 0;
    return NextResponse.json({ ...clinic, reviewCount: clinicReviews.length, avgRating: Math.round(avgRating * 10) / 10 }, { headers: corsHeaders });
  }

  return null;
}

export async function handleSettingsPost(path, request, body) {
  // Waitlist
  if (path === 'waitlist') {
    const { email, userType } = body;
    if (!email) return NextResponse.json({ error: 'Email richiesta' }, { status: 400, headers: corsHeaders });
    const waitlist = await getCollection('waitlist');
    const existing = await waitlist.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ success: true, message: 'Email già registrata' }, { headers: corsHeaders });
    await waitlist.insertOne({ id: uuidv4(), email: email.toLowerCase(), userType: userType || 'unknown', createdAt: new Date().toISOString(), source: 'coming_soon_page' });
    return NextResponse.json({ success: true, message: 'Aggiunto alla lista di attesa' }, { headers: corsHeaders });
  }

  // Invite clinic
  if (path === 'invite-clinic') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'owner') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { clinicName, clinicEmail, serviceCategory, personalMessage } = body;
    if (!clinicEmail) return NextResponse.json({ error: 'Email clinica obbligatoria' }, { status: 400, headers: corsHeaders });
    const invitations = await getCollection('invitations');
    const existing = await invitations.findOne({ clinicEmail: clinicEmail.toLowerCase(), ownerId: user.id });
    if (existing) return NextResponse.json({ error: 'Hai già invitato questa clinica' }, { status: 400, headers: corsHeaders });
    const invitation = { id: uuidv4(), ownerId: user.id, ownerName: user.name || user.email, ownerEmail: user.email, clinicName: clinicName || '', clinicEmail: clinicEmail.toLowerCase(), serviceCategory: serviceCategory || '', personalMessage: personalMessage || '', status: 'sent', createdAt: new Date().toISOString() };
    await invitations.insertOne(invitation);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      await sendEmail({
        to: clinicEmail.toLowerCase(),
        subject: `🐾 ${user.name || 'Un proprietario'} ti invita su VetBuddy!`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 30px; text-align: center;"><h1 style="color: white; margin: 0;">🐾 VetBuddy</h1><p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">La piattaforma per cliniche veterinarie</p></div><div style="padding: 30px; background: #f9f9f9;"><p>Gentile <strong>${clinicName || 'Clinica'}</strong>,</p><p><strong>${user.name || 'Un proprietario di animali'}</strong> ti ha invitato a unirti a VetBuddy!</p>${personalMessage ? `<div style="background: white; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;"><p style="margin: 0; color: #666;">&ldquo;${personalMessage}&rdquo;</p></div>` : ''}<div style="text-align: center; margin: 30px 0;"><a href="${baseUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold;">Scopri VetBuddy</a></div></div><div style="background: #333; padding: 15px; text-align: center;"><p style="color: #999; margin: 0; font-size: 12px;">© 2025 VetBuddy</p></div></div>`
      });
      await invitations.updateOne({ id: invitation.id }, { $set: { emailSent: true, emailSentAt: new Date().toISOString() } });
      return NextResponse.json({ success: true, message: 'Invito inviato con successo!', invitation }, { headers: corsHeaders });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      return NextResponse.json({ success: true, message: 'Invito salvato (email non inviata)', emailError: true }, { headers: corsHeaders });
    }
  }

  // Automations settings
  if (path === 'automations/settings') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { key, enabled } = body;
    if (!key) return NextResponse.json({ error: 'Chiave automazione mancante' }, { status: 400, headers: corsHeaders });
    const users = await getCollection('users');
    const updateKey = `automationSettings.${key}`;
    await users.updateOne({ id: user.id }, { $set: { [updateKey]: enabled } });
    return NextResponse.json({ success: true, key, enabled }, { headers: corsHeaders });
  }

  // Video consult settings
  if (path === 'clinic/video-consult-settings') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    await users.updateOne({ id: user.id }, { $set: { videoConsultSettings: body, updatedAt: new Date().toISOString() } });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  // Submit review
  if (path === 'reviews') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'owner') return NextResponse.json({ error: 'Solo i proprietari possono lasciare recensioni' }, { status: 401, headers: corsHeaders });
    const { clinicId, overallRating, punctuality, competence, price, comment } = body;
    if (!clinicId || !overallRating) return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400, headers: corsHeaders });
    const reviews = await getCollection('reviews');
    const existing = await reviews.findOne({ clinicId, ownerId: user.id });
    if (existing) return NextResponse.json({ error: 'Hai già recensito questa clinica' }, { status: 400, headers: corsHeaders });
    const review = { id: uuidv4(), clinicId, ownerId: user.id, ownerName: user.name || 'Utente', overallRating: Math.min(5, Math.max(1, overallRating)), punctuality: punctuality ? Math.min(5, Math.max(1, punctuality)) : null, competence: competence ? Math.min(5, Math.max(1, competence)) : null, price: price ? Math.min(5, Math.max(1, price)) : null, comment: comment || '', createdAt: new Date().toISOString() };
    await reviews.insertOne(review);
    return NextResponse.json(review, { headers: corsHeaders });
  }

  return null;
}

export async function handleSettingsPut(path, request, user, body) {
  // Update clinic profile
  if (path === 'clinic/profile') {
    const users = await getCollection('users');
    const { address, city, latitude, longitude, phone, whatsappNumber, website, services, googlePlaceId, googleRating, clinicName, vatNumber, description, openingTime, closingTime, cancellationPolicyText } = body;
    const updateData = { updatedAt: new Date().toISOString() };
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (website !== undefined) updateData.website = website;
    if (services !== undefined) updateData.services = services;
    if (googlePlaceId !== undefined) updateData.googlePlaceId = googlePlaceId;
    if (googleRating !== undefined) updateData.googleRating = googleRating;
    if (clinicName !== undefined) updateData.clinicName = clinicName;
    if (vatNumber !== undefined) updateData.vatNumber = vatNumber;
    if (description !== undefined) updateData.description = description;
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;
    if (cancellationPolicyText !== undefined) updateData.cancellationPolicyText = cancellationPolicyText;
    await users.updateOne({ id: user.id }, { $set: updateData });
    const updated = await users.findOne({ id: user.id }, { projection: { password: 0 } });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  // Update clinic services
  if (path === 'clinic/services') {
    const users = await getCollection('users');
    const { services, customServices } = body;
    const updateData = { updatedAt: new Date().toISOString() };
    if (services !== undefined) updateData.services = services;
    if (customServices !== undefined) updateData.customServices = customServices;
    await users.updateOne({ id: user.id }, { $set: updateData });
    const updated = await users.findOne({ id: user.id }, { projection: { password: 0 } });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  // Update owner profile
  if (path === 'owner/profile') {
    const users = await getCollection('users');
    const { address, city, latitude, longitude, phone } = body;
    const updateData = { updatedAt: new Date().toISOString() };
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (phone !== undefined) updateData.phone = phone;
    await users.updateOne({ id: user.id }, { $set: updateData });
    const updated = await users.findOne({ id: user.id }, { projection: { password: 0 } });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  return null;
}
