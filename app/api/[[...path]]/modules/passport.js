// modules/passport.js - VetBuddy Passport: digital pet health passport
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { corsHeaders } from './constants';

// ============================================================
// HELPER: Build passport email HTML template
// ============================================================
function buildPassportEmail({ icon, title, greeting, body, color = '#6366f1' }) {
  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="padding:24px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,${color},${color}dd);padding:32px 24px;text-align:center;">
        <div style="font-size:36px;">${icon}</div>
        <h1 style="color:#fff;font-size:20px;margin:12px 0 4px;font-weight:700;">VetBuddy Passport</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">${title}</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">${greeting},</p>
        ${body}
      </div>
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} VetBuddy — Passaporto sanitario digitale per i tuoi animali</p>
      </div>
    </div>
  </div>
</body></html>`;
}

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

    // 📧 EMAIL: If pet is in Lost Pet Mode, notify owner of scan
    if (passport.lostPetMode) {
      try {
        if (pet.ownerId) {
          const users = await getCollection('users');
          const owner = await users.findOne({ id: pet.ownerId });
          if (owner?.email) {
            // Rate limit: don't send more than 1 scan notification per 10 minutes
            const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            const recentNotif = await scanLogs.findOne({
              petId: passport.petId, actionTaken: 'view', scannedAt: { $gte: tenMinAgo },
              _notified: true
            });
            if (!recentNotif) {
              await sendEmail({
                to: owner.email,
                subject: `📱 Qualcuno ha scansionato il QR di ${pet.name}! — VetBuddy`,
                html: buildPassportEmail({
                  icon: '📱',
                  title: `Scansione QR rilevata per ${pet.name}`,
                  greeting: `Ciao ${owner.name || 'Proprietario'}`,
                  body: `<p>Qualcuno ha appena <strong>scansionato il QR code</strong> di <strong>${pet.name}</strong>.</p>
                    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;">
                      <p style="color:#92400e;margin:0;font-size:14px;">📍 Il Lost Pet Mode è attivo. Chi scansiona il QR vede l'avviso di smarrimento e può segnalare il ritrovamento.</p>
                    </div>
                    <p style="color:#6b7280;font-size:13px;">⏰ Ora scansione: ${new Date().toLocaleString('it-IT')}</p>
                    <p style="color:#6b7280;font-size:13px;">Riceverai una notifica separata se qualcuno segnala di aver trovato ${pet.name}.</p>`,
                  color: '#f59e0b'
                }),
              });
              // Mark this scan as notified
              await scanLogs.updateOne(
                { petId: passport.petId, scannedAt: { $gte: tenMinAgo }, actionTaken: 'view' },
                { $set: { _notified: true } }
              );
            }
          }
        }
      } catch (emailErr) { console.error('QR scan notification error:', emailErr); }
    }

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

    // 📧 EMAIL: Notify emergency contact they've been added
    if (email) {
      try {
        const pets = await getCollection('pets');
        const pet = await pets.findOne({ id: petId });
        const users = await getCollection('users');
        const owner = pet?.ownerId ? await users.findOne({ id: pet.ownerId }) : null;
        await sendEmail({
          to: email,
          subject: `🚨 Sei un contatto di emergenza per ${pet?.name || 'un animale'} — VetBuddy Passport`,
          html: buildPassportEmail({
            icon: '🚨',
            title: 'Contatto di emergenza',
            greeting: `Ciao ${name}`,
            body: `<p><strong>${owner?.name || 'Un proprietario'}</strong> ti ha aggiunto come <strong>contatto di emergenza</strong> per <strong>${pet?.name || 'il proprio animale'}</strong> su VetBuddy Passport.</p>
              <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;">
                <p style="color:#92400e;margin:0;font-size:14px;">📞 In caso di emergenza o smarrimento di ${pet?.name || "l'animale"}, potresti essere contattato.</p>
              </div>
              <p>Il tuo ruolo: <strong>${relationship || 'Contatto'}</strong></p>
              <p style="color:#6b7280;font-size:13px;">Se ritieni che questo sia un errore, contatta il proprietario.</p>`,
            color: '#f59e0b'
          }),
        });
      } catch (emailErr) { console.error('Emergency contact email error:', emailErr); }
    }

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

    // 📧 EMAIL: Notify owner that QR has been generated
    try {
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      if (pet?.ownerId) {
        const users = await getCollection('users');
        const owner = await users.findOne({ id: pet.ownerId });
        if (owner?.email) {
          await sendEmail({
            to: owner.email,
            subject: `🔲 QR Emergenza attivato per ${pet.name} — VetBuddy Passport`,
            html: buildPassportEmail({
              icon: '🔲',
              title: 'QR Emergenza Attivato',
              greeting: `Ciao ${owner.name || 'Proprietario'}`,
              body: `<p>Il <strong>QR Code di emergenza</strong> per <strong>${pet.name}</strong> è stato generato con successo!</p>
                <p>Chiunque scanzioni il codice potrà vedere le informazioni di emergenza del tuo animale (allergie, farmaci, contatti).</p>
                <div style="text-align:center;margin:16px 0;">
                  <a href="${qrPageUrl}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Visualizza pagina QR →</a>
                </div>
                <p style="color:#6b7280;font-size:13px;">💡 Consiglio: stampa il QR e attaccalo al collare o alla medaglietta di ${pet.name}.</p>`,
              color: '#8b5cf6'
            }),
          });
        }
      }
    } catch (emailErr) { console.error('QR email notification error:', emailErr); }

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

    // 📧 EMAIL: Notify owner about new vaccination
    try {
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      if (pet?.ownerId) {
        const users = await getCollection('users');
        const owner = await users.findOne({ id: pet.ownerId });
        if (owner?.email) {
          const dueDateStr = nextDueDate ? new Date(nextDueDate).toLocaleDateString('it-IT') : null;
          await sendEmail({
            to: owner.email,
            subject: `💉 Vaccino registrato per ${pet.name}: ${name} — VetBuddy Passport`,
            html: buildPassportEmail({
              icon: '💉',
              title: `Nuovo vaccino registrato`,
              greeting: `Ciao ${owner.name || 'Proprietario'}`,
              body: `<p>Un nuovo vaccino è stato registrato nel Passport di <strong>${pet.name}</strong>.</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                  <table style="width:100%;font-size:14px;">
                    <tr><td style="color:#6b7280;padding:4px 0;">Vaccino:</td><td style="font-weight:600;color:#111827;">${name}</td></tr>
                    <tr><td style="color:#6b7280;padding:4px 0;">Data:</td><td style="font-weight:600;color:#111827;">${new Date(date).toLocaleDateString('it-IT')}</td></tr>
                    ${dueDateStr ? `<tr><td style="color:#6b7280;padding:4px 0;">Prossimo richiamo:</td><td style="font-weight:600;color:#6366f1;">${dueDateStr}</td></tr>` : ''}
                    ${batchNumber ? `<tr><td style="color:#6b7280;padding:4px 0;">Lotto:</td><td style="font-weight:600;color:#111827;">${batchNumber}</td></tr>` : ''}
                    <tr><td style="color:#6b7280;padding:4px 0;">Stato:</td><td style="font-weight:600;color:${status === 'in_regola' ? '#22c55e' : status === 'in_scadenza' ? '#f59e0b' : '#dc2626'};">${status === 'in_regola' ? '✅ In regola' : status === 'in_scadenza' ? '⚠️ In scadenza' : '❌ Scaduto'}</td></tr>
                  </table>
                </div>
                ${dueDateStr ? `<p style="color:#6b7280;font-size:13px;">🔔 Ti invieremo un promemoria quando sarà il momento del richiamo.</p>` : ''}`,
              color: '#22c55e'
            }),
          });
        }
      }
    } catch (emailErr) { console.error('Vaccination email notification error:', emailErr); }

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

    // 📧 EMAIL: Notify owner about Lost Pet Mode change
    if (body.lostPetMode !== undefined) {
      try {
        const pets = await getCollection('pets');
        const pet = await pets.findOne({ id: petId });
        if (pet?.ownerId) {
          const users = await getCollection('users');
          const owner = await users.findOne({ id: pet.ownerId });
          if (owner?.email) {
            if (body.lostPetMode) {
              // Lost Pet Mode ACTIVATED
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
              await sendEmail({
                to: owner.email,
                subject: `🆘 Lost Pet Mode ATTIVATO per ${pet.name} — VetBuddy Passport`,
                html: buildPassportEmail({
                  icon: '🆘',
                  title: `Smarrimento segnalato: ${pet.name}`,
                  greeting: `Ciao ${owner.name || 'Proprietario'}`,
                  body: `<p>Il <strong>Lost Pet Mode</strong> è stato attivato per <strong>${pet.name}</strong>.</p>
                    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
                      <p style="color:#dc2626;font-weight:600;margin:0 0 8px;">⚠️ Cosa succede ora:</p>
                      <ul style="color:#7f1d1d;margin:0;padding-left:20px;font-size:14px;">
                        <li>La pagina QR di ${pet.name} mostra un avviso di smarrimento</li>
                        <li>Chi scansiona il QR vedrà il tuo messaggio e potrà segnalare il ritrovamento</li>
                        ${body.lostPetZone ? `<li>Zona indicata: <strong>${body.lostPetZone}</strong></li>` : ''}
                        ${body.lostPetReward ? `<li>Ricompensa: <strong>${body.lostPetReward}</strong></li>` : ''}
                      </ul>
                    </div>
                    <p>Riceverai un'email immediata quando qualcuno scansiona il QR e segnala di aver trovato ${pet.name}.</p>
                    <p style="color:#6b7280;font-size:13px;">💡 Consiglio: condividi il link del QR sui social e nei gruppi della tua zona.</p>`,
                  color: '#dc2626'
                }),
              });

              // Also notify emergency contacts
              const ecCollection = await getCollection('pet_emergency_contacts');
              const contacts = await ecCollection.find({ petId }).toArray();
              for (const contact of contacts) {
                if (contact.email) {
                  await sendEmail({
                    to: contact.email,
                    subject: `🆘 ${pet.name} è stato segnalato come smarrito — VetBuddy`,
                    html: buildPassportEmail({
                      icon: '🆘',
                      title: `Smarrimento: ${pet.name}`,
                      greeting: `Ciao ${contact.name}`,
                      body: `<p>Ti scriviamo perché sei un contatto di emergenza di <strong>${pet.name}</strong> (${pet.species} ${pet.breed}).</p>
                        <p>${owner.name || 'Il proprietario'} ha attivato il <strong>Lost Pet Mode</strong>.</p>
                        ${body.lostPetZone ? `<p>📍 Ultima zona nota: <strong>${body.lostPetZone}</strong></p>` : ''}
                        ${body.lostPetMessage ? `<p>💬 Messaggio: "${body.lostPetMessage}"</p>` : ''}
                        <p>Se vedi ${pet.name}, contatta immediatamente ${owner.name || 'il proprietario'}.</p>`,
                      color: '#dc2626'
                    }),
                  });
                }
              }
            } else {
              // Lost Pet Mode DEACTIVATED (pet found!)
              await sendEmail({
                to: owner.email,
                subject: `🎉 ${pet.name} ritrovato! Lost Pet Mode disattivato — VetBuddy Passport`,
                html: buildPassportEmail({
                  icon: '🎉',
                  title: `${pet.name} è stato ritrovato!`,
                  greeting: `Ciao ${owner.name || 'Proprietario'}`,
                  body: `<p>Il <strong>Lost Pet Mode</strong> per <strong>${pet.name}</strong> è stato disattivato.</p>
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
                      <p style="font-size:36px;margin:0;">🐾❤️</p>
                      <p style="color:#166534;font-weight:600;font-size:16px;margin:8px 0 0;">Che bello che ${pet.name} sia tornato a casa!</p>
                    </div>
                    <p>La pagina QR di emergenza è tornata alla modalità normale.</p>`,
                  color: '#22c55e'
                }),
              });
            }
          }
        }
      } catch (emailErr) { console.error('Lost pet email notification error:', emailErr); }
    }

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
