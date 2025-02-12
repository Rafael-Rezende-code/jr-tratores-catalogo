import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import PWAPrompt from '@/components/PWAPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JR Tratores - Seu Parceiro em Máquinas Agrícolas',
  description: 'Encontre os melhores tratores e máquinas agrícolas com a JR Tratores. Qualidade e confiança para o seu negócio.',
  manifest: '/manifest.json',
  themeColor: '#000000',
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
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <PWAPrompt />
      </body>
    </html>
  )
}