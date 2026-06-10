// modules/estimates.js - Preventivi Digitali API
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { corsHeaders } from './constants';
import { v4 as uuidv4 } from 'uuid';

// ==================== ESTIMATES GET HANDLERS ====================
export async function handleEstimatesGet(path, request) {
  
  // Get all estimates for a clinic
  if (path === 'estimates') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono accedere ai preventivi' }, { status: 401, headers: corsHeaders });
    }

    try {
      const data = await getClinicEstimates(user.id);
      return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
      console.error('Error getting estimates:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Get estimate by ID
  if (path.startsWith('estimates/')) {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const estimateId = path.split('/')[1];
    try {
      const estimate = await getEstimateById(estimateId, user);
      return NextResponse.json(estimate, { headers: corsHeaders });
    } catch (error) {
      console.error('Error getting estimate:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  return null;
}

// ==================== ESTIMATES POST HANDLERS ====================
export async function handleEstimatesPost(path, request, body) {
  
  // Create new estimate
  if (path === 'estimates') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono creare preventivi' }, { status: 401, headers: corsHeaders });
    }

    try {
      const estimate = await createEstimate(body, user.id);
      return NextResponse.json(estimate, { status: 201, headers: corsHeaders });
    } catch (error) {
      console.error('Error creating estimate:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Send estimate to owner
  if (path.startsWith('estimates/') && path.endsWith('/send')) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const estimateId = path.split('/')[1];
    try {
      const result = await sendEstimate(estimateId, user.id);
      return NextResponse.json(result, { headers: corsHeaders });
    } catch (error) {
      console.error('Error sending estimate:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  return null;
}

// ==================== ESTIMATES PUT HANDLERS ====================
export async function handleEstimatesPut(path, request, user, body) {
  
  // Update estimate status
  if (path.startsWith('estimates/')) {
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const estimateId = path.split('/')[1];
    try {
      const estimate = await updateEstimate(estimateId, body, user);
      return NextResponse.json(estimate, { headers: corsHeaders });
    } catch (error) {
      console.error('Error updating estimate:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  return null;
}

// Get all estimates for a clinic with analytics
async function getClinicEstimates(clinicId) {
  const estimates = await getCollection('estimates');
  const owners = await getCollection('owners');

  const allEstimates = await estimates.find({ clinicId }).toArray();
  const allOwners = await owners.find({ clinicId }).toArray();
  const ownerMap = new Map(allOwners.map(o => [o.id, o]));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Enrich estimates with owner data
  const enrichedEstimates = allEstimates.map(est => {
    const owner = ownerMap.get(est.ownerId);
    const daysSinceSent = est.sentAt ? Math.floor((now - new Date(est.sentAt)) / (24 * 60 * 60 * 1000)) : null;
    
    return {
      ...est,
      ownerName: owner?.name || 'N/A',
      ownerEmail: owner?.email || 'N/A',
      ownerPhone: owner?.phone || 'N/A',
      daysSinceSent,
      needsFollowUp: daysSinceSent > 14 && est.status === 'sent'
    };
  });

  // Calculate analytics
  const statusCount = {
    draft: allEstimates.filter(e => e.status === 'draft').length,
    sent: allEstimates.filter(e => e.status === 'sent').length,
    accepted: allEstimates.filter(e => e.status === 'accepted').length,
    declined: allEstimates.filter(e => e.status === 'declined').length,
    expired: allEstimates.filter(e => e.status === 'expired').length,
  };

  const totalValue = allEstimates.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const acceptedValue = allEstimates
    .filter(e => e.status === 'accepted')
    .reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  
  const sentEstimates = allEstimates.filter(e => e.status === 'sent' || e.status === 'accepted' || e.status === 'declined');
  const conversionRate = sentEstimates.length > 0 
    ? Math.round((statusCount.accepted / sentEstimates.length) * 100) 
    : 0;

  const pendingValue = allEstimates
    .filter(e => e.status === 'sent')
    .reduce((sum, e) => sum + (e.totalAmount || 0), 0);

  const estimatesNeedingFollowUp = enrichedEstimates.filter(e => e.needsFollowUp);

  // Recent activity (last 30 days)
  const recentEstimates = allEstimates.filter(e => 
    new Date(e.createdAt) >= thirtyDaysAgo
  );

  const last30DaysStats = {
    created: recentEstimates.length,
    sent: recentEstimates.filter(e => e.sentAt && new Date(e.sentAt) >= thirtyDaysAgo).length,
    accepted: recentEstimates.filter(e => e.acceptedAt && new Date(e.acceptedAt) >= thirtyDaysAgo).length,
    value: recentEstimates.reduce((sum, e) => sum + (e.totalAmount || 0), 0),
  };

  return {
    estimates: enrichedEstimates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    analytics: {
      totalEstimates: allEstimates.length,
      statusCount,
      totalValue: Math.round(totalValue),
      acceptedValue: Math.round(acceptedValue),
      pendingValue: Math.round(pendingValue),
      conversionRate,
      averageValue: allEstimates.length > 0 ? Math.round(totalValue / allEstimates.length) : 0,
      estimatesNeedingFollowUp: estimatesNeedingFollowUp.length,
      last30DaysStats
    },
    generatedAt: now.toISOString()
  };
}

// Get estimate by ID
async function getEstimateById(estimateId, user) {
  const estimates = await getCollection('estimates');
  const estimate = await estimates.findOne({ id: estimateId });

  if (!estimate) {
    throw new Error('Preventivo non trovato');
  }

  // Authorization check
  if (user.role === 'clinic' && estimate.clinicId !== user.id) {
    throw new Error('Non autorizzato');
  }
  if (user.role === 'owner' && estimate.ownerId !== user.id) {
    throw new Error('Non autorizzato');
  }

  return estimate;
}

// Create new estimate
async function createEstimate(data, clinicId) {
  const estimates = await getCollection('estimates');
  const owners = await getCollection('owners');
  const pets = await getCollection('pets');

  // Validate owner and pet
  const owner = await owners.findOne({ id: data.ownerId });
  if (!owner) {
    throw new Error('Proprietario non trovato');
  }

  const pet = data.petId ? await pets.findOne({ id: data.petId }) : null;

  const now = new Date().toISOString();
  const estimate = {
    id: uuidv4(),
    clinicId,
    ownerId: data.ownerId,
    petId: data.petId || null,
    petName: pet?.name || data.petName || 'N/A',
    title: data.title || 'Preventivo',
    description: data.description || '',
    items: data.items || [],
    subtotal: data.subtotal || 0,
    tax: data.tax || 0,
    discount: data.discount || 0,
    totalAmount: data.totalAmount || 0,
    notes: data.notes || '',
    validUntil: data.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    sentAt: null,
    viewedAt: null,
    acceptedAt: null,
    declinedAt: null,
  };

  await estimates.insertOne(estimate);
  return estimate;
}

// Send estimate to owner
async function sendEstimate(estimateId, clinicId) {
  const estimates = await getCollection('estimates');
  const estimate = await estimates.findOne({ id: estimateId, clinicId });

  if (!estimate) {
    throw new Error('Preventivo non trovato');
  }

  if (estimate.status !== 'draft' && estimate.status !== 'sent') {
    throw new Error('Il preventivo non può essere inviato nello stato corrente');
  }

  const now = new Date().toISOString();
  await estimates.updateOne(
    { id: estimateId },
    { 
      $set: { 
        status: 'sent',
        sentAt: estimate.sentAt || now,
        updatedAt: now
      } 
    }
  );

  // TODO: Send email/WhatsApp notification to owner
  // await sendEstimateNotification(estimate.ownerId, estimateId);

  return {
    success: true,
    message: 'Preventivo inviato con successo',
    estimateId,
    sentAt: now
  };
}

// Update estimate
async function updateEstimate(estimateId, data, user) {
  const estimates = await getCollection('estimates');
  const estimate = await estimates.findOne({ id: estimateId });

  if (!estimate) {
    throw new Error('Preventivo non trovato');
  }

  // Authorization
  if (user.role === 'clinic' && estimate.clinicId !== user.id) {
    throw new Error('Non autorizzato');
  }

  const now = new Date().toISOString();
  const updateData = { updatedAt: now };

  // Clinic can update any field
  if (user.role === 'clinic') {
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.items) updateData.items = data.items;
    if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
    if (data.tax !== undefined) updateData.tax = data.tax;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
    if (data.notes) updateData.notes = data.notes;
    if (data.validUntil) updateData.validUntil = data.validUntil;
    if (data.status) updateData.status = data.status;
  }

  // Owner can only accept/decline
  if (user.role === 'owner') {
    if (data.status === 'accepted') {
      updateData.status = 'accepted';
      updateData.acceptedAt = now;
    } else if (data.status === 'declined') {
      updateData.status = 'declined';
      updateData.declinedAt = now;
    }

    // Mark as viewed
    if (!estimate.viewedAt) {
      updateData.viewedAt = now;
    }
  }

  await estimates.updateOne(
    { id: estimateId },
    { $set: updateData }
  );

  const updatedEstimate = await estimates.findOne({ id: estimateId });
  return updatedEstimate;
}
