import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { runAppointmentAutomations } from './automations/appointments';
import { runHealthAutomations } from './automations/health';
import { runEngagementAutomations } from './automations/engagement';
import { runOperationsAutomations } from './automations/operations';
import { runWorkManagementAutomations } from './automations/work-management';
import { runAdvancedAutomations } from './automations/advanced';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Vercel Cron Job - Eseguito ogni giorno alle 8:00
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
      console.log('Cron job running without auth (CRON_SECRET not set)');
    }
  }

  let results = {
    promemoria: { sent: 0, errors: 0, skipped: 0 },
    richiamiVaccini: { sent: 0, errors: 0, skipped: 0 },
    followUp: { sent: 0, errors: 0, skipped: 0 },
    noShow: { marked: 0, skipped: 0 },
    documentReminders: { sent: 0, skipped: 0 },
    weeklyReports: { sent: 0, skipped: 0 },
    petBirthday: { sent: 0, errors: 0, skipped: 0 },
    reviewRequest: { sent: 0, errors: 0, skipped: 0 },
    inactiveClients: { sent: 0, errors: 0, skipped: 0 },
    antiparasitic: { sent: 0, errors: 0, skipped: 0 },
    annualCheckup: { sent: 0, errors: 0, skipped: 0 },
    appointmentConfirmation: { sent: 0, errors: 0, skipped: 0 },
    paymentReminder: { sent: 0, errors: 0, skipped: 0 },
    seasonalAlerts: { sent: 0, skipped: 0 },
    sterilization: { sent: 0, errors: 0, skipped: 0 },
    seniorPetCare: { sent: 0, errors: 0, skipped: 0 },
    microchipCheck: { sent: 0, errors: 0, skipped: 0 },
    welcomeNewPet: { sent: 0, errors: 0, skipped: 0 },
    loyaltyProgram: { sent: 0, errors: 0, skipped: 0 },
    holidayClosures: { sent: 0, skipped: 0 },
    petCondolences: { sent: 0, errors: 0, skipped: 0 },
    dailySummary: { sent: 0, errors: 0, skipped: 0 },
    staffBirthday: { sent: 0, errors: 0, skipped: 0 },
    noShowRiskPrediction: { sent: 0, errors: 0, skipped: 0, clinicAlerts: 0 },
    smartAgendaFiller: { sent: 0, errors: 0, skipped: 0 },
    noShowRecovery: { sent: 0, errors: 0, skipped: 0 },
    estimateFollowup: { sent: 0, errors: 0, skipped: 0, clinicAlerts: 0 },
    paymentEscalation: { sent: 0, errors: 0, skipped: 0, clinicAlerts: 0 },
    labDelayAlert: { sent: 0, errors: 0, skipped: 0 },
    morningBriefing: { sent: 0, errors: 0, skipped: 0 },
    bookingDropAlert: { sent: 0, errors: 0, skipped: 0 },
    expiryStockAlert: { sent: 0, errors: 0, skipped: 0 },
    healthPlanRenewal: { sent: 0, errors: 0, skipped: 0 },
    ownerBirthday: { sent: 0, errors: 0, skipped: 0 },
    therapyReminder: { sent: 0, errors: 0, skipped: 0 },
    labMonthlyReport: { sent: 0, errors: 0, skipped: 0 },
    lowStockAlert: { sent: 0, errors: 0, skipped: 0 }
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Pre-load shared data
    const allClinics = await db.collection('users').find({ role: 'clinic' }).toArray();
    const clinicsMap = new Map(allClinics.map(c => [c.id, c]));
    const allPets = await db.collection('pets').find({}).toArray();

    // Shared context for all automation modules
    const ctx = { db, clinicsMap, allClinics, allPets, today, todayStr, results, sendEmail };

    // Run all automation groups
    results = await runAppointmentAutomations(ctx);
    results = await runHealthAutomations({ ...ctx, results });
    results = await runEngagementAutomations({ ...ctx, results });
    results = await runOperationsAutomations({ ...ctx, results });
    results = await runWorkManagementAutomations({ ...ctx, results });
    results = await runAdvancedAutomations({ ...ctx, results });

    console.log('Daily cron completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Daily automation completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
