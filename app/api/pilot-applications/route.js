import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

// POST - Submit a new pilot application
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      clinicName,
      email,
      phone,
      address,
      city,
      postalCode,
      vatNumber,
      website,
      staffCount,
      services,
      pilotMotivation
    } = body;

    // Validate required fields
    if (!name || !clinicName || !email || !phone || !address || !city || !vatNumber || !pilotMotivation) {
      return NextResponse.json({ 
        error: 'Tutti i campi obbligatori devono essere compilati' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Check if application already exists
    const existingApp = await db.collection('pilot_applications').findOne({ 
      $or: [{ email }, { vatNumber }] 
    });
    
    if (existingApp) {
      return NextResponse.json({ 
        error: 'Una candidatura con questa email o P.IVA esiste già' 
      }, { status: 400 });
    }

    // Create application
    const application = {
      id: uuidv4(),
      name,
      clinicName,
      email,
      phone,
      address,
      city,
      postalCode,
      vatNumber,
      website: website || null,
      staffCount: staffCount || null,
      services: services || [],
      pilotMotivation,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('pilot_applications').insertOne(application);

    // Send notification email to admin
    try {
      await sendEmail({
        to: 'info@vetbuddy.it',
        subject: `🏥 Nuova Candidatura Pilot: ${clinicName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🏥 Nuova Candidatura Pilot</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">${clinicName}</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Responsabile:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Telefono:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${phone}">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Indirizzo:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${address}, ${postalCode} ${city}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>P.IVA:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${vatNumber}</td>
                </tr>
                ${website ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Sito web:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="${website}">${website}</a></td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Staff:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${staffCount || 'Non specificato'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Servizi:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${services?.length > 0 ? services.join(', ') : 'Non specificati'}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 10px; border-left: 4px solid #FF6B6B;">
                <h3 style="margin-top: 0; color: #333;">Motivazione:</h3>
                <p style="color: #666; white-space: pre-wrap;">${pilotMotivation}</p>
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://vetbuddy.it/admin" style="background: #27AE60; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 10px;">✅ Approva</a>
                <a href="https://vetbuddy.it/admin" style="background: #E74C3C; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">❌ Rifiuta</a>
              </div>
            </div>
            <div style="padding: 15px; background: #333; border-radius: 0 0 10px 10px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">VetBuddy Pilot Milano</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: email,
        subject: `✅ Candidatura Ricevuta - VetBuddy Pilot`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">✅ Candidatura Ricevuta!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p>Ciao ${name},</p>
              <p>Grazie per aver inviato la candidatura di <strong>${clinicName}</strong> al Pilot VetBuddy!</p>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📋 Prossimi passi:</h3>
                <ol style="color: #666;">
                  <li>Il nostro team esaminerà la tua candidatura</li>
                  <li>Ti contatteremo entro <strong>48 ore lavorative</strong></li>
                  <li>Se approvato, riceverai le credenziali di accesso</li>
                  <li>Ti offriremo un onboarding personalizzato</li>
                </ol>
              </div>
              
              <p style="color: #666;">Nel frattempo, se hai domande puoi rispondere a questa email o scriverci a <a href="mailto:info@vetbuddy.it">info@vetbuddy.it</a>.</p>
              
              <p>A presto! 🐾</p>
              <p><strong>Il team VetBuddy</strong></p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Candidatura inviata con successo! Ti contatteremo entro 48 ore.',
      applicationId: application.id
    });

  } catch (error) {
    console.error('Error submitting pilot application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get all pilot applications (admin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected, all

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const query = status && status !== 'all' ? { status } : {};
    const applications = await db.collection('pilot_applications')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      applications,
      counts: {
        total: await db.collection('pilot_applications').countDocuments(),
        pending: await db.collection('pilot_applications').countDocuments({ status: 'pending' }),
        approved: await db.collection('pilot_applications').countDocuments({ status: 'approved' }),
        rejected: await db.collection('pilot_applications').countDocuments({ status: 'rejected' })
      }
    });

  } catch (error) {
    console.error('Error fetching pilot applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update application status (admin only)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'applicationId e status richiesti' }, { status: 400 });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const application = await db.collection('pilot_applications').findOne({ id: applicationId });
    if (!application) {
      return NextResponse.json({ error: 'Candidatura non trovata' }, { status: 404 });
    }

    await db.collection('pilot_applications').updateOne(
      { id: applicationId },
      { 
        $set: { 
          status, 
          notes: notes || null,
          updatedAt: new Date(),
          [`${status}At`]: new Date()
        } 
      }
    );

    // If approved, create the clinic account
    if (status === 'approved') {
      // Get the plan from request
      const plan = body.plan || 'pilot';
      
      // Define plan limits
      const planLimits = {
        starter: {
          maxUsers: 1,
          maxPatients: 50,
          automationsEnabled: false,
          automationsCount: 0,
          features: ['agenda_base', 'map_position']
        },
        pilot: {
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

      const selectedPlanLimits = planLimits[plan] || planLimits.pilot;

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const clinicUser = {
        id: uuidv4(),
        email: application.email,
        password: hashedPassword,
        name: application.name,
        role: 'clinic',
        clinicName: application.clinicName,
        phone: application.phone,
        address: application.address,
        city: application.city,
        postalCode: application.postalCode,
        vatNumber: application.vatNumber,
        website: application.website,
        staffCount: application.staffCount,
        services: application.services,
        pilotMember: true,
        pilotApprovedAt: new Date(),
        subscriptionPlan: plan,
        planLimits: selectedPlanLimits,
        createdAt: new Date()
      };

      await db.collection('users').insertOne(clinicUser);

      // Plan descriptions for email
      const planDescriptions = {
        starter: 'Piano Starter (1 utente, funzionalità base)',
        pilot: 'Piano Pilot (5 utenti, 20 automazioni, tutte le funzionalità core)',
        custom: 'Piano Custom (illimitato, 44+ automazioni, supporto prioritario)'
      };

      // Send approval email with credentials
      await sendEmail({
        to: application.email,
        subject: `🎉 Benvenuto nel Pilot VetBuddy - Piano ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #27AE60, #2ECC71); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🎉 Sei stato approvato!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p>Ciao ${application.name},</p>
              <p>Siamo felici di comunicarti che <strong>${application.clinicName}</strong> è stata approvata per il Pilot VetBuddy!</p>
              
              <div style="background: ${plan === 'custom' ? '#9333ea' : plan === 'pilot' ? '#FF6B6B' : '#6B7280'}; color: white; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px;">Il tuo piano:</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">${planDescriptions[plan]}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #27AE60;">
                <h3 style="margin-top: 0; color: #27AE60;">🔐 Le tue credenziali:</h3>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Password temporanea:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 5px;">${tempPassword}</code></p>
                <p style="color: #E74C3C; font-size: 12px;">⚠️ Cambia la password dopo il primo accesso!</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://vetbuddy.it" style="background: #FF6B6B; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">Accedi a VetBuddy →</a>
              </div>
              
              <p style="color: #666;">Ti contatteremo per l'onboarding personalizzato nei prossimi giorni.</p>
              <p>Benvenuto! 🐾</p>
            </div>
          </div>
        `
      });
    }

    // If rejected, send rejection email
    if (status === 'rejected') {
      await sendEmail({
        to: application.email,
        subject: `Aggiornamento sulla tua candidatura VetBuddy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #667eea; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Aggiornamento Candidatura</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p>Ciao ${application.name},</p>
              <p>Grazie per il tuo interesse nel Pilot VetBuddy per <strong>${application.clinicName}</strong>.</p>
              <p>Al momento non siamo in grado di procedere con l'attivazione, ma ti terremo in considerazione per future aperture.</p>
              ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ''}
              <p>Per qualsiasi domanda, scrivici a <a href="mailto:info@vetbuddy.it">info@vetbuddy.it</a>.</p>
              <p>Grazie per la comprensione.</p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({
      success: true,
      message: `Candidatura ${status === 'approved' ? 'approvata' : status === 'rejected' ? 'rifiutata' : 'aggiornata'}`
    });

  } catch (error) {
    console.error('Error updating pilot application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
