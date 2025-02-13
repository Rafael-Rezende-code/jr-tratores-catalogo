export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tractors: {
        Row: {
          id: string
          created_at: string
          name: string
          price: number
          description: string
          image_url: string
          whatsapp_number: string
          is_available: boolean
          motor: string | null
          potencia: string | null
          tracao: string | null
          horas_uso: number | null
          estado: string | null
          localizacao: string | null
          ano: number | null
          single_owner: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          price: number
          description: string
          image_url: string
          whatsapp_number: string
          is_available?: boolean
          motor?: string | null
          potencia?: string | null
          tracao?: string | null
          horas_uso?: number | null
          estado?: string | null
          localizacao?: string | null
          ano?: number | null
          single_owner?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          price?: number
          description?: string
          image_url?: string
          whatsapp_number?: string
          is_available?: boolean
          motor?: string | null
          potencia?: string | null
          tracao?: string | null
          horas_uso?: number | null
          estado?: string | null
          localizacao?: string | null
          ano?: number | null
          single_owner?: boolean
        }
      }
      tractor_gallery: {
        Row: {
          id: string
          tractor_id: string
          image_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          tractor_id: string
          image_url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          tractor_id?: string
          image_url?: string
          sort_order?: number
          created_at?: string
        }
      }
    }
  }
}