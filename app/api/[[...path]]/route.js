import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import Stripe from 'stripe';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'missing_stripe_key');

// Google OAuth Config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/google/callback';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

// Staff colors for calendar
const STAFF_COLORS = [
  { id: 1, name: 'Blu', hex: '#3B82F6', google: '1' },
  { id: 2, name: 'Verde', hex: '#10B981', google: '2' },
  { id: 3, name: 'Viola', hex: '#8B5CF6', google: '3' },
  { id: 4, name: 'Rosso', hex: '#EF4444', google: '4' },
  { id: 5, name: 'Giallo', hex: '#F59E0B', google: '5' },
  { id: 6, name: 'Arancione', hex: '#F97316', google: '6' },
  { id: 7, name: 'Turchese', hex: '#06B6D4', google: '7' },
  { id: 8, name: 'Grigio', hex: '#6B7280', google: '8' },
  { id: 9, name: 'Rosa', hex: '#EC4899', google: '9' },
  { id: 10, name: 'Indaco', hex: '#6366F1', google: '10' }
];

// Subscription Plans (prices in EUR)
const SUBSCRIPTION_PLANS = {
  starter: { name: 'Starter', price: 0.00, description: 'Per iniziare' },
  pro: { name: 'Pro', price: 129.00, description: 'Per automatizzare' },
  enterprise: { name: 'Enterprise', price: 299.00, description: 'Per gruppi e catene' }
};

// Automazioni incluse nel piano Starter (gratuite ma essenziali)
const STARTER_AUTOMATIONS = [
  'appointmentReminders',    // Promemoria appuntamenti 24h prima
  'bookingConfirmation',     // Conferma prenotazione
  'welcomeNewPet',           // Benvenuto nuovo pet
  'petBirthday',             // Compleanno pet (fidelizzazione)
  'appointmentConfirmation'  // Conferma appuntamento
];

// Automazioni incluse nel piano Pro (tutto di Starter + avanzate)
const PRO_AUTOMATIONS = [
  ...STARTER_AUTOMATIONS,
  'vaccineRecalls', 'postVisitFollowup', 'noShowDetection', 'waitlistNotification',
  'suggestedSlots', 'documentReminders', 'autoTicketAssignment', 'urgencyNotifications',
  'weeklyReport', 'reviewRequest', 'inactiveClientReactivation', 'antiparasiticReminder',
  'annualCheckup', 'labResultsReady', 'paymentReminder', 'postSurgeryFollowup'
];

// Veterinary Services Catalog
const VETERINARY_SERVICES = {
  video_consulto: {
    name: 'Video Consulto',
    icon: 'Video',
    services: [
      { id: 'consulenza_online', name: 'Consulenza Online', description: 'Consulenza a distanza per triage, dubbi, follow-up e interpretazione referti', type: 'online', duration: 20 },
      { id: 'follow_up_online', name: 'Follow-up Online', description: 'Controllo post-visita o post-intervento in videochiamata', type: 'online', duration: 15 },
      { id: 'interpretazione_referti', name: 'Interpretazione Referti', description: 'Spiegazione e discussione di esami e analisi', type: 'online', duration: 15 },
      { id: 'consulto_comportamentale', name: 'Consulto Comportamentale', description: 'Valutazione iniziale problemi comportamentali', type: 'online', duration: 30 },
      { id: 'seconda_opinione', name: 'Seconda Opinione', description: 'Valutazione caso clinico per secondo parere', type: 'online', duration: 25 }
    ]
  },
  visite_generali: {
    name: 'Visite Generali',
    icon: 'Stethoscope',
    services: [
      { id: 'visita_clinica', name: 'Visita Clinica Generale', description: 'Controllo stato di salute, peso, parassiti e piano vaccinale' },
      { id: 'vaccini', name: 'Vaccinazioni', description: 'Piano vaccinale completo per cani e gatti' },
      { id: 'check_up', name: 'Check-up Preventivo', description: 'Controllo generale periodico dello stato di salute' },
      { id: 'visita_preanestesia', name: 'Visita Pre-anestesiologica', description: 'Valutazione del rischio prima di interventi chirurgici' }
    ]
  },
  visite_specialistiche: {
    name: 'Visite Specialistiche',
    icon: 'UserCog',
    services: [
      { id: 'cardiologia', name: 'Cardiologia', description: 'ECG, ecocardiografia e patologie cardiache' },
      { id: 'dermatologia', name: 'Dermatologia', description: 'Problemi della pelle, allergie e parassiti cutanei' },
      { id: 'oculistica', name: 'Oculistica', description: 'Patologie oculari e problemi alla vista' },
      { id: 'ortopedia', name: 'Ortopedia', description: 'Problemi muscolo-scheletrici e articolari' },
      { id: 'oncologia', name: 'Oncologia', description: 'Diagnosi e trattamento tumori e neoplasie' },
      { id: 'riproduzione', name: 'Riproduzione e Neonatologia', description: 'Gravidanza, parto e cura dei cuccioli' },
      { id: 'neurologia', name: 'Neurologia', description: 'Patologie del sistema nervoso' },
      { id: 'esotici', name: 'Animali Esotici', description: 'Cura di rettili, uccelli e piccoli mammiferi' }
    ]
  },
  chirurgia: {
    name: 'Chirurgia',
    icon: 'Scissors',
    services: [
      { id: 'sterilizzazione', name: 'Sterilizzazione', description: 'Ovariectomie, ovarioisterectomie e castrazioni' },
      { id: 'tessuti_molli', name: 'Chirurgia Tessuti Molli', description: 'Rimozione masse, chirurgia gastrointestinale, cistotomie' },
      { id: 'ortopedica', name: 'Chirurgia Ortopedica', description: 'Fratture, lussazioni, rottura legamento crociato' },
      { id: 'odontoiatria', name: 'Odontoiatria Veterinaria', description: 'Detartrasi, estrazioni e cure dentali' },
      { id: 'urgenze', name: 'Chirurgia d\'Urgenza', description: 'Torsioni gastriche, traumi, emorragie' },
      { id: 'oculistica_chir', name: 'Chirurgia Oculistica', description: 'Correzione entropion, ectropion e cataratta' }
    ]
  },
  diagnostica: {
    name: 'Diagnostica',
    icon: 'Search',
    services: [
      { id: 'radiografia', name: 'Radiografia (RX)', description: 'Immagini diagnostiche con raggi X' },
      { id: 'ecografia', name: 'Ecografia', description: 'Diagnostica ad ultrasuoni addominale e cardiaca' },
      { id: 'esami_sangue', name: 'Esami del Sangue', description: 'Emocromo, biochimico e profili specifici' },
      { id: 'esami_urine', name: 'Esami Urine', description: 'Analisi completa delle urine' },
      { id: 'tac', name: 'TAC', description: 'Tomografia computerizzata' },
      { id: 'risonanza', name: 'Risonanza Magnetica (RM)', description: 'Imaging avanzato per tessuti molli' },
      { id: 'endoscopia', name: 'Endoscopia', description: 'Esplorazione visiva di organi interni' }
    ]
  },
  altri_servizi: {
    name: 'Altri Servizi',
    icon: 'Plus',
    services: [
      { id: 'pronto_soccorso', name: 'Pronto Soccorso 24h', description: 'Emergenze veterinarie h24' },
      { id: 'degenza', name: 'Degenza e Ricovero', description: 'Ospedalizzazione e osservazione' },
      { id: 'terapia_intensiva', name: 'Terapia Intensiva', description: 'Cure intensive per casi critici' },
      { id: 'igiene_orale', name: 'Igiene Orale', description: 'Pulizia dentale professionale e ablazione tartaro' },
      { id: 'microchip', name: 'Microchip e Anagrafe', description: 'Inserimento microchip e registrazione' },
      { id: 'pet_passport', name: 'Passaporto e Certificati', description: 'Documenti per viaggi e certificazioni sanitarie' }
    ]
  }
};

// ==================== LAB EXAM TYPES ====================
const LAB_EXAM_TYPES = {
  istologia: {
    id: 'istologia',
    name: 'Esami Istologici e Citologici',
    icon: 'Microscope',
    exams: [
      { id: 'biopsia', name: 'Esame Istologico (Biopsia)', description: 'Analisi di frammenti di tessuto per diagnosi di neoplasie' },
      { id: 'citologia_avanzata', name: 'Citologia Avanzata', description: 'Analisi cellulari da masse o versamenti' }
    ]
  },
  infettive: {
    id: 'infettive',
    name: 'Malattie Infettive e Sierologia',
    icon: 'Bug',
    exams: [
      { id: 'pcr', name: 'PCR (Test Molecolare)', description: 'Rilevamento DNA/RNA patogeni (Leishmania, Ehrlichia, Parvovirus)' },
      { id: 'titolazione_anticorpale', name: 'Titolazione Anticorpale', description: 'Misurazione livelli anticorpi (IFAT/ELISA)' },
      { id: 'screening_infettive', name: 'Screening Malattie Infettive', description: 'FIV/FeLV, Toxoplasma e altre' }
    ]
  },
  endocrinologia: {
    id: 'endocrinologia',
    name: 'Endocrinologia ed Esami Ormonali',
    icon: 'Activity',
    exams: [
      { id: 'tiroide', name: 'Profilo Tiroideo', description: 'T4 totale, T4 libero, TSH' },
      { id: 'surrene', name: 'Profilo Surrenalico', description: 'Cortisolo, test ACTH, soppressione desametasone' },
      { id: 'progesterone', name: 'Dosaggio Progesterone', description: 'Per gestione riproduzione' }
    ]
  },
  microbiologia: {
    id: 'microbiologia',
    name: 'Microbiologia e Parassitologia',
    icon: 'Beaker',
    exams: [
      { id: 'batteriologico', name: 'Esame Batteriologico + Antibiogramma', description: 'Coltura e sensibilità antibiotici' },
      { id: 'micologico', name: 'Esame Micologico', description: 'Ricerca funghi e dermatofiti' },
      { id: 'parassitologico', name: 'Esami Parassitologici', description: 'Ricerca parassiti specifici' }
    ]
  },
  ematologia: {
    id: 'ematologia',
    name: 'Profili Biochimici ed Ematologici Avanzati',
    icon: 'Droplet',
    exams: [
      { id: 'elettroforesi', name: 'Elettroforesi Sierica', description: 'Valutazione frazioni proteiche' },
      { id: 'profilo_geriatrico', name: 'Profilo Geriatrico/Patologico', description: 'Biochimica completa 20-25 parametri' },
      { id: 'coagulazione', name: 'Pannello Coagulazione', description: 'PT, PTT, fibrinogeno' }
    ]
  }
};

// Lab request statuses
const LAB_REQUEST_STATUSES = [
  { id: 'pending', name: 'Richiesta Inviata', color: 'yellow', icon: 'Clock' },
  { id: 'received', name: 'Richiesta Ricevuta', color: 'blue', icon: 'CheckCircle' },
  { id: 'sample_waiting', name: 'Campione in Attesa', color: 'orange', icon: 'Package' },
  { id: 'sample_received', name: 'Campione Ricevuto', color: 'indigo', icon: 'PackageCheck' },
  { id: 'in_progress', name: 'Analisi in Corso', color: 'purple', icon: 'Loader' },
  { id: 'report_ready', name: 'Referto Pronto', color: 'green', icon: 'FileCheck' },
  { id: 'completed', name: 'Completata', color: 'emerald', icon: 'CheckCircle2' },
  { id: 'cancelled', name: 'Annullata', color: 'red', icon: 'XCircle' }
];

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Route handler
export async function GET(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    // Health check
    if (path === 'health') {
      return NextResponse.json({ status: 'ok', app: 'vetbuddy API' }, { headers: corsHeaders });
    }

    // Get veterinary services catalog
    if (path === 'services') {
      return NextResponse.json(VETERINARY_SERVICES, { headers: corsHeaders });
    }

    // Get all service IDs as flat list
    if (path === 'services/flat') {
      const flatServices = [];
      Object.entries(VETERINARY_SERVICES).forEach(([categoryId, category]) => {
        category.services.forEach(service => {
          flatServices.push({
            ...service,
            categoryId,
            categoryName: category.name
          });
        });
      });
      return NextResponse.json(flatServices, { headers: corsHeaders });
    }

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

    // ==================== ADMIN API ====================
    // Get all users (admin only)
    if (path === 'admin/users') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const list = await users.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all appointments (admin only)
    if (path === 'admin/appointments') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const appointments = await getCollection('appointments');
      const list = await appointments.find({}).sort({ date: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all pets (admin only)
    if (path === 'admin/pets') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const pets = await getCollection('pets');
      const list = await pets.find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get all documents (admin only)
    if (path === 'admin/documents') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const documents = await getCollection('documents');
      const list = await documents.find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Admin: List all labs
    if (path === 'admin/labs') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const labs = await users.find({ role: 'lab' }, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
      
      // Enrich with request stats
      const labRequests = await getCollection('lab_requests');
      const labReports = await getCollection('lab_reports');
      
      const enrichedLabs = await Promise.all(labs.map(async (lab) => {
        const totalRequests = await labRequests.countDocuments({ labId: lab.id });
        const pendingRequests = await labRequests.countDocuments({ labId: lab.id, status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
        const completedRequests = await labRequests.countDocuments({ labId: lab.id, status: 'completed' });
        const totalReports = await labReports.countDocuments({ labId: lab.id });
        
        return {
          ...lab,
          stats: { totalRequests, pendingRequests, completedRequests, totalReports }
        };
      }));
      
      return NextResponse.json(enrichedLabs, { headers: corsHeaders });
    }

    // Admin: Lab requests overview
    if (path === 'admin/lab-requests') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const labRequests = await getCollection('lab_requests');
      const requests = await labRequests.find({}).sort({ createdAt: -1 }).limit(50).toArray();
      
      // Get stats
      const total = await labRequests.countDocuments({});
      const pending = await labRequests.countDocuments({ status: { $in: ['pending', 'received', 'sample_waiting', 'sample_received', 'in_progress'] } });
      const reportReady = await labRequests.countDocuments({ status: 'report_ready' });
      const completed = await labRequests.countDocuments({ status: 'completed' });
      
      return NextResponse.json({ requests, stats: { total, pending, reportReady, completed } }, { headers: corsHeaders });
    }

    // Get admin dashboard stats
    if (path === 'admin/stats') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      const appointments = await getCollection('appointments');
      const documents = await getCollection('documents');
      
      // Count by role
      const allUsers = await users.find({}, { projection: { password: 0 } }).toArray();
      const clinics = allUsers.filter(u => u.role === 'clinic');
      const owners = allUsers.filter(u => u.role === 'owner');
      
      // Count totals
      const totalPets = await pets.countDocuments({});
      const totalAppointments = await appointments.countDocuments({});
      const totalDocuments = await documents.countDocuments({});
      
      // Recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = allUsers.filter(u => new Date(u.createdAt) > sevenDaysAgo);
      
      // Appointments by status
      const appointmentStats = await appointments.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray();
      
      // Recent appointments
      const recentAppointments = await appointments.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      
      return NextResponse.json({
        counts: {
          totalUsers: allUsers.length,
          clinics: clinics.length,
          owners: owners.length,
          pets: totalPets,
          appointments: totalAppointments,
          documents: totalDocuments
        },
        recentRegistrations: recentUsers.length,
        appointmentsByStatus: appointmentStats,
        recentAppointments,
        recentUsers: allUsers.slice(0, 10)
      }, { headers: corsHeaders });
    }
    // ==================== END ADMIN API ====================

    // Get appointments for clinic or staff
    if (path === 'appointments') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const appointments = await getCollection('appointments');
      const query = user.role === 'clinic' ? { clinicId: user.id } : { ownerId: user.id };
      const list = await appointments.find(query).sort({ date: 1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get documents
    if (path === 'documents') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const documents = await getCollection('documents');
      const query = user.role === 'clinic' ? { clinicId: user.id } : { ownerId: user.id };
      const list = await documents.find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get messages/inbox
    if (path === 'messages') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const messages = await getCollection('messages');
      const list = await messages.find({
        $or: [{ senderId: user.id }, { receiverId: user.id }]
      }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get staff (clinic only)
    if (path === 'staff') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const staff = await getCollection('staff');
      const list = await staff.find({ clinicId: user.id }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get pets (owner only)
    if (path === 'pets') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const pets = await getCollection('pets');
      
      if (user.role === 'owner') {
        const list = await pets.find({ ownerId: user.id }).toArray();
        return NextResponse.json(list, { headers: corsHeaders });
      } else {
        // For clinics: get pets that are either directly assigned to clinic OR belong to owners associated with clinic
        const users = await getCollection('users');
        const ownersOfClinic = await users.find({ role: 'owner', clinicId: user.id }).project({ id: 1, _id: 1 }).toArray();
        const ownerIds = ownersOfClinic.map(o => o.id || o._id?.toString());
        
        const list = await pets.find({
          $or: [
            { clinicId: user.id },
            { ownerId: { $in: ownerIds } }
          ]
        }).toArray();
        return NextResponse.json(list, { headers: corsHeaders });
      }
    }

    // Get subscription plans
    if (path === 'stripe/plans') {
      return NextResponse.json(SUBSCRIPTION_PLANS, { headers: corsHeaders });
    }

    // Get checkout session status
    if (path.startsWith('stripe/checkout/status/')) {
      const sessionId = path.split('/')[3];
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // Update payment transaction status
        const transactions = await getCollection('payment_transactions');
        await transactions.updateOne(
          { sessionId },
          { $set: { status: session.status, paymentStatus: session.payment_status, updatedAt: new Date().toISOString() } }
        );
        
        return NextResponse.json({
          status: session.status,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency,
          metadata: session.metadata
        }, { headers: corsHeaders });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
      }
    }

    // Get clinic Stripe settings
    if (path === 'clinic/stripe-settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.id });
      return NextResponse.json({ 
        stripePublishableKey: clinic?.stripePublishableKey || '',
        stripeSecretKey: clinic?.stripeSecretKey ? '••••••••' + clinic.stripeSecretKey.slice(-4) : '',
        stripeConfigured: !!clinic?.stripeSecretKey
      }, { headers: corsHeaders });
    }

    // Get Video Consult settings
    if (path === 'clinic/video-consult-settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.id });
      return NextResponse.json(clinic?.videoConsultSettings || {
        enabled: true,
        price: 35,
        duration: 20,
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '18:00' }
        ],
        maxPerDay: 5,
        reminderEmail24h: true,
        reminderEmail1h: true,
        autoConfirm: true
      }, { headers: corsHeaders });
    }

    // Geocoding endpoint (secure - uses backend API key)
    if (path === 'geocode') {
      const { searchParams } = new URL(request.url);
      const address = searchParams.get('address');
      
      if (!address) {
        return NextResponse.json({ error: 'Indirizzo richiesto' }, { status: 400, headers: corsHeaders });
      }
      
      try {
        const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          const formattedAddress = data.results[0].formatted_address;
          return NextResponse.json({ 
            success: true, 
            latitude: lat, 
            longitude: lng,
            formattedAddress 
          }, { headers: corsHeaders });
        } else {
          return NextResponse.json({ 
            success: false, 
            error: 'Indirizzo non trovato' 
          }, { headers: corsHeaders });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json({ error: 'Errore durante la geocodifica' }, { status: 500, headers: corsHeaders });
      }
    }

    // Get owners (for clinic)
    if (path === 'owners') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const list = await users.find({ role: 'owner', clinicId: user.id }, { projection: { password: 0 } }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Search clinics (public)
    if (path === 'clinics/search') {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || '';
      const city = searchParams.get('city') || '';
      const service = searchParams.get('service') || '';
      const userLat = parseFloat(searchParams.get('lat')) || null;
      const userLng = parseFloat(searchParams.get('lng')) || null;
      const maxDistance = parseFloat(searchParams.get('maxDistance')) || 50; // km
      
      const users = await getCollection('users');
      const filter = { role: 'clinic' };
      const andConditions = [];
      
      if (query) {
        andConditions.push({
          $or: [
            { clinicName: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
          ]
        });
      }
      if (city) {
        filter.city = { $regex: city, $options: 'i' };
      }
      // Filter by service offered (services can be array of IDs or names)
      if (service) {
        andConditions.push({
          $or: [
            { services: { $in: [service] } },
            { services: { $regex: service, $options: 'i' } },
            { servicesOffered: { $elemMatch: { id: service } } }
          ]
        });
      }
      
      if (andConditions.length > 0) {
        filter.$and = andConditions;
      }
      
      const clinics = await users.find(filter, { projection: { password: 0, resetToken: 0, resetExpiry: 0 } }).limit(50).toArray();
      
      // Get reviews for each clinic and calculate distance
      const reviews = await getCollection('reviews');
      const clinicsWithReviews = await Promise.all(clinics.map(async (clinic) => {
        const clinicReviews = await reviews.find({ clinicId: clinic.id }).toArray();
        const avgRating = clinicReviews.length > 0 
          ? clinicReviews.reduce((sum, r) => sum + r.overallRating, 0) / clinicReviews.length 
          : 0;
        
        // Calculate distance if user location provided
        let distance = null;
        if (userLat && userLng && clinic.latitude && clinic.longitude) {
          distance = calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude);
        }
        
        return { 
          ...clinic, 
          reviewCount: clinicReviews.length, 
          avgRating: Math.round(avgRating * 10) / 10,
          distance: distance ? Math.round(distance * 10) / 10 : null
        };
      }));
      
      // Filter by distance if user location provided
      let filteredClinics = clinicsWithReviews;
      if (userLat && userLng) {
        filteredClinics = clinicsWithReviews
          .filter(c => c.distance === null || c.distance <= maxDistance)
          .sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
      }
      
      return NextResponse.json(filteredClinics, { headers: corsHeaders });
    }

    // Get own clinic reviews (authenticated)
    if (path === 'clinic/reviews') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const reviews = await getCollection('reviews');
      const list = await reviews.find({ clinicId: user.id }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ reviews: list }, { headers: corsHeaders });
    }

    // ==================== LAB API - GET ====================
    
    // Get lab exam types catalog
    if (path === 'lab/exam-types') {
      return NextResponse.json(LAB_EXAM_TYPES, { headers: corsHeaders });
    }
    
    // Get lab request statuses
    if (path === 'lab/statuses') {
      return NextResponse.json(LAB_REQUEST_STATUSES, { headers: corsHeaders });
    }
    
    // Get all labs (for clinic to select)
    if (path === 'labs') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const users = await getCollection('users');
      const labs = await users.find({ role: 'lab', isApproved: true }, { projection: { password: 0 } }).toArray();
      return NextResponse.json(labs, { headers: corsHeaders });
    }
    
    // Get lab requests (for clinic or lab)
    if (path === 'lab-requests') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const labRequests = await getCollection('lab_requests');
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      
      let query = {};
      if (user.role === 'clinic') {
        query = { clinicId: user.id };
      } else if (user.role === 'lab') {
        query = { labId: user.id };
      } else if (user.role === 'admin') {
        // Admin can see all
      } else {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const requests = await labRequests.find(query).sort({ createdAt: -1 }).toArray();
      
      // Enrich with pet, clinic, lab info
      const enrichedRequests = await Promise.all(requests.map(async (req) => {
        const pet = await pets.findOne({ id: req.petId });
        const clinic = await users.findOne({ id: req.clinicId });
        const lab = await users.findOne({ id: req.labId });
        return {
          ...req,
          petName: pet?.name || 'Sconosciuto',
          petSpecies: pet?.species || '',
          clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
          labName: lab?.labName || lab?.name || 'Laboratorio'
        };
      }));
      
      return NextResponse.json(enrichedRequests, { headers: corsHeaders });
    }
    
    // Get single lab request
    if (path.startsWith('lab-requests/') && !path.includes('/reports')) {
      const requestId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const labRequests = await getCollection('lab_requests');
      const labReq = await labRequests.findOne({ id: requestId });
      
      if (!labReq) {
        return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404, headers: corsHeaders });
      }
      
      // Check permission
      if (user.role === 'clinic' && labReq.clinicId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      if (user.role === 'lab' && labReq.labId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      // Get related data
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      const labReports = await getCollection('lab_reports');
      
      const pet = await pets.findOne({ id: labReq.petId });
      const clinic = await users.findOne({ id: labReq.clinicId });
      const lab = await users.findOne({ id: labReq.labId });
      const owner = pet ? await users.findOne({ id: pet.ownerId }) : null;
      const reports = await labReports.find({ labRequestId: requestId }).sort({ uploadedAt: -1 }).toArray();
      
      return NextResponse.json({
        ...labReq,
        pet,
        clinic: { id: clinic?.id, name: clinic?.clinicName || clinic?.name, email: clinic?.email },
        lab: { id: lab?.id, name: lab?.labName || lab?.name, email: lab?.email },
        owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
        reports
      }, { headers: corsHeaders });
    }
    
    // Get lab reports for a pet (for owner view)
    if (path.startsWith('pets/') && path.endsWith('/lab-reports')) {
      const petId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      
      if (!pet) {
        return NextResponse.json({ error: 'Pet non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      // Check permission
      if (user.role === 'owner' && pet.ownerId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const labReports = await getCollection('lab_reports');
      let query = { petId };
      
      // Owner can only see reports marked as visible
      if (user.role === 'owner') {
        query.visibleToOwner = true;
      }
      
      const reports = await labReports.find(query).sort({ uploadedAt: -1 }).toArray();
      
      return NextResponse.json(reports, { headers: corsHeaders });
    }
    
    // ==================== END LAB API - GET ====================

    // Get my reviews (owner)
    if (path === 'reviews/my-reviews') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      const reviews = await getCollection('reviews');
      const users = await getCollection('users');
      
      const myReviews = await reviews.find({ ownerId: user.id }).sort({ createdAt: -1 }).toArray();
      
      // Enrich with clinic info
      const enrichedReviews = await Promise.all(myReviews.map(async (review) => {
        const clinic = await users.findOne({ id: review.clinicId, role: 'clinic' });
        return {
          ...review,
          clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
          clinicAddress: clinic?.address || ''
        };
      }));
      
      return NextResponse.json(enrichedReviews, { headers: corsHeaders });
    }

    // Get clinic reviews
    if (path.startsWith('clinics/') && path.endsWith('/reviews')) {
      const clinicId = path.split('/')[1];
      const reviews = await getCollection('reviews');
      const list = await reviews.find({ clinicId }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(list, { headers: corsHeaders });
    }

    // Get single clinic (public)
    if (path.startsWith('clinics/') && !path.includes('/reviews')) {
      const clinicId = path.split('/')[1];
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: clinicId, role: 'clinic' }, { projection: { password: 0 } });
      if (!clinic) {
        return NextResponse.json({ error: 'Clinica non trovata' }, { status: 404, headers: corsHeaders });
      }
      
      const reviews = await getCollection('reviews');
      const clinicReviews = await reviews.find({ clinicId }).toArray();
      const avgRating = clinicReviews.length > 0 
        ? clinicReviews.reduce((sum, r) => sum + r.overallRating, 0) / clinicReviews.length 
        : 0;
      
      return NextResponse.json({ 
        ...clinic, 
        reviewCount: clinicReviews.length, 
        avgRating: Math.round(avgRating * 10) / 10 
      }, { headers: corsHeaders });
    }

    // Get pet with full details
    if (path.startsWith('pets/') && path.split('/').length === 2) {
      const petId = path.split('/')[1];
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      if (!pet) {
        return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      // Get related data
      const [appointments, documents, vaccinations] = await Promise.all([
        getCollection('appointments').then(c => c.find({ petId }).sort({ date: -1 }).toArray()),
        getCollection('documents').then(c => c.find({ petId }).sort({ createdAt: -1 }).toArray()),
        getCollection('vaccinations').then(c => c.find({ petId }).sort({ date: -1 }).toArray())
      ]);
      
      // Calculate total spending
      const totalSpent = appointments.reduce((sum, a) => sum + (a.price || 0), 0);
      const currentYear = new Date().getFullYear();
      const yearSpent = appointments
        .filter(a => new Date(a.date).getFullYear() === currentYear)
        .reduce((sum, a) => sum + (a.price || 0), 0);
      
      return NextResponse.json({ 
        ...pet, 
        appointments, 
        documents, 
        vaccinations,
        spending: { total: totalSpent, currentYear: yearSpent }
      }, { headers: corsHeaders });
    }

    // ==================== REWARDS/PREMI API ====================
    
    // Get rewards for clinic (clinic view - all reward types they created)
    if (path === 'rewards/types') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const rewards = await getCollection('rewards');
      const rewardTypes = await rewards.find({ clinicId: user.id, type: 'definition' }).toArray();
      
      return NextResponse.json(rewardTypes, { headers: corsHeaders });
    }
    
    // Get assigned rewards for a specific owner (clinic view)
    if (path === 'rewards/assigned') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const { searchParams } = new URL(request.url);
      const ownerId = searchParams.get('ownerId');
      
      const rewards = await getCollection('rewards');
      const query = { clinicId: user.id, type: 'assigned' };
      if (ownerId) query.ownerId = ownerId;
      
      const assignedRewards = await rewards.find(query).sort({ createdAt: -1 }).toArray();
      
      return NextResponse.json(assignedRewards, { headers: corsHeaders });
    }
    
    // Get my rewards (owner view)
    if (path === 'rewards/my-rewards') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const rewards = await getCollection('rewards');
      const myRewards = await rewards.find({ 
        ownerId: user.id, 
        type: 'assigned' 
      }).sort({ createdAt: -1 }).toArray();
      
      // Enrich with clinic info
      const users = await getCollection('users');
      const enrichedRewards = await Promise.all(myRewards.map(async (reward) => {
        const clinic = await users.findOne({ id: reward.clinicId }, { projection: { clinicName: 1, phone: 1, whatsappNumber: 1 } });
        return { ...reward, clinicName: clinic?.clinicName, clinicPhone: clinic?.phone, clinicWhatsapp: clinic?.whatsappNumber };
      }));
      
      return NextResponse.json(enrichedRewards, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    const body = await request.json().catch(() => ({}));

    // Waitlist - Coming Soon signup
    if (path === 'waitlist') {
      const { email, userType } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email richiesta' }, { status: 400, headers: corsHeaders });
      }
      
      const waitlist = await getCollection('waitlist');
      
      // Check if already exists
      const existing = await waitlist.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ success: true, message: 'Email già registrata' }, { headers: corsHeaders });
      }
      
      // Save to waitlist
      await waitlist.insertOne({
        id: uuidv4(),
        email: email.toLowerCase(),
        userType: userType || 'unknown', // 'clinic' or 'owner'
        createdAt: new Date().toISOString(),
        source: 'coming_soon_page'
      });
      
      return NextResponse.json({ success: true, message: 'Aggiunto alla lista di attesa' }, { headers: corsHeaders });
    }

    // Disconnect Google Calendar
    if (path === 'google-calendar/disconnect') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const users = await getCollection('users');
      await users.updateOne(
        { id: user.clinicId || user.id },
        { $unset: { googleCalendar: '' } }
      );
      
      return NextResponse.json({ success: true, message: 'Google Calendar disconnesso' }, { headers: corsHeaders });
    }

    // Sync appointment to Google Calendar
    if (path === 'google-calendar/sync-event') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const { appointmentId } = body;
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.clinicId || user.id });
      
      if (!clinic?.googleCalendar?.connected) {
        return NextResponse.json({ error: 'Google Calendar non connesso' }, { status: 400, headers: corsHeaders });
      }
      
      const appointments = await getCollection('appointments');
      const appointment = await appointments.findOne({ id: appointmentId });
      
      if (!appointment) {
        return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      // Refresh token if expired
      let accessToken = clinic.googleCalendar.accessToken;
      if (new Date(clinic.googleCalendar.expiresAt) < new Date()) {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: clinic.googleCalendar.refreshToken,
            grant_type: 'refresh_token'
          })
        });
        const refreshData = await refreshResponse.json();
        
        if (refreshData.access_token) {
          accessToken = refreshData.access_token;
          await users.updateOne(
            { id: clinic.id },
            { 
              $set: { 
                'googleCalendar.accessToken': accessToken,
                'googleCalendar.expiresAt': new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
              }
            }
          );
        }
      }
      
      // Get staff color
      const staff = await getCollection('staff');
      const staffMember = appointment.staffId ? await staff.findOne({ id: appointment.staffId }) : null;
      const colorId = staffMember?.calendarColorId || '1';
      
      // Create event in Google Calendar
      const event = {
        summary: `🐾 ${appointment.petName || 'Visita'} - ${appointment.ownerName || 'Cliente'}`,
        description: `Tipo: ${appointment.type || 'Visita'}\nNote: ${appointment.notes || 'Nessuna nota'}\n\nCreato da vetbuddy`,
        start: {
          dateTime: appointment.date,
          timeZone: 'Europe/Rome'
        },
        end: {
          dateTime: new Date(new Date(appointment.date).getTime() + (appointment.duration || 30) * 60000).toISOString(),
          timeZone: 'Europe/Rome'
        },
        colorId: colorId,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };
      
      const calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${clinic.googleCalendar.calendarId || 'primary'}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );
      
      const createdEvent = await calendarResponse.json();
      
      if (createdEvent.error) {
        console.error('Google Calendar error:', createdEvent.error);
        return NextResponse.json({ error: createdEvent.error.message }, { status: 400, headers: corsHeaders });
      }
      
      // Update appointment with Google Calendar event ID
      await appointments.updateOne(
        { id: appointmentId },
        { $set: { googleEventId: createdEvent.id, googleCalendarSynced: true } }
      );
      
      // Update last sync time
      await users.updateOne(
        { id: clinic.id },
        { $set: { 'googleCalendar.lastSync': new Date().toISOString() } }
      );
      
      return NextResponse.json({ 
        success: true, 
        eventId: createdEvent.id,
        eventLink: createdEvent.htmlLink
      }, { headers: corsHeaders });
    }

    // Check Google Calendar availability (busy times)
    if (path === 'google-calendar/busy') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const { startDate, endDate } = body;
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.clinicId || user.id });
      
      if (!clinic?.googleCalendar?.connected) {
        return NextResponse.json({ busy: [] }, { headers: corsHeaders });
      }
      
      // Refresh token if needed
      let accessToken = clinic.googleCalendar.accessToken;
      if (new Date(clinic.googleCalendar.expiresAt) < new Date()) {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: clinic.googleCalendar.refreshToken,
            grant_type: 'refresh_token'
          })
        });
        const refreshData = await refreshResponse.json();
        if (refreshData.access_token) accessToken = refreshData.access_token;
      }
      
      // Get busy times from Google Calendar
      const busyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: clinic.googleCalendar.calendarId || 'primary' }]
        })
      });
      
      const busyData = await busyResponse.json();
      const busy = busyData.calendars?.[clinic.googleCalendar.calendarId || 'primary']?.busy || [];
      
      return NextResponse.json({ busy }, { headers: corsHeaders });
    }

    // Update staff calendar color
    if (path === 'staff/calendar-color') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }
      
      const { staffId, colorId } = body;
      const staff = await getCollection('staff');
      await staff.updateOne(
        { id: staffId },
        { $set: { calendarColorId: colorId } }
      );
      
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // ==================== INVITE CLINIC ====================
    // Send invitation to a clinic
    if (path === 'invite-clinic') {
      const { clinicName, clinicEmail, message, inviterName, inviterEmail } = body;
      
      if (!clinicName || !clinicEmail) {
        return NextResponse.json({ error: 'Nome e email della clinica sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      // Save invitation to database for tracking
      const invitations = await getCollection('clinic_invitations');
      const invitation = {
        id: uuidv4(),
        clinicName,
        clinicEmail,
        message: message || '',
        inviterName: inviterName || 'Un proprietario',
        inviterEmail: inviterEmail || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await invitations.insertOne(invitation);

      // Send email to the clinic
      try {
        await sendEmail({
          to: clinicEmail,
          subject: `${inviterName || 'Un proprietario'} ti ha invitato su vetbuddy!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f97066 0%, #fb923c 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🐾 vetbuddy</h1>
                <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">La piattaforma veterinaria digitale</p>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #1f2937; margin-top: 0;">Ciao ${clinicName}! 👋</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                  <strong>${inviterName || 'Un proprietario di animali'}</strong> ti ha invitato a unirti a vetbuddy, 
                  la piattaforma che digitalizza la gestione della tua clinica veterinaria.
                </p>
                ${message ? `
                <div style="background: white; border-left: 4px solid #f97066; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="color: #6b7280; font-style: italic; margin: 0;">"${message}"</p>
                  <p style="color: #9ca3af; font-size: 14px; margin: 10px 0 0 0;">— ${inviterName || 'Il tuo cliente'}</p>
                </div>
                ` : ''}
                <h3 style="color: #1f2937;">Perché unirsi a vetbuddy?</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li>📅 Prenotazioni online 24/7</li>
                  <li>📋 Cartelle cliniche digitali</li>
                  <li>📧 Comunicazione automatizzata con i clienti</li>
                  <li>💳 Pagamenti integrati</li>
                  <li>🏥 <strong>Gratis durante la fase Pilot Milano!</strong></li>
                </ul>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #f97066; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Candidati al Pilot Gratuito →
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                  vetbuddy — Pilot Milano 2025<br/>
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #f97066;">www.vetbuddy.it</a>
                </p>
              </div>
            </div>
          `
        });

        return NextResponse.json({ success: true, message: 'Invito inviato con successo!' }, { headers: corsHeaders });
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Still return success if saved to DB, but note email failed
        return NextResponse.json({ success: true, message: 'Invito salvato (email non inviata)', emailError: true }, { headers: corsHeaders });
      }
    }
    // ==================== END INVITE CLINIC ====================

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
      
      return NextResponse.json({ user: userWithoutPassword, token }, { headers: corsHeaders });
    }

    // Request appointment from owner to clinic (requires clinic confirmation)
    if (path === 'appointments/request') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { clinicId, clinicName, date, time, service, notes, petId } = body;
      const appointments = await getCollection('appointments');
      const users = await getCollection('users');
      const pets = await getCollection('pets');
      
      // Get pet details if petId provided
      let petName = null;
      if (petId) {
        const pet = await pets.findOne({ id: petId });
        petName = pet?.name || null;
      }
      
      // Get owner details
      const owner = await users.findOne({ id: user.id });
      
      const appointmentId = uuidv4();
      const appointment = {
        id: appointmentId,
        clinicId,
        clinicName: clinicName || null,
        ownerId: user.id,
        ownerName: owner?.name || owner?.email || 'Proprietario',
        ownerEmail: owner?.email,
        ownerPhone: owner?.phone,
        petId: petId || null,
        petName,
        date,
        time: time || 'mattina', // Can be a time slot like 'mattina', 'pomeriggio'
        serviceId: service,
        reason: service,
        notes: notes || '',
        status: 'pending', // Requires clinic confirmation
        type: 'richiesta',
        createdAt: new Date().toISOString()
      };

      await appointments.insertOne(appointment);
      
      // Notify clinic about the request
      try {
        const clinic = await users.findOne({ id: clinicId });
        if (clinic?.email) {
          await sendEmail({
            to: clinic.email,
            subject: `📅 Nuova Richiesta Appuntamento - ${owner?.name || 'Proprietario'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #F97316;">🐾 Nuova Richiesta di Appuntamento</h2>
                <p>Hai ricevuto una nuova richiesta di appuntamento:</p>
                <ul>
                  <li><strong>Proprietario:</strong> ${owner?.name || 'Non specificato'}</li>
                  <li><strong>Email:</strong> ${owner?.email || '-'}</li>
                  <li><strong>Telefono:</strong> ${owner?.phone || '-'}</li>
                  ${petName ? `<li><strong>Animale:</strong> ${petName}</li>` : ''}
                  <li><strong>Data richiesta:</strong> ${new Date(date).toLocaleDateString('it-IT')}</li>
                  <li><strong>Fascia oraria:</strong> ${time === 'mattina' ? 'Mattina (9-12)' : time === 'pomeriggio' ? 'Pomeriggio (14-18)' : time}</li>
                  <li><strong>Servizio:</strong> ${service}</li>
                  ${notes ? `<li><strong>Note:</strong> ${notes}</li>` : ''}
                </ul>
                <p>Accedi alla dashboard di vetbuddy per confermare o proporre un orario alternativo.</p>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
      }
      
      return NextResponse.json({ success: true, appointment }, { headers: corsHeaders });
    }

    // Create appointment
    if (path === 'appointments') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { petId, petName, ownerName, ownerId, date, time, reason, notes, type, serviceId, duration } = body;
      const appointments = await getCollection('appointments');
      
      const appointmentId = uuidv4();
      
      // Generate video link for video consulto
      let videoLink = null;
      if (type === 'videoconsulto' || type === 'online' || serviceId?.includes('online') || serviceId?.includes('consulenza')) {
        // Generate unique Jitsi Meet room
        const roomCode = `vetbuddy-${appointmentId.slice(0, 8)}`;
        videoLink = `https://meet.jit.si/${roomCode}`;
      }
      
      const appointment = {
        id: appointmentId,
        clinicId: user.role === 'clinic' ? user.id : body.clinicId,
        ownerId: user.role === 'owner' ? user.id : ownerId,
        petId,
        petName,
        ownerName,
        date,
        time,
        type: type || 'visita',
        serviceId,
        duration: duration || 30,
        reason,
        notes: notes || '',
        videoLink,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      await appointments.insertOne(appointment);
      
      // AUTO-SEND CONFIRMATION EMAIL
      try {
        // Get owner email
        const users = await getCollection('users');
        const owner = await users.findOne({ id: appointment.ownerId });
        const clinic = await users.findOne({ id: appointment.clinicId });
        
        if (owner?.email) {
          const clinicName = clinic?.clinicName || body.clinicName || 'Clinica Veterinaria';
          const clinicPhone = clinic?.phone || '';
          const clinicAddress = clinic?.address || '';
          
          const typeLabels = {
            visita: 'Visita generale',
            vaccino: 'Vaccino',
            videoconsulto: 'Video Consulto',
            online: 'Video Consulto'
          };
          const typeLabel = typeLabels[appointment.type] || appointment.reason || 'Appuntamento';
          const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          });
          
          await sendEmail({
            to: owner.email,
            subject: `✅ Prenotazione Confermata - ${appointment.petName} | ${clinicName}`,
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 32px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🐾 Prenotazione Confermata!</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">${clinicName}</p>
                </div>
                
                <div style="padding: 32px;">
                  <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">🐕 Paziente</span><br/>
                          <strong style="font-size: 18px; color: #1e293b;">${appointment.petName}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">📋 Tipo</span><br/>
                          <strong style="font-size: 16px; color: #1e293b;">${typeLabel}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">📅 Data e ora</span><br/>
                          <strong style="font-size: 18px; color: #10B981;">${formattedDate}</strong><br/>
                          <strong style="font-size: 24px; color: #1e293b;">🕐 ${appointment.time}</strong>
                        </td>
                      </tr>
                    </table>
                  </div>

                  ${appointment.videoLink ? `
                  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <h3 style="color: white; margin: 0 0 12px; font-size: 18px;">🎥 Video Consulto</h3>
                    <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 16px;">
                      Il giorno dell'appuntamento, clicca il pulsante qui sotto per avviare la videochiamata.
                    </p>
                    <a href="${appointment.videoLink}" target="_blank" style="display: inline-block; background: white; color: #6366f1; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                      📹 Entra nel Video Consulto
                    </a>
                    <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 12px 0 0;">
                      Riceverai un promemoria 24h e 1h prima dell'appuntamento
                    </p>
                  </div>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                      <strong>⚠️ Importante:</strong> Il video consulto è una consulenza a distanza e non sostituisce una visita clinica in presenza quando è necessario un esame fisico.
                    </p>
                  </div>
                  ` : `
                  <div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-size: 14px; color: #166534;">
                      <strong>📍 Dove:</strong> ${clinicAddress || clinicName}
                      ${clinicPhone ? `<br/><strong>📞 Tel:</strong> ${clinicPhone}` : ''}
                    </p>
                  </div>
                  `}
                  
                  <p style="color: #64748b; font-size: 14px; text-align: center;">
                    Riceverai un promemoria 24h prima dell'appuntamento.<br/>
                    Per modifiche o cancellazioni, contatta la clinica.
                  </p>
                </div>
                
                <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Email inviata automaticamente da vetbuddy<br/>
                    <a href="https://vetbuddy.it" style="color: #FF6B6B;">vetbuddy.it</a>
                  </p>
                </div>
              </div>
            `
          });
          console.log('Confirmation email sent to:', owner.email);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the appointment creation if email fails
      }
      
      return NextResponse.json(appointment, { headers: corsHeaders });
    }

    // Send appointment email to owner
    if (path === 'appointments/send-email') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { appointmentId, recipientEmail } = body;
      const appointments = await getCollection('appointments');
      const appt = await appointments.findOne({ id: appointmentId });
      
      if (!appt) {
        return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404, headers: corsHeaders });
      }

      // Get clinic info
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.clinicId || user.id });
      const clinicName = clinic?.clinicName || 'Clinica Veterinaria';
      const clinicPhone = clinic?.phone || '';
      const clinicAddress = clinic?.address || '';

      // Get appointment type label
      const typeLabels = {
        visita: 'Visita generale',
        vaccino: 'Vaccino',
        chirurgia: 'Chirurgia / Operazione',
        emergenza: 'Emergenza',
        controllo: 'Controllo / Follow-up',
        sterilizzazione: 'Sterilizzazione',
        dentale: 'Pulizia dentale',
        esami: 'Esami / Analisi',
        videoconsulto: 'Video Consulto'
      };
      const typeLabel = typeLabels[appt.type] || appt.type || 'Appuntamento';

      // Get staff name if assigned
      let staffName = '';
      if (appt.staffId) {
        const staffCollection = await getCollection('staff');
        const staffMember = await staffCollection.findOne({ id: appt.staffId });
        if (staffMember) staffName = staffMember.name;
      }

      const formattedDate = new Date(appt.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      await sendEmail({
        to: recipientEmail,
        subject: `📅 ${typeLabel} - ${appt.petName} | ${clinicName}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🐾 ${clinicName}</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Conferma Appuntamento</p>
            </div>
            
            <div style="padding: 32px;">
              <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b; font-size: 14px;">🐕 Paziente</span><br/>
                      <strong style="font-size: 18px; color: #1e293b;">${appt.petName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b; font-size: 14px;">📋 Tipo</span><br/>
                      <strong style="font-size: 16px; color: #1e293b;">${typeLabel}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b; font-size: 14px;">📅 Data e ora</span><br/>
                      <strong style="font-size: 18px; color: #FF6B6B;">${formattedDate}</strong><br/>
                      <strong style="font-size: 24px; color: #1e293b;">🕐 ${appt.time}</strong>
                    </td>
                  </tr>
                  ${staffName ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b; font-size: 14px;">👨‍⚕️ Con</span><br/>
                      <strong style="font-size: 16px; color: #1e293b;">${staffName}</strong>
                    </td>
                  </tr>
                  ` : ''}
                  ${appt.duration ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #64748b; font-size: 14px;">⏱️ Durata prevista</span><br/>
                      <strong style="font-size: 16px; color: #1e293b;">${appt.duration} minuti</strong>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${appt.videoLink ? `
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <h3 style="color: white; margin: 0 0 12px; font-size: 18px;">🎥 Video Consulto</h3>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 16px;">
                  Il giorno dell'appuntamento, clicca il pulsante qui sotto per avviare la videochiamata.
                </p>
                <a href="${appt.videoLink}" target="_blank" style="display: inline-block; background: white; color: #6366f1; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  📹 Avvia Video Consulto
                </a>
                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 12px 0 0;">
                  Link: ${appt.videoLink}
                </p>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>⚠️ Importante:</strong> Il video consulto è una consulenza a distanza e non sostituisce una visita clinica in presenza quando è necessario un esame fisico.
                </p>
              </div>
              ` : ''}

              ${appt.reason ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Note:</strong> ${appt.reason}</p>
              </div>
              ` : ''}

              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #334155; font-size: 16px;">📍 Dove trovarci</h3>
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                  <strong>${clinicName}</strong><br/>
                  ${clinicAddress ? `${clinicAddress}<br/>` : ''}
                  ${clinicPhone ? `📞 ${clinicPhone}` : ''}
                </p>
              </div>

              <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 24px;">
                Per modificare o cancellare l'appuntamento, contatta la clinica.
              </p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Inviato tramite <strong>vetbuddy</strong> - La piattaforma veterinaria</p>
            </div>
          </div>
        `
      });

      // Update appointment with email sent info
      await appointments.updateOne(
        { id: appointmentId },
        { $set: { emailSentAt: new Date().toISOString(), emailSentTo: recipientEmail } }
      );

      return NextResponse.json({ success: true, message: 'Email inviata con successo' }, { headers: corsHeaders });
    }

    // Upload document
    if (path === 'documents') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { name, type, content, fileName, petId, petName, ownerId, ownerEmail, notes, amount, sendEmail: shouldSendEmail } = body;
      const documents = await getCollection('documents');
      
      const document = {
        id: uuidv4(),
        name,
        type, // 'prescrizione', 'referto', 'fattura', 'altro'
        content, // base64 content (PDF)
        fileName, // original file name
        petId,
        petName,
        clinicId: user.role === 'clinic' ? user.id : (user.clinicId || body.clinicId),
        ownerId: user.role === 'owner' ? user.id : ownerId,
        ownerEmail: ownerEmail || null,
        notes: notes || null, // Internal notes (clinic only)
        amount: amount ? parseFloat(amount) : null, // For invoices
        status: 'bozza', // bozza, inviato, visualizzato, scaricato
        createdBy: user.id,
        createdByName: user.name || user.clinicName,
        createdAt: new Date().toISOString(),
        auditLog: [{
          action: 'created',
          by: user.id,
          byName: user.name || user.clinicName,
          at: new Date().toISOString()
        }]
      };

      await documents.insertOne(document);

      // Auto-send email if requested and email is provided
      if (shouldSendEmail && ownerEmail) {
        try {
          // Get clinic info
          const users = await getCollection('users');
          const clinic = await users.findOne({ id: document.clinicId });
          const clinicName = clinic?.clinicName || 'La tua clinica veterinaria';

          // Prepare attachments
          const attachments = [];
          if (content && content.startsWith('data:')) {
            const base64Data = content.split(',')[1];
            const mimeType = content.split(';')[0].split(':')[1];
            attachments.push({
              filename: fileName || `${name}.pdf`,
              content: base64Data,
              type: mimeType || 'application/pdf'
            });
          }

          // Template based on type
          const templates = {
            prescrizione: { subject: `📋 Prescrizione per ${petName || 'il tuo animale'} – ${clinicName}`, color: '#10B981' },
            referto: { subject: `📄 Referto per ${petName || 'il tuo animale'} – ${clinicName}`, color: '#3B82F6' },
            fattura: { subject: `🧾 Fattura – ${clinicName}`, color: '#F59E0B' },
            istruzioni: { subject: `📝 Istruzioni post-visita per ${petName || 'il tuo animale'} – ${clinicName}`, color: '#059669' }
          };
          const tpl = templates[type] || { subject: `📎 Documento per ${petName || 'il tuo animale'} – ${clinicName}`, color: '#6B7280' };

          await sendEmail({
            to: ownerEmail,
            subject: tpl.subject,
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${tpl.color}; padding: 24px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🐾 ${clinicName}</h1>
                </div>
                <div style="padding: 32px;">
                  <p>Ti inviamo il documento richiesto per <strong>${petName || 'il tuo animale'}</strong>.</p>
                  <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>${name}</strong></p>
                    <p style="margin: 8px 0 0; color: #666; text-transform: capitalize;">${type}</p>
                    ${amount ? `<p style="margin: 8px 0 0; font-weight: bold;">Importo: €${parseFloat(amount).toFixed(2)}</p>` : ''}
                  </div>
                  ${attachments.length > 0 ? '<p style="color: #059669;">📎 <strong>Il documento è allegato a questa email.</strong></p>' : ''}
                  ${notes ? `<div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 16px;"><small><strong>Note:</strong> ${notes}</small></div>` : ''}
                </div>
                <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #666;">
                  Inviato tramite <strong>vetbuddy</strong>
                </div>
              </div>
            `,
            attachments: attachments.length > 0 ? attachments : undefined
          });

          // Update document status
          await documents.updateOne(
            { id: document.id },
            { 
              $set: { status: 'inviato', lastSentAt: new Date().toISOString(), lastSentTo: ownerEmail },
              $push: { auditLog: { action: 'email_sent', to: ownerEmail, at: new Date().toISOString(), hasAttachment: attachments.length > 0 } }
            }
          );

          document.status = 'inviato';
          document.emailSent = true;
        } catch (emailError) {
          console.error('Error sending document email:', emailError);
          document.emailError = emailError.message;
        }
      }

      return NextResponse.json(document, { headers: corsHeaders });
    }

    // Send message
    if (path === 'messages') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      // Support both receiverId and clinicId (owner sends to clinic)
      const { receiverId, clinicId, clinicName, content, subject, from, type, petId, petName } = body;
      const messages = await getCollection('messages');
      
      const message = {
        id: uuidv4(),
        senderId: user.id,
        senderName: user.name || user.clinicName,
        receiverId: receiverId || clinicId,
        clinicId: clinicId || receiverId,
        clinicName: clinicName || '',
        subject: subject || 'Nuovo messaggio',
        content,
        from: from || (user.role === 'owner' ? 'owner' : 'clinic'),
        type: type || 'message',
        petId: petId || null,
        petName: petName || null,
        read: false,
        createdAt: new Date().toISOString()
      };

      await messages.insertOne(message);
      return NextResponse.json(message, { headers: corsHeaders });
    }

    // Add staff member
    if (path === 'staff') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { name, role, email, phone, canLogin, password } = body;
      const staff = await getCollection('staff');
      
      const member = {
        id: uuidv4(),
        clinicId: user.id,
        clinicName: user.clinicName,
        name,
        role, // 'vet', 'assistant', 'receptionist', 'admin'
        email,
        phone,
        canLogin: canLogin || false,
        password: canLogin && password ? hashPassword(password) : null,
        permissions: role === 'admin' ? ['documents', 'invoices', 'reports', 'payments'] : 
                     role === 'vet' ? ['visits', 'documents', 'patients', 'messages'] :
                     role === 'assistant' ? ['visits', 'patients', 'messages'] :
                     ['calendar', 'messages', 'owners'],
        createdAt: new Date().toISOString()
      };

      // If canLogin, also create a user account for staff
      if (canLogin && email && password) {
        const users = await getCollection('users');
        const existingUser = await users.findOne({ email });
        if (existingUser) {
          return NextResponse.json({ error: 'Email già registrata' }, { status: 400, headers: corsHeaders });
        }
        
        await users.insertOne({
          id: member.id,
          email,
          password: hashPassword(password),
          name,
          role: 'staff',
          staffRole: role,
          clinicId: user.id,
          clinicName: user.clinicName,
          permissions: member.permissions,
          mustChangePassword: true, // Force password change on first login
          createdAt: new Date().toISOString()
        });
      }

      await staff.insertOne(member);
      const { password: _, ...memberWithoutPassword } = member;
      return NextResponse.json(memberWithoutPassword, { headers: corsHeaders });
    }

    // Add pet
    if (path === 'pets') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { name, species, breed, birthDate, weight, notes, ownerId, microchip, sterilized, allergies, medications } = body;
      const pets = await getCollection('pets');
      
      const pet = {
        id: uuidv4(),
        name,
        species,
        breed,
        birthDate,
        weight,
        microchip: microchip || '',
        sterilized: sterilized || false,
        allergies: allergies || '',
        medications: medications || '',
        notes: notes || '',
        ownerId: user.role === 'owner' ? user.id : ownerId,
        clinicId: user.role === 'clinic' ? user.id : body.clinicId,
        createdAt: new Date().toISOString()
      };

      await pets.insertOne(pet);
      return NextResponse.json(pet, { headers: corsHeaders });
    }

    // Send document via email with PDF attachment
    if (path === 'documents/send-email') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { documentId, recipientEmail } = body;
      const documents = await getCollection('documents');
      const doc = await documents.findOne({ id: documentId });
      
      if (!doc) {
        return NextResponse.json({ error: 'Documento non trovato' }, { status: 404, headers: corsHeaders });
      }

      // Get clinic info
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: user.clinicId || user.id });
      const clinicName = clinic?.clinicName || 'La tua clinica veterinaria';

      // Prepare attachments if PDF content exists
      const attachments = [];
      if (doc.content && doc.content.startsWith('data:')) {
        // Extract base64 content
        const base64Data = doc.content.split(',')[1];
        const mimeType = doc.content.split(';')[0].split(':')[1];
        attachments.push({
          filename: doc.fileName || `${doc.name}.pdf`,
          content: base64Data,
          type: mimeType || 'application/pdf'
        });
      }

      // Different templates based on document type
      const templates = {
        prescrizione: {
          subject: `📋 Prescrizione per ${doc.petName || 'il tuo animale'} - ${clinicName}`,
          intro: 'Ti inviamo la prescrizione richiesta.',
          cta: 'Segui attentamente le istruzioni indicate. Per qualsiasi dubbio, contattaci.',
          color: '#10B981'
        },
        referto: {
          subject: `📄 Referto di ${doc.petName || 'il tuo animale'} - ${clinicName}`,
          intro: 'Ti inviamo il referto della visita.',
          cta: 'Se hai domande sui risultati, prenota un follow-up con noi.',
          color: '#3B82F6'
        },
        fattura: {
          subject: `🧾 Fattura per ${doc.petName || 'il tuo animale'} - ${clinicName}`,
          intro: 'Ti inviamo la fattura relativa ai servizi prestati.',
          cta: 'Per informazioni sui pagamenti, contattaci.',
          color: '#F59E0B'
        }
      };
      const template = templates[doc.type] || {
        subject: `📎 Documento per ${doc.petName || 'il tuo animale'} - ${clinicName}`,
        intro: 'Ti inviamo un documento.',
        cta: '',
        color: '#6B7280'
      };

      const result = await sendEmail({
        to: recipientEmail,
        subject: template.subject,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: ${template.color}; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🐾 ${clinicName}</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Ciao,</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">${template.intro}</p>
              
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <table style="width: 100%;">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Documento:</td>
                    <td style="color: #111827; font-size: 14px; font-weight: 600; padding-bottom: 8px; text-align: right;">${doc.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Tipo:</td>
                    <td style="color: #111827; font-size: 14px; padding-bottom: 8px; text-align: right; text-transform: capitalize;">${doc.type || 'Documento'}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Animale:</td>
                    <td style="color: #111827; font-size: 14px; padding-bottom: 8px; text-align: right;">${doc.petName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px;">Data:</td>
                    <td style="color: #111827; font-size: 14px; text-align: right;">${new Date().toLocaleDateString('it-IT')}</td>
                  </tr>
                  ${doc.amount ? `
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; padding-top: 8px; border-top: 1px solid #e5e7eb;">Importo:</td>
                    <td style="color: #111827; font-size: 16px; font-weight: 700; padding-top: 8px; text-align: right; border-top: 1px solid #e5e7eb;">€${doc.amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${attachments.length > 0 ? `
              <p style="font-size: 14px; color: #059669; margin-bottom: 24px;">
                📎 <strong>Il documento è allegato a questa email.</strong>
              </p>
              ` : ''}

              ${template.cta ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">${template.cta}</p>` : ''}

              ${doc.notes ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Note:</strong> ${doc.notes}</p>
              </div>
              ` : ''}
            </div>
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">Documento inviato tramite <strong>vetbuddy</strong></p>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">La piattaforma per cliniche veterinarie e proprietari di animali</p>
            </div>
          </div>
        `,
        attachments: attachments.length > 0 ? attachments : undefined
      });

      // Update document status and audit log
      const auditEntry = {
        action: 'email_sent',
        sentBy: user.id,
        sentByName: user.name || user.clinicName,
        sentTo: recipientEmail,
        sentAt: new Date().toISOString(),
        hasAttachment: attachments.length > 0
      };

      await documents.updateOne(
        { id: documentId },
        { 
          $set: { 
            status: 'inviato',
            lastSentAt: new Date().toISOString(),
            lastSentTo: recipientEmail
          },
          $push: { auditLog: auditEntry }
        }
      );

      // Create inbox/timeline entry
      const messages = await getCollection('messages');
      await messages.insertOne({
        id: uuidv4(),
        type: 'document_sent',
        clinicId: user.clinicId || user.id,
        ownerId: doc.ownerId,
        documentId: documentId,
        subject: `${doc.type === 'prescrizione' ? 'Prescrizione' : doc.type === 'referto' ? 'Referto' : 'Documento'} inviato`,
        content: `${doc.name} inviato a ${recipientEmail}`,
        read: true,
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Documento inviato via email',
        hasAttachment: attachments.length > 0,
        auditEntry
      }, { headers: corsHeaders });
    }

    // Create Stripe checkout session for subscription
    if (path === 'stripe/checkout/subscription') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono sottoscrivere abbonamenti' }, { status: 401, headers: corsHeaders });
      }

      const { planId, originUrl } = body;
      const plan = SUBSCRIPTION_PLANS[planId];
      
      if (!plan || plan.price === 0) {
        return NextResponse.json({ error: 'Piano non valido o gratuito' }, { status: 400, headers: corsHeaders });
      }

      try {
        const successUrl = `${originUrl}/clinic/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${originUrl}/clinic/dashboard?subscription=cancelled`;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: {
                name: `vetbuddy ${plan.name}`,
                description: `Abbonamento mensile ${plan.name}`,
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
              recurring: { interval: 'month' },
            },
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: user.email,
          metadata: {
            userId: user.id,
            planId: planId,
            type: 'subscription'
          }
        });

        // Save transaction
        const transactions = await getCollection('payment_transactions');
        await transactions.insertOne({
          id: uuidv4(),
          sessionId: session.id,
          userId: user.id,
          email: user.email,
          type: 'subscription',
          planId: planId,
          amount: plan.price,
          currency: 'eur',
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Save clinic Stripe settings
    if (path === 'clinic/stripe-settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { stripePublishableKey, stripeSecretKey } = body;
      const users = await getCollection('users');
      
      await users.updateOne(
        { id: user.id },
        { $set: { stripePublishableKey, stripeSecretKey, updatedAt: new Date().toISOString() } }
      );

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Save Video Consult settings
    if (path === 'clinic/video-consult-settings') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const users = await getCollection('users');
      
      await users.updateOne(
        { id: user.id },
        { $set: { videoConsultSettings: body, updatedAt: new Date().toISOString() } }
      );

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Create payment session for visit (owner pays clinic)
    if (path === 'stripe/checkout/visit') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { appointmentId, clinicId, originUrl } = body;
      
      // Get clinic's Stripe keys
      const users = await getCollection('users');
      const clinic = await users.findOne({ id: clinicId, role: 'clinic' });
      
      if (!clinic?.stripeSecretKey) {
        return NextResponse.json({ error: 'La clinica non ha configurato i pagamenti online' }, { status: 400, headers: corsHeaders });
      }

      // Get appointment details
      const appointments = await getCollection('appointments');
      const appointment = await appointments.findOne({ id: appointmentId });
      
      if (!appointment || !appointment.price) {
        return NextResponse.json({ error: 'Appuntamento non trovato o senza prezzo' }, { status: 400, headers: corsHeaders });
      }

      try {
        // Use clinic's Stripe account
        const clinicStripe = new Stripe(clinic.stripeSecretKey);
        
        const successUrl = `${originUrl}/owner/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${originUrl}/owner/dashboard?payment=cancelled`;

        const session = await clinicStripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'eur',
              product_data: {
                name: appointment.reason || 'Visita veterinaria',
                description: `${appointment.petName} - ${appointment.date} ${appointment.time}`,
              },
              unit_amount: Math.round(appointment.price * 100),
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: user.email,
          metadata: {
            appointmentId: appointmentId,
            clinicId: clinicId,
            ownerId: user.id,
            type: 'visit'
          }
        });

        // Save transaction
        const transactions = await getCollection('payment_transactions');
        await transactions.insertOne({
          id: uuidv4(),
          sessionId: session.id,
          appointmentId: appointmentId,
          clinicId: clinicId,
          ownerId: user.id,
          email: user.email,
          type: 'visit',
          amount: appointment.price,
          currency: 'eur',
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString()
        });

        // Update appointment with payment session
        await appointments.updateOne(
          { id: appointmentId },
          { $set: { paymentSessionId: session.id, paymentStatus: 'pending' } }
        );

        return NextResponse.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Register owner to clinic
    if (path === 'owners') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { email, name, phone } = body;
      const users = await getCollection('users');
      
      // Check if owner exists
      let owner = await users.findOne({ email });
      
      if (owner) {
        // Link existing owner to clinic
        await users.updateOne({ email }, { $set: { clinicId: user.id } });
        owner = await users.findOne({ email }, { projection: { password: 0 } });
      } else {
        // Create new owner with temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        owner = {
          id: uuidv4(),
          email,
          password: hashPassword(tempPassword),
          name,
          role: 'owner',
          phone: phone || '',
          clinicId: user.id,
          createdAt: new Date().toISOString()
        };
        await users.insertOne(owner);
        delete owner.password;
      }

      return NextResponse.json(owner, { headers: corsHeaders });
    }

    // Submit clinic review
    if (path === 'reviews') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Solo i proprietari possono lasciare recensioni' }, { status: 401, headers: corsHeaders });
      }

      const { clinicId, overallRating, punctuality, competence, price, comment } = body;
      if (!clinicId || !overallRating) {
        return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400, headers: corsHeaders });
      }

      const reviews = await getCollection('reviews');
      
      // Check if user already reviewed this clinic
      const existing = await reviews.findOne({ clinicId, ownerId: user.id });
      if (existing) {
        return NextResponse.json({ error: 'Hai già recensito questa clinica' }, { status: 400, headers: corsHeaders });
      }

      const review = {
        id: uuidv4(),
        clinicId,
        ownerId: user.id,
        ownerName: user.name || 'Utente',
        overallRating: Math.min(5, Math.max(1, overallRating)),
        punctuality: punctuality ? Math.min(5, Math.max(1, punctuality)) : null,
        competence: competence ? Math.min(5, Math.max(1, competence)) : null,
        price: price ? Math.min(5, Math.max(1, price)) : null,
        comment: comment || '',
        createdAt: new Date().toISOString()
      };

      await reviews.insertOne(review);
      return NextResponse.json(review, { headers: corsHeaders });
    }

    // Add vaccination
    if (path === 'vaccinations') {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { petId, name, date, nextDue, notes } = body;
      const vaccinations = await getCollection('vaccinations');
      
      const vaccination = {
        id: uuidv4(),
        petId,
        name,
        date,
        nextDue,
        notes: notes || '',
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      await vaccinations.insertOne(vaccination);
      return NextResponse.json(vaccination, { headers: corsHeaders });
    }

    // ==================== REWARDS/PREMI API ====================
    
    // Create reward type (clinic defines available reward types)
    if (path === 'rewards/types') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono creare tipi di premio' }, { status: 401, headers: corsHeaders });
      }

      const { name, description, rewardType, value, icon } = body;
      
      if (!name || !rewardType) {
        return NextResponse.json({ error: 'Nome e tipo premio sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const rewards = await getCollection('rewards');
      
      const rewardDef = {
        id: uuidv4(),
        clinicId: user.id,
        type: 'definition',
        name,
        description: description || '',
        rewardType, // 'discount_percent', 'discount_fixed', 'free_service', 'free_product', 'gift'
        value: value || 0, // % or fixed amount
        icon: icon || 'Gift',
        active: true,
        createdAt: new Date().toISOString()
      };

      await rewards.insertOne(rewardDef);
      return NextResponse.json(rewardDef, { headers: corsHeaders });
    }

    // Assign reward to owner
    if (path === 'rewards/assign') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono assegnare premi' }, { status: 401, headers: corsHeaders });
      }

      const { ownerId, rewardTypeId, reason, expiresAt } = body;
      
      if (!ownerId || !rewardTypeId) {
        return NextResponse.json({ error: 'Proprietario e tipo premio sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const rewards = await getCollection('rewards');
      
      // Get reward type definition
      const rewardType = await rewards.findOne({ id: rewardTypeId, clinicId: user.id, type: 'definition' });
      if (!rewardType) {
        return NextResponse.json({ error: 'Tipo premio non trovato' }, { status: 404, headers: corsHeaders });
      }

      // Get owner info
      const users = await getCollection('users');
      const owner = await users.findOne({ id: ownerId });
      if (!owner) {
        return NextResponse.json({ error: 'Proprietario non trovato' }, { status: 404, headers: corsHeaders });
      }

      // Generate unique redeem code (6 chars alphanumeric)
      const generateRedeemCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars: I,O,0,1
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
      
      const redeemCode = generateRedeemCode();
      
      // Get clinic info to include in reward
      const clinic = await users.findOne({ id: user.id });
      
      const assignedReward = {
        id: uuidv4(),
        clinicId: user.id,
        clinicName: clinic?.clinicName || clinic?.name || 'Clinica',
        clinicEmail: clinic?.email,
        clinicWhatsapp: clinic?.whatsapp,
        ownerId,
        ownerName: owner.name,
        ownerEmail: owner.email,
        type: 'assigned',
        rewardTypeId,
        rewardName: rewardType.name,
        rewardDescription: rewardType.description,
        rewardType: rewardType.rewardType,
        rewardValue: rewardType.value,
        rewardIcon: rewardType.icon,
        redeemCode, // Unique code for redemption
        reason: reason || 'Premio fedeltà',
        status: 'available', // 'available', 'pending', 'used', 'expired'
        expiresAt: expiresAt || null,
        createdAt: new Date().toISOString(),
        redeemedAt: null, // When owner requests redemption online
        usedAt: null // When clinic confirms usage
      };

      await rewards.insertOne(assignedReward);
      
      // Send email notification to owner
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        
        // QR Code URL (using quickchart.io - more reliable for emails)
        const qrData = encodeURIComponent(`VETBUDDY:${redeemCode}`);
        const qrCodeUrl = `https://quickchart.io/qr?text=${qrData}&size=150&dark=FF6B6B&light=ffffff&ecLevel=M&format=png`;
        
        // Determine reward value display
        let rewardValueDisplay = '';
        if (rewardType.rewardType === 'discount_percent') {
          rewardValueDisplay = `<p style="font-size: 32px; color: #27AE60; font-weight: bold; margin: 15px 0 0 0;">-${rewardType.value}%</p>`;
        } else if (rewardType.rewardType === 'discount_fixed') {
          rewardValueDisplay = `<p style="font-size: 32px; color: #27AE60; font-weight: bold; margin: 15px 0 0 0;">-€${rewardType.value}</p>`;
        } else if (rewardType.rewardType === 'free_service' || rewardType.rewardType === 'free_product' || rewardType.rewardType === 'gift') {
          rewardValueDisplay = `<p style="font-size: 22px; color: #27AE60; font-weight: bold; margin: 15px 0 0 0;">🎁 GRATIS</p>`;
        }
        
        await sendEmail({
          to: owner.email,
          subject: `🎁 Hai ricevuto un premio da ${clinic?.clinicName || 'la tua clinica'}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #FF6B6B, #FFD93D); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎁 Hai un Premio!</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <p style="color: #666; font-size: 16px;">Ciao <strong>${owner.name || ''}</strong>,</p>
                <p style="color: #666; font-size: 16px;"><strong>${clinic?.clinicName}</strong> ti ha assegnato un premio fedeltà!</p>
                
                <!-- Premio Card -->
                <div style="background: white; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center; border: 2px dashed #FFD93D; box-shadow: 0 4px 15px rgba(255,107,107,0.1);">
                  <p style="font-size: 28px; margin: 0 0 10px 0;">🎁</p>
                  <h2 style="color: #FF6B6B; margin: 0 0 10px 0; font-size: 24px;">${rewardType.name}</h2>
                  <p style="color: #666; margin: 0; font-size: 14px;">${rewardType.description || ''}</p>
                  ${rewardValueDisplay}
                </div>
                
                <!-- Codice Univoco - BIG AND CLEAR -->
                <div style="background: #333; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center;">
                  <p style="color: #FFD93D; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 3px;">🎟️ Il tuo codice premio</p>
                  <p style="color: white; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${redeemCode}</p>
                  <p style="color: #aaa; margin: 15px 0 0 0; font-size: 12px;">Comunica questo codice in clinica</p>
                </div>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin-top: 20px;">
                  <strong>Motivo:</strong> ${reason || 'Premio fedeltà'}
                </p>
                ${expiresAt ? `<p style="color: #E74C3C; font-size: 14px; text-align: center; background: #FFF5F5; padding: 10px; border-radius: 8px;">⚠️ <strong>Scade il:</strong> ${new Date(expiresAt).toLocaleDateString('it-IT')}</p>` : ''}
                
                <!-- Istruzioni Riscatto - SIMPLIFIED -->
                <div style="background: #E8F5E9; padding: 20px; border-radius: 10px; margin: 25px 0;">
                  <h3 style="color: #27AE60; margin: 0 0 15px 0; font-size: 16px;">📋 Come usare il premio:</h3>
                  <ol style="color: #666; margin: 0; padding-left: 20px; line-height: 2;">
                    <li><strong>In clinica:</strong> Comunica il codice <strong style="background: #333; color: #FFD93D; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${redeemCode}</strong> al momento del pagamento</li>
                    <li><strong>Online:</strong> Clicca "Riscatta Online" qui sotto per prenotare l'utilizzo</li>
                  </ol>
                </div>
                
                <!-- CTA Buttons -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}?action=rewards" style="display: inline-block; background: #FF6B6B; color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255,107,107,0.4);">
                    🎁 Riscatta Online
                  </a>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                  Il premio verrà applicato quando lo comunichi in clinica. Grazie per la tua fedeltà! 🐾
                </p>
              </div>
              <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
              </div>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Error sending reward email:', emailErr);
      }

      return NextResponse.json(assignedReward, { headers: corsHeaders });
    }
    
    // Redeem reward online (owner requests to use it)
    if (path === 'rewards/redeem') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'owner') {
        return NextResponse.json({ error: 'Solo i proprietari possono riscattare i premi' }, { status: 401, headers: corsHeaders });
      }

      const { rewardId } = body;
      
      if (!rewardId) {
        return NextResponse.json({ error: 'ID premio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const rewards = await getCollection('rewards');
      const reward = await rewards.findOne({ id: rewardId, ownerId: user.id, type: 'assigned' });
      
      if (!reward) {
        return NextResponse.json({ error: 'Premio non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      if (reward.status !== 'available') {
        return NextResponse.json({ error: 'Questo premio non è più disponibile' }, { status: 400, headers: corsHeaders });
      }
      
      // Check expiration
      if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
        await rewards.updateOne({ id: rewardId }, { $set: { status: 'expired' } });
        return NextResponse.json({ error: 'Questo premio è scaduto' }, { status: 400, headers: corsHeaders });
      }
      
      // Update reward status to pending (waiting for clinic confirmation)
      await rewards.updateOne(
        { id: rewardId },
        { $set: { status: 'pending', redeemedAt: new Date().toISOString() } }
      );
      
      // Notify clinic about the redemption request
      try {
        const users = await getCollection('users');
        const clinic = await users.findOne({ id: reward.clinicId });
        const owner = await users.findOne({ id: user.id });
        
        if (clinic?.email) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          
          await sendEmail({
            to: clinic.email,
            subject: `🎁 Richiesta riscatto premio da ${owner?.name || 'un cliente'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FFD93D); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🎁 Richiesta Riscatto Premio</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p style="color: #666; font-size: 16px;"><strong>${owner?.name || 'Un cliente'}</strong> vuole riscattare un premio!</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FFD93D;">
                    <h3 style="color: #FF6B6B; margin: 0 0 10px 0;">${reward.rewardName}</h3>
                    <p style="color: #666; margin: 0;">Codice: <strong style="font-family: monospace; font-size: 18px;">${reward.redeemCode}</strong></p>
                    <p style="color: #888; margin: 10px 0 0 0; font-size: 14px;">Cliente: ${owner?.email}</p>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    Quando il cliente si presenta o utilizza il servizio, conferma l'utilizzo del premio dalla tua dashboard.
                  </p>
                  
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${baseUrl}?tab=rewards" style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">
                      ✓ Gestisci Premi
                    </a>
                  </div>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Error sending redemption notification:', emailErr);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Premio riscattato! La clinica è stata notificata.',
        reward: { ...reward, status: 'pending', redeemedAt: new Date().toISOString() }
      }, { headers: corsHeaders });
    }

    // Mark reward as used
    if (path === 'rewards/use') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono segnare i premi come usati' }, { status: 401, headers: corsHeaders });
      }

      const { rewardId } = body;
      
      if (!rewardId) {
        return NextResponse.json({ error: 'ID premio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const rewards = await getCollection('rewards');
      const reward = await rewards.findOne({ id: rewardId, clinicId: user.id, type: 'assigned' });
      
      if (!reward) {
        return NextResponse.json({ error: 'Premio non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      if (reward.status === 'used') {
        return NextResponse.json({ error: 'Premio già utilizzato' }, { status: 400, headers: corsHeaders });
      }

      await rewards.updateOne(
        { id: rewardId },
        { $set: { status: 'used', usedAt: new Date().toISOString() } }
      );

      return NextResponse.json({ success: true, message: 'Premio segnato come utilizzato' }, { headers: corsHeaders });
    }

    // ==================== LAB MODULE API - POST ====================
    
    // ===== LAB REGISTRATION (Public - Self Registration) =====
    if (path === 'labs/register') {
      const { 
        email, password, labName, vatNumber, phone, address, city, province,
        contactPerson, description, specializations, pickupAvailable, pickupDays, pickupHours,
        averageReportTime, latitude, longitude, invitationToken
      } = body;
      
      if (!email || !password || !labName) {
        return NextResponse.json({ error: 'Email, password e nome laboratorio sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const existing = await users.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'Email già registrata' }, { status: 400, headers: corsHeaders });
      }

      const hashedPassword = await hashPassword(password);
      const labId = uuidv4();
      const lab = {
        id: labId,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'lab',
        labName, name: labName,
        vatNumber: vatNumber || '',
        phone: phone || '', address: address || '', city: city || '', province: province || '',
        contactPerson: contactPerson || '',
        description: description || '',
        specializations: specializations || [],
        pickupAvailable: pickupAvailable || false,
        pickupDays: pickupDays || '',
        pickupHours: pickupHours || '',
        averageReportTime: averageReportTime || '',
        latitude: latitude || null, longitude: longitude || null,
        logoUrl: '',
        status: 'pending_approval', // pending_approval, active, suspended, rejected
        isApproved: false,
        plan: 'partner_free',
        freeUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months free
        requestsCount: 0,
        maxFreeRequests: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await users.insertOne(lab);

      // If invitation token provided, auto-connect with clinic
      if (invitationToken) {
        const labInvitations = await getCollection('lab_invitations');
        const invitation = await labInvitations.findOne({ token: invitationToken, status: 'pending' });
        if (invitation && invitation.email.toLowerCase() === email.toLowerCase()) {
          // Accept invitation
          await labInvitations.updateOne({ token: invitationToken }, { $set: { status: 'accepted', acceptedAt: new Date().toISOString(), labId } });
          
          // Create connection
          const connections = await getCollection('clinic_lab_connections');
          await connections.insertOne({
            id: uuidv4(), clinicId: invitation.clinicId, labId, status: 'active',
            invitedByClinicId: invitation.clinicId, invitationEmail: email,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          });

          // Auto-approve if invited
          await users.updateOne({ id: labId }, { $set: { status: 'active', isApproved: true } });
          lab.status = 'active';
          lab.isApproved = true;
        }
      }

      // Notify admin
      try {
        await sendEmail({
          to: 'admin@vetbuddy.it',
          subject: '🧪 Nuovo laboratorio registrato - VetBuddy',
          html: `<p>Un nuovo laboratorio si è registrato:</p><p><strong>${labName}</strong> - ${city || 'N/D'}</p><p>Email: ${email}</p><p>Stato: ${lab.status === 'active' ? 'Attivo (invitato)' : 'In attesa di approvazione'}</p>`
        });
      } catch (e) { console.error('Admin notification error:', e); }

      const { password: _, ...labSafe } = lab;
      const token = generateToken(lab);
      return NextResponse.json({ ...labSafe, token }, { headers: corsHeaders });
    }

    // ===== CLINIC INVITES LAB =====
    if (path === 'clinic/invite-lab') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono invitare laboratori' }, { status: 401, headers: corsHeaders });
      }

      const { email, message } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email laboratorio obbligatoria' }, { status: 400, headers: corsHeaders });
      }

      const labInvitations = await getCollection('lab_invitations');
      
      // Check if already invited
      const existingInvitation = await labInvitations.findOne({ clinicId: user.id, email: email.toLowerCase(), status: 'pending' });
      if (existingInvitation) {
        return NextResponse.json({ error: 'Invito già inviato a questo laboratorio' }, { status: 400, headers: corsHeaders });
      }

      // Check if lab already registered
      const users = await getCollection('users');
      const existingLab = await users.findOne({ email: email.toLowerCase(), role: 'lab' });
      
      if (existingLab) {
        // Lab already exists - create connection directly
        const connections = await getCollection('clinic_lab_connections');
        const existingConn = await connections.findOne({ clinicId: user.id, labId: existingLab.id, status: { $in: ['active', 'pending'] } });
        if (existingConn) {
          return NextResponse.json({ error: 'Già collegato a questo laboratorio' }, { status: 400, headers: corsHeaders });
        }
        await connections.insertOne({
          id: uuidv4(), clinicId: user.id, labId: existingLab.id, status: 'pending',
          invitedByClinicId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        });
        return NextResponse.json({ success: true, message: 'Richiesta di collegamento inviata al laboratorio', alreadyRegistered: true }, { headers: corsHeaders });
      }

      // Create invitation token
      const token = uuidv4();
      const invitation = {
        id: uuidv4(), clinicId: user.id, clinicName: user.clinicName || user.name,
        email: email.toLowerCase(), token, status: 'pending',
        message: message || '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        createdAt: new Date().toISOString()
      };
      await labInvitations.insertOne(invitation);

      // Send invitation email
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
      try {
        await sendEmail({
          to: email,
          subject: `🧪 Invito a VetBuddy da ${user.clinicName || user.name}`,
          html: `
            <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #7C3AED;">🧪 Sei stato invitato su VetBuddy!</h2>
              <p>La clinica veterinaria <strong>${user.clinicName || user.name}</strong> ti invita a registrarti come laboratorio partner su VetBuddy.</p>
              ${message ? `<p style="background: #F3F4F6; padding: 12px; border-radius: 8px;"><em>"${message}"</em></p>` : ''}
              <p>VetBuddy è la piattaforma che connette cliniche veterinarie e laboratori di analisi.</p>
              <ul>
                <li>Registrazione gratuita</li>
                <li>6 mesi gratis o 50 richieste gestite</li>
                <li>Dashboard per gestire richieste e referti</li>
                <li>Profilo nel marketplace laboratori</li>
              </ul>
              <a href="${baseUrl}?invite=${token}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">Accetta Invito e Registrati</a>
              <p style="color: #6B7280; font-size: 12px;">L'invito scade tra 30 giorni.</p>
            </div>`
        });
      } catch (e) { console.error('Invitation email error:', e); }

      return NextResponse.json({ success: true, message: 'Invito inviato con successo', invitationId: invitation.id }, { headers: corsHeaders });
    }

    // ===== LAB ACCEPTS/REJECTS CONNECTION =====
    if (path === 'lab/connection-response') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { connectionId, action } = body; // action: 'accept' or 'reject'
      if (!connectionId || !action) {
        return NextResponse.json({ error: 'Dati mancanti' }, { status: 400, headers: corsHeaders });
      }

      const connections = await getCollection('clinic_lab_connections');
      const conn = await connections.findOne({ id: connectionId, labId: user.id });
      if (!conn) {
        return NextResponse.json({ error: 'Collegamento non trovato' }, { status: 404, headers: corsHeaders });
      }

      const newStatus = action === 'accept' ? 'active' : 'rejected';
      await connections.updateOne({ id: connectionId }, { $set: { status: newStatus, updatedAt: new Date().toISOString() } });

      return NextResponse.json({ success: true, message: action === 'accept' ? 'Collegamento accettato' : 'Collegamento rifiutato' }, { headers: corsHeaders });
    }

    // ===== LAB PROFILE UPDATE =====
    if (path === 'lab/profile') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { labName, vatNumber, phone, address, city, province, contactPerson, description,
        specializations, pickupAvailable, pickupDays, pickupHours, averageReportTime, latitude, longitude, logoUrl } = body;

      const updateData = {};
      if (labName !== undefined) { updateData.labName = labName; updateData.name = labName; }
      if (vatNumber !== undefined) updateData.vatNumber = vatNumber;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (province !== undefined) updateData.province = province;
      if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
      if (description !== undefined) updateData.description = description;
      if (specializations !== undefined) updateData.specializations = specializations;
      if (pickupAvailable !== undefined) updateData.pickupAvailable = pickupAvailable;
      if (pickupDays !== undefined) updateData.pickupDays = pickupDays;
      if (pickupHours !== undefined) updateData.pickupHours = pickupHours;
      if (averageReportTime !== undefined) updateData.averageReportTime = averageReportTime;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      updateData.updatedAt = new Date().toISOString();

      const users = await getCollection('users');
      await users.updateOne({ id: user.id }, { $set: updateData });

      return NextResponse.json({ success: true, message: 'Profilo aggiornato' }, { headers: corsHeaders });
    }

    // ===== LAB PRICE LIST MANAGEMENT =====
    if (path === 'lab/price-list') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'lab') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { prices } = body; // Array of price items
      if (!prices || !Array.isArray(prices)) {
        return NextResponse.json({ error: 'Lista prezzi non valida' }, { status: 400, headers: corsHeaders });
      }

      const labPriceList = await getCollection('lab_price_list');
      
      // Delete existing prices for this lab
      await labPriceList.deleteMany({ labId: user.id });
      
      // Insert new prices
      const priceItems = prices.map(p => ({
        id: uuidv4(),
        labId: user.id,
        examType: p.examType, // sangue, urine, feci, biopsia, citologia, istologia, genetico, allergologia, microbiologia, parassitologia, altro
        title: p.title || '',
        description: p.description || '',
        priceFrom: p.priceFrom || 0,
        priceTo: p.priceTo || null,
        priceOnRequest: p.priceOnRequest || false,
        averageDeliveryTime: p.averageDeliveryTime || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      if (priceItems.length > 0) {
        await labPriceList.insertMany(priceItems);
      }

      return NextResponse.json({ success: true, message: 'Listino aggiornato', count: priceItems.length }, { headers: corsHeaders });
    }

    // ===== CLINIC REQUEST CONNECTION WITH LAB =====
    if (path === 'clinic/lab-connection') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { labId } = body;
      if (!labId) {
        return NextResponse.json({ error: 'ID laboratorio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const connections = await getCollection('clinic_lab_connections');
      const existing = await connections.findOne({ clinicId: user.id, labId, status: { $in: ['active', 'pending'] } });
      if (existing) {
        return NextResponse.json({ error: 'Collegamento già esistente o in attesa' }, { status: 400, headers: corsHeaders });
      }

      await connections.insertOne({
        id: uuidv4(), clinicId: user.id, labId, status: 'pending',
        invitedByClinicId: user.id,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });

      // Notify lab
      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId });
      if (lab?.email) {
        try {
          await sendEmail({
            to: lab.email,
            subject: `🔗 Nuova richiesta di collegamento - ${user.clinicName || user.name}`,
            html: `<p>La clinica <strong>${user.clinicName || user.name}</strong> vuole collegarsi con il tuo laboratorio su VetBuddy.</p><p>Accedi alla tua dashboard per accettare o rifiutare.</p>`
          });
        } catch (e) { console.error('Connection notification error:', e); }
      }

      return NextResponse.json({ success: true, message: 'Richiesta di collegamento inviata' }, { headers: corsHeaders });
    }

    // ===== ADMIN: Update Lab Status =====
    if (path.match(/^admin\/labs\/[^/]+\/status$/)) {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo admin' }, { status: 403, headers: corsHeaders });
      }

      const labId = path.split('/')[2];
      const { status: newStatus, reason } = body; // active, suspended, rejected

      const validStatuses = ['active', 'suspended', 'rejected', 'pending_approval'];
      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json({ error: 'Stato non valido' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId, role: 'lab' });
      if (!lab) {
        return NextResponse.json({ error: 'Laboratorio non trovato' }, { status: 404, headers: corsHeaders });
      }

      await users.updateOne({ id: labId }, { $set: { 
        status: newStatus, 
        isApproved: newStatus === 'active',
        approvedAt: newStatus === 'active' ? new Date().toISOString() : lab.approvedAt,
        approvedBy: newStatus === 'active' ? user.id : lab.approvedBy,
        rejectionReason: reason || '',
        updatedAt: new Date().toISOString()
      }});

      // Notify lab
      if (lab.email) {
        const statusMessages = {
          'active': { emoji: '✅', text: 'approvato', detail: 'Puoi ora accedere alla tua dashboard e iniziare a ricevere richieste dalle cliniche.' },
          'suspended': { emoji: '⚠️', text: 'sospeso', detail: reason ? `Motivo: ${reason}` : 'Contatta il supporto per maggiori informazioni.' },
          'rejected': { emoji: '❌', text: 'rifiutato', detail: reason ? `Motivo: ${reason}` : 'Contatta il supporto per maggiori informazioni.' }
        };
        const msg = statusMessages[newStatus];
        if (msg) {
          try {
            await sendEmail({
              to: lab.email,
              subject: `${msg.emoji} Il tuo laboratorio è stato ${msg.text} - VetBuddy`,
              html: `<p>Il laboratorio <strong>${lab.labName}</strong> è stato <strong>${msg.text}</strong> su VetBuddy.</p><p>${msg.detail}</p>`
            });
          } catch (e) { console.error('Lab status email error:', e); }
        }
      }

      return NextResponse.json({ success: true, message: `Laboratorio ${newStatus}` }, { headers: corsHeaders });
    }
    
    // Create lab request (clinic creates request)
    if (path === 'lab-requests') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'clinic') {
        return NextResponse.json({ error: 'Solo le cliniche possono creare richieste di analisi' }, { status: 401, headers: corsHeaders });
      }

      const { petId, labId, examCategory, examType, examName, title, clinicalNotes, internalNotes, priority, attachments } = body;
      
      if (!petId || !labId || !examType) {
        return NextResponse.json({ error: 'Pet, laboratorio e tipo esame sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      // Get pet and owner info
      const pets = await getCollection('pets');
      const pet = await pets.findOne({ id: petId });
      if (!pet) {
        return NextResponse.json({ error: 'Pet non trovato' }, { status: 404, headers: corsHeaders });
      }

      // Get lab info
      const users = await getCollection('users');
      const lab = await users.findOne({ id: labId, role: 'lab' });
      if (!lab) {
        return NextResponse.json({ error: 'Laboratorio non trovato' }, { status: 404, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      
      const labRequest = {
        id: uuidv4(),
        petId,
        petName: pet.name,
        petSpecies: pet.species,
        ownerId: pet.ownerId,
        clinicId: user.id,
        labId,
        veterinarianId: user.id, // For now, same as clinic
        examCategory: examCategory || '',
        examType,
        examName: examName || examType,
        title: title || `Analisi ${examName || examType}`,
        clinicalNotes: clinicalNotes || '',
        internalNotes: internalNotes || '', // Notes between clinic and lab only
        priority: priority || 'normal', // 'urgent', 'normal', 'low'
        status: 'pending',
        sampleCode: `SC-${Date.now().toString(36).toUpperCase()}`,
        attachments: attachments || [], // Array of { name, url, type }
        statusHistory: [{
          status: 'pending',
          note: 'Richiesta creata',
          updatedBy: user.id,
          updatedByName: user.clinicName || user.name,
          updatedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await labRequests.insertOne(labRequest);

      // Notify lab via email
      try {
        if (lab.email) {
          const clinic = await users.findOne({ id: user.id });
          await sendEmail({
            to: lab.email,
            subject: `🧪 Nuova richiesta analisi da ${clinic?.clinicName || 'Clinica'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🧪 Nuova Richiesta Analisi</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p style="color: #374151; font-size: 16px;">Hai ricevuto una nuova richiesta di analisi.</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #6366f1;">
                    <p style="margin: 5px 0;"><strong>Clinica:</strong> ${clinic?.clinicName || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Paziente:</strong> ${pet.name} (${pet.species})</p>
                    <p style="margin: 5px 0;"><strong>Esame:</strong> ${examName || examType}</p>
                    <p style="margin: 5px 0;"><strong>Priorità:</strong> ${priority === 'urgent' ? '🔴 URGENTE' : priority === 'low' ? '🟢 Bassa' : '🟡 Normale'}</p>
                    <p style="margin: 5px 0;"><strong>Codice campione:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${labRequest.sampleCode}</code></p>
                  </div>
                  
                  ${clinicalNotes ? `<p style="color: #374151;"><strong>Note cliniche:</strong><br/>${clinicalNotes}</p>` : ''}
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Accedi alla tua dashboard per gestire la richiesta.</p>
                </div>
                <div style="background: #1f2937; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">© 2025 vetbuddy - Sistema Analisi Laboratorio</p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Error sending lab request notification:', emailErr);
      }

      return NextResponse.json(labRequest, { headers: corsHeaders });
    }
    
    // Update lab request status (lab updates)
    if (path === 'lab-requests/update-status') {
      const user = getUserFromRequest(request);
      if (!user || (user.role !== 'lab' && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
      }

      const { requestId, status, note, sampleCode } = body;
      
      if (!requestId || !status) {
        return NextResponse.json({ error: 'ID richiesta e stato sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: requestId });
      
      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404, headers: corsHeaders });
      }

      if (user.role === 'lab' && labRequest.labId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato per questa richiesta' }, { status: 401, headers: corsHeaders });
      }

      const statusEntry = {
        status,
        note: note || '',
        updatedBy: user.id,
        updatedByName: user.labName || user.name,
        updatedAt: new Date().toISOString()
      };

      const updateData = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (sampleCode) {
        updateData.sampleCode = sampleCode;
      }

      await labRequests.updateOne(
        { id: requestId },
        { 
          $set: updateData,
          $push: { statusHistory: statusEntry }
        }
      );

      // Notify clinic about status change
      try {
        const users = await getCollection('users');
        const clinic = await users.findOne({ id: labRequest.clinicId });
        const lab = await users.findOne({ id: labRequest.labId });
        
        if (clinic?.email) {
          const statusLabel = LAB_REQUEST_STATUSES.find(s => s.id === status)?.name || status;
          await sendEmail({
            to: clinic.email,
            subject: `🧪 Aggiornamento analisi: ${statusLabel}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 25px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🧪 Aggiornamento Analisi</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p style="color: #374151;">Il laboratorio <strong>${lab?.labName || 'Laboratorio'}</strong> ha aggiornato lo stato della richiesta.</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                    <p style="font-size: 18px; color: #6366f1; margin: 0;"><strong>${statusLabel}</strong></p>
                    ${note ? `<p style="color: #6b7280; margin-top: 10px;">${note}</p>` : ''}
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;"><strong>Paziente:</strong> ${labRequest.petName}</p>
                  <p style="color: #6b7280; font-size: 14px;"><strong>Esame:</strong> ${labRequest.examName}</p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Error sending status update notification:', emailErr);
      }

      const updated = await labRequests.findOne({ id: requestId });
      return NextResponse.json(updated, { headers: corsHeaders });
    }
    
    // Upload lab report (lab uploads PDF)
    if (path === 'lab-reports') {
      const user = getUserFromRequest(request);
      if (!user || (user.role !== 'lab' && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Solo i laboratori possono caricare referti' }, { status: 401, headers: corsHeaders });
      }

      const { labRequestId, fileName, fileContent, reportNotes } = body;
      
      if (!labRequestId || !fileContent) {
        return NextResponse.json({ error: 'Richiesta e file sono obbligatori' }, { status: 400, headers: corsHeaders });
      }

      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: labRequestId });
      
      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404, headers: corsHeaders });
      }

      if (user.role === 'lab' && labRequest.labId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato per questa richiesta' }, { status: 401, headers: corsHeaders });
      }

      const labReports = await getCollection('lab_reports');
      
      const report = {
        id: uuidv4(),
        labRequestId,
        petId: labRequest.petId,
        ownerId: labRequest.ownerId,
        clinicId: labRequest.clinicId,
        labId: labRequest.labId,
        examType: labRequest.examType,
        examName: labRequest.examName,
        fileName: fileName || `Referto_${labRequest.sampleCode}.pdf`,
        fileContent, // Base64 PDF content
        reportNotes: reportNotes || '', // Notes from lab
        clinicNotes: '', // Notes from clinic for owner (added when sending)
        visibleToOwner: false, // DEFAULT FALSE - clinic must review and send
        sentToOwnerAt: null, // When clinic sends to owner
        sentToOwnerBy: null, // Who sent it
        uploadedBy: user.id,
        uploadedByName: user.labName || user.name,
        uploadedAt: new Date().toISOString()
      };

      await labReports.insertOne(report);

      // Update lab request status to report_ready
      await labRequests.updateOne(
        { id: labRequestId },
        { 
          $set: { 
            status: 'report_ready', 
            updatedAt: new Date().toISOString() 
          },
          $push: { 
            statusHistory: {
              status: 'report_ready',
              note: 'Referto caricato dal laboratorio - In attesa di revisione clinica',
              updatedBy: user.id,
              updatedByName: user.labName || user.name,
              updatedAt: new Date().toISOString()
            }
          }
        }
      );

      // Notify clinic that report is ready for review
      try {
        const users = await getCollection('users');
        const clinic = await users.findOne({ id: labRequest.clinicId });
        const lab = await users.findOne({ id: labRequest.labId });
        
        if (clinic?.email) {
          await sendEmail({
            to: clinic.email,
            subject: `🧪 Referto da revisionare: ${labRequest.examName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🧪 Nuovo Referto da Revisionare</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p style="color: #374151;">Il laboratorio <strong>${lab?.labName || 'Laboratorio'}</strong> ha caricato un referto.</p>
                  <p style="color: #374151;"><strong>⚠️ Il referto deve essere revisionato prima di essere inviato al proprietario.</strong></p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <p style="margin: 5px 0;"><strong>Paziente:</strong> ${labRequest.petName}</p>
                    <p style="margin: 5px 0;"><strong>Esame:</strong> ${labRequest.examName}</p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">Accedi alla dashboard per revisionare il referto e inviarlo al proprietario con le tue note cliniche.</p>
                </div>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Error sending report notification:', emailErr);
      }

      return NextResponse.json(report, { headers: corsHeaders });
    }
    
    // Clinic sends report to owner (after review)
    if (path === 'lab-reports/send-to-owner') {
      const user = getUserFromRequest(request);
      if (!user || (user.role !== 'clinic' && user.role !== 'admin')) {
        return NextResponse.json({ error: 'Solo le cliniche possono inviare referti ai proprietari' }, { status: 401, headers: corsHeaders });
      }

      const { reportId, clinicNotes, notifyOwner } = body;
      
      if (!reportId) {
        return NextResponse.json({ error: 'ID referto obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const labReports = await getCollection('lab_reports');
      const report = await labReports.findOne({ id: reportId });
      
      if (!report) {
        return NextResponse.json({ error: 'Referto non trovato' }, { status: 404, headers: corsHeaders });
      }

      if (user.role === 'clinic' && report.clinicId !== user.id) {
        return NextResponse.json({ error: 'Non autorizzato per questo referto' }, { status: 401, headers: corsHeaders });
      }

      // Update report to be visible to owner
      await labReports.updateOne(
        { id: reportId },
        { 
          $set: { 
            visibleToOwner: true,
            clinicNotes: clinicNotes || '',
            sentToOwnerAt: new Date().toISOString(),
            sentToOwnerBy: user.id
          }
        }
      );

      // Update lab request status to completed
      const labRequests = await getCollection('lab_requests');
      await labRequests.updateOne(
        { id: report.labRequestId },
        { 
          $set: { 
            status: 'completed', 
            updatedAt: new Date().toISOString() 
          },
          $push: { 
            statusHistory: {
              status: 'completed',
              note: 'Referto revisionato e inviato al proprietario',
              updatedBy: user.id,
              updatedByName: user.clinicName || user.name,
              updatedAt: new Date().toISOString()
            }
          }
        }
      );

      // Notify owner if requested
      if (notifyOwner !== false) {
        try {
          const users = await getCollection('users');
          const pets = await getCollection('pets');
          const owner = await users.findOne({ id: report.ownerId });
          const pet = await pets.findOne({ id: report.petId });
          const clinic = await users.findOne({ id: report.clinicId });
          
          if (owner?.email) {
            await sendEmail({
              to: owner.email,
              subject: `🐾 Nuovo referto disponibile per ${pet?.name || 'il tuo animale'}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #FF6B6B, #f97316); padding: 25px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🐾 Nuovo Referto Disponibile</h1>
                  </div>
                  <div style="padding: 30px; background: #f9fafb;">
                    <p style="color: #374151;">Ciao <strong>${owner.name || 'Proprietario'}</strong>,</p>
                    <p style="color: #374151;">La clinica <strong>${clinic?.clinicName || 'La tua clinica'}</strong> ha condiviso un nuovo referto per <strong>${pet?.name || 'il tuo animale'}</strong>.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                      <p style="margin: 5px 0;"><strong>Esame:</strong> ${report.examName}</p>
                      <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
                    </div>
                    
                    ${clinicNotes ? `
                    <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0;">
                      <p style="margin: 0; color: #92400e;"><strong>📝 Note dalla clinica:</strong></p>
                      <p style="margin: 10px 0 0 0; color: #78350f;">${clinicNotes}</p>
                    </div>
                    ` : ''}
                    
                    <p style="color: #6b7280; font-size: 14px;">Accedi alla tua area personale per visualizzare e scaricare il referto completo.</p>
                  </div>
                </div>
              `
            });
          }
        } catch (emailErr) {
          console.error('Error sending owner notification:', emailErr);
        }
      }

      return NextResponse.json({ success: true, message: 'Referto inviato al proprietario' }, { headers: corsHeaders });
    }
    
    // Admin: Approve lab
    if (path === 'admin/labs/approve') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo admin possono approvare laboratori' }, { status: 401, headers: corsHeaders });
      }

      const { labId } = body;
      if (!labId) {
        return NextResponse.json({ error: 'ID laboratorio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const users = await getCollection('users');
      await users.updateOne(
        { id: labId, role: 'lab' },
        { $set: { isApproved: true, approvedAt: new Date().toISOString(), approvedBy: user.id } }
      );

      return NextResponse.json({ success: true, message: 'Laboratorio approvato' }, { headers: corsHeaders });
    }

    // Admin: Update lab integration settings
    if (path === 'admin/labs/integration') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo admin possono configurare integrazioni' }, { status: 401, headers: corsHeaders });
      }

      const { labId, integrationType, apiEndpoint, apiKey, webhookSecret, autoSync, examTypeMapping } = body;
      if (!labId) {
        return NextResponse.json({ error: 'ID laboratorio obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      const labIntegrations = await getCollection('lab_integrations');
      const integrationId = require('crypto').randomUUID();
      
      await labIntegrations.updateOne(
        { labId },
        {
          $set: {
            labId,
            integrationType: integrationType || 'manual', // manual, api, lis_hl7, webhook
            apiEndpoint: apiEndpoint || null,
            apiKey: apiKey || null,
            webhookSecret: webhookSecret || require('crypto').randomBytes(32).toString('hex'),
            autoSync: autoSync || false,
            examTypeMapping: examTypeMapping || {},
            updatedAt: new Date().toISOString(),
            updatedBy: user.id
          },
          $setOnInsert: {
            id: integrationId,
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Configurazione integrazione aggiornata',
        integrationId 
      }, { headers: corsHeaders });
    }

    // Webhook: Receive lab results from external system
    if (path === 'webhooks/lab-results') {
      // This endpoint accepts results from external lab systems
      const webhookSecret = request.headers.get('x-webhook-secret');
      
      if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret mancante' }, { status: 401, headers: corsHeaders });
      }

      // Validate webhook secret against lab integration config
      const labIntegrations = await getCollection('lab_integrations');
      const integration = await labIntegrations.findOne({ webhookSecret });
      
      if (!integration) {
        return NextResponse.json({ error: 'Webhook secret non valido' }, { status: 401, headers: corsHeaders });
      }

      const { requestId, results, status, reportPdfBase64, reportFileName, notes } = body;
      
      if (!requestId) {
        return NextResponse.json({ error: 'ID richiesta obbligatorio' }, { status: 400, headers: corsHeaders });
      }

      // Find the lab request
      const labRequests = await getCollection('lab_requests');
      const labRequest = await labRequests.findOne({ id: requestId, labId: integration.labId });
      
      if (!labRequest) {
        return NextResponse.json({ error: 'Richiesta non trovata per questo laboratorio' }, { status: 404, headers: corsHeaders });
      }

      // Log the webhook event
      const webhookLogs = await getCollection('webhook_logs');
      await webhookLogs.insertOne({
        id: require('crypto').randomUUID(),
        labId: integration.labId,
        requestId,
        eventType: 'lab_result',
        payload: { results, status, hasReport: !!reportPdfBase64, notes },
        processedAt: new Date().toISOString(),
        success: true
      });

      // If report PDF is provided, create a lab report
      if (reportPdfBase64) {
        const labReports = await getCollection('lab_reports');
        const reportId = require('crypto').randomUUID();
        
        await labReports.insertOne({
          id: reportId,
          labRequestId: requestId,
          labId: integration.labId,
          clinicId: labRequest.clinicId,
          petId: labRequest.petId,
          ownerId: labRequest.ownerId,
          fileName: reportFileName || `report_${requestId.slice(0,8)}.pdf`,
          fileContent: reportPdfBase64,
          reportNotes: notes || '',
          visibleToOwner: false,
          source: 'webhook_auto',
          uploadedAt: new Date().toISOString()
        });

        // Update request status
        await labRequests.updateOne(
          { id: requestId },
          {
            $set: { status: 'report_ready', updatedAt: new Date().toISOString() },
            $push: {
              statusHistory: {
                status: 'report_ready',
                note: 'Referto ricevuto automaticamente via integrazione',
                updatedBy: 'system_webhook',
                updatedByName: 'Sistema Automatico',
                updatedAt: new Date().toISOString()
              }
            }
          }
        );
      } else if (status) {
        // Just update status
        await labRequests.updateOne(
          { id: requestId },
          {
            $set: { status, updatedAt: new Date().toISOString() },
            $push: {
              statusHistory: {
                status,
                note: notes || 'Aggiornamento automatico via integrazione',
                updatedBy: 'system_webhook',
                updatedByName: 'Sistema Automatico',
                updatedAt: new Date().toISOString()
              }
            }
          }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Webhook ricevuto ed elaborato',
        requestId 
      }, { headers: corsHeaders });
    }
    
    // ==================== END LAB API - POST ====================

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();

    // Update appointment
    if (path.startsWith('appointments/')) {
      const id = path.split('/')[1];
      const appointments = await getCollection('appointments');
      await appointments.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      const updated = await appointments.findOne({ id });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Mark message as read
    if (path.startsWith('messages/')) {
      const id = path.split('/')[1];
      const messages = await getCollection('messages');
      await messages.updateOne({ id }, { $set: { read: true } });
      const updated = await messages.findOne({ id });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Update pet
    if (path.startsWith('pets/')) {
      const id = path.split('/')[1];
      const pets = await getCollection('pets');
      await pets.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      const updated = await pets.findOne({ id });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Update clinic profile (including location and services)
    if (path === 'clinic/profile') {
      const users = await getCollection('users');
      const { address, city, latitude, longitude, phone, whatsappNumber, website, services, googlePlaceId, googleRating, clinicName, vatNumber, description, openingTime, closingTime, cancellationPolicyText } = body;
      
      const updateData = { updatedAt: new Date().toISOString() };
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (phone !== undefined) updateData.phone = phone;
      if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
      if (website !== undefined) updateData.website = website;
      if (services !== undefined) updateData.services = services; // Array of service IDs
      if (googlePlaceId !== undefined) updateData.googlePlaceId = googlePlaceId;
      if (googleRating !== undefined) updateData.googleRating = googleRating;
      if (clinicName !== undefined) updateData.clinicName = clinicName;
      if (vatNumber !== undefined) updateData.vatNumber = vatNumber;
      if (description !== undefined) updateData.description = description;
      if (openingTime !== undefined) updateData.openingTime = openingTime;
      if (closingTime !== undefined) updateData.closingTime = closingTime;
      if (cancellationPolicyText !== undefined) updateData.cancellationPolicyText = cancellationPolicyText;
      
      await users.updateOne({ id: user.id }, { $set: updateData });
      const updated = await users.findOne({ id: user.id }, { projection: { password: 0 } });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Update clinic services only
    if (path === 'clinic/services') {
      const users = await getCollection('users');
      const { services, customServices } = body;
      
      const updateData = { updatedAt: new Date().toISOString() };
      
      if (services !== undefined) {
        updateData.services = services; // Array of { id, price } objects
      }
      if (customServices !== undefined) {
        updateData.customServices = customServices; // Array of custom service objects
      }
      
      await users.updateOne(
        { id: user.id }, 
        { $set: updateData }
      );
      const updated = await users.findOne({ id: user.id }, { projection: { password: 0 } });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    // Update owner profile (including location)
    if (path === 'owner/profile') {
      const users = await getCollection('users');
      const { address, city, latitude, longitude, phone } = body;
      
      const updateData = { updatedAt: new Date().toISOString() };
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (phone !== undefined) updateData.phone = phone;
      
      await users.updateOne({ id: user.id }, { $set: updateData });
      const updated = await users.findOne({ id: user.id }, { projection: { password: 0 } });
      return NextResponse.json(updated, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request, { params }) {
  const path = params?.path?.join('/') || '';
  
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    // Admin delete user
    if (path.startsWith('admin/users/')) {
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403, headers: corsHeaders });
      }
      const id = path.split('/')[2];
      const users = await getCollection('users');
      await users.deleteOne({ id });
      // Also delete related data
      const pets = await getCollection('pets');
      const appointments = await getCollection('appointments');
      const documents = await getCollection('documents');
      await pets.deleteMany({ ownerId: id });
      await appointments.deleteMany({ $or: [{ ownerId: id }, { clinicId: id }] });
      await documents.deleteMany({ $or: [{ ownerId: id }, { clinicId: id }] });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete appointment
    if (path.startsWith('appointments/')) {
      const id = path.split('/')[1];
      const appointments = await getCollection('appointments');
      await appointments.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete document
    if (path.startsWith('documents/')) {
      const id = path.split('/')[1];
      const documents = await getCollection('documents');
      await documents.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete staff member
    if (path.startsWith('staff/')) {
      const id = path.split('/')[1];
      const staff = await getCollection('staff');
      await staff.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Delete pet
    if (path.startsWith('pets/')) {
      const id = path.split('/')[1];
      const pets = await getCollection('pets');
      await pets.deleteOne({ id });
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Route non trovata' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
