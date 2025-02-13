import { createClient } from '@supabase/supabase-js'
import ProductPage from './product-page'
import type { Database } from '@/lib/supabase/types'

// Create a Supabase client specifically for build time
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

// Dynamic page generation
export const dynamic = 'force-dynamic'

export default function Page() {
  return <ProductPage />
}