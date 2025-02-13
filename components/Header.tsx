'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
          <Link href="/">
            <img 
              src="/images/Logo JR.png" 
              alt="JR Tratores Logo" 
              className="h-12 w-auto"
            />
          </Link>
          <Link href="/admin">
            <Button variant="default" className="bg-[#1B8B45] hover:bg-[#146832]">
              Área do Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
