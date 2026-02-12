import './globals.css'

export const metadata = {
  title: 'VetBuddy - Gestionale Veterinario | Pilot Milano',
  description: 'La piattaforma per cliniche veterinarie e proprietari di animali. Gestisci appuntamenti, documenti e comunicazione in un\'unica piattaforma. Pilot Milano 2025.',
  keywords: ['veterinario', 'clinica veterinaria', 'gestionale', 'animali', 'Milano', 'prenotazioni', 'pet'],
  authors: [{ name: 'VetBuddy' }],
  openGraph: {
    title: 'VetBuddy - Gestionale Veterinario',
    description: 'La piattaforma per cliniche veterinarie e proprietari di animali. Zero carta, zero caos.',
    url: 'https://vetbuddy.it',
    siteName: 'VetBuddy',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VetBuddy - Gestionale Veterinario',
    description: 'La piattaforma per cliniche veterinarie e proprietari di animali.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}