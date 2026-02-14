import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Default working hours if clinic hasn't configured them
const DEFAULT_WORKING_HOURS = {
  monday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  friday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  saturday: { enabled: false, start: '09:00', end: '13:00', breakStart: null, breakEnd: null },
  sunday: { enabled: false, start: null, end: null, breakStart: null, breakEnd: null }
};

const DEFAULT_SLOT_DURATION = 30; // minutes

// Map day index to day name
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Generate time slots for a given date based on clinic's working hours
 */
function generateTimeSlots(date, workingHours, slotDuration = DEFAULT_SLOT_DURATION) {
  const dayName = DAY_NAMES[date.getDay()];
  const dayConfig = workingHours[dayName];
  
  if (!dayConfig || !dayConfig.enabled) {
    return [];
  }
  
  const slots = [];
  const [startHour, startMin] = dayConfig.start.split(':').map(Number);
  const [endHour, endMin] = dayConfig.end.split(':').map(Number);
  
  let breakStart = null, breakEnd = null;
  if (dayConfig.breakStart && dayConfig.breakEnd) {
    const [bsH, bsM] = dayConfig.breakStart.split(':').map(Number);
    const [beH, beM] = dayConfig.breakEnd.split(':').map(Number);
    breakStart = bsH * 60 + bsM;
    breakEnd = beH * 60 + beM;
  }
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes + slotDuration <= endMinutes) {
    // Check if slot is during break
    const slotEnd = currentMinutes + slotDuration;
    const isDuringBreak = breakStart !== null && 
      !((slotEnd <= breakStart) || (currentMinutes >= breakEnd));
    
    if (!isDuringBreak) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push({
        time: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
        available: true
      });
    }
    
    currentMinutes += slotDuration;
  }
  
  return slots;
}

/**
 * GET /api/clinics/[clinicId]/slots
 * Get available time slots for a clinic on a specific date
 * Query params: date (YYYY-MM-DD), serviceId (optional)
 */
export async function GET(request, { params }) {
  try {
    const { clinicId } = params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    
    if (!dateStr) {
      return NextResponse.json(
        { error: 'Data richiesta (date parameter)' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Formato data non valido' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Get clinic data
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: clinicId, role: 'clinic' });
    
    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinica non trovata' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Get clinic's working hours or use defaults
    const workingHours = clinic.workingHours || DEFAULT_WORKING_HOURS;
    const slotDuration = clinic.slotDuration || DEFAULT_SLOT_DURATION;
    
    // Generate all possible slots
    const slots = generateTimeSlots(date, workingHours, slotDuration);
    
    // Get existing appointments for this date
    const appointments = await getCollection('appointments');
    const existingAppointments = await appointments.find({
      clinicId,
      date: dateStr,
      status: { $nin: ['cancelled', 'rejected'] }
    }).toArray();
    
    // Mark booked slots as unavailable
    const bookedTimes = existingAppointments.map(a => a.time);
    const availableSlots = slots.map(slot => ({
      ...slot,
      available: !bookedTimes.includes(slot.time)
    }));
    
    // Get service duration if serviceId provided (affects slot selection)
    let serviceDuration = slotDuration;
    if (serviceId && clinic.servicesOffered) {
      const service = clinic.servicesOffered.find(s => s.id === serviceId);
      if (service?.duration) {
        serviceDuration = service.duration;
      }
    }
    
    return NextResponse.json({
      clinicId,
      clinicName: clinic.clinicName || clinic.name,
      date: dateStr,
      dayName: DAY_NAMES[date.getDay()],
      workingHours: workingHours[DAY_NAMES[date.getDay()]],
      slotDuration,
      serviceDuration,
      slots: availableSlots,
      totalSlots: slots.length,
      availableCount: availableSlots.filter(s => s.available).length
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error getting clinic slots:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli slot' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
