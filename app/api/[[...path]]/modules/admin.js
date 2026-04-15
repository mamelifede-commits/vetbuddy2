// modules/admin.js - Admin Dashboard API endpoints
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { hashPassword, getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { corsHeaders } from './constants';

// ==================== ADMIN GET HANDLERS ====================
export async function handleAdminGet(path, request) {
    // ==================== ADMIN API ====================
    // Get all users (admin only)
    if (path === 'admin/users') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const list = await users.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all appointments (admin only)
    if (path === 'admin/appointments') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const appointments = await getCollection('appointments');
      const list = await appointments.find({}).sort({ date: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all pets (admin only)
    if (path === 'admin/pets') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const pets = await getCollection('pets');
      const list = await pets.find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all documents (admin only)
    if (path === 'admin/documents') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const documents = await getCollection('documents');
      const list = await documents.find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Admin: List all labs
    if (path === 'admin/labs') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const labs = await users.find({ role: 'lab' }, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
      
      // Enrich with request stats
      const labRequests = await getCollection('lab_requests');
      const labReports = await getCollection('lab_reports');
      
      const enrichedLabs = await Promise.all(labs.map(async (lab) => {
        const totalRequests = await labRequests.countDocuments({ labId: lab.id });
        const pendingRequests = await labRequests.countDocuments({ labId: lab.id, status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
        const completedRequests = await labRequests.countDocuments({ labId: lab.id, status: 'completed' });
        const totalReports = await labReports.countDocuments({ labId: lab.id });
        
        return {
          ...lab,
          stats: { totalRequests, pendingRequests, completedRequests, totalReports }
        };
      }));
      
      return NextResponse.json(enrichedLabs, { headers: corsHeaders });
    }

    // Admin: Lab requests overview
    if (path === 'admin/lab-requests') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const labRequests = await getCollection('lab_requests');
      const requests = await labRequests.find({}).sort({ createdAt: -1 }).limit(50).toArray();
      
      // Get stats
      const total = await labRequests.countDocuments({});
      const pending = await labRequests.countDocuments({ status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
      const reportReady = await labRequests.countDocuments({ status: 'report_ready' });
      const completed = await labRequests.countDocuments({ status: 'completed' });
      
      return NextResponse.json({ requests, stats: { total, pending, reportReady, completed } }, { headers: corsHeaders });
    }

    // Get admin dashboard stats
    if (path === 'admin/stats') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      const appointments = await getCollection('appointments');
      const documents = await getCollection('documents');
      
      // Count by role
      const allUsers = await users.find({}, { projection: { password: 0 } }).toArray();
      const clinics = allUsers.filter(u => u.role === 'clinic');
      const owners = allUsers.filter(u => u.role === 'owner');
      
      // Count totals
      const totalPets = await pets.countDocuments({});
      const totalAppointments = await appointments.countDocuments({});
      const totalDocuments = await documents.countDocuments({});
      
      // Recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = allUsers.filter(u => new Date(u.createdAt) > sevenDaysAgo);
      
      // Appointments by status
      const appointmentStats = await appointments.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray();
      
      // Recent appointments
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
    // ==================== END ADMIN API ====================

  return null;
}

// ==================== ADMIN POST HANDLERS ====================
export async function handleAdminPost(path, request, body) {
    if (path.startsWith('admin/users/')) {
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const id = path.split('/')[2];
      const users = await getCollection('users');
      await users.deleteOne({ id });
      // Also delete related data
      const pets = await getCollection('pets');
      const appointments = await getCollection('appointments');
      const documents = await getCollection('documents');
      await pets.deleteMany({ ownerId: id });
      await appointments.deleteMany({ $or: [{ ownerId: id }, { clinicId: id }] });
      await documents.deleteMany({ $or: [{ ownerId: id }, { clinicId: id }] });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete appointment

  return null;
}
