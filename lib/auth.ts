import { createSupabaseServerClient } from './supabase-server'
import supabaseAdmin from './supabase-admin'

export async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (data?.role !== 'admin') return null
  return { userId: user.id }
}
