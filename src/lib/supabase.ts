import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing! Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
}

export interface GameProgress {
  id: string
  user_id: string
  game_id: number
  score: number
  completed: boolean
  time_spent: number
  created_at: string
  updated_at: string
}

export interface Game {
  id: number
  name: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  instructions: string
  thumbnail: string
  is_active: boolean
} 