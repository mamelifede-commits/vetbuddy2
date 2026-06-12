// cron/daily/cron-helpers.js - Shared helpers and constants for cron automation jobs

// Default settings for clinics without custom configuration
export const DEFAULT_AUTOMATION_SETTINGS = {
  appointmentReminders: true,
  vaccineRecalls: true,
  postVisitFollowup: true,
  noShowDetection: true,
  documentReminders: true,
  weeklyReport: true,
  petBirthday: true,
  reviewRequest: true,
  inactiveClientReactivation: true,
  antiparasiticReminder: true,
  annualCheckup: true,
  medicationRefill: true,
  weightAlert: true,
  dentalHygiene: true,
  appointmentConfirmation: true,
  labResultsReady: true,
  paymentReminder: true,
  postSurgeryFollowup: true,
  summerHeatAlert: true,
  tickSeasonAlert: true,
  newYearFireworksAlert: true,
  whatsappReminders: false,
  smsEmergency: false,
  sterilizationReminder: true,
  seniorPetCare: true,
  microchipCheck: true,
  welcomeNewPet: true,
  aiLabExplanation: true,
  breedRiskAlert: true,
  dietSuggestions: true,
  loyaltyProgram: true,
  referralProgram: true,
  holidayClosures: true,
  petCondolences: true,
  griefFollowup: true,
  dailySummary: true,
  lowStockAlert: true,
  staffBirthday: true,
  noShowRiskPrediction: true,
  smartAgendaFiller: true,
  noShowRecovery: true,
  estimateFollowup: true,
  paymentEscalation: true,
  labDelayAlert: true,
  morningBriefing: true,
  bookingDropAlert: true,
  expiryStockAlert: true,
  healthPlanRenewal: true,
  ownerBirthday: true,
  therapyReminder: true,
  labMonthlyReport: true
};

// Helper: Check if automation is enabled for a clinic
export function isAutomationEnabled(clinic, automationKey) {
  const settings = clinic?.automationSettings || DEFAULT_AUTOMATION_SETTINGS;
  return settings[automationKey] !== false; // Default to true if not set
}

// Helper: Get current month (1-12)
export function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

// Helper: Generate contact button - prioritizes WhatsApp if available
export function getContactButton(clinic, baseUrl, buttonText = 'Scrivi alla Clinica', subject = '') {
  const whatsappNumber = clinic?.whatsappNumber;

  if (whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}${subject ? `?text=${encodeURIComponent(subject)}` : ''}`;
    return `<a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
      💬 ${buttonText} (WhatsApp)
    </a>`;
  } else {
    const messageUrl = `${baseUrl}?action=message&clinicId=${clinic?.id || ''}`;
    return `<a href="${messageUrl}" style="display: inline-block; background: #4CAF50; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
      💬 ${buttonText}
    </a>`;
  }
}

// Helper: Generate phone button (only for urgent communications)
export function getPhoneButton(clinic, showButton = false) {
  if (!showButton) return '';
  const phoneNumber = clinic?.phone || clinic?.telefono || '';
  if (!phoneNumber) return '';
  const phoneLink = `tel:${phoneNumber.replace(/\\s/g, '')}`;
  return `<a href="${phoneLink}" style="display: inline-block; background: #E74C3C; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
    📞 Chiama (Urgenze)
  </a>`;
}

// Helper: Get cancellation policy text
export function getCancellationPolicyText(clinic) {
  return clinic?.cancellationPolicyText || 
         clinic?.cancellationPolicy?.message || 
         'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta.';
}

// Common email wrapper with VetBuddy branding
export function wrapEmail(bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,sans-serif;background-color:#F5F5F5;">
  <div style="max-width:600px;margin:20px auto;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg, #F97066, #E85D52);padding:20px;text-align:center;">
      <h1 style="color:white;font-size:22px;margin:0;">🐾 VetBuddy</h1>
    </div>
    <div style="padding:30px;">
      ${bodyHtml}
    </div>
    <div style="background:#F9F9F9;padding:16px;text-align:center;border-top:1px solid #EEE;">
      <p style="margin:0;font-size:12px;color:#999;">Inviato da VetBuddy — Il copilota operativo per cliniche veterinarie</p>
    </div>
  </div>
</body>
</html>`;
}
