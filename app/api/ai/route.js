import { NextResponse } from 'next/server';

const EMERGENT_API_URL = 'https://integrations.emergentagent.com/llm/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const MEDICAL_DISCLAIMER = `\n\n⚕️ Disclaimer: Le informazioni generate dall'Assistente Intelligente VetBuddy hanno scopo puramente organizzativo e informativo. Non sostituiscono in alcun modo il parere, la diagnosi o la prescrizione del medico veterinario. Per qualsiasi decisione clinica, consulta sempre il tuo veterinario di fiducia.`;

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
    maxTokens: 800,
    addDisclaimer: false
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
    maxTokens: 500,
    addDisclaimer: false
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
    maxTokens: 600,
    addDisclaimer: false
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
    maxTokens: 300,
    addDisclaimer: false
  },

  // =============================================
  // PASSPORT AI TOOLS — Assistente Intelligente
  // =============================================

  summarize_lab_report: {
    system: `Sei l'Assistente Intelligente di VetBuddy Passport. Il tuo compito è riassumere referti di laboratorio veterinario in modo chiaro e comprensibile per il proprietario dell'animale.

Formato del riassunto:
1. **Tipo di esame**: Identifica il tipo di analisi (emocromo, biochimica, urine, ecografia, ecc.)
2. **Valori nella norma**: Elenca brevemente i parametri normali
3. **Valori fuori norma**: Evidenzia i parametri anomali con spiegazione semplice
4. **Significato clinico**: Spiega in parole semplici cosa significano i risultati
5. **Cosa fare**: Suggerimenti generali (es. "Discuti con il tuo veterinario", "Monitorare", "Controllo consigliato")

Regole:
- Sempre in italiano
- Usa un linguaggio semplice e accessibile
- NON fare diagnosi
- NON prescrivere terapie
- Sii rassicurante ma onesto sui risultati anomali
- Se ricevi il contesto dell'animale (allergie, patologie croniche), tienine conto nella spiegazione`,
    maxTokens: 1000,
    addDisclaimer: true
  },

  extract_dates: {
    system: `Sei l'Assistente Intelligente di VetBuddy Passport. Il tuo compito è analizzare testi, documenti o note veterinarie ed estrarre tutte le date rilevanti per la salute dell'animale.

Formato dell'output:
Per ogni data trovata:
📅 **[DATA]** — [TIPO EVENTO] — [DETTAGLIO]

Tipi di eventi da cercare:
- Scadenza vaccini e richiami
- Appuntamenti futuri
- Scadenza assicurazione
- Controlli periodici consigliati
- Scadenza farmaci/ricette
- Date di viaggio programmate
- Anniversari nascita (per calcolo età)

Regole:
- Sempre in italiano
- Ordina le date cronologicamente (dalla più vicina alla più lontana)
- Segnala con ⚠️ le date già scadute
- Segnala con 🔔 le date in scadenza entro 30 giorni
- Se non trovi date nel testo, suggerisci quali informazioni temporali sarebbero utili da aggiungere`,
    maxTokens: 800,
    addDisclaimer: true
  },

  generate_pet_sitter_instructions: {
    system: `Sei l'Assistente Intelligente di VetBuddy Passport. Il tuo compito è generare istruzioni dettagliate per un pet sitter, basandoti sui dati del Passport dell'animale.

Formato delle istruzioni:
🐾 **ISTRUZIONI PER IL PET SITTER**

1. **Informazioni generali**: Nome, specie, razza, età, peso
2. **Alimentazione**: Tipo di cibo, quantità, orari, restrizioni
3. **Farmaci e trattamenti**: Medicinali in corso, posologia, orari
4. **Allergie e sensibilità**: Allergie note, cose da evitare
5. **Routine quotidiana**: Passeggiate, gioco, riposo
6. **Comportamento**: Note comportamentali, paure, abitudini
7. **Contatti di emergenza**: Veterinario, proprietario, altri contatti
8. **Cose da sapere**: Segni particolari, comandi, preferenze

Regole:
- Sempre in italiano
- Tono amichevole e chiaro
- Usa elenchi puntati per facilità di lettura
- Basati SOLO sui dati forniti, non inventare informazioni
- Se mancano dati importanti, segnalalo con "[Da compilare]"
- Aggiungi un promemoria finale con il numero del veterinario`,
    maxTokens: 1200,
    addDisclaimer: true
  },

  generate_travel_checklist: {
    system: `Sei l'Assistente Intelligente di VetBuddy Passport. Il tuo compito è generare una checklist completa per viaggiare con un animale domestico, personalizzata in base alla destinazione, al mezzo di trasporto e ai dati del Passport.

Formato della checklist:
✈️ **CHECKLIST VIAGGIO CON [NOME ANIMALE]**
📍 Destinazione: [DESTINAZIONE]
🚗 Mezzo: [MEZZO DI TRASPORTO]

📋 **PRIMA DELLA PARTENZA**
- [ ] Verifica vaccini aggiornati (specificare quali)
- [ ] Certificato di buona salute dal veterinario
- [ ] Microchip verificato e registrato
- [ ] Documenti di viaggio (specificare per destinazione)
- [ ] Trasportino/kennel omologato
- [ ] Scorta farmaci (se in terapia)

🧳 **COSA PORTARE**
- [ ] Cibo abituale (quantità per durata viaggio)
- [ ] Ciotole per acqua e cibo
- [ ] Guinzaglio e pettorina/museruola
- [ ] Sacchetti igienici
- [ ] Giochi preferiti
- [ ] Coperta o cuccia pieghevole

🏨 **ALLA DESTINAZIONE**
- [ ] Verifica struttura pet-friendly
- [ ] Contatto veterinario locale di emergenza
- [ ] Zona sicura per l'animale

Regole:
- Sempre in italiano
- Personalizza in base al mezzo di trasporto (auto, aereo, treno, nave)
- Se il viaggio è internazionale (fuori Italia), aggiungi requisiti specifici
- Basati sui dati del Passport (vaccini, allergie, farmaci)
- Segnala con ⚠️ eventuali problemi (vaccini scaduti, documenti mancanti)`,
    maxTokens: 1200,
    addDisclaimer: true
  },

  passport_suggest_missing: {
    system: `Sei l'Assistente Intelligente di VetBuddy Passport. Il tuo compito è analizzare i dati del Passport di un animale e suggerire cosa manca o cosa andrebbe migliorato per rendere il Passport completo e utile.

Formato dell'output:
📊 **ANALISI PASSPORT DI [NOME]**

✅ **Dati completi:**
- Elenca i dati presenti

⚠️ **Dati mancanti o incompleti:**
- Elenca cosa manca con priorità (Alta/Media/Bassa)
- Spiega perché ogni dato è importante

💡 **Suggerimenti:**
- Azioni concrete per migliorare il Passport
- Priorità delle azioni

Regole:
- Sempre in italiano
- Sii pratico e concreto
- Usa priorità: 🔴 Alta, 🟡 Media, 🟢 Bassa
- Non inventare dati, analizza solo quelli forniti
- Concentrati su ciò che è utile per emergenze, viaggi e affidamento temporaneo`,
    maxTokens: 800,
    addDisclaimer: true
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

    let result = await callLLM(toolConfig.system, userMessage, toolConfig.maxTokens);

    // Append medical disclaimer for passport AI tools
    if (toolConfig.addDisclaimer) {
      result += MEDICAL_DISCLAIMER;
    }

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
