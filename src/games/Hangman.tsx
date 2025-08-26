import React, { useEffect, useMemo, useRef, useState } from 'react'

interface HangmanProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

const DICTIONARY = [
  'react','typescript','hangman','puzzle','logic','component','context','router','tailwind','supabase',
  'database','function','variable','performance','testing','cursor','keyboard','display','animation','graphics'
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const MAX_LIVES = 6

const pickWord = () => {
  const idx = Math.floor(Math.random() * DICTIONARY.length)
  return DICTIONARY[idx].toUpperCase()
}

const uniqueLetters = (w: string) => new Set(w.replace(/[^A-Z]/g, '').split(''))

const Hangman: React.FC<HangmanProps> = ({ onComplete, onUpdate, initialState }) => {
  const [secret, setSecret] = useState<string>(initialState?.secret || pickWord())
  const [guessed, setGuessed] = useState<Set<string>>(new Set<string>(initialState?.guessed || []))
  // const [lives] = useState<number>(initialState?.lives ?? MAX_LIVES)
  const [hints, setHints] = useState<number>(initialState?.hints ?? 2)
  const [elapsed, setElapsed] = useState<number>(initialState?.elapsed || 0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [win, setWin] = useState<boolean>(false)
  const timerRef = useRef<number | null>(null)

  const masked = useMemo(() => secret.split('').map(ch => (/[A-Z]/.test(ch) ? (guessed.has(ch) ? ch : '_') : ch)).join(' '), [secret, guessed])
  const wrongGuesses = useMemo(() => Array.from(guessed).filter(ch => !secret.includes(ch)), [secret, guessed])
  const remainingLives = MAX_LIVES - wrongGuesses.length
  const uniqueSecretLetters = useMemo(() => uniqueLetters(secret), [secret])
  const allRevealed = useMemo(() => Array.from(uniqueSecretLetters).every(ch => guessed.has(ch)), [uniqueSecretLetters, guessed])

  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    onUpdate({ secret, guessed: Array.from(guessed), lives: remainingLives, hints, elapsed, gameOver, win })
  }, [secret, guessed, remainingLives, hints, elapsed, gameOver, win, onUpdate])

  useEffect(() => {
    if (remainingLives <= 0 && !gameOver) {
      setGameOver(true)
      setWin(false)
      const score = Math.max(0, 300 - elapsed - wrongGuesses.length * 10)
      onComplete(score, false)
    }
  }, [remainingLives, gameOver, wrongGuesses.length, elapsed, onComplete])

  useEffect(() => {
    if (allRevealed && !gameOver) {
      setGameOver(true)
      setWin(true)
      const score = Math.max(10, 500 - elapsed - wrongGuesses.length * 5 + hints * -20)
      onComplete(score, true)
    }
  }, [allRevealed, gameOver, elapsed, wrongGuesses.length, hints, onComplete])

  const guess = (ch: string) => {
    if (gameOver || guessed.has(ch)) return
    const up = ch.toUpperCase()
    setGuessed(prev => new Set<string>([...Array.from(prev), up]))
  }

  const useHint = () => {
    if (hints <= 0 || gameOver) return
    const candidates = Array.from(uniqueSecretLetters).filter(ch => !guessed.has(ch))
    if (candidates.length === 0) return
    const reveal = candidates[Math.floor(Math.random() * candidates.length)]
    setHints(h => h - 1)
    setGuessed(prev => new Set<string>([...Array.from(prev), reveal]))
  }

  const reset = () => {
    setSecret(pickWord())
    setGuessed(new Set<string>())
    setHints(2)
    setGameOver(false)
    setWin(false)
    setElapsed(0)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase()
      if (k.length === 1 && k >= 'A' && k <= 'Z') guess(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameOver, guessed])

  const part = (idx: number) => remainingLives <= idx ? 'opacity-30' : 'opacity-100'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded">Lives: {remainingLives}/{MAX_LIVES}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Wrong: {wrongGuesses.length}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Hints: {hints}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Time: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
        </div>
        <div className="space-x-2">
          <button onClick={useHint} disabled={hints<=0 || gameOver} className={`btn-secondary ${hints<=0?'opacity-60 cursor-not-allowed':''}`}>Hint</button>
          <button onClick={reset} className="btn-primary">New Word</button>
        </div>
      </div>

      {/* Hangman figure (simple) */}
      <div className="flex items-start space-x-6 mb-6">
        <svg width="140" height="140" className="text-gray-700">
          <line x1="10" y1="130" x2="130" y2="130" stroke="currentColor" strokeWidth="4" />
          <line x1="30" y1="130" x2="30" y2="20" stroke="currentColor" strokeWidth="4" />
          <line x1="30" y1="20" x2="90" y2="20" stroke="currentColor" strokeWidth="4" />
          <line x1="90" y1="20" x2="90" y2="35" stroke="currentColor" strokeWidth="4" />
          {/* head */}
          <circle cx="90" cy="48" r="12" stroke="currentColor" fill="none" strokeWidth="3" className={part(5)} />
          {/* body */}
          <line x1="90" y1="60" x2="90" y2="90" stroke="currentColor" strokeWidth="3" className={part(4)} />
          {/* arms */}
          <line x1="90" y1="70" x2="75" y2="80" stroke="currentColor" strokeWidth="3" className={part(3)} />
          <line x1="90" y1="70" x2="105" y2="80" stroke="currentColor" strokeWidth="3" className={part(2)} />
          {/* legs */}
          <line x1="90" y1="90" x2="80" y2="110" stroke="currentColor" strokeWidth="3" className={part(1)} />
          <line x1="90" y1="90" x2="100" y2="110" stroke="currentColor" strokeWidth="3" className={part(0)} />
        </svg>

        <div className="flex-1">
          <div className="text-3xl font-mono tracking-widest mb-4">
            {masked}
          </div>
          <div className="mb-4 text-gray-600">Wrong guesses: {wrongGuesses.join(' ') || 'None'}</div>
          <div className="flex flex-wrap gap-2">
            {ALPHABET.map(ch => {
              const used = guessed.has(ch)
              const wrong = used && !secret.includes(ch)
              return (
                <button key={ch} onClick={() => guess(ch)} disabled={used || gameOver}
                  className={`w-8 h-8 rounded font-semibold ${used ? (wrong ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800') : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {ch}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="mt-4 p-4 bg-gray-50 rounded text-center">
          <div className="text-xl font-semibold mb-2">{win ? 'You guessed it! 🎉' : 'Out of lives.'}</div>
          <div className="text-gray-700 mb-2">Word: <span className="font-mono">{secret}</span></div>
          <button onClick={reset} className="btn-primary">Play Again</button>
        </div>
      )}
    </div>
  )
}

export default Hangman


