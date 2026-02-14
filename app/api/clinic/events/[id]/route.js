import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Stessi eventi della route principale - devono essere sincronizzati
const CLINIC_EVENTS = [
  {
    id: 'scivac-2026',
    title: 'Congresso Nazionale SCIVAC 2026',
    organizer: 'SCIVAC',
    date: '2026-03-15',
    endDate: '2026-03-17',
    location: 'Rimini Fiera',
    type: 'congresso',
    description: 'Il più grande congresso veterinario italiano con oltre 5000 partecipanti. Sessioni plenarie, workshop pratici e area espositiva.',
    url: 'https://www.scivac.it',
    topics: ['Medicina interna', 'Chirurgia', 'Dermatologia', 'Ortopedia'],
    ecm: true,
    ecmCredits: 24,
    image: '🏛️',
    featured: true
  },
  {
    id: 'aivpa-eco-2026',
    title: 'Corso Avanzato di Ecografia Addominale',
    organizer: 'AIVPA',
    date: '2026-02-28',
    endDate: '2026-03-01',
    location: 'Milano - Hotel Marriott',
    type: 'corso',
    description: 'Corso pratico con esercitazioni su animali vivi. Massimo 20 partecipanti per garantire qualità formativa.',
    url: 'https://www.aivpa.it',
    topics: ['Ecografia', 'Diagnostica per immagini'],
    ecm: true,
    ecmCredits: 12,
    image: '🔬',
    featured: false
  },
  {
    id: 'cardiovet-webinar-2026',
    title: 'Webinar: Novità in Cardiologia Veterinaria 2026',
    organizer: 'CARDIOVET',
    date: '2026-02-20',
    endDate: '2026-02-20',
    location: 'Online',
    type: 'webinar',
    description: 'Le ultime novità nella diagnosi e terapia delle cardiopatie. Focus su ecocardiografia avanzata e terapie innovative.',
    url: 'https://www.cardiovet.it',
    topics: ['Cardiologia', 'Ecocardiografia', 'Farmacologia'],
    ecm: true,
    ecmCredits: 4,
    image: '💻',
    featured: false
  },
  {
    id: 'fnovi-day-2026',
    title: 'FNOVI Day 2026',
    organizer: 'FNOVI',
    date: '2026-04-10',
    endDate: '2026-04-10',
    location: 'Roma - Auditorium Parco della Musica',
    type: 'congresso',
    description: 'Giornata nazionale della professione veterinaria. Aggiornamenti normativi, deontologici e sulla professione.',
    url: 'https://www.fnovi.it',
    topics: ['Deontologia', 'Normativa', 'Professione'],
    ecm: true,
    ecmCredits: 8,
    image: '🎓',
    featured: true
  },
  {
    id: 'siodov-workshop-2026',
    title: 'Workshop Odontostomatologia Veterinaria',
    organizer: 'SIODOV',
    date: '2026-05-22',
    endDate: '2026-05-23',
    location: 'Torino - Centro Congressi',
    type: 'workshop',
    description: 'Pratica intensiva su modelli anatomici e casi clinici reali. Tecniche di estrazione e chirurgia orale.',
    url: 'https://www.siodov.it',
    topics: ['Odontostomatologia', 'Chirurgia orale'],
    ecm: true,
    ecmCredits: 16,
    image: '🦷',
    featured: false
  },
  {
    id: 'sivae-esotici-2026',
    title: 'Congresso SIVAE - Animali Esotici',
    organizer: 'SIVAE',
    date: '2026-06-05',
    endDate: '2026-06-07',
    location: 'Bologna Fiere',
    type: 'congresso',
    description: 'Tutto sugli animali esotici: rettili, uccelli, piccoli mammiferi. Workshop pratici e sessioni plenarie.',
    url: 'https://www.sivae.it',
    topics: ['Animali esotici', 'Rettili', 'Uccelli', 'Piccoli mammiferi'],
    ecm: true,
    ecmCredits: 20,
    image: '🦎',
    featured: false
  },
  {
    id: 'scivac-derma-2026',
    title: 'Seminario SCIVAC Dermatologia',
    organizer: 'SCIVAC',
    date: '2026-04-25',
    endDate: '2026-04-26',
    location: 'Cremona - Palazzo Trecchi',
    type: 'corso',
    description: 'Approfondimento sulle patologie dermatologiche più frequenti. Diagnosi differenziale e terapie innovative.',
    url: 'https://www.scivac.it',
    topics: ['Dermatologia', 'Allergologia', 'Diagnostica'],
    ecm: true,
    ecmCredits: 10,
    image: '🔍',
    featured: false
  },
  {
    id: 'unisvet-anestesia-2026',
    title: 'Master Anestesia e Rianimazione',
    organizer: 'UNISVET',
    date: '2026-09-15',
    endDate: '2026-09-17',
    location: 'Milano - Università',
    type: 'corso',
    description: 'Corso avanzato teorico-pratico su anestesia loco-regionale, monitoraggio e gestione emergenze.',
    url: 'https://www.unisvet.it',
    topics: ['Anestesia', 'Rianimazione', 'Emergenze'],
    ecm: true,
    ecmCredits: 25,
    image: '💉',
    featured: false
  },
  {
    id: 'aivpafe-2026',
    title: 'Congresso AIVPAFE - Medicina Felina',
    organizer: 'AIVPAFE',
    date: '2026-10-10',
    endDate: '2026-10-11',
    location: 'Firenze - Palazzo dei Congressi',
    type: 'congresso',
    description: 'Il congresso italiano dedicato esclusivamente alla medicina del gatto. Approccio cat-friendly.',
    url: 'https://www.aivpafe.it',
    topics: ['Medicina felina', 'Cat-friendly', 'Comportamento'],
    ecm: true,
    ecmCredits: 14,
    image: '🐱',
    featured: true
  },
  {
    id: 'sive-equini-2026',
    title: 'Congresso SIVE Medicina Equina',
    organizer: 'SIVE',
    date: '2026-01-25',
    endDate: '2026-01-27',
    location: 'Bologna - Palazzo della Cultura',
    type: 'congresso',
    description: 'Il principale evento italiano per la medicina equina. Chirurgia, ortopedia, medicina sportiva.',
    url: 'https://www.sive.it',
    topics: ['Medicina equina', 'Ortopedia', 'Chirurgia'],
    ecm: true,
    ecmCredits: 22,
    image: '🐴',
    featured: true
  }
];

// GET - Fetch single clinic event by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const event = CLINIC_EVENTS.find(e => e.id === id);
    
    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404, headers: corsHeaders });
    }
    
    return NextResponse.json(event, { headers: corsHeaders });
    
  } catch (error) {
    console.error('GET clinic event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
