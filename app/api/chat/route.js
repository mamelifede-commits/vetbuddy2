import { NextResponse } from 'next/server';

// Emergent LLM keys use the Emergent integration proxy
const EMERGENT_API_URL = 'https://integrations.emergentagent.com/llm/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Sistema prompt per l'assistente VetBuddy
const SYSTEM_PROMPT = `Sei VetBuddy AI, l'assistente virtuale di VetBuddy - la piattaforma gestionale per cliniche veterinarie.

Il tuo ruolo è aiutare sia i veterinari/cliniche che i proprietari di animali domestici con:

1. **Informazioni su VetBuddy**:
   - Gestionale per cliniche veterinarie con dashboard clinica e owner
   - Gestione appuntamenti, pazienti, documenti medici
   - Sistema di fatturazione con export CSV/JSON/PDF
   - Automazioni email (promemoria, richiami vaccini, follow-up)
   - Programma premi fedeltà per i clienti
   - Import massivo pazienti da CSV/Excel

2. **Navigazione della piattaforma**:
   - Dashboard Clinica: Appuntamenti, Pazienti, Documenti, Staff, Fatturazione, Automazioni
   - Dashboard Proprietario: I miei animali, Appuntamenti, Documenti, Premi
   - Come prenotare visite, aggiungere animali, gestire documenti

3. **Consigli generali sulla cura degli animali** (solo informativi):
   - Quando consultare un veterinario
   - Importanza delle vaccinazioni
   - Cure preventive di base

⚠️ IMPORTANTE:
- NON dare MAI diagnosi mediche o prescrivere farmaci
- Per emergenze, consiglia SEMPRE di contattare immediatamente un veterinario
- Rispondi SEMPRE in italiano
- Sii cordiale, professionale e conciso
- Se non sai qualcosa, ammettilo onestamente

Informazioni sul Pilot Milano:
- 90 giorni gratuiti (estendibili a 6 mesi)
- Piano Starter: Gratuito fino a 50 pazienti
- Piano Pro: €39/mese con tutte le funzionalità
- Piano Custom: Prezzi personalizzati per grandi strutture`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messaggi non validi' },
        { status: 400 }
      );
    }

    // Determine API URL and key
    // Use Emergent proxy for Emergent keys, otherwise standard OpenAI
    const emergentKey = process.env.EMERGENT_LLM_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    let apiKey, apiUrl;
    if (emergentKey && emergentKey.startsWith('sk-emergent-')) {
      apiKey = emergentKey;
      apiUrl = EMERGENT_API_URL;
      console.log('Using Emergent LLM proxy');
    } else if (openaiKey) {
      apiKey = openaiKey;
      apiUrl = OPENAI_API_URL;
      console.log('Using OpenAI API');
    } else {
      console.error('Chat API: No API key configured');
      return NextResponse.json(
        { error: 'Servizio chat non configurato' },
        { status: 500 }
      );
    }

    // Build messages array with system prompt
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Call AI API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Errore nel servizio AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Invalid OpenAI response:', data);
      return NextResponse.json(
        { error: 'Risposta non valida dal servizio AI' },
        { status: 500 }
      );
    }

    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      sessionId: sessionId || generateSessionId()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Generate a unique session ID
function generateSessionId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'VetBuddy Chat API',
    features: [
      'Assistente virtuale VetBuddy',
      'Informazioni sulla piattaforma',
      'Guida alla navigazione',
      'Consigli generali sulla cura animali'
    ]
  });
}
