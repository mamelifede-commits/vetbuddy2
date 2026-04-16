# VetBuddy — Guida al Deploy su Vercel

## Prerequisiti
- Account Vercel (https://vercel.com)
- Repository GitHub collegato (usa "Save to Github" dalla chat Emergent)

## Step 1: Collega il Repository
1. Accedi a https://vercel.com/dashboard
2. Clicca **"Add New Project"**
3. Seleziona il repository GitHub di VetBuddy
4. Framework Preset: **Next.js** (rilevato automaticamente)

## Step 2: Configura le Variabili d'Ambiente
Nella sezione **"Environment Variables"** del progetto Vercel, aggiungi:

### Database (obbligatorio)
| Variabile | Valore | Note |
|-----------|--------|------|
| `MONGO_URL` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `DB_NAME` | `vetbuddy` | Nome del database |

### App URL (obbligatorio)
| Variabile | Valore | Note |
|-----------|--------|------|
| `NEXT_PUBLIC_BASE_URL` | `https://tuodominio.vercel.app` | URL pubblico dell'app |
| `CORS_ORIGINS` | `https://tuodominio.vercel.app` | Origini CORS consentite |

### Autenticazione (obbligatorio)
| Variabile | Valore | Note |
|-----------|--------|------|
| `JWT_SECRET` | `(genera una stringa sicura)` | Chiave segreta per i token JWT |

### Email (obbligatorio)
| Variabile | Valore | Note |
|-----------|--------|------|
| `RESEND_API_KEY` | `re_...` | Chiave API Resend |
| `EMAIL_FROM` | `noreply@vetbuddy.it` | Indirizzo mittente |

### Pagamenti Stripe (obbligatorio)
| Variabile | Valore | Note |
|-----------|--------|------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Chiave pubblica Stripe |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Chiave segreta Stripe |
| `STRIPE_API_KEY` | `sk_live_...` | Stessa della secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Secret del webhook Stripe |

### Google Maps (opzionale)
| Variabile | Valore | Note |
|-----------|--------|------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIza...` | Chiave Google Maps JS |
| `GOOGLE_GEOCODING_API_KEY` | `AIza...` | Chiave Google Geocoding |

### Google OAuth (opzionale)
| Variabile | Valore | Note |
|-----------|--------|------|
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google OAuth Secret |

### REV — Ricetta Elettronica (opzionale)
| Variabile | Valore | Note |
|-----------|--------|------|
| `REV_FEATURE_ENABLED` | `true` | Abilita il modulo REV |
| `REV_MANUAL_MODE` | `true` | `true` = manuale, `false` = automatico |
| `REV_ENVIRONMENT` | `production` | `sandbox` o `production` |

### Feature Flags
| Variabile | Valore | Note |
|-----------|--------|------|
| `NEXT_PUBLIC_COMING_SOON` | `false` | `true` per mostrare la pagina "Coming Soon" |

## Step 3: Deploy
1. Clicca **"Deploy"**
2. Attendi il completamento del build (circa 2-3 minuti)
3. Verifica che il sito sia raggiungibile all'URL generato

## Step 4: Configura il Webhook Stripe
1. Vai su https://dashboard.stripe.com/webhooks
2. Aggiungi un nuovo endpoint: `https://tuodominio.vercel.app/api/webhook/stripe`
3. Seleziona gli eventi: `checkout.session.completed`, `customer.subscription.*`
4. Copia il Signing Secret e aggiornalo come `STRIPE_WEBHOOK_SECRET`

## Step 5: Configura il Dominio Personalizzato (opzionale)
1. Vai su Vercel → Settings → Domains
2. Aggiungi `vetbuddy.it` o il tuo dominio
3. Configura i record DNS come indicato da Vercel

## Note Importanti
- La prima build potrebbe richiedere più tempo
- MongoDB Atlas: assicurati di autorizzare l'IP `0.0.0.0/0` nel Network Access (o usa Vercel IP ranges)
- Il cron job `/api/cron/daily` viene eseguito ogni giorno alle 07:00 UTC
