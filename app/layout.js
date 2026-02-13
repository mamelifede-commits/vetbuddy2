import './globals.css'
import CookieBanner from '@/components/CookieBanner'

export const metadata = {
  title: 'VetBuddy - Gestionale Veterinario | Pilot Milano',
  description: 'La piattaforma per cliniche veterinarie e proprietari di animali. Gestisci appuntamenti, documenti e comunicazione in un\'unica piattaforma. Pilot Milano 2025.',
  keywords: ['veterinario', 'clinica veterinaria', 'gestionale', 'animali', 'Milano', 'prenotazioni', 'pet'],
  authors: [{ name: 'VetBuddy' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VetBuddy',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'VetBuddy',
  },
}

export const viewport = {
  themeColor: '#FF6B6B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        {/* PWA Meta Tags per iOS */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VetBuddy" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}