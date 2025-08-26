import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Game, GameProgress } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface GameContextType {
  games: Game[]
  userProgress: GameProgress[]
  loading: boolean
  saveProgress: (gameId: number, score: number, completed: boolean, timeSpent: number) => Promise<void>
  getUserProgress: (gameId: number) => GameProgress | undefined
  getTotalScore: () => number
  getCompletedGames: () => number
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([])
  const [userProgress, setUserProgress] = useState<GameProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserProgress()
    } else {
      setUserProgress([])
    }
  }, [user])

  const loadGames = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('id')

      if (error) throw error
      setGames(data || [])
    } catch (error: any) {
      toast.error('Failed to load games')
      console.error('Error loading games:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProgress = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setUserProgress(data || [])
    } catch (error: any) {
      toast.error('Failed to load progress')
      console.error('Error loading progress:', error)
    }
  }

  const saveProgress = async (gameId: number, score: number, completed: boolean, timeSpent: number) => {
    if (!user) {
      toast.error('Please sign in to save progress')
      return
    }

    try {
      const existingProgress = userProgress.find(p => p.game_id === gameId)

      const payload = {
        user_id: user?.id || '',
        game_id: gameId,
        score: existingProgress ? Math.max(existingProgress.score, score) : score,
        completed: existingProgress ? (existingProgress.completed || completed) : completed,
        time_spent: timeSpent,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('game_progress')
        .upsert([payload], { onConflict: 'user_id,game_id' })

      if (error) throw error

      // Reload user progress
      await loadUserProgress()
      toast.success('Progress saved!')
    } catch (error: any) {
      toast.error(`Failed to save progress: ${error?.message || 'Unknown error'}`)
      console.error('Error saving progress:', error)
    }
  }

  const getUserProgress = (gameId: number) => {
    return userProgress.find(p => p.game_id === gameId)
  }

  const getTotalScore = () => {
    return userProgress.reduce((total, progress) => total + progress.score, 0)
  }

  const getCompletedGames = () => {
    return userProgress.filter(progress => progress.completed).length
  }

  const value = {
    games,
    userProgress,
    loading,
    saveProgress,
    getUserProgress,
    getTotalScore,
    getCompletedGames,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
} 