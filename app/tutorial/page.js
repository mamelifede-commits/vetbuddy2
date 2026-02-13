'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, ChevronLeft, Check, Play, Pause, ArrowLeft,
  Calendar, Users, MessageSquare, FileText, Bell, Video, Gift,
  Settings, Upload, BarChart3, CreditCard, PawPrint, Home,
  Lock, Printer, CheckCircle, Circle, BookOpen, Smartphone, Share, PlusSquare, Download
} from 'lucide-react';
import Link from 'next/link';

// VetBuddy Logo
const VetBuddyLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="62" rx="18" ry="16" fill="#FF6B6B"/>
    <ellipse cx="28" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
    <ellipse cx="50" cy="28" rx="10" ry="12" fill="#FF6B6B"/>
    <ellipse cx="72" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
  </svg>
);

export default function TutorialPage() {
  const [activeModule, setActiveModule] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const modules = [
    {
      id: 'start',
      title: 'Primi Passi',
      icon: Home,
      color: 'blue',
      description: 'Login, configurazione iniziale e panoramica dashboard',
      duration: '5 min',
      steps: [
        {
          title: 'Accedi alla Dashboard',
          content: `
## 🔐 Come accedere

1. Vai su **vetbuddy.it** (o il link fornito)
2. Clicca su **"Accedi"** in alto a destra
3. Inserisci le credenziali ricevute via email
4. Clicca **"Accedi"**

### 💡 Suggerimento
La prima volta ti verrà chiesto di cambiare la password. Scegli una password sicura!

### ⚠️ Problemi di accesso?
- Controlla la cartella spam per l'email di benvenuto
- Usa "Password dimenticata" per reimpostarla
          `,
          image: '🔐'
        },
        {
          title: 'La tua Dashboard',
          content: `
## 🏠 Panoramica Dashboard

La dashboard è il tuo centro di controllo. Da qui vedi tutto a colpo d'occhio:

### Sezioni principali:
- **📊 Statistiche del giorno** - Appuntamenti, visite, messaggi in attesa
- **📋 Flusso di lavoro** - Prepara → Visita → Concludi
- **📅 Agenda di oggi** - I prossimi appuntamenti
- **💬 Inbox** - Messaggi dei clienti in attesa
- **📄 Documenti** - Referti da consultare o inviare

### Menu laterale:
Sulla sinistra trovi tutte le sezioni: Dashboard, Agenda, Team Inbox, Documenti, Servizi, Video Consulto, Pazienti, Proprietari, Staff, Report, Recensioni, Premi, Template, Automazioni, Impostazioni.
          `,
          image: '🏠'
        },
        {
          title: 'Completa la Configurazione',
          content: `
## ⚙️ Configurazione Iniziale

Nella parte superiore della dashboard vedi la barra **"Completa la configurazione"**. 

### Step consigliati:

1. **💳 Pagamenti** - Collega Stripe per accettare pagamenti online
2. **📹 Video Consulto** - Attiva e configura i prezzi
3. **👥 Team** - Aggiungi il tuo staff
4. **🤖 Automazioni** - Attiva i promemoria automatici

### 💡 Non sei obbligato a completare tutto subito!
Puoi tornare su questa configurazione in qualsiasi momento dalle Impostazioni.
          `,
          image: '⚙️'
        }
      ]
    },
    {
      id: 'mobile-app',
      title: 'Installa su Mobile',
      icon: Smartphone,
      color: 'violet',
      description: 'Come usare VetBuddy come app sul telefono',
      duration: '3 min',
      steps: [
        {
          title: 'Perché installare l\'app',
          content: `
## 📱 VetBuddy come App

VetBuddy funziona come una **Progressive Web App (PWA)**. Questo significa che puoi installarla sul tuo telefono e usarla esattamente come un'app nativa!

### Vantaggi:
- 🚀 **Accesso rapido** - Icona sulla home screen
- 📴 **Funziona offline** - Alcune funzioni disponibili senza internet
- 🔔 **Notifiche push** - Ricevi avvisi in tempo reale
- 💾 **Meno spazio** - Non occupa memoria come un'app tradizionale
- 🔄 **Sempre aggiornata** - Nessun bisogno di scaricare aggiornamenti

### ⚠️ Importante
Per un'esperienza ottimale, installa l'app seguendo le istruzioni per il tuo dispositivo (iPhone o Android).
          `,
          image: '📱'
        },
        {
          title: 'Installare su iPhone/iPad',
          content: `
## 🍎 Installazione su iOS (iPhone/iPad)

### Passo 1: Apri Safari
Apri **Safari** (il browser predefinito di Apple). 
⚠️ Non usare Chrome o altri browser, funziona solo con Safari!

### Passo 2: Vai su VetBuddy
Digita l'indirizzo del sito nella barra degli indirizzi:
\`clinic-pet-portal.preview.emergentagent.com\`

### Passo 3: Tocca il pulsante Condividi
Tocca l'icona **Condividi** (il quadrato con la freccia verso l'alto ⬆️) nella barra in basso.

### Passo 4: Aggiungi alla schermata Home
Scorri verso il basso nel menu e tocca **"Aggiungi alla schermata Home"**.

### Passo 5: Conferma
- Dai un nome (es. "VetBuddy")
- Tocca **"Aggiungi"** in alto a destra

### ✅ Fatto!
Ora vedrai l'icona di VetBuddy (zampa rossa) sulla tua schermata Home!
          `,
          image: '🍎'
        },
        {
          title: 'Installare su Android',
          content: `
## 🤖 Installazione su Android

### Metodo 1: Chrome (Consigliato)

1. Apri **Google Chrome**
2. Vai su \`clinic-pet-portal.preview.emergentagent.com\`
3. Tocca i **tre puntini ⋮** in alto a destra
4. Seleziona **"Aggiungi a schermata Home"** o **"Installa app"**
5. Conferma toccando **"Aggiungi"**

### Metodo 2: Banner automatico

A volte Chrome mostra automaticamente un banner in basso:
\`Aggiungi VetBuddy alla schermata Home\`

Tocca semplicemente **"Installa"** o **"Aggiungi"**!

### Metodo 3: Samsung Internet

1. Apri **Samsung Internet**
2. Vai sul sito VetBuddy
3. Tocca il menu ☰
4. Seleziona **"Aggiungi pagina a"** → **"Schermata Home"**

### ✅ Fatto!
L'icona di VetBuddy apparirà nel tuo drawer delle app!
          `,
          image: '🤖'
        },
        {
          title: 'Usare l\'app installata',
          content: `
## 🚀 Dopo l'installazione

### Come aprire l'app
Tocca semplicemente l'icona **VetBuddy** (zampa rossa su sfondo rosso) dalla schermata Home!

### Differenze rispetto al browser:
- ✅ **Niente barra degli indirizzi** - Schermo intero
- ✅ **Navigazione fluida** - Come un'app nativa
- ✅ **Pulsante "indietro"** - Funziona normalmente su Android
- ✅ **Gesture swipe** - Torna indietro con swipe su iPhone

### ⚠️ Problemi di navigazione?
Se dopo aver cliccato su un documento o link non riesci a tornare indietro:

**Su iPhone:**
- Fai **swipe da sinistra** verso destra per tornare indietro
- Oppure tocca **"← Indietro"** se disponibile

**Su Android:**
- Usa il **pulsante indietro** del telefono
- Oppure tocca **"← Indietro"** se disponibile

### 💡 Tip
Per la migliore esperienza, usa sempre l'app installata invece del browser!
          `,
          image: '🚀'
        }
      ]
    },
    {
      id: 'agenda',
      title: 'Gestione Agenda',
      icon: Calendar,
      color: 'green',
      description: 'Calendario, appuntamenti, tipi di visita',
      duration: '8 min',
      steps: [
        {
          title: 'Navigare l\'Agenda',
          content: `
## 📅 L'Agenda Intelligente

### Come accedere
Clicca su **"Agenda"** nel menu laterale.

### Vista settimanale
- Vedi tutti i giorni della settimana
- Ogni colonna è un giorno
- Gli appuntamenti appaiono come blocchi colorati

### Navigazione
- **◀ ▶** per cambiare settimana
- **"Oggi"** per tornare alla settimana corrente
- Clicca su un giorno per vedere i dettagli

### Filtri
- Filtra per **veterinario** (se hai più di uno)
- Filtra per **tipo di visita**
          `,
          image: '📅'
        },
        {
          title: 'Creare un Appuntamento',
          content: `
## ➕ Nuovo Appuntamento

### Metodo 1: Click su uno slot
1. Clicca su uno spazio vuoto nell'agenda
2. Si apre il form di prenotazione

### Metodo 2: Bottone "+ Nuovo"
1. Clicca sul bottone blu **"+ Nuovo"** in alto
2. Compila i dati

### Campi da compilare:
- **👤 Proprietario** - Cerca o crea nuovo
- **🐾 Paziente** - Seleziona l'animale
- **📋 Tipo visita** - Controllo, Vaccino, Chirurgia, etc.
- **📅 Data e ora** - Quando
- **🩺 Veterinario** - Chi effettua la visita
- **📝 Note** - Dettagli aggiuntivi

### 💡 Tip: Drag & Drop!
Puoi trascinare gli appuntamenti per spostarli!
          `,
          image: '➕'
        },
        {
          title: 'Tipi di Visita',
          content: `
## 🏥 Configurare i Tipi di Visita

VetBuddy viene con tipi di visita predefiniti, ma puoi personalizzarli.

### Tipi predefiniti:
- 🩺 Visita generica (30 min)
- 💉 Vaccinazione (15 min)
- ✂️ Chirurgia (60 min)
- 🦷 Pulizia dentale (45 min)
- 🔬 Esami (20 min)
- 📞 Controllo telefonico (10 min)

### Personalizzare:
1. Vai su **Impostazioni** → **Servizi**
2. Modifica durata, prezzo, colore
3. Aggiungi nuovi tipi se necessario

### Colori
Ogni tipo di visita ha un colore diverso, così a colpo d'occhio capisci cosa c'è in agenda!
          `,
          image: '🏥'
        }
      ]
    },
    {
      id: 'patients',
      title: 'Pazienti & Proprietari',
      icon: PawPrint,
      color: 'purple',
      description: 'Gestione anagrafica animali e proprietari',
      duration: '6 min',
      steps: [
        {
          title: 'Aggiungere un Paziente',
          content: `
## 🐾 Nuovo Paziente

### Come fare:
1. Vai su **Pazienti** nel menu
2. Clicca **"+ Nuovo"** in alto a destra

### Dati richiesti:
- **Nome** - Nome dell'animale
- **Specie** - Cane, Gatto, etc.
- **Razza** - Labrador, Persiano, etc.
- **Data nascita** - Per calcolare l'età
- **Sesso** - Maschio/Femmina
- **Microchip** - Numero identificativo
- **Peso** - Ultimo peso registrato
- **Proprietario** - A chi appartiene

### Campi opzionali utili:
- **Sterilizzato** - Sì/No
- **Allergie** - Importanti per le visite
- **Farmaci** - Terapie in corso
- **Note** - Carattere, paure, etc.
          `,
          image: '🐾'
        },
        {
          title: 'Import Massivo',
          content: `
## 📤 Importare Pazienti Esistenti

Hai già un database di pazienti? Importalo in pochi click!

### Come fare:
1. Vai su **Pazienti**
2. Clicca **"Import Dati"** (bottone blu in alto)
3. Scarica il template CSV
4. Compila con i tuoi dati
5. Carica il file

### Cosa viene importato:
- ✅ Dati animale completi
- ✅ Proprietari (creati automaticamente)
- ✅ Vaccinazioni
- ✅ Documenti (upload separato)

### 💡 Guida completa
Clicca su **"📖 Guida completa"** nel modal per istruzioni dettagliate.
          `,
          image: '📤'
        },
        {
          title: 'Scheda Paziente',
          content: `
## 📋 La Scheda Paziente

Clicca su un paziente per vedere la sua scheda completa.

### Sezioni disponibili:
- **📊 Panoramica** - Dati principali, foto, chip
- **📅 Storico visite** - Tutte le visite passate
- **💉 Vaccini** - Vaccinazioni e scadenze
- **📄 Documenti** - Referti, esami, prescrizioni
- **💊 Terapie** - Farmaci in corso
- **📝 Note** - Appunti sulla storia clinica

### Azioni rapide:
- 📅 Prenota visita
- 📄 Carica documento
- 💬 Invia messaggio al proprietario
- 💉 Registra vaccino
          `,
          image: '📋'
        }
      ]
    },
    {
      id: 'automations',
      title: 'Automazioni',
      icon: Bell,
      color: 'amber',
      description: 'Promemoria automatici, email, follow-up',
      duration: '7 min',
      steps: [
        {
          title: 'Panoramica Automazioni',
          content: `
## 🤖 Automazioni Intelligenti

VetBuddy può inviare comunicazioni automatiche per te. Niente più telefonate manuali!

### Tipi di automazioni:

**📅 Appuntamenti:**
- Conferma prenotazione
- Promemoria 24h prima
- Promemoria 1h prima
- Follow-up post visita

**💉 Vaccini:**
- Richiamo in scadenza (30, 15, 7 giorni)
- Vaccino scaduto
- Conferma vaccinazione

**🎂 Speciali:**
- Auguri compleanno pet
- Benvenuto nuovo paziente
- Benvenuto nuovo proprietario

### Canali:
📧 Email | 📱 SMS | 💬 WhatsApp
          `,
          image: '🤖'
        },
        {
          title: 'Attivare le Automazioni',
          content: `
## ⚡ Come Attivare

### Passo 1: Vai alle Impostazioni
Clicca su **"Automazioni"** nel menu laterale o vai in **Impostazioni → Automazioni**.

### Passo 2: Scegli cosa attivare
Ogni automazione ha un toggle ON/OFF. Clicca per attivare.

### Passo 3: Personalizza (opzionale)
Puoi modificare:
- **Testo** del messaggio
- **Tempistiche** (quanti giorni prima)
- **Canale** (email, SMS, WhatsApp)

### 💡 Consiglio
Inizia con le più importanti:
1. ✅ Promemoria appuntamento 24h
2. ✅ Richiamo vaccini 30 giorni
3. ✅ Follow-up post visita

Poi aggiungi le altre gradualmente.
          `,
          image: '⚡'
        },
        {
          title: 'Template Messaggi',
          content: `
## 📝 Personalizzare i Messaggi

Ogni automazione usa un template che puoi personalizzare.

### Variabili disponibili:
- **{pet_name}** - Nome dell'animale
- **{owner_name}** - Nome del proprietario
- **{clinic_name}** - Nome della clinica
- **{appointment_date}** - Data appuntamento
- **{vaccine_name}** - Nome vaccino
- **{vet_name}** - Nome veterinario

### Esempio:
\`\`\`
Ciao {owner_name}! 👋

Ti ricordiamo che {pet_name} ha un 
appuntamento domani alle {appointment_time} 
presso {clinic_name}.

A presto!
\`\`\`

### 💡 Tip
Usa emoji per rendere i messaggi più amichevoli! 🐾
          `,
          image: '📝'
        }
      ]
    },
    {
      id: 'documents',
      title: 'Documenti',
      icon: FileText,
      color: 'red',
      description: 'Referti, prescrizioni, firma digitale',
      duration: '5 min',
      steps: [
        {
          title: 'Caricare Documenti',
          content: `
## 📄 Gestione Documenti

### Come caricare:
1. Vai su **Documenti** nel menu
2. Clicca **"+ Carica"**
3. Seleziona il file o trascina nell'area
4. Associa al paziente
5. Scegli il tipo (Referto, Esame, Prescrizione, etc.)

### Formati supportati:
- 📄 PDF
- 🖼️ Immagini (JPG, PNG)
- 📊 Excel (per tabelle esami)

### Organizzazione:
I documenti sono organizzati per:
- Paziente
- Tipo documento
- Data

### 💡 Tip: Drag & Drop
Trascina i file direttamente sulla pagina per caricarli velocemente!
          `,
          image: '📄'
        },
        {
          title: 'Inviare ai Clienti',
          content: `
## 📤 Condividere Documenti

### Invio singolo:
1. Apri il documento
2. Clicca **"Invia"**
3. Scegli: Email o WhatsApp
4. Il cliente riceve il link per scaricare

### Invio multiplo:
1. Seleziona più documenti (checkbox)
2. Clicca **"Invia selezionati"**
3. Vengono inviati tutti insieme

### Firma digitale:
Per documenti che richiedono firma:
1. Clicca **"Richiedi firma"**
2. Il cliente riceve il link
3. Firma dal telefono
4. Documento firmato salvato automaticamente

### 💡 Sicurezza
I link hanno scadenza (7 giorni) e richiedono autenticazione.
          `,
          image: '📤'
        }
      ]
    },
    {
      id: 'video',
      title: 'Video Consulto',
      icon: Video,
      color: 'indigo',
      description: 'Consulenze online con i clienti',
      duration: '4 min',
      steps: [
        {
          title: 'Attivare Video Consulto',
          content: `
## 📹 Setup Video Consulto

### Attivazione:
1. Vai su **Impostazioni** → **Video Consulto**
2. Clicca **"Attiva"**
3. Imposta i prezzi (opzionale)
4. Salva

### Configurazione prezzi:
- **Gratuito** - Per controlli rapidi
- **€XX** - Per consulenze complete
- Stripe deve essere collegato per pagamenti

### Requisiti tecnici:
- 💻 Browser moderno (Chrome, Firefox, Safari)
- 🎥 Webcam
- 🎤 Microfono
- 🌐 Connessione internet stabile
          `,
          image: '📹'
        },
        {
          title: 'Avviare una Videochiamata',
          content: `
## 🎬 Come Videochiamare

### Dall'agenda:
1. Crea appuntamento tipo **"Video Consulto"**
2. Il cliente riceve il link automaticamente
3. All'ora stabilita, clicca **"Avvia"**

### Dalla scheda paziente:
1. Apri la scheda del paziente
2. Clicca **"📹 Video Consulto"**
3. Il link viene inviato al proprietario

### Durante la chiamata:
- 🎥 Attiva/disattiva video
- 🎤 Attiva/disattiva audio
- 💬 Chat testuale
- 📸 Screenshot (per documentare)
- 🔴 Termina chiamata

### 💡 Tip
Consiglia ai clienti di usare un ambiente ben illuminato e tenere il pet fermo davanti alla camera.
          `,
          image: '🎬'
        }
      ]
    },
    {
      id: 'rewards',
      title: 'Premi Fedeltà',
      icon: Gift,
      color: 'pink',
      description: 'Fidelizzare i clienti con premi',
      duration: '5 min',
      steps: [
        {
          title: 'Creare un Premio',
          content: `
## 🎁 Sistema Premi

I premi fedeltà aiutano a fidelizzare i clienti e aumentare il passaparola.

### Come creare un premio:
1. Vai su **Premi Fedeltà** nel menu
2. Clicca **"+ Nuovo Premio"**
3. Compila i dettagli

### Tipi di premio:
- **💰 Sconto %** - Es. 10% sulla prossima visita
- **🎁 Servizio gratis** - Es. Controllo gratuito
- **🛍️ Prodotto omaggio** - Es. Antiparassitario gratis

### Dettagli da impostare:
- **Nome** - Es. "Sconto Benvenuto"
- **Descrizione** - Cosa include
- **Valore** - Quanto vale
- **Validità** - Scadenza
- **Condizioni** - Quando si applica
          `,
          image: '🎁'
        },
        {
          title: 'Assegnare Premi',
          content: `
## 🏆 Assegnare ai Clienti

### Assegnazione manuale:
1. Vai su **Proprietari**
2. Seleziona un cliente
3. Clicca **"🎁 Assegna Premio"**
4. Scegli il premio dalla lista
5. Il cliente riceve notifica email

### Assegnazione automatica:
Puoi configurare regole automatiche:
- **Dopo X visite** - Es. premio dopo 5 visite
- **Compleanno pet** - Premio speciale
- **Referral** - Porta un amico

### Il cliente vede i premi:
Nella sua dashboard personale, sezione **"I Miei Premi"**, vede:
- Premi disponibili
- Come usarli
- Scadenze

### 💡 Tip
I premi creano fedeltà e passaparola. Un cliente premiato è un cliente che torna!
          `,
          image: '🏆'
        }
      ]
    },
    {
      id: 'inbox',
      title: 'Team Inbox',
      icon: MessageSquare,
      color: 'teal',
      description: 'Gestire messaggi e comunicazioni',
      duration: '4 min',
      steps: [
        {
          title: 'Usare l\'Inbox',
          content: `
## 💬 Team Inbox

Tutti i messaggi dei clienti in un unico posto!

### Come funziona:
- I clienti possono scriverti dalla loro app
- I messaggi arrivano nella **Team Inbox**
- Tutto il team può vederli e rispondere
- Sistema di ticket per organizzare

### Visualizzazione:
- **📥 Nuovi** - Messaggi non letti
- **⏳ In attesa** - Messaggi che richiedono azione
- **✅ Risolti** - Messaggi chiusi
- **⭐ Importanti** - Messaggi segnalati

### Rispondere:
1. Clicca su un messaggio
2. Scrivi la risposta
3. Clicca **"Invia"**
4. Puoi anche allegare documenti
          `,
          image: '💬'
        },
        {
          title: 'Quick Replies',
          content: `
## ⚡ Risposte Rapide

Per le domande frequenti, usa le Quick Replies!

### Come creare:
1. Vai su **Impostazioni** → **Quick Replies**
2. Clicca **"+ Nuova"**
3. Dai un nome (es. "Orari")
4. Scrivi il testo della risposta
5. Salva

### Come usare:
1. Apri un messaggio
2. Clicca **"⚡ Quick Reply"**
3. Seleziona dalla lista
4. Modifica se necessario
5. Invia

### Esempi utili:
- **Orari** - "Siamo aperti dal lunedì al sabato, 9-19."
- **Prezzi** - "Le tariffe partono da..."
- **Emergenze** - "Per emergenze fuori orario..."
          `,
          image: '⚡'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Report & Statistiche',
      icon: BarChart3,
      color: 'cyan',
      description: 'Analisi e statistiche della clinica',
      duration: '4 min',
      steps: [
        {
          title: 'Dashboard Report',
          content: `
## 📊 Report della Clinica

Monitora le performance della tua clinica con dati in tempo reale.

### Come accedere:
Clicca su **"Report"** nel menu laterale.

### Metriche disponibili:
- **📅 Appuntamenti** - Totali, per tipo, per veterinario
- **💰 Fatturato** - Entrate, media per visita, trend
- **👥 Clienti** - Nuovi, ritornanti, tasso di ritorno
- **📞 No-show** - Appuntamenti mancati
- **⭐ Recensioni** - Media e dettagli

### Filtri:
- Per periodo (oggi, settimana, mese, anno)
- Per veterinario
- Per tipo servizio

### Export:
Clicca **"📤 Export CSV"** per scaricare i dati.
          `,
          image: '📊'
        }
      ]
    },
    {
      id: 'invoicing',
      title: 'Fatturazione',
      icon: CreditCard,
      color: 'emerald',
      description: 'Gestione fatture e integrazione con software esterni',
      duration: '6 min',
      steps: [
        {
          title: 'Panoramica Fatturazione',
          content: `
## 🧾 Sistema di Fatturazione

VetBuddy ti permette di gestire le fatture in due modi:

### Opzione 1: Usa VetBuddy + Tuo Software
1. Crea fatture/pre-fatture in VetBuddy
2. Esporta in CSV, PDF o JSON
3. Importa nel tuo software di fatturazione elettronica
4. Il tuo software invia al SdI (Sistema di Interscambio)

### Opzione 2: Fatture in Cloud (prossimamente)
Integrazione diretta per inviare automaticamente le fatture al SdI.

### ⚠️ Importante
Le fatture VetBuddy sono **pre-fatture/proforma**. Per essere valide fiscalmente devono essere inviate al Sistema di Interscambio tramite un software certificato.
          `,
          image: '🧾'
        },
        {
          title: 'Creare il Listino Prezzi',
          content: `
## 💰 Listino Prestazioni

Prima di creare fatture, configura il tuo listino prezzi.

### Come fare:
1. Vai su **Fatturazione** nel menu
2. Clicca sulla tab **"Servizi"**
3. Clicca **"+ Aggiungi"**

### Campi da compilare:
- **Nome** - Es. "Visita generica"
- **Descrizione** - Dettagli opzionali
- **Prezzo** - Importo IVA esclusa
- **IVA** - Aliquota (di solito 22%)

### 💡 Tip
Puoi importare i servizi già configurati dalla sezione "Servizi" della clinica.
          `,
          image: '💰'
        },
        {
          title: 'Creare una Fattura',
          content: `
## 📝 Nuova Fattura

### Come creare:
1. Vai su **Fatturazione**
2. Clicca **"+ Nuova Fattura"**
3. Seleziona il cliente
4. Aggiungi le prestazioni dal listino
5. Salva come bozza o emetti

### Dettagli automatici:
- **Numero fattura** - Progressivo automatico (2024/001, 2024/002, etc.)
- **IVA 22%** - Calcolata automaticamente
- **Marca da bollo** - €2 se imponibile > €77.47

### Stati fattura:
- 📝 **Bozza** - In preparazione
- 📄 **Emessa** - Pronta per il pagamento
- ✅ **Pagata** - Incassata
          `,
          image: '📝'
        },
        {
          title: 'Esportare le Fatture',
          content: `
## 📤 Export per Software Esterni

### Come esportare:
1. Vai su **Fatturazione** → **Impostazioni**
2. Scegli il formato: CSV, PDF o JSON
3. Clicca **"Export"**

### Formati disponibili:
- **CSV** - Per Excel e importazione in gestionali
- **PDF/HTML** - Per stampa e invio email
- **JSON** - Per integrazione API

### Software compatibili:
Il CSV può essere importato in:
- Fatture in Cloud
- TeamSystem
- Aruba Fatturazione
- Zucchetti
- E molti altri...

### 💡 Guida passo-passo
Nella sezione Impostazioni trovi guide specifiche per ogni software!
          `,
          image: '📤'
        }
      ]
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Business',
      icon: MessageSquare,
      color: 'green',
      description: 'Configurare WhatsApp per comunicare con i clienti',
      duration: '3 min',
      steps: [
        {
          title: 'Configurare WhatsApp',
          content: `
## 💬 WhatsApp Business

Permetti ai clienti di contattarti via WhatsApp direttamente dall'app!

### Come configurare:
1. Vai su **Impostazioni** → **Profilo Clinica**
2. Clicca **"Modifica"**
3. Nel campo **"WhatsApp Business"** inserisci il numero
4. Usa il formato internazionale: +39 333 1234567
5. Salva

### Requisiti:
- 📱 Scarica **WhatsApp Business** (non WhatsApp normale)
- Registrati con il numero della clinica
- Configura il profilo aziendale

### Cosa succede:
- I clienti vedranno il pulsante "WhatsApp" nella loro app
- Cliccandolo si apre una chat diretta con te
- Puoi impostare risposte automatiche in WhatsApp Business
          `,
          image: '💬'
        },
        {
          title: 'Consigli WhatsApp Business',
          content: `
## 📱 Best Practices

### Configura il profilo:
- Nome azienda
- Descrizione
- Indirizzo
- Orari di apertura
- Sito web

### Risposte automatiche:
In WhatsApp Business puoi impostare:
- **Messaggio di benvenuto** - Per nuove chat
- **Messaggio di assenza** - Fuori orario
- **Risposte rapide** - Per domande frequenti

### Etichette:
Usa le etichette per organizzare le chat:
- 🟢 Nuovo cliente
- 🟡 In attesa di risposta
- 🔴 Urgente
- ✅ Risolto

### 💡 Tip
Rispondi entro 24 ore per mantenere alta la soddisfazione cliente!
          `,
          image: '📱'
        }
      ]
    }
  ];

  const currentModule = modules[activeModule];
  const currentStep = currentModule.steps[activeStep];
  const totalSteps = modules.reduce((acc, m) => acc + m.steps.length, 0);
  const completedCount = Object.keys(completedSteps).length;
  const progress = (completedCount / totalSteps) * 100;

  const markComplete = () => {
    const key = `${activeModule}-${activeStep}`;
    setCompletedSteps(prev => ({ ...prev, [key]: true }));
    
    // Auto advance
    if (activeStep < currentModule.steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else if (activeModule < modules.length - 1) {
      setActiveModule(activeModule + 1);
      setActiveStep(0);
    }
  };

  const isStepComplete = (moduleIndex, stepIndex) => {
    return completedSteps[`${moduleIndex}-${stepIndex}`];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <VetBuddyLogo size={32} />
            <span className="font-bold text-xl text-gray-900">VetBuddy</span>
            <Badge variant="outline" className="ml-2">Tutorial</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="h-4 w-4" />
              <span>{completedCount}/{totalSteps} completati</span>
            </div>
            <Progress value={progress} className="w-32 hidden md:block" />
            <Link href="/presentazione">
              <Button variant="outline" size="sm">📊 Brochure</Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="bg-coral-500 hover:bg-coral-600">
                Vai alla Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Modules */}
        <aside className="w-80 bg-white border-r h-[calc(100vh-60px)] overflow-y-auto sticky top-[60px] hidden lg:block">
          <div className="p-4">
            <h2 className="font-bold text-gray-900 mb-4">📚 Moduli Tutorial</h2>
            <div className="space-y-2">
              {modules.map((module, i) => {
                const moduleComplete = module.steps.every((_, j) => isStepComplete(i, j));
                const moduleStarted = module.steps.some((_, j) => isStepComplete(i, j));
                
                return (
                  <div key={i}>
                    <button
                      onClick={() => { setActiveModule(i); setActiveStep(0); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        activeModule === i 
                          ? 'bg-coral-50 border-2 border-coral-500' 
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        moduleComplete ? 'bg-green-100' : 
                        activeModule === i ? 'bg-coral-100' : 'bg-gray-100'
                      }`}>
                        {moduleComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <module.icon className={`h-5 w-5 ${activeModule === i ? 'text-coral-600' : 'text-gray-500'}`} />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${activeModule === i ? 'text-coral-700' : 'text-gray-900'}`}>
                          {module.title}
                        </p>
                        <p className="text-xs text-gray-500">{module.duration}</p>
                      </div>
                      {moduleStarted && !moduleComplete && (
                        <Badge variant="outline" className="text-xs">In corso</Badge>
                      )}
                    </button>
                    
                    {/* Sub-steps */}
                    {activeModule === i && (
                      <div className="ml-6 mt-2 space-y-1">
                        {module.steps.map((step, j) => (
                          <button
                            key={j}
                            onClick={() => setActiveStep(j)}
                            className={`w-full flex items-center gap-2 p-2 rounded text-sm transition-all ${
                              activeStep === j 
                                ? 'bg-coral-100 text-coral-700' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isStepComplete(i, j) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                            <span className="truncate">{step.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <span>{currentModule.title}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">{currentStep.title}</span>
            </div>

            {/* Content Card */}
            <Card className="mb-6">
              <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{currentStep.image}</div>
                    <div>
                      <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
                      <p className="text-gray-500">
                        Step {activeStep + 1} di {currentModule.steps.length} • {currentModule.title}
                      </p>
                    </div>
                  </div>
                  {isStepComplete(activeModule, activeStep) && (
                    <Badge className="bg-green-500">✓ Completato</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Render markdown-like content */}
                <div className="prose prose-gray max-w-none">
                  {currentStep.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-4">{line.replace('## ', '')}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                    } else if (line.startsWith('- **')) {
                      const match = line.match(/- \*\*(.+?)\*\* - (.+)/);
                      if (match) {
                        return (
                          <div key={i} className="flex items-start gap-2 my-2">
                            <span className="text-coral-500">•</span>
                            <span><strong>{match[1]}</strong> - {match[2]}</span>
                          </div>
                        );
                      }
                    } else if (line.startsWith('- ')) {
                      return (
                        <div key={i} className="flex items-start gap-2 my-1 ml-4">
                          <span className="text-gray-400">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    } else if (line.match(/^\d+\./)) {
                      return (
                        <div key={i} className="flex items-start gap-3 my-2">
                          <span className="bg-coral-100 text-coral-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {line.match(/^(\d+)/)[1]}
                          </span>
                          <span>{line.replace(/^\d+\.\s*/, '')}</span>
                        </div>
                      );
                    } else if (line.trim()) {
                      return <p key={i} className="my-2 text-gray-700">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (activeStep > 0) {
                    setActiveStep(activeStep - 1);
                  } else if (activeModule > 0) {
                    setActiveModule(activeModule - 1);
                    setActiveStep(modules[activeModule - 1].steps.length - 1);
                  }
                }}
                disabled={activeModule === 0 && activeStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Precedente
              </Button>
              
              <Button
                onClick={markComplete}
                className={isStepComplete(activeModule, activeStep) 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-coral-500 hover:bg-coral-600'}
              >
                {isStepComplete(activeModule, activeStep) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Completato
                  </>
                ) : (
                  <>
                    Segna come completato
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Quick Navigation for mobile */}
            <div className="mt-8 lg:hidden">
              <h3 className="font-bold text-gray-900 mb-4">Altri moduli</h3>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((module, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveModule(i); setActiveStep(0); }}
                    className={`p-3 rounded-lg text-left transition-all ${
                      activeModule === i 
                        ? 'bg-coral-100 border-2 border-coral-500' 
                        : 'bg-white border hover:border-gray-300'
                    }`}
                  >
                    <module.icon className={`h-5 w-5 mb-1 ${activeModule === i ? 'text-coral-600' : 'text-gray-500'}`} />
                    <p className="font-medium text-sm">{module.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
