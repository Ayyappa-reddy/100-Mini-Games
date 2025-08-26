import { useState, useEffect } from 'react'

interface SimonSaysProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface Color {
  id: number
  name: string
  color: string
  bgColor: string
  hoverColor: string
}

const SimonSays: React.FC<SimonSaysProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [sequence, setSequence] = useState<number[]>(initialState?.sequence || [])
  const [playerSequence, setPlayerSequence] = useState<number[]>(initialState?.playerSequence || [])
  const [score, setScore] = useState(initialState?.score || 0)
  const [level, setLevel] = useState(initialState?.level || 1)
  const [isPlaying, setIsPlaying] = useState(initialState?.isPlaying || false)
  const [isShowingSequence, setIsShowingSequence] = useState(initialState?.isShowingSequence || false)
  const [gameOver, setGameOver] = useState(initialState?.gameOver || false)
  const [activeColor, setActiveColor] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState(initialState?.gameStarted || false)

  const colors: Color[] = [
    { id: 0, name: 'Red', color: 'bg-red-500', bgColor: 'bg-red-700 shadow-lg scale-110', hoverColor: 'hover:bg-red-400' },
    { id: 1, name: 'Blue', color: 'bg-blue-500', bgColor: 'bg-blue-700 shadow-lg scale-110', hoverColor: 'hover:bg-blue-400' },
    { id: 2, name: 'Green', color: 'bg-green-500', bgColor: 'bg-green-700 shadow-lg scale-110', hoverColor: 'hover:bg-green-400' },
    { id: 3, name: 'Yellow', color: 'bg-yellow-500', bgColor: 'bg-yellow-700 shadow-lg scale-110', hoverColor: 'hover:bg-yellow-400' }
  ]

  const generateSequence = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 4))
  }

  const startNewLevel = () => {
    const newSequence = generateSequence(level + 2)
    setSequence(newSequence)
    setPlayerSequence([])
    setIsPlaying(false)
    setIsShowingSequence(true)
    setGameOver(false)
    setGameStarted(true)
    
    onUpdate({ 
      sequence: newSequence, 
      playerSequence: [], 
      score, 
      level, 
      isPlaying: false, 
      isShowingSequence: true, 
      gameOver: false,
      gameStarted: true
    }, score)
  }

  const showSequence = async () => {
    for (let i = 0; i < sequence.length; i++) {
      setActiveColor(sequence[i])
      await new Promise(resolve => setTimeout(resolve, 1000)) // Even slower for better visibility
      setActiveColor(null)
      await new Promise(resolve => setTimeout(resolve, 400)) // Longer pause between colors
    }
    setIsShowingSequence(false)
    setIsPlaying(true)
    onUpdate({ 
      sequence, 
      playerSequence, 
      score, 
      level, 
      isPlaying: true, 
      isShowingSequence: false, 
      gameOver,
      gameStarted
    }, score)
  }

  useEffect(() => {
    if (sequence.length === 0) {
      // Don't auto-start, wait for user to click start
    }
  }, [])

  useEffect(() => {
    if (isShowingSequence) {
      showSequence()
    }
  }, [isShowingSequence])

  const handleColorClick = (colorId: number) => {
    if (!isPlaying || isShowingSequence || !gameStarted) return

    const newPlayerSequence = [...playerSequence, colorId]
    setPlayerSequence(newPlayerSequence)

    // Check if the sequence is correct so far
    const isCorrect = newPlayerSequence.every((color, index) => color === sequence[index])

    if (!isCorrect) {
      // Game over
      setGameOver(true)
      setIsPlaying(false)
      onComplete(score, false)
      onUpdate({ 
        sequence, 
        playerSequence: newPlayerSequence, 
        score, 
        level, 
        isPlaying: false, 
        isShowingSequence, 
        gameOver: true 
      }, score)
    } else if (newPlayerSequence.length === sequence.length) {
      // Level completed
      const newScore = score + (level * 10)
      const newLevel = level + 1
      setScore(newScore)
      setLevel(newLevel)
      
      onUpdate({ 
        sequence, 
        playerSequence: newPlayerSequence, 
        score: newScore, 
        level: newLevel, 
        isPlaying: false, 
        isShowingSequence, 
        gameOver 
      }, newScore)
      
      // Start next level after a short delay
      setTimeout(() => {
        startNewLevel()
      }, 1000)
    } else {
      onUpdate({ 
        sequence, 
        playerSequence: newPlayerSequence, 
        score, 
        level, 
        isPlaying, 
        isShowingSequence, 
        gameOver 
      }, score)
    }
  }

  const resetGame = () => {
    setScore(0)
    setLevel(1)
    setSequence([])
    setPlayerSequence([])
    setIsPlaying(false)
    setIsShowingSequence(false)
    setGameOver(false)
    setGameStarted(false)
    setActiveColor(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Simon Says</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Level: {level}</div>
          <div className="text-primary-600">Score: {score}</div>
        </div>
        
        {!gameStarted && !gameOver && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            <p className="mb-2">Ready to play Simon Says?</p>
            <button
              onClick={startNewLevel}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}
        
        {isShowingSequence && gameStarted && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            🎵 Watch the sequence...
          </div>
        )}
        
        {isPlaying && gameStarted && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
            🎮 Repeat the sequence!
          </div>
        )}
        
        {gameOver && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
            ❌ Game Over! Final Score: {score}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto relative">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorClick(color.id)}
            disabled={!isPlaying || isShowingSequence || !gameStarted}
            className={`
              w-32 h-32 rounded-full border-4 border-white shadow-lg transition-all duration-300
              ${activeColor === color.id ? color.bgColor : color.color}
              ${isPlaying && !isShowingSequence && gameStarted ? color.hoverColor : ''}
              ${!isPlaying || isShowingSequence || !gameStarted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="sr-only">{color.name}</span>
            {activeColor === color.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={resetGame}
          className="bg-secondary-600 text-white px-6 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
        >
          New Game
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
        <p className="text-sm text-gray-600">
          Watch the sequence of colors and repeat it! The sequence gets longer with each level.
          You get 10 points per level completed. Don't make a mistake!
        </p>
      </div>

      {progress && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Your Best Score</h3>
          <p className="text-2xl font-bold text-primary-600">{progress.score} points</p>
        </div>
      )}
    </div>
  )
}

export default SimonSays
