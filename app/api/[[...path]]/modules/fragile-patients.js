// modules/fragile-patients.js - Alert Pazienti Fragili API
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { corsHeaders } from './constants';

// Patient categories and risk assessment
const PATIENT_CATEGORIES = {
  senior: { minAge: 7, label: 'Senior (+7 anni)', icon: '👴', color: 'amber' },
  cronici: { conditions: ['insufficienza renale', 'diabete', 'cardiopatia', 'ipertiroidismo'], label: 'Patologie Croniche', icon: '💊', color: 'orange' },
  allergici: { label: 'Allergici', icon: '🤧', color: 'red' },
  terapia: { label: 'In Terapia Continuativa', icon: '💉', color: 'purple' },
  postop: { daysPostOp: 90, label: 'Post-Operatori', icon: '🩹', color: 'blue' },
  critici: { label: 'Documenti Critici', icon: '📋', color: 'pink' }
};

// ==================== FRAGILE PATIENTS GET HANDLERS ====================
export async function handleFragilePatientsGet(path, request) {
  
  // Get fragile patients list
  if (path === 'fragile-patients') {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono accedere ai pazienti fragili' }, { status: 401, headers: corsHeaders });
    }

    try {
      const data = await getFragilePatients(user.id);
      return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
      console.error('Error getting fragile patients:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  // Get patient risk score
  if (path.startsWith('fragile-patients/risk/')) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const petId = path.split('/')[2];
    try {
      const riskScore = await calculatePatientRiskScore(petId, user.id);
      return NextResponse.json(riskScore, { headers: corsHeaders });
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }

  return null;
}

// Get all fragile patients with categorization
async function getFragilePatients(clinicId) {
  const pets = await getCollection('pets');
  const owners = await getCollection('owners');
  const appointments = await getCollection('appointments');
  const vaccinations = await getCollection('vaccinations');
  const documents = await getCollection('documents');

  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  // Get all pets for this clinic
  const allPets = await pets.find({}).toArray();
  const allOwners = await owners.find({ clinicId }).toArray();
  const ownerMap = new Map(allOwners.map(o => [o.id, o]));

  // Get recent appointments for each pet
  const recentAppointments = await appointments.find({
    clinicId,
    date: { $gte: threeMonthsAgo.toISOString() }
  }).toArray();

  const appointmentsByPet = {};
  recentAppointments.forEach(apt => {
    if (!appointmentsByPet[apt.petId]) appointmentsByPet[apt.petId] = [];
    appointmentsByPet[apt.petId].push(apt);
  });

  const fragilePatients = [];
  const categoryCount = {
    senior: 0,
    cronici: 0,
    allergici: 0,
    terapia: 0,
    postop: 0,
    critici: 0
  };

  for (const pet of allPets) {
    const owner = ownerMap.get(pet.ownerId);
    if (!owner) continue;

    const categories = [];
    const conditions = [];
    const medications = [];
    let urgency = 'low';

    // Calculate age
    const birthDate = pet.birthDate ? new Date(pet.birthDate) : null;
    const age = birthDate ? Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

    // Check senior status
    if (age >= PATIENT_CATEGORIES.senior.minAge) {
      categories.push('senior');
      categoryCount.senior++;
    }

    // Check for chronic conditions (from medical history or appointments)
    const petAppointments = appointmentsByPet[pet.id] || [];
    const medicalNotes = petAppointments
      .map(a => a.notes || '')
      .join(' ')
      .toLowerCase();

    PATIENT_CATEGORIES.cronici.conditions.forEach(condition => {
      if (medicalNotes.includes(condition)) {
        if (!categories.includes('cronici')) {
          categories.push('cronici');
          categoryCount.cronici++;
        }
        conditions.push(condition);
        urgency = 'high';
      }
    });

    // Check for allergies
    if (medicalNotes.includes('allergia') || medicalNotes.includes('allergico')) {
      categories.push('allergici');
      categoryCount.allergici++;
    }

    // Check for ongoing therapy
    if (medicalNotes.includes('terapia') || medicalNotes.includes('farmaco')) {
      categories.push('terapia');
      categoryCount.terapia++;
      medications.push('Terapia continuativa');
    }

    // Check post-operative status
    const surgeryAppointments = petAppointments.filter(a => 
      (a.reason || '').toLowerCase().includes('chirurg') ||
      (a.notes || '').toLowerCase().includes('intervento')
    );
    
    if (surgeryAppointments.length > 0) {
      const lastSurgery = surgeryAppointments[0];
      const daysSinceSurgery = Math.floor((now - new Date(lastSurgery.date)) / (24 * 60 * 60 * 1000));
      
      if (daysSinceSurgery < PATIENT_CATEGORIES.postop.daysPostOp) {
        categories.push('postop');
        categoryCount.postop++;
        urgency = 'high';
      }
    }

    // Check for critical documents (missing vaccinations, expired certificates)
    const petVaccinations = await vaccinations.find({ petId: pet.id }).toArray();
    const expiredVaccines = petVaccinations.filter(v => {
      if (!v.nextDueDate) return false;
      return new Date(v.nextDueDate) < now;
    });

    if (expiredVaccines.length > 0) {
      if (!categories.includes('critici')) {
        categories.push('critici');
        categoryCount.critici++;
      }
    }

    // Only include pets that are fragile
    if (categories.length > 0) {
      // Get last and next visit
      const sortedAppointments = petAppointments.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      const lastVisit = sortedAppointments[0]?.date || null;
      const futureAppointments = await appointments.find({
        clinicId,
        petId: pet.id,
        date: { $gte: now.toISOString() }
      }).toArray();
      const nextVisit = futureAppointments.length > 0 ? futureAppointments[0].date : null;

      // Generate alerts
      const alerts = [];
      if (conditions.includes('insufficienza renale')) {
        alerts.push('Controllo creatinina urgente');
      }
      if (expiredVaccines.length > 0) {
        alerts.push(`${expiredVaccines.length} vaccino/i scaduto/i`);
      }
      if (!nextVisit && categories.includes('cronici')) {
        alerts.push('Nessun controllo programmato');
        urgency = 'high';
      }

      fragilePatients.push({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed || 'N/A',
        age,
        owner: owner.name,
        ownerId: owner.id,
        categories,
        conditions,
        medications,
        lastVisit,
        nextVisit,
        alerts,
        urgency,
        riskScore: calculateRiskScore(categories, alerts, lastVisit, nextVisit)
      });
    }
  }

  // Sort by urgency and risk score
  fragilePatients.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return b.riskScore - a.riskScore;
  });

  return {
    patients: fragilePatients,
    totalCount: fragilePatients.length,
    categoryCount,
    highUrgencyCount: fragilePatients.filter(p => p.urgency === 'high' || p.urgency === 'critical').length,
    generatedAt: now.toISOString()
  };
}

// Calculate risk score for a patient (0-100)
function calculateRiskScore(categories, alerts, lastVisit, nextVisit) {
  let score = 0;

  // Base score from categories
  score += categories.length * 10;

  // Critical conditions
  if (categories.includes('cronici')) score += 20;
  if (categories.includes('critici')) score += 15;
  if (categories.includes('postop')) score += 15;

  // Alerts
  score += alerts.length * 5;

  // No scheduled visit
  if (!nextVisit) score += 20;

  // Long time since last visit
  if (lastVisit) {
    const daysSinceVisit = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (24 * 60 * 60 * 1000));
    if (daysSinceVisit > 180) score += 15;
    else if (daysSinceVisit > 90) score += 10;
  }

  return Math.min(score, 100);
}

// Calculate detailed risk score for a specific patient
async function calculatePatientRiskScore(petId, clinicId) {
  const pets = await getCollection('pets');
  const appointments = await getCollection('appointments');
  const vaccinations = await getCollection('vaccinations');

  const pet = await pets.findOne({ id: petId });
  if (!pet) {
    throw new Error('Pet non trovato');
  }

  const now = new Date();
  const recentAppointments = await appointments.find({
    clinicId,
    petId,
    date: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString() }
  }).toArray();

  const allVaccinations = await vaccinations.find({ petId }).toArray();

  // Detailed risk factors
  const riskFactors = [];
  let totalScore = 0;

  // Age factor
  const birthDate = pet.birthDate ? new Date(pet.birthDate) : null;
  const age = birthDate ? Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
  
  if (age >= 10) {
    riskFactors.push({ factor: 'Età avanzata (10+ anni)', score: 20, impact: 'high' });
    totalScore += 20;
  } else if (age >= 7) {
    riskFactors.push({ factor: 'Età senior (7-10 anni)', score: 10, impact: 'medium' });
    totalScore += 10;
  }

  // Visit frequency
  if (recentAppointments.length === 0) {
    riskFactors.push({ factor: 'Nessuna visita nell\'ultimo anno', score: 25, impact: 'critical' });
    totalScore += 25;
  } else if (recentAppointments.length < 2) {
    riskFactors.push({ factor: 'Poche visite recenti (<2 in 12 mesi)', score: 15, impact: 'high' });
    totalScore += 15;
  }

  // Vaccinations
  const expiredVaccines = allVaccinations.filter(v => 
    v.nextDueDate && new Date(v.nextDueDate) < now
  );
  
  if (expiredVaccines.length > 0) {
    riskFactors.push({ 
      factor: `${expiredVaccines.length} vaccino/i scaduto/i`, 
      score: expiredVaccines.length * 10, 
      impact: 'high' 
    });
    totalScore += expiredVaccines.length * 10;
  }

  return {
    petId,
    petName: pet.name,
    riskScore: Math.min(totalScore, 100),
    riskLevel: totalScore >= 60 ? 'critical' : totalScore >= 40 ? 'high' : totalScore >= 20 ? 'medium' : 'low',
    riskFactors,
    recommendations: generateRecommendations(riskFactors),
    calculatedAt: now.toISOString()
  };
}

// Generate recommendations based on risk factors
function generateRecommendations(riskFactors) {
  const recommendations = [];

  riskFactors.forEach(factor => {
    if (factor.factor.includes('Età avanzata')) {
      recommendations.push('Controllo geriatrico completo consigliato');
      recommendations.push('Esami ematochimici senior panel');
    }
    if (factor.factor.includes('Nessuna visita')) {
      recommendations.push('Prenotare visita di controllo urgente');
    }
    if (factor.factor.includes('vaccino')) {
      recommendations.push('Aggiornare piano vaccinale');
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
}
