import { useState, useEffect, useRef } from 'react'

interface WordChainProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface GameState {
  currentWord: string
  chainLength: number
  timeRemaining: number
  gameMode: 'classic' | 'speed' | 'challenge'
  powerUps: number
  streak: number
  hintsUsed: number
  gameComplete: boolean
  roundNumber: number
  totalScore: number
}

const WordChain: React.FC<WordChainProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [gameState, setGameState] = useState<GameState>(initialState || {
    currentWord: 'START',
    chainLength: 1,
    timeRemaining: 30,
    gameMode: 'classic',
    powerUps: 3,
    streak: 0,
    hintsUsed: 0,
    gameComplete: false,
    roundNumber: 1,
    totalScore: 0
  })

  const [score, setScore] = useState(initialState?.score || 0)
  const [userInput, setUserInput] = useState('')
  const [gameActive, setGameActive] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [lastResult, setLastResult] = useState<{
    word: string
    chainLength: number
    points: number
    streak: number
    message: string
  } | null>(null)
  const [chainHistory, setChainHistory] = useState<string[]>(['START'])
  const [gamePhase, setGamePhase] = useState<'menu' | 'playing' | 'result' | 'gameOver'>('menu')

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const wordList = [
    'CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT', 'VAT',
    'CAR', 'BAR', 'FAR', 'JAR', 'MAR', 'PAR', 'TAR', 'WAR', 'ZAR', 'EAR',
    'BIG', 'DIG', 'FIG', 'JIG', 'PIG', 'RIG', 'WIG', 'ZIG', 'LIG', 'MIG',
    'HOT', 'COT', 'DOT', 'GOT', 'JOT', 'LOT', 'NOT', 'POT', 'ROT', 'TOT',
    'RUN', 'BUN', 'FUN', 'GUN', 'NUN', 'PUN', 'SUN', 'TUN', 'ZUN', 'HUN',
    'SIT', 'BIT', 'FIT', 'HIT', 'KIT', 'LIT', 'MIT', 'PIT', 'WIT', 'ZIT',
    'TOP', 'COP', 'HOP', 'LOP', 'MOP', 'POP', 'ROP', 'SOP', 'TOP', 'ZOP',
    'WIN', 'BIN', 'DIN', 'FIN', 'GIN', 'KIN', 'PIN', 'SIN', 'TIN', 'ZIN'
  ]

  const startGame = (mode: 'classic' | 'speed' | 'challenge') => {
    const newState = {
      currentWord: 'START',
      chainLength: 1,
      timeRemaining: mode === 'speed' ? 20 : mode === 'challenge' ? 15 : 30,
      gameMode: mode,
      powerUps: mode === 'challenge' ? 1 : 3,
      streak: 0,
      hintsUsed: 0,
      gameComplete: false,
      roundNumber: 1,
      totalScore: 0
    }
    
    setGameState(newState)
    setGameActive(true)
    setGamePhase('playing')
    setChainHistory(['START'])
    setLastResult(null)
    
    startTimer()
    if (inputRef.current) inputRef.current.focus()
    
    onUpdate(newState, 0)
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timerRef.current!)
          endGame()
          return prev
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)
  }

  const endGame = () => {
    setGameActive(false)
    setGamePhase('gameOver')
    clearInterval(timerRef.current!)
    
    const finalScore = gameState.totalScore
    setScore(finalScore)
    onComplete(finalScore, true)
  }

  const submitWord = () => {
    if (!userInput.trim() || !gameActive) return
    
    const newWord = userInput.trim().toUpperCase()
    
    // Validate word
    if (!isValidWord(newWord)) {
      setUserInput('')
      return
    }

    // Check if word follows chain rule
    if (!followsChainRule(gameState.currentWord, newWord)) {
      setUserInput('')
      return
    }

    // Calculate points
    const points = calculatePoints(newWord, gameState.chainLength, gameState.streak)
    const newStreak = gameState.streak + 1
    const newChainLength = gameState.chainLength + 1
    const newTotalScore = gameState.totalScore + points

    // Update game state
    setGameState(prev => ({
      ...prev,
      currentWord: newWord,
      chainLength: newChainLength,
      streak: newStreak,
      totalScore: newTotalScore,
      timeRemaining: prev.gameMode === 'speed' ? Math.min(prev.timeRemaining + 2, 30) : prev.timeRemaining
    }))

    // Update chain history
    setChainHistory(prev => [...prev, newWord])

    // Show result
    setLastResult({
      word: newWord,
      chainLength: newChainLength,
      points,
      streak: newStreak,
      message: getResultMessage(points, newStreak)
    })

    setUserInput('')
    setGameActive(false)
    setGamePhase('result')

    // Update progress
    onUpdate({
      currentWord: newWord,
      chainLength: newChainLength,
      streak: newStreak,
      totalScore: newTotalScore,
      timeRemaining: gameState.timeRemaining,
      gameMode: gameState.gameMode as 'classic' | 'speed' | 'challenge',
      powerUps: gameState.powerUps,
      hintsUsed: gameState.hintsUsed,
      gameComplete: false,
      roundNumber: gameState.roundNumber
    }, newTotalScore)
  }

  const isValidWord = (word: string): boolean => {
    return wordList.includes(word) && word.length >= 3
  }

  const followsChainRule = (currentWord: string, newWord: string): boolean => {
    // Rule: New word must contain all letters from current word in order
    let currentIndex = 0
    for (let i = 0; i < newWord.length; i++) {
      if (newWord[i] === currentWord[currentIndex]) {
        currentIndex++
        if (currentIndex === currentWord.length) break
      }
    }
    return currentIndex === currentWord.length
  }

  const calculatePoints = (word: string, chainLength: number, streak: number): number => {
    let basePoints = word.length * 10
    let chainBonus = chainLength * 5
    let streakBonus = streak * 3
    let timeBonus = gameState.timeRemaining * 2
    
    return basePoints + chainBonus + streakBonus + timeBonus
  }

  const getResultMessage = (_points: number, streak: number): string => {
    if (streak >= 10) return "🔥 LEGENDARY CHAIN! 🔥"
    if (streak >= 7) return "⚡ INCREDIBLE STREAK! ⚡"
    if (streak >= 5) return "⭐ AMAZING WORK! ⭐"
    if (streak >= 3) return "🎯 GREAT JOB! 🎯"
    if (streak >= 1) return "👍 NICE START! 👍"
    return "💪 KEEP GOING! 💪"
  }

  const useHint = () => {
    if (gameState.powerUps <= 0) return
    
    const possibleWords = wordList.filter(word => 
      followsChainRule(gameState.currentWord, word)
    )
    
    if (possibleWords.length > 0) {
      // const _hint = possibleWords[Math.floor(Math.random() * possibleWords.length)]
      setShowHint(true)
      setTimeout(() => setShowHint(false), 5000)
      
      setGameState(prev => ({
        ...prev,
        powerUps: prev.powerUps - 1,
        hintsUsed: prev.hintsUsed + 1
      }))
    }
  }

  const nextRound = () => {
    setGamePhase('playing')
    setGameActive(true)
    setLastResult(null)
    setGameState(prev => ({
      ...prev,
      roundNumber: prev.roundNumber + 1,
      timeRemaining: prev.gameMode === 'speed' ? 20 : prev.gameMode === 'challenge' ? 15 : 30
    }))
    
    startTimer()
    if (inputRef.current) inputRef.current.focus()
  }

  const resetGame = () => {
    clearInterval(timerRef.current!)
    const newState: GameState = {
      currentWord: 'START',
      chainLength: 1,
      timeRemaining: 30,
      gameMode: 'classic',
      powerUps: 3,
      streak: 0,
      hintsUsed: 0,
      gameComplete: false,
      roundNumber: 1,
      totalScore: 0
    }
    
    setGameState(newState)
    setScore(0)
    setGameActive(false)
    setGamePhase('menu')
    setChainHistory(['START'])
    setLastResult(null)
    setShowHint(false)
    
    onUpdate(newState, 0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameActive) {
      submitWord()
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  if (gamePhase === 'menu') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-8">🔤 Word Chain</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">🎯 Classic Mode</h3>
            <p className="text-gray-700 mb-4">30 seconds, 3 power-ups, build the longest chain!</p>
            <button
              onClick={() => startGame('classic')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Classic
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-green-800 mb-4">⚡ Speed Mode</h3>
            <p className="text-gray-700 mb-4">20 seconds, time bonus for each word, fast-paced action!</p>
            <button
              onClick={() => startGame('speed')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Start Speed
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-red-800 mb-4">🔥 Challenge Mode</h3>
            <p className="text-gray-700 mb-4">15 seconds, only 1 power-up, ultimate test!</p>
            <button
              onClick={() => startGame('challenge')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Start Challenge
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-yellow-800 mb-3">🎯 How to Play</h3>
          <p className="text-yellow-700 mb-4">
            Start with "START". Each new word must contain ALL letters from the previous word in the SAME ORDER.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-yellow-400">
            <h4 className="font-semibold text-yellow-800 mb-2">📝 Example Chain:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-blue-600">START</span>
                <span>→</span>
                <span className="text-gray-600">(contains S, T, A, R, T)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-green-600">STAR</span>
                <span>→</span>
                <span className="text-gray-600">(contains S, T, A, R)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-purple-600">STARE</span>
                <span>→</span>
                <span className="text-gray-600">(contains S, T, A, R, E)</span>
              </div>
            </div>
          </div>
          
          <p className="text-yellow-700 mt-4">
            <strong>You can:</strong> Add letters, remove letters, rearrange letters
            <br />
            <strong>But:</strong> Previous word's letters must appear in the same order!
          </p>
        </div>
      </div>
    )
  }

  if (gamePhase === 'result') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">🎯 Round Result</h2>
        
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-8 mb-6">
          <div className="text-6xl mb-4">🔤</div>
          <h3 className="text-3xl font-bold text-green-800 mb-4">{lastResult?.message}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Word</h4>
              <div className="text-2xl font-bold text-blue-600">{lastResult?.word}</div>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Chain Length</h4>
              <div className="text-2xl font-bold text-green-600">{lastResult?.chainLength}</div>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Points</h4>
              <div className="text-2xl font-bold text-purple-600">+{lastResult?.points}</div>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Streak</h4>
              <div className="text-2xl font-bold text-orange-600">{lastResult?.streak}</div>
            </div>
          </div>
          
          <div className="text-lg font-semibold text-gray-700 mb-6">
            Total Score: <span className="text-purple-600">{gameState.totalScore}</span>
          </div>
          
          <button
            onClick={nextRound}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-blue-700 transition-colors"
          >
            🎯 Continue Chain
          </button>
        </div>
        
        <div className="text-center">
          <button
            onClick={resetGame}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 New Game
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'gameOver') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">🏁 Game Over!</h2>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-8 mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold text-purple-800 mb-6">Final Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Final Score</h4>
              <div className="text-3xl font-bold text-purple-600">{score}</div>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Chain Length</h4>
              <div className="text-2xl font-bold text-green-600">{gameState.chainLength}</div>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Best Streak</h4>
              <div className="text-2xl font-bold text-orange-600">{gameState.streak}</div>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Mode</h4>
              <div className="text-xl font-bold text-blue-600">{gameState.gameMode.toUpperCase()}</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">🔤 Your Word Chain:</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {chainHistory.map((word, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {word}
                </span>
              ))}
            </div>
          </div>
          
          <button
            onClick={resetGame}
            className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-green-700 transition-colors"
          >
            🎯 Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">🔤 Word Chain - {gameState.gameMode.toUpperCase()}</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Chain: {gameState.chainLength}</div>
          <div className="text-green-600">Time: {gameState.timeRemaining}s</div>
          <div className="text-purple-600">Score: {gameState.totalScore}</div>
          <div className="text-orange-600">Streak: {gameState.streak}</div>
          <div className="text-red-600">Power-ups: {gameState.powerUps}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Game Area */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">🎯 Current Word</h3>
            <div className="text-6xl font-bold text-blue-600 mb-6">{gameState.currentWord}</div>
            
            {/* Letter Requirement Display */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your next word must contain these letters in order:</p>
              <div className="flex justify-center space-x-1">
                {gameState.currentWord.split('').map((letter, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-bold">
                    {letter}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Type your word..."
                className="px-6 py-4 text-2xl font-mono border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent text-center w-full max-w-md"
                disabled={!gameActive}
                maxLength={10}
              />
            </div>
            
            <button
              onClick={submitWord}
              disabled={!gameActive || !userInput.trim()}
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔤 Submit Word
            </button>
          </div>

          {/* Power-up Section */}
          <div className="text-center space-y-4">
            <button
              onClick={useHint}
              disabled={gameState.powerUps <= 0 || !gameActive}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💡 Use Hint ({gameState.powerUps})
            </button>
            
            {/* Quick Examples */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Quick examples for "START":</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['STAR', 'STARE', 'START', 'STARTS'].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setUserInput(example)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hint Display */}
          {showHint && (
            <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-center">
              <p className="text-lg font-semibold text-yellow-800 mb-2">
                💡 HINT: Try one of these words:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {wordList.filter(word => followsChainRule(gameState.currentWord, word)).slice(0, 5).map((word, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Info and History */}
        <div className="space-y-6">
          {/* Game Info */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Game Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-semibold">{gameState.gameMode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Round:</span>
                <span className="font-semibold">{gameState.roundNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Hints Used:</span>
                <span className="font-semibold">{gameState.hintsUsed}</span>
              </div>
            </div>
          </div>

          {/* Chain History */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔤 Chain History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {chainHistory.map((word, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="text-sm text-gray-600">#{index + 1}</span>
                  <span className="font-medium text-gray-800">{word}</span>
                  <span className="text-xs text-gray-500">{word.length} letters</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Info */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Scoring</h3>
            <div className="text-sm space-y-2 text-gray-700">
              <p>• Word length × 10 points</p>
              <p>• Chain length × 5 bonus</p>
              <p>• Streak × 3 bonus</p>
              <p>• Time remaining × 2 bonus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Display */}
      {progress && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Your Best Score</h3>
          <p className="text-2xl font-bold text-primary-600">{progress.score} points</p>
        </div>
      )}
    </div>
  )
}

export default WordChain
