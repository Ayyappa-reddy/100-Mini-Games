import { useState, useEffect, useRef } from 'react'

interface PatternRecognitionProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface GameItem {
  id: string
  value: string
  isOdd: boolean
  type: 'shape' | 'color' | 'number' | 'letter' | 'object'
}

interface GameRound {
  items: GameItem[]
  oddOneOut: string
  category: string
  difficulty: number
  timeLimit: number
}

const PatternRecognition: React.FC<PatternRecognitionProps> = ({ onComplete, progress }) => {
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [roundNumber, setRoundNumber] = useState(1)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [gameMode, setGameMode] = useState<'shapes' | 'colors' | 'numbers' | 'mixed'>('mixed')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [streak, setStreak] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Shape patterns
  const shapes = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon', 'pentagon', 'heart']
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown']
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

  const objects = [
    'apple', 'banana', 'cherry', 'grape', 'lemon', 'orange', 'peach', 'pear',
    'car', 'bike', 'bus', 'plane', 'ship', 'train', 'truck', 'van',
    'cat', 'dog', 'bird', 'fish', 'frog', 'rabbit', 'snake', 'turtle'
  ]

  // Generate a new round
  const generateRound = (): GameRound => {
    const category = gameMode === 'mixed' ?
      ['shapes', 'colors', 'numbers', 'letters', 'objects'][Math.floor(Math.random() * 5)] :
      gameMode

    const difficultySettings = {
      easy: { itemCount: 6, timeLimit: 15 },
      medium: { itemCount: 8, timeLimit: 12 },
      hard: { itemCount: 10, timeLimit: 10 }
    }

    const settings = difficultySettings[difficulty]
    const itemCount = settings.itemCount

    let items: GameItem[] = []
    let oddOneOut: string = ''

    switch (category) {
      case 'shapes':
        const commonShape = shapes[Math.floor(Math.random() * shapes.length)]
        items = Array.from({ length: itemCount }, (_, i) => ({
          id: `shape-${i}`,
          value: i === Math.floor(Math.random() * itemCount) ? shapes[Math.floor(Math.random() * shapes.length)] : commonShape,
          isOdd: false,
          type: 'shape' as const
        }))
        const oddIndex = Math.floor(Math.random() * itemCount)
        items[oddIndex].isOdd = true
        items[oddIndex].value = shapes.find(s => s !== commonShape) || shapes[0]
        oddOneOut = items[oddIndex].id
        break

      case 'colors':
        const commonColor = colors[Math.floor(Math.random() * colors.length)]
        items = Array.from({ length: itemCount }, (_, i) => ({
          id: `color-${i}`,
          value: i === Math.floor(Math.random() * itemCount) ? colors[Math.floor(Math.random() * colors.length)] : commonColor,
          isOdd: false,
          type: 'color' as const
        }))
        const oddColorIndex = Math.floor(Math.random() * itemCount)
        items[oddColorIndex].isOdd = true
        items[oddColorIndex].value = colors.find(c => c !== commonColor) || colors[0]
        oddOneOut = items[oddColorIndex].id
        break

      case 'numbers':
        const commonNumber = numbers[Math.floor(Math.random() * numbers.length)]
        items = Array.from({ length: itemCount }, (_, i) => ({
          id: `number-${i}`,
          value: i === Math.floor(Math.random() * itemCount) ? numbers[Math.floor(Math.random() * numbers.length)] : commonNumber,
          isOdd: false,
          type: 'number' as const
        }))
        const oddNumberIndex = Math.floor(Math.random() * itemCount)
        items[oddNumberIndex].isOdd = true
        items[oddNumberIndex].value = numbers.find(n => n !== commonNumber) || numbers[0]
        oddOneOut = items[oddNumberIndex].id
        break

      case 'letters':
        const commonLetter = letters[Math.floor(Math.random() * letters.length)]
        items = Array.from({ length: itemCount }, (_, i) => ({
          id: `letter-${i}`,
          value: i === Math.floor(Math.random() * itemCount) ? letters[Math.floor(Math.random() * letters.length)] : commonLetter,
          isOdd: false,
          type: 'letter' as const
        }))
        const oddLetterIndex = Math.floor(Math.random() * itemCount)
        items[oddLetterIndex].isOdd = true
        items[oddLetterIndex].value = letters.find(l => l !== commonLetter) || letters[0]
        oddOneOut = items[oddLetterIndex].id
        break

      case 'objects':
        const commonObject = objects[Math.floor(Math.random() * 8)] // First 8 are fruits
        items = Array.from({ length: itemCount }, (_, i) => ({
          id: `object-${i}`,
          value: i === Math.floor(Math.random() * itemCount) ? objects[Math.floor(Math.random() * objects.length)] : commonObject,
          isOdd: false,
          type: 'object' as const
        }))
        const oddObjectIndex = Math.floor(Math.random() * itemCount)
        items[oddObjectIndex].isOdd = true
        items[oddObjectIndex].value = objects.find(o => o !== commonObject) || objects[0]
        oddOneOut = items[oddObjectIndex].id
        break

      default:
        items = []
    }

    return {
      items,
      oddOneOut,
      category,
      difficulty: settings.itemCount,
      timeLimit: settings.timeLimit
    }
  }

  // Start the game
  const startGame = () => {
    const newRound = generateRound()
    setCurrentRound(newRound)
    setSelectedAnswer(null)
    setIsPlaying(true)
    setTimeLeft(newRound.timeLimit)
    setShowResult(false)
    startTimeRef.current = Date.now()

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Handle answer selection
  const handleAnswerSelect = (itemId: string) => {
    if (!isPlaying || showResult) return

    setSelectedAnswer(itemId)
    setShowResult(true)
    setIsPlaying(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const isCorrect = itemId === currentRound?.oddOneOut
    const timeBonus = Math.max(0, timeLeft * 10)
    const streakBonus = streak * 5

    if (isCorrect) {
      const roundScore = 100 + timeBonus + streakBonus
      setScore(prev => prev + roundScore)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    // Auto-advance to next round after 2 seconds
    setTimeout(() => {
      nextRound()
    }, 2000)
  }

  // Handle time up
  const handleTimeUp = () => {
    if (!isPlaying) return

    setSelectedAnswer(null)
    setShowResult(true)
    setIsPlaying(false)
    setStreak(0)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setTimeout(() => {
      nextRound()
    }, 2000)
  }

  // Next round
  const nextRound = () => {
    if (roundNumber >= 10) {
      // Game over
      onComplete(score, true)
      return
    }

    setRoundNumber(prev => prev + 1)
    startGame()
  }

  // Reset game
  const resetGame = () => {
    setRoundNumber(1)
    setScore(0)
    setStreak(0)
    setCurrentRound(null)
    setSelectedAnswer(null)
    setIsPlaying(false)
    setShowResult(false)
    setTimeLeft(0)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // Get item display
  const getItemDisplay = (item: GameItem) => {
    switch (item.type) {
      case 'shape':
        return getShapeIcon(item.value)
      case 'color':
        return getColorIcon(item.value)
      case 'number':
        return item.value
      case 'letter':
        return item.value
      case 'object':
        return getObjectIcon(item.value)
      default:
        return item.value
    }
  }

  // Shape icons
  const getShapeIcon = (shape: string) => {
    const shapes = {
      circle: '●',
      square: '■',
      triangle: '▲',
      diamond: '◆',
      star: '★',
      hexagon: '⬡',
      pentagon: '⬟',
      heart: '♥'
    }
    return shapes[shape as keyof typeof shapes] || '●'
  }

  // Color display
  const getColorIcon = (color: string) => {
    return (
      <div
        className="w-8 h-8 rounded-full border-2 border-gray-300"
        style={{ backgroundColor: color }}
      />
    )
  }

  // Object icons/emojis
  const getObjectIcon = (object: string) => {
    const objectEmojis: { [key: string]: string } = {
      apple: '🍎', banana: '🍌', cherry: '🍒', grape: '🍇',
      lemon: '🍋', orange: '🍊', peach: '🍑', pear: '🍐',
      car: '🚗', bike: '🚲', bus: '🚌', plane: '✈️',
      ship: '🚢', train: '🚂', truck: '🚛', van: '🚐',
      cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐟',
      frog: '🐸', rabbit: '🐰', snake: '🐍', turtle: '🐢'
    }
    return objectEmojis[object] || '❓'
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">🧠 Pattern Recognition</h2>

      {/* Game Stats */}
      {!isPlaying && !currentRound && (
        <div className="flex justify-center space-x-8 mb-6 text-lg">
          <div className="text-blue-600">Best Score: {progress?.score || 0}</div>
        </div>
      )}

      {isPlaying && (
        <div className="flex justify-center space-x-8 mb-6 text-lg">
          <div className="text-blue-600">Round: {roundNumber}/10</div>
          <div className="text-green-600">Score: {score}</div>
          <div className="text-purple-600">Streak: {streak}</div>
          <div className={`text-lg font-bold ${timeLeft <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
            Time: {timeLeft}s
          </div>
        </div>
      )}

      {!isPlaying && !currentRound && (
        <>
          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-4">🎯 Find the Odd One Out!</h3>
            <p className="text-blue-800 text-sm mb-4">
              Look at the items below and click on the one that doesn't belong with the others.
              Find it quickly to earn bonus points!
            </p>

            {/* Game Mode Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => setGameMode('shapes')}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  gameMode === 'shapes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔺 Shapes
              </button>
              <button
                onClick={() => setGameMode('colors')}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  gameMode === 'colors' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎨 Colors
              </button>
              <button
                onClick={() => setGameMode('numbers')}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  gameMode === 'numbers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔢 Numbers
              </button>
              <button
                onClick={() => setGameMode('mixed')}
                className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                  gameMode === 'mixed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎭 Mixed
              </button>
            </div>

            {/* Difficulty Selection */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setDifficulty('easy')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  difficulty === 'easy' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🌱 Easy
              </button>
              <button
                onClick={() => setDifficulty('medium')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  difficulty === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔥 Medium
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  difficulty === 'hard' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                💀 Hard
              </button>
            </div>

            <button
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-green-700 transition-colors"
            >
              🎮 Start Game
            </button>
          </div>
        </>
      )}

      {currentRound && (
        <>
          {/* Round Info */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Round {roundNumber}: {currentRound.category.charAt(0).toUpperCase() + currentRound.category.slice(1)} Pattern
            </h3>
            <p className="text-gray-700 text-sm">
              Click on the item that doesn't belong with the others!
            </p>
          </div>

          {/* Game Items */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 justify-items-center">
            {currentRound.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAnswerSelect(item.id)}
                disabled={!isPlaying || showResult}
                className={`w-20 h-20 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                  showResult && item.id === currentRound.oddOneOut
                    ? 'bg-green-200 border-green-500 scale-110'
                    : showResult && item.id === selectedAnswer && item.id !== currentRound.oddOneOut
                    ? 'bg-red-200 border-red-500'
                    : selectedAnswer === item.id
                    ? 'bg-blue-200 border-blue-500 scale-105'
                    : 'bg-white border-gray-300 hover:bg-gray-50 hover:scale-105'
                } ${!isPlaying && 'cursor-not-allowed opacity-75'}`}
              >
                {getItemDisplay(item)}
              </button>
            ))}
          </div>

          {/* Result Feedback */}
          {showResult && (
            <div className={`text-2xl font-bold mb-4 ${
              selectedAnswer === currentRound.oddOneOut ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedAnswer === currentRound.oddOneOut ? (
                <div>🎉 Correct! Well done!</div>
              ) : selectedAnswer === null ? (
                <div>⏰ Time's up! The odd one out was highlighted.</div>
              ) : (
                <div>❌ Wrong! The odd one out was highlighted.</div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetGame}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              🔄 Reset Game
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default PatternRecognition
