import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'info@vetbuddy.it';

// Plan limits configuration
const PLAN_LIMITS = {
  starter: {
    maxUsers: 1,
    maxPatients: 50,
    automationsEnabled: false,
    automationsCount: 0,
    features: ['agenda_base', 'map_position']
  },
  pro: {
    maxUsers: 5,
    maxPatients: -1, // unlimited
    automationsEnabled: true,
    automationsCount: 20,
    features: ['agenda_base', 'map_position', 'team_inbox', 'documents', 'google_calendar', 'reports', 'automations_basic']
  },
  custom: {
    maxUsers: -1, // unlimited
    maxPatients: -1,
    automationsEnabled: true,
    automationsCount: 44,
    features: ['agenda_base', 'map_position', 'team_inbox', 'documents', 'google_calendar', 'reports', 'automations_full', 'whatsapp', 'api', 'multi_location', 'sla', 'priority_support']
  }
};

const PLAN_NAMES = {
  starter: 'Starter',
  pro: 'Pro (Pilot Milano)',
  custom: 'Custom Enterprise'
};

// PUT - Update clinic plan (admin only)
export async function PUT(request) {
  try {
    // Verify admin authorization
    const user = getUserFromRequest(request);
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, newPlan, reason } = body;

    if (!clinicId || !newPlan) {
      return NextResponse.json({ error: 'clinicId e newPlan richiesti' }, { status: 400 });
    }

    if (!PLAN_LIMITS[newPlan]) {
      return NextResponse.json({ error: 'Piano non valido. Usa: starter, pro, custom' }, { status: 400 });
    }

    const users = await getCollection('users');
    const clinic = await users.findOne({ id: clinicId, role: 'clinic' });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404 });
    }

    const oldPlan = clinic.subscriptionPlan || 'starter';
    const isUpgrade = getPlanLevel(newPlan) > getPlanLevel(oldPlan);
    const isDowngrade = getPlanLevel(newPlan) < getPlanLevel(oldPlan);

    // Update clinic plan
    await users.updateOne(
      { id: clinicId },
      {
        $set: {
          subscriptionPlan: newPlan,
          planLimits: PLAN_LIMITS[newPlan],
          planChangedAt: new Date(),
          planChangeHistory: [
            ...(clinic.planChangeHistory || []),
            {
              from: oldPlan,
              to: newPlan,
              reason: reason || null,
              changedAt: new Date(),
              changedBy: ADMIN_EMAIL
            }
          ]
        }
      }
    );

    // Send notification email to clinic
    const actionType = isUpgrade ? 'UPGRADE' : isDowngrade ? 'DOWNGRADE' : 'CAMBIO';
    await sendEmail({
      to: clinic.email,
      subject: `${actionType} Piano vetbuddy: ${PLAN_NAMES[newPlan]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🔄 ${actionType} Piano</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Ciao ${clinic.name || clinic.clinicName},</p>
            
            <p>Il tuo piano vetbuddy è stato ${isUpgrade ? 'aggiornato' : isDowngrade ? 'modificato' : 'cambiato'}:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">Piano precedente:</p>
              <p style="margin: 5px 0 15px; font-size: 18px; font-weight: bold; color: #999; text-decoration: line-through;">${PLAN_NAMES[oldPlan]}</p>
              
              <p style="margin: 0; font-size: 14px; color: #666;">Nuovo piano:</p>
              <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: ${isUpgrade ? '#10B981' : '#FF6B6B'};">${PLAN_NAMES[newPlan]}</p>
            </div>
            
            ${reason ? `<p><strong>Note:</strong> ${reason}</p>` : ''}
            
            <h3 style="color: #333;">Le tue nuove funzionalità:</h3>
            <ul style="color: #666;">
              <li>Utenti staff: ${PLAN_LIMITS[newPlan].maxUsers === -1 ? 'Illimitati' : PLAN_LIMITS[newPlan].maxUsers}</li>
              <li>Pazienti: ${PLAN_LIMITS[newPlan].maxPatients === -1 ? 'Illimitati' : PLAN_LIMITS[newPlan].maxPatients}</li>
              <li>Automazioni: ${PLAN_LIMITS[newPlan].automationsCount === 0 ? 'Non incluse' : PLAN_LIMITS[newPlan].automationsCount + ' automazioni'}</li>
            </ul>
            
            <p>Per qualsiasi domanda, contattaci a <a href="mailto:info@vetbuddy.it">info@vetbuddy.it</a>.</p>
            
            <p>Il team vetbuddy 🐾</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: `Piano ${isUpgrade ? 'aggiornato' : isDowngrade ? 'downgrade effettuato' : 'cambiato'} con successo`,
      oldPlan,
      newPlan,
      clinic: {
        id: clinic.id,
        clinicName: clinic.clinicName,
        email: clinic.email
      }
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - List all clinics with their plans (admin only)
export async function GET(request) {
  try {
    // Verify admin authorization
    const user = getUserFromRequest(request);
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const users = await getCollection('users');
    const clinics = await users.find({ role: 'clinic' }).toArray();

    const clinicList = clinics.map(c => ({
      id: c.id,
      clinicName: c.clinicName,
      email: c.email,
      phone: c.phone,
      city: c.city,
      currentPlan: c.subscriptionPlan || 'starter',
      planLimits: c.planLimits || PLAN_LIMITS.starter,
      pilotMember: c.pilotMember || false,
      createdAt: c.createdAt
    }));

    return NextResponse.json({
      clinics: clinicList,
      planOptions: Object.keys(PLAN_LIMITS).map(p => ({
        id: p,
        name: PLAN_NAMES[p],
        limits: PLAN_LIMITS[p]
      }))
    });

  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to determine plan level
function getPlanLevel(plan) {
  const levels = { starter: 1, pro: 2, custom: 3 };
  return levels[plan] || 1;
}
