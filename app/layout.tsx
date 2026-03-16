import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { DatabaseSetupNotice } from '@/components/database-setup-notice'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://semsari.ma'),
  title: {
    default: 'SEMSARI.ma - Student Accommodation in Morocco',
    template: '%s | SEMSARI.ma'
  },
  description:
    'Find verified student accommodation in Morocco. Search apartments, studios, and rooms near universities. Connect directly with property owners.',
  keywords: ['student accommodation', 'Morocco', 'student housing', 'apartments', 'international students'],
  authors: [{ name: 'SEMSARI.ma' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fr_MA',
    siteName: 'SEMSARI.ma',
    url: 'https://semsari.ma',
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F46E5' },
    { media: '(prefers-color-scheme: dark)', color: '#6366F1' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <DatabaseSetupNotice />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
