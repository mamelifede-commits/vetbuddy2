// Fatturazione Elettronica Italiana - Generazione XML formato SDI
// Conforme a specifiche Agenzia delle Entrate v1.6.2

export const generateFatturaElettronicaXML = (invoiceData) => {
  const {
    // Cedente/Prestatore (Clinica)
    clinicVAT,
    clinicFiscalCode,
    clinicName,
    clinicAddress,
    clinicCAP,
    clinicCity,
    clinicProvince,
    clinicCountry = 'IT',
    clinicPhone,
    clinicEmail,
    clinicRegimeFiscale = 'RF01', // Regime ordinario
    
    // Cessionario/Committente (Cliente)
    customerType = 'B2C', // B2C, B2B, PA
    customerVAT,
    customerFiscalCode,
    customerName,
    customerAddress,
    customerCAP,
    customerCity,
    customerProvince,
    customerCountry = 'IT',
    customerPEC,
    customerSDI, // Codice destinatario SDI (7 caratteri)
    
    // Dati fattura
    invoiceNumber,
    invoiceDate, // YYYY-MM-DD
    currency = 'EUR',
    items = [], // [{ description, quantity, unitPrice, vatRate, vatNature }]
    
    // Pagamento
    paymentMethod = 'MP05', // Bonifico
    paymentTerms = 'TP02', // Completo
    paymentAmount,
    paymentDueDate,
    
    // Opzionali
    notes,
    causaleTrasporto,
  } = invoiceData;

  // Calcoli totali
  const totals = calculateTotals(items);
  
  // Progressivo invio (univoco per trasmissione)
  const progressivoInvio = `${invoiceNumber.replace(/[^0-9]/g, '')}${Date.now().toString().slice(-5)}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" 
xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
xsi:schemaLocation="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>${clinicCountry}</IdPaese>
        <IdCodice>${clinicVAT || clinicFiscalCode}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${progressivoInvio}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${customerSDI || (customerPEC ? '0000000' : '0000000')}</CodiceDestinatario>
      ${customerPEC ? `<PECDestinatario>${customerPEC}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>${clinicCountry}</IdPaese>
          <IdCodice>${clinicVAT}</IdCodice>
        </IdFiscaleIVA>
        ${clinicFiscalCode ? `<CodiceFiscale>${clinicFiscalCode}</CodiceFiscale>` : ''}
        <Anagrafica>
          <Denominazione>${escapeXML(clinicName)}</Denominazione>
        </Anagrafica>
        <RegimeFiscale>${clinicRegimeFiscale}</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${escapeXML(clinicAddress)}</Indirizzo>
        <CAP>${clinicCAP}</CAP>
        <Comune>${escapeXML(clinicCity)}</Comune>
        <Provincia>${clinicProvince}</Provincia>
        <Nazione>${clinicCountry}</Nazione>
      </Sede>
      ${clinicPhone || clinicEmail ? `<Contatti>
        ${clinicPhone ? `<Telefono>${clinicPhone}</Telefono>` : ''}
        ${clinicEmail ? `<Email>${clinicEmail}</Email>` : ''}
      </Contatti>` : ''}
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${customerVAT ? `<IdFiscaleIVA>
          <IdPaese>${customerCountry}</IdPaese>
          <IdCodice>${customerVAT}</IdCodice>
        </IdFiscaleIVA>` : ''}
        ${customerFiscalCode ? `<CodiceFiscale>${customerFiscalCode}</CodiceFiscale>` : ''}
        <Anagrafica>
          <Denominazione>${escapeXML(customerName)}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${escapeXML(customerAddress || 'Via non specificata')}</Indirizzo>
        <CAP>${customerCAP || '00000'}</CAP>
        <Comune>${escapeXML(customerCity || 'Sconosciuto')}</Comune>
        <Provincia>${customerProvince || 'XX'}</Provincia>
        <Nazione>${customerCountry}</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>${currency}</Divisa>
        <Data>${invoiceDate}</Data>
        <Numero>${invoiceNumber}</Numero>
        ${totals.totalVAT.map(vat => `<DatiRitenuta>
          <TipoRitenuta>RT01</TipoRitenuta>
          <ImportoRitenuta>${vat.amount.toFixed(2)}</ImportoRitenuta>
          <AliquotaRitenuta>${vat.rate.toFixed(2)}</AliquotaRitenuta>
          <CausalePagamento>A</CausalePagamento>
        </DatiRitenuta>`).join('')}
        <ImportoTotaleDocumento>${totals.total.toFixed(2)}</ImportoTotaleDocumento>
        ${notes ? `<Causale>${escapeXML(notes)}</Causale>` : ''}
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${items.map((item, index) => `      <DettaglioLinee>
        <NumeroLinea>${index + 1}</NumeroLinea>
        <Descrizione>${escapeXML(item.description)}</Descrizione>
        <Quantita>${item.quantity.toFixed(2)}</Quantita>
        <PrezzoUnitario>${item.unitPrice.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${(item.quantity * item.unitPrice).toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>${item.vatRate.toFixed(2)}</AliquotaIVA>
        ${item.vatNature ? `<Natura>${item.vatNature}</Natura>` : ''}
      </DettaglioLinee>`).join('\n')}
      <DatiRiepilogo>
        <AliquotaIVA>${totals.totalVAT[0]?.rate.toFixed(2) || '22.00'}</AliquotaIVA>
        <ImponibileImporto>${totals.subtotal.toFixed(2)}</ImponibileImporto>
        <Imposta>${totals.totalVATAmount.toFixed(2)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>${paymentTerms}</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>${paymentMethod}</ModalitaPagamento>
        ${paymentDueDate ? `<DataScadenzaPagamento>${paymentDueDate}</DataScadenzaPagamento>` : ''}
        <ImportoPagamento>${(paymentAmount || totals.total).toFixed(2)}</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</p:FatturaElettronica>`;

  return xml;
};

// Calcola totali fattura
const calculateTotals = (items) => {
  let subtotal = 0;
  const vatBreakdown = {};

  items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    
    const vatRate = item.vatRate || 22;
    if (!vatBreakdown[vatRate]) {
      vatBreakdown[vatRate] = { rate: vatRate, base: 0, amount: 0 };
    }
    vatBreakdown[vatRate].base += lineTotal;
    vatBreakdown[vatRate].amount += lineTotal * (vatRate / 100);
  });

  const totalVAT = Object.values(vatBreakdown);
  const totalVATAmount = totalVAT.reduce((sum, vat) => sum + vat.amount, 0);
  const total = subtotal + totalVATAmount;

  return {
    subtotal,
    totalVAT,
    totalVATAmount,
    total
  };
};

// Escape caratteri speciali XML
const escapeXML = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Valida P.IVA italiana
export const validatePIVA = (piva) => {
  if (!piva || piva.length !== 11) return false;
  if (!/^[0-9]{11}$/.test(piva)) return false;
  
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    let digit = parseInt(piva[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

// Valida Codice Fiscale italiano
export const validateCodiceFiscale = (cf) => {
  if (!cf) return false;
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  return cfRegex.test(cf.toUpperCase());
};

// Valida PEC
export const validatePEC = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Codici Regime Fiscale
export const REGIMI_FISCALI = {
  RF01: 'Regime ordinario',
  RF02: 'Regime contribuenti minimi (art.1, c.96-117, L. 244/07)',
  RF04: 'Agricoltura e attività connesse e pesca (artt.34 e 34-bis, DPR 633/72)',
  RF05: 'Vendita sali e tabacchi (art.74, c.1, DPR 633/72)',
  RF06: 'Commercio fiammiferi (art.74, c.1, DPR 633/72)',
  RF07: 'Editoria (art.74, c.1, DPR 633/72)',
  RF08: 'Gestione servizi telefonia pubblica (art.74, c.1, DPR 633/72)',
  RF09: 'Rivendita documenti di trasporto pubblico e di sosta (art.74, c.1, DPR 633/72)',
  RF10: 'Intrattenimenti, giochi e altre attività di cui alla tariffa allegata al DPR 640/72',
  RF11: 'Agenzie viaggi e turismo (art.74-ter, DPR 633/72)',
  RF12: 'Agriturismo (art.5, c.2, L. 413/91)',
  RF13: 'Vendite a domicilio (art.25-bis, c.6, DPR 600/73)',
  RF14: 'Rivendita beni usati, oggetti d\'arte, d\'antiquariato o da collezione (art.36, DL 41/95)',
  RF15: 'Agenzie di vendite all\'asta di oggetti d\'arte, antiquariato o da collezione (art.40-bis, DL 41/95)',
  RF16: 'IVA per cassa P.A. (art.6, c.5, DPR 633/72)',
  RF17: 'IVA per cassa (art.32-bis, DL 83/2012)',
  RF19: 'Regime forfettario (art.1, c.54-89, L. 190/2014)',
};

// Modalità di pagamento
export const MODALITA_PAGAMENTO = {
  MP01: 'Contanti',
  MP02: 'Assegno',
  MP03: 'Assegno circolare',
  MP04: 'Contanti presso Tesoreria',
  MP05: 'Bonifico',
  MP06: 'Vaglia cambiario',
  MP07: 'Bollettino bancario',
  MP08: 'Carta di pagamento',
  MP09: 'RID',
  MP10: 'RID utenze',
  MP11: 'RID veloce',
  MP12: 'RIBA',
  MP13: 'MAV',
  MP14: 'Quietanza erario',
  MP15: 'Giroconto su conti di contabilità speciale',
  MP16: 'Domiciliazione bancaria',
  MP17: 'Domiciliazione postale',
  MP18: 'Bollettino di c/c postale',
  MP19: 'SEPA Direct Debit',
  MP20: 'SEPA Direct Debit CORE',
  MP21: 'SEPA Direct Debit B2B',
  MP22: 'Trattenuta su somme già riscosse',
};

export default { 
  generateFatturaElettronicaXML, 
  validatePIVA, 
  validateCodiceFiscale, 
  validatePEC,
  REGIMI_FISCALI,
  MODALITA_PAGAMENTO
};
