// ==================== REV Token Manager ====================
// Gestione token OAuth2 per autenticazione con il sistema nazionale REV
// NOTA: Il meccanismo di autenticazione verrà confermato dalle specifiche ufficiali.

import REV_CONFIG from './config.js';

export class REVTokenManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.refreshBuffer = 60000; // Refresh 60 secondi prima della scadenza
  }

  /**
   * Ottiene un token valido, rinnovandolo se necessario
   * @returns {string} - Access token
   */
  async getValidToken() {
    if (this.token && this.tokenExpiry && Date.now() < (this.tokenExpiry - this.refreshBuffer)) {
      return this.token;
    }
    return await this.refreshToken();
  }

  /**
   * Richiede un nuovo token OAuth2
   * PLACEHOLDER: da implementare con le specifiche ufficiali
   */
  async refreshToken() {
    if (!REV_CONFIG.clientId || !REV_CONFIG.clientSecret) {
      throw new Error('Credenziali REV non configurate. Configurare REV_CLIENT_ID e REV_CLIENT_SECRET.');
    }

    try {
      const response = await fetch(REV_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: REV_CONFIG.clientId,
          client_secret: REV_CONFIG.clientSecret,
          // scope: 'rev:write rev:read', // Da confermare con specifiche
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Token refresh failed: ${errorData.error_description || response.status}`);
      }

      const data = await response.json();
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      console.log('[REV TokenManager] Token rinnovato con successo');
      return this.token;

    } catch (error) {
      console.error('[REV TokenManager] Errore nel refresh del token:', error.message);
      throw error;
    }
  }

  /**
   * Invalida il token corrente
   */
  invalidateToken() {
    this.token = null;
    this.tokenExpiry = null;
  }
}

export default REVTokenManager;
