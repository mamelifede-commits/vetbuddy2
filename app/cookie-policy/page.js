'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-coral-500">
            <ChevronLeft className="h-5 w-5" />
            Torna alla home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Cookie className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
            <p className="text-gray-500">Ultimo aggiornamento: Febbraio 2025</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Cosa sono i cookie</h2>
            <p className="text-gray-600 leading-relaxed">
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. 
              Sono ampiamente utilizzati per far funzionare i siti web in modo più efficiente e per fornire informazioni 
              ai proprietari del sito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Come utilizziamo i cookie</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              VetBuddy utilizza i cookie per diversi scopi:
            </p>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">🟢 Cookie Essenziali (Necessari)</h3>
                <p className="text-green-700 text-sm">
                  Questi cookie sono necessari per il funzionamento del sito. Includono cookie per l'autenticazione, 
                  la gestione della sessione e le preferenze di sicurezza. Non possono essere disattivati.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🔵 Cookie Funzionali</h3>
                <p className="text-blue-700 text-sm">
                  Questi cookie ci permettono di ricordare le tue preferenze (come la lingua o la regione) e 
                  fornire funzionalità personalizzate. Migliorano la tua esperienza d'uso.
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">🟡 Cookie Analitici</h3>
                <p className="text-amber-700 text-sm">
                  Utilizziamo questi cookie per capire come i visitatori interagiscono con il nostro sito. 
                  Ci aiutano a migliorare il servizio analizzando in forma aggregata l'utilizzo della piattaforma.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cookie di terze parti</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Il nostro sito può utilizzare servizi di terze parti che potrebbero impostare i propri cookie:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Stripe</strong> - per i pagamenti sicuri</li>
              <li><strong>Google Calendar</strong> - per la sincronizzazione degli appuntamenti</li>
              <li><strong>Google Maps</strong> - per la visualizzazione delle mappe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Gestione dei cookie</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Puoi gestire le tue preferenze sui cookie in diversi modi:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Attraverso le impostazioni del tuo browser</li>
              <li>Utilizzando il nostro banner di consenso cookie</li>
              <li>Contattandoci direttamente</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>Nota:</strong> La disattivazione di alcuni cookie potrebbe influire sulla funzionalità del sito 
              e sulla tua esperienza d'uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Durata dei cookie</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold">Tipo</th>
                    <th className="text-left p-3 font-semibold">Nome</th>
                    <th className="text-left p-3 font-semibold">Durata</th>
                    <th className="text-left p-3 font-semibold">Scopo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">Essenziale</td>
                    <td className="p-3 font-mono text-xs">vetbuddy_token</td>
                    <td className="p-3">7 giorni</td>
                    <td className="p-3">Autenticazione utente</td>
                  </tr>
                  <tr>
                    <td className="p-3">Essenziale</td>
                    <td className="p-3 font-mono text-xs">cookie_consent</td>
                    <td className="p-3">1 anno</td>
                    <td className="p-3">Preferenze cookie</td>
                  </tr>
                  <tr>
                    <td className="p-3">Funzionale</td>
                    <td className="p-3 font-mono text-xs">user_preferences</td>
                    <td className="p-3">1 anno</td>
                    <td className="p-3">Preferenze utente</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. I tuoi diritti</h2>
            <p className="text-gray-600 leading-relaxed">
              Ai sensi del GDPR e della normativa italiana sulla privacy, hai il diritto di:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
              <li>Essere informato su come utilizziamo i tuoi dati</li>
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiedere la rettifica o la cancellazione dei tuoi dati</li>
              <li>Opporti al trattamento dei tuoi dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contatti</h2>
            <p className="text-gray-600 leading-relaxed">
              Per qualsiasi domanda relativa ai cookie o alla privacy, puoi contattarci a:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:privacy@vetbuddy.it" className="text-coral-500 hover:underline">privacy@vetbuddy.it</a><br />
                <strong>Email generale:</strong> <a href="mailto:info@vetbuddy.it" className="text-coral-500 hover:underline">info@vetbuddy.it</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Aggiornamenti</h2>
            <p className="text-gray-600 leading-relaxed">
              Questa Cookie Policy può essere aggiornata periodicamente. Ti invitiamo a consultarla regolarmente. 
              La data dell'ultimo aggiornamento è indicata in cima a questa pagina.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button className="bg-coral-500 hover:bg-coral-600">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Torna alla home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
