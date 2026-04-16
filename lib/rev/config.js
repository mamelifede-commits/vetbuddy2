// ==================== REV (Ricetta Elettronica Veterinaria) Configuration ====================
// Configurazione per l'integrazione con il sistema nazionale REV / Vetinfo

export const REV_CONFIG = {
  // Feature flags
  featureEnabled: process.env.REV_FEATURE_ENABLED === 'true',
  manualMode: process.env.REV_MANUAL_MODE !== 'false', // Default: true (modalità ponte/manuale)
  
  // API Endpoints (placeholder - da configurare con credenziali ufficiali)
  // NOTA: questi URL sono placeholder. Gli endpoint reali verranno forniti
  // dal sistema nazionale Vetinfo / IZS quando le credenziali saranno disponibili.
  baseUrl: process.env.REV_BASE_URL || 'https://www.vetinfo.it/j6_vetinfo/api/v1', // Placeholder
  tokenUrl: process.env.REV_TOKEN_URL || 'https://www.vetinfo.it/j6_vetinfo/oauth/token', // Placeholder
  
  // OAuth2 Credentials (da richiedere tramite portale Vetinfo)
  clientId: process.env.REV_CLIENT_ID || '',
  clientSecret: process.env.REV_CLIENT_SECRET || '',
  
  // Environment
  environment: process.env.REV_ENVIRONMENT || 'sandbox', // 'sandbox' | 'production'
  
  // Timeout e retry
  requestTimeout: parseInt(process.env.REV_REQUEST_TIMEOUT || '30000'), // 30 secondi
  maxRetries: parseInt(process.env.REV_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.REV_RETRY_DELAY || '2000'), // 2 secondi
};

// Prescription statuses
export const PRESCRIPTION_STATUSES = {
  DRAFT: 'DRAFT',
  READY_TO_SEND: 'READY_TO_SEND',
  SENDING: 'SENDING',
  EMITTED: 'EMITTED',
  REGISTERED_MANUALLY: 'REGISTERED_MANUALLY',
  ERROR: 'ERROR',
  CANCELLED: 'CANCELLED'
};

// Status labels in Italian
export const PRESCRIPTION_STATUS_LABELS = {
  DRAFT: 'Bozza',
  READY_TO_SEND: 'Pronta per invio',
  SENDING: 'Invio in corso...',
  EMITTED: 'Emessa',
  REGISTERED_MANUALLY: 'Registrata manualmente',
  ERROR: 'Errore',
  CANCELLED: 'Annullata'
};

// Status colors for UI
export const PRESCRIPTION_STATUS_COLORS = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  READY_TO_SEND: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  SENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  EMITTED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  REGISTERED_MANUALLY: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  ERROR: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-200' }
};

// Audit event types
export const AUDIT_EVENTS = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  ITEM_ADDED: 'ITEM_ADDED',
  ITEM_UPDATED: 'ITEM_UPDATED',
  ITEM_REMOVED: 'ITEM_REMOVED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  SUBMITTED: 'SUBMITTED',
  EMITTED: 'EMITTED',
  REGISTERED_MANUALLY: 'REGISTERED_MANUALLY',
  ERROR: 'ERROR',
  CANCELLED: 'CANCELLED',
  VIEWED: 'VIEWED',
  PUBLISHED_TO_OWNER: 'PUBLISHED_TO_OWNER'
};

// Prescription types
export const PRESCRIPTION_TYPES = {
  STANDARD: 'standard',
  URGENT: 'urgent',
  RENEWAL: 'renewal'
};

// Routes of administration (Vie di somministrazione)
export const ROUTES_OF_ADMINISTRATION = [
  { value: 'orale', label: 'Orale' },
  { value: 'parenterale_im', label: 'Parenterale (IM)' },
  { value: 'parenterale_sc', label: 'Parenterale (SC)' },
  { value: 'parenterale_iv', label: 'Parenterale (IV)' },
  { value: 'topica', label: 'Topica' },
  { value: 'oftalmica', label: 'Oftalmica' },
  { value: 'auricolare', label: 'Auricolare' },
  { value: 'rettale', label: 'Rettale' },
  { value: 'inalatoria', label: 'Inalatoria' },
  { value: 'transdermica', label: 'Transdermica' },
  { value: 'altra', label: 'Altra' }
];

// Common veterinary drug units
export const DRUG_UNITS = [
  { value: 'compresse', label: 'Compresse' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'ml', label: 'ml' },
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'fiale', label: 'Fiale' },
  { value: 'bustine', label: 'Bustine' },
  { value: 'gocce', label: 'Gocce' },
  { value: 'pipette', label: 'Pipette' },
  { value: 'confezioni', label: 'Confezioni' },
  { value: 'siringhe', label: 'Siringhe pre-riempite' },
  { value: 'cerotti', label: 'Cerotti' },
  { value: 'supposte', label: 'Supposte' },
  { value: 'flaconi', label: 'Flaconi' }
];

export default REV_CONFIG;
