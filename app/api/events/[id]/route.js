import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Stessi DEFAULT_EVENTS usati in /api/events/route.js
const DEFAULT_EVENTS = [
  {
    id: 'enci-expo-milano-2026',
    title: 'Esposizione Internazionale Canina Milano',
    description: 'La più importante esposizione canina d\'Italia organizzata da ENCI. Oltre 10.000 cani di 200 razze, giudici internazionali, area shopping e attività per famiglie.',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    categoryLabel: 'Cani',
    location: 'Fiera Milano Rho',
    organizer: 'ENCI - Ente Nazionale Cinofilia Italiana',
    source: 'enci',
    sourceLabel: 'ENCI',
    link: 'https://www.enci.it/expo-milano',
    isFeatured: true
  },
  {
    id: 'parco-sempione-dog-friendly',
    title: 'Dog Day al Parco Sempione',
    description: 'Giornata dedicata ai cani nel cuore di Milano. Area sgambamento, educatori cinofili gratuiti, servizio veterinario e tanto divertimento per i nostri amici a 4 zampe.',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    categoryLabel: 'Cani',
    location: 'Parco Sempione, Milano',
    organizer: 'Comune di Milano',
    source: 'comune',
    sourceLabel: 'Comune di Milano',
    link: 'https://www.comune.milano.it/aree-tematiche/animali',
    isFeatured: true
  },
  {
    id: 'corso-educazione-cane-milano',
    title: 'Corso Gratuito Educazione Cinofila',
    description: 'Corso base di educazione per cani organizzato dal Comune di Milano. 4 lezioni gratuite con educatori certificati ENCI. Prenotazione obbligatoria.',
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    categoryLabel: 'Cani',
    location: 'Area Cani Parco Forlanini, Milano',
    organizer: 'Comune di Milano',
    source: 'comune',
    sourceLabel: 'Comune di Milano',
    link: 'https://www.comune.milano.it/servizi/corsi-di-educazione-cinofila'
  },
  {
    id: 'anfi-expo-gatti-milano',
    title: 'Esposizione Internazionale Felina ANFI',
    description: 'Mostra felina con oltre 500 gatti di razza. Giudici WCF, concorsi di bellezza, angolo adozioni e consulenze veterinarie gratuite.',
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'gatti',
    categoryLabel: 'Gatti',
    location: 'Palazzo delle Stelline, Milano',
    organizer: 'ANFI - Associazione Nazionale Felina Italiana',
    source: 'anfi',
    sourceLabel: 'ANFI',
    link: 'https://www.anfitalia.it/esposizioni',
    isFeatured: true
  },
  {
    id: 'giornata-gatto-nero-milano',
    title: 'Giornata del Gatto Nero - Adozioni Speciali',
    description: 'In occasione della Giornata del Gatto Nero, adozioni a tariffa ridotta per tutti i gatti neri. Sfatiamo le superstizioni!',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'gatti',
    categoryLabel: 'Gatti',
    location: 'ENPA Milano, Via Gassendi 2',
    organizer: 'ENPA Milano',
    source: 'enpa',
    sourceLabel: 'ENPA',
    link: 'https://www.enpa.it/milano'
  },
  {
    id: 'enpa-open-day-milano',
    title: 'Open Day Rifugio ENPA Milano',
    description: 'Visita il rifugio ENPA di Milano! Conosci i nostri ospiti in cerca di casa, scopri come diventare volontario e partecipa alle attività con gli animali.',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    categoryLabel: 'Tutti gli animali',
    location: 'ENPA Milano, Via Aquila 61',
    organizer: 'ENPA Milano',
    source: 'enpa',
    sourceLabel: 'ENPA',
    link: 'https://www.enpa.it/cosa-facciamo/rifugi/',
    isFeatured: true
  },
  {
    id: 'lav-giornata-adozioni',
    title: 'Giornata Adozioni LAV Milano',
    description: 'Grande evento di adozione organizzato dalla LAV. Cani, gatti e conigli in cerca di famiglia. Consulenza pre-adozione e kit benvenuto gratuito.',
    eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    categoryLabel: 'Tutti gli animali',
    location: 'Piazza Città di Lombardia, Milano',
    organizer: 'LAV - Lega Anti Vivisezione',
    source: 'lav',
    sourceLabel: 'LAV',
    link: 'https://www.lav.it/cosa-facciamo/adozioni'
  },
  {
    id: 'fieracavalli-milano',
    title: 'Milano Cavalli - Salone del Mondo Equestre',
    description: 'Il principale evento equestre di Milano. Show jumping, dressage, area commerciale e attività per famiglie. Ingresso gratuito per bambini under 12.',
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    categoryLabel: 'Cavalli',
    location: 'Fiera Milano City',
    organizer: 'Fiera Milano',
    source: 'fieramilano',
    sourceLabel: 'Fiera Milano',
    link: 'https://www.fieramilano.it',
    isFeatured: true
  },
  {
    id: 'centro-ippico-san-siro',
    title: 'Porte Aperte Centro Ippico San Siro',
    description: 'Giornata di prova gratuita per bambini e adulti. Battesimo della sella, visite guidate alle scuderie e dimostrazione di volteggio.',
    eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    categoryLabel: 'Cavalli',
    location: 'Centro Ippico Lombardo San Siro',
    organizer: 'Centro Ippico Lombardo',
    source: 'fise',
    sourceLabel: 'FISE Lombardia',
    link: 'https://www.fiselombardia.it'
  },
  {
    id: 'pet-expo-milano',
    title: 'Pet Expo Italia - Fiera degli Animali',
    description: 'La più grande fiera italiana dedicata a tutti gli animali da compagnia. Area rettili, acquari, piccoli mammiferi, uccelli. Workshop e seminari gratuiti.',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'altro',
    categoryLabel: 'Altri Animali',
    location: 'MiCo Milano Congressi',
    organizer: 'Fiera Milano',
    source: 'fieramilano',
    sourceLabel: 'Fiera Milano',
    link: 'https://www.petexpoitalia.it',
    isFeatured: true
  },
  {
    id: 'reptiles-day-milano',
    title: 'Reptiles Day Milano',
    description: 'Mostra mercato dedicata a rettili, anfibi e invertebrati. Allevatori certificati, veterinari specializzati e conferenze su terrariofilia responsabile.',
    eventDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'rettili',
    categoryLabel: 'Rettili',
    location: 'Palazzo del Ghiaccio, Milano',
    organizer: 'Reptiles Day',
    source: 'reptiles',
    sourceLabel: 'Reptiles Day',
    link: 'https://www.reptilesday.it'
  },
  {
    id: 'coniglio-day-milano',
    title: 'Bunny Day Milano - Giornata del Coniglio',
    description: 'Evento dedicato ai conigli da compagnia. Visite veterinarie gratuite, toelettatura, consulenze alimentari e area gioco. Possibilità di adozione.',
    eventDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'conigli',
    categoryLabel: 'Conigli',
    location: 'Cascina Cuccagna, Milano',
    organizer: 'AAE Conigli',
    source: 'aae',
    sourceLabel: 'AAE Conigli',
    link: 'https://www.aaeconigli.it'
  },
  {
    id: 'ats-microchip-day',
    title: 'Giornata Gratuita Microchip - ATS Milano',
    description: 'Applicazione gratuita del microchip per cani e gatti. Portare libretto sanitario e documento del proprietario. Su prenotazione.',
    eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    categoryLabel: 'Tutti gli animali',
    location: 'ATS Milano Città Metropolitana',
    organizer: 'ATS Milano',
    source: 'ats',
    sourceLabel: 'ATS Milano',
    link: 'https://www.ats-milano.it/servizi-per-la-comunita/animali'
  },
  {
    id: 'sterilizzazioni-comune-milano',
    title: 'Campagna Sterilizzazioni a Prezzo Ridotto',
    description: 'Il Comune di Milano promuove la sterilizzazione di cani e gatti a prezzo convenzionato presso le cliniche aderenti. Riduzioni fino al 50%.',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    categoryLabel: 'Tutti gli animali',
    location: 'Cliniche veterinarie convenzionate Milano',
    organizer: 'Comune di Milano',
    source: 'comune',
    sourceLabel: 'Comune di Milano',
    link: 'https://www.comune.milano.it/aree-tematiche/animali/sterilizzazioni'
  }
];

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID evento richiesto' }, { status: 400, headers: corsHeaders });
    }

    // Prima cerca nei DEFAULT_EVENTS
    let event = DEFAULT_EVENTS.find(e => e.id === id);
    
    // Se non trovato, cerca nel database
    if (!event) {
      try {
        const events = await getCollection('events');
        event = await events.findOne({ id });
      } catch (dbError) {
        console.log('Database search skipped:', dbError.message);
      }
    }

    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(event, { headers: corsHeaders });
    
  } catch (error) {
    console.error('GET event by ID error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
