import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Generate progressive invoice number (YYYY/NNN)
async function generateInvoiceNumber(clinicId) {
  const invoices = await getCollection('invoices');
  const year = new Date().getFullYear();
  
  // Find last invoice of this year for this clinic
  const lastInvoice = await invoices
    .find({ clinicId, invoiceNumber: { $regex: `^${year}/` } })
    .sort({ invoiceNumber: -1 })
    .limit(1)
    .toArray();
  
  let nextNumber = 1;
  if (lastInvoice.length > 0) {
    const lastNum = parseInt(lastInvoice[0].invoiceNumber.split('/')[1]);
    nextNumber = lastNum + 1;
  }
  
  return `${year}/${String(nextNumber).padStart(3, '0')}`;
}

// Calculate totals
function calculateTotals(items, applyBollo = true) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vatRate = 0.22; // 22% IVA
  const vatAmount = subtotal * vatRate;
  const bolloThreshold = 77.47;
  const bolloAmount = (applyBollo && subtotal > bolloThreshold) ? 2.00 : 0;
  const total = subtotal + vatAmount + bolloAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatRate: 22,
    vatAmount: Math.round(vatAmount * 100) / 100,
    bolloAmount,
    total: Math.round(total * 100) / 100
  };
}

// GET - List invoices or get single invoice
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const customerId = searchParams.get('customerId');
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const invoices = await getCollection('invoices');
    
    // Get single invoice
    if (invoiceId) {
      const invoice = await invoices.findOne({ id: invoiceId, clinicId });
      if (!invoice) {
        return NextResponse.json({ error: 'Fattura non trovata' }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(invoice, { headers: corsHeaders });
    }
    
    // Build query
    const query = { clinicId };
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (fromDate || toDate) {
      query.issueDate = {};
      if (fromDate) query.issueDate.$gte = fromDate;
      if (toDate) query.issueDate.$lte = toDate;
    }
    
    const invoiceList = await invoices
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate summary stats
    const stats = {
      total: invoiceList.length,
      draft: invoiceList.filter(i => i.status === 'draft').length,
      sent: invoiceList.filter(i => i.status === 'sent').length,
      paid: invoiceList.filter(i => i.status === 'paid').length,
      totalAmount: invoiceList.reduce((sum, i) => sum + (i.totals?.total || 0), 0),
      paidAmount: invoiceList.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.totals?.total || 0), 0)
    };
    
    return NextResponse.json({ invoices: invoiceList, stats }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('GET invoices error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// POST - Create new invoice
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCF, // Codice Fiscale
      customerPIVA, // Partita IVA (optional)
      customerSDI, // Codice SDI (optional, for e-invoice)
      customerPEC, // PEC (optional, for e-invoice)
      items, // Array of { description, quantity, unitPrice }
      notes,
      appointmentId, // Optional: link to appointment
      petId, // Optional: link to pet
      petName,
      isDraft // If true, save as draft without invoice number
    } = body;
    
    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Nome cliente e almeno una prestazione sono obbligatori' 
      }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const invoices = await getCollection('invoices');
    const users = await getCollection('users');
    
    // Get clinic info
    const clinic = await users.findOne({ id: clinicId });
    
    // Calculate totals
    const totals = calculateTotals(items);
    
    // Generate invoice number (only if not draft)
    const invoiceNumber = isDraft ? null : await generateInvoiceNumber(clinicId);
    
    const newInvoice = {
      id: uuidv4(),
      invoiceNumber,
      clinicId,
      clinicName: clinic?.clinicName || clinic?.name,
      clinicAddress: clinic?.address,
      clinicPIVA: clinic?.piva,
      clinicPhone: clinic?.phone,
      clinicEmail: clinic?.email,
      
      // Customer data
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCF,
      customerPIVA,
      customerSDI,
      customerPEC,
      
      // Invoice items
      items: items.map(item => ({
        id: uuidv4(),
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        total: (item.quantity || 1) * item.unitPrice
      })),
      
      // Totals
      totals,
      
      // Metadata
      petId,
      petName,
      appointmentId,
      notes,
      
      // Status & dates
      status: isDraft ? 'draft' : 'issued',
      issueDate: isDraft ? null : new Date().toISOString().split('T')[0],
      dueDate: isDraft ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
      paidDate: null,
      
      // Export tracking
      exportedTo: null, // 'fattureincloud', 'csv', 'manual'
      exportedAt: null,
      externalId: null, // ID from external system
      
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString()
    };
    
    await invoices.insertOne(newInvoice);
    
    return NextResponse.json(newInvoice, { headers: corsHeaders });
    
  } catch (error) {
    console.error('POST invoice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT - Update invoice
export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID fattura obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const invoices = await getCollection('invoices');
    
    const invoice = await invoices.findOne({ id, clinicId });
    if (!invoice) {
      return NextResponse.json({ error: 'Fattura non trovata' }, { status: 404, headers: corsHeaders });
    }
    
    // If converting from draft to issued
    if (invoice.status === 'draft' && updates.status === 'issued') {
      updates.invoiceNumber = await generateInvoiceNumber(clinicId);
      updates.issueDate = new Date().toISOString().split('T')[0];
      updates.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    // If marking as paid
    if (updates.status === 'paid' && invoice.status !== 'paid') {
      updates.paidDate = new Date().toISOString().split('T')[0];
    }
    
    // Recalculate totals if items changed
    if (updates.items) {
      updates.totals = calculateTotals(updates.items);
    }
    
    updates.updatedAt = new Date().toISOString();
    
    await invoices.updateOne({ id }, { $set: updates });
    
    const updatedInvoice = await invoices.findOne({ id });
    return NextResponse.json(updatedInvoice, { headers: corsHeaders });
    
  } catch (error) {
    console.error('PUT invoice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE - Delete draft invoice
export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID fattura obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const invoices = await getCollection('invoices');
    
    const invoice = await invoices.findOne({ id, clinicId });
    if (!invoice) {
      return NextResponse.json({ error: 'Fattura non trovata' }, { status: 404, headers: corsHeaders });
    }
    
    // Only allow deletion of drafts
    if (invoice.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Solo le bozze possono essere eliminate. Le fatture emesse devono essere stornate.' 
      }, { status: 400, headers: corsHeaders });
    }
    
    await invoices.deleteOne({ id });
    
    return NextResponse.json({ success: true, message: 'Bozza eliminata' }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('DELETE invoice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
