// modules/admin.js - Admin Dashboard API endpoints (Advanced Lab Management)
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { hashPassword, getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { corsHeaders } from './constants';

// Helper: verify admin role
function verifyAdmin(request) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}

// ==================== ADMIN GET HANDLERS ====================
export async function handleAdminGet(path, request) {
    // Get all users (admin only)
    if (path === 'admin/users') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      const users = await getCollection('users');
      const list = await users.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all appointments (admin only)
    if (path === 'admin/appointments') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      const appointments = await getCollection('appointments');
      const list = await appointments.find({}).sort({ date: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all pets (admin only)
    if (path === 'admin/pets') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      const pets = await getCollection('pets');
      const list = await pets.find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all documents (admin only)
    if (path === 'admin/documents') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      const documents = await getCollection('documents');
      const list = await documents.find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Admin: List all labs (enriched with stats)
    if (path === 'admin/labs') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      const users = await getCollection('users');
      const labs = await users.find({ role: 'lab' }, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
      
      // Enrich with request stats
      const labRequests = await getCollection('lab_requests');
      const labReports = await getCollection('lab_reports');
      const connections = await getCollection('clinic_lab_connections');
      
      const enrichedLabs = await Promise.all(labs.map(async (lab) => {
        const totalRequests = await labRequests.countDocuments({ labId: lab.id });
        const pendingRequests = await labRequests.countDocuments({ labId: lab.id, status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
        const completedRequests = await labRequests.countDocuments({ labId: lab.id, status: 'completed' });
        const totalReports = await labReports.countDocuments({ labId: lab.id });
        const totalConnections = await connections.countDocuments({ labId: lab.id, status: 'active' });
        const pendingConnections = await connections.countDocuments({ labId: lab.id, status: 'pending' });
        
        // Billing status
        const now = new Date();
        const freeUntil = lab.freeUntil ? new Date(lab.freeUntil) : null;
        const requestsCount = lab.requestsCount || 0;
        const maxFreeRequests = lab.maxFreeRequests || 50;
        const trialExpired = freeUntil ? now > freeUntil : false;
        const requestsExhausted = requestsCount >= maxFreeRequests;
        const daysRemaining = freeUntil && !trialExpired ? Math.max(0, Math.ceil((freeUntil - now) / (1000*60*60*24))) : 0;
        
        return {
          ...lab,
          stats: { totalRequests, pendingRequests, completedRequests, totalReports, totalConnections, pendingConnections },
          billing: {
            plan: lab.plan || 'partner_free',
            freeUntil: lab.freeUntil || null,
            requestsCount,
            maxFreeRequests,
            trialExpired,
            requestsExhausted,
            daysRemaining,
            requestsRemaining: Math.max(0, maxFreeRequests - requestsCount)
          }
        };
      }));
      
      return NextResponse.json(enrichedLabs, { headers: corsHeaders });
    }

    // Admin: Lab requests overview
    if (path === 'admin/lab-requests') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      const labRequests = await getCollection('lab_requests');
      const requests = await labRequests.find({}).sort({ createdAt: -1 }).limit(100).toArray();
      
      const total = await labRequests.countDocuments({});
      const pending = await labRequests.countDocuments({ status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
      const reportReady = await labRequests.countDocuments({ status: 'report_ready' });
      const completed = await labRequests.countDocuments({ status: 'completed' });
      
      return NextResponse.json({ requests, stats: { total, pending, reportReady, completed } }, { headers: corsHeaders });
    }

    // Admin: Detailed single lab view
    if (path.match(/^admin\/labs\/[^/]+\/details$/)) {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      
      const labId = path.split('/')[2];
      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId, role: 'lab' }, { projection: { password: 0 } });
      
      if (!lab) {
        return NextResponse.json({ error: 'Laboratorio non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      // Get connections with clinic info
      const connectionsCol = await getCollection('clinic_lab_connections');
      const connections = await connectionsCol.find({ labId }).sort({ createdAt: -1 }).toArray();
      const enrichedConnections = await Promise.all(connections.map(async (conn) => {
        const clinic = await users.findOne({ id: conn.clinicId }, { projection: { password: 0 } });
        return {
          ...conn,
          clinicName: clinic?.clinicName || clinic?.name || 'N/D',
          clinicEmail: clinic?.email || '',
          clinicCity: clinic?.city || ''
        };
      }));
      
      // Get price list
      const labPriceList = await getCollection('lab_price_list');
      const priceList = await labPriceList.find({ labId }).sort({ examType: 1 }).toArray();
      
      // Get request stats and recent requests
      const labRequests = await getCollection('lab_requests');
      const totalRequests = await labRequests.countDocuments({ labId });
      const pendingRequests = await labRequests.countDocuments({ labId, status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
      const completedRequests = await labRequests.countDocuments({ labId, status: 'completed' });
      const recentRequests = await labRequests.find({ labId }).sort({ createdAt: -1 }).limit(20).toArray();
      
      // Enrich recent requests with pet/clinic info
      const pets = await getCollection('pets');
      const enrichedRequests = await Promise.all(recentRequests.map(async (req) => {
        const pet = await pets.findOne({ id: req.petId });
        const clinic = await users.findOne({ id: req.clinicId });
        return {
          ...req,
          petName: pet?.name || 'N/D',
          clinicName: clinic?.clinicName || clinic?.name || 'N/D'
        };
      }));
      
      // Get reports count
      const labReports = await getCollection('lab_reports');
      const totalReports = await labReports.countDocuments({ labId });
      
      // Get integration settings
      const labIntegrations = await getCollection('lab_integrations');
      const integration = await labIntegrations.findOne({ labId });
      
      // Billing info
      const now = new Date();
      const freeUntil = lab.freeUntil ? new Date(lab.freeUntil) : null;
      const requestsCount = lab.requestsCount || 0;
      const maxFreeRequests = lab.maxFreeRequests || 50;
      const trialExpired = freeUntil ? now > freeUntil : false;
      const requestsExhausted = requestsCount >= maxFreeRequests;
      
      return NextResponse.json({
        lab,
        connections: enrichedConnections,
        priceList,
        stats: { totalRequests, pendingRequests, completedRequests, totalReports },
        recentRequests: enrichedRequests,
        integration: integration || null,
        billing: {
          plan: lab.plan || 'partner_free',
          freeUntil: lab.freeUntil || null,
          requestsCount,
          maxFreeRequests,
          trialExpired,
          requestsExhausted,
          daysRemaining: freeUntil && !trialExpired ? Math.max(0, Math.ceil((freeUntil - now) / (1000*60*60*24))) : 0,
          requestsRemaining: Math.max(0, maxFreeRequests - requestsCount),
          createdAt: lab.createdAt
        }
      }, { headers: corsHeaders });
    }

    // Admin: Lab ecosystem statistics
    if (path === 'admin/lab-stats') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      
      const users = await getCollection('users');
      const labRequests = await getCollection('lab_requests');
      const labReports = await getCollection('lab_reports');
      const connections = await getCollection('clinic_lab_connections');
      const labPriceList = await getCollection('lab_price_list');
      
      // Lab counts by status
      const allLabs = await users.find({ role: 'lab' }, { projection: { password: 0 } }).toArray();
      const activeLabs = allLabs.filter(l => l.status === 'active' || l.isApproved === true);
      const pendingLabs = allLabs.filter(l => l.status === 'pending_approval');
      const suspendedLabs = allLabs.filter(l => l.status === 'suspended');
      const rejectedLabs = allLabs.filter(l => l.status === 'rejected');
      
      // Billing stats
      const now = new Date();
      const labsInTrial = allLabs.filter(l => {
        const freeUntil = l.freeUntil ? new Date(l.freeUntil) : null;
        return freeUntil && now < freeUntil && (l.requestsCount || 0) < (l.maxFreeRequests || 50);
      });
      const labsTrialExpiring = allLabs.filter(l => {
        const freeUntil = l.freeUntil ? new Date(l.freeUntil) : null;
        if (!freeUntil || now > freeUntil) return false;
        const daysLeft = Math.ceil((freeUntil - now) / (1000*60*60*24));
        return daysLeft <= 30;
      });
      const labsRequestsNearLimit = allLabs.filter(l => {
        const remaining = (l.maxFreeRequests || 50) - (l.requestsCount || 0);
        return remaining > 0 && remaining <= 10;
      });
      
      // Request stats
      const totalRequests = await labRequests.countDocuments({});
      const pendingRequestsCount = await labRequests.countDocuments({ status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
      const completedRequestsCount = await labRequests.countDocuments({ status: 'completed' });
      const reportReadyCount = await labRequests.countDocuments({ status: 'report_ready' });
      const cancelledCount = await labRequests.countDocuments({ status: 'cancelled' });
      
      // Connection stats
      const activeConnections = await connections.countDocuments({ status: 'active' });
      const pendingConnectionsCount = await connections.countDocuments({ status: 'pending' });
      
      // Reports stats
      const totalReportsCount = await labReports.countDocuments({});
      const reportsVisibleToOwner = await labReports.countDocuments({ visibleToOwner: true });
      const reportsPendingReview = await labReports.countDocuments({ visibleToOwner: false });
      
      // Top labs by requests
      const topLabsByRequests = await Promise.all(
        allLabs
          .sort((a, b) => (b.requestsCount || 0) - (a.requestsCount || 0))
          .slice(0, 5)
          .map(async (lab) => {
            const total = await labRequests.countDocuments({ labId: lab.id });
            const completed = await labRequests.countDocuments({ labId: lab.id, status: 'completed' });
            const connCount = await connections.countDocuments({ labId: lab.id, status: 'active' });
            return {
              id: lab.id,
              labName: lab.labName || lab.name,
              city: lab.city || '',
              totalRequests: total,
              completedRequests: completed,
              connections: connCount
            };
          })
      );
      
      // Recent activity (last 7 days registrations)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentRegistrations = allLabs.filter(l => new Date(l.createdAt) > sevenDaysAgo);
      
      // Requests by exam type
      const requestsByExamType = await labRequests.aggregate([
        { $group: { _id: '$examType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();
      
      return NextResponse.json({
        labs: {
          total: allLabs.length,
          active: activeLabs.length,
          pending: pendingLabs.length,
          suspended: suspendedLabs.length,
          rejected: rejectedLabs.length,
          recentRegistrations: recentRegistrations.length
        },
        billing: {
          inTrial: labsInTrial.length,
          trialExpiringSoon: labsTrialExpiring.length,
          requestsNearLimit: labsRequestsNearLimit.length
        },
        requests: {
          total: totalRequests,
          pending: pendingRequestsCount,
          completed: completedRequestsCount,
          reportReady: reportReadyCount,
          cancelled: cancelledCount
        },
        connections: {
          active: activeConnections,
          pending: pendingConnectionsCount
        },
        reports: {
          total: totalReportsCount,
          visibleToOwner: reportsVisibleToOwner,
          pendingReview: reportsPendingReview
        },
        topLabs: topLabsByRequests,
        requestsByExamType: requestsByExamType.map(r => ({ examType: r._id, count: r.count })),
        pendingLabs: pendingLabs.map(l => ({
          id: l.id, labName: l.labName || l.name, email: l.email, city: l.city || '',
          phone: l.phone || '', vatNumber: l.vatNumber || '',
          contactPerson: l.contactPerson || '', specializations: l.specializations || [],
          createdAt: l.createdAt
        }))
      }, { headers: corsHeaders });
    }

    // Get admin dashboard stats
    if (path === 'admin/stats') {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      const appointments = await getCollection('appointments');
      const documents = await getCollection('documents');
      
      const allUsers = await users.find({}, { projection: { password: 0 } }).toArray();
      const clinics = allUsers.filter(u => u.role === 'clinic');
      const owners = allUsers.filter(u => u.role === 'owner');
      
      const totalPets = await pets.countDocuments({});
      const totalAppointments = await appointments.countDocuments({});
      const totalDocuments = await documents.countDocuments({});
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = allUsers.filter(u => new Date(u.createdAt) > sevenDaysAgo);
      
      const appointmentStats = await appointments.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray();
      
      const recentAppointments = await appointments.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      
      return NextResponse.json({
        counts: {
          totalUsers: allUsers.length,
          clinics: clinics.length,
          owners: owners.length,
          pets: totalPets,
          appointments: totalAppointments,
          documents: totalDocuments
        },
        recentRegistrations: recentUsers.length,
        appointmentsByStatus: appointmentStats,
        recentAppointments,
        recentUsers: allUsers.slice(0, 10)
      }, { headers: corsHeaders });
    }

  return null;
}

// ==================== ADMIN POST HANDLERS ====================
export async function handleAdminPost(path, request, body) {
    // Admin: Update lab billing settings
    if (path.match(/^admin\/labs\/[^/]+\/billing$/)) {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      
      const labId = path.split('/')[2];
      const { extendTrialDays, maxFreeRequests, resetRequestsCount, plan } = body;
      
      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId, role: 'lab' });
      
      if (!lab) {
        return NextResponse.json({ error: 'Laboratorio non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      const updateData = { updatedAt: new Date().toISOString() };
      
      // Extend trial period
      if (extendTrialDays && extendTrialDays > 0) {
        const currentFreeUntil = lab.freeUntil ? new Date(lab.freeUntil) : new Date();
        const baseDate = currentFreeUntil > new Date() ? currentFreeUntil : new Date();
        updateData.freeUntil = new Date(baseDate.getTime() + extendTrialDays * 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Update max free requests
      if (maxFreeRequests !== undefined && maxFreeRequests >= 0) {
        updateData.maxFreeRequests = maxFreeRequests;
      }
      
      // Reset requests count
      if (resetRequestsCount === true) {
        updateData.requestsCount = 0;
      }
      
      // Update plan
      if (plan) {
        updateData.plan = plan;
      }
      
      await users.updateOne({ id: labId }, { $set: updateData });
      
      const updatedLab = await users.findOne({ id: labId }, { projection: { password: 0 } });
      
      // Notify lab about billing changes
      if (lab.email && (extendTrialDays || resetRequestsCount)) {
        try {
          await sendEmail({
            to: lab.email,
            subject: '📋 Aggiornamento piano - VetBuddy',
            html: `
              <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #7C3AED;">📋 Aggiornamento Piano VetBuddy</h2>
                <p>Ciao <strong>${lab.labName || lab.name}</strong>,</p>
                <p>Il team VetBuddy ha aggiornato le condizioni del tuo piano:</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  ${extendTrialDays ? `<p>✅ Periodo di prova esteso di <strong>${extendTrialDays} giorni</strong></p>` : ''}
                  ${maxFreeRequests !== undefined ? `<p>✅ Limite richieste gratuite: <strong>${maxFreeRequests}</strong></p>` : ''}
                  ${resetRequestsCount ? `<p>✅ Conteggio richieste azzerato</p>` : ''}
                </div>
                <p style="color: #6B7280; font-size: 14px;">Per qualsiasi domanda, contatta il supporto VetBuddy.</p>
              </div>`
          });
        } catch (e) { console.error('Billing update email error:', e); }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Impostazioni billing aggiornate',
        lab: updatedLab
      }, { headers: corsHeaders });
    }

  return null;
}

// ==================== ADMIN DELETE HANDLERS ====================
export async function handleAdminDelete(path, request) {
    // Delete user (admin only)
    if (path.match(/^admin\/users\/[^/]+$/)) {
      const user = verifyAdmin(request);
      if (!user) return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      
      const id = path.split('/')[2];
      const users = await getCollection('users');
      const targetUser = await users.findOne({ id });
      
      if (!targetUser) {
        return NextResponse.json({ error: 'Utente non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      if (targetUser.role === 'admin') {
        return NextResponse.json({ error: 'Non è possibile eliminare un admin' }, { status: 400, headers: corsHeaders });
      }
      
      await users.deleteOne({ id });
      
      // Also delete related data
      const pets = await getCollection('pets');
      const appointments = await getCollection('appointments');
      const documents = await getCollection('documents');
      await pets.deleteMany({ ownerId: id });
      await appointments.deleteMany({ $or: [{ ownerId: id }, { clinicId: id }] });
      await documents.deleteMany({ $or: [{ ownerId: id }, { clinicId: id }] });
      
      // If lab, also clean up lab-specific data
      if (targetUser.role === 'lab') {
        const labRequests = await getCollection('lab_requests');
        const labReports = await getCollection('lab_reports');
        const connections = await getCollection('clinic_lab_connections');
        const labPriceList = await getCollection('lab_price_list');
        const labIntegrations = await getCollection('lab_integrations');
        
        await connections.deleteMany({ labId: id });
        await labPriceList.deleteMany({ labId: id });
        await labIntegrations.deleteMany({ labId: id });
      }
      
      return NextResponse.json({ success: true, message: 'Utente eliminato' }, { headers: corsHeaders });
    }

  return null;
}
