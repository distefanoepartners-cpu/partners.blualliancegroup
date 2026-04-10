import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portale Partner — Blu Alliance',
  description: 'Area riservata affiliati Blu Alliance',
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
