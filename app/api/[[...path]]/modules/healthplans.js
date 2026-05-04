// modules/healthplans.js - Health Plans (Piani Salute) module
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { corsHeaders } from './constants';

// ==================== GET HANDLERS ====================
export async function handleHealthPlansGet(path, request) {

  // GET /api/health-plans - List all plans for the clinic
  if (path === 'health-plans') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const plans = await getCollection('health_plans');
    const clinicPlans = await plans.find({ clinicId: user.id, isActive: true }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, plans: clinicPlans }, { headers: corsHeaders });
  }

  // GET /api/health-plans/all - List all plans including inactive
  if (path === 'health-plans/all') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const plans = await getCollection('health_plans');
    const clinicPlans = await plans.find({ clinicId: user.id }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, plans: clinicPlans }, { headers: corsHeaders });
  }

  // GET /api/health-plans/assignments - List all assignments
  if (path === 'health-plans/assignments') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const assignments = await getCollection('health_plan_assignments');
    const allAssignments = await assignments.find({ clinicId: user.id }).sort({ startDate: -1 }).toArray();

    return NextResponse.json({ success: true, assignments: allAssignments }, { headers: corsHeaders });
  }

  // GET /api/health-plans/stats - Get statistics
  if (path === 'health-plans/stats') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const plans = await getCollection('health_plans');
    const assignments = await getCollection('health_plan_assignments');

    const totalPlans = await plans.countDocuments({ clinicId: user.id, isActive: true });
    const totalAssignments = await assignments.countDocuments({ clinicId: user.id, status: 'active' });
    const completedAssignments = await assignments.countDocuments({ clinicId: user.id, status: 'completed' });

    // Get upcoming services (next 30 days)
    const activeAssignments = await assignments.find({ clinicId: user.id, status: 'active' }).toArray();
    const allPlans = await plans.find({ clinicId: user.id }).toArray();
    const plansMap = {};
    allPlans.forEach(p => { plansMap[p.id] = p; });

    let upcomingServices = 0;
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    activeAssignments.forEach(assignment => {
      const plan = plansMap[assignment.planId];
      if (!plan) return;
      const startDate = new Date(assignment.startDate);
      
      plan.services.forEach((service, idx) => {
        const completedService = (assignment.completedServices || []).find(cs => cs.serviceIndex === idx);
        if (completedService) return; // Already done
        
        const serviceDate = new Date(startDate.getTime() + (service.monthOffset || 0) * 30 * 24 * 60 * 60 * 1000);
        if (serviceDate >= now && serviceDate <= in30Days) {
          upcomingServices++;
        }
      });
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalPlans,
        totalAssignments,
        completedAssignments,
        upcomingServices
      }
    }, { headers: corsHeaders });
  }

  return null; // Not handled
}

// ==================== POST HANDLERS ====================
export async function handleHealthPlansPost(path, request, body) {

  // POST /api/health-plans - Create a new health plan
  if (path === 'health-plans') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const { name, description, targetGroup, durationMonths, services, price } = body;

    if (!name || !services || services.length === 0) {
      return NextResponse.json({ error: 'Nome e servizi sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const plans = await getCollection('health_plans');
    const newPlan = {
      id: uuidv4(),
      clinicId: user.id,
      name,
      description: description || '',
      targetGroup: targetGroup || 'tutti',
      durationMonths: durationMonths || 12,
      services: services.map((s, idx) => ({
        name: s.name,
        type: s.type || 'visita',
        monthOffset: s.monthOffset || 0,
        description: s.description || '',
        index: idx
      })),
      price: price || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await plans.insertOne(newPlan);

    return NextResponse.json({ success: true, plan: newPlan }, { status: 201, headers: corsHeaders });
  }

  // POST /api/health-plans/assign - Assign a plan to a pet
  if (path === 'health-plans/assign') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const { planId, petId, ownerId, startDate, notes } = body;

    if (!planId || !petId) {
      return NextResponse.json({ error: 'Piano e paziente sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    // Verify plan exists
    const plans = await getCollection('health_plans');
    const plan = await plans.findOne({ id: planId, clinicId: user.id });
    if (!plan) {
      return NextResponse.json({ error: 'Piano non trovato' }, { status: 404, headers: corsHeaders });
    }

    const assignments = await getCollection('health_plan_assignments');
    const newAssignment = {
      id: uuidv4(),
      planId,
      planName: plan.name,
      petId,
      ownerId: ownerId || '',
      clinicId: user.id,
      startDate: startDate || new Date().toISOString(),
      completedServices: [],
      notes: notes || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await assignments.insertOne(newAssignment);

    return NextResponse.json({ success: true, assignment: newAssignment }, { status: 201, headers: corsHeaders });
  }

  // POST /api/health-plans/complete-service - Mark a service as completed
  if (path === 'health-plans/complete-service') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const { assignmentId, serviceIndex, notes } = body;

    if (!assignmentId || serviceIndex === undefined) {
      return NextResponse.json({ error: 'Assegnazione e indice servizio obbligatori' }, { status: 400, headers: corsHeaders });
    }

    const assignments = await getCollection('health_plan_assignments');
    const assignment = await assignments.findOne({ id: assignmentId, clinicId: user.id });
    if (!assignment) {
      return NextResponse.json({ error: 'Assegnazione non trovata' }, { status: 404, headers: corsHeaders });
    }

    // Add completed service
    const completedService = {
      serviceIndex: parseInt(serviceIndex),
      completedAt: new Date().toISOString(),
      notes: notes || ''
    };

    const updatedCompleted = [...(assignment.completedServices || []), completedService];

    // Check if all services completed
    const plans = await getCollection('health_plans');
    const plan = await plans.findOne({ id: assignment.planId });
    const allDone = plan && updatedCompleted.length >= plan.services.length;

    await assignments.updateOne(
      { id: assignmentId },
      { $set: { 
        completedServices: updatedCompleted, 
        status: allDone ? 'completed' : 'active',
        updatedAt: new Date().toISOString()
      }}
    );

    return NextResponse.json({ 
      success: true, 
      completed: allDone,
      completedServices: updatedCompleted
    }, { headers: corsHeaders });
  }

  return null; // Not handled
}

// ==================== PUT HANDLERS ====================
export async function handleHealthPlansPut(path, request, user, body) {

  // PUT /api/health-plans/:id - Update a plan
  const planMatch = path.match(/^health-plans\/([^/]+)$/);
  if (planMatch) {
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const planId = planMatch[1];
    const { name, description, targetGroup, durationMonths, services, price, isActive } = body;

    const plans = await getCollection('health_plans');
    const existing = await plans.findOne({ id: planId, clinicId: user.id });
    if (!existing) {
      return NextResponse.json({ error: 'Piano non trovato' }, { status: 404, headers: corsHeaders });
    }

    const updateData = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (targetGroup !== undefined) updateData.targetGroup = targetGroup;
    if (durationMonths !== undefined) updateData.durationMonths = durationMonths;
    if (services !== undefined) updateData.services = services.map((s, idx) => ({
      name: s.name,
      type: s.type || 'visita',
      monthOffset: s.monthOffset || 0,
      description: s.description || '',
      index: idx
    }));
    if (price !== undefined) updateData.price = price;
    if (isActive !== undefined) updateData.isActive = isActive;

    await plans.updateOne({ id: planId }, { $set: updateData });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  return null; // Not handled
}

// ==================== DELETE HANDLERS ====================
export async function handleHealthPlansDelete(path, request, user) {

  // DELETE /api/health-plans/:id - Deactivate a plan
  const planMatch = path.match(/^health-plans\/([^/]+)$/);
  if (planMatch) {
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    const planId = planMatch[1];
    const plans = await getCollection('health_plans');
    
    // Soft delete - just deactivate
    await plans.updateOne(
      { id: planId, clinicId: user.id },
      { $set: { isActive: false, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  }

  return null; // Not handled
}
