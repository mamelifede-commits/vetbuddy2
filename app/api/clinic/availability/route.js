import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Default weekly schedule with time blocks
const DEFAULT_SCHEDULE = {
  monday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  tuesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  wednesday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  thursday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  friday: { enabled: true, blocks: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  saturday: { enabled: false, blocks: [] },
  sunday: { enabled: false, blocks: [] }
};

/**
 * GET /api/clinic/availability
 * Get clinic's full availability settings
 */
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const users = await getCollection('users');
    const clinic = await users.findOne({ id: user.id });
    
    if (!clinic) {
      return NextResponse.json(
        { error: 'Clinica non trovata' },
        { status: 404, headers: corsHeaders }
      );
    }
    
    return NextResponse.json({
      // Weekly schedule with time blocks
      weeklySchedule: clinic.weeklySchedule || DEFAULT_SCHEDULE,
      
      // Slot duration in minutes
      slotDuration: clinic.slotDuration || 30,
      
      // Date-specific overrides (manual slots or blocks for specific dates)
      // Format: { "2026-02-20": { slots: ["09:00", "10:00", "14:00"] } }
      // Or: { "2026-02-20": { blocks: [{ start: "09:00", end: "12:00" }] } }
      dateOverrides: clinic.dateOverrides || {},
      
      // Blocked dates (closures, holidays)
      // Format: [{ date: "2026-02-25", reason: "Ferie" }]
      // Or: [{ startDate: "2026-08-01", endDate: "2026-08-15", reason: "Chiusura estiva" }]
      blockedDates: clinic.blockedDates || [],
      
      // Blocked individual slots
      // Format: [{ date: "2026-02-20", time: "14:00", reason: "Emergenza" }]
      blockedSlots: clinic.blockedSlots || [],
      
      // Booking settings
      acceptOnlineBooking: clinic.acceptOnlineBooking !== false,
      requireConfirmation: clinic.requireConfirmation !== false,
      maxAdvanceBookingDays: clinic.maxAdvanceBookingDays || 60,
      minAdvanceBookingHours: clinic.minAdvanceBookingHours || 2
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error getting availability:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero della disponibilità' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/clinic/availability
 * Update clinic's availability settings
 */
export async function PUT(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'clinic') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const body = await request.json();
    const { 
      weeklySchedule,
      slotDuration,
      dateOverrides,
      blockedDates,
      blockedSlots,
      acceptOnlineBooking,
      requireConfirmation,
      maxAdvanceBookingDays,
      minAdvanceBookingHours
    } = body;
    
    // Validate slot duration
    if (slotDuration && (slotDuration < 10 || slotDuration > 120)) {
      return NextResponse.json(
        { error: 'Durata slot deve essere tra 10 e 120 minuti' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate weekly schedule structure
    if (weeklySchedule) {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of validDays) {
        if (weeklySchedule[day]) {
          const dayConfig = weeklySchedule[day];
          if (dayConfig.enabled && (!dayConfig.blocks || !Array.isArray(dayConfig.blocks))) {
            return NextResponse.json(
              { error: `Configurazione non valida per ${day}` },
              { status: 400, headers: corsHeaders }
            );
          }
          // Validate time blocks
          if (dayConfig.blocks) {
            for (const block of dayConfig.blocks) {
              if (!block.start || !block.end) {
                return NextResponse.json(
                  { error: `Blocco orario incompleto per ${day}` },
                  { status: 400, headers: corsHeaders }
                );
              }
              if (block.start >= block.end) {
                return NextResponse.json(
                  { error: `Orario inizio deve essere prima di fine per ${day}` },
                  { status: 400, headers: corsHeaders }
                );
              }
            }
          }
        }
      }
    }
    
    const users = await getCollection('users');
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    if (weeklySchedule !== undefined) updateData.weeklySchedule = weeklySchedule;
    if (slotDuration !== undefined) updateData.slotDuration = slotDuration;
    if (dateOverrides !== undefined) updateData.dateOverrides = dateOverrides;
    if (blockedDates !== undefined) updateData.blockedDates = blockedDates;
    if (blockedSlots !== undefined) updateData.blockedSlots = blockedSlots;
    if (acceptOnlineBooking !== undefined) updateData.acceptOnlineBooking = acceptOnlineBooking;
    if (requireConfirmation !== undefined) updateData.requireConfirmation = requireConfirmation;
    if (maxAdvanceBookingDays !== undefined) updateData.maxAdvanceBookingDays = maxAdvanceBookingDays;
    if (minAdvanceBookingHours !== undefined) updateData.minAdvanceBookingHours = minAdvanceBookingHours;
    
    await users.updateOne(
      { id: user.id },
      { $set: updateData }
    );
    
    // Fetch updated data
    const updatedClinic = await users.findOne({ id: user.id });
    
    return NextResponse.json({
      success: true,
      message: 'Disponibilità aggiornata',
      weeklySchedule: updatedClinic.weeklySchedule || DEFAULT_SCHEDULE,
      slotDuration: updatedClinic.slotDuration || 30,
      dateOverrides: updatedClinic.dateOverrides || {},
      blockedDates: updatedClinic.blockedDates || [],
      blockedSlots: updatedClinic.blockedSlots || [],
      acceptOnlineBooking: updatedClinic.acceptOnlineBooking !== false,
      requireConfirmation: updatedClinic.requireConfirmation !== false,
      maxAdvanceBookingDays: updatedClinic.maxAdvanceBookingDays || 60,
      minAdvanceBookingHours: updatedClinic.minAdvanceBookingHours || 2
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della disponibilità' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
