import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Default working hours if clinic hasn't configured them
const DEFAULT_SCHEDULE = {
  monday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  tuesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  wednesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  thursday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  friday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  saturday: { enabled: false, blocks: [] },
  sunday: { enabled: false, blocks: [] }
};

const DEFAULT_SLOT_DURATION = 30; // minutes

// Map day index to day name
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Generate time slots from time blocks
 */
function generateSlotsFromBlocks(blocks, slotDuration) {
  const slots = [];
  
  for (const block of blocks) {
    if (!block.start || !block.end) continue;
    
    const [startHour, startMin] = block.start.split(':').map(Number);
    const [endHour, endMin] = block.end.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    while (currentMinutes + slotDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push({
        time: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
        available: true
      });
      currentMinutes += slotDuration;
    }
  }
  
  // Sort slots by time
  slots.sort((a, b) => a.time.localeCompare(b.time));
  
  return slots;
}

/**
 * Check if a date is blocked
 */
function isDateBlocked(dateStr, blockedDates) {
  if (!blockedDates || !Array.isArray(blockedDates)) return false;
  return blockedDates.some(blocked => {
    if (typeof blocked === 'string') return blocked === dateStr;
    if (blocked.date === dateStr) return true;
    // Check date ranges
    if (blocked.startDate && blocked.endDate) {
      return dateStr >= blocked.startDate && dateStr <= blocked.endDate;
    }
    return false;
  });
}

/**
 * Get blocked slots for a specific date
 */
function getBlockedSlots(dateStr, blockedSlots) {
  if (!blockedSlots || !Array.isArray(blockedSlots)) return [];
  const blocked = blockedSlots.filter(b => b.date === dateStr);
  return blocked.map(b => b.time);
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
    
    const dayName = DAY_NAMES[date.getDay()];
    const slotDuration = clinic.slotDuration || DEFAULT_SLOT_DURATION;
    
    // Check if entire date is blocked (holidays, closures)
    if (isDateBlocked(dateStr, clinic.blockedDates)) {
      return NextResponse.json({
        clinicId,
        clinicName: clinic.clinicName || clinic.name,
        date: dateStr,
        dayName,
        blocked: true,
        blockReason: clinic.blockedDates?.find(b => b.date === dateStr || (b.startDate && dateStr >= b.startDate && dateStr <= b.endDate))?.reason || 'Clinica chiusa',
        slots: [],
        totalSlots: 0,
        availableCount: 0
      }, { headers: corsHeaders });
    }
    
    // Check for date-specific override (manual slots)
    let slots = [];
    let scheduleSource = 'default';
    
    if (clinic.dateOverrides && clinic.dateOverrides[dateStr]) {
      // Use manual slots for this specific date
      const override = clinic.dateOverrides[dateStr];
      if (override.slots && Array.isArray(override.slots)) {
        slots = override.slots.map(time => ({ time, available: true }));
        scheduleSource = 'override';
      } else if (override.blocks && Array.isArray(override.blocks)) {
        slots = generateSlotsFromBlocks(override.blocks, slotDuration);
        scheduleSource = 'override';
      }
    } else {
      // Use weekly schedule
      const schedule = clinic.weeklySchedule || DEFAULT_SCHEDULE;
      const dayConfig = schedule[dayName];
      
      if (!dayConfig || !dayConfig.enabled) {
        return NextResponse.json({
          clinicId,
          clinicName: clinic.clinicName || clinic.name,
          date: dateStr,
          dayName,
          dayEnabled: false,
          message: 'La clinica è chiusa in questo giorno',
          slots: [],
          totalSlots: 0,
          availableCount: 0
        }, { headers: corsHeaders });
      }
      
      // Generate slots from time blocks
      slots = generateSlotsFromBlocks(dayConfig.blocks || [], slotDuration);
      scheduleSource = 'weekly';
    }
    
    // Get blocked slots for this date
    const blockedSlotTimes = getBlockedSlots(dateStr, clinic.blockedSlots);
    
    // Get existing appointments for this date
    const appointments = await getCollection('appointments');
    const existingAppointments = await appointments.find({
      clinicId,
      date: dateStr,
      status: { $nin: ['cancelled', 'rejected'] }
    }).toArray();
    
    const bookedTimes = existingAppointments.map(a => a.time);
    
    // Mark booked and blocked slots as unavailable
    const availableSlots = slots.map(slot => ({
      ...slot,
      available: !bookedTimes.includes(slot.time) && !blockedSlotTimes.includes(slot.time),
      booked: bookedTimes.includes(slot.time),
      blocked: blockedSlotTimes.includes(slot.time)
    }));
    
    // Get service duration if serviceId provided
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
      dayName,
      scheduleSource,
      slotDuration,
      serviceDuration,
      slots: availableSlots,
      totalSlots: slots.length,
      availableCount: availableSlots.filter(s => s.available).length,
      acceptOnlineBooking: clinic.acceptOnlineBooking !== false,
      requireConfirmation: clinic.requireConfirmation !== false
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
