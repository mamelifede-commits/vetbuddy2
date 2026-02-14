import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Eventi per professionisti veterinari (stessa lista dell'API principale)
const CLINIC_EVENTS = [
  {
    id: 'scivac-rimini-2025',
    title: 'Congresso Nazionale SCIVAC 2025',
    description: 'Il più importante evento veterinario italiano. Oltre 100 relatori internazionali, workshop pratici, sessioni specialistiche e area espositiva. ECM garantiti.',
    date: '2025-05-23',
    endDate: '2025-05-25',
    location: 'Rimini Fiera, Via Emilia 155, Rimini',
    organizer: 'SCIVAC',
    type: 'congresso',
    url: 'https://www.scivac.it/it/congressi/congresso-nazionale/',
    image: '🏛️',
    ecm: true,
    ecmCredits: 24,
    topics: ['Medicina Interna', 'Chirurgia', 'Oncologia', 'Cardiologia'],
    featured: true
  },
  {
    id: 'sivar-cremona-2025',
    title: 'Congresso Internazionale SIVAR',
    description: 'Congresso dedicato alla medicina e chirurgia dei ruminanti. Focus su bovini, ovini e caprini con sessioni pratiche in azienda.',
    date: '2025-04-10',
    endDate: '2025-04-12',
    location: 'CremonaFiere, Piazza Zelioli Lanzini 1, Cremona',
    organizer: 'SIVAR',
    type: 'congresso',
    url: 'https://www.sivarnet.it/congresso/',
    image: '🐄',
    ecm: true,
    ecmCredits: 18,
    topics: ['Buiatria', 'Medicina Preventiva', 'Riproduzione'],
    featured: true
  },
  {
    id: 'anmvi-webinar-dermatologia',
    title: 'Webinar ANMVI: Dermatologia Veterinaria Update',
    description: 'Aggiornamento sulle nuove terapie per dermatiti allergiche e infettive. Focus su approccio diagnostico e casi clinici interattivi.',
    date: '2025-03-15',
    endDate: '2025-03-15',
    location: 'Online',
    organizer: 'ANMVI',
    type: 'webinar',
    url: 'https://www.anmvioggi.it/formazione/',
    image: '💻',
    ecm: true,
    ecmCredits: 6,
    topics: ['Dermatologia', 'Allergologia'],
    featured: false
  },
  {
    id: 'scivac-corso-ecografia',
    title: 'Corso Pratico: Ecografia Addominale Avanzata',
    description: 'Corso intensivo con sessioni hands-on su ecografo. Massimo 15 partecipanti per garantire pratica individuale. Docenti certificati ECVDI.',
    date: '2025-04-05',
    endDate: '2025-04-06',
    location: 'Centro Studi SCIVAC, Palazzo Trecchi, Cremona',
    organizer: 'SCIVAC',
    type: 'corso',
    url: 'https://www.scivac.it/it/corsi-pratici/',
    image: '🔬',
    ecm: true,
    ecmCredits: 12,
    topics: ['Diagnostica per Immagini', 'Ecografia'],
    featured: true
  },
  {
    id: 'fnovi-assemblea-2025',
    title: 'Assemblea Nazionale FNOVI',
    description: 'Assemblea annuale della Federazione Nazionale Ordini Veterinari Italiani. Aggiornamenti normativi, deontologici e professionali.',
    date: '2025-06-14',
    endDate: '2025-06-15',
    location: 'Roma, Centro Congressi Frentani',
    organizer: 'FNOVI',
    type: 'congresso',
    url: 'https://www.fnovi.it/eventi',
    image: '⚖️',
    ecm: true,
    ecmCredits: 8,
    topics: ['Legislazione', 'Deontologia', 'Professione'],
    featured: false
  },
  {
    id: 'workshop-ortopedia-milano',
    title: 'Workshop: Tecniche di Osteosintesi Moderne',
    description: 'Workshop pratico su tecniche innovative di osteosintesi. Esercitazioni su modelli anatomici e discussione casi complessi.',
    date: '2025-05-10',
    endDate: '2025-05-11',
    location: 'Clinica Veterinaria Gran Sasso, Milano',
    organizer: 'Improve International',
    type: 'workshop',
    url: 'https://www.improveinternational.com/it/',
    image: '🦴',
    ecm: true,
    ecmCredits: 14,
    topics: ['Ortopedia', 'Chirurgia', 'Traumatologia'],
    featured: true
  },
  {
    id: 'webinar-anestesia-felina',
    title: 'Webinar: Anestesia nel Paziente Felino',
    description: 'Approccio cat-friendly all\'anestesia. Protocolli specifici, monitoraggio e gestione delle complicanze nel gatto.',
    date: '2025-03-22',
    endDate: '2025-03-22',
    location: 'Online',
    organizer: 'SCIVAC',
    type: 'webinar',
    url: 'https://www.scivac.it/it/webinar/',
    image: '😺',
    ecm: true,
    ecmCredits: 4,
    topics: ['Anestesiologia', 'Medicina Felina'],
    featured: false
  },
  {
    id: 'congresso-esotici-padova',
    title: 'Congresso Nazionale Animali Esotici SIVAE',
    description: 'L\'appuntamento italiano per la medicina degli animali non convenzionali. Rettili, uccelli, piccoli mammiferi e pesci ornamentali.',
    date: '2025-09-20',
    endDate: '2025-09-21',
    location: 'Padova Congress, Via N. Tommaseo 59, Padova',
    organizer: 'SIVAE',
    type: 'congresso',
    url: 'https://www.sivae.it/congressi/',
    image: '🦎',
    ecm: true,
    ecmCredits: 16,
    topics: ['Animali Esotici', 'Rettili', 'Uccelli'],
    featured: true
  },
  {
    id: 'corso-oncologia-bologna',
    title: 'Corso: Chemioterapia in Oncologia Veterinaria',
    description: 'Protocolli chemioterapici aggiornati, gestione effetti collaterali e comunicazione con il proprietario. Casi clinici reali.',
    date: '2025-04-26',
    endDate: '2025-04-27',
    location: 'Hotel Savoia Regency, Bologna',
    organizer: 'SCIVAC Oncologia',
    type: 'corso',
    url: 'https://www.scivac.it/it/gruppi-di-studio/oncologia/',
    image: '💉',
    ecm: true,
    ecmCredits: 10,
    topics: ['Oncologia', 'Chemioterapia'],
    featured: false
  },
  {
    id: 'webinar-cardiologia-update',
    title: 'Webinar: Cardiologia del Cane - Update 2025',
    description: 'Novità diagnostiche e terapeutiche nella cardiologia canina. Focus su valvulopatie e cardiomiopatie con ecocardiografia.',
    date: '2025-03-29',
    endDate: '2025-03-29',
    location: 'Online',
    organizer: 'ANMVI',
    type: 'webinar',
    url: 'https://www.anmvioggi.it/formazione/',
    image: '❤️',
    ecm: true,
    ecmCredits: 5,
    topics: ['Cardiologia', 'Ecocardiografia'],
    featured: false
  },
  {
    id: 'workshop-endoscopia-torino',
    title: 'Workshop Pratico: Endoscopia Digestiva',
    description: 'Corso intensivo su gastroscopia, colonscopia e biopsie endoscopiche. Pratica su modelli e casi videoregistrati.',
    date: '2025-06-07',
    endDate: '2025-06-08',
    location: 'Clinica Veterinaria Città di Torino',
    organizer: 'Improve International',
    type: 'workshop',
    url: 'https://www.improveinternational.com/it/',
    image: '🔍',
    ecm: true,
    ecmCredits: 12,
    topics: ['Endoscopia', 'Gastroenterologia'],
    featured: false
  },
  {
    id: 'congresso-riproduzione-pisa',
    title: 'Congresso EVSSAR: Riproduzione e Neonatologia',
    description: 'Congresso europeo sulla riproduzione canina e felina. Inseminazione artificiale, gestione del parto e cure neonatali.',
    date: '2025-07-03',
    endDate: '2025-07-05',
    location: 'Pisa Congress, Via Matteotti 1, Pisa',
    organizer: 'EVSSAR',
    type: 'congresso',
    url: 'https://www.evssar.org/congresses/',
    image: '🐕',
    ecm: true,
    ecmCredits: 20,
    topics: ['Riproduzione', 'Neonatologia', 'Ginecologia'],
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
