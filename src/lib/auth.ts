import { supabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Get admin user details from our admin_users table
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!adminUser) {
    return null
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
  }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}