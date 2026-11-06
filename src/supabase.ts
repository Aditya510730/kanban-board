import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function ensureGuestSession() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  if (sessionData.session) {
    return sessionData.session.user
  }

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error

  return data.user
}