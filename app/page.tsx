'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import { Phone } from "lucide-react"

type Tractor = Database['public']['Tables']['tractors']['Row']

const getPublicImageUrl = (fileName: string) => {
  return `https://tbrypcszuaxedvlmyrcn.supabase.co/storage/v1/object/public/images/${fileName}`;
};

export default function Home() {
  const [tractors, setTractors] = useState<Tractor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTractors() {
      try {
        const { data, error } = await supabase
          .from('tractors')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        const tractorsWithUrls = data?.map(tractor => ({
          ...tractor,
          image_url: getPublicImageUrl(tractor.image_url)
        })) || []

        setTractors(tractorsWithUrls)
      } catch (error) {
        console.error('Error fetching tractors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTractors()
  }, [])

  function formatPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  function getWhatsAppLink(tractor: Tractor) {
    const message = `Olá! Tenho interesse no ${tractor.name}. Poderia me dar mais informações?`
    return `https://api.whatsapp.com/send?phone=${tractor.whatsapp_number}&text=${encodeURIComponent(message)}`
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="animate-pulse">
                <div className="h-48 sm:h-56 lg:h-64 bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4 sm:p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {tractors.map((tractor) => (
              <Card key={tractor.id} className="flex flex-col overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link href={`/trator/${tractor.id}`}>
                  <div className="relative h-48 sm:h-56 lg:h-64">
                    <img
                      src={tractor.image_url}
                      alt={tractor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://images.unsplash.com/photo-1605338803155-8b46c2edc992?w=800';
                      }}
                    />
                  </div>
                </Link>
                <CardContent className="flex flex-col flex-grow p-4 sm:p-6">
                  <Link href={`/trator/${tractor.id}`}>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 hover:text-[#2C5F15] transition-colors">
                      {tractor.name}
                    </h3>
                    {tractor.ano && (
                      <p className="text-sm text-gray-500 mb-2">
                        Ano: {tractor.ano}
                      </p>
                    )}
                  </Link>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {tractor.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                    <span className="text-lg sm:text-xl font-bold text-[#2C5F15]">
                      {formatPrice(tractor.price)}
                    </span>
                    <a
                      href={getWhatsAppLink(tractor)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full bg-[#1B8B45] hover:bg-[#1B8B45]/90">
                        <Phone className="w-4 h-4 mr-2" />
                        Falar no WhatsApp
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}