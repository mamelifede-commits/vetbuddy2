import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import crypto from 'crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Request statuses
const STATUS = {
  DRAFT: 'draft',           // Bozza, non ancora inviata
  SENT: 'sent',             // Inviata al laboratorio
  IN_PROGRESS: 'in_progress', // Lab sta lavorando
  RESULTS_RECEIVED: 'results_received', // Referti ricevuti, da validare
  VALIDATED: 'validated',   // Veterinario ha validato
  SHARED: 'shared',         // Condiviso con proprietario
  CANCELLED: 'cancelled'    // Annullata
};

// Helper to generate practice code
function generatePracticeCode() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `VB${year}${month}${day}-${random}`;
}

// Helper to format exam list for email/WhatsApp
function formatExamList(exams) {
  return exams.map(e => `• ${e.name}`).join('\n');
}

// GET - Get lab requests (filtered by clinic, patient, status)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = request.headers.get('x-clinic-id');
    const patientId = searchParams.get('patientId');
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    // Build query
    const query = {};
    if (clinicId) query.clinicId = clinicId;
    if (patientId) query.patientId = patientId;
    if (ownerId) query.ownerId = ownerId;
    if (status) query.status = status;
    
    const requests = await db.collection('lab_requests')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('lab_requests').countDocuments(query);
    
    // Get stats
    const stats = {
      total,
      byStatus: {}
    };
    
    for (const s of Object.values(STATUS)) {
      stats.byStatus[s] = await db.collection('lab_requests').countDocuments({ ...query, status: s });
    }
    
    return NextResponse.json({
      success: true,
      requests,
      stats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
    
  } catch (error) {
    console.error('Error fetching lab requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new lab request
export async function POST(request) {
  try {
    const clinicId = request.headers.get('x-clinic-id');
    const data = await request.json();
    
    if (!data.patientId || !data.exams || data.exams.length === 0) {
      return NextResponse.json({ 
        error: 'patientId e almeno un esame sono richiesti' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    // Get patient and owner info
    const patient = await db.collection('pets').findOne({ id: data.patientId });
    const owner = patient ? await db.collection('users').findOne({ id: patient.ownerId }) : null;
    
    const practiceCode = generatePracticeCode();
    
    const labRequest = {
      id: crypto.randomUUID(),
      practiceCode,
      clinicId,
      patientId: data.patientId,
      patientName: patient?.name || data.patientName || 'N/A',
      patientSpecies: patient?.species || data.patientSpecies || 'N/A',
      patientBreed: patient?.breed || data.patientBreed || '',
      patientAge: patient?.birthDate ? calculateAge(patient.birthDate) : data.patientAge || '',
      patientWeight: patient?.weight || data.patientWeight || '',
      patientMicrochip: patient?.microchip || data.patientMicrochip || '',
      ownerId: patient?.ownerId || data.ownerId,
      ownerName: owner?.name || data.ownerName || 'N/A',
      ownerPhone: owner?.phone || data.ownerPhone || '',
      ownerEmail: owner?.email || data.ownerEmail || '',
      clinicName: data.clinicName || '',
      clinicAddress: data.clinicAddress || '',
      clinicPhone: data.clinicPhone || '',
      clinicEmail: data.clinicEmail || '',
      veterinarianName: data.veterinarianName || '',
      veterinarianId: data.veterinarianId || '',
      exams: data.exams, // Array of { id, name, category, price }
      clinicalNotes: data.clinicalNotes || '',
      urgency: data.urgency || 'normal', // normal, urgent
      labName: data.labName || 'Laboratorio Esterno',
      labEmail: data.labEmail || '',
      sampleType: data.sampleType || '', // sangue, urine, feci, tampone, biopsia
      sampleCollectedAt: data.sampleCollectedAt || new Date(),
      status: data.sendNow ? STATUS.SENT : STATUS.DRAFT,
      sentAt: data.sendNow ? new Date() : null,
      resultsReceivedAt: null,
      validatedAt: null,
      validatedBy: null,
      sharedAt: null,
      vetComment: '',
      followUpSuggested: false,
      followUpAppointmentId: null,
      resultFiles: [], // Array of { id, name, url, uploadedAt }
      totalPrice: data.exams.reduce((sum, e) => sum + (e.price || 0), 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('lab_requests').insertOne(labRequest);
    
    // If sendNow, send notifications
    if (data.sendNow) {
      // Send email to lab (would use Resend in production)
      console.log(`[LAB REQUEST] Email to ${labRequest.labEmail}: Practice ${practiceCode}`);
      
      // Send WhatsApp to owner
      if (labRequest.ownerPhone) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              template: 'lab_request_sent',
              to: labRequest.ownerPhone,
              data: {
                ownerName: labRequest.ownerName,
                petName: labRequest.patientName,
                vetName: labRequest.veterinarianName,
                examList: formatExamList(labRequest.exams),
                estimatedTime: getEstimatedTime(labRequest.exams),
                clinicName: labRequest.clinicName
              }
            })
          });
        } catch (err) {
          console.error('Error sending WhatsApp notification:', err);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      request: labRequest
    });
    
  } catch (error) {
    console.error('Error creating lab request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update lab request (change status, add results, validate, share)
export async function PUT(request) {
  try {
    const data = await request.json();
    const { requestId, action } = data;
    
    if (!requestId) {
      return NextResponse.json({ error: 'requestId richiesto' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    const labRequest = await db.collection('lab_requests').findOne({ id: requestId });
    if (!labRequest) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
    }
    
    const updates = { updatedAt: new Date() };
    
    switch (action) {
      case 'send':
        // Send draft to lab
        updates.status = STATUS.SENT;
        updates.sentAt = new Date();
        // TODO: Send email to lab
        break;
        
      case 'mark_in_progress':
        // Lab is working on it
        updates.status = STATUS.IN_PROGRESS;
        break;
        
      case 'upload_results':
        // Results received
        updates.status = STATUS.RESULTS_RECEIVED;
        updates.resultsReceivedAt = new Date();
        if (data.resultFiles) {
          updates.resultFiles = data.resultFiles;
        }
        // Notify veterinarian
        break;
        
      case 'validate':
        // Vet validates results
        updates.status = STATUS.VALIDATED;
        updates.validatedAt = new Date();
        updates.validatedBy = data.veterinarianId || data.validatedBy;
        updates.vetComment = data.vetComment || '';
        updates.followUpSuggested = data.followUpSuggested || false;
        break;
        
      case 'share':
        // Share with owner
        updates.status = STATUS.SHARED;
        updates.sharedAt = new Date();
        
        // Send WhatsApp notification to owner
        if (labRequest.ownerPhone) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/notify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                template: 'lab_results_ready',
                to: labRequest.ownerPhone,
                data: {
                  ownerName: labRequest.ownerName,
                  petName: labRequest.patientName,
                  vetComment: updates.vetComment || labRequest.vetComment,
                  followUpSuggested: updates.followUpSuggested || labRequest.followUpSuggested,
                  clinicName: labRequest.clinicName
                }
              })
            });
          } catch (err) {
            console.error('Error sending WhatsApp notification:', err);
          }
        }
        break;
        
      case 'cancel':
        updates.status = STATUS.CANCELLED;
        break;
        
      case 'update_notes':
        updates.clinicalNotes = data.clinicalNotes;
        updates.vetComment = data.vetComment;
        break;
        
      default:
        // Generic update
        if (data.status) updates.status = data.status;
        if (data.vetComment !== undefined) updates.vetComment = data.vetComment;
        if (data.followUpSuggested !== undefined) updates.followUpSuggested = data.followUpSuggested;
        if (data.resultFiles) updates.resultFiles = data.resultFiles;
    }
    
    await db.collection('lab_requests').updateOne(
      { id: requestId },
      { $set: updates }
    );
    
    return NextResponse.json({
      success: true,
      updates
    });
    
  } catch (error) {
    console.error('Error updating lab request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete lab request (only drafts)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    
    if (!requestId) {
      return NextResponse.json({ error: 'requestId richiesto' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    const labRequest = await db.collection('lab_requests').findOne({ id: requestId });
    
    if (!labRequest) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
    }
    
    if (labRequest.status !== STATUS.DRAFT) {
      return NextResponse.json({ 
        error: 'Solo le bozze possono essere eliminate' 
      }, { status: 400 });
    }
    
    await db.collection('lab_requests').deleteOne({ id: requestId });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting lab request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper functions
function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  
  if (years === 0) {
    return `${months} mesi`;
  } else if (years === 1 && months < 0) {
    return `${12 + months} mesi`;
  }
  return `${years} anni`;
}

function getEstimatedTime(exams) {
  const maxHours = Math.max(...exams.map(e => e.turnaroundHours || 72));
  if (maxHours <= 24) return '24 ore';
  if (maxHours <= 48) return '48 ore';
  if (maxHours <= 72) return '72 ore';
  if (maxHours <= 120) return '5 giorni';
  return '7 giorni';
}
