import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portale Partner — Blu Alliance',
  description: 'Area riservata affiliati Blu Alliance. Accedi con il tuo codice per visualizzare commissioni e materiali.',
  metadataBase: new URL('https://partner.blualliancegroup.com'),
  openGraph: {
    title: 'Portale Partner — Blu Alliance',
    description: 'Area riservata affiliati. Accedi con il tuo codice BLU-XXXX.',
    url: 'https://partner.blualliancegroup.com',
    siteName: 'Blu Alliance Partner',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Blu Alliance Partner Portal' }],
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/icon-192.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/icon-512.png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F8', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}