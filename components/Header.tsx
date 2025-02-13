'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/Logo JR.png" alt="JR Tratores" width={32} height={32} />
          <span className="text-xl font-bold">JR Tratores</span>
        </Link>

        <Link href="/admin">
          <Button className="bg-[#1B8B45] hover:bg-[#146832]">
            <Settings className="h-4 w-4 mr-2" />
            Área do Admin
          </Button>
        </Link>
      </div>
    </header>
  )
}
