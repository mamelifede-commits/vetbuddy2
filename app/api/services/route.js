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

// CATALOGO COMPLETO DEI SERVIZI VETERINARI
const VETERINARY_SERVICES = {
  video_consulto: {
    name: 'Video Consulto',
    icon: 'Video',
    services: [
      { id: 'consulenza_online', name: 'Consulenza Online', description: 'Consulenza a distanza per triage, dubbi, follow-up e interpretazione referti', type: 'online', duration: 20 },
      { id: 'follow_up_online', name: 'Follow-up Online', description: 'Controllo post-visita o post-intervento in videochiamata', type: 'online', duration: 15 },
      { id: 'interpretazione_referti', name: 'Interpretazione Referti', description: 'Spiegazione e discussione di esami e analisi', type: 'online', duration: 15 },
      { id: 'consulto_comportamentale', name: 'Consulto Comportamentale', description: 'Valutazione iniziale problemi comportamentali', type: 'online', duration: 30 },
      { id: 'seconda_opinione', name: 'Seconda Opinione', description: 'Valutazione caso clinico per secondo parere', type: 'online', duration: 25 }
    ]
  },
  visite_generali: {
    name: 'Visite Generali',
    icon: 'Stethoscope',
    services: [
      { id: 'visita_clinica', name: 'Visita Clinica Generale', description: 'Controllo stato di salute, peso, parassiti e piano vaccinale' },
      { id: 'vaccini', name: 'Vaccinazioni', description: 'Piano vaccinale completo per cani e gatti' },
      { id: 'check_up', name: 'Check-up Preventivo', description: 'Controllo generale periodico dello stato di salute' },
      { id: 'visita_preanestesia', name: 'Visita Pre-anestesiologica', description: 'Valutazione del rischio prima di interventi chirurgici' }
    ]
  },
  visite_specialistiche: {
    name: 'Visite Specialistiche',
    icon: 'UserCog',
    services: [
      { id: 'cardiologia', name: 'Cardiologia', description: 'ECG, ecocardiografia e patologie cardiache' },
      { id: 'dermatologia', name: 'Dermatologia', description: 'Problemi della pelle, allergie e parassiti cutanei' },
      { id: 'oculistica', name: 'Oculistica', description: 'Patologie oculari e problemi alla vista' },
      { id: 'ortopedia', name: 'Ortopedia', description: 'Problemi muscolo-scheletrici e articolari' },
      { id: 'oncologia', name: 'Oncologia', description: 'Diagnosi e trattamento tumori e neoplasie' },
      { id: 'riproduzione', name: 'Riproduzione e Neonatologia', description: 'Gravidanza, parto e cura dei cuccioli' },
      { id: 'neurologia', name: 'Neurologia', description: 'Patologie del sistema nervoso' },
      { id: 'esotici', name: 'Animali Esotici', description: 'Cura di rettili, uccelli e piccoli mammiferi' }
    ]
  },
  chirurgia: {
    name: 'Chirurgia',
    icon: 'Scissors',
    services: [
      { id: 'sterilizzazione', name: 'Sterilizzazione', description: 'Ovariectomie, ovarioisterectomie e castrazioni' },
      { id: 'tessuti_molli', name: 'Chirurgia Tessuti Molli', description: 'Rimozione masse, chirurgia gastrointestinale, cistotomie' },
      { id: 'ortopedica', name: 'Chirurgia Ortopedica', description: 'Fratture, lussazioni, rottura legamento crociato' },
      { id: 'odontoiatria', name: 'Odontoiatria Veterinaria', description: 'Detartrasi, estrazioni e cure dentali' },
      { id: 'urgenze', name: 'Chirurgia d\'Urgenza', description: 'Torsioni gastriche, traumi, emorragie' },
      { id: 'oculistica_chir', name: 'Chirurgia Oculistica', description: 'Correzione entropion, ectropion e cataratta' }
    ]
  },
  diagnostica: {
    name: 'Diagnostica',
    icon: 'Search',
    services: [
      { id: 'radiografia', name: 'Radiografia (RX)', description: 'Immagini diagnostiche con raggi X' },
      { id: 'ecografia', name: 'Ecografia', description: 'Diagnostica ad ultrasuoni addominale e cardiaca' },
      { id: 'esami_sangue', name: 'Esami del Sangue', description: 'Emocromo, biochimico e profili specifici' },
      { id: 'esami_urine', name: 'Esami Urine', description: 'Analisi completa delle urine' },
      { id: 'tac', name: 'TAC', description: 'Tomografia computerizzata' },
      { id: 'risonanza', name: 'Risonanza Magnetica (RM)', description: 'Imaging avanzato per tessuti molli' },
      { id: 'endoscopia', name: 'Endoscopia', description: 'Esplorazione visiva di organi interni' }
    ]
  },
  altri_servizi: {
    name: 'Altri Servizi',
    icon: 'Plus',
    services: [
      { id: 'pronto_soccorso', name: 'Pronto Soccorso 24h', description: 'Emergenze veterinarie h24' },
      { id: 'degenza', name: 'Degenza e Ricovero', description: 'Ospedalizzazione e osservazione' },
      { id: 'terapia_intensiva', name: 'Terapia Intensiva', description: 'Cure intensive per casi critici' },
      { id: 'igiene_orale', name: 'Igiene Orale', description: 'Pulizia dentale professionale e ablazione tartaro' },
      { id: 'microchip', name: 'Microchip e Anagrafe', description: 'Inserimento microchip e registrazione' },
      { id: 'pet_passport', name: 'Passaporto e Certificati', description: 'Documenti per viaggi e certificazioni sanitarie' }
    ]
  }
};

// GET - Restituisce il catalogo servizi completo
export async function GET(request) {
  try {
    // Restituisce sempre il catalogo completo dei servizi
    // Questo è il catalogo standard che le cliniche possono selezionare
    return NextResponse.json(VETERINARY_SERVICES, { headers: corsHeaders });
    
  } catch (error) {
    console.error('GET services error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// POST - Create new custom service
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const { name, description, category, price, duration, vatIncluded } = body;
    
    if (!name || !price) {
      return NextResponse.json({ 
        error: 'Nome e prezzo sono obbligatori' 
      }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const services = await getCollection('services');
    
    const newService = {
      id: uuidv4(),
      clinicId,
      name,
      description: description || '',
      category: category || 'altro',
      price: parseFloat(price),
      vatIncluded: vatIncluded !== false,
      duration: duration || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await services.insertOne(newService);
    
    return NextResponse.json(newService, { headers: corsHeaders });
    
  } catch (error) {
    console.error('POST service error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT - Update service
export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID servizio obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const services = await getCollection('services');
    
    const service = await services.findOne({ id, clinicId });
    if (!service) {
      return NextResponse.json({ error: 'Servizio non trovato' }, { status: 404, headers: corsHeaders });
    }
    
    updates.updatedAt = new Date().toISOString();
    
    await services.updateOne({ id }, { $set: updates });
    
    const updatedService = await services.findOne({ id });
    return NextResponse.json(updatedService, { headers: corsHeaders });
    
  } catch (error) {
    console.error('PUT service error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE - Delete service
export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'clinic' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID servizio obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const clinicId = user.role === 'clinic' ? user.id : user.clinicId;
    const services = await getCollection('services');
    
    await services.deleteOne({ id, clinicId });
    
    return NextResponse.json({ success: true }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('DELETE service error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
