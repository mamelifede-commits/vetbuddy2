import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Generate CSV for import into other invoicing software
function generateCSV(invoices) {
  const headers = [
    'Numero Fattura',
    'Data Emissione',
    'Data Scadenza',
    'Stato',
    'Cliente',
    'Codice Fiscale',
    'Partita IVA',
    'Email',
    'Telefono',
    'Indirizzo',
    'Descrizione',
    'Quantità',
    'Prezzo Unitario',
    'Imponibile',
    'IVA %',
    'IVA €',
    'Bollo',
    'Totale',
    'Paziente',
    'Note'
  ];
  
  const rows = [];
  
  for (const inv of invoices) {
    // One row per item
    for (const item of inv.items || []) {
      rows.push([
        inv.invoiceNumber || 'BOZZA',
        inv.issueDate || '',
        inv.dueDate || '',
        inv.status === 'paid' ? 'Pagata' : inv.status === 'issued' ? 'Emessa' : 'Bozza',
        inv.customerName || '',
        inv.customerCF || '',
        inv.customerPIVA || '',
        inv.customerEmail || '',
        inv.customerPhone || '',
        inv.customerAddress || '',
        item.description || '',
        item.quantity || 1,
        item.unitPrice?.toFixed(2) || '0.00',
        inv.totals?.subtotal?.toFixed(2) || '0.00',
        inv.totals?.vatRate || 22,
        inv.totals?.vatAmount?.toFixed(2) || '0.00',
        inv.totals?.bolloAmount?.toFixed(2) || '0.00',
        inv.totals?.total?.toFixed(2) || '0.00',
        inv.petName || '',
        inv.notes || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
  }
  
  return [headers.join(','), ...rows].join('\n');
}

// Generate JSON for API integration
function generateJSON(invoices, clinic) {
  return invoices.map(inv => ({
    tipo_documento: 'fattura',
    numero: inv.invoiceNumber,
    data: inv.issueDate,
    data_scadenza: inv.dueDate,
    stato: inv.status,
    
    cliente: {
      nome: inv.customerName,
      codice_fiscale: inv.customerCF,
      partita_iva: inv.customerPIVA,
      email: inv.customerEmail,
      telefono: inv.customerPhone,
      indirizzo: inv.customerAddress,
      codice_sdi: inv.customerSDI,
      pec: inv.customerPEC
    },
    
    fornitore: {
      nome: clinic?.clinicName || clinic?.name,
      partita_iva: clinic?.piva,
      indirizzo: clinic?.address,
      email: clinic?.email,
      telefono: clinic?.phone
    },
    
    righe: (inv.items || []).map(item => ({
      descrizione: item.description,
      quantita: item.quantity,
      prezzo_unitario: item.unitPrice,
      totale_riga: item.total
    })),
    
    totali: {
      imponibile: inv.totals?.subtotal,
      aliquota_iva: inv.totals?.vatRate,
      importo_iva: inv.totals?.vatAmount,
      bollo: inv.totals?.bolloAmount,
      totale_documento: inv.totals?.total
    },
    
    note: inv.notes,
    paziente: inv.petName,
    id_interno: inv.id
  }));
}

// Generate HTML for PDF
function generateInvoiceHTML(invoice, clinic) {
  const itemsHTML = (invoice.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€ ${item.unitPrice?.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€ ${item.total?.toFixed(2)}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fattura ${invoice.invoiceNumber || 'Bozza'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .clinic-info { text-align: right; }
    .invoice-title { font-size: 28px; color: #FF6B6B; margin-bottom: 20px; }
    .invoice-meta { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .customer-info { margin-bottom: 30px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items-table th { background: #FF6B6B; color: white; padding: 12px; text-align: left; }
    .totals { margin-left: auto; width: 300px; }
    .totals tr td { padding: 8px; }
    .totals tr.total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-draft { background: #fef3c7; color: #d97706; }
    .status-issued { background: #dbeafe; color: #2563eb; }
    .status-paid { background: #d1fae5; color: #059669; }
    .pet-info { background: #fff7ed; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="color: #FF6B6B; margin: 0;">🐾 VetBuddy</h1>
      <p style="margin: 5px 0; color: #666;">Gestionale Veterinario</p>
    </div>
    <div class="clinic-info">
      <h2 style="margin: 0;">${clinic?.clinicName || clinic?.name || 'Clinica Veterinaria'}</h2>
      <p style="margin: 5px 0;">${clinic?.address || ''}</p>
      <p style="margin: 5px 0;">P.IVA: ${clinic?.piva || 'N/D'}</p>
      <p style="margin: 5px 0;">${clinic?.phone || ''} | ${clinic?.email || ''}</p>
    </div>
  </div>
  
  <h1 class="invoice-title">
    ${invoice.invoiceNumber ? `FATTURA PROFORMA N. ${invoice.invoiceNumber}` : 'BOZZA FATTURA PROFORMA'}
    <span class="status-badge status-${invoice.status}">${invoice.status === 'paid' ? 'PAGATA' : invoice.status === 'issued' ? 'EMESSA' : 'BOZZA'}</span>
  </h1>
  
  <p style="color: #999; font-size: 11px; margin-top: -15px; margin-bottom: 15px;">⚠️ Documento non valido ai fini fiscali - Pre-fattura di cortesia</p>
  
  <div class="invoice-meta">
    <table style="width: 100%;">
      <tr>
        <td><strong>Data Emissione:</strong> ${invoice.issueDate || 'Non emessa'}</td>
        <td><strong>Data Scadenza:</strong> ${invoice.dueDate || '-'}</td>
        ${invoice.paidDate ? `<td><strong>Data Pagamento:</strong> ${invoice.paidDate}</td>` : ''}
      </tr>
    </table>
  </div>
  
  <div class="customer-info">
    <h3>Cliente</h3>
    <p><strong>${invoice.customerName}</strong></p>
    ${invoice.customerCF ? `<p>C.F.: ${invoice.customerCF}</p>` : ''}
    ${invoice.customerPIVA ? `<p>P.IVA: ${invoice.customerPIVA}</p>` : ''}
    ${invoice.customerAddress ? `<p>${invoice.customerAddress}</p>` : ''}
    ${invoice.customerEmail ? `<p>Email: ${invoice.customerEmail}</p>` : ''}
    ${invoice.customerPhone ? `<p>Tel: ${invoice.customerPhone}</p>` : ''}
  </div>
  
  ${invoice.petName ? `
  <div class="pet-info">
    🐾 <strong>Paziente:</strong> ${invoice.petName}
  </div>
  ` : ''}
  
  <table class="items-table">
    <thead>
      <tr>
        <th>Descrizione</th>
        <th style="text-align: center; width: 80px;">Qtà</th>
        <th style="text-align: right; width: 100px;">Prezzo Unit.</th>
        <th style="text-align: right; width: 100px;">Totale</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>
  
  <table class="totals">
    <tr>
      <td>Imponibile:</td>
      <td style="text-align: right;">€ ${invoice.totals?.subtotal?.toFixed(2) || '0.00'}</td>
    </tr>
    <tr>
      <td>IVA (${invoice.totals?.vatRate || 22}%):</td>
      <td style="text-align: right;">€ ${invoice.totals?.vatAmount?.toFixed(2) || '0.00'}</td>
    </tr>
    ${invoice.totals?.bolloAmount > 0 ? `
    <tr>
      <td>Marca da bollo:</td>
      <td style="text-align: right;">€ ${invoice.totals?.bolloAmount?.toFixed(2)}</td>
    </tr>
    ` : ''}
    <tr class="total">
      <td>TOTALE:</td>
      <td style="text-align: right;">€ ${invoice.totals?.total?.toFixed(2) || '0.00'}</td>
    </tr>
  </table>
  
  ${invoice.notes ? `
  <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
    <strong>Note:</strong> ${invoice.notes}
  </div>
  ` : ''}
  
  <div class="footer">
    <p><strong>Modalità di pagamento:</strong> Bonifico bancario / Contanti / POS</p>
    <p>Documento generato da VetBuddy - www.vetbuddy.it</p>
    <p style="margin-top: 10px; font-size: 10px;">
      Ai sensi dell'art. 1 comma 3 del D.Lgs 127/2015, questo documento non costituisce fattura elettronica 
      ai fini fiscali se non trasmesso al Sistema di Interscambio (SdI).
    </p>
  </div>
</body>
</html>
  `;
}

// GET - Export invoices
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, html
    const invoiceId = searchParams.get('id'); // Single invoice
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const status = searchParams.get('status');
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const invoices = await getCollection('invoices');
    const users = await getCollection('users');
    
    // Get clinic info
    const clinic = await users.findOne({ id: clinicId });
    
    // Build query
    const query = { clinicId };
    if (invoiceId) query.id = invoiceId;
    if (status) query.status = status;
    if (fromDate || toDate) {
      query.issueDate = {};
      if (fromDate) query.issueDate.$gte = fromDate;
      if (toDate) query.issueDate.$lte = toDate;
    }
    
    const invoiceList = await invoices
      .find(query)
      .sort({ invoiceNumber: -1 })
      .toArray();
    
    if (invoiceList.length === 0) {
      return NextResponse.json({ error: 'Nessuna fattura trovata' }, { status: 404, headers: corsHeaders });
    }
    
    // Export based on format
    switch (format) {
      case 'csv':
        const csv = generateCSV(invoiceList);
        return new NextResponse(csv, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="fatture_${new Date().toISOString().split('T')[0]}.csv"`
          }
        });
        
      case 'html':
        if (!invoiceId) {
          return NextResponse.json({ error: 'Per il formato HTML specifica un singolo ID fattura' }, { status: 400, headers: corsHeaders });
        }
        const html = generateInvoiceHTML(invoiceList[0], clinic);
        return new NextResponse(html, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
        
      case 'json':
      default:
        const jsonData = generateJSON(invoiceList, clinic);
        return NextResponse.json({
          export_date: new Date().toISOString(),
          clinic: {
            nome: clinic?.clinicName || clinic?.name,
            partita_iva: clinic?.piva
          },
          fatture: jsonData,
          totale_fatture: invoiceList.length,
          totale_importo: invoiceList.reduce((sum, i) => sum + (i.totals?.total || 0), 0)
        }, { headers: corsHeaders });
    }
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
