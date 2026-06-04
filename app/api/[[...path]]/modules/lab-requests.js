// modules/lab-requests.js - Lab requests, reports, send-to-owner, webhooks
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { LAB_REQUEST_STATUSES, corsHeaders } from './constants';

// ==================== LAB REQUESTS POST HANDLERS ====================
export async function handleLabRequestsPost(path, request, body) {

    // Create lab request (clinic creates request)
    if (path === 'lab-requests') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono creare richieste di analisi' }, { status: 401, headers: corsHeaders });
      }

      const { petId, labId, examCategory, examType, examName, title, clinicalNotes, internalNotes, priority, attachments } = body;
      
      if (!petId || !labId || !examType) {
        return NextResponse.json({ error: 'Pet, laboratorio e tipo esame sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      // Get pet and owner info
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      if (!pet) {
        return NextResponse.json({ error: 'Pet non trovato' }, { status: 404, headers: corsHeaders });
      }

      // Get lab info
      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId, role: 'lab' });
      if (!lab) {
        return NextResponse.json({ error: 'Laboratorio non trovato' }, { status: 404, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      
      const labRequest = {
        id: uuidv4(),
        petId,
        petName: pet.name,
        petSpecies: pet.species,
        ownerId: pet.ownerId,
        clinicId: user.id,
        labId,
        veterinarianId: user.id, // For now, same as clinic
        examCategory: examCategory || '',
        examType,
        examName: examName || examType,
        title: title || `Analisi ${examName || examType}`,
        clinicalNotes: clinicalNotes || '',
        internalNotes: internalNotes || '', // Notes between clinic and lab only
        priority: priority || 'normal', // 'urgent', 'normal', 'low'
        status: 'pending',
        sampleCode: `SC-${Date.now().toString(36).toUpperCase()}`,
        attachments: attachments || [], // Array of { name, url, type }
        statusHistory: [{
          status: 'pending',
          note: 'Richiesta creata',
          updatedBy: user.id,
          updatedByName: user.clinicName || user.name,
          updatedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await labRequests.insertOne(labRequest);

      // Increment lab request count for billing
      await users.updateOne({ id: labId }, { $inc: { requestsCount: 1 } });

      // Notify lab via email
      try {
        if (lab.email) {
          const clinic = await users.findOne({ id: user.id });
          await sendEmail({
            to: lab.email,
            subject: `🧪 Nuova richiesta analisi da ${clinic?.clinicName || 'Clinica'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🧪 Nuova Richiesta Analisi</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p style="color: #374151; font-size: 16px;">Hai ricevuto una nuova richiesta di analisi.</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #6366f1;">
                    <p style="margin: 5px 0;"><strong>Clinica:</strong> ${clinic?.clinicName || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Paziente:</strong> ${pet.name} (${pet.species})</p>
                    <p style="margin: 5px 0;"><strong>Esame:</strong> ${examName || examType}</p>
                    <p style="margin: 5px 0;"><strong>Priorità:</strong> ${priority === 'urgent' ? '🔴 URGENTE' : priority === 'low' ? '🟢 Bassa' : '🟡 Normale'}</p>
                    <p style="margin: 5px 0;"><strong>Codice campione:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${labRequest.sampleCode}</code></p>
                  </div>
                  
                  ${clinicalNotes ? `<p style="color: #374151;"><strong>Note cliniche:</strong><br/>${clinicalNotes}</p>` : ''}
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Accedi alla tua dashboard per gestire la richiesta.</p>
                </div>
                <div style="background: #1f2937; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">© 2026 vetbuddy - Sistema Analisi Laboratorio</p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Error sending lab request notification:', emailErr);
      }

      return NextResponse.json(labRequest, { headers: corsHeaders });
    }
    
    // Update lab request status (lab updates)
    if (path === 'lab-requests/update-status') {
      const user = getUserFromRequest(request);
      if (!user || (user.role !== 'lab' && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { requestId, status, note, sampleCode } = body;
      
      if (!requestId || !status) {
        return NextResponse.json({ error: 'ID richiesta e stato sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: requestId });
      
      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404, headers: corsHeaders });
      }

      if (user.role === 'lab' && labRequest.labId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato per questa richiesta' }, { status: 401, headers: corsHeaders });
      }

      const statusEntry = {
        status,
        note: note || '',
        updatedBy: user.id,
        updatedByName: user.labName || user.name,
        updatedAt: new Date().toISOString()
      };

      const updateData = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (sampleCode) {
        updateData.sampleCode = sampleCode;
      }

      // Support price quotation
      if (body.quotedPrice !== undefined) {
        updateData.quotedPrice = parseFloat(body.quotedPrice);
        updateData.priceConfirmed = true;
        updateData.priceConfirmedAt = new Date().toISOString();
        statusEntry.quotedPrice = parseFloat(body.quotedPrice);
      }

      // Support estimated delivery
      if (body.estimatedDelivery) {
        updateData.estimatedDelivery = body.estimatedDelivery;
      }

      await labRequests.updateOne(
        { id: requestId },
        { 
          $set: updateData,
          $push: { statusHistory: statusEntry }
        }
      );

      // Notify clinic about status change
      try {
        const users = await getCollection('users');
        const clinic = await users.findOne({ id: labRequest.clinicId });
        const lab = await users.findOne({ id: labRequest.labId });
        
        if (clinic?.email) {
          const statusLabel = LAB_REQUEST_STATUSES.find(s => s.id === status)?.name || status;
          await sendEmail({
            to: clinic.email,
            subject: `🧪 Aggiornamento analisi: ${statusLabel}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 25px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🧪 Aggiornamento Analisi</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p style="color: #374151;">Il laboratorio <strong>${lab?.labName || 'Laboratorio'}</strong> ha aggiornato lo stato della richiesta.</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                    <p style="font-size: 18px; color: #6366f1; margin: 0;"><strong>${statusLabel}</strong></p>
                    ${note ? `<p style="color: #6b7280; margin-top: 10px;">${note}</p>` : ''}
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;"><strong>Paziente:</strong> ${labRequest.petName}</p>
                  <p style="color: #6b7280; font-size: 14px;"><strong>Esame:</strong> ${labRequest.examName}</p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Error sending status update notification:', emailErr);
      }

      const updated = await labRequests.findOne({ id: requestId });
      return NextResponse.json(updated, { headers: corsHeaders });
    }
    
    // Upload lab report (lab uploads PDF)
    if (path === 'lab-reports') {
      const user = getUserFromRequest(request);
      if (!user || (user.role !== 'lab' && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Solo i laboratori possono caricare referti' }, { status: 401, headers: corsHeaders });
      }

      const { labRequestId, fileName, fileContent, reportNotes } = body;
      
      if (!labRequestId || !fileContent) {
        return NextResponse.json({ error: 'Richiesta e file sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: labRequestId });
      
      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404, headers: corsHeaders });
      }

      if (user.role === 'lab' && labRequest.labId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato per questa richiesta' }, { status: 401, headers: corsHeaders });
      }

      const labReports = await getCollection('lab_reports');
      
      const report = {
        id: uuidv4(),
        labRequestId,
        petId: labRequest.petId,
        ownerId: labRequest.ownerId,
        clinicId: labRequest.clinicId,
        labId: labRequest.labId,
        examType: labRequest.examType,
        examName: labRequest.examName,
        fileName: fileName || `Referto_${labRequest.sampleCode}.pdf`,
        fileContent, // Base64 PDF content
        reportNotes: reportNotes || '', // Notes from lab
        clinicNotes: '', // Notes from clinic for owner (added when sending)
        visibleToOwner: false, // DEFAULT FALSE - clinic must review and send
        sentToOwnerAt: null, // When clinic sends to owner
        sentToOwnerBy: null, // Who sent it
        uploadedBy: user.id,
        uploadedByName: user.labName || user.name,
        uploadedAt: new Date().toISOString()
      };

      await labReports.insertOne(report);

      // Update lab request status to report_ready
      await labRequests.updateOne(
        { id: labRequestId },
        { 
          $set: { 
            status: 'report_ready', 
            updatedAt: new Date().toISOString() 
          },
          $push: { 
            statusHistory: {
              status: 'report_ready',
              note: 'Referto caricato dal laboratorio - In attesa di revisione clinica',
              updatedBy: user.id,
              updatedByName: user.labName || user.name,
              updatedAt: new Date().toISOString()
            }
          }
        }
      );

      // Notify clinic that report is ready for review
      try {
        const users = await getCollection('users');
        const clinic = await users.findOne({ id: labRequest.clinicId });
        const lab = await users.findOne({ id: labRequest.labId });
        
        if (clinic?.email) {
          await sendEmail({
            to: clinic.email,
            subject: `🧪 Referto da revisionare: ${labRequest.examName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🧪 Nuovo Referto da Revisionare</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p style="color: #374151;">Il laboratorio <strong>${lab?.labName || 'Laboratorio'}</strong> ha caricato un referto.</p>
                  <p style="color: #374151;"><strong>⚠️ Il referto deve essere revisionato prima di essere inviato al proprietario.</strong></p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <p style="margin: 5px 0;"><strong>Paziente:</strong> ${labRequest.petName}</p>
                    <p style="margin: 5px 0;"><strong>Esame:</strong> ${labRequest.examName}</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">Accedi alla dashboard per revisionare il referto e inviarlo al proprietario con le tue note cliniche.</p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Error sending report notification:', emailErr);
      }

      return NextResponse.json(report, { headers: corsHeaders });
    }
    
    // Clinic sends report to owner (after review)
    if (path === 'lab-reports/send-to-owner') {
      const user = getUserFromRequest(request);
      if (!user || (user.role !== 'clinic' && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Solo le cliniche possono inviare referti ai proprietari' }, { status: 401, headers: corsHeaders });
      }

      const { reportId, clinicNotes, notifyOwner } = body;
      
      if (!reportId) {
        return NextResponse.json({ error: 'ID referto obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const labReports = await getCollection('lab_reports');
      const report = await labReports.findOne({ id: reportId });
      
      if (!report) {
        return NextResponse.json({ error: 'Referto non trovato' }, { status: 404, headers: corsHeaders });
      }

      if (user.role === 'clinic' && report.clinicId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato per questo referto' }, { status: 401, headers: corsHeaders });
      }

      // Update report to be visible to owner
      await labReports.updateOne(
        { id: reportId },
        { 
          $set: { 
            visibleToOwner: true,
            clinicNotes: clinicNotes || '',
            sentToOwnerAt: new Date().toISOString(),
            sentToOwnerBy: user.id
          }
        }
      );

      // Update lab request status to completed
      const labRequests = await getCollection('lab_requests');
      await labRequests.updateOne(
        { id: report.labRequestId },
        { 
          $set: { 
            status: 'completed', 
            updatedAt: new Date().toISOString() 
          },
          $push: { 
            statusHistory: {
              status: 'completed',
              note: 'Referto revisionato e inviato al proprietario',
              updatedBy: user.id,
              updatedByName: user.clinicName || user.name,
              updatedAt: new Date().toISOString()
            }
          }
        }
      );

      // Notify owner if requested
      if (notifyOwner !== false) {
        try {
          const users = await getCollection('users');
          const pets = await getCollection('pets');
          const owner = await users.findOne({ id: report.ownerId });
          const pet = await pets.findOne({ id: report.petId });
          const clinic = await users.findOne({ id: report.clinicId });
          
          if (owner?.email) {
            await sendEmail({
              to: owner.email,
              subject: `🐾 Nuovo referto disponibile per ${pet?.name || 'il tuo animale'}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #FF6B6B, #f97316); padding: 25px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🐾 Nuovo Referto Disponibile</h1>
                  </div>
                  <div style="padding: 30px; background: #f9fafb;">
                    <p style="color: #374151;">Ciao <strong>${owner.name || 'Proprietario'}</strong>,</p>
                    <p style="color: #374151;">La clinica <strong>${clinic?.clinicName || 'La tua clinica'}</strong> ha condiviso un nuovo referto per <strong>${pet?.name || 'il tuo animale'}</strong>.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                      <p style="margin: 5px 0;"><strong>Esame:</strong> ${report.examName}</p>
                      <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
                    </div>
                    
                    ${clinicNotes ? `
                    <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0;">
                      <p style="margin: 0; color: #92400e;"><strong>📝 Note dalla clinica:</strong></p>
                      <p style="margin: 10px 0 0 0; color: #78350f;">${clinicNotes}</p>
                    </div>
                    ` : ''}
                    
                    <p style="color: #6b7280; font-size: 14px;">Accedi alla tua area personale per visualizzare e scaricare il referto completo.</p>
                  </div>
                </div>
              `
            });
          }
        } catch (emailErr) {
          console.error('Error sending owner notification:', emailErr);
        }
      }

      return NextResponse.json({ success: true, message: 'Referto inviato al proprietario' }, { headers: corsHeaders });
    }
    
    // Admin: Approve lab
    if (path === 'admin/labs/approve') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo admin possono approvare laboratori' }, { status: 401, headers: corsHeaders });
      }

      const { labId } = body;
      if (!labId) {
        return NextResponse.json({ error: 'ID laboratorio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      await users.updateOne(
        { id: labId, role: 'lab' },
        { $set: { isApproved: true, approvedAt: new Date().toISOString(), approvedBy: user.id } }
      );

      return NextResponse.json({ success: true, message: 'Laboratorio approvato' }, { headers: corsHeaders });
    }

    // ==================== LAB SELF-SERVICE API KEY MANAGEMENT ====================

    // Lab: Generate or regenerate API key
    if (path === 'lab/generate-api-key') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Solo i laboratori possono generare API key' }, { status: 403, headers: corsHeaders });
      }

      const crypto = require('crypto');
      const apiKey = `vb_lab_${crypto.randomBytes(24).toString('hex')}`;
      const webhookSecret = crypto.randomBytes(32).toString('hex');

      const labIntegrations = await getCollection('lab_integrations');
      const integrationId = crypto.randomUUID();

      await labIntegrations.updateOne(
        { labId: user.id },
        {
          $set: {
            labId: user.id,
            apiKey,
            webhookSecret,
            integrationType: 'api',
            autoSync: true,
            isActive: true,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            id: integrationId,
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        apiKey,
        webhookSecret,
        message: 'API Key generata con successo. Conservala in un luogo sicuro!'
      }, { headers: corsHeaders });
    }

    // Lab: Toggle integration active/inactive
    if (path === 'lab/integration/toggle') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
      }
      const labIntegrations = await getCollection('lab_integrations');
      const integration = await labIntegrations.findOne({ labId: user.id });
      if (!integration) {
        return NextResponse.json({ error: 'Nessuna integrazione configurata' }, { status: 404, headers: corsHeaders });
      }
      const newState = !integration.isActive;
      await labIntegrations.updateOne({ labId: user.id }, { $set: { isActive: newState, updatedAt: new Date().toISOString() } });
      return NextResponse.json({ success: true, isActive: newState }, { headers: corsHeaders });
    }

    // ==================== PUBLIC WEBHOOK ENDPOINTS - POST ====================

    // Webhook: Update request status
    if (path.match(/^webhook\/lab\/[^/]+\/update-status$/)) {
      const apiKey = path.split('/')[2];

      const labIntegrations = await getCollection('lab_integrations');
      const integration = await labIntegrations.findOne({ apiKey, isActive: { $ne: false } });

      if (!integration) {
        return NextResponse.json({ error: 'API Key non valida o integrazione disattivata' }, { status: 401, headers: corsHeaders });
      }

      const { requestId, status, notes } = body;

      if (!requestId || !status) {
        return NextResponse.json({ error: 'requestId e status sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const validStatuses = ['received', 'sample_waiting', 'sample_received', 'in_progress', 'report_ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Stato non valido. Valori ammessi: ${validStatuses.join(', ')}` }, { status: 400, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: requestId, labId: integration.labId });

      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata per questo laboratorio' }, { status: 404, headers: corsHeaders });
      }

      await labRequests.updateOne(
        { id: requestId },
        {
          $set: { status, updatedAt: new Date().toISOString() },
          $push: {
            statusHistory: {
              status,
              note: notes || 'Aggiornamento automatico via API',
              updatedBy: 'api_integration',
              updatedByName: 'API Integrazione',
              updatedAt: new Date().toISOString()
            }
          }
        }
      );

      // Log
      const webhookLogs = await getCollection('webhook_logs');
      await webhookLogs.insertOne({
        id: require('crypto').randomUUID(),
        labId: integration.labId,
        requestId,
        eventType: 'update_status',
        method: 'POST',
        payload: { status, notes },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        processedAt: new Date().toISOString(),
        success: true
      });

      // Send email to clinic if status changed to report_ready
      if (status === 'report_ready') {
        try {
          const usersCol = await getCollection('users');
          const clinic = await usersCol.findOne({ id: labRequest.clinicId });
          if (clinic?.email) {
            await sendEmail({
              to: clinic.email,
              subject: `🔬 Referto pronto - ${labRequest.examName || labRequest.examType}`,
              html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#7C3AED;">🔬 Referto Pronto</h2>
                <p>Il laboratorio ha completato l'analisi <strong>${labRequest.examName || labRequest.examType}</strong>.</p>
                <p>Codice campione: <strong>${labRequest.sampleCode || 'N/D'}</strong></p>
                <p>Accedi alla tua dashboard per visualizzare i dettagli.</p>
              </div>`
            });
          }
        } catch (e) { console.error('Email notification error:', e); }
      }

      return NextResponse.json({
        success: true,
        message: 'Stato aggiornato con successo',
        requestId,
        newStatus: status
      }, { headers: corsHeaders });
    }

    // Webhook: Upload report
    if (path.match(/^webhook\/lab\/[^/]+\/upload-report$/)) {
      const apiKey = path.split('/')[2];

      const labIntegrations = await getCollection('lab_integrations');
      const integration = await labIntegrations.findOne({ apiKey, isActive: { $ne: false } });

      if (!integration) {
        return NextResponse.json({ error: 'API Key non valida o integrazione disattivata' }, { status: 401, headers: corsHeaders });
      }

      const { requestId, reportPdfBase64, fileName, notes } = body;

      if (!requestId || !reportPdfBase64) {
        return NextResponse.json({ error: 'requestId e reportPdfBase64 sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: requestId, labId: integration.labId });

      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata per questo laboratorio' }, { status: 404, headers: corsHeaders });
      }

      // Create report
      const labReports = await getCollection('lab_reports');
      const crypto = require('crypto');
      const reportId = crypto.randomUUID();

      await labReports.insertOne({
        id: reportId,
        labRequestId: requestId,
        labId: integration.labId,
        clinicId: labRequest.clinicId,
        petId: labRequest.petId,
        ownerId: labRequest.ownerId,
        fileName: fileName || `report_${requestId.slice(0, 8)}.pdf`,
        fileContent: reportPdfBase64,
        reportNotes: notes || '',
        visibleToOwner: false,
        source: 'api_integration',
        uploadedAt: new Date().toISOString()
      });

      // Update request status to report_ready
      await labRequests.updateOne(
        { id: requestId },
        {
          $set: { status: 'report_ready', updatedAt: new Date().toISOString() },
          $push: {
            statusHistory: {
              status: 'report_ready',
              note: 'Referto caricato automaticamente via API',
              updatedBy: 'api_integration',
              updatedByName: 'API Integrazione',
              updatedAt: new Date().toISOString()
            }
          }
        }
      );

      // Log
      const webhookLogs = await getCollection('webhook_logs');
      await webhookLogs.insertOne({
        id: crypto.randomUUID(),
        labId: integration.labId,
        requestId,
        eventType: 'upload_report',
        method: 'POST',
        payload: { fileName: fileName || 'report.pdf', notes, hasContent: true },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        processedAt: new Date().toISOString(),
        success: true
      });

      // Notify clinic
      try {
        const usersCol = await getCollection('users');
        const clinic = await usersCol.findOne({ id: labRequest.clinicId });
        if (clinic?.email) {
          await sendEmail({
            to: clinic.email,
            subject: `📄 Referto caricato - ${labRequest.examName || labRequest.examType}`,
            html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#7C3AED;">📄 Nuovo Referto Disponibile</h2>
              <p>Il laboratorio ha caricato il referto per <strong>${labRequest.examName || labRequest.examType}</strong>.</p>
              <p>Codice campione: <strong>${labRequest.sampleCode || 'N/D'}</strong></p>
              <p>Accedi alla dashboard per revisionarlo e inviarlo al proprietario.</p>
            </div>`
          });
        }
      } catch (e) { console.error('Email notification error:', e); }

      return NextResponse.json({
        success: true,
        message: 'Referto caricato con successo',
        reportId,
        requestId
      }, { headers: corsHeaders });
    }

    // Admin: Update lab integration settings
    if (path === 'admin/labs/integration') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo admin possono configurare integrazioni' }, { status: 401, headers: corsHeaders });
      }

      const { labId, integrationType, apiEndpoint, apiKey, webhookSecret, autoSync, examTypeMapping } = body;
      if (!labId) {
        return NextResponse.json({ error: 'ID laboratorio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const labIntegrations = await getCollection('lab_integrations');
      const integrationId = require('crypto').randomUUID();
      
      await labIntegrations.updateOne(
        { labId },
        {
          $set: {
            labId,
            integrationType: integrationType || 'manual', // manual, api, lis_hl7, webhook
            apiEndpoint: apiEndpoint || null,
            apiKey: apiKey || null,
            webhookSecret: webhookSecret || require('crypto').randomBytes(32).toString('hex'),
            autoSync: autoSync || false,
            examTypeMapping: examTypeMapping || {},
            updatedAt: new Date().toISOString(),
            updatedBy: user.id
          },
          $setOnInsert: {
            id: integrationId,
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Configurazione integrazione aggiornata',
        integrationId 
      }, { headers: corsHeaders });
    }

    // Webhook: Receive lab results from external system
    if (path === 'webhooks/lab-results') {
      // This endpoint accepts results from external lab systems
      const webhookSecret = request.headers.get('x-webhook-secret');
      
      if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret mancante' }, { status: 401, headers: corsHeaders });
      }

      // Validate webhook secret against lab integration config
      const labIntegrations = await getCollection('lab_integrations');
      const integration = await labIntegrations.findOne({ webhookSecret });
      
      if (!integration) {
        return NextResponse.json({ error: 'Webhook secret non valido' }, { status: 401, headers: corsHeaders });
      }

      const { requestId, results, status, reportPdfBase64, reportFileName, notes } = body;
      
      if (!requestId) {
        return NextResponse.json({ error: 'ID richiesta obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      // Find the lab request
      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: requestId, labId: integration.labId });
      
      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata per questo laboratorio' }, { status: 404, headers: corsHeaders });
      }

      // Log the webhook event
      const webhookLogs = await getCollection('webhook_logs');
      await webhookLogs.insertOne({
        id: require('crypto').randomUUID(),
        labId: integration.labId,
        requestId,
        eventType: 'lab_result',
        payload: { results, status, hasReport: !!reportPdfBase64, notes },
        processedAt: new Date().toISOString(),
        success: true
      });

      // If report PDF is provided, create a lab report
      if (reportPdfBase64) {
        const labReports = await getCollection('lab_reports');
        const reportId = require('crypto').randomUUID();
        
        await labReports.insertOne({
          id: reportId,
          labRequestId: requestId,
          labId: integration.labId,
          clinicId: labRequest.clinicId,
          petId: labRequest.petId,
          ownerId: labRequest.ownerId,
          fileName: reportFileName || `report_${requestId.slice(0,8)}.pdf`,
          fileContent: reportPdfBase64,
          reportNotes: notes || '',
          visibleToOwner: false,
          source: 'webhook_auto',
          uploadedAt: new Date().toISOString()
        });

        // Update request status
        await labRequests.updateOne(
          { id: requestId },
          {
            $set: { status: 'report_ready', updatedAt: new Date().toISOString() },
            $push: {
              statusHistory: {
                status: 'report_ready',
                note: 'Referto ricevuto automaticamente via integrazione',
                updatedBy: 'system_webhook',
                updatedByName: 'Sistema Automatico',
                updatedAt: new Date().toISOString()
              }
            }
          }
        );
      } else if (status) {
        // Just update status
        await labRequests.updateOne(
          { id: requestId },
          {
            $set: { status, updatedAt: new Date().toISOString() },
            $push: {
              statusHistory: {
                status,
                note: notes || 'Aggiornamento automatico via integrazione',
                updatedBy: 'system_webhook',
                updatedByName: 'Sistema Automatico',
                updatedAt: new Date().toISOString()
              }
            }
          }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Webhook ricevuto ed elaborato',
        requestId 
      }, { headers: corsHeaders });
    }

  return null; // Path not handled by lab module
}
