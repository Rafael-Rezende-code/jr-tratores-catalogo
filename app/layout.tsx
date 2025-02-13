import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import PWAPrompt from '@/components/PWAPrompt'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JR Tratores - Seu Parceiro em Máquinas Agrícolas',
  description: 'Encontre os melhores tratores e máquinas agrícolas com a JR Tratores. Qualidade e confiança para o seu negócio.',
  manifest: '/manifest.json',
  themeColor: '#1B8B45',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JR TRATORES',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#1B8B45" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Header />
        <Toaster />
        {children}
        <PWAPrompt />
      </body>
    </html>
  )
}