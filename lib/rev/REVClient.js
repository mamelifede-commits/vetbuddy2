// ==================== REV API Client ====================
// Client REST per comunicazione con il sistema nazionale REV / Vetinfo
// NOTA: Questo client è predisposto per l'integrazione ufficiale.
// Gli endpoint e il formato dei dati verranno adattati quando le specifiche
// tecniche ufficiali saranno disponibili.

import REV_CONFIG from './config.js';
import { REVTokenManager } from './REVTokenManager.js';

export class REVClient {
  constructor() {
    this.baseUrl = REV_CONFIG.baseUrl;
    this.timeout = REV_CONFIG.requestTimeout;
    this.maxRetries = REV_CONFIG.maxRetries;
    this.retryDelay = REV_CONFIG.retryDelay;
    this.tokenManager = new REVTokenManager();
  }

  /**
   * Esegue una richiesta autenticata verso il sistema REV
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint (relativo a baseUrl)
   * @param {object} data - Body della richiesta
   * @returns {object} - { success, data, error, httpStatus }
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const token = await this.tokenManager.getValidToken();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            // Header aggiuntivi richiesti dal sistema REV
            // 'X-REV-Environment': REV_CONFIG.environment,
          },
          signal: controller.signal
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
          options.body = JSON.stringify(data);
        }

        console.log(`[REV Client] ${method} ${url} (attempt ${attempt}/${this.maxRetries})`);
        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        const responseData = await response.json().catch(() => null);

        if (response.ok) {
          return {
            success: true,
            data: responseData,
            httpStatus: response.status
          };
        }

        // Errore dal server REV
        lastError = {
          success: false,
          error: responseData?.message || responseData?.error || `HTTP ${response.status}`,
          errorCode: responseData?.code || `HTTP_${response.status}`,
          httpStatus: response.status,
          data: responseData
        };

        // Non fare retry per errori 4xx (client errors)
        if (response.status >= 400 && response.status < 500) {
          return lastError;
        }

      } catch (error) {
        lastError = {
          success: false,
          error: error.name === 'AbortError' ? 'Timeout nella comunicazione con il sistema REV' : error.message,
          errorCode: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
          httpStatus: null
        };
        console.error(`[REV Client] Attempt ${attempt} failed:`, error.message);
      }

      // Wait before retry
      if (attempt < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    return lastError;
  }

  // ==================== API Methods (Placeholder) ====================
  // Questi metodi verranno implementati quando le specifiche ufficiali
  // dell'API Vetinfo saranno disponibili.

  /**
   * Invia una prescrizione al sistema REV
   * @param {object} prescriptionPayload - Payload formattato per REV
   * @returns {object} - Risposta con numero ricetta e PIN
   */
  async submitPrescription(prescriptionPayload) {
    // PLACEHOLDER: endpoint da confermare con specifiche ufficiali Vetinfo
    // return await this.request('POST', '/ricette/emetti', prescriptionPayload);
    
    console.warn('[REV Client] submitPrescription: API non ancora configurata. Utilizzare modalità manuale.');
    return {
      success: false,
      error: 'API REV non ancora configurata. Utilizzare la modalità manuale per registrare la ricetta.',
      errorCode: 'API_NOT_CONFIGURED'
    };
  }

  /**
   * Verifica lo stato di una prescrizione inviata
   * @param {string} prescriptionNumber - Numero ricetta
   */
  async checkPrescriptionStatus(prescriptionNumber) {
    // PLACEHOLDER
    console.warn('[REV Client] checkPrescriptionStatus: API non ancora configurata.');
    return {
      success: false,
      error: 'API REV non ancora configurata.',
      errorCode: 'API_NOT_CONFIGURED'
    };
  }

  /**
   * Annulla una prescrizione emessa
   * @param {string} prescriptionNumber - Numero ricetta
   * @param {string} reason - Motivo annullamento
   */
  async cancelPrescription(prescriptionNumber, reason) {
    // PLACEHOLDER
    console.warn('[REV Client] cancelPrescription: API non ancora configurata.');
    return {
      success: false,
      error: 'API REV non ancora configurata.',
      errorCode: 'API_NOT_CONFIGURED'
    };
  }
}

export default REVClient;
