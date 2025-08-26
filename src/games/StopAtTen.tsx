import { useState, useEffect, useRef } from 'react'

interface StopAtTenProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface GameState {
  isRunning: boolean
  currentTime: number
  targetTime: number
  isStopped: boolean
  roundsPlayed: number
  bestAccuracy: number
  totalScore: number
}

const StopAtTen: React.FC<StopAtTenProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [gameState, setGameState] = useState<GameState>(initialState || {
    isRunning: false,
    currentTime: 0,
    targetTime: 10,
    isStopped: false,
    roundsPlayed: 0,
    bestAccuracy: 100,
    totalScore: 0
  })

  const [score, setScore] = useState(initialState?.score || 0)
  const [roundsCompleted, setRoundsCompleted] = useState(0)
  const [lastResult, setLastResult] = useState<{
    stoppedAt: number
    accuracy: number
    points: number
    message: string
  } | null>(null)
  const [gameActive, setGameActive] = useState(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const targetTime = 10.000

  const startTimer = () => {
    setGameState(prev => ({
      ...prev,
      isRunning: true,
      currentTime: 0,
      isStopped: false
    }))
    
    startTimeRef.current = Date.now()
    
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      setGameState(prev => ({
        ...prev,
        currentTime: elapsed
      }))
    }, 10) // Update every 10ms for smooth millisecond display
  }

  const stopTimer = () => {
    if (!gameState.isRunning || gameState.isStopped) return
    
    clearInterval(timerRef.current!)
    timerRef.current = null
    
    const stoppedAt = gameState.currentTime
    const accuracy = calculateAccuracy(stoppedAt)
    const points = calculatePoints(stoppedAt)
    const message = getResultMessage(stoppedAt)
    
    const newScore = score + points
    const newRoundsCompleted = roundsCompleted + 1
    
    setScore(newScore)
    setRoundsCompleted(newRoundsCompleted)
    setGameActive(false)
    
    setLastResult({
      stoppedAt,
      accuracy,
      points,
      message
    })
    
    setGameState(prev => ({
      ...prev,
      isRunning: false,
      isStopped: true,
      roundsPlayed: prev.roundsPlayed + 1,
      bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
      totalScore: prev.totalScore + points
    }))
    
    // Check if game is complete (5 rounds)
    if (newRoundsCompleted >= 5) {
      onComplete(newScore, true)
    }
    
    onUpdate({
      isRunning: false,
      isStopped: true,
      currentTime: stoppedAt,
      roundsPlayed: gameState.roundsPlayed + 1,
      bestAccuracy: Math.max(gameState.bestAccuracy, accuracy),
      totalScore: gameState.totalScore + points
    }, newScore)
  }

  const calculateAccuracy = (stoppedAt: number): number => {
    const difference = Math.abs(stoppedAt - targetTime)
    // For millisecond precision, use much stricter tolerance
    // 0.1 seconds = 100ms tolerance for 100% accuracy
    const maxDifference = 0.1
    const accuracy = Math.max(0, 100 - (difference / maxDifference) * 100)
    return Math.round(accuracy * 100) / 100 // Round to 2 decimal places
  }

  const calculatePoints = (stoppedAt: number): number => {
    const difference = Math.abs(stoppedAt - targetTime)
    
    // Millisecond-based scoring for precision
    if (difference <= 0.001) return 100      // Perfect: within 1ms
    if (difference <= 0.010) return 95       // Excellent: within 10ms
    if (difference <= 0.050) return 90       // Great: within 50ms
    if (difference <= 0.100) return 80       // Good: within 100ms
    if (difference <= 0.200) return 70       // Fair: within 200ms
    if (difference <= 0.500) return 60       // Okay: within 500ms
    if (difference <= 1.000) return 50       // Poor: within 1 second
    if (difference <= 2.000) return 30       // Bad: within 2 seconds
    if (difference <= 3.000) return 20       // Very bad: within 3 seconds
    return Math.max(1, Math.floor(10 - difference)) // At least 1 point
  }

  const getResultMessage = (stoppedAt: number): string => {
    const difference = Math.abs(stoppedAt - targetTime)
    
    if (difference <= 0.001) return "🎯 PERFECT TIMING! 🎯"
    if (difference <= 0.010) return "🔥 EXCELLENT! 🔥"
    if (difference <= 0.050) return "⭐ GREAT JOB! ⭐"
    if (difference <= 0.100) return "👍 GOOD TIMING! 👍"
    if (difference <= 0.200) return "😊 NOT BAD! 😊"
    if (difference <= 0.500) return "🤔 CLOSE ENOUGH! 🤔"
    if (difference <= 1.000) return "😅 KEEP TRYING! 😅"
    if (difference <= 2.000) return "😬 NEED PRACTICE! 😬"
    if (difference <= 3.000) return "😵 WAY OFF! 😵"
    return "💀 WHAT HAPPENED? 💀"
  }

  const nextRound = () => {
    setGameState(prev => ({
      ...prev,
      isRunning: false,
      currentTime: 0,
      isStopped: false
    }))
    setLastResult(null)
    setGameActive(true)
    
    onUpdate({
      isRunning: false,
      isStopped: false,
      currentTime: 0,
      roundsPlayed: gameState.roundsPlayed,
      bestAccuracy: gameState.bestAccuracy,
      totalScore: gameState.totalScore
    }, score)
  }

  const resetGame = () => {
    clearInterval(timerRef.current!)
    timerRef.current = null
    
    const newState = {
      isRunning: false,
      currentTime: 0,
      targetTime: 10,
      isStopped: false,
      roundsPlayed: 0,
      bestAccuracy: 100,
      totalScore: 0
    }
    
    setGameState(newState)
    setScore(0)
    setRoundsCompleted(0)
    setLastResult(null)
    setGameActive(true)
    
    onUpdate(newState, 0)
  }

  const formatTime = (time: number): string => {
    return time.toFixed(3)
  }

  const getProgressPercentage = (): number => {
    return Math.min((gameState.currentTime / targetTime) * 100, 100)
  }

  const getProgressColor = (): string => {
    const percentage = getProgressPercentage()
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    if (percentage >= 60) return 'bg-orange-500'
    if (percentage >= 40) return 'bg-blue-500'
    return 'bg-green-500'
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">⏱️ Stop at 10 Seconds</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Score: {score}</div>
          <div className="text-green-600">Rounds: {roundsCompleted}/5</div>
          <div className="text-purple-600">Best: {gameState.bestAccuracy.toFixed(1)}%</div>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-8 mb-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            {gameState.isRunning ? '⏰ Timer Running...' : 
             gameState.isStopped ? '⏹️ Timer Stopped' : '🎯 Ready to Start'}
          </h3>
          
          {/* Large Timer Display */}
          <div className="text-8xl font-mono font-bold text-gray-900 mb-4">
            {formatTime(gameState.currentTime)}
          </div>
          
          {/* Target Display */}
          <div className="text-xl text-gray-600 mb-6">
            Target: <span className="font-bold text-green-600">10.000</span> seconds
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className={`h-4 rounded-full transition-all duration-100 ${getProgressColor()}`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          {/* Game Controls */}
          {!gameState.isRunning && !gameState.isStopped && (
            <button
              onClick={startTimer}
              disabled={!gameActive}
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Start Timer
            </button>
          )}
          
          {gameState.isRunning && (
            <button
              onClick={stopTimer}
              disabled={!gameActive}
              className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏹️ STOP NOW!
            </button>
          )}
        </div>
      </div>

      {/* Last Result Display */}
      {lastResult && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-center text-yellow-800 mb-4">🎯 Round Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">You Stopped At</h4>
              <div className="text-3xl font-bold text-blue-600">{formatTime(lastResult.stoppedAt)}s</div>
              <p className="text-sm text-gray-600">Target: 10.000s</p>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Difference</h4>
              <div className="text-2xl font-bold text-red-600">±{Math.abs(lastResult.stoppedAt - 10).toFixed(3)}s</div>
              <p className="text-sm text-gray-600">Off by milliseconds</p>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Accuracy</h4>
              <div className="text-3xl font-bold text-green-600">{lastResult.accuracy.toFixed(1)}%</div>
              <p className="text-sm text-gray-600">How close you were</p>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Points Earned</h4>
              <div className="text-3xl font-bold text-purple-600">+{lastResult.points}</div>
              <p className="text-sm text-gray-600">Based on precision</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-700 mb-4">{lastResult.message}</div>
            
            {roundsCompleted < 5 && (
              <button
                onClick={nextRound}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🎯 Next Round
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="text-center space-x-4">
        <button
          onClick={resetGame}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          🔄 New Game
        </button>
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

export default StopAtTen
