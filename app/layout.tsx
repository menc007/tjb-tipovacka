import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/ui/Toaster'

export const metadata: Metadata = {
  title: 'TJB Tipovačka – MS 2026',
  description: 'Tipovačka fotbalového Mistrovství světa 2026 | TJB Football Club',
  icons: {
    }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className="dark">
      <body className="bg-tjb-black text-white min-h-screen antialiased">
        <Navbar />
        <main className="container mx-auto px-4 pb-12 max-w-6xl">
          {children}
        </main>
        <Toaster />
        {/* Jemné pozadí s logem – watermark */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
          style={{
            backgroundImage: 'url(/tjb-logo.png)',
            backgroundSize: '300px',
            backgroundRepeat: 'repeat',
          }}
        />
      </body>
    </html>
  )
}
