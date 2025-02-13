'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import { Phone } from "lucide-react"

type Tractor = Database['public']['Tables']['tractors']['Row']
type GalleryImage = Database['public']['Tables']['tractor_gallery']['Row']

const getPublicImageUrl = (fileName: string) => {
  return `https://tbrypcszuaxedvlmyrcn.supabase.co/storage/v1/object/public/images/${fileName}`;
};

export default function ProductPage() {
  const params = useParams()
  const [tractor, setTractor] = useState<Tractor | null>(null)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  useEffect(() => {
    async function fetchTractorAndGallery() {
      try {
        // Fetch tractor details
        const { data: tractorData, error: tractorError } = await supabase
          .from('tractors')
          .select('*')
          .eq('id', params.id)
          .single()

        if (tractorError) throw tractorError

        const tractorWithUrl = {
          ...tractorData,
          image_url: getPublicImageUrl(tractorData.image_url)
        }

        setTractor(tractorWithUrl)

        // Try to fetch gallery images
        try {
          const { data: galleryData } = await supabase
            .from('tractor_gallery')
            .select('*')
            .eq('tractor_id', params.id)
            .order('sort_order', { ascending: true })

          if (galleryData) {
            const galleryWithUrls = galleryData.map(image => ({
              ...image,
              image_url: getPublicImageUrl(image.image_url)
            }))
            setGallery(galleryWithUrls)
          }
        } catch (galleryError) {
          console.warn('Gallery not available:', galleryError)
          setGallery([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTractorAndGallery()
    }
  }, [params.id])

  function getWhatsAppLink() {
    if (!tractor) return '#'
    const message = `Olá! Tenho interesse no trator ${tractor.name}. Poderia me dar mais informações?`
    return `https://api.whatsapp.com/send?phone=${tractor.whatsapp_number}&text=${encodeURIComponent(message)}`
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  // Combine main image with gallery images
  const allImages = tractor ? [tractor.image_url, ...gallery.map(img => img.image_url)] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-48 w-96 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!tractor) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Trator não encontrado</h1>
        <Link href="/">
          <Button className="bg-[#2C5F15] hover:bg-[#1C3F0D]">
            Voltar para a página inicial
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar para a página inicial
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={allImages[currentImageIndex]}
                alt={tractor.name}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setShowLightbox(true)}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://images.unsplash.com/photo-1605338803155-8b46c2edc992?w=800';
                }}
              />
              {allImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) => 
                        prev === 0 ? allImages.length - 1 : prev - 1
                      )
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) => 
                        prev === allImages.length - 1 ? 0 : prev + 1
                      )
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-[#2C5F15]' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${tractor.name} - Imagem ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://images.unsplash.com/photo-1605338803155-8b46c2edc992?w=800';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tractor.name}</h1>
              <p className="text-2xl font-bold text-[#2C5F15]">
                {formatPrice(tractor.price)}
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Descrição</h2>
                <p className="text-gray-600 whitespace-pre-line">{tractor.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Especificações</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tractor.motor && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Motor</dt>
                      <dd className="text-sm text-gray-900">{tractor.motor}</dd>
                    </div>
                  )}
                  {tractor.potencia && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Potência</dt>
                      <dd className="text-sm text-gray-900">{tractor.potencia}</dd>
                    </div>
                  )}
                  {tractor.tracao && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tração</dt>
                      <dd className="text-sm text-gray-900">{tractor.tracao}</dd>
                    </div>
                  )}
                  {tractor.horas_uso !== null && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Horas de Uso</dt>
                      <dd className="text-sm text-gray-900">{tractor.horas_uso}</dd>
                    </div>
                  )}
                  {tractor.estado && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="text-sm text-gray-900">{tractor.estado}</dd>
                    </div>
                  )}
                  {tractor.localizacao && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Localização</dt>
                      <dd className="text-sm text-gray-900">{tractor.localizacao}</dd>
                    </div>
                  )}
                  {tractor.ano && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ano</dt>
                      <dd className="text-sm text-gray-900">{tractor.ano}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <a
              href={getWhatsAppLink()}
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
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={allImages[currentImageIndex]}
              alt={tractor.name}
              className="w-full h-auto"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://images.unsplash.com/photo-1605338803155-8b46c2edc992?w=800';
              }}
            />
            {allImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => prev === 0 ? allImages.length - 1 : prev - 1)
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex((prev) => prev === allImages.length - 1 ? 0 : prev + 1)
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}