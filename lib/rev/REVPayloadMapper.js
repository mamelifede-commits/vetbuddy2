// ==================== REV Payload Mapper ====================
// Mapping tra dati interni VetBuddy e formato richiesto dal sistema REV / Vetinfo
// NOTA: Il formato del payload verrà adattato alle specifiche ufficiali.

export class REVPayloadMapper {
  /**
   * Converte una prescrizione VetBuddy nel formato richiesto dal sistema REV
   * @param {object} prescription - Prescrizione VetBuddy
   * @param {object} items - Items della prescrizione
   * @param {object} pet - Dati del paziente
   * @param {object} owner - Dati del proprietario
   * @param {object} vet - Dati del veterinario
   * @param {object} clinic - Dati della clinica
   * @returns {object} - Payload formattato per REV
   */
  static toREVPayload(prescription, items, pet, owner, vet, clinic) {
    // PLACEHOLDER: struttura payload da confermare con specifiche ufficiali Vetinfo
    return {
      // Dati veterinario prescrittore
      veterinario: {
        codiceFiscale: vet.codiceFiscale || '',
        nome: vet.name || '',
        cognome: vet.surname || '',
        numeroIscrizione: vet.registrationNumber || '', // N° iscrizione albo
        ordineProvinciale: vet.veterinaryBoard || '', // Ordine provinciale
      },

      // Dati struttura
      struttura: {
        codiceStruttura: clinic.facilityCode || '',
        denominazione: clinic.clinicName || clinic.name || '',
        indirizzo: clinic.address || '',
        comune: clinic.city || '',
        provincia: clinic.province || '',
        aslCompetente: clinic.aslCode || '',
      },

      // Dati proprietario
      proprietario: {
        codiceFiscale: owner.codiceFiscale || '',
        nome: owner.name || '',
        indirizzo: owner.address || '',
        comune: owner.city || '',
      },

      // Dati animale
      animale: {
        specie: pet.species || '',
        razza: pet.breed || '',
        nome: pet.name || '',
        sesso: pet.gender || '',
        microchip: pet.microchip || '',
        dataNascita: pet.birthDate || '',
        peso: pet.weight || '',
      },

      // Dati prescrizione
      prescrizione: {
        tipo: prescription.prescriptionType || 'standard',
        diagnosi: prescription.diagnosisNote || '',
        dataPrescrizione: new Date().toISOString().split('T')[0],
        istruzioniDosaggio: prescription.dosageInstructions || '',
        durataTerapia: prescription.treatmentDuration || '',
      },

      // Farmaci prescritti
      farmaci: (items || []).map(item => ({
        codiceProdotto: item.productCode || '',
        denominazione: item.productName || '',
        codiceAIC: item.aicCode || '',
        quantita: item.quantity || 0,
        unitaMisura: item.unit || '',
        posologia: item.posology || '',
        viaSomministrazione: item.routeOfAdministration || '',
        note: item.notes || '',
      }))
    };
  }

  /**
   * Converte la risposta del sistema REV nel formato interno VetBuddy
   * @param {object} revResponse - Risposta dal sistema REV
   * @returns {object} - Dati normalizzati
   */
  static fromREVResponse(revResponse) {
    // PLACEHOLDER: mapping da confermare con specifiche ufficiali
    return {
      prescriptionNumber: revResponse?.numeroRicetta || revResponse?.prescriptionNumber || '',
      pin: revResponse?.pin || revResponse?.pinCode || '',
      externalStatus: revResponse?.stato || revResponse?.status || '',
      emissionDate: revResponse?.dataEmissione || revResponse?.issueDate || new Date().toISOString(),
      externalId: revResponse?.id || revResponse?.externalId || '',
    };
  }

  /**
   * Genera un riepilogo testuale della prescrizione per uso interno
   */
  static generateSummary(prescription, items) {
    const itemsText = (items || []).map(item => 
      `${item.productName} — ${item.quantity} ${item.unit} — ${item.posology}`
    ).join('\n');

    return `Prescrizione REV\n` +
      `Diagnosi: ${prescription.diagnosisNote || '-'}\n` +
      `Farmaci:\n${itemsText || 'Nessun farmaco specificato'}\n` +
      `Posologia: ${prescription.dosageInstructions || '-'}\n` +
      `Durata: ${prescription.treatmentDuration || '-'}`;
  }
}

export default REVPayloadMapper;
