import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to generate Google Calendar link
function generateGoogleCalendarLink(appointment) {
  const startDate = new Date(appointment.date + 'T' + appointment.time);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
  
  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Visita veterinaria - ${appointment.petName || 'Pet'}`,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: `Appuntamento presso ${appointment.clinicName || 'Clinica vetbuddy'}\nPaziente: ${appointment.petName || ''}\nServizio: ${appointment.serviceType || 'Visita'}`,
    location: appointment.clinicAddress || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Helper function to generate Apple Calendar link (ICS)
function generateICSLink(appointment) {
  const startDate = new Date(appointment.date + 'T' + appointment.time);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Return a link to generate ICS on-the-fly (would need separate endpoint)
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/ics?appointmentId=${appointment.id}`;
}

// GET - Get pending payment reminders to send
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    // Find appointments:
    // - Created more than 2 hours ago
    // - Payment status is 'pending'
    // - No payment reminder sent yet
    // - Appointment date is in the future
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const now = new Date();
    
    const pendingAppointments = await db.collection('appointments').find({
      createdAt: { $lt: twoHoursAgo },
      paymentStatus: 'pending',
      paymentReminderSent: { $ne: true },
      date: { $gt: now.toISOString().split('T')[0] }
    }).toArray();
    
    return NextResponse.json({
      success: true,
      count: pendingAppointments.length,
      appointments: pendingAppointments.map(apt => ({
        id: apt.id,
        ownerName: apt.ownerName,
        ownerPhone: apt.ownerPhone,
        petName: apt.petName,
        date: apt.date,
        time: apt.time,
        clinicName: apt.clinicName,
        amount: apt.amount || apt.price
      }))
    });
    
  } catch (error) {
    console.error('Error fetching pending payment reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Send payment reminders for pending appointments
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const now = new Date();
    
    // Find pending appointments
    const pendingAppointments = await db.collection('appointments').find({
      createdAt: { $lt: twoHoursAgo },
      paymentStatus: 'pending',
      paymentReminderSent: { $ne: true },
      date: { $gt: now.toISOString().split('T')[0] }
    }).toArray();
    
    const results = [];
    
    for (const apt of pendingAppointments) {
      if (!apt.ownerPhone) continue;
      
      try {
        // Send WhatsApp reminder
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template: 'payment_reminder',
            to: apt.ownerPhone,
            data: {
              ownerName: apt.ownerName || 'Cliente',
              petName: apt.petName || 'il tuo pet',
              date: apt.date,
              time: apt.time,
              clinicName: apt.clinicName || 'la clinica',
              amount: apt.amount || apt.price || '0',
              paymentLink: `${process.env.NEXT_PUBLIC_BASE_URL}/pay/${apt.id}`
            }
          })
        });
        
        const result = await response.json();
        
        // Mark reminder as sent
        await db.collection('appointments').updateOne(
          { id: apt.id },
          { 
            $set: { 
              paymentReminderSent: true,
              paymentReminderSentAt: new Date()
            }
          }
        );
        
        results.push({
          appointmentId: apt.id,
          success: result.success || false,
          error: result.error || null
        });
        
      } catch (err) {
        results.push({
          appointmentId: apt.id,
          success: false,
          error: err.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });
    
  } catch (error) {
    console.error('Error sending payment reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Export helper functions for use in other files
export { generateGoogleCalendarLink, generateICSLink };
