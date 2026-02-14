import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Default working hours template
const DEFAULT_WORKING_HOURS = {
  monday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  friday: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  saturday: { enabled: false, start: '09:00', end: '13:00', breakStart: null, breakEnd: null },
  sunday: { enabled: false, start: null, end: null, breakStart: null, breakEnd: null }
};

/**
 * GET /api/clinic/availability
 * Get clinic's availability settings (working hours and slot duration)
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
      workingHours: clinic.workingHours || DEFAULT_WORKING_HOURS,
      slotDuration: clinic.slotDuration || 30,
      acceptOnlineBooking: clinic.acceptOnlineBooking !== false,
      requireConfirmation: clinic.requireConfirmation !== false,
      maxAdvanceBookingDays: clinic.maxAdvanceBookingDays || 60,
      minAdvanceBookingHours: clinic.minAdvanceBookingHours || 2,
      specialClosures: clinic.specialClosures || [] // Array of dates (YYYY-MM-DD) when clinic is closed
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
      workingHours, 
      slotDuration, 
      acceptOnlineBooking,
      requireConfirmation,
      maxAdvanceBookingDays,
      minAdvanceBookingHours,
      specialClosures
    } = body;
    
    // Validate working hours structure
    if (workingHours) {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of validDays) {
        if (workingHours[day]) {
          const dayConfig = workingHours[day];
          if (dayConfig.enabled && (!dayConfig.start || !dayConfig.end)) {
            return NextResponse.json(
              { error: `Orari mancanti per ${day}` },
              { status: 400, headers: corsHeaders }
            );
          }
        }
      }
    }
    
    // Validate slot duration
    if (slotDuration && (slotDuration < 10 || slotDuration > 120)) {
      return NextResponse.json(
        { error: 'Durata slot deve essere tra 10 e 120 minuti' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const users = await getCollection('users');
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (slotDuration !== undefined) updateData.slotDuration = slotDuration;
    if (acceptOnlineBooking !== undefined) updateData.acceptOnlineBooking = acceptOnlineBooking;
    if (requireConfirmation !== undefined) updateData.requireConfirmation = requireConfirmation;
    if (maxAdvanceBookingDays !== undefined) updateData.maxAdvanceBookingDays = maxAdvanceBookingDays;
    if (minAdvanceBookingHours !== undefined) updateData.minAdvanceBookingHours = minAdvanceBookingHours;
    if (specialClosures !== undefined) updateData.specialClosures = specialClosures;
    
    await users.updateOne(
      { id: user.id },
      { $set: updateData }
    );
    
    // Fetch updated data
    const updatedClinic = await users.findOne({ id: user.id });
    
    return NextResponse.json({
      success: true,
      message: 'Disponibilità aggiornata',
      workingHours: updatedClinic.workingHours || DEFAULT_WORKING_HOURS,
      slotDuration: updatedClinic.slotDuration || 30,
      acceptOnlineBooking: updatedClinic.acceptOnlineBooking !== false,
      requireConfirmation: updatedClinic.requireConfirmation !== false,
      maxAdvanceBookingDays: updatedClinic.maxAdvanceBookingDays || 60,
      minAdvanceBookingHours: updatedClinic.minAdvanceBookingHours || 2,
      specialClosures: updatedClinic.specialClosures || []
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
