// modules/autopilot.js - Autopilot Settimanale API
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { corsHeaders } from './constants';

// ==================== AUTOPILOT GET HANDLERS ====================
export async function handleAutopilotGet(path, request) {
  
  // Get weekly recommendations
  if (path === 'autopilot/weekly-actions') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono accedere all\'autopilot' }, { status: 401, headers: corsHeaders });
    }

    try {
      const actions = await generateWeeklyActions(user.id);
      return NextResponse.json(actions, { headers: corsHeaders });
    } catch (error) {
      console.error('Error generating weekly actions:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  return null;
}

// Generate AI-powered weekly recommendations
async function generateWeeklyActions(clinicId) {
  const appointments = await getCollection('appointments');
  const owners = await getCollection('owners');
  const pets = await getCollection('pets');
  const vaccinations = await getCollection('vaccinations');

  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Find dormant clients (no appointments in last 6 months)
  const recentAppointments = await appointments.find({
    clinicId,
    date: { $gte: sixMonthsAgo.toISOString() }
  }).toArray();

  const recentOwnerIds = new Set(recentAppointments.map(a => a.ownerId));
  
  const allOwners = await owners.find({ clinicId }).toArray();
  const dormantOwners = allOwners.filter(o => !recentOwnerIds.has(o.id));

  // Find expired vaccines
  const allVaccinations = await vaccinations.find({ clinicId }).toArray();
  const expiredVaccines = allVaccinations.filter(v => {
    if (!v.nextDueDate) return false;
    const dueDate = new Date(v.nextDueDate);
    return dueDate < now && dueDate > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  });

  // Find high-value opportunities
  const recentRevenue = recentAppointments
    .filter(a => a.status === 'completed' && a.totalCost)
    .reduce((sum, a) => sum + (a.totalCost || 0), 0);

  const avgAppointmentValue = recentRevenue / Math.max(recentAppointments.length, 1);

  // Calculate potential recovery value
  const dormantValue = dormantOwners.length * avgAppointmentValue * 0.45; // 45% recovery rate
  const vaccineValue = expiredVaccines.length * 65; // avg vaccine appointment value

  const weeklyActions = [
    {
      id: 1,
      type: 'dormienti',
      priority: dormantOwners.length > 10 ? 'high' : 'medium',
      title: `Ricontatta ${dormantOwners.length} clienti dormienti`,
      description: `${dormantOwners.length} clienti non visitano da oltre 6 mesi. Ultimo valore medio: €${Math.round(avgAppointmentValue)}/cliente.`,
      estimatedValue: `€${Math.round(dormantValue)}`,
      estimatedRecovery: '40-50%',
      clients: dormantOwners.length,
      channel: 'WhatsApp + Email',
      messageReady: true,
      linkedModule: 'Predictive Client Churn',
      action: 'Avvia Campagna Riattivazione'
    },
    {
      id: 2,
      type: 'vaccini',
      priority: expiredVaccines.length > 10 ? 'high' : 'medium',
      title: `Recupera ${expiredVaccines.length} richiami vaccinali scaduti`,
      description: 'Vaccini scaduti da oltre 30 giorni. I proprietari potrebbero aver dimenticato.',
      estimatedValue: `€${Math.round(vaccineValue)}`,
      estimatedRecovery: '60-70%',
      clients: expiredVaccines.length,
      channel: 'WhatsApp',
      messageReady: true,
      linkedModule: 'Stock Vaccini',
      action: 'Invia Promemoria Vaccinazioni'
    }
  ];

  // Add more actions based on data analysis
  const pendingAppointments = await appointments.find({
    clinicId,
    status: 'pending',
    date: { $gte: now.toISOString() }
  }).toArray();

  if (pendingAppointments.length > 5) {
    weeklyActions.push({
      id: 3,
      type: 'conferma',
      priority: 'medium',
      title: `Conferma ${pendingAppointments.length} appuntamenti in sospeso`,
      description: 'Appuntamenti prenotati ma non ancora confermati dai clienti.',
      estimatedValue: `€${Math.round(pendingAppointments.length * avgAppointmentValue * 0.8)}`,
      estimatedRecovery: '80-85%',
      clients: pendingAppointments.length,
      channel: 'SMS',
      messageReady: true,
      linkedModule: 'Agenda',
      action: 'Invia Promemoria Conferma'
    });
  }

  return {
    weeklyActions,
    totalPotentialValue: Math.round(dormantValue + vaccineValue),
    generatedAt: now.toISOString(),
    period: 'questa-settimana'
  };
}
