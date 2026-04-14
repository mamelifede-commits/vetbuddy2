// modules/constants.js - Shared constants for VetBuddy API
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'missing_stripe_key');

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/google/callback';
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

export const STAFF_COLORS = [
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

export const SUBSCRIPTION_PLANS = {
  starter: { name: 'Starter Clinica', price: 0.00, description: 'Per iniziare' },
  pro: { name: 'Pro Clinica', price: 49.00, description: 'Per cliniche che vogliono crescere' },
  lab_partner: { name: 'Lab Partner', price: 29.00, description: 'Per laboratori di analisi' },
  enterprise: { name: 'Enterprise', price: 0, description: 'Contattaci per un preventivo' }
};

export const STARTER_AUTOMATIONS = [
  'appointmentReminders', 'bookingConfirmation', 'welcomeNewPet', 'petBirthday', 'appointmentConfirmation'
];

export const PRO_AUTOMATIONS = [
  ...STARTER_AUTOMATIONS,
  'vaccineRecalls', 'postVisitFollowup', 'noShowDetection', 'waitlistNotification',
  'suggestedSlots', 'documentReminders', 'autoTicketAssignment', 'urgencyNotifications',
  'weeklyReport', 'reviewRequest', 'inactiveClientReactivation', 'antiparasiticReminder',
  'annualCheckup', 'labResultsReady', 'paymentReminder', 'postSurgeryFollowup'
];

export const VETERINARY_SERVICES = {
  video_consulto: {
    name: 'Video Consulto', icon: 'Video',
    services: [
      { id: 'consulenza_online', name: 'Consulenza Online', description: 'Consulenza a distanza per triage, dubbi, follow-up e interpretazione referti', type: 'online', duration: 20 },
      { id: 'follow_up_online', name: 'Follow-up Online', description: 'Controllo post-visita o post-intervento in videochiamata', type: 'online', duration: 15 },
      { id: 'interpretazione_referti', name: 'Interpretazione Referti', description: 'Spiegazione e discussione di esami e analisi', type: 'online', duration: 15 },
      { id: 'consulto_comportamentale', name: 'Consulto Comportamentale', description: 'Valutazione iniziale problemi comportamentali', type: 'online', duration: 30 },
      { id: 'seconda_opinione', name: 'Seconda Opinione', description: 'Valutazione caso clinico per secondo parere', type: 'online', duration: 25 }
    ]
  },
  visite_generali: {
    name: 'Visite Generali', icon: 'Stethoscope',
    services: [
      { id: 'visita_clinica', name: 'Visita Clinica Generale', description: 'Controllo stato di salute, peso, parassiti e piano vaccinale' },
      { id: 'vaccini', name: 'Vaccinazioni', description: 'Piano vaccinale completo per cani e gatti' },
      { id: 'check_up', name: 'Check-up Preventivo', description: 'Controllo generale periodico dello stato di salute' },
      { id: 'visita_preanestesia', name: 'Visita Pre-anestesiologica', description: 'Valutazione del rischio prima di interventi chirurgici' }
    ]
  },
  visite_specialistiche: {
    name: 'Visite Specialistiche', icon: 'UserCog',
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
    name: 'Chirurgia', icon: 'Scissors',
    services: [
      { id: 'sterilizzazione', name: 'Sterilizzazione', description: 'Ovariectomie, ovarioisterectomie e castrazioni' },
      { id: 'tessuti_molli', name: 'Chirurgia Tessuti Molli', description: 'Rimozione masse, chirurgia gastrointestinale, cistotomie' },
      { id: 'ortopedica', name: 'Chirurgia Ortopedica', description: 'Fratture, lussazioni, rottura legamento crociato' },
      { id: 'odontoiatria', name: 'Odontoiatria Veterinaria', description: 'Detartrasi, estrazioni e cure dentali' },
      { id: 'urgenze', name: "Chirurgia d'Urgenza", description: 'Torsioni gastriche, traumi, emorragie' },
      { id: 'oculistica_chir', name: 'Chirurgia Oculistica', description: 'Correzione entropion, ectropion e cataratta' }
    ]
  },
  diagnostica: {
    name: 'Diagnostica', icon: 'Search',
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
    name: 'Altri Servizi', icon: 'Plus',
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

export const LAB_EXAM_TYPES = {
  istologia: {
    id: 'istologia', name: 'Esami Istologici e Citologici', icon: 'Microscope',
    exams: [
      { id: 'biopsia', name: 'Esame Istologico (Biopsia)', description: 'Analisi di frammenti di tessuto per diagnosi di neoplasie' },
      { id: 'citologia_avanzata', name: 'Citologia Avanzata', description: 'Analisi cellulari da masse o versamenti' }
    ]
  },
  infettive: {
    id: 'infettive', name: 'Malattie Infettive e Sierologia', icon: 'Bug',
    exams: [
      { id: 'pcr', name: 'PCR (Test Molecolare)', description: 'Rilevamento DNA/RNA patogeni (Leishmania, Ehrlichia, Parvovirus)' },
      { id: 'titolazione_anticorpale', name: 'Titolazione Anticorpale', description: 'Misurazione livelli anticorpi (IFAT/ELISA)' },
      { id: 'screening_infettive', name: 'Screening Malattie Infettive', description: 'FIV/FeLV, Toxoplasma e altre' }
    ]
  },
  endocrinologia: {
    id: 'endocrinologia', name: 'Endocrinologia ed Esami Ormonali', icon: 'Activity',
    exams: [
      { id: 'tiroide', name: 'Profilo Tiroideo', description: 'T4 totale, T4 libero, TSH' },
      { id: 'surrene', name: 'Profilo Surrenalico', description: 'Cortisolo, test ACTH, soppressione desametasone' },
      { id: 'progesterone', name: 'Dosaggio Progesterone', description: 'Per gestione riproduzione' }
    ]
  },
  microbiologia: {
    id: 'microbiologia', name: 'Microbiologia e Parassitologia', icon: 'Beaker',
    exams: [
      { id: 'batteriologico', name: 'Esame Batteriologico + Antibiogramma', description: 'Coltura e sensibilità antibiotici' },
      { id: 'micologico', name: 'Esame Micologico', description: 'Ricerca funghi e dermatofiti' },
      { id: 'parassitologico', name: 'Esami Parassitologici', description: 'Ricerca parassiti specifici' }
    ]
  },
  ematologia: {
    id: 'ematologia', name: 'Profili Biochimici ed Ematologici Avanzati', icon: 'Droplet',
    exams: [
      { id: 'elettroforesi', name: 'Elettroforesi Sierica', description: 'Valutazione frazioni proteiche' },
      { id: 'profilo_geriatrico', name: 'Profilo Geriatrico/Patologico', description: 'Biochimica completa 20-25 parametri' },
      { id: 'coagulazione', name: 'Pannello Coagulazione', description: 'PT, PTT, fibrinogeno' }
    ]
  }
};

export const LAB_REQUEST_STATUSES = [
  { id: 'pending', name: 'Richiesta Inviata', color: 'yellow', icon: 'Clock' },
  { id: 'received', name: 'Richiesta Ricevuta', color: 'blue', icon: 'CheckCircle' },
  { id: 'sample_waiting', name: 'Campione in Attesa', color: 'orange', icon: 'Package' },
  { id: 'sample_received', name: 'Campione Ricevuto', color: 'indigo', icon: 'PackageCheck' },
  { id: 'in_progress', name: 'Analisi in Corso', color: 'purple', icon: 'Loader' },
  { id: 'report_ready', name: 'Referto Pronto', color: 'green', icon: 'FileCheck' },
  { id: 'completed', name: 'Completata', color: 'emerald', icon: 'CheckCircle2' },
  { id: 'cancelled', name: 'Annullata', color: 'red', icon: 'XCircle' }
];

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
