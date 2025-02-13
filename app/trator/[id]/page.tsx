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
      .eq('is_available', true)

    if (error) {
      console.error('Error fetching tractors for static paths:', error)
      return []
    }

    return tractors?.map((tractor) => ({
      id: tractor.id,
    })) || []
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
      description: `Confira detalhes e fotos do ${tractor.name} disponível na JR Tratores.`,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'JR Tratores',
      description: 'Seu parceiro em máquinas agrícolas.',
    }
  }
}

// Enable ISR with a revalidate time of 10 seconds
export const revalidate = 10

export default function Page() {
  return <ProductPage />
}