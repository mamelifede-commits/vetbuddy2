import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Default exam catalog for Italian veterinary clinics
const DEFAULT_EXAMS = [
  // ROUTINE
  { id: 'emocromo', name: 'Emocromo completo (CBC)', category: 'routine', description: 'Conta cellule del sangue, emoglobina, ematocrito', turnaroundHours: 24, price: 35 },
  { id: 'biochimico-base', name: 'Profilo biochimico base', category: 'routine', description: 'Glicemia, creatinina, urea, ALT, ALP, proteine totali', turnaroundHours: 24, price: 45 },
  { id: 'biochimico-completo', name: 'Profilo biochimico completo', category: 'routine', description: 'Profilo base + albumina, bilirubina, colesterolo, trigliceridi, amilasi, lipasi', turnaroundHours: 24, price: 75 },
  { id: 'elettroliti', name: 'Elettroliti (Na, K, Cl)', category: 'routine', description: 'Sodio, potassio, cloro', turnaroundHours: 24, price: 25 },
  { id: 'urine-completo', name: 'Esame urine completo', category: 'routine', description: 'Esame chimico-fisico + sedimento', turnaroundHours: 24, price: 30 },
  { id: 'upc', name: 'Rapporto proteine/creatinina urinarie (UPC)', category: 'routine', description: 'Valutazione proteinuria', turnaroundHours: 24, price: 25 },
  { id: 'feci', name: 'Esame feci parassitologico', category: 'routine', description: 'Ricerca parassiti intestinali', turnaroundHours: 48, price: 25 },
  { id: 'coagulazione', name: 'Profilo coagulativo (PT, aPTT)', category: 'routine', description: 'Tempo di protrombina e tromboplastina parziale attivata', turnaroundHours: 24, price: 40 },
  
  // ENDOCRINO
  { id: 't4-totale', name: 'T4 totale', category: 'endocrino', description: 'Tiroxina totale - screening tiroide', turnaroundHours: 48, price: 35 },
  { id: 'tsh', name: 'TSH canino', category: 'endocrino', description: 'Ormone tireostimolante', turnaroundHours: 48, price: 40 },
  { id: 'ft4', name: 'fT4 (T4 libero)', category: 'endocrino', description: 'Tiroxina libera - conferma ipotiroidismo', turnaroundHours: 48, price: 45 },
  { id: 'cortisolo-basale', name: 'Cortisolo basale', category: 'endocrino', description: 'Screening Cushing/Addison', turnaroundHours: 48, price: 35 },
  { id: 'acth-stimolazione', name: 'Test stimolazione ACTH', category: 'endocrino', description: 'Diagnosi Cushing/Addison', turnaroundHours: 72, price: 80 },
  { id: 'fruttosamine', name: 'Fruttosamine', category: 'endocrino', description: 'Controllo glicemico 2-3 settimane', turnaroundHours: 48, price: 30 },
  
  // INFETTIVOLOGIA
  { id: 'leishmania-ifat', name: 'Leishmania (IFAT)', category: 'infettivologia', description: 'Titolo anticorpale leishmaniosi', turnaroundHours: 72, price: 45 },
  { id: 'leishmania-pcr', name: 'Leishmania (PCR)', category: 'infettivologia', description: 'Ricerca DNA Leishmania', turnaroundHours: 72, price: 65 },
  { id: 'ehrlichia', name: 'Ehrlichia canis (IFAT)', category: 'infettivologia', description: 'Titolo anticorpale ehrlichiosi', turnaroundHours: 72, price: 40 },
  { id: 'fiv-felv', name: 'FIV/FeLV test', category: 'infettivologia', description: 'Immunodeficienza e leucemia felina', turnaroundHours: 24, price: 35 },
  { id: 'snap-4dx', name: 'SNAP 4Dx Plus', category: 'infettivologia', description: 'Heartworm, Ehrlichia, Anaplasma, Borrelia', turnaroundHours: 24, price: 55 },
  { id: 'giardia', name: 'Giardia (ELISA)', category: 'infettivologia', description: 'Ricerca antigene Giardia', turnaroundHours: 24, price: 30 },
  { id: 'parvo-corona', name: 'Parvo/Corona test rapido', category: 'infettivologia', description: 'Parvovirus e Coronavirus canino', turnaroundHours: 24, price: 35 },
  
  // MICROBIOLOGIA
  { id: 'coltura-antibiogramma', name: 'Coltura + Antibiogramma', category: 'microbiologia', description: 'Isolamento batterio + sensibilità antibiotici', turnaroundHours: 96, price: 55 },
  { id: 'coltura-urine', name: 'Urinocoltura + Antibiogramma', category: 'microbiologia', description: 'Coltura urine per cistiti batteriche', turnaroundHours: 96, price: 50 },
  { id: 'coltura-otite', name: 'Coltura auricolare + Antibiogramma', category: 'microbiologia', description: 'Per otiti croniche/ricorrenti', turnaroundHours: 96, price: 55 },
  { id: 'dermatofiti', name: 'Coltura dermatofiti', category: 'microbiologia', description: 'Ricerca funghi cutanei', turnaroundHours: 168, price: 40 },
  
  // CITOLOGIA/ISTOLOGIA
  { id: 'citologia', name: 'Esame citologico', category: 'citologia', description: 'Citologia da ago aspirato o impronta', turnaroundHours: 72, price: 45 },
  { id: 'istologia', name: 'Esame istologico', category: 'istologia', description: 'Biopsia con diagnosi istopatologica', turnaroundHours: 120, price: 85 },
  { id: 'istologia-margini', name: 'Istologico + Valutazione margini', category: 'istologia', description: 'Per masse neoplastiche asportate', turnaroundHours: 120, price: 110 },
  
  // CARDIOLOGIA
  { id: 'bnp', name: 'NT-proBNP', category: 'cardiologia', description: 'Biomarcatore cardiaco', turnaroundHours: 72, price: 55 },
  { id: 'troponina', name: 'Troponina cardiaca I', category: 'cardiologia', description: 'Marcatore danno miocardico', turnaroundHours: 48, price: 50 },
  
  // ALTRO
  { id: 'lipasi-spec', name: 'Lipasi pancreatica specifica (cPL/fPL)', category: 'altro', description: 'Diagnosi pancreatite', turnaroundHours: 48, price: 55 },
  { id: 'bile-acids', name: 'Acidi biliari pre/post prandiali', category: 'altro', description: 'Funzionalità epatica', turnaroundHours: 72, price: 60 },
  { id: 'vitamina-b12', name: 'Vitamina B12 / Folati', category: 'altro', description: 'Malassorbimento intestinale', turnaroundHours: 72, price: 45 },
];

// GET - Get exam catalog
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = request.headers.get('x-clinic-id');
    const category = searchParams.get('category');
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    // Try to get clinic's custom catalog, fallback to default
    let exams = await db.collection('exam_catalogs').findOne({ clinicId });
    
    if (!exams || !exams.items || exams.items.length === 0) {
      // Return default catalog
      exams = { items: DEFAULT_EXAMS };
    }
    
    let items = exams.items;
    
    // Filter by category if specified
    if (category) {
      items = items.filter(exam => exam.category === category);
    }
    
    // Group by category
    const categories = {};
    items.forEach(exam => {
      if (!categories[exam.category]) {
        categories[exam.category] = [];
      }
      categories[exam.category].push(exam);
    });
    
    return NextResponse.json({
      success: true,
      exams: items,
      categories,
      categoryList: ['routine', 'endocrino', 'infettivologia', 'microbiologia', 'citologia', 'istologia', 'cardiologia', 'altro']
    });
    
  } catch (error) {
    console.error('Error fetching exam catalog:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add custom exam to clinic's catalog
export async function POST(request) {
  try {
    const clinicId = request.headers.get('x-clinic-id');
    const data = await request.json();
    
    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID richiesto' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    const newExam = {
      id: data.id || require('crypto').randomUUID(),
      name: data.name,
      category: data.category || 'altro',
      description: data.description || '',
      turnaroundHours: data.turnaroundHours || 72,
      price: data.price || 0,
      labEmail: data.labEmail || null,
      labName: data.labName || null,
      isCustom: true,
      createdAt: new Date()
    };
    
    // Get or create clinic catalog
    const existingCatalog = await db.collection('exam_catalogs').findOne({ clinicId });
    
    if (existingCatalog) {
      await db.collection('exam_catalogs').updateOne(
        { clinicId },
        { $push: { items: newExam } }
      );
    } else {
      // Create new catalog with defaults + custom exam
      await db.collection('exam_catalogs').insertOne({
        clinicId,
        items: [...DEFAULT_EXAMS, newExam],
        createdAt: new Date()
      });
    }
    
    return NextResponse.json({
      success: true,
      exam: newExam
    });
    
  } catch (error) {
    console.error('Error adding exam to catalog:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update clinic's exam catalog (enable/disable exams, update prices)
export async function PUT(request) {
  try {
    const clinicId = request.headers.get('x-clinic-id');
    const data = await request.json();
    
    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID richiesto' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    if (data.examId && data.updates) {
      // Update specific exam
      await db.collection('exam_catalogs').updateOne(
        { clinicId, 'items.id': data.examId },
        { $set: { 
          'items.$.price': data.updates.price,
          'items.$.enabled': data.updates.enabled,
          'items.$.labEmail': data.updates.labEmail,
          'items.$.labName': data.updates.labName
        }}
      );
    } else if (data.items) {
      // Replace entire catalog
      await db.collection('exam_catalogs').updateOne(
        { clinicId },
        { $set: { items: data.items, updatedAt: new Date() } },
        { upsert: true }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating exam catalog:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
