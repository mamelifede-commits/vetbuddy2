import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId richiesto' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    const appointment = await db.collection('appointments').findOne({ id: appointmentId });
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }
    
    // Parse date and time
    const [year, month, day] = appointment.date.split('-');
    const [hour, minute] = (appointment.time || '09:00').split(':');
    
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
    
    // Format for ICS (YYYYMMDDTHHMMSS)
    const formatICSDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1);
    };
    
    const uid = `${appointmentId}@vetbuddy.it`;
    const now = formatICSDate(new Date());
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VetBuddy//Appointment//IT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Visita veterinaria - ${appointment.petName || 'Pet'}
DESCRIPTION:Appuntamento presso ${appointment.clinicName || 'Clinica VetBuddy'}\\nPaziente: ${appointment.petName || ''}\\nServizio: ${appointment.serviceType || 'Visita'}\\n\\nGestito con VetBuddy
LOCATION:${appointment.clinicAddress || ''}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Promemoria: Visita veterinaria tra 1 ora
END:VALARM
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Promemoria: Visita veterinaria domani
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="vetbuddy-appuntamento-${appointmentId}.ics"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating ICS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
