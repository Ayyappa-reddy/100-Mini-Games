import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  emailVerified: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string, username: string) => Promise<void>
  signIn: (emailOrUsername: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: { first_name?: string; last_name?: string; username?: string }) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  changePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setEmailVerified(session?.user?.email_confirmed_at ? true : false)
      setLoading(false)
      if (session?.user) {
        ensureUserProfile(session.user).catch(console.error)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setEmailVerified(session?.user?.email_confirmed_at ? true : false)
      setLoading(false)
      if (session?.user) {
        ensureUserProfile(session.user).catch(console.error)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Ensure a corresponding row exists in public.users for FK constraints
  const ensureUserProfile = async (authUser: User) => {
    try {
      const metadata: any = authUser.user_metadata || {}
      const email = authUser.email || ''
      const username = (metadata.username as string) || (email ? email.split('@')[0] : `user_${authUser.id.slice(0, 8)}`)
      const firstName = (metadata.first_name as string) || null
      const lastName = (metadata.last_name as string) || null

      // Upsert profile row; requires UNIQUE/PK on id
      const { error } = await supabase
        .from('users')
        .upsert([
          {
            id: authUser.id,
            email,
            username,
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
          },
        ], { onConflict: 'id' })

      if (error) {
        console.error('ensureUserProfile upsert error:', error)
        throw error
      }
      
      console.log('User profile ensured:', { id: authUser.id, username, email })
    } catch (e) {
      console.error('ensureUserProfile failed:', e)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
          },
        },
      })

      if (error) throw error

      toast.success('Account created! Please check your email for verification.')
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      let email = emailOrUsername

      // If input looks like username, find the email from public.users table
      if (!emailOrUsername.includes('@')) {
        console.log('🔍 Attempting username login for:', emailOrUsername)
        
        // First, let's see what's in the users table
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('*')
      
        console.log('📋 All users in table:', allUsers)
        console.log('❌ All users error:', allUsersError)
        
        // Now try to find the specific username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single()

        console.log('🔍 Username lookup result:', userData)
        console.log('❌ Username lookup error:', userError)

        if (userError || !userData) {
          console.error('❌ Username lookup failed:', userError)
          throw new Error('Invalid username or email')
        }
        
        email = userData.email
        console.log('✅ Found email for username:', email)
      }

      console.log('🔐 Signing in with email:', email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Welcome back!')
    } catch (error: any) {
      console.error('❌ Sign in error:', error)
      toast.error(error.message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      toast.success('Password reset email sent!')
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      if (error) throw error
      toast.success('Verification email resent!')
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  const updateProfile = async (data: { first_name?: string; last_name?: string; username?: string }) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  const changePassword = async (newPassword: string) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast.success('Password updated successfully')
    } catch (error: any) {
      toast.error(error.message)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    emailVerified,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    resendVerification,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 