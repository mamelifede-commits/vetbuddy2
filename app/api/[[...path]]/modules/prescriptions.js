// ==================== PRESCRIPTIONS MODULE ====================
// Modulo Ricetta Elettronica Veterinaria (REV)
// Gestione prescrizioni, items, audit trail e integrazione REV/Vetinfo

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { corsHeaders } from './constants';
import { PRESCRIPTION_STATUSES, AUDIT_EVENTS } from '@/lib/rev/config';
import { REVPrescriptionService } from '@/lib/rev/REVPrescriptionService';
import { sendEmail } from '@/lib/email';

const revService = new REVPrescriptionService();

// ==================== HELPER: Create Audit Event ====================
async function createAuditEvent(prescriptionId, actorUserId, eventType, { oldStatus, newStatus, note } = {}) {
  const auditEvents = await getCollection('prescription_audit_events');
  await auditEvents.insertOne({
    id: uuidv4(),
    prescriptionId,
    actorUserId,
    eventType,
    oldStatus: oldStatus || null,
    newStatus: newStatus || null,
    note: note || null,
    createdAt: new Date().toISOString()
  });
}

// ==================== HELPER: Verify Vet Role ====================
function isVeterinarian(user) {
  return user.role === 'clinic' && (user.isVet === true || user.staffRole === 'veterinario' || user.role === 'clinic');
}

function isStaff(user) {
  return user.role === 'clinic';
}

// ==================== GET HANDLERS ====================
export async function handlePrescriptionsGet(path, request) {
  // REV Configuration status
  if (path === 'rev/config') {
    return NextResponse.json({
      manualMode: revService.isManualMode(),
      featureEnabled: true,
      environment: process.env.REV_ENVIRONMENT || 'sandbox'
    }, { headers: corsHeaders });
  }

  // List prescriptions for clinic
  if (path === 'prescriptions') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const prescriptions = await getCollection('prescriptions');
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const petId = url.searchParams.get('petId');

    let query = {};

    if (user.role === 'clinic') {
      query.clinicId = user.clinicId || user.id;
    } else if (user.role === 'owner') {
      query.ownerId = user.id;
      query.visibleToOwner = true;
    } else if (user.role === 'admin') {
      // Admin vede tutto
    } else {
      return NextResponse.json({ error: 'Ruolo non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    if (status) query.status = status;
    if (petId) query.petId = petId;

    const results = await prescriptions.find(query).sort({ createdAt: -1 }).toArray();

    // Per il proprietario, nascondi campi tecnici
    if (user.role === 'owner') {
      const sanitized = results.map(p => ({
        id: p.id,
        petId: p.petId,
        petName: p.petName,
        status: p.status,
        prescriptionType: p.prescriptionType,
        diagnosisNote: p.diagnosisNote,
        dosageInstructions: p.dosageInstructions,
        treatmentDuration: p.treatmentDuration,
        issueDate: p.issueDate,
        externalPrescriptionNumber: p.externalPrescriptionNumber,
        externalPin: p.externalPin,
        veterinarianName: p.veterinarianName,
        createdAt: p.createdAt,
        items: p.items || []
      }));
      return NextResponse.json(sanitized, { headers: corsHeaders });
    }

    return NextResponse.json(results, { headers: corsHeaders });
  }

  // Prescription stats for dashboard (MUST be before /:id pattern)
  if (path === 'prescriptions/stats') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const prescriptions = await getCollection('prescriptions');
    const clinicId = user.clinicId || user.id;
    const today = new Date().toISOString().split('T')[0];

    const [drafts, emittedToday, errors, total] = await Promise.all([
      prescriptions.countDocuments({ clinicId, status: PRESCRIPTION_STATUSES.DRAFT }),
      prescriptions.countDocuments({ clinicId, status: { $in: [PRESCRIPTION_STATUSES.EMITTED, PRESCRIPTION_STATUSES.REGISTERED_MANUALLY] }, issueDate: { $regex: `^${today}` } }),
      prescriptions.countDocuments({ clinicId, status: PRESCRIPTION_STATUSES.ERROR }),
      prescriptions.countDocuments({ clinicId })
    ]);

    return NextResponse.json({ drafts, emittedToday, errors, total }, { headers: corsHeaders });
  }

  // Get single prescription
  const prescriptionDetailMatch = path.match(/^prescriptions\/([^\/]+)$/);
  if (prescriptionDetailMatch) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const prescriptionId = prescriptionDetailMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });

    // Access control
    if (user.role === 'owner') {
      if (prescription.ownerId !== user.id || !prescription.visibleToOwner) {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
    } else if (user.role === 'clinic') {
      if (prescription.clinicId !== (user.clinicId || user.id)) {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
    }

    // Carica items
    const items = await getCollection('prescription_items');
    const prescriptionItems = await items.find({ prescriptionId }).sort({ createdAt: 1 }).toArray();

    return NextResponse.json({ ...prescription, items: prescriptionItems }, { headers: corsHeaders });
  }

  // Get prescription audit trail (only vet/admin)
  const auditMatch = path.match(/^prescriptions\/([^\/]+)\/audit$/);
  if (auditMatch) {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const prescriptionId = auditMatch[1];
    const auditEvents = await getCollection('prescription_audit_events');
    const events = await auditEvents.find({ prescriptionId }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(events, { headers: corsHeaders });
  }

  // Pet prescriptions (for owner dashboard)
  const petPrescriptionsMatch = path.match(/^pets\/([^\/]+)\/prescriptions$/);
  if (petPrescriptionsMatch) {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const petId = petPrescriptionsMatch[1];
    const prescriptions = await getCollection('prescriptions');

    let query = { petId };
    if (user.role === 'owner') {
      query.ownerId = user.id;
      query.visibleToOwner = true;
    } else if (user.role === 'clinic') {
      query.clinicId = user.clinicId || user.id;
    }

    const results = await prescriptions.find(query).sort({ createdAt: -1 }).toArray();

    // Carica items per ogni prescrizione
    const items = await getCollection('prescription_items');
    const enriched = await Promise.all(results.map(async (p) => {
      const pItems = await items.find({ prescriptionId: p.id }).toArray();
      return { ...p, items: pItems };
    }));

    return NextResponse.json(enriched, { headers: corsHeaders });
  }

  return null;
}

// ==================== POST HANDLERS ====================
export async function handlePrescriptionsPost(path, request, body) {
  // Create new prescription (draft)
  if (path === 'prescriptions') {
    const user = getUserFromRequest(request);
    if (!user || !isStaff(user)) {
      return NextResponse.json({ error: 'Solo il personale clinico può creare prescrizioni' }, { status: 403, headers: corsHeaders });
    }

    const { petId, petName, ownerId, ownerName, veterinarianUserId, veterinarianName,
            prescriptionType, diagnosisNote, dosageInstructions, treatmentDuration, items } = body;

    if (!petId) return NextResponse.json({ error: 'Seleziona un paziente' }, { status: 400, headers: corsHeaders });

    const prescriptionId = uuidv4();
    const now = new Date().toISOString();

    const prescription = {
      id: prescriptionId,
      clinicId: user.clinicId || user.id,
      petId,
      petName: petName || '',
      ownerId: ownerId || '',
      ownerName: ownerName || '',
      veterinarianUserId: veterinarianUserId || user.id,
      veterinarianName: veterinarianName || user.name || '',
      createdByUserId: user.id,
      createdByName: user.name || '',
      status: PRESCRIPTION_STATUSES.DRAFT,
      prescriptionType: prescriptionType || 'standard',
      diagnosisNote: diagnosisNote || '',
      dosageInstructions: dosageInstructions || '',
      treatmentDuration: treatmentDuration || '',
      issueDate: null,
      externalSystem: 'vetinfo',
      externalPrescriptionNumber: null,
      externalPin: null,
      externalStatus: null,
      visibleToOwner: false,
      createdAt: now,
      updatedAt: now
    };

    const prescriptions = await getCollection('prescriptions');
    await prescriptions.insertOne(prescription);

    // Insert items if provided
    if (items && items.length > 0) {
      const prescriptionItems = await getCollection('prescription_items');
      const itemDocs = items.map(item => ({
        id: uuidv4(),
        prescriptionId,
        productCode: item.productCode || '',
        productName: item.productName || '',
        aicCode: item.aicCode || null,
        quantity: item.quantity || 0,
        unit: item.unit || 'compresse',
        posology: item.posology || '',
        routeOfAdministration: item.routeOfAdministration || null,
        notes: item.notes || null,
        createdAt: now,
        updatedAt: now
      }));
      await prescriptionItems.insertMany(itemDocs);
    }

    // Audit
    await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.CREATED, {
      newStatus: PRESCRIPTION_STATUSES.DRAFT,
      note: `Bozza creata da ${user.name || user.email}`
    });

    return NextResponse.json({ ...prescription, items: items || [] }, { status: 201, headers: corsHeaders });
  }

  // Add item to prescription
  const addItemMatch = path.match(/^prescriptions\/([^\/]+)\/items$/);
  if (addItemMatch) {
    const user = getUserFromRequest(request);
    if (!user || !isStaff(user)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });

    const prescriptionId = addItemMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });
    if (prescription.status !== PRESCRIPTION_STATUSES.DRAFT) {
      return NextResponse.json({ error: 'Solo le bozze possono essere modificate' }, { status: 400, headers: corsHeaders });
    }

    const item = {
      id: uuidv4(),
      prescriptionId,
      productCode: body.productCode || '',
      productName: body.productName || '',
      aicCode: body.aicCode || null,
      quantity: body.quantity || 0,
      unit: body.unit || 'compresse',
      posology: body.posology || '',
      routeOfAdministration: body.routeOfAdministration || null,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const items = await getCollection('prescription_items');
    await items.insertOne(item);

    await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.ITEM_ADDED, {
      note: `Farmaco aggiunto: ${item.productName}`
    });

    return NextResponse.json(item, { status: 201, headers: corsHeaders });
  }

  // Submit prescription to REV
  const submitMatch = path.match(/^prescriptions\/([^\/]+)\/submit$/);
  if (submitMatch) {
    const user = getUserFromRequest(request);
    if (!user || !isVeterinarian(user)) {
      return NextResponse.json({ error: 'Solo il veterinario può emettere la prescrizione' }, { status: 403, headers: corsHeaders });
    }

    const prescriptionId = submitMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });

    if (prescription.status !== PRESCRIPTION_STATUSES.DRAFT && prescription.status !== PRESCRIPTION_STATUSES.ERROR) {
      return NextResponse.json({ error: 'La prescrizione non è in stato modificabile' }, { status: 400, headers: corsHeaders });
    }

    // Carica items
    const itemsColl = await getCollection('prescription_items');
    const prescriptionItems = await itemsColl.find({ prescriptionId }).toArray();

    // Valida completezza
    const validation = revService.validatePrescription(prescription, prescriptionItems);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Dati incompleti', validationErrors: validation.errors }, { status: 400, headers: corsHeaders });
    }

    // Carica dati necessari per il payload
    const users = await getCollection('users');
    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: prescription.petId });
    const owner = await users.findOne({ id: prescription.ownerId });
    const vet = await users.findOne({ id: prescription.veterinarianUserId });
    const clinic = await users.findOne({ id: prescription.clinicId });

    // Aggiorna stato a SENDING
    const oldStatus = prescription.status;
    await prescriptions.updateOne({ id: prescriptionId }, {
      $set: { status: PRESCRIPTION_STATUSES.SENDING, updatedAt: new Date().toISOString() }
    });

    // Tenta invio al sistema REV
    const result = await revService.submitPrescription(prescription, prescriptionItems, { pet, owner, vet, clinic });

    if (result.manualMode) {
      // Modalità manuale — torna a DRAFT con checklist
      await prescriptions.updateOne({ id: prescriptionId }, {
        $set: { status: PRESCRIPTION_STATUSES.DRAFT, updatedAt: new Date().toISOString() }
      });

      await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.STATUS_CHANGED, {
        oldStatus, newStatus: PRESCRIPTION_STATUSES.DRAFT,
        note: 'Modalità manuale attiva. Completare emissione sul portale Vetinfo.'
      });

      return NextResponse.json({
        manualMode: true,
        message: result.message,
        checklist: result.checklist,
        prescription: { ...prescription, status: PRESCRIPTION_STATUSES.DRAFT }
      }, { headers: corsHeaders });
    }

    if (result.success) {
      // Invio riuscito
      const now = new Date().toISOString();
      await prescriptions.updateOne({ id: prescriptionId }, {
        $set: {
          status: PRESCRIPTION_STATUSES.EMITTED,
          externalPrescriptionNumber: result.prescriptionNumber,
          externalPin: result.pin,
          externalStatus: result.externalStatus || 'emitted',
          issueDate: now,
          visibleToOwner: true,
          updatedAt: now
        }
      });

      // Save external log
      if (result.log) {
        const logs = await getCollection('prescription_external_logs');
        await logs.insertOne({ id: uuidv4(), ...result.log, createdAt: now });
      }

      await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.EMITTED, {
        oldStatus, newStatus: PRESCRIPTION_STATUSES.EMITTED,
        note: `Ricetta emessa: N° ${result.prescriptionNumber}`
      });

      return NextResponse.json({
        success: true,
        prescriptionNumber: result.prescriptionNumber,
        pin: result.pin,
        status: PRESCRIPTION_STATUSES.EMITTED
      }, { headers: corsHeaders });
    } else {
      // Errore
      await prescriptions.updateOne({ id: prescriptionId }, {
        $set: {
          status: PRESCRIPTION_STATUSES.ERROR,
          externalStatus: result.errorCode || 'error',
          updatedAt: new Date().toISOString()
        }
      });

      if (result.log) {
        const logs = await getCollection('prescription_external_logs');
        await logs.insertOne({ id: uuidv4(), ...result.log, createdAt: new Date().toISOString() });
      }

      await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.ERROR, {
        oldStatus, newStatus: PRESCRIPTION_STATUSES.ERROR,
        note: `Errore invio: ${result.error}`
      });

      return NextResponse.json({
        success: false,
        error: result.error,
        errorCode: result.errorCode,
        status: PRESCRIPTION_STATUSES.ERROR
      }, { status: 422, headers: corsHeaders });
    }
  }

  // Register manually (bridge mode)
  const manualMatch = path.match(/^prescriptions\/([^\/]+)\/register-manual$/);
  if (manualMatch) {
    const user = getUserFromRequest(request);
    if (!user || !isVeterinarian(user)) {
      return NextResponse.json({ error: 'Solo il veterinario può registrare la prescrizione' }, { status: 403, headers: corsHeaders });
    }

    const prescriptionId = manualMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });

    const { prescriptionNumber, pin, issueDate, notes } = body;
    if (!prescriptionNumber) return NextResponse.json({ error: 'Numero ricetta obbligatorio' }, { status: 400, headers: corsHeaders });

    const oldStatus = prescription.status;
    const now = new Date().toISOString();

    await prescriptions.updateOne({ id: prescriptionId }, {
      $set: {
        status: PRESCRIPTION_STATUSES.REGISTERED_MANUALLY,
        externalPrescriptionNumber: prescriptionNumber,
        externalPin: pin || null,
        externalStatus: 'registered_manually',
        issueDate: issueDate || now,
        visibleToOwner: true,
        updatedAt: now,
        manualRegistrationNotes: notes || null
      }
    });

    await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.REGISTERED_MANUALLY, {
      oldStatus, newStatus: PRESCRIPTION_STATUSES.REGISTERED_MANUALLY,
      note: `Registrata manualmente: N° ${prescriptionNumber}${pin ? ' - PIN: ' + pin : ''}`
    });

    return NextResponse.json({
      success: true,
      status: PRESCRIPTION_STATUSES.REGISTERED_MANUALLY,
      prescriptionNumber,
      pin
    }, { headers: corsHeaders });
  }

  // Cancel prescription
  const cancelMatch = path.match(/^prescriptions\/([^\/]+)\/cancel$/);
  if (cancelMatch) {
    const user = getUserFromRequest(request);
    if (!user || !isVeterinarian(user)) {
      return NextResponse.json({ error: 'Solo il veterinario può annullare la prescrizione' }, { status: 403, headers: corsHeaders });
    }

    const prescriptionId = cancelMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });

    if (prescription.status === PRESCRIPTION_STATUSES.EMITTED || prescription.status === PRESCRIPTION_STATUSES.REGISTERED_MANUALLY) {
      return NextResponse.json({ error: 'Non è possibile annullare una prescrizione già emessa o registrata' }, { status: 400, headers: corsHeaders });
    }

    const oldStatus = prescription.status;
    await prescriptions.updateOne({ id: prescriptionId }, {
      $set: { status: PRESCRIPTION_STATUSES.CANCELLED, updatedAt: new Date().toISOString() }
    });

    await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.CANCELLED, {
      oldStatus, newStatus: PRESCRIPTION_STATUSES.CANCELLED,
      note: body.reason || 'Annullata dal veterinario'
    });

    return NextResponse.json({ success: true, status: PRESCRIPTION_STATUSES.CANCELLED }, { headers: corsHeaders });
  }

  // Publish to owner (with email notification)
  const publishMatch = path.match(/^prescriptions\/([^\/]+)\/publish$/);
  if (publishMatch) {
    const user = getUserFromRequest(request);
    if (!user || !isVeterinarian(user)) {
      return NextResponse.json({ error: 'Solo il veterinario può pubblicare la prescrizione' }, { status: 403, headers: corsHeaders });
    }

    const prescriptionId = publishMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });

    await prescriptions.updateOne({ id: prescriptionId }, {
      $set: { visibleToOwner: true, updatedAt: new Date().toISOString() }
    });

    await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.PUBLISHED_TO_OWNER, {
      note: 'Prescrizione resa visibile al proprietario'
    });

    // Send email notification to owner
    if (prescription.ownerId) {
      try {
        const users = await getCollection('users');
        const owner = await users.findOne({ id: prescription.ownerId });
        if (owner?.email) {
          // Load items for the email
          const itemsColl = await getCollection('prescription_items');
          const items = await itemsColl.find({ prescriptionId }).toArray();
          const itemsList = items.map(i => `<li style="margin: 4px 0;"><strong>${i.productName}</strong> — ${i.quantity} ${i.unit} — ${i.posology}</li>`).join('');

          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          await sendEmail({
            to: owner.email,
            subject: `💊 Nuova prescrizione per ${prescription.petName || 'il tuo pet'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🐾 vetbuddy</h1>
                </div>
                <div style="padding: 30px; background: #ffffff;">
                  <h2 style="color: #059669; margin-top: 0;">Nuova prescrizione veterinaria 💊</h2>
                  <p style="color: #333;">Ciao <strong>${owner.name || ''}</strong>,</p>
                  <p style="color: #666;">Il veterinario ha emesso una prescrizione per <strong>${prescription.petName || 'il tuo pet'}</strong>.</p>
                  
                  <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #059669;">
                    <p style="margin: 0 0 8px;"><strong>🩺 Diagnosi:</strong> ${prescription.diagnosisNote || '-'}</p>
                    <p style="margin: 0 0 8px;"><strong>💊 Farmaci:</strong></p>
                    <ul style="margin: 0; padding-left: 20px;">${itemsList || '<li>-</li>'}</ul>
                    ${prescription.treatmentDuration ? `<p style="margin: 8px 0 0;"><strong>⏱ Durata:</strong> ${prescription.treatmentDuration}</p>` : ''}
                    ${prescription.externalPrescriptionNumber ? `<p style="margin: 8px 0 0;"><strong>📋 N° Ricetta:</strong> ${prescription.externalPrescriptionNumber}</p>` : ''}
                    ${prescription.externalPin ? `<p style="margin: 8px 0 0;"><strong>🔑 PIN:</strong> ${prescription.externalPin}</p>` : ''}
                  </div>
                  
                  <p style="color: #666;">Puoi consultare i dettagli completi nel profilo del tuo pet su VetBuddy.</p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                      Vai al Profilo Pet
                    </a>
                  </div>
                </div>
                <div style="padding: 20px; background: #f5f5f5; border-radius: 0 0 12px 12px; text-align: center;">
                  <p style="color: #888; font-size: 12px; margin: 0;">Email automatica da vetbuddy</p>
                </div>
              </div>
            `
          });
          console.log(`📧 Notifica prescrizione inviata a ${owner.email}`);
        }
      } catch (emailErr) {
        console.error('Error sending prescription notification:', emailErr);
      }
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  return null;
}

// ==================== PUT HANDLERS ====================
export async function handlePrescriptionsPut(path, request, user, body) {
  // Update prescription (only drafts)
  const updateMatch = path.match(/^prescriptions\/([^\/]+)$/);
  if (updateMatch) {
    if (!isStaff(user)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });

    const prescriptionId = updateMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });

    if (prescription.status !== PRESCRIPTION_STATUSES.DRAFT) {
      return NextResponse.json({ error: 'Solo le bozze possono essere modificate' }, { status: 400, headers: corsHeaders });
    }

    const allowedFields = ['petId', 'petName', 'ownerId', 'ownerName', 'veterinarianUserId', 'veterinarianName',
      'prescriptionType', 'diagnosisNote', 'dosageInstructions', 'treatmentDuration'];
    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    updates.updatedAt = new Date().toISOString();

    await prescriptions.updateOne({ id: prescriptionId }, { $set: updates });

    // Update items if provided
    if (body.items && Array.isArray(body.items)) {
      const itemsColl = await getCollection('prescription_items');
      // Remove old items
      await itemsColl.deleteMany({ prescriptionId });
      // Insert new
      if (body.items.length > 0) {
        const itemDocs = body.items.map(item => ({
          id: item.id || uuidv4(),
          prescriptionId,
          productCode: item.productCode || '',
          productName: item.productName || '',
          aicCode: item.aicCode || null,
          quantity: item.quantity || 0,
          unit: item.unit || 'compresse',
          posology: item.posology || '',
          routeOfAdministration: item.routeOfAdministration || null,
          notes: item.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        await itemsColl.insertMany(itemDocs);
      }
    }

    await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.UPDATED, {
      note: `Bozza aggiornata da ${user.name || user.email}`
    });

    const updated = await prescriptions.findOne({ id: prescriptionId });
    return NextResponse.json(updated, { headers: corsHeaders });
  }

  return null;
}

// ==================== DELETE HANDLERS ====================
export async function handlePrescriptionsDelete(path, request, user) {
  // Delete draft prescription
  const deleteMatch = path.match(/^prescriptions\/([^\/]+)$/);
  if (deleteMatch) {
    if (!isStaff(user)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });

    const prescriptionId = deleteMatch[1];
    const prescriptions = await getCollection('prescriptions');
    const prescription = await prescriptions.findOne({ id: prescriptionId });
    if (!prescription) return NextResponse.json({ error: 'Prescrizione non trovata' }, { status: 404, headers: corsHeaders });

    if (prescription.status !== PRESCRIPTION_STATUSES.DRAFT) {
      return NextResponse.json({ error: 'Solo le bozze possono essere eliminate' }, { status: 400, headers: corsHeaders });
    }

    // Delete items
    const items = await getCollection('prescription_items');
    await items.deleteMany({ prescriptionId });

    // Delete prescription
    await prescriptions.deleteOne({ id: prescriptionId });

    // Audit
    await createAuditEvent(prescriptionId, user.id, AUDIT_EVENTS.CANCELLED, {
      note: 'Bozza eliminata'
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  return null;
}
