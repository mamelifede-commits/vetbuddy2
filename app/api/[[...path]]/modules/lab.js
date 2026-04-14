// modules/lab.js - All Lab-related API endpoints (Marketplace, Connections, Requests, Reports)
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { hashPassword, getUserFromRequest, generateToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { LAB_EXAM_TYPES, LAB_REQUEST_STATUSES, corsHeaders } from './constants';

// ==================== LAB GET HANDLERS ====================
export async function handleLabGet(path, request) {
    if (path === 'lab/exam-types') {
      return NextResponse.json(LAB_EXAM_TYPES, { headers: corsHeaders });
    }
    
    // Get lab request statuses
    if (path === 'lab/statuses') {
      return NextResponse.json(LAB_REQUEST_STATUSES, { headers: corsHeaders });
    }
    
    // Get all labs (for clinic to select)
    if (path === 'labs') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const labs = await users.find({ role: 'lab', isApproved: true }, { projection: { password: 0 } }).toArray();
      return NextResponse.json(labs, { headers: corsHeaders });
    }

    // ===== LAB MARKETPLACE (for clinics) =====
    if (path === 'labs/marketplace') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const labs = await users.find({ role: 'lab', isApproved: true, status: 'active' }, { projection: { password: 0 } }).toArray();
      
      // Get price lists and connections for each lab
      const labPriceList = await getCollection('lab_price_list');
      const connections = await getCollection('clinic_lab_connections');
      
      const enrichedLabs = await Promise.all(labs.map(async (lab) => {
        const prices = await labPriceList.find({ labId: lab.id }).toArray();
        let connectionStatus = null;
        if (user.role === 'clinic') {
          const conn = await connections.findOne({ clinicId: user.id, labId: lab.id, status: { $in: ['active', 'pending'] } });
          connectionStatus = conn ? conn.status : null;
        }
        return {
          id: lab.id,
          labName: lab.labName || lab.name,
          email: lab.email,
          phone: lab.phone || '',
          address: lab.address || '',
          city: lab.city || '',
          province: lab.province || '',
          description: lab.description || '',
          specializations: lab.specializations || [],
          pickupAvailable: lab.pickupAvailable || false,
          pickupDays: lab.pickupDays || '',
          pickupHours: lab.pickupHours || '',
          averageReportTime: lab.averageReportTime || '',
          latitude: lab.latitude || null,
          longitude: lab.longitude || null,
          logoUrl: lab.logoUrl || '',
          contactPerson: lab.contactPerson || '',
          priceList: prices.map(p => ({
            examType: p.examType,
            title: p.title || p.examType,
            description: p.description || '',
            priceFrom: p.priceFrom || 0,
            priceTo: p.priceTo || null,
            priceOnRequest: p.priceOnRequest || false,
            averageDeliveryTime: p.averageDeliveryTime || ''
          })),
          connectionStatus
        };
      }));

      return NextResponse.json(enrichedLabs, { headers: corsHeaders });
    }

    // ===== CLINIC CONNECTED LABS =====
    if (path === 'clinic/connected-labs') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const connections = await getCollection('clinic_lab_connections');
      const conns = await connections.find({ clinicId: user.id }).sort({ createdAt: -1 }).toArray();
      
      const users = await getCollection('users');
      const enrichedConns = await Promise.all(conns.map(async (conn) => {
        const lab = await users.findOne({ id: conn.labId }, { projection: { password: 0 } });
        return {
          ...conn,
          lab: lab ? {
            id: lab.id, labName: lab.labName || lab.name, email: lab.email,
            phone: lab.phone || '', city: lab.city || '', address: lab.address || '',
            specializations: lab.specializations || [],
            pickupAvailable: lab.pickupAvailable || false,
            averageReportTime: lab.averageReportTime || ''
          } : null
        };
      }));

      return NextResponse.json(enrichedConns, { headers: corsHeaders });
    }

    // ===== CLINIC LAB INVITATIONS SENT =====
    if (path === 'clinic/lab-invitations') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const labInvitations = await getCollection('lab_invitations');
      const invitations = await labInvitations.find({ clinicId: user.id }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(invitations, { headers: corsHeaders });
    }

    // ===== LAB CONNECTIONS (for lab dashboard) =====
    if (path === 'lab/connections') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const connections = await getCollection('clinic_lab_connections');
      const conns = await connections.find({ labId: user.id }).sort({ createdAt: -1 }).toArray();
      
      const users = await getCollection('users');
      const enrichedConns = await Promise.all(conns.map(async (conn) => {
        const clinic = await users.findOne({ id: conn.clinicId }, { projection: { password: 0 } });
        return {
          ...conn,
          clinic: clinic ? {
            id: clinic.id, clinicName: clinic.clinicName || clinic.name, email: clinic.email,
            phone: clinic.phone || '', city: clinic.city || '', address: clinic.address || ''
          } : null
        };
      }));

      return NextResponse.json(enrichedConns, { headers: corsHeaders });
    }

    // ===== LAB PRICE LIST (GET - for any user viewing a lab) =====
    if (path.match(/^labs\/[^/]+\/price-list$/)) {
      const labId = path.split('/')[1];
      const labPriceList = await getCollection('lab_price_list');
      const prices = await labPriceList.find({ labId }).toArray();
      return NextResponse.json(prices, { headers: corsHeaders });
    }

    // ===== PUBLIC LAB PROFILE =====
    if (path.match(/^labs\/[^/]+\/profile$/)) {
      const labId = path.split('/')[1];
      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId, role: 'lab', isApproved: true }, { projection: { password: 0 } });
      if (!lab) {
        return NextResponse.json({ error: 'Laboratorio non trovato' }, { status: 404, headers: corsHeaders });
      }
      const labPriceList = await getCollection('lab_price_list');
      const prices = await labPriceList.find({ labId }).toArray();
      
      return NextResponse.json({
        id: lab.id, labName: lab.labName || lab.name, email: lab.email, phone: lab.phone || '',
        address: lab.address || '', city: lab.city || '', province: lab.province || '',
        description: lab.description || '', specializations: lab.specializations || [],
        pickupAvailable: lab.pickupAvailable || false, pickupDays: lab.pickupDays || '',
        pickupHours: lab.pickupHours || '', averageReportTime: lab.averageReportTime || '',
        latitude: lab.latitude || null, longitude: lab.longitude || null,
        logoUrl: lab.logoUrl || '', contactPerson: lab.contactPerson || '',
        priceList: prices
      }, { headers: corsHeaders });
    }

    // ===== LAB OWN PRICE LIST (GET) =====
    if (path === 'lab/my-price-list') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const labPriceList = await getCollection('lab_price_list');
      const prices = await labPriceList.find({ labId: user.id }).sort({ examType: 1 }).toArray();
      return NextResponse.json(prices, { headers: corsHeaders });
    }

    // ===== LAB BILLING STATUS =====
    if (path === 'lab/billing') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const lab = await users.findOne({ id: user.id });
      if (!lab) {
        return NextResponse.json({ error: 'Lab non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      const now = new Date();
      const freeUntil = lab.freeUntil ? new Date(lab.freeUntil) : null;
      const requestsCount = lab.requestsCount || 0;
      const maxFreeRequests = lab.maxFreeRequests || 50;
      const trialExpired = freeUntil ? now > freeUntil : false;
      const requestsExhausted = requestsCount >= maxFreeRequests;
      const billingActive = trialExpired || requestsExhausted;
      
      return NextResponse.json({
        plan: lab.plan || 'partner_free',
        freeUntil: lab.freeUntil || null,
        requestsCount,
        maxFreeRequests,
        trialExpired,
        requestsExhausted,
        billingActive,
        daysRemaining: freeUntil && !trialExpired ? Math.max(0, Math.ceil((freeUntil - now) / (1000*60*60*24))) : 0,
        requestsRemaining: Math.max(0, maxFreeRequests - requestsCount),
        createdAt: lab.createdAt
      }, { headers: corsHeaders });
    }

    // Get lab requests (for clinic or lab)
    if (path === 'lab-requests') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const labRequests = await getCollection('lab_requests');
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      
      let query = {};
      if (user.role === 'clinic') {
        query = { clinicId: user.id };
      } else if (user.role === 'lab') {
        query = { labId: user.id };
      } else if (user.role === 'admin') {
        // Admin can see all
      } else {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const requests = await labRequests.find(query).sort({ createdAt: -1 }).toArray();
      
      // Enrich with pet, clinic, lab info
      const enrichedRequests = await Promise.all(requests.map(async (req) => {
        const pet = await pets.findOne({ id: req.petId });
        const clinic = await users.findOne({ id: req.clinicId });
        const lab = await users.findOne({ id: req.labId });
        return {
          ...req,
          petName: pet?.name || 'Sconosciuto',
          petSpecies: pet?.species || '',
          clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
          labName: lab?.labName || lab?.name || 'Laboratorio'
        };
      }));
      
      return NextResponse.json(enrichedRequests, { headers: corsHeaders });
    }
    
    // Get single lab request
    if (path.startsWith('lab-requests/') && !path.includes('/reports')) {
      const requestId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const labRequests = await getCollection('lab_requests');
      const labReq = await labRequests.findOne({ id: requestId });
      
      if (!labReq) {
        return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404, headers: corsHeaders });
      }
      
      // Check permission
      if (user.role === 'clinic' && labReq.clinicId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      if (user.role === 'lab' && labReq.labId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      // Get related data
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      const labReports = await getCollection('lab_reports');
      
      const pet = await pets.findOne({ id: labReq.petId });
      const clinic = await users.findOne({ id: labReq.clinicId });
      const lab = await users.findOne({ id: labReq.labId });
      const owner = pet ? await users.findOne({ id: pet.ownerId }) : null;
      const reports = await labReports.find({ labRequestId: requestId }).sort({ uploadedAt: -1 }).toArray();
      
      return NextResponse.json({
        ...labReq,
        pet,
        clinic: { id: clinic?.id, name: clinic?.clinicName || clinic?.name, email: clinic?.email },
        lab: { id: lab?.id, name: lab?.labName || lab?.name, email: lab?.email },
        owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
        reports
      }, { headers: corsHeaders });
    }
    
    // Get lab reports for a pet (for owner view)
    if (path.startsWith('pets/') && path.endsWith('/lab-reports')) {
      const petId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      
      if (!pet) {
        return NextResponse.json({ error: 'Pet non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      // Check permission
      if (user.role === 'owner' && pet.ownerId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const labReports = await getCollection('lab_reports');
      let query = { petId };
      
      // Owner can only see reports marked as visible
      if (user.role === 'owner') {
        query.visibleToOwner = true;
      }
      
      const reports = await labReports.find(query).sort({ uploadedAt: -1 }).toArray();
      
      return NextResponse.json(reports, { headers: corsHeaders });
    }
    
    // ==================== END LAB API - GET ====================

  return null; // Path not handled by lab module
}

// ==================== LAB POST HANDLERS ====================
export async function handleLabPost(path, request, body) {
    if (path === 'labs/register') {
      const { 
        email, password, labName, vatNumber, phone, address, city, province,
        contactPerson, description, specializations, pickupAvailable, pickupDays, pickupHours,
        averageReportTime, latitude, longitude, invitationToken
      } = body;
      
      if (!email || !password || !labName) {
        return NextResponse.json({ error: 'Email, password e nome laboratorio sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const existing = await users.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'Email già registrata' }, { status: 400, headers: corsHeaders });
      }

      const hashedPassword = await hashPassword(password);
      const labId = uuidv4();
      const lab = {
        id: labId,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'lab',
        labName, name: labName,
        vatNumber: vatNumber || '',
        phone: phone || '', address: address || '', city: city || '', province: province || '',
        contactPerson: contactPerson || '',
        description: description || '',
        specializations: specializations || [],
        pickupAvailable: pickupAvailable || false,
        pickupDays: pickupDays || '',
        pickupHours: pickupHours || '',
        averageReportTime: averageReportTime || '',
        latitude: latitude || null, longitude: longitude || null,
        logoUrl: '',
        status: 'pending_approval', // pending_approval, active, suspended, rejected
        isApproved: false,
        plan: 'partner_free',
        freeUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months free
        requestsCount: 0,
        maxFreeRequests: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await users.insertOne(lab);

      // If invitation token provided, auto-connect with clinic
      if (invitationToken) {
        const labInvitations = await getCollection('lab_invitations');
        const invitation = await labInvitations.findOne({ token: invitationToken, status: 'pending' });
        if (invitation && invitation.email.toLowerCase() === email.toLowerCase()) {
          // Accept invitation
          await labInvitations.updateOne({ token: invitationToken }, { $set: { status: 'accepted', acceptedAt: new Date().toISOString(), labId } });
          
          // Create connection
          const connections = await getCollection('clinic_lab_connections');
          await connections.insertOne({
            id: uuidv4(), clinicId: invitation.clinicId, labId, status: 'active',
            invitedByClinicId: invitation.clinicId, invitationEmail: email,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          });

          // Auto-approve if invited
          await users.updateOne({ id: labId }, { $set: { status: 'active', isApproved: true } });
          lab.status = 'active';
          lab.isApproved = true;
        }
      }

      // Notify admin
      try {
        await sendEmail({
          to: 'admin@vetbuddy.it',
          subject: '🧪 Nuovo laboratorio registrato - VetBuddy',
          html: `<p>Un nuovo laboratorio si è registrato:</p><p><strong>${labName}</strong> - ${city || 'N/D'}</p><p>Email: ${email}</p><p>Stato: ${lab.status === 'active' ? 'Attivo (invitato)' : 'In attesa di approvazione'}</p>`
        });
      } catch (e) { console.error('Admin notification error:', e); }

      const { password: _, ...labSafe } = lab;
      const token = generateToken(lab);
      return NextResponse.json({ ...labSafe, token }, { headers: corsHeaders });
    }

    // ===== CLINIC INVITES LAB =====
    if (path === 'clinic/invite-lab') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono invitare laboratori' }, { status: 401, headers: corsHeaders });
      }

      const { email, message } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email laboratorio obbligatoria' }, { status: 400, headers: corsHeaders });
      }

      const labInvitations = await getCollection('lab_invitations');
      
      // Check if already invited
      const existingInvitation = await labInvitations.findOne({ clinicId: user.id, email: email.toLowerCase(), status: 'pending' });
      if (existingInvitation) {
        return NextResponse.json({ error: 'Invito già inviato a questo laboratorio' }, { status: 400, headers: corsHeaders });
      }

      // Check if lab already registered
      const users = await getCollection('users');
      const existingLab = await users.findOne({ email: email.toLowerCase(), role: 'lab' });
      
      if (existingLab) {
        // Lab already exists - create connection directly
        const connections = await getCollection('clinic_lab_connections');
        const existingConn = await connections.findOne({ clinicId: user.id, labId: existingLab.id, status: { $in: ['active', 'pending'] } });
        if (existingConn) {
          return NextResponse.json({ error: 'Già collegato a questo laboratorio' }, { status: 400, headers: corsHeaders });
        }
        await connections.insertOne({
          id: uuidv4(), clinicId: user.id, labId: existingLab.id, status: 'pending',
          invitedByClinicId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        });
        return NextResponse.json({ success: true, message: 'Richiesta di collegamento inviata al laboratorio', alreadyRegistered: true }, { headers: corsHeaders });
      }

      // Create invitation token
      const token = uuidv4();
      const invitation = {
        id: uuidv4(), clinicId: user.id, clinicName: user.clinicName || user.name,
        email: email.toLowerCase(), token, status: 'pending',
        message: message || '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        createdAt: new Date().toISOString()
      };
      await labInvitations.insertOne(invitation);

      // Send invitation email
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      try {
        await sendEmail({
          to: email,
          subject: `🧪 Invito a VetBuddy da ${user.clinicName || user.name}`,
          html: `
            <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #7C3AED;">🧪 Sei stato invitato su VetBuddy!</h2>
              <p>La clinica veterinaria <strong>${user.clinicName || user.name}</strong> ti invita a registrarti come laboratorio partner su VetBuddy.</p>
              ${message ? `<p style="background: #F3F4F6; padding: 12px; border-radius: 8px;"><em>"${message}"</em></p>` : ''}
              <p>VetBuddy è la piattaforma che connette cliniche veterinarie e laboratori di analisi.</p>
              <ul>
                <li>Registrazione gratuita</li>
                <li>6 mesi gratis o 50 richieste gestite</li>
                <li>Dashboard per gestire richieste e referti</li>
                <li>Profilo nel marketplace laboratori</li>
              </ul>
              <a href="${baseUrl}?invite=${token}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">Accetta Invito e Registrati</a>
              <p style="color: #6B7280; font-size: 12px;">L'invito scade tra 30 giorni.</p>
            </div>`
        });
      } catch (e) { console.error('Invitation email error:', e); }

      return NextResponse.json({ success: true, message: 'Invito inviato con successo', invitationId: invitation.id }, { headers: corsHeaders });
    }

    // ===== LAB ACCEPTS/REJECTS CONNECTION =====
    if (path === 'lab/connection-response') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { connectionId, action } = body; // action: 'accept' or 'reject'
      if (!connectionId || !action) {
        return NextResponse.json({ error: 'Dati mancanti' }, { status: 400, headers: corsHeaders });
      }

      const connections = await getCollection('clinic_lab_connections');
      const conn = await connections.findOne({ id: connectionId, labId: user.id });
      if (!conn) {
        return NextResponse.json({ error: 'Collegamento non trovato' }, { status: 404, headers: corsHeaders });
      }

      const newStatus = action === 'accept' ? 'active' : 'rejected';
      await connections.updateOne({ id: connectionId }, { $set: { status: newStatus, updatedAt: new Date().toISOString() } });

      return NextResponse.json({ success: true, message: action === 'accept' ? 'Collegamento accettato' : 'Collegamento rifiutato' }, { headers: corsHeaders });
    }

    // ===== LAB PROFILE UPDATE =====
    if (path === 'lab/profile') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { labName, vatNumber, phone, address, city, province, contactPerson, description,
        specializations, pickupAvailable, pickupDays, pickupHours, averageReportTime, latitude, longitude, logoUrl } = body;

      const updateData = {};
      if (labName !== undefined) { updateData.labName = labName; updateData.name = labName; }
      if (vatNumber !== undefined) updateData.vatNumber = vatNumber;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (province !== undefined) updateData.province = province;
      if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
      if (description !== undefined) updateData.description = description;
      if (specializations !== undefined) updateData.specializations = specializations;
      if (pickupAvailable !== undefined) updateData.pickupAvailable = pickupAvailable;
      if (pickupDays !== undefined) updateData.pickupDays = pickupDays;
      if (pickupHours !== undefined) updateData.pickupHours = pickupHours;
      if (averageReportTime !== undefined) updateData.averageReportTime = averageReportTime;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      updateData.updatedAt = new Date().toISOString();

      const users = await getCollection('users');
      await users.updateOne({ id: user.id }, { $set: updateData });

      return NextResponse.json({ success: true, message: 'Profilo aggiornato' }, { headers: corsHeaders });
    }

    // ===== LAB PRICE LIST MANAGEMENT =====
    if (path === 'lab/price-list') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { prices } = body; // Array of price items
      if (!prices || !Array.isArray(prices)) {
        return NextResponse.json({ error: 'Lista prezzi non valida' }, { status: 400, headers: corsHeaders });
      }

      const labPriceList = await getCollection('lab_price_list');
      
      // Delete existing prices for this lab
      await labPriceList.deleteMany({ labId: user.id });
      
      // Insert new prices
      const priceItems = prices.map(p => ({
        id: uuidv4(),
        labId: user.id,
        examType: p.examType, // sangue, urine, feci, biopsia, citologia, istologia, genetico, allergologia, microbiologia, parassitologia, altro
        title: p.title || '',
        description: p.description || '',
        priceFrom: p.priceFrom || 0,
        priceTo: p.priceTo || null,
        priceOnRequest: p.priceOnRequest || false,
        averageDeliveryTime: p.averageDeliveryTime || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      if (priceItems.length > 0) {
        await labPriceList.insertMany(priceItems);
      }

      return NextResponse.json({ success: true, message: 'Listino aggiornato', count: priceItems.length }, { headers: corsHeaders });
    }

    // ===== CLINIC REQUEST CONNECTION WITH LAB =====
    if (path === 'clinic/lab-connection') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { labId } = body;
      if (!labId) {
        return NextResponse.json({ error: 'ID laboratorio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const connections = await getCollection('clinic_lab_connections');
      const existing = await connections.findOne({ clinicId: user.id, labId, status: { $in: ['active', 'pending'] } });
      if (existing) {
        return NextResponse.json({ error: 'Collegamento già esistente o in attesa' }, { status: 400, headers: corsHeaders });
      }

      await connections.insertOne({
        id: uuidv4(), clinicId: user.id, labId, status: 'pending',
        invitedByClinicId: user.id,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });

      // Notify lab
      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId });
      if (lab?.email) {
        try {
          await sendEmail({
            to: lab.email,
            subject: `🔗 Nuova richiesta di collegamento - ${user.clinicName || user.name}`,
            html: `<p>La clinica <strong>${user.clinicName || user.name}</strong> vuole collegarsi con il tuo laboratorio su VetBuddy.</p><p>Accedi alla tua dashboard per accettare o rifiutare.</p>`
          });
        } catch (e) { console.error('Connection notification error:', e); }
      }

      return NextResponse.json({ success: true, message: 'Richiesta di collegamento inviata' }, { headers: corsHeaders });
    }

    // ===== ADMIN: Update Lab Status =====
    if (path.match(/^admin\/labs\/[^/]+\/status$/)) {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo admin' }, { status: 403, headers: corsHeaders });
      }

      const labId = path.split('/')[2];
      const { status: newStatus, reason } = body; // active, suspended, rejected

      const validStatuses = ['active', 'suspended', 'rejected', 'pending_approval'];
      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json({ error: 'Stato non valido' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId, role: 'lab' });
      if (!lab) {
        return NextResponse.json({ error: 'Laboratorio non trovato' }, { status: 404, headers: corsHeaders });
      }

      await users.updateOne({ id: labId }, { $set: { 
        status: newStatus, 
        isApproved: newStatus === 'active',
        approvedAt: newStatus === 'active' ? new Date().toISOString() : lab.approvedAt,
        approvedBy: newStatus === 'active' ? user.id : lab.approvedBy,
        rejectionReason: reason || '',
        updatedAt: new Date().toISOString()
      }});

      // Notify lab
      if (lab.email) {
        const statusMessages = {
          'active': { emoji: '✅', text: 'approvato', detail: 'Puoi ora accedere alla tua dashboard e iniziare a ricevere richieste dalle cliniche.' },
          'suspended': { emoji: '⚠️', text: 'sospeso', detail: reason ? `Motivo: ${reason}` : 'Contatta il supporto per maggiori informazioni.' },
          'rejected': { emoji: '❌', text: 'rifiutato', detail: reason ? `Motivo: ${reason}` : 'Contatta il supporto per maggiori informazioni.' }
        };
        const msg = statusMessages[newStatus];
        if (msg) {
          try {
            await sendEmail({
              to: lab.email,
              subject: `${msg.emoji} Il tuo laboratorio è stato ${msg.text} - VetBuddy`,
              html: `<p>Il laboratorio <strong>${lab.labName}</strong> è stato <strong>${msg.text}</strong> su VetBuddy.</p><p>${msg.detail}</p>`
            });
          } catch (e) { console.error('Lab status email error:', e); }
        }
      }

      return NextResponse.json({ success: true, message: `Laboratorio ${newStatus}` }, { headers: corsHeaders });
    }
    
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
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">© 2025 vetbuddy - Sistema Analisi Laboratorio</p>
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
