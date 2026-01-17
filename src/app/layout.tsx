import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SwipeHire - Fast Startup Hiring',
  description: 'Screen candidates in minutes, not hours',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SwipeHire',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overscroll-none`}>
        <div className="min-h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 supports-[padding:env(safe-area-inset-bottom)]:pb-safe">
          {children}
        </div>
      </body>
    </html>
  )
}
