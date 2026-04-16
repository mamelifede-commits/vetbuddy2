// ==================== REV Prescription Service ====================
// Servizio principale di orchestrazione per il flusso prescrizioni REV

import { REVClient } from './REVClient.js';
import { REVPayloadMapper } from './REVPayloadMapper.js';
import REV_CONFIG, { PRESCRIPTION_STATUSES, AUDIT_EVENTS } from './config.js';

export class REVPrescriptionService {
  constructor() {
    this.client = new REVClient();
  }

  /**
   * Verifica se il sistema è in modalità manuale
   */
  isManualMode() {
    return REV_CONFIG.manualMode || !REV_CONFIG.clientId;
  }

  /**
   * Invia la prescrizione al sistema REV
   * @param {object} prescription - Prescrizione VetBuddy
   * @param {object} items - Items farmaco
   * @param {object} context - { pet, owner, vet, clinic }
   * @returns {object} - Risultato dell'invio
   */
  async submitPrescription(prescription, items, context) {
    const { pet, owner, vet, clinic } = context;

    // Se in modalità manuale, non inviare
    if (this.isManualMode()) {
      return {
        success: false,
        manualMode: true,
        message: 'Il sistema è in modalità manuale. Completare l\'emissione sul portale ufficiale Vetinfo e registrare manualmente il numero ricetta e PIN.',
        checklist: this.generateManualChecklist(prescription, items, context)
      };
    }

    // Prepara il payload
    const payload = REVPayloadMapper.toREVPayload(prescription, items, pet, owner, vet, clinic);

    // Log pre-invio
    const logEntry = {
      prescriptionId: prescription.id,
      environment: REV_CONFIG.environment,
      requestPayload: JSON.stringify(payload), // Da cifrare in produzione
      sentAt: new Date().toISOString()
    };

    try {
      // Chiama il sistema REV
      const result = await this.client.submitPrescription(payload);

      if (result.success) {
        const normalizedData = REVPayloadMapper.fromREVResponse(result.data);
        
        logEntry.responsePayload = JSON.stringify(result.data);
        logEntry.httpStatus = result.httpStatus;
        logEntry.completedAt = new Date().toISOString();

        return {
          success: true,
          prescriptionNumber: normalizedData.prescriptionNumber,
          pin: normalizedData.pin,
          externalStatus: normalizedData.externalStatus,
          emissionDate: normalizedData.emissionDate,
          log: logEntry
        };
      } else {
        logEntry.responsePayload = JSON.stringify(result.data || {});
        logEntry.httpStatus = result.httpStatus;
        logEntry.externalErrorCode = result.errorCode;
        logEntry.externalErrorMessage = result.error;
        logEntry.completedAt = new Date().toISOString();

        return {
          success: false,
          error: result.error,
          errorCode: result.errorCode,
          log: logEntry
        };
      }
    } catch (error) {
      logEntry.externalErrorCode = 'SERVICE_ERROR';
      logEntry.externalErrorMessage = error.message;
      logEntry.completedAt = new Date().toISOString();

      return {
        success: false,
        error: error.message,
        errorCode: 'SERVICE_ERROR',
        log: logEntry
      };
    }
  }

  /**
   * Genera checklist per la modalità manuale
   */
  generateManualChecklist(prescription, items, context) {
    const { pet, owner, vet } = context;
    return [
      { step: 1, label: 'Accedere al portale Vetinfo (www.vetinfo.it)', done: false },
      { step: 2, label: `Selezionare il veterinario prescrittore: ${vet?.name || ''}`, done: false },
      { step: 3, label: `Inserire i dati del proprietario: ${owner?.name || ''}`, done: false },
      { step: 4, label: `Inserire i dati dell'animale: ${pet?.name || ''} (${pet?.species || ''})`, done: false },
      { step: 5, label: `Inserire i farmaci: ${(items || []).map(i => i.productName).join(', ')}`, done: false },
      { step: 6, label: 'Inserire diagnosi e posologia', done: false },
      { step: 7, label: 'Confermare e emettere la ricetta', done: false },
      { step: 8, label: 'Annotare il numero ricetta e il PIN', done: false },
      { step: 9, label: 'Registrare su VetBuddy il numero ricetta e il PIN', done: false }
    ];
  }

  /**
   * Verifica la completezza dei dati prima dell'invio
   */
  validatePrescription(prescription, items) {
    const errors = [];

    if (!prescription.petId) errors.push('Paziente non selezionato');
    if (!prescription.veterinarianUserId) errors.push('Veterinario prescrittore non specificato');
    if (!prescription.diagnosisNote?.trim()) errors.push('Diagnosi mancante');
    if (!items || items.length === 0) errors.push('Nessun farmaco aggiunto alla prescrizione');

    for (const item of (items || [])) {
      if (!item.productName?.trim()) errors.push(`Nome farmaco mancante`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Quantità non valida per ${item.productName || 'farmaco'}`);
      if (!item.posology?.trim()) errors.push(`Posologia mancante per ${item.productName || 'farmaco'}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default REVPrescriptionService;
