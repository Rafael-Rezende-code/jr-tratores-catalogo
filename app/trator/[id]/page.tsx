import { createClient } from '@supabase/supabase-js'
import ProductPage from './product-page'
import type { Database } from '@/lib/supabase/types'

// Create a Supabase client specifically for build time
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// This function generates all possible paths at build time
export async function generateStaticParams() {
  try {
    const { data: tractors, error } = await supabase
      .from('tractors')
      .select('id')
      .eq('is_available', true) // Only generate pages for available tractors

    if (error) {
      console.error('Error fetching tractors for static paths:', error)
      return []
    }

    if (!tractors || tractors.length === 0) {
      console.warn('No tractors found for static path generation')
      return []
    }

    return tractors.map((tractor) => ({
      id: tractor.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// This function generates metadata for each page
export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const { data: tractor, error } = await supabase
      .from('tractors')
      .select('name')
      .eq('id', params.id)
      .eq('is_available', true)
      .single()

    if (error || !tractor) {
      return {
        title: 'Trator não encontrado | JR Tratores',
        description: 'Este trator não está disponível ou não existe.',
      }
    }

    return {
      title: `${tractor.name} | JR Tratores`,
      description: `Confira o ${tractor.name} disponível na JR Tratores. Qualidade e confiança para o seu negócio.`,
    }
  } catch (error) {
    return {
      title: 'JR Tratores',
      description: 'Encontre os melhores tratores e máquinas agrícolas com a JR Tratores.',
    }
  }
}

export default function Page() {
  return <ProductPage />
}