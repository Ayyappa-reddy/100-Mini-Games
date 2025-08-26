import { useState, useEffect, useRef, useCallback } from 'react'

interface FlappyBirdProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface Bird {
  y: number
  velocity: number
}

interface Pipe {
  x: number
  topHeight: number
  bottomY: number
  passed: boolean
}

const FlappyBird: React.FC<FlappyBirdProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu')
  const [bird, setBird] = useState<Bird>({ y: 250, velocity: 0 })
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(initialState?.highScore || progress?.score || 0)
  const [pipeGap, setPipeGap] = useState(150) // Gap between top and bottom pipes
  const [pipeSpeed, setPipeSpeed] = useState(2) // How fast pipes move left

  const CANVAS_WIDTH = 400
  const CANVAS_HEIGHT = 600
  const BIRD_SIZE = 20
  const PIPE_WIDTH = 60
  const GRAVITY = 0.4
  const JUMP_FORCE = -8
  const PIPE_SPAWN_DISTANCE = 250

  // Initialize game
  const initGame = useCallback(() => {
    setBird({ y: CANVAS_HEIGHT / 2, velocity: 0 })
    setPipes([])
    setScore(0)
    setPipeGap(150)
    setPipeSpeed(2)
    setGameState('playing')
  }, [])

  // Handle bird jump
  const jump = useCallback(() => {
    if (gameState === 'playing') {
      setBird(prev => ({ ...prev, velocity: JUMP_FORCE }))
    }
  }, [gameState])

  // Handle click/tap
  const handleClick = useCallback(() => {
    if (gameState === 'menu') {
      initGame()
    } else if (gameState === 'gameOver') {
      initGame()
    } else {
      jump()
    }
  }, [gameState, initGame, jump])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleClick()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleClick])

  // Spawn new pipes
  const spawnPipe = useCallback(() => {
    const minTopHeight = 50
    const maxTopHeight = CANVAS_HEIGHT - pipeGap - 100
    const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight
    const bottomY = topHeight + pipeGap

    const newPipe: Pipe = {
      x: CANVAS_WIDTH,
      topHeight,
      bottomY,
      passed: false
    }

    setPipes(prev => [...prev, newPipe])
  }, [pipeGap])

  // Check collision
  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // Check ground and ceiling collision
    if (bird.y + BIRD_SIZE >= CANVAS_HEIGHT || bird.y <= 0) {
      return true
    }

    // Check pipe collision
    for (const pipe of pipes) {
      if (
        bird.y < pipe.topHeight ||
        bird.y + BIRD_SIZE > pipe.bottomY
      ) {
        if (
          bird.y + BIRD_SIZE > 0 &&
          bird.y < CANVAS_HEIGHT &&
          pipe.x < 50 + BIRD_SIZE / 2 &&
          pipe.x + PIPE_WIDTH > 50 - BIRD_SIZE / 2
        ) {
          return true
        }
      }
    }

    return false
  }, [])

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState !== 'playing') return

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    // Update bird physics
    setBird(prev => ({
      y: prev.y + prev.velocity,
      velocity: prev.velocity + GRAVITY
    }))

    // Update pipes
    setPipes(prev => {
      let newPipes = prev.map(pipe => ({
        ...pipe,
        x: pipe.x - pipeSpeed
      }))

      // Remove off-screen pipes
      newPipes = newPipes.filter(pipe => pipe.x + PIPE_WIDTH > 0)

      // Spawn new pipes
      const lastPipe = newPipes[newPipes.length - 1]
      if (!lastPipe || lastPipe.x < CANVAS_WIDTH - PIPE_SPAWN_DISTANCE) {
        const minTopHeight = 50
        const maxTopHeight = CANVAS_HEIGHT - pipeGap - 100
        const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight
        const bottomY = topHeight + pipeGap

        newPipes.push({
          x: CANVAS_WIDTH,
          topHeight,
          bottomY,
          passed: false
        })
      }

      return newPipes
    })

    // Check for scoring and pipe passing
    setPipes(prev => {
      return prev.map(pipe => {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
          setScore(current => current + 1)
          return { ...pipe, passed: true }
        }
        return pipe
      })
    })

    // Update difficulty
    setScore(prev => {
      const newScore = prev
      if (newScore > 0 && newScore % 5 === 0) {
        setPipeGap(current => Math.max(current - 10, 100))
        setPipeSpeed(current => Math.min(current + 0.2, 4))
      }
      return newScore
    })

    // Check collision
    setBird(currentBird => {
      setPipes(currentPipes => {
        if (checkCollision(currentBird, currentPipes)) {
          setGameState('gameOver')
          if (score > highScore) {
            setHighScore(score)
            onComplete(score, true)
          }
          return currentPipes
        }
        return currentPipes
      })
      return currentBird
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, checkCollision, pipeGap, pipeSpeed, score, highScore, onComplete])

  // Start game loop when playing
  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = performance.now()
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, gameLoop])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (gameState === 'menu') {
      // Draw title
      ctx.fillStyle = '#2D3748'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('FLAPPY BIRD', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)

      ctx.font = '16px Arial'
      ctx.fillText('Click or Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.fillText('Navigate through the pipes!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)
    } else {
      // Draw background
      ctx.fillStyle = '#87CEEB'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw pipes
      pipes.forEach(pipe => {
        ctx.fillStyle = '#228B22'
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight)
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, CANVAS_HEIGHT - pipe.bottomY)

        // Pipe caps
        ctx.fillStyle = '#32CD32'
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20)
        ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 20)
      })

      // Draw bird
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(50, bird.y + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()

      // Bird eye
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(55, bird.y + BIRD_SIZE / 2 - 3, 2, 0, Math.PI * 2)
      ctx.fill()

      // Bird beak
      ctx.fillStyle = '#FFA500'
      ctx.beginPath()
      ctx.moveTo(60, bird.y + BIRD_SIZE / 2)
      ctx.lineTo(70, bird.y + BIRD_SIZE / 2 - 2)
      ctx.lineTo(70, bird.y + BIRD_SIZE / 2 + 2)
      ctx.closePath()
      ctx.fill()

      // Draw ground
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20)

      // Draw score
      ctx.fillStyle = '#FFF'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 50)
      ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 50)
    }

    if (gameState === 'gameOver') {
      // Game over overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = '#FFF'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)

      ctx.font = 'bold 24px Arial'
      ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.fillText(`Best: ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40)

      ctx.font = '16px Arial'
      ctx.fillText('Click to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80)
    }
  }, [gameState, bird, pipes, score, highScore])

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">🐦 Flappy Bird</h2>

      {/* Game Stats */}
      {gameState === 'playing' && (
        <div className="flex justify-center space-x-8 mb-4 text-lg">
          <div className="text-blue-600">Score: {score}</div>
          <div className="text-green-600">Best: {highScore}</div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How to Play</h3>
        <p className="text-blue-800 text-sm">
          Click or press SPACE to make the bird flap and fly! Navigate through the pipes without touching them or the ground.
          Each pipe you pass gives you 1 point. The difficulty increases as your score grows!
        </p>
      </div>

      {/* Game Canvas */}
      <div className="flex justify-center mb-6">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleClick}
          className="border-4 border-gray-400 rounded-lg cursor-pointer bg-gray-100"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Controls Info */}
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">🎮 Controls</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded">SPACE</kbd>
            <span>or Click to flap</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>Avoid pipes and ground!</span>
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

export default FlappyBird
