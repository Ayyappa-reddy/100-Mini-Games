import { useState, useEffect, useCallback } from 'react'

interface SnakeGameProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface Position {
  x: number
  y: number
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [snake, setSnake] = useState<Position[]>(initialState?.snake || [{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>(initialState?.food || { x: 15, y: 15 })
  const [direction, setDirection] = useState<string>(initialState?.direction || 'RIGHT')
  const [gameOver, setGameOver] = useState(initialState?.gameOver || false)
  const [score, setScore] = useState(initialState?.score || 0)
  const [gameStarted, setGameStarted] = useState(false)

  const BOARD_SIZE = 20
  const INITIAL_SPEED = 150

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    
    setFood(newFood)
    return newFood
  }, [])

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }]
    const initialFood = generateFood(initialSnake)
    setSnake(initialSnake)
    setDirection('RIGHT')
    setGameOver(false)
    setScore(0)
    setGameStarted(false)
    onUpdate({ snake: initialSnake, direction: 'RIGHT', gameOver: false, score: 0, food: initialFood }, 0)
  }

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return

    setSnake(prevSnake => {
      const newSnake = [...prevSnake]
      const head = { ...newSnake[0] }

      // Calculate new head position
      switch (direction) {
        case 'UP':
          head.y = (head.y - 1 + BOARD_SIZE) % BOARD_SIZE
          break
        case 'DOWN':
          head.y = (head.y + 1) % BOARD_SIZE
          break
        case 'LEFT':
          head.x = (head.x - 1 + BOARD_SIZE) % BOARD_SIZE
          break
        case 'RIGHT':
          head.x = (head.x + 1) % BOARD_SIZE
          break
      }

      // Check collision with self (excluding the tail which will be removed)
      const bodyWithoutTail = newSnake.slice(0, -1)
      if (bodyWithoutTail.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        onComplete(score, false)
        return prevSnake
      }

      newSnake.unshift(head)

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 10
        setScore(newScore)
        const newFood = generateFood(newSnake)
        onUpdate({ snake: newSnake, direction, gameOver, score: newScore, food: newFood }, newScore)
      } else {
        newSnake.pop()
        onUpdate({ snake: newSnake, direction, gameOver, score }, score)
      }

      return newSnake
    })
  }, [direction, gameOver, gameStarted, food, score, generateFood, onComplete, onUpdate])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault() // Prevent default behavior
      
      if (!gameStarted && e.key === ' ') {
        setGameStarted(true)
        return
      }

      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP')
          break
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN')
          break
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT')
          break
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameStarted, gameOver])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const interval = setInterval(moveSnake, INITIAL_SPEED)
    return () => clearInterval(interval)
  }, [moveSnake, gameStarted, gameOver])

  useEffect(() => {
    if (snake.length === 0) {
      const initialSnake = [{ x: 10, y: 10 }]
      const initialFood = generateFood(initialSnake)
      setSnake(initialSnake)
      setFood(initialFood)
    }
  }, [generateFood])

  const renderBoard = () => {
    const board = []
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y)
        const isFood = food.x === x && food.y === y
        const isHead = snake[0]?.x === x && snake[0]?.y === y

        let className = 'w-4 h-4 border border-gray-200'
        if (isSnake) {
          className += isHead ? ' bg-green-600' : ' bg-green-400'
        } else if (isFood) {
          className += ' bg-red-500'
        } else {
          className += ' bg-gray-100'
        }

        board.push(
          <div key={`${x}-${y}`} className={className} />
        )
      }
    }
    return board
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Snake Game</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Score: {score}</div>
          <div className="text-green-600">Length: {snake.length}</div>
        </div>
        
        {!gameStarted && !gameOver && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            <p className="mb-2">Press SPACE to start</p>
            <button
              onClick={() => setGameStarted(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}
        
        {gameOver && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
            Game Over! Final Score: {score}
          </div>
        )}
      </div>

      <div className="flex justify-center mb-6">
        <div 
          className="grid gap-0 border-2 border-gray-300 bg-gray-100"
          style={{ 
            width: `${BOARD_SIZE * 16}px`, 
            height: `${BOARD_SIZE * 16}px`,
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`
          }}
        >
          {renderBoard()}
        </div>
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={resetGame}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          New Game
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Controls</h3>
        <p className="text-sm text-gray-600">
          Use arrow keys to control the snake. Eat the red food to grow and score points!
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

export default SnakeGame 