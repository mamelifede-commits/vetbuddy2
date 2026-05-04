import { NextResponse } from 'next/server';

const EMERGENT_API_URL = 'https://integrations.emergentagent.com/llm/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const AI_TOOLS = {
  summarize_visit: {
    system: `Sei un assistente veterinario AI per VetBuddy. Il tuo compito è riassumere le note di una visita veterinaria in modo chiaro e professionale, in italiano.

Formato del riassunto:
1. **Motivo visita**: Breve descrizione
2. **Esame obiettivo**: Principali rilievi
3. **Diagnosi/Sospetto**: Se presente
4. **Terapia**: Farmaci e posologia
5. **Follow-up**: Prossimi passi consigliati

Sii conciso, professionale e chiaro. Usa terminologia medica corretta ma comprensibile.`,
    maxTokens: 800
  },
  
  draft_message: {
    system: `Sei un assistente per comunicazioni della clinica veterinaria VetBuddy. Genera messaggi professionali ma cordiali in italiano per comunicare con i proprietari di animali.

Regole:
- Tono professionale ma caloroso
- Sempre in italiano
- Breve e diretto
- Includi sempre un saluto iniziale e finale
- Non dare mai diagnosi o prescrizioni nel messaggio
- Se è un follow-up, mostra interesse per la salute dell'animale`,
    maxTokens: 500
  },

  translate_notes: {
    system: `Sei un traduttore di note cliniche veterinarie. Il tuo compito è trasformare note mediche tecniche in un linguaggio semplice e comprensibile per i proprietari di animali domestici, in italiano.

Regole:
- Mantieni le informazioni mediche importanti
- Semplifica i termini tecnici (es. "dispnea" → "difficoltà respiratoria")
- Sii rassicurante ma onesto
- NON aggiungere informazioni non presenti nelle note originali
- NON dare consigli medici aggiuntivi
- Usa un tono empatico e professionale`,
    maxTokens: 600
  },

  smart_reply: {
    system: `Sei un assistente per la clinica veterinaria VetBuddy. Genera una risposta professionale a un messaggio ricevuto da un proprietario di animale domestico.

Regole:
- Rispondi sempre in italiano
- Tono professionale e cordiale
- Non dare diagnosi
- Se il messaggio è urgente, suggerisci di contattare la clinica telefonicamente
- Se è una richiesta di appuntamento, conferma la disponibilità a fissarlo
- Sii conciso (max 3-4 frasi)`,
    maxTokens: 300
  }
};

async function callLLM(systemPrompt, userMessage, maxTokens = 500) {
  const emergentKey = process.env.EMERGENT_LLM_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let apiKey, apiUrl;
  if (emergentKey && emergentKey.startsWith('sk-emergent-')) {
    apiKey = emergentKey;
    apiUrl = EMERGENT_API_URL;
  } else if (openaiKey) {
    apiKey = openaiKey;
    apiUrl = OPENAI_API_URL;
  } else {
    throw new Error('Nessuna chiave AI configurata');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API Error:', response.status, errorText);
    throw new Error(`Errore AI: ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Risposta AI non valida');
  }

  return data.choices[0].message.content;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tool, input, context } = body;

    if (!tool || !input) {
      return NextResponse.json({ error: 'Tool e input sono obbligatori' }, { status: 400 });
    }

    const toolConfig = AI_TOOLS[tool];
    if (!toolConfig) {
      return NextResponse.json({ error: `Tool non supportato: ${tool}` }, { status: 400 });
    }

    // Build user message with context
    let userMessage = input;
    if (context) {
      userMessage = `Contesto: ${JSON.stringify(context)}\n\n${input}`;
    }

    const result = await callLLM(toolConfig.system, userMessage, toolConfig.maxTokens);

    return NextResponse.json({
      success: true,
      tool,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Errore interno AI' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'VetBuddy AI Assistant',
    tools: Object.keys(AI_TOOLS).map(key => ({
      id: key,
      description: AI_TOOLS[key].system.split('\n')[0]
    }))
  });
}
