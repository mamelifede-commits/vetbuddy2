import { NextResponse } from 'next/server';

// Suggerimenti di risposta AI-powered basati sul messaggio
// Nota: Per risposte AI avanzate, integrare con OpenAI/Claude

const QUICK_REPLIES = {
  appuntamento: [
    "Certo! Abbiamo disponibilità nei prossimi giorni. Quale orario preferisce, mattina o pomeriggio?",
    "Possiamo fissare un appuntamento. Mi indica la data e l'orario preferito?",
    "Va benissimo! Le confermo l'appuntamento. Riceverà una email di conferma."
  ],
  urgenza: [
    "Capisco l'urgenza. Può venire subito in clinica, la aspettiamo.",
    "Questo sembra urgente. Le consiglio di portare subito l'animale in clinica.",
    "Mi preoccupa quello che descrive. Venga immediatamente, la prioritizziamo."
  ],
  vaccino: [
    "Sì, è ora del richiamo. Possiamo fissare un appuntamento per la prossima settimana?",
    "Il vaccino è importante. Abbiamo slot disponibili questa settimana, quale giorno preferisce?",
    "Ottimo che si ricordi del vaccino! Le propongo giovedì mattina, va bene?"
  ],
  prezzo: [
    "Il costo della visita base è di €XX. Per interventi specifici, posso darle un preventivo dettagliato.",
    "I nostri prezzi variano in base al servizio. Posso mandarle il listino completo?",
    "Sarò felice di fornirle tutte le informazioni sui costi. Di quale servizio ha bisogno?"
  ],
  ringraziamento: [
    "Grazie a lei! Siamo sempre a disposizione. 🐾",
    "È stato un piacere! A presto!",
    "Grazie! Non esiti a contattarci per qualsiasi necessità."
  ],
  informazioni: [
    "Certamente! Siamo aperti dal lunedì al venerdì, 9:00-18:00. Il sabato solo su appuntamento.",
    "Sarò felice di aiutarla. Mi dica pure cosa desidera sapere.",
    "Certo! Ecco le informazioni che cerca..."
  ],
  default: [
    "Grazie per il messaggio! Le rispondo al più presto.",
    "Ho ricevuto la sua richiesta. Un membro del team la contatterà a breve.",
    "Grazie per averci contattato! Come posso aiutarla?"
  ]
};

const KEYWORDS = {
  appuntamento: ['appuntamento', 'prenotare', 'visita', 'disponibilità', 'fissare', 'slot'],
  urgenza: ['urgente', 'emergenza', 'subito', 'grave', 'sangue', 'non mangia', 'vomita', 'non respira'],
  vaccino: ['vaccino', 'vaccini', 'richiamo', 'vaccinazione', 'antirabica'],
  prezzo: ['prezzo', 'costo', 'quanto costa', 'preventivo', 'tariffa', 'listino'],
  ringraziamento: ['grazie', 'perfetto', 'ok', 'va bene', 'ottimo'],
  informazioni: ['orari', 'aperti', 'chiusi', 'dove siete', 'indirizzo', 'informazioni']
};

export async function POST(request) {
  try {
    const { messageText } = await request.json();

    if (!messageText) {
      return NextResponse.json({ error: 'messageText richiesto' }, { status: 400 });
    }

    const textLower = messageText.toLowerCase();
    
    // Determina la categoria del messaggio
    let category = 'default';
    let confidence = 0;

    for (const [cat, keywords] of Object.entries(KEYWORDS)) {
      const matchCount = keywords.filter(kw => textLower.includes(kw)).length;
      if (matchCount > confidence) {
        confidence = matchCount;
        category = cat;
      }
    }

    // Seleziona risposte suggerite
    const suggestions = QUICK_REPLIES[category] || QUICK_REPLIES.default;
    
    // Aggiungi alcune risposte generiche
    const allSuggestions = [
      ...suggestions,
      ...QUICK_REPLIES.default.slice(0, 1)
    ].slice(0, 4);

    return NextResponse.json({
      category,
      confidence: confidence > 0 ? 'high' : 'low',
      suggestions: allSuggestions.map((text, index) => ({
        id: index + 1,
        text,
        isQuickReply: true
      })),
      detectedKeywords: Object.entries(KEYWORDS)
        .filter(([_, kws]) => kws.some(kw => textLower.includes(kw)))
        .map(([cat]) => cat)
    });

  } catch (error) {
    console.error('Quick reply error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}
