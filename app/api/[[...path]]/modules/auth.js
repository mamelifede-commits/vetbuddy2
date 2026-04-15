// modules/auth.js - Authentication & Authorization endpoints
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_SCOPES, STARTER_AUTOMATIONS, PRO_AUTOMATIONS, corsHeaders } from './constants';

// ==================== AUTH GET HANDLERS ====================
export async function handleAuthGet(path, request) {
    // Google Calendar OAuth - Start authorization
    if (path === 'auth/google') {
      const { searchParams } = new URL(request.url);
      const clinicId = searchParams.get('clinicId');
      
      if (!clinicId) {
        return NextResponse.json({ error: 'clinicId richiesto' }, { status: 400, headers: corsHeaders });
      }
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(GOOGLE_SCOPES)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${clinicId}`;
      
      return NextResponse.json({ authUrl }, { headers: corsHeaders });
    }

    // Google Calendar OAuth - Callback
    if (path === 'auth/google/callback') {
      const { searchParams } = new URL(request.url);
      const code = searchParams.get('code');
      const clinicId = searchParams.get('state');
      const error = searchParams.get('error');
      
      if (error) {
        // Redirect back to homepage with error (SPA handles routing)
        return NextResponse.redirect(new URL(`/?google_error=${error}`, process.env.NEXT_PUBLIC_BASE_URL));
      }
      
      if (!code || !clinicId) {
        return NextResponse.redirect(new URL('/?google_error=missing_params', process.env.NEXT_PUBLIC_BASE_URL));
      }
      
      try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: GOOGLE_REDIRECT_URI
          })
        });
        
        const tokens = await tokenResponse.json();
        
        if (tokens.error) {
          console.error('Google OAuth error:', tokens);
          return NextResponse.redirect(new URL(`/?google_error=${tokens.error}`, process.env.NEXT_PUBLIC_BASE_URL));
        }
        
        // Get calendar info
        const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        });
        const calendarInfo = await calendarResponse.json();
        
        // Save tokens to clinic
        const users = await getCollection('users');
        await users.updateOne(
          { id: clinicId },
          { 
            $set: { 
              googleCalendar: {
                connected: true,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
                calendarId: calendarInfo.id || 'primary',
                calendarName: calendarInfo.summary || 'Calendario principale',
                connectedAt: new Date().toISOString(),
                lastSync: null
              }
            }
          }
        );
        
        // Redirect back to homepage with success (SPA handles routing)
        return NextResponse.redirect(new URL('/?google_success=true', process.env.NEXT_PUBLIC_BASE_URL));
      } catch (err) {
        console.error('Google OAuth callback error:', err);
        return NextResponse.redirect(new URL('/?google_error=token_exchange_failed', process.env.NEXT_PUBLIC_BASE_URL));
      }
    }

    // Get Google Calendar status
    if (path === 'google-calendar/status') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.clinicId || user.id });
      
      if (!clinic?.googleCalendar?.connected) {
        return NextResponse.json({ connected: false }, { headers: corsHeaders });
      }
      
      return NextResponse.json({
        connected: true,
        calendarName: clinic.googleCalendar.calendarName,
        connectedAt: clinic.googleCalendar.connectedAt,
        lastSync: clinic.googleCalendar.lastSync
      }, { headers: corsHeaders });
    }

    // Get staff colors
    if (path === 'staff-colors') {
      return NextResponse.json(STAFF_COLORS, { headers: corsHeaders });
    }

    // ==================== GET AUTOMATIONS SETTINGS ====================
    if (path === 'automations/settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      // Get clinic's plan
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.id });
      const clinicPlan = clinic?.subscriptionPlan || clinic?.plan || 'starter';

      // Determine allowed automations based on plan
      let allowedAutomations;
      let automationsCount;
      
      if (clinicPlan === 'custom' || clinicPlan === 'enterprise') {
        allowedAutomations = 'all';
        automationsCount = 44;
      } else if (clinicPlan === 'pro') {
        allowedAutomations = PRO_AUTOMATIONS;
        automationsCount = PRO_AUTOMATIONS.length;
      } else {
        // Starter plan - include basic automations
        allowedAutomations = STARTER_AUTOMATIONS;
        automationsCount = STARTER_AUTOMATIONS.length;
      }

      // Get saved settings
      const automationSettings = await getCollection('automation_settings');
      const savedSettings = await automationSettings.findOne({ clinicId: user.id });

      // Build default settings based on plan
      const defaultSettings = {
        // All automations with default ON for allowed ones
        appointmentReminders: true, bookingConfirmation: true, vaccineRecalls: true, postVisitFollowup: true,
        noShowDetection: true, waitlistNotification: true, suggestedSlots: true, documentReminders: true,
        autoTicketAssignment: true, aiQuickReplies: true, urgencyNotifications: true, weeklyReport: true,
        petBirthday: true, reviewRequest: true, inactiveClientReactivation: true,
        antiparasiticReminder: true, annualCheckup: true, medicationRefill: true, weightAlert: true, dentalHygiene: true,
        appointmentConfirmation: true, labResultsReady: true, paymentReminder: true, postSurgeryFollowup: true,
        summerHeatAlert: true, tickSeasonAlert: true, newYearFireworksAlert: true,
        whatsappReminders: false, smsEmergency: false,
        sterilizationReminder: true, seniorPetCare: true, microchipCheck: true, welcomeNewPet: true,
        aiLabExplanation: true, breedRiskAlert: true, dietSuggestions: true,
        loyaltyProgram: true, referralProgram: true, holidayClosures: true,
        petCondolences: true, griefFollowup: true,
        dailySummary: true, lowStockAlert: true, staffBirthday: true
      };

      // Merge saved settings with defaults
      const mergedSettings = { ...defaultSettings, ...(savedSettings?.settings || {}) };

      return NextResponse.json({ 
        success: true, 
        settings: mergedSettings,
        plan: clinicPlan,
        allowedAutomations,
        automationsCount,
        starterAutomations: STARTER_AUTOMATIONS
      }, { headers: corsHeaders });
    }

    // Get current user
    if (path === 'auth/me') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const userData = await users.findOne({ id: user.id }, { projection: { password: 0 } });
      return NextResponse.json(userData, { headers: corsHeaders });
    }

  return null;
}

// ==================== AUTH POST HANDLERS ====================
export async function handleAuthPost(path, request, body) {
    // Register
    if (path === 'auth/register') {
      const { email, password, name, role, clinicName, phone, address, city, vatNumber, website, latitude, longitude, services } = body;
      if (!email || !password || !name || !role) {
        return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400, headers: corsHeaders });
      }
      
      const users = await getCollection('users');
      const existing = await users.findOne({ email });
      if (existing) {
        return NextResponse.json({ error: 'Email già registrata' }, { status: 400, headers: corsHeaders });
      }

      // Generate verification tokens
      const emailVerificationToken = uuidv4();
      const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // OTP valid for 10 minutes

      const user = {
        id: uuidv4(),
        email,
        password: hashPassword(password),
        name,
        role, // 'clinic' or 'owner'
        clinicName: role === 'clinic' ? clinicName : null,
        phone: phone || '',
        address: address || '',
        city: city || '',
        vatNumber: role === 'clinic' ? (vatNumber || '') : null,
        website: role === 'clinic' ? (website || '') : null,
        latitude: role === 'clinic' ? (latitude || null) : null,
        longitude: role === 'clinic' ? (longitude || null) : null,
        services: role === 'clinic' ? (services || []) : null, // Array of service IDs
        createdAt: new Date().toISOString(),
        // Verification fields
        emailVerified: false,
        phoneVerified: false,
        emailVerificationToken,
        phoneOTP,
        phoneOTPExpiry: otpExpiry
      };

      await users.insertOne(user);
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      const { password: _, emailVerificationToken: __, phoneOTP: ___, ...userWithoutPassword } = user;
      
      // Invia email di VERIFICA (non più solo benvenuto)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      const verifyEmailUrl = `${baseUrl}?verify_email=${emailVerificationToken}`;
      
      try {
        if (role === 'owner') {
          // Email di VERIFICA per proprietari
          await sendEmail({
            to: email,
            subject: '📧 Verifica la tua email - vetbuddy',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">Ciao ${name}! 👋</h2>
                  <p style="color: #666; font-size: 16px;">Grazie per esserti iscritto a vetbuddy! Per completare la registrazione, verifica la tua email cliccando il pulsante qui sotto:</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyEmailUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 16px 32px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 18px;">
                      ✅ Verifica Email
                    </a>
                  </div>
                  
                  <div style="background: #E8F5E9; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                    <p style="color: #2E7D32; margin: 0; font-size: 14px;">
                      <strong>✅ Un solo click:</strong> Dopo aver cliccato il pulsante, il tuo account sarà attivo e potrai accedere subito!
                    </p>
                  </div>
                  
                  <p style="color: #999; font-size: 12px; text-align: center;">Se non hai creato tu questo account, ignora questa email.</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                </div>
              </div>
            `
          });
        } else if (role === 'clinic') {
          // Email di VERIFICA per cliniche nel Pilot
          await sendEmail({
            to: email,
            subject: '📧 Verifica la tua email - vetbuddy Pilot',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Pilot Milano</p>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">Ciao ${clinicName || name}! 👋</h2>
                  <p style="color: #666; font-size: 16px;">Grazie per esserti candidato al Pilot vetbuddy! Per completare la registrazione, verifica la tua email:</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyEmailUrl}" style="display: inline-block; background: #4CAF50; color: white; padding: 16px 32px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 18px;">
                      ✅ Verifica Email
                    </a>
                  </div>
                  
                  <div style="background: #E8F5E9; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                    <p style="color: #2E7D32; margin: 0; font-size: 14px;">
                      <strong>✅ Un solo click:</strong> Dopo aver cliccato il pulsante, il tuo account sarà attivo e potrai accedere subito!
                    </p>
                  </div>
                  
                  <p style="color: #999; font-size: 12px; text-align: center;">Se non hai creato tu questo account, ignora questa email.</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                </div>
              </div>
            `
          });
          
          // Notifica anche l'admin di una nuova clinica
          await sendEmail({
            to: 'info@vetbuddy.it',
            subject: `🏥 Nuova clinica registrata: ${clinicName || name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>🎉 Nuova Clinica nel Pilot!</h2>
                <p><strong>Nome:</strong> ${clinicName || name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefono:</strong> ${phone || 'Non specificato'}</p>
                <p><strong>Città:</strong> ${city || 'Non specificata'}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}</p>
                <a href="${baseUrl}/admin" style="display: inline-block; background: #FF6B6B; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 15px;">Vai all'Admin Panel</a>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Non bloccare la registrazione se l'email fallisce
      }
      
      return NextResponse.json({ 
        user: userWithoutPassword, 
        token,
        requiresVerification: true,
        message: 'Registrazione completata! Controlla la tua email per verificare l\'account.'
      }, { headers: corsHeaders });
    }

    // Email Verification endpoint
    if (path === 'auth/verify-email') {
      const { token: verifyToken } = body;
      if (!verifyToken) {
        return NextResponse.json({ error: 'Token di verifica mancante' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ emailVerificationToken: verifyToken });
      
      if (!user) {
        return NextResponse.json({ error: 'Token non valido o già utilizzato' }, { status: 400, headers: corsHeaders });
      }

      if (user.emailVerified) {
        return NextResponse.json({ success: true, message: 'Email già verificata', alreadyVerified: true }, { headers: corsHeaders });
      }

      // Verify email - account is now fully verified (no phone verification needed)
      await users.updateOne(
        { id: user.id },
        { 
          $set: { 
            emailVerified: true, 
            emailVerifiedAt: new Date().toISOString(),
            phoneVerified: true // Auto-verify phone since we're not requiring SMS
          },
          $unset: { emailVerificationToken: '', phoneOTP: '', phoneOTPExpiry: '' }
        }
      );

      // Send welcome email now that email is verified
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      try {
        await sendEmail({
          to: user.email,
          subject: '🎉 Account verificato - Benvenuto in vetbuddy!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Account verificato! 🎉</h2>
                <p style="color: #666; font-size: 16px;">Ciao ${user.name}, il tuo account è ora attivo!</p>
                
                <div style="background: #D4EDDA; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28A745;">
                  <p style="color: #155724; margin: 0;">
                    ✅ Email verificata<br/>
                    ✅ Account attivo
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold;">
                    🚀 Inizia a usare vetbuddy
                  </a>
                </div>
              </div>
              <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
              </div>
            </div>
          `
        });
      } catch (e) {
        console.error('Error sending welcome email:', e);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Email verificata! Il tuo account è ora attivo. Puoi effettuare il login.',
        emailVerified: true,
        fullyVerified: true,
        requiresPhoneVerification: false
      }, { headers: corsHeaders });
    }

    // Phone OTP Verification endpoint
    if (path === 'auth/verify-phone') {
      const { userId, otp } = body;
      if (!userId || !otp) {
        return NextResponse.json({ error: 'User ID e OTP sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ id: userId });
      
      if (!user) {
        return NextResponse.json({ error: 'Utente non trovato' }, { status: 404, headers: corsHeaders });
      }

      if (user.phoneVerified) {
        return NextResponse.json({ success: true, message: 'Telefono già verificato', alreadyVerified: true }, { headers: corsHeaders });
      }

      // Check OTP
      if (user.phoneOTP !== otp) {
        return NextResponse.json({ error: 'Codice OTP non valido' }, { status: 400, headers: corsHeaders });
      }

      // Check OTP expiry
      if (new Date(user.phoneOTPExpiry) < new Date()) {
        return NextResponse.json({ error: 'Codice OTP scaduto. Richiedi un nuovo codice.' }, { status: 400, headers: corsHeaders });
      }

      // Verify phone
      await users.updateOne(
        { id: user.id },
        { 
          $set: { phoneVerified: true, phoneVerifiedAt: new Date().toISOString() },
          $unset: { phoneOTP: '', phoneOTPExpiry: '' }
        }
      );

      // Send welcome email now that both are verified
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      try {
        await sendEmail({
          to: user.email,
          subject: '🎉 Account verificato - Benvenuto in vetbuddy!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Account verificato! 🎉</h2>
                <p style="color: #666; font-size: 16px;">Ciao ${user.name}, il tuo account è ora completamente attivo!</p>
                
                <div style="background: #D4EDDA; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28A745;">
                  <p style="color: #155724; margin: 0;">
                    ✅ Email verificata<br/>
                    ✅ Telefono verificato
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold;">
                    🚀 Inizia a usare vetbuddy
                  </a>
                </div>
              </div>
              <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
              </div>
            </div>
          `
        });
      } catch (e) {
        console.error('Error sending welcome email:', e);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Telefono verificato! Il tuo account è ora attivo.',
        phoneVerified: true,
        fullyVerified: true
      }, { headers: corsHeaders });
    }

    // Resend OTP endpoint
    if (path === 'auth/resend-otp') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: 'User ID obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ id: userId });
      
      if (!user) {
        return NextResponse.json({ error: 'Utente non trovato' }, { status: 404, headers: corsHeaders });
      }

      if (!user.phone) {
        return NextResponse.json({ error: 'Nessun numero di telefono registrato' }, { status: 400, headers: corsHeaders });
      }

      if (user.phoneVerified) {
        return NextResponse.json({ success: true, message: 'Telefono già verificato', alreadyVerified: true }, { headers: corsHeaders });
      }

      // Generate new OTP
      const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      await users.updateOne(
        { id: user.id },
        { $set: { phoneOTP, phoneOTPExpiry: otpExpiry } }
      );

      // Send OTP via SMS
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        await fetch(`${baseUrl}/api/sms/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.phone,
            message: `vetbuddy - Il tuo nuovo codice OTP è: ${phoneOTP}. Scade tra 10 minuti.`
          })
        });
      } catch (smsError) {
        console.error('Error resending SMS OTP:', smsError);
        return NextResponse.json({ error: 'Errore invio OTP. Riprova.' }, { status: 500, headers: corsHeaders });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Nuovo codice OTP inviato via SMS.'
      }, { headers: corsHeaders });
    }

    // Password Reset Request
    if (path === 'auth/forgot-password') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email richiesta' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ email });
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({ success: true, message: 'Se l\'email esiste, riceverai un link per reimpostare la password.' }, { headers: corsHeaders });
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      
      await users.updateOne({ email }, { $set: { resetToken, resetExpiry } });

      // Send email with proper error handling
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}?reset=${resetToken}`;
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: 'vetbuddy - Reimposta la tua password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #FF6B6B;">🐾 vetbuddy</h2>
              <p>Hai richiesto di reimpostare la tua password.</p>
              <p>Clicca il link qui sotto per creare una nuova password:</p>
              <a href="${resetLink}" style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reimposta Password</a>
              <p style="color: #666; font-size: 14px;">Il link scadrà tra 1 ora.</p>
              <p style="color: #666; font-size: 14px;">Se non hai richiesto questo reset, ignora questa email.</p>
            </div>
          `
        });
        console.log('Password reset email result for', email, ':', emailResult);
        
        if (!emailResult.success) {
          console.error('Failed to send password reset email to', email, ':', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
      }

      return NextResponse.json({ success: true, message: 'Se l\'email esiste, riceverai un link per reimpostare la password.' }, { headers: corsHeaders });
    }

    // Password Reset Confirm
    if (path === 'auth/reset-password') {
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token e nuova password richiesti' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const user = await users.findOne({ resetToken: token });
      
      if (!user || new Date(user.resetExpiry) < new Date()) {
        return NextResponse.json({ error: 'Token non valido o scaduto' }, { status: 400, headers: corsHeaders });
      }

      await users.updateOne(
        { resetToken: token },
        { $set: { password: hashPassword(newPassword) }, $unset: { resetToken: '', resetExpiry: '' } }
      );

      return NextResponse.json({ success: true, message: 'Password aggiornata con successo' }, { headers: corsHeaders });
    }

    // Change password (for logged in users, including first-time staff)
    if (path === 'auth/change-password') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { currentPassword, newPassword } = body;
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'La nuova password deve avere almeno 6 caratteri' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const userData = await users.findOne({ id: user.id });

      // For first-time login (mustChangePassword), currentPassword is optional
      if (!userData.mustChangePassword && currentPassword) {
        if (!comparePassword(currentPassword, userData.password)) {
          return NextResponse.json({ error: 'Password attuale non corretta' }, { status: 400, headers: corsHeaders });
        }
      }

      await users.updateOne(
        { id: user.id },
        { $set: { password: hashPassword(newPassword), mustChangePassword: false, updatedAt: new Date().toISOString() } }
      );

      // Also update staff record if exists
      const staff = await getCollection('staff');
      await staff.updateOne({ id: user.id }, { $set: { mustChangePassword: false } });

      return NextResponse.json({ success: true, message: 'Password aggiornata' }, { headers: corsHeaders });
    }

    // Update staff permissions (clinic only)
    if (path.startsWith('staff/') && path.endsWith('/permissions')) {
      const staffId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { permissions } = body;
      const staff = await getCollection('staff');
      const users = await getCollection('users');

      await staff.updateOne({ id: staffId, clinicId: user.id }, { $set: { permissions, updatedAt: new Date().toISOString() } });
      await users.updateOne({ id: staffId }, { $set: { permissions, updatedAt: new Date().toISOString() } });

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete staff member
    if (path.startsWith('staff/') && !path.includes('/permissions')) {
      const staffId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const staff = await getCollection('staff');
      const users = await getCollection('users');

      await staff.deleteOne({ id: staffId, clinicId: user.id });
      await users.deleteOne({ id: staffId });

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Export data as CSV
    if (path === 'export/invoices') {
      const user = getUserFromRequest(request);
      if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const clinicId = user.role === 'staff' ? user.clinicId : user.id;
      const documents = await getCollection('documents');
      const invoices = await documents.find({ clinicId, type: 'fattura' }).sort({ createdAt: -1 }).toArray();

      // Generate CSV
      const headers = ['ID', 'Titolo', 'Cliente', 'Importo', 'Data', 'Stato', 'Email Inviata'];
      const rows = invoices.map(inv => [
        inv.id,
        inv.name || '',
        inv.ownerEmail || '',
        inv.amount || 0,
        inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
        inv.emailSent ? 'Inviata' : 'Bozza',
        inv.emailSent ? 'Sì' : 'No'
      ].map(v => `"${v}"`).join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      
      return new NextResponse(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="fatture.csv"'
        }
      });
    }

    // ==================== AUTOMATIONS SETTINGS ====================
    // Save automation settings
    if (path === 'automations/settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { key, enabled } = body;
      
      // Get clinic's plan to check automation limits
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.id });
      
      if (!clinic) {
        return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
      }

      // Define automation limits by plan - USE GLOBAL CONSTANTS
      const PLAN_AUTOMATION_LIMITS = {
        starter: { count: STARTER_AUTOMATIONS.length, allowed: STARTER_AUTOMATIONS },
        pro: { count: PRO_AUTOMATIONS.length, allowed: PRO_AUTOMATIONS },
        custom: { count: 44, allowed: 'all' },
        enterprise: { count: 44, allowed: 'all' }
      };

      const clinicPlan = clinic.subscriptionPlan || clinic.plan || 'starter';
      const planLimits = PLAN_AUTOMATION_LIMITS[clinicPlan] || PLAN_AUTOMATION_LIMITS.starter;

      // Check if this automation is allowed for the plan
      if (planLimits.allowed !== 'all' && !planLimits.allowed.includes(key)) {
        return NextResponse.json({ 
          error: `Questa automazione non è inclusa nel piano ${clinicPlan}. Effettua l'upgrade per sbloccarla.`,
          planRequired: planLimits.allowed === 'all' ? clinicPlan : 'pro'
        }, { status: 403, headers: corsHeaders });
      }

      // Save the setting
      const automationSettings = await getCollection('automation_settings');
      await automationSettings.updateOne(
        { clinicId: user.id },
        { 
          $set: { 
            [`settings.${key}`]: enabled,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: { clinicId: user.id, createdAt: new Date().toISOString() }
        },
        { upsert: true }
      );

      return NextResponse.json({ success: true, key, enabled }, { headers: corsHeaders });
    }

    // Login
    if (path === 'auth/login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email e password richiesti' }, { status: 400, headers: corsHeaders });
      }
      
      // Special admin reset - remove this after setup!
      if (email === 'info@vetbuddy.it' && password === 'vetbuddy2025!') {
        const users = await getCollection('users');
        const admin = await users.findOne({ email: 'info@vetbuddy.it' });
        if (!admin) {
          // Create admin
          const newAdmin = {
            id: uuidv4(),
            email: 'info@vetbuddy.it',
            password: hashPassword('vetbuddy2025!'),
            name: 'Admin vetbuddy',
            role: 'admin',
            createdAt: new Date().toISOString()
          };
          await users.insertOne(newAdmin);
          const token = generateToken({ id: newAdmin.id, email: newAdmin.email, role: 'admin' });
          return NextResponse.json({ user: { ...newAdmin, password: undefined }, token }, { headers: corsHeaders });
        } else {
          // Update password
          await users.updateOne({ email: 'info@vetbuddy.it' }, { $set: { password: hashPassword('vetbuddy2025!'), role: 'admin' } });
          const token = generateToken({ id: admin.id, email: admin.email, role: 'admin' });
          return NextResponse.json({ user: { ...admin, password: undefined }, token }, { headers: corsHeaders });
        }
      }

      const users = await getCollection('users');
      const user = await users.findOne({ email });
      if (!user || !comparePassword(password, user.password)) {
        return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401, headers: corsHeaders });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      const { password: _, ...userWithoutPassword } = user;
      
      // Add billing info for lab users
      if (user.role === 'lab') {
        const now = new Date();
        const freeUntil = user.freeUntil ? new Date(user.freeUntil) : null;
        const requestsCount = user.requestsCount || 0;
        const maxFreeRequests = user.maxFreeRequests || 50;
        const trialExpired = freeUntil ? now > freeUntil : false;
        const requestsExhausted = requestsCount >= maxFreeRequests;
        const billingActive = trialExpired || requestsExhausted;
        
        userWithoutPassword.billing = {
          plan: user.plan || 'partner_free',
          freeUntil: user.freeUntil || null,
          requestsCount,
          maxFreeRequests,
          trialExpired,
          requestsExhausted,
          billingActive, // true = trial ended, should show upgrade banner
          daysRemaining: freeUntil && !trialExpired ? Math.max(0, Math.ceil((freeUntil - now) / (1000*60*60*24))) : 0,
          requestsRemaining: Math.max(0, maxFreeRequests - requestsCount)
        };
      }
      
      return NextResponse.json({ user: userWithoutPassword, token }, { headers: corsHeaders });
    }

  return null;
}
