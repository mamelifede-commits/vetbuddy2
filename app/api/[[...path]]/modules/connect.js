// modules/connect.js - VetBuddy Connect: unified invitations across actors
// Owner → Clinic, Clinic → Owners, Clinic → Lab, Lab → Clinics
// Plus provisional profiles and claim flow

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { corsHeaders } from './constants';

// ==================== HELPERS ====================
const INVITE_TYPES = {
  owner_to_clinic: { from: 'owner', to: 'clinic' },
  clinic_to_owner: { from: 'clinic', to: 'owner' },
  clinic_to_lab: { from: 'clinic', to: 'lab' },
  lab_to_clinic: { from: 'lab', to: 'clinic' }
};

const buildInviteEmail = ({ type, fromName, toEmail, message, inviteLink, customSubject }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
  const acceptLink = inviteLink || `${baseUrl}/connect/accept`;

  const titles = {
    owner_to_clinic: `🐾 Un proprietario vuole collegare il Passport del suo animale a te su VetBuddy`,
    clinic_to_owner: `🐾 La tua clinica ti invita su VetBuddy`,
    clinic_to_lab: `🔬 Una clinica vuole inviarti richieste digitali via VetBuddy`,
    lab_to_clinic: `🔬 Il tuo laboratorio partner è disponibile su VetBuddy`
  };

  const bodies = {
    owner_to_clinic: `${fromName || 'Un tuo cliente'} vuole collegare il <strong>Passport sanitario del suo animale</strong> alla tua clinica su VetBuddy, per ricevere promemoria, documenti, referti e prenotazioni in modo più semplice.`,
    clinic_to_owner: `${fromName || 'La tua clinica veterinaria'} ti ha invitato su VetBuddy! Potrai prenotare visite online, gestire il Passport sanitario del tuo animale, ricevere documenti autorizzati e promemoria automatici.`,
    clinic_to_lab: `${fromName || 'Una clinica veterinaria'} vuole inviarti richieste e ricevere referti digitali tramite VetBuddy. Entra gratis nella rete per gestire richieste, stati e referti PDF in modo ordinato.`,
    lab_to_clinic: `${fromName || 'Il tuo laboratorio partner'} è disponibile su VetBuddy. Puoi inviare richieste, seguire lo stato degli esami e ricevere referti PDF in modo digitale.`
  };

  return {
    to: toEmail,
    subject: customSubject || titles[type],
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🐾 VetBuddy</h1>
          <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0; font-size: 14px;">L'ecosistema operativo veterinario</p>
        </div>
        <div style="padding: 32px 24px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${titles[type]}</h2>
          <p style="color: #374151; line-height: 1.6; font-size: 15px;">${bodies[type]}</p>
          ${message ? `<div style="background: white; padding: 16px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;"><p style="margin: 0; color: #4b5563; font-style: italic;">"${message}"</p></div>` : ''}
          <div style="text-align: center; margin: 32px 0;">
            <a href="${acceptLink}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 36px; border-radius: 28px; text-decoration: none; font-weight: 600; font-size: 15px;">Scopri VetBuddy</a>
          </div>
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 24px 0 0;">Cliniche, proprietari e laboratori. Tutti collegati. Meno caos, più valore.</p>
        </div>
        <div style="background: #1f2937; padding: 16px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 11px;">© 2026 VetBuddy — VetBuddy Connect</p>
        </div>
      </div>
    `
  };
};

// ==================== GET HANDLERS ====================
export async function handleConnectGet(path, request) {
  // GET /api/connect/invitations — lista inviti dell'utente loggato
  if (path === 'connect/invitations') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const invitations = await getCollection('invitations');

    // Sent BY this user
    const sent = await invitations.find({ fromUserId: user.id }).sort({ createdAt: -1 }).toArray();
    // Received BY this user (matched by email, since recipient may not be registered yet)
    const received = await invitations.find({ toEmail: user.email?.toLowerCase() }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ sent, received }, { headers: corsHeaders });
  }

  // GET /api/connect/stats — KPI ecosistema per dashboard
  if (path === 'connect/stats') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const invitations = await getCollection('invitations');
    const users = await getCollection('users');
    const connections = await getCollection('clinic_lab_connections');
    const pets = await getCollection('pets');

    const sentTotal = await invitations.countDocuments({ fromUserId: user.id });
    const sentAccepted = await invitations.countDocuments({ fromUserId: user.id, status: 'accepted' });
    const sentPending = await invitations.countDocuments({ fromUserId: user.id, status: { $in: ['sent', 'opened'] } });

    let extra = {};
    if (user.role === 'clinic' || user.role === 'staff') {
      const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
      const ownersCount = await users.countDocuments({ role: 'owner', clinicIds: clinicId });
      const petsCount = await pets.countDocuments({ clinicId });
      const labConnections = await connections.countDocuments({ clinicId, status: 'active' });
      extra = { ownersConnected: ownersCount, petsLinked: petsCount, labsConnected: labConnections };
    } else if (user.role === 'lab') {
      const clinicConnections = await connections.countDocuments({ labId: user.id, status: 'active' });
      extra = { clinicsConnected: clinicConnections };
    } else if (user.role === 'owner') {
      const petsCount = await pets.countDocuments({ ownerId: user.id });
      const clinicLink = await users.countDocuments({ id: { $in: user.clinicIds || [] }, role: 'clinic' });
      extra = { petsOwned: petsCount, clinicsLinked: clinicLink };
    }

    return NextResponse.json({
      sentTotal, sentAccepted, sentPending,
      conversionRate: sentTotal > 0 ? Math.round((sentAccepted / sentTotal) * 100) : 0,
      ...extra
    }, { headers: corsHeaders });
  }

  // GET /api/connect/provisional/:token — verifica profilo provvisorio (pubblico)
  if (path.startsWith('connect/provisional/')) {
    const token = path.split('/')[2];
    const provisional = await getCollection('provisional_profiles');
    const profile = await provisional.findOne({ claimToken: token });
    if (!profile) return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404, headers: corsHeaders });
    // Solo informazioni minime, no PII non necessarie
    return NextResponse.json({
      id: profile.id, type: profile.type, name: profile.name,
      email: profile.email, city: profile.city,
      invitedBy: profile.invitedBy, inviterRole: profile.inviterRole,
      createdAt: profile.createdAt, status: profile.status
    }, { headers: corsHeaders });
  }

  // GET /api/connect/invite/:token — verifica invito (pubblico, per pagina accept)
  if (path.startsWith('connect/invite/')) {
    const token = path.split('/')[2];
    const invitations = await getCollection('invitations');
    const invite = await invitations.findOne({ token });
    if (!invite) return NextResponse.json({ error: 'Invito non trovato' }, { status: 404, headers: corsHeaders });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invito scaduto', expired: true }, { status: 410, headers: corsHeaders });
    }
    // Mark as opened
    if (invite.status === 'sent') {
      await invitations.updateOne({ id: invite.id }, { $set: { status: 'opened', openedAt: new Date().toISOString() } });
    }
    return NextResponse.json({
      id: invite.id, type: invite.type, fromName: invite.fromName, fromEmail: invite.fromEmail,
      toEmail: invite.toEmail, toName: invite.toName, message: invite.message,
      status: invite.status, createdAt: invite.createdAt
    }, { headers: corsHeaders });
  }

  // GET /api/connect/completion-score — punteggio completamento ecosistema per ruolo
  if (path === 'connect/completion-score') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    const pets = await getCollection('pets');
    const invitations = await getCollection('invitations');
    const connections = await getCollection('clinic_lab_connections');
    const labPriceList = await getCollection('lab_price_list');

    let checklist = [];
    let total = 0;
    let completed = 0;

    if (user.role === 'clinic' || user.role === 'staff') {
      const clinicId = user.role === 'staff' ? (user.clinicId || user.id) : user.id;
      const clinic = await users.findOne({ id: clinicId });
      const ownerCount = await users.countDocuments({ role: 'owner', clinicIds: clinicId });
      const labConnCount = await connections.countDocuments({ clinicId, status: 'active' });
      const ownersInvited = await invitations.countDocuments({ fromUserId: clinicId, type: 'clinic_to_owner' });
      const docs = await getCollection('documents');
      const hasDoc = await docs.findOne({ clinicId });
      checklist = [
        { key: 'profile', label: 'Profilo clinica completato', done: !!(clinic?.clinicName && clinic?.address && clinic?.phone), action: 'settings' },
        { key: 'services', label: 'Servizi configurati', done: !!(clinic?.services && clinic.services.length > 0), action: 'services' },
        { key: 'whatsapp', label: 'WhatsApp configurato', done: !!clinic?.whatsappNumber, action: 'whatsapp-business' },
        { key: 'qr', label: 'QR prenotazione generato', done: !!clinic?.bookingLinkActive || ownerCount > 0, action: 'bookinglink' },
        { key: 'invite_owners', label: 'Invitati almeno 20 proprietari', done: ownersInvited >= 20, current: ownersInvited, target: 20, action: 'vetbuddy-connect' },
        { key: 'lab_connect', label: 'Collegato almeno 1 laboratorio', done: labConnCount >= 1, action: 'labmarketplace' },
        { key: 'first_doc', label: 'Caricato primo documento', done: !!hasDoc, action: 'documents' },
        { key: 'automations', label: 'Promemoria vaccini attivati', done: !!(clinic?.automationSettings?.vaccineReminder), action: 'automations' },
        { key: 'passport', label: 'Passport Pet configurato', done: !!clinic?.passportEnabled || ownerCount > 5, action: 'patients' },
      ];
    } else if (user.role === 'owner') {
      const ownerPets = await pets.find({ ownerId: user.id }).toArray();
      const hasPet = ownerPets.length > 0;
      const firstPet = ownerPets[0];
      const clinicLinked = (user.clinicIds || []).length > 0;
      const invitedClinic = await invitations.countDocuments({ fromUserId: user.id, type: 'owner_to_clinic' });
      checklist = [
        { key: 'add_pet', label: 'Aggiungi animale', done: hasPet, action: 'pets' },
        { key: 'microchip', label: 'Aggiungi microchip', done: !!firstPet?.microchip, action: 'pets' },
        { key: 'emergency', label: 'Contatto emergenza', done: !!firstPet?.emergencyContact || !!user.emergencyContact, action: 'pets' },
        { key: 'allergies', label: 'Allergie / patologie', done: !!firstPet?.allergies, action: 'pets' },
        { key: 'invite_clinic', label: 'Invita la tua clinica', done: invitedClinic > 0 || clinicLinked, action: 'inviteClinic' },
        { key: 'qr_emergency', label: 'Genera QR emergenza', done: !!firstPet?.passportEnabled, action: 'pets' },
        { key: 'documents_viaggio', label: 'Documenti viaggio (opzionale)', done: !!firstPet?.travelDocs, optional: true, action: 'documents' },
      ];
    } else if (user.role === 'lab') {
      const lab = await users.findOne({ id: user.id });
      const priceCount = await labPriceList.countDocuments({ labId: user.id });
      const clinicsInvited = await invitations.countDocuments({ fromUserId: user.id, type: 'lab_to_clinic' });
      const clinicsConnected = await connections.countDocuments({ labId: user.id, status: 'active' });
      checklist = [
        { key: 'profile', label: 'Profilo laboratorio completato', done: !!(lab?.labName && lab?.address && lab?.phone), action: 'settings' },
        { key: 'price_list', label: 'Listino prezzi configurato', done: priceCount >= 3, current: priceCount, target: 3, action: 'prices' },
        { key: 'pickup', label: 'Disponibilità ritiro campioni', done: !!lab?.pickupAvailable, action: 'settings' },
        { key: 'avg_time', label: 'Tempi medi referti', done: !!lab?.averageReportTime, action: 'settings' },
        { key: 'invite_clinics', label: 'Invitate almeno 3 cliniche', done: clinicsInvited >= 3, current: clinicsInvited, target: 3, action: 'connect' },
        { key: 'clinic_connected', label: 'Collegato almeno 1 clinica', done: clinicsConnected >= 1, action: 'connections' },
      ];
    }

    total = checklist.length;
    completed = checklist.filter(c => c.done).length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      score, completed, total, checklist,
      level: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'progress' : 'starter'
    }, { headers: corsHeaders });
  }

  return null;
}
export async function handleConnectPost(path, request, body) {
  // POST /api/connect/invite — universale (con type)
  if (path === 'connect/invite') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { type, toEmail, toName, toPhone, toCity, message, examType } = body;
    if (!type || !INVITE_TYPES[type]) {
      return NextResponse.json({ error: 'Tipo invito non valido' }, { status: 400, headers: corsHeaders });
    }
    if (!toEmail) {
      return NextResponse.json({ error: 'Email destinatario obbligatoria' }, { status: 400, headers: corsHeaders });
    }
    // Verify direction allowed
    const { from } = INVITE_TYPES[type];
    const userRole = user.role === 'staff' ? 'clinic' : user.role;
    if (from !== userRole) {
      return NextResponse.json({ error: 'Non puoi inviare questo tipo di invito' }, { status: 403, headers: corsHeaders });
    }

    const invitations = await getCollection('invitations');
    const users = await getCollection('users');
    const provisional = await getCollection('provisional_profiles');

    // Check duplicate (same sender, same recipient, same type, still active)
    const existing = await invitations.findOne({
      fromUserId: user.id,
      toEmail: toEmail.toLowerCase(),
      type,
      status: { $in: ['sent', 'opened'] }
    });
    if (existing) {
      return NextResponse.json({ error: 'Hai già inviato questo invito recentemente', existing: existing.id }, { status: 400, headers: corsHeaders });
    }

    // Check if recipient already registered
    const recipientRole = INVITE_TYPES[type].to;
    const existingUser = await users.findOne({ email: toEmail.toLowerCase(), role: recipientRole });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const invitation = {
      id: uuidv4(),
      token,
      type,
      direction: `${INVITE_TYPES[type].from}->${INVITE_TYPES[type].to}`,
      fromUserId: user.id,
      fromName: user.name || user.clinicName || user.labName || user.email,
      fromEmail: user.email,
      fromRole: userRole,
      toEmail: toEmail.toLowerCase(),
      toName: toName || '',
      toPhone: toPhone || '',
      toCity: toCity || '',
      toUserId: existingUser?.id || null,
      examType: examType || '',
      message: message || '',
      status: 'sent',
      createdAt: new Date().toISOString(),
      expiresAt
    };

    await invitations.insertOne(invitation);

    // Create provisional profile if recipient is not registered (interno, non pubblico)
    if (!existingUser) {
      const existingProvisional = await provisional.findOne({ email: toEmail.toLowerCase(), type: recipientRole });
      if (existingProvisional) {
        // Update inviter list
        await provisional.updateOne(
          { id: existingProvisional.id },
          {
            $addToSet: { inviters: { userId: user.id, name: user.name || user.email, role: userRole, date: new Date().toISOString() } },
            $set: { lastInvitedAt: new Date().toISOString() }
          }
        );
      } else {
        await provisional.insertOne({
          id: uuidv4(),
          type: recipientRole,
          email: toEmail.toLowerCase(),
          name: toName || '',
          phone: toPhone || '',
          city: toCity || '',
          invitedBy: user.id,
          inviterRole: userRole,
          inviters: [{ userId: user.id, name: user.name || user.email, role: userRole, date: new Date().toISOString() }],
          claimToken: uuidv4(),
          status: 'pending_claim',
          public: false, // SOLO INTERNO
          createdAt: new Date().toISOString(),
          lastInvitedAt: new Date().toISOString()
        });
      }
    }

    // Send email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      const inviteLink = `${baseUrl}/connect/accept/${token}`;
      await sendEmail(buildInviteEmail({
        type, fromName: invitation.fromName, toEmail, message,
        inviteLink, customSubject: null
      }));
      await invitations.updateOne({ id: invitation.id }, { $set: { emailSent: true, emailSentAt: new Date().toISOString() } });
    } catch (emailError) {
      console.error('[Connect] Error sending invitation email:', emailError);
      // Save anyway, mark email failed
      await invitations.updateOne({ id: invitation.id }, { $set: { emailSent: false, emailError: emailError.message } });
    }

    return NextResponse.json({
      success: true,
      message: 'Invito inviato con successo',
      invitation: { ...invitation, token: undefined } // don't expose token to sender
    }, { headers: corsHeaders });
  }

  // POST /api/connect/bulk-invite — invio massivo (CSV o array)
  if (path === 'connect/bulk-invite') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    if (user.role !== 'clinic' && user.role !== 'lab' && user.role !== 'staff') {
      return NextResponse.json({ error: 'Solo cliniche e laboratori possono fare invii massivi' }, { status: 403, headers: corsHeaders });
    }

    const { type, recipients, message } = body;
    if (!type || !INVITE_TYPES[type]) {
      return NextResponse.json({ error: 'Tipo invito non valido' }, { status: 400, headers: corsHeaders });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Lista destinatari obbligatoria' }, { status: 400, headers: corsHeaders });
    }
    if (recipients.length > 200) {
      return NextResponse.json({ error: 'Massimo 200 destinatari per invio' }, { status: 400, headers: corsHeaders });
    }

    const invitations = await getCollection('invitations');
    const users = await getCollection('users');
    const provisional = await getCollection('provisional_profiles');

    const results = { sent: 0, skipped: 0, failed: 0, details: [] };
    const userRole = user.role === 'staff' ? 'clinic' : user.role;
    const recipientRole = INVITE_TYPES[type].to;

    for (const r of recipients) {
      if (!r.email) { results.skipped++; results.details.push({ email: '?', skipped: 'no_email' }); continue; }
      const emailLower = r.email.toLowerCase().trim();
      // Skip duplicates
      const existing = await invitations.findOne({
        fromUserId: user.id, toEmail: emailLower, type,
        status: { $in: ['sent', 'opened'] }
      });
      if (existing) { results.skipped++; results.details.push({ email: emailLower, skipped: 'duplicate' }); continue; }

      const existingUser = await users.findOne({ email: emailLower, role: recipientRole });
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const invitation = {
        id: uuidv4(), token, type,
        direction: `${INVITE_TYPES[type].from}->${INVITE_TYPES[type].to}`,
        fromUserId: user.id,
        fromName: user.name || user.clinicName || user.labName || user.email,
        fromEmail: user.email, fromRole: userRole,
        toEmail: emailLower, toName: r.name || '', toPhone: r.phone || '', toCity: r.city || '',
        toUserId: existingUser?.id || null,
        message: message || '',
        status: 'sent', createdAt: new Date().toISOString(), expiresAt
      };
      await invitations.insertOne(invitation);

      // provisional profile
      if (!existingUser) {
        const existingProv = await provisional.findOne({ email: emailLower, type: recipientRole });
        if (!existingProv) {
          await provisional.insertOne({
            id: uuidv4(), type: recipientRole, email: emailLower, name: r.name || '',
            phone: r.phone || '', city: r.city || '',
            invitedBy: user.id, inviterRole: userRole,
            inviters: [{ userId: user.id, name: user.name || user.email, role: userRole, date: new Date().toISOString() }],
            claimToken: uuidv4(), status: 'pending_claim', public: false,
            createdAt: new Date().toISOString(), lastInvitedAt: new Date().toISOString()
          });
        } else {
          await provisional.updateOne(
            { id: existingProv.id },
            {
              $addToSet: { inviters: { userId: user.id, name: user.name || user.email, role: userRole, date: new Date().toISOString() } },
              $set: { lastInvitedAt: new Date().toISOString() }
            }
          );
        }
      }

      // Send email (best-effort, no blocking)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const inviteLink = `${baseUrl}/connect/accept/${token}`;
        await sendEmail(buildInviteEmail({
          type, fromName: invitation.fromName, toEmail: emailLower, message,
          inviteLink
        }));
        await invitations.updateOne({ id: invitation.id }, { $set: { emailSent: true, emailSentAt: new Date().toISOString() } });
        results.sent++;
        results.details.push({ email: emailLower, sent: true });
      } catch (e) {
        await invitations.updateOne({ id: invitation.id }, { $set: { emailSent: false, emailError: e.message } });
        results.failed++;
        results.details.push({ email: emailLower, failed: e.message });
      }
    }

    return NextResponse.json({ success: true, results }, { headers: corsHeaders });
  }

  // POST /api/connect/accept — accettazione invito (richiede registrazione utente)
  if (path === 'connect/accept') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Devi prima registrarti o accedere' }, { status: 401, headers: corsHeaders });
    const { token } = body;
    if (!token) return NextResponse.json({ error: 'Token mancante' }, { status: 400, headers: corsHeaders });
    const invitations = await getCollection('invitations');
    const invite = await invitations.findOne({ token });
    if (!invite) return NextResponse.json({ error: 'Invito non trovato' }, { status: 404, headers: corsHeaders });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invito scaduto' }, { status: 410, headers: corsHeaders });
    }
    if (invite.status === 'accepted') {
      return NextResponse.json({ error: 'Invito già accettato', invitation: invite }, { status: 400, headers: corsHeaders });
    }

    // Check role matches
    const expectedRole = INVITE_TYPES[invite.type]?.to;
    if (user.role !== expectedRole && !(expectedRole === 'clinic' && user.role === 'staff')) {
      return NextResponse.json({
        error: `Devi avere un account ${expectedRole === 'clinic' ? 'clinica' : expectedRole === 'lab' ? 'laboratorio' : 'proprietario'} per accettare questo invito`
      }, { status: 403, headers: corsHeaders });
    }

    // Mark accepted
    await invitations.updateOne({ id: invite.id }, {
      $set: { status: 'accepted', acceptedAt: new Date().toISOString(), toUserId: user.id }
    });

    // Apply linking logic per type
    const users = await getCollection('users');
    if (invite.type === 'owner_to_clinic') {
      // Add the inviter (owner) into this clinic's owners list
      // Owner side: link clinic into owner's clinicIds
      await users.updateOne({ id: invite.fromUserId }, { $addToSet: { clinicIds: user.id } });
    } else if (invite.type === 'clinic_to_owner') {
      // Owner accepts clinic invite
      await users.updateOne({ id: user.id }, { $addToSet: { clinicIds: invite.fromUserId } });
    } else if (invite.type === 'clinic_to_lab' || invite.type === 'lab_to_clinic') {
      // Create clinic-lab connection
      const connections = await getCollection('clinic_lab_connections');
      const clinicId = invite.type === 'clinic_to_lab' ? invite.fromUserId : user.id;
      const labId = invite.type === 'clinic_to_lab' ? user.id : invite.fromUserId;
      const existing = await connections.findOne({ clinicId, labId });
      if (!existing) {
        await connections.insertOne({
          id: uuidv4(), clinicId, labId,
          status: 'active', createdAt: new Date().toISOString(),
          source: 'connect_invite'
        });
      } else {
        await connections.updateOne({ id: existing.id }, { $set: { status: 'active' } });
      }
    }

    // Notify inviter
    try {
      await sendEmail({
        to: invite.fromEmail,
        subject: `✅ ${user.name || user.email} ha accettato il tuo invito su VetBuddy`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">🎉 Invito accettato!</h2>
          <p><strong>${user.name || user.email}</strong> ha accettato il tuo invito su VetBuddy.</p>
          <p>Ora siete collegati nella rete VetBuddy.</p>
        </div>`
      });
    } catch (e) { console.error('[Connect] notify inviter failed:', e.message); }

    return NextResponse.json({ success: true, message: 'Invito accettato', invitation: invite }, { headers: corsHeaders });
  }

  // POST /api/connect/revoke — revoca invito
  if (path === 'connect/revoke') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { invitationId } = body;
    if (!invitationId) return NextResponse.json({ error: 'ID invito mancante' }, { status: 400, headers: corsHeaders });
    const invitations = await getCollection('invitations');
    const invite = await invitations.findOne({ id: invitationId, fromUserId: user.id });
    if (!invite) return NextResponse.json({ error: 'Invito non trovato' }, { status: 404, headers: corsHeaders });
    await invitations.updateOne({ id: invitationId }, {
      $set: { status: 'revoked', revokedAt: new Date().toISOString() }
    });
    return NextResponse.json({ success: true, message: 'Invito revocato' }, { headers: corsHeaders });
  }

  // POST /api/connect/claim — claim profilo provvisorio
  if (path === 'connect/claim') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Devi prima registrarti o accedere' }, { status: 401, headers: corsHeaders });
    const { token } = body;
    if (!token) return NextResponse.json({ error: 'Token mancante' }, { status: 400, headers: corsHeaders });

    const provisional = await getCollection('provisional_profiles');
    const profile = await provisional.findOne({ claimToken: token });
    if (!profile) return NextResponse.json({ error: 'Profilo provvisorio non trovato' }, { status: 404, headers: corsHeaders });
    if (profile.email !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Email non corrispondente' }, { status: 403, headers: corsHeaders });
    }
    if (profile.type !== user.role) {
      return NextResponse.json({ error: `Devi avere un account ${profile.type}` }, { status: 403, headers: corsHeaders });
    }

    await provisional.updateOne({ id: profile.id }, {
      $set: { status: 'claimed', claimedBy: user.id, claimedAt: new Date().toISOString() }
    });

    // Auto-accept all pending invites for this email
    const invitations = await getCollection('invitations');
    await invitations.updateMany(
      { toEmail: profile.email, status: 'sent', expiresAt: { $gte: new Date().toISOString() } },
      { $set: { status: 'opened', openedAt: new Date().toISOString(), toUserId: user.id } }
    );

    return NextResponse.json({ success: true, message: 'Profilo rivendicato con successo', profile }, { headers: corsHeaders });
  }

  // POST /api/connect/resend — re-send email invitation
  if (path === 'connect/resend') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { invitationId } = body;
    const invitations = await getCollection('invitations');
    const invite = await invitations.findOne({ id: invitationId, fromUserId: user.id });
    if (!invite) return NextResponse.json({ error: 'Invito non trovato' }, { status: 404, headers: corsHeaders });
    if (invite.status === 'accepted' || invite.status === 'revoked') {
      return NextResponse.json({ error: 'Impossibile reinviare un invito chiuso' }, { status: 400, headers: corsHeaders });
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      const inviteLink = `${baseUrl}/connect/accept/${invite.token}`;
      await sendEmail(buildInviteEmail({
        type: invite.type, fromName: invite.fromName, toEmail: invite.toEmail,
        message: invite.message, inviteLink
      }));
      await invitations.updateOne({ id: invite.id }, {
        $set: {
          lastResentAt: new Date().toISOString(),
          status: 'sent',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        $inc: { resendCount: 1 }
      });
      return NextResponse.json({ success: true, message: 'Invito reinviato' }, { headers: corsHeaders });
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500, headers: corsHeaders });
    }
  }

  return null;
}
