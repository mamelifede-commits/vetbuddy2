// modules/data.js - Core CRUD for pets, owners, staff, documents, messages, vaccinations
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { hashPassword, getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { corsHeaders } from './constants';

export async function handleDataGet(path, request) {
  // Get documents
  if (path === 'documents') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const documents = await getCollection('documents');
    const query = user.role === 'clinic' ? { clinicId: user.id } : { ownerId: user.id };
    const list = await documents.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(list, { headers: corsHeaders });
  }

  // Get messages/inbox
  if (path === 'messages') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const messages = await getCollection('messages');
    const list = await messages.find({ $or: [{ senderId: user.id }, { receiverId: user.id }] }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(list, { headers: corsHeaders });
  }

  // Get staff
  if (path === 'staff') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const staff = await getCollection('staff');
    const list = await staff.find({ clinicId: user.id }).toArray();
    return NextResponse.json(list, { headers: corsHeaders });
  }

  // Get pets
  if (path === 'pets') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const pets = await getCollection('pets');
    if (user.role === 'owner') {
      const list = await pets.find({ ownerId: user.id }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    } else {
      const users = await getCollection('users');
      const ownersOfClinic = await users.find({ role: 'owner', clinicId: user.id }).project({ id: 1, _id: 1 }).toArray();
      const ownerIds = ownersOfClinic.map(o => o.id || o._id?.toString());
      const list = await pets.find({ $or: [{ clinicId: user.id }, { ownerId: { $in: ownerIds } }] }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }
  }

  // Get owners (for clinic)
  if (path === 'owners') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const users = await getCollection('users');
    const list = await users.find({ role: 'owner', clinicId: user.id }, { projection: { password: 0 } }).toArray();
    return NextResponse.json(list, { headers: corsHeaders });
  }

  // Get pet with full details
  if (path.startsWith('pets/') && path.split('/').length === 2) {
    const petId = path.split('/')[1];
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: petId });
    if (!pet) return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });
    
    const [appointments, documents, vaccinations] = await Promise.all([
      getCollection('appointments').then(c => c.find({ petId }).sort({ date: -1 }).toArray()),
      getCollection('documents').then(c => c.find({ petId }).sort({ createdAt: -1 }).toArray()),
      getCollection('vaccinations').then(c => c.find({ petId }).sort({ date: -1 }).toArray())
    ]);
    const totalSpent = appointments.reduce((sum, a) => sum + (a.price || 0), 0);
    const currentYear = new Date().getFullYear();
    const yearSpent = appointments.filter(a => new Date(a.date).getFullYear() === currentYear).reduce((sum, a) => sum + (a.price || 0), 0);
    
    return NextResponse.json({ ...pet, appointments, documents, vaccinations, spending: { total: totalSpent, currentYear: yearSpent } }, { headers: corsHeaders });
  }

  return null;
}

export async function handleDataPost(path, request, body) {
  // Upload document
  if (path === 'documents') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });

    const { name, type, content, fileName, petId, petName, ownerId, ownerEmail, notes, amount, sendEmail: shouldSendEmail } = body;
    const documents = await getCollection('documents');
    
    const document = {
      id: uuidv4(), name, type, content, fileName,
      petId, petName,
      clinicId: user.role === 'clinic' ? user.id : (user.clinicId || body.clinicId),
      ownerId: user.role === 'owner' ? user.id : ownerId,
      ownerEmail: ownerEmail || null, notes: notes || null,
      amount: amount ? parseFloat(amount) : null,
      status: 'bozza', createdBy: user.id,
      createdByName: user.name || user.clinicName,
      createdAt: new Date().toISOString(),
      auditLog: [{ action: 'created', by: user.id, byName: user.name || user.clinicName, at: new Date().toISOString() }]
    };
    await documents.insertOne(document);

    if (shouldSendEmail && ownerEmail) {
      try {
        const users = await getCollection('users');
        const clinic = await users.findOne({ id: document.clinicId });
        const clinicName = clinic?.clinicName || 'La tua clinica veterinaria';
        const attachments = [];
        if (content && content.startsWith('data:')) {
          const base64Data = content.split(',')[1];
          const mimeType = content.split(';')[0].split(':')[1];
          attachments.push({ filename: fileName || `${name}.pdf`, content: base64Data, type: mimeType || 'application/pdf' });
        }
        const templates = {
          prescrizione: { subject: `📋 Prescrizione per ${petName || 'il tuo animale'} – ${clinicName}`, color: '#10B981' },
          referto: { subject: `📄 Referto per ${petName || 'il tuo animale'} – ${clinicName}`, color: '#3B82F6' },
          fattura: { subject: `🧾 Fattura – ${clinicName}`, color: '#F59E0B' }
        };
        const tpl = templates[type] || { subject: `📎 Documento per ${petName || 'il tuo animale'} – ${clinicName}`, color: '#6B7280' };
        await sendEmail({
          to: ownerEmail, subject: tpl.subject,
          html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: ${tpl.color}; padding: 24px; text-align: center;"><h1 style="color: white; margin: 0;">🐾 ${clinicName}</h1></div><div style="padding: 32px;"><p>Ti inviamo il documento per <strong>${petName || 'il tuo animale'}</strong>.</p><div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;"><p style="margin: 0;"><strong>${name}</strong></p><p style="margin: 8px 0 0; color: #666; text-transform: capitalize;">${type}</p>${amount ? `<p style="margin: 8px 0 0; font-weight: bold;">Importo: €${parseFloat(amount).toFixed(2)}</p>` : ''}</div>${attachments.length > 0 ? '<p style="color: #059669;">📎 <strong>Il documento è allegato.</strong></p>' : ''}</div><div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #666;">Inviato tramite <strong>vetbuddy</strong></div></div>`,
          attachments: attachments.length > 0 ? attachments : undefined
        });
        await documents.updateOne({ id: document.id }, { $set: { status: 'inviato', lastSentAt: new Date().toISOString(), lastSentTo: ownerEmail }, $push: { auditLog: { action: 'email_sent', to: ownerEmail, at: new Date().toISOString() } } });
        document.status = 'inviato'; document.emailSent = true;
      } catch (emailError) { console.error('Error sending document email:', emailError); document.emailError = emailError.message; }
    }
    return NextResponse.json(document, { headers: corsHeaders });
  }

  // Send document via email
  if (path === 'documents/send-email') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { documentId, recipientEmail } = body;
    const documents = await getCollection('documents');
    const doc = await documents.findOne({ id: documentId });
    if (!doc) return NextResponse.json({ error: 'Documento non trovato' }, { status: 404, headers: corsHeaders });

    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.clinicId || user.id });
    const clinicName = clinic?.clinicName || 'La tua clinica veterinaria';
    const attachments = [];
    if (doc.content && doc.content.startsWith('data:')) {
      const base64Data = doc.content.split(',')[1];
      const mimeType = doc.content.split(';')[0].split(':')[1];
      attachments.push({ filename: doc.fileName || `${doc.name}.pdf`, content: base64Data, type: mimeType || 'application/pdf' });
    }
    const templates = {
      prescrizione: { subject: `📋 Prescrizione per ${doc.petName || 'il tuo animale'} - ${clinicName}`, intro: 'Ti inviamo la prescrizione.', cta: 'Segui le istruzioni. Per dubbi, contattaci.', color: '#10B981' },
      referto: { subject: `📄 Referto di ${doc.petName || 'il tuo animale'} - ${clinicName}`, intro: 'Ti inviamo il referto.', cta: 'Se hai domande, prenota un follow-up.', color: '#3B82F6' },
      fattura: { subject: `🧾 Fattura - ${clinicName}`, intro: 'Ti inviamo la fattura.', cta: 'Per info sui pagamenti, contattaci.', color: '#F59E0B' }
    };
    const template = templates[doc.type] || { subject: `📎 Documento - ${clinicName}`, intro: 'Ti inviamo un documento.', cta: '', color: '#6B7280' };

    await sendEmail({
      to: recipientEmail, subject: template.subject,
      html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: ${template.color}; padding: 24px; text-align: center;"><h1 style="color: white; margin: 0;">🐾 ${clinicName}</h1></div><div style="padding: 32px;"><p>${template.intro}</p><div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0;"><table style="width: 100%;"><tr><td style="color: #6b7280; padding-bottom: 8px;">Documento:</td><td style="font-weight: 600; text-align: right; padding-bottom: 8px;">${doc.name}</td></tr><tr><td style="color: #6b7280; padding-bottom: 8px;">Tipo:</td><td style="text-align: right; padding-bottom: 8px; text-transform: capitalize;">${doc.type || 'Documento'}</td></tr><tr><td style="color: #6b7280; padding-bottom: 8px;">Animale:</td><td style="text-align: right; padding-bottom: 8px;">${doc.petName || 'N/A'}</td></tr><tr><td style="color: #6b7280;">Data:</td><td style="text-align: right;">${new Date().toLocaleDateString('it-IT')}</td></tr>${doc.amount ? `<tr><td style="color: #6b7280; padding-top: 8px; border-top: 1px solid #e5e7eb;">Importo:</td><td style="font-weight: 700; padding-top: 8px; text-align: right; border-top: 1px solid #e5e7eb;">€${doc.amount.toFixed(2)}</td></tr>` : ''}</table></div>${attachments.length > 0 ? '<p style="color: #059669;">📎 <strong>Il documento è allegato.</strong></p>' : ''}${template.cta ? `<p style="color: #6b7280;">${template.cta}</p>` : ''}</div><div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;"><p style="color: #6b7280; font-size: 12px; margin: 0;">Inviato tramite <strong>vetbuddy</strong></p></div></div>`,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    const auditEntry = { action: 'email_sent', sentBy: user.id, sentByName: user.name || user.clinicName, sentTo: recipientEmail, sentAt: new Date().toISOString(), hasAttachment: attachments.length > 0 };
    await documents.updateOne({ id: documentId }, { $set: { status: 'inviato', lastSentAt: new Date().toISOString(), lastSentTo: recipientEmail }, $push: { auditLog: auditEntry } });
    
    const messages = await getCollection('messages');
    await messages.insertOne({ id: uuidv4(), type: 'document_sent', clinicId: user.clinicId || user.id, ownerId: doc.ownerId, documentId, subject: `${doc.type === 'prescrizione' ? 'Prescrizione' : 'Documento'} inviato`, content: `${doc.name} inviato a ${recipientEmail}`, read: true, createdAt: new Date().toISOString() });

    return NextResponse.json({ success: true, message: 'Documento inviato via email', hasAttachment: attachments.length > 0, auditEntry }, { headers: corsHeaders });
  }

  // Send message
  if (path === 'messages') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { receiverId, clinicId, clinicName, content, subject, from, type, petId, petName } = body;
    const messages = await getCollection('messages');
    const message = {
      id: uuidv4(), senderId: user.id, senderName: user.name || user.clinicName,
      receiverId: receiverId || clinicId, clinicId: clinicId || receiverId,
      clinicName: clinicName || '', subject: subject || 'Nuovo messaggio',
      content, from: from || (user.role === 'owner' ? 'owner' : 'clinic'),
      type: type || 'message', petId: petId || null, petName: petName || null,
      read: false, createdAt: new Date().toISOString()
    };
    await messages.insertOne(message);
    return NextResponse.json(message, { headers: corsHeaders });
  }

  // Add staff member
  if (path === 'staff') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { name, role, email, phone, canLogin, password } = body;
    const staff = await getCollection('staff');
    const member = {
      id: uuidv4(), clinicId: user.id, clinicName: user.clinicName,
      name, role, email, phone, canLogin: canLogin || false,
      password: canLogin && password ? hashPassword(password) : null,
      permissions: role === 'admin' ? ['documents', 'invoices', 'reports', 'payments'] : role === 'vet' ? ['visits', 'documents', 'patients', 'messages'] : role === 'assistant' ? ['visits', 'patients', 'messages'] : ['calendar', 'messages', 'owners'],
      createdAt: new Date().toISOString()
    };
    if (canLogin && email && password) {
      const users = await getCollection('users');
      const existingUser = await users.findOne({ email });
      if (existingUser) return NextResponse.json({ error: 'Email già registrata' }, { status: 400, headers: corsHeaders });
      await users.insertOne({ id: member.id, email, password: hashPassword(password), name, role: 'staff', staffRole: role, clinicId: user.id, clinicName: user.clinicName, permissions: member.permissions, mustChangePassword: true, createdAt: new Date().toISOString() });
    }
    await staff.insertOne(member);
    const { password: _, ...memberWithoutPassword } = member;
    return NextResponse.json(memberWithoutPassword, { headers: corsHeaders });
  }

  // Staff calendar color
  if (path === 'staff/calendar-color') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { staffId, colorId } = body;
    const staff = await getCollection('staff');
    await staff.updateOne({ id: staffId }, { $set: { calendarColorId: colorId } });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  // Add pet
  if (path === 'pets') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { name, species, breed, birthDate, weight, notes, ownerId, microchip, sterilized, allergies, medications } = body;
    const pets = await getCollection('pets');
    const pet = {
      id: uuidv4(), name, species, breed, birthDate, weight,
      microchip: microchip || '', sterilized: sterilized || false,
      allergies: allergies || '', medications: medications || '',
      notes: notes || '',
      ownerId: user.role === 'owner' ? user.id : ownerId,
      clinicId: user.role === 'clinic' ? user.id : body.clinicId,
      createdAt: new Date().toISOString()
    };
    await pets.insertOne(pet);
    return NextResponse.json(pet, { headers: corsHeaders });
  }

  // Register owner to clinic
  if (path === 'owners') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { email, name, phone } = body;
    const users = await getCollection('users');
    let owner = await users.findOne({ email });
    if (owner) {
      await users.updateOne({ email }, { $set: { clinicId: user.id } });
      owner = await users.findOne({ email }, { projection: { password: 0 } });
    } else {
      const tempPassword = Math.random().toString(36).slice(-8);
      owner = { id: uuidv4(), email, password: hashPassword(tempPassword), name, role: 'owner', phone: phone || '', clinicId: user.id, createdAt: new Date().toISOString() };
      await users.insertOne(owner);
      delete owner.password;
    }
    return NextResponse.json(owner, { headers: corsHeaders });
  }

  // Add vaccination
  if (path === 'vaccinations') {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    const { petId, name, date, nextDue, notes } = body;
    const vaccinations = await getCollection('vaccinations');
    const vaccination = { id: uuidv4(), petId, name, date, nextDue, notes: notes || '', createdBy: user.id, createdAt: new Date().toISOString() };
    await vaccinations.insertOne(vaccination);
    return NextResponse.json(vaccination, { headers: corsHeaders });
  }

  return null;
}

export async function handleDataPut(path, request, user, body) {
  // Mark message as read
  if (path.startsWith('messages/')) {
    const id = path.split('/')[1];
    const messages = await getCollection('messages');
    await messages.updateOne({ id }, { $set: { read: true } });
    const updated = await messages.findOne({ id });
    return NextResponse.json(updated, { headers: corsHeaders });
  }
  // Update pet
  if (path.startsWith('pets/')) {
    const id = path.split('/')[1];
    const pets = await getCollection('pets');
    await pets.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
    const updated = await pets.findOne({ id });
    return NextResponse.json(updated, { headers: corsHeaders });
  }
  return null;
}

export async function handleDataDelete(path, request, user) {
  if (path.startsWith('documents/')) {
    const id = path.split('/')[1];
    const documents = await getCollection('documents');
    await documents.deleteOne({ id });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }
  if (path.startsWith('staff/')) {
    const id = path.split('/')[1];
    const staff = await getCollection('staff');
    await staff.deleteOne({ id });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }
  if (path.startsWith('pets/')) {
    const id = path.split('/')[1];
    const pets = await getCollection('pets');
    await pets.deleteOne({ id });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }
  return null;
}
