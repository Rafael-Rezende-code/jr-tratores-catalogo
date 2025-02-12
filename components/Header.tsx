'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
          <Link href="/" className="flex items-center">
            <img 
              src="/images/Logo JR.png" 
              alt="JR Tratores Logo" 
              className="h-12 w-auto"
            />
          </Link>
          <Link href="/admin">
            <Button className="bg-[#2C5F15] text-white hover:bg-[#1C3F0D] transition-colors text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
              Área do Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
