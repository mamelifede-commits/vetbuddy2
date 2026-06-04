// modules/passport.js - VetBuddy Passport: digital pet health passport
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { corsHeaders } from './constants';

// ============================================================
// HELPER: Calculate passport completion score
// ============================================================
function calculateCompletionScore(pet, passport, emergencyContacts, documents, vaccinations) {
  const checks = [
    { key: 'name', ok: !!pet?.name },
    { key: 'species', ok: !!pet?.species },
    { key: 'breed', ok: !!pet?.breed },
    { key: 'birthDate', ok: !!pet?.birthDate },
    { key: 'weight', ok: !!pet?.weight },
    { key: 'microchip', ok: !!pet?.microchip },
    { key: 'photo', ok: !!pet?.photo },
    { key: 'allergies', ok: !!pet?.allergies },
    { key: 'emergencyContacts', ok: emergencyContacts?.length > 0 },
    { key: 'vaccinations', ok: vaccinations?.length > 0 },
    { key: 'documents', ok: documents?.length > 0 },
    { key: 'qrEnabled', ok: !!passport?.publicQrEnabled },
  ];
  const completed = checks.filter(c => c.ok).length;
  const total = checks.length;
  const score = Math.round((completed / total) * 100);
  const missing = checks.filter(c => !c.ok).map(c => c.key);
  let status = 'incompleto';
  if (score >= 100) status = 'completo';
  else if (score >= 60) status = 'quasi_completo';
  return { score, status, completed, total, missing };
}

// ============================================================
// GET HANDLERS
// ============================================================
export async function handlePassportGet(path, request) {

  // GET /api/passport/:petId — Full passport data
  if (path.match(/^passport\/[^/]+$/) && !path.includes('public')) {
    const petId = path.split('/')[1];
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: petId });
    if (!pet) return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });

    const passports = await getCollection('pet_passports');
    let passport = await passports.findOne({ petId });
    if (!passport) {
      // Auto-create passport record
      passport = {
        id: uuidv4(), petId, publicQrEnabled: false, publicQrUrl: null,
        publicVisibilitySettings: {
          showPhoto: true, showName: true, showSpecies: true, showBreed: true,
          showMicrochip: false, showAllergies: true, showMedications: true,
          showChronicConditions: true, showEmergencyContacts: true, showClinic: true,
          showCity: true, showBehavioralNotes: false,
        },
        lostPetMode: false, lostPetMessage: '', lostPetDate: null, lostPetZone: '',
        lostPetReward: '', lostPetStatus: null, lostPetContactPriority: '',
        passportCompletionScore: 0, lastReviewedAt: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      await passports.insertOne(passport);
    }

    const emergencyContacts = await getCollection('pet_emergency_contacts');
    const contacts = await emergencyContacts.find({ petId }).toArray();

    const sharingLinks = await getCollection('pet_sharing_links');
    const shares = await sharingLinks.find({ petId }).toArray();

    const travelPacks = await getCollection('pet_travel_packs');
    const travels = await travelPacks.find({ petId }).sort({ startDate: -1 }).toArray();

    const insurance = await getCollection('pet_insurance');
    const ins = await insurance.findOne({ petId });

    const docs = await getCollection('documents');
    const documents = await docs.find({ petId }).sort({ createdAt: -1 }).toArray();

    const vaccs = await getCollection('vaccinations');
    const vaccinations = await vaccs.find({ petId }).sort({ date: -1 }).toArray();

    const scanLogs = await getCollection('pet_qr_scan_logs');
    const recentScans = await scanLogs.find({ petId }).sort({ scannedAt: -1 }).limit(10).toArray();

    // Calculate completion
    const completion = calculateCompletionScore(pet, passport, contacts, documents, vaccinations);
    await passports.updateOne({ petId }, { $set: { passportCompletionScore: completion.score, updatedAt: new Date().toISOString() } });

    return NextResponse.json({
      pet, passport: { ...passport, passportCompletionScore: completion.score },
      completion, emergencyContacts: contacts, sharingLinks: shares,
      travelPacks: travels, insurance: ins, documents, vaccinations, recentScans,
    }, { headers: corsHeaders });
  }

  // GET /api/passport/public/:token — Public QR page (no auth needed)
  if (path.match(/^passport\/public\/[^/]+$/)) {
    const token = path.split('/')[2];
    const passports = await getCollection('pet_passports');
    const passport = await passports.findOne({ publicQrUrl: token });
    if (!passport || !passport.publicQrEnabled) {
      return NextResponse.json({ error: 'Passport non trovato o QR disattivato' }, { status: 404, headers: corsHeaders });
    }

    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: passport.petId });
    if (!pet) return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });

    // Log the scan
    const scanLogs = await getCollection('pet_qr_scan_logs');
    const ua = request.headers.get('user-agent') || '';
    await scanLogs.insertOne({
      id: uuidv4(), petId: passport.petId, scannedAt: new Date().toISOString(),
      approximateLocation: null, userAgent: ua, actionTaken: 'view',
    });

    // Build public data based on visibility settings
    const vis = passport.publicVisibilitySettings || {};
    const publicData = {
      isLostPetMode: passport.lostPetMode || false,
      lostPetMessage: passport.lostPetMode ? passport.lostPetMessage : null,
      lostPetReward: passport.lostPetMode ? passport.lostPetReward : null,
      lostPetZone: passport.lostPetMode ? passport.lostPetZone : null,
    };
    if (vis.showPhoto) publicData.photo = pet.photo;
    if (vis.showName) publicData.name = pet.name;
    if (vis.showSpecies) publicData.species = pet.species;
    if (vis.showBreed) publicData.breed = pet.breed;
    if (vis.showMicrochip) publicData.microchip = pet.microchip;
    if (vis.showAllergies) publicData.allergies = pet.allergies;
    if (vis.showMedications) publicData.medications = pet.medications;
    if (vis.showChronicConditions) publicData.chronicConditions = pet.chronicConditions;
    if (vis.showBehavioralNotes) publicData.behavioralNotes = pet.behavioralNotes;
    if (vis.showCity) publicData.city = pet.city;

    // Emergency contacts
    if (vis.showEmergencyContacts) {
      const emergencyContacts = await getCollection('pet_emergency_contacts');
      const contacts = await emergencyContacts.find({ petId: passport.petId, visibleOnQr: true }).toArray();
      publicData.emergencyContacts = contacts.map(c => ({
        name: c.name, relationship: c.relationship, phone: c.phone, email: c.email,
      }));
    }

    // Clinic info
    if (vis.showClinic && pet.clinicId) {
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: pet.clinicId });
      if (clinic) {
        publicData.clinicName = clinic.clinicSettings?.clinicName || clinic.name;
        publicData.clinicPhone = clinic.clinicSettings?.phone || '';
      }
    }

    return NextResponse.json({ publicData, petId: passport.petId }, { headers: corsHeaders });
  }

  // GET /api/passport/shared/:token — Shared access view
  if (path.match(/^passport\/shared\/[^/]+$/)) {
    const token = path.split('/')[2];
    const sharingLinks = await getCollection('pet_sharing_links');
    const share = await sharingLinks.findOne({ accessToken: token, status: 'active' });
    if (!share) return NextResponse.json({ error: 'Link non valido o scaduto' }, { status: 404, headers: corsHeaders });

    const now = new Date();
    if (new Date(share.expiresAt) < now) {
      await sharingLinks.updateOne({ accessToken: token }, { $set: { status: 'expired' } });
      return NextResponse.json({ error: 'Link scaduto' }, { status: 410, headers: corsHeaders });
    }

    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: share.petId });
    if (!pet) return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });

    const permissions = share.permissions || {};
    const sharedData = { name: pet.name, species: pet.species, breed: pet.breed, photo: pet.photo };
    if (permissions.viewAllergies) sharedData.allergies = pet.allergies;
    if (permissions.viewMedications) sharedData.medications = pet.medications;
    if (permissions.viewDiet) sharedData.diet = pet.diet;
    if (permissions.viewBehavioralNotes) sharedData.behavioralNotes = pet.behavioralNotes;
    if (permissions.viewEmergencyContacts) {
      const ec = await getCollection('pet_emergency_contacts');
      sharedData.emergencyContacts = await ec.find({ petId: share.petId }).toArray();
    }
    if (permissions.viewVaccinations) {
      const v = await getCollection('vaccinations');
      sharedData.vaccinations = await v.find({ petId: share.petId }).toArray();
    }
    if (permissions.viewTravelDocs) {
      const d = await getCollection('documents');
      sharedData.travelDocuments = await d.find({ petId: share.petId, category: 'documenti_viaggio' }).toArray();
    }

    return NextResponse.json({
      sharedData, recipientName: share.recipientName, recipientRole: share.recipientRole,
      expiresAt: share.expiresAt, petName: pet.name,
    }, { headers: corsHeaders });
  }

  // GET /api/passport/clinic/dashboard — Clinic passport dashboard
  if (path === 'passport/clinic/dashboard') {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const users = await getCollection('users');
    const owners = await users.find({ role: 'owner', clinicId: user.id }).project({ id: 1 }).toArray();
    const ownerIds = owners.map(o => o.id);

    const pets = await getCollection('pets');
    const allPets = await pets.find({ $or: [{ clinicId: user.id }, { ownerId: { $in: ownerIds } }] }).toArray();
    const petIds = allPets.map(p => p.id);

    const passports = await getCollection('pet_passports');
    const allPassports = await passports.find({ petId: { $in: petIds } }).toArray();
    const passportMap = {};
    allPassports.forEach(p => { passportMap[p.petId] = p; });

    const vaccs = await getCollection('vaccinations');
    const allVaccs = await vaccs.find({ petId: { $in: petIds } }).toArray();

    const docs = await getCollection('documents');
    const allDocs = await docs.find({ petId: { $in: petIds } }).toArray();

    const sharingLinks = await getCollection('pet_sharing_links');
    const activeShares = await sharingLinks.countDocuments({ petId: { $in: petIds }, status: 'active' });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Build stats
    const passportActive = allPassports.filter(p => p.passportCompletionScore > 0).length;
    const passportIncomplete = allPassports.filter(p => p.passportCompletionScore < 60).length;
    const qrGenerated = allPassports.filter(p => p.publicQrEnabled).length;

    const vaccinesExpiring = allVaccs.filter(v => {
      if (!v.nextDueDate) return false;
      const due = new Date(v.nextDueDate);
      return due >= now && due <= thirtyDaysFromNow;
    });

    const docsExpiring = allDocs.filter(d => {
      if (!d.expiryDate) return false;
      const exp = new Date(d.expiryDate);
      return exp >= now && exp <= thirtyDaysFromNow;
    });

    const petsWithoutMicrochip = allPets.filter(p => !p.microchip);
    const petsWithoutEmergencyContact = [];

    const ec = await getCollection('pet_emergency_contacts');
    for (const pet of allPets) {
      const count = await ec.countDocuments({ petId: pet.id });
      if (count === 0) petsWithoutEmergencyContact.push(pet);
    }

    return NextResponse.json({
      stats: {
        totalPets: allPets.length, passportActive, passportIncomplete, qrGenerated,
        vaccinesExpiring: vaccinesExpiring.length, docsExpiring: docsExpiring.length,
        activeShares,
      },
      lists: {
        petsWithoutMicrochip: petsWithoutMicrochip.slice(0, 20),
        petsWithoutEmergencyContact: petsWithoutEmergencyContact.slice(0, 20),
        vaccinesExpiring: vaccinesExpiring.slice(0, 20),
        docsExpiring: docsExpiring.slice(0, 20),
      },
    }, { headers: corsHeaders });
  }

  // GET /api/passport/tutorials — Get tutorials
  if (path === 'passport/tutorials') {
    const tutorials = await getCollection('tutorials');
    const list = await tutorials.find({ relatedFeature: 'passport' }).sort({ order: 1 }).toArray();
    return NextResponse.json(list, { headers: corsHeaders });
  }

  return null;
}

// ============================================================
// POST HANDLERS
// ============================================================
export async function handlePassportPost(path, request, body) {

  // POST /api/passport/emergency-contacts — Add emergency contact
  if (path === 'passport/emergency-contacts') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { petId, name, relationship, phone, email, priority, visibleOnQr } = body;
    if (!petId || !name || !phone) {
      return NextResponse.json({ error: 'Pet, nome e telefono sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const ec = await getCollection('pet_emergency_contacts');
    const contact = {
      id: uuidv4(), petId, name, relationship: relationship || '',
      phone, email: email || '', priority: priority || 1,
      visibleOnQr: visibleOnQr !== false,
      createdAt: new Date().toISOString(),
    };
    await ec.insertOne(contact);
    return NextResponse.json(contact, { headers: corsHeaders });
  }

  // POST /api/passport/qr/generate — Generate QR
  if (path === 'passport/qr/generate') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { petId } = body;
    const passports = await getCollection('pet_passports');
    let passport = await passports.findOne({ petId });
    const qrToken = uuidv4();

    if (passport) {
      await passports.updateOne({ petId }, {
        $set: { publicQrEnabled: true, publicQrUrl: qrToken, updatedAt: new Date().toISOString() }
      });
    } else {
      passport = {
        id: uuidv4(), petId, publicQrEnabled: true, publicQrUrl: qrToken,
        publicVisibilitySettings: {
          showPhoto: true, showName: true, showSpecies: true, showBreed: true,
          showMicrochip: false, showAllergies: true, showMedications: true,
          showChronicConditions: true, showEmergencyContacts: true, showClinic: true,
          showCity: true, showBehavioralNotes: false,
        },
        lostPetMode: false, lostPetMessage: '', lostPetDate: null, lostPetZone: '',
        lostPetReward: '', lostPetStatus: null, lostPetContactPriority: '',
        passportCompletionScore: 0, lastReviewedAt: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      await passports.insertOne(passport);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrPageUrl = `${baseUrl}/passport/${qrToken}`;

    return NextResponse.json({ success: true, qrToken, qrPageUrl }, { headers: corsHeaders });
  }

  // POST /api/passport/sharing — Create sharing link
  if (path === 'passport/sharing') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { petId, recipientName, recipientEmail, recipientRole, permissions, startsAt, expiresAt } = body;
    if (!petId || !recipientName) {
      return NextResponse.json({ error: 'Pet e nome destinatario sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const sharingLinks = await getCollection('pet_sharing_links');
    const accessToken = uuidv4();
    const share = {
      id: uuidv4(), petId, createdByUserId: user.id,
      recipientName, recipientEmail: recipientEmail || '', recipientRole: recipientRole || 'altro',
      permissions: permissions || {
        viewAllergies: true, viewMedications: true, viewDiet: true,
        viewEmergencyContacts: true, viewVaccinations: true,
        viewTravelDocs: false, viewBehavioralNotes: true, viewQr: true,
      },
      startsAt: startsAt || new Date().toISOString(),
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active', accessToken,
      createdAt: new Date().toISOString(), revokedAt: null,
    };
    await sharingLinks.insertOne(share);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/passport/shared/${accessToken}`;

    // Send email if provided
    if (recipientEmail) {
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      await sendEmail({
        to: recipientEmail,
        subject: `🐾 ${user.name || 'Un proprietario'} ha condiviso il Passport di ${pet?.name || 'un animale'}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#f97066;">🐾 VetBuddy Passport</h2>
          <p><strong>${user.name || 'Un proprietario'}</strong> ti ha dato accesso al Passport di <strong>${pet?.name || 'un animale'}</strong>.</p>
          <p>Ruolo: <strong>${recipientRole}</strong></p>
          <p>Accesso valido fino al: <strong>${new Date(share.expiresAt).toLocaleDateString('it-IT')}</strong></p>
          <a href="${shareUrl}" style="display:inline-block;background:linear-gradient(135deg,#f97066,#fb923c);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Visualizza Passport →</a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">VetBuddy — Il copilota operativo per cliniche veterinarie</p>
        </div>`,
      });
    }

    return NextResponse.json({ ...share, shareUrl }, { headers: corsHeaders });
  }

  // POST /api/passport/travel-packs — Create travel pack
  if (path === 'passport/travel-packs') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { petId, destination, startDate, endDate, transportType, accommodation, checklist, notes, sharedWith } = body;
    if (!petId || !destination) {
      return NextResponse.json({ error: 'Pet e destinazione sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const travelPacks = await getCollection('pet_travel_packs');
    const pack = {
      id: uuidv4(), petId, destination, startDate: startDate || '', endDate: endDate || '',
      transportType: transportType || '', accommodation: accommodation || '',
      checklist: checklist || {
        vacciniVerificati: false, microchipVerificato: false, documentiCaricati: false,
        contattoEmergenzaAggiunto: false, alimentazioneAggiunta: false,
        farmaciAggiunti: false, accessoTemporaneoCondiviso: false,
      },
      notes: notes || '', sharedWith: sharedWith || [], pdfUrl: null, status: 'draft',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await travelPacks.insertOne(pack);
    return NextResponse.json(pack, { headers: corsHeaders });
  }

  // POST /api/passport/insurance — Add insurance
  if (path === 'passport/insurance') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { petId, providerName, policyNumber, startDate, endDate, coverageNotes, documentId, renewalReminderEnabled } = body;
    if (!petId || !providerName) {
      return NextResponse.json({ error: 'Pet e compagnia sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const insurance = await getCollection('pet_insurance');
    const existing = await insurance.findOne({ petId });
    const ins = {
      id: existing?.id || uuidv4(), petId, providerName, policyNumber: policyNumber || '',
      startDate: startDate || '', endDate: endDate || '', coverageNotes: coverageNotes || '',
      documentId: documentId || null, renewalReminderEnabled: renewalReminderEnabled !== false,
      createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await insurance.updateOne({ petId }, { $set: ins });
    } else {
      await insurance.insertOne(ins);
    }
    return NextResponse.json(ins, { headers: corsHeaders });
  }

  // POST /api/passport/lost-pet/report — Report found pet (public, no auth)
  if (path === 'passport/lost-pet/report') {
    const { petId, finderName, finderPhone, finderEmail, finderMessage, approximateLocation } = body;
    if (!petId) return NextResponse.json({ error: 'Pet ID obbligatorio' }, { status: 400, headers: corsHeaders });

    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: petId });
    if (!pet) return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });

    // Notify owner
    if (pet.ownerId) {
      const users = await getCollection('users');
      const owner = await users.findOne({ id: pet.ownerId });
      if (owner?.email) {
        await sendEmail({
          to: owner.email,
          subject: `🐾 Qualcuno ha trovato ${pet.name}!`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#f97066;">🐾 Segnalazione ritrovamento!</h2>
            <p>Qualcuno ha segnalato di aver trovato <strong>${pet.name}</strong>.</p>
            <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
              <p><strong>Nome:</strong> ${finderName || 'Non specificato'}</p>
              <p><strong>Telefono:</strong> ${finderPhone || 'Non specificato'}</p>
              <p><strong>Email:</strong> ${finderEmail || 'Non specificata'}</p>
              ${finderMessage ? `<p><strong>Messaggio:</strong> ${finderMessage}</p>` : ''}
              ${approximateLocation ? `<p><strong>Zona:</strong> ${approximateLocation}</p>` : ''}
            </div>
            <p>Contatta questa persona il prima possibile!</p>
          </div>`,
        });
      }
    }

    // Log scan
    const scanLogs = await getCollection('pet_qr_scan_logs');
    await scanLogs.insertOne({
      id: uuidv4(), petId, scannedAt: new Date().toISOString(),
      approximateLocation: approximateLocation || null,
      userAgent: request.headers.get('user-agent') || '', actionTaken: 'report_found',
    });

    return NextResponse.json({ success: true, message: 'Segnalazione inviata al proprietario' }, { headers: corsHeaders });
  }

  // POST /api/passport/vaccinations — Add vaccination
  if (path === 'passport/vaccinations') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { petId, name, date, nextDueDate, batchNumber, veterinarian, documentId, notes, type } = body;
    if (!petId || !name || !date) {
      return NextResponse.json({ error: 'Pet, nome vaccino e data sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const vaccs = await getCollection('vaccinations');
    const now = new Date();
    let status = 'in_regola';
    if (nextDueDate) {
      const due = new Date(nextDueDate);
      const thirtyDaysBefore = new Date(due.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (due < now) status = 'scaduto';
      else if (thirtyDaysBefore < now) status = 'in_scadenza';
    }

    const vaccination = {
      id: uuidv4(), petId, name, date, nextDueDate: nextDueDate || null,
      batchNumber: batchNumber || '', veterinarian: veterinarian || '',
      documentId: documentId || null, notes: notes || '',
      type: type || 'vaccino', status,
      createdAt: new Date().toISOString(),
    };
    await vaccs.insertOne(vaccination);
    return NextResponse.json(vaccination, { headers: corsHeaders });
  }

  return null;
}

// ============================================================
// PUT HANDLERS
// ============================================================
export async function handlePassportPut(path, request, user, body) {

  // PUT /api/passport/:petId — Update passport settings
  if (path.match(/^passport\/[^/]+$/) && !path.includes('public') && !path.includes('shared')) {
    const petId = path.split('/')[1];
    const passports = await getCollection('pet_passports');
    const update = {};

    if (body.publicVisibilitySettings) update.publicVisibilitySettings = body.publicVisibilitySettings;
    if (body.publicQrEnabled !== undefined) update.publicQrEnabled = body.publicQrEnabled;
    if (body.lostPetMode !== undefined) {
      update.lostPetMode = body.lostPetMode;
      if (body.lostPetMode) {
        update.lostPetDate = body.lostPetDate || new Date().toISOString();
        update.lostPetMessage = body.lostPetMessage || '';
        update.lostPetZone = body.lostPetZone || '';
        update.lostPetReward = body.lostPetReward || '';
        update.lostPetStatus = 'active';
        update.lostPetContactPriority = body.lostPetContactPriority || '';
      } else {
        update.lostPetStatus = 'found';
      }
    }
    update.updatedAt = new Date().toISOString();

    await passports.updateOne({ petId }, { $set: update }, { upsert: true });
    const updated = await passports.findOne({ petId });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  // PUT /api/passport/emergency-contacts/:id — Update emergency contact
  if (path.match(/^passport\/emergency-contacts\/[^/]+$/)) {
    const contactId = path.split('/')[2];
    const ec = await getCollection('pet_emergency_contacts');
    const { name, relationship, phone, email, priority, visibleOnQr } = body;
    await ec.updateOne({ id: contactId }, { $set: { name, relationship, phone, email, priority, visibleOnQr, updatedAt: new Date().toISOString() } });
    const updated = await ec.findOne({ id: contactId });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  // PUT /api/passport/sharing/:id/revoke — Revoke sharing
  if (path.match(/^passport\/sharing\/[^/]+\/revoke$/)) {
    const shareId = path.split('/')[2];
    const sharingLinks = await getCollection('pet_sharing_links');
    await sharingLinks.updateOne({ id: shareId }, { $set: { status: 'revoked', revokedAt: new Date().toISOString() } });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  // PUT /api/passport/travel-packs/:id — Update travel pack
  if (path.match(/^passport\/travel-packs\/[^/]+$/)) {
    const packId = path.split('/')[2];
    const travelPacks = await getCollection('pet_travel_packs');
    body.updatedAt = new Date().toISOString();
    await travelPacks.updateOne({ id: packId }, { $set: body });
    const updated = await travelPacks.findOne({ id: packId });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  // PUT /api/passport/vaccinations/:id — Update vaccination
  if (path.match(/^passport\/vaccinations\/[^/]+$/)) {
    const vaccId = path.split('/')[2];
    const vaccs = await getCollection('vaccinations');
    body.updatedAt = new Date().toISOString();

    if (body.nextDueDate) {
      const now = new Date();
      const due = new Date(body.nextDueDate);
      const thirtyDaysBefore = new Date(due.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (due < now) body.status = 'scaduto';
      else if (thirtyDaysBefore < now) body.status = 'in_scadenza';
      else body.status = 'in_regola';
    }

    await vaccs.updateOne({ id: vaccId }, { $set: body });
    const updated = await vaccs.findOne({ id: vaccId });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  // PUT /api/passport/pets/:petId — Update pet passport fields
  if (path.match(/^passport\/pets\/[^/]+$/)) {
    const petId = path.split('/')[2];
    const pets = await getCollection('pets');
    const allowedFields = ['microchip', 'allergies', 'chronicConditions', 'medications', 'diet',
      'behavioralNotes', 'distinguishingMarks', 'city', 'primaryVetId', 'photo'];
    const update = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    update.updatedAt = new Date().toISOString();
    await pets.updateOne({ id: petId }, { $set: update });
    const updated = await pets.findOne({ id: petId });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  return null;
}

// ============================================================
// DELETE HANDLERS
// ============================================================
export async function handlePassportDelete(path, request, user) {

  // DELETE /api/passport/emergency-contacts/:id
  if (path.match(/^passport\/emergency-contacts\/[^/]+$/)) {
    const contactId = path.split('/')[2];
    const ec = await getCollection('pet_emergency_contacts');
    await ec.deleteOne({ id: contactId });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  // DELETE /api/passport/travel-packs/:id
  if (path.match(/^passport\/travel-packs\/[^/]+$/)) {
    const packId = path.split('/')[2];
    const tp = await getCollection('pet_travel_packs');
    await tp.deleteOne({ id: packId });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  // DELETE /api/passport/vaccinations/:id
  if (path.match(/^passport\/vaccinations\/[^/]+$/)) {
    const vaccId = path.split('/')[2];
    const v = await getCollection('vaccinations');
    await v.deleteOne({ id: vaccId });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  // DELETE /api/passport/sharing/:id
  if (path.match(/^passport\/sharing\/[^/]+$/) && !path.includes('revoke')) {
    const shareId = path.split('/')[1] === 'sharing' ? path.split('/')[2] : null;
    if (shareId) {
      const sl = await getCollection('pet_sharing_links');
      await sl.deleteOne({ id: shareId });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }
  }

  return null;
}
