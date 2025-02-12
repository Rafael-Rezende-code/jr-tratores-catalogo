import { supabase } from './client'

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Auth error:', error)
      throw error
    }
    
    return { data, error: null }
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Erro ao fazer login. Verifique suas credenciais.'
      }
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Erro ao fazer logout.'
      }
    }
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session, error: null }
  } catch (error: any) {
    return {
      session: null,
      error: {
        message: error.message || 'Erro ao recuperar sessão.'
      }
    }
  }
}