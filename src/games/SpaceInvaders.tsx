import { useState, useEffect, useRef, useCallback } from 'react'

interface SpaceInvadersProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface Alien {
  id: string
  x: number
  y: number
  type: 'basic' | 'fast' | 'tough'
  alive: boolean
}

interface Bullet {
  id: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  isPlayerBullet: boolean
}

interface PowerUp {
  id: string
  x: number
  y: number
  type: 'rapidFire' | 'tripleShot' | 'extraLife'
}

interface GameState {
  playerX: number
  aliens: Alien[]
  bullets: Bullet[]
  powerUps: PowerUp[]
  lives: number
  score: number
  wave: number
  alienDirection: 1 | -1
  alienDropDistance: number
  gameStatus: 'playing' | 'gameOver' | 'waveComplete'
  lastShotTime: number
  powerUp: 'rapidFire' | 'tripleShot' | null
}

const SpaceInvaders: React.FC<SpaceInvadersProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())

  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 400
  const PLAYER_WIDTH = 40
  const PLAYER_HEIGHT = 20
  const ALIEN_WIDTH = 30
  const ALIEN_HEIGHT = 20
  const BULLET_WIDTH = 4
  const BULLET_HEIGHT = 8
  const PLAYER_SPEED = 5
  const BULLET_SPEED = 7
  const ALIEN_SPEED = 1

  const [gameState, setGameState] = useState<GameState>(initialState || {
    playerX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    aliens: [],
    bullets: [],
    powerUps: [],
    lives: 3,
    score: 0,
    wave: 1,
    alienDirection: 1,
    alienDropDistance: 0,
    gameStatus: 'playing',
    lastShotTime: 0,
    powerUp: null
  })

  const [frameCount, setFrameCount] = useState(0)
  const [testX, setTestX] = useState(0)

  // Initialize aliens for a wave
  const createWave = useCallback((wave: number): Alien[] => {
    const aliens: Alien[] = []
    const rows = Math.min(3 + Math.floor(wave / 2), 6)
    const cols = Math.min(8 + Math.floor(wave / 3), 12)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let type: 'basic' | 'fast' | 'tough' = 'basic'
        if (row === 0) type = 'tough' // Top row is toughest
        else if (row === 1) type = 'fast' // Second row is fast

        aliens.push({
          id: `alien-${row}-${col}`,
          x: 100 + col * (ALIEN_WIDTH + 20), // More spacing, visible position
          y: 80 + row * (ALIEN_HEIGHT + 20), // Lower starting position
          type,
          alive: true
        })
      }
    }

    return aliens
  }, [])

  // Initialize game
  const initGame = useCallback(() => {
    const newAliens = createWave(1)
    setGameState({
      playerX: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      aliens: newAliens,
      bullets: [],
      powerUps: [],
      lives: 3,
      score: 0,
      wave: 1,
      alienDirection: 1,
      alienDropDistance: 0,
      gameStatus: 'playing',
      lastShotTime: 0,
      powerUp: null
    })
  }, [createWave])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      if (e.code === 'Space') {
        e.preventDefault()
        shoot()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Shoot bullet
  const shoot = useCallback(() => {
    if (gameState.gameStatus !== 'playing') {
      console.log('Cannot shoot - game not playing')
      return
    }

    const currentTime = Date.now()
    const timeSinceLastShot = currentTime - gameState.lastShotTime
    const fireRate = gameState.powerUp === 'rapidFire' ? 150 : 300 // ms between shots

    console.log(`Shooting attempt - time since last shot: ${timeSinceLastShot}ms`)

    if (timeSinceLastShot < fireRate) {
      console.log('Cannot shoot - rate limited')
      return
    }

    const bullets: Bullet[] = []

    if (gameState.powerUp === 'tripleShot') {
      console.log('Creating triple shot - side by side')
      // Triple shot - side by side, no spread
      bullets.push({
        id: `player-${currentTime}-left`,
        x: gameState.playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2 - 15,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
        velocityX: 0, // No horizontal movement
        velocityY: -BULLET_SPEED,
        isPlayerBullet: true
      })
      bullets.push({
        id: `player-${currentTime}-center`,
        x: gameState.playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
        velocityX: 0, // No horizontal movement
        velocityY: -BULLET_SPEED,
        isPlayerBullet: true
      })
      bullets.push({
        id: `player-${currentTime}-right`,
        x: gameState.playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2 + 15,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
        velocityX: 0, // No horizontal movement
        velocityY: -BULLET_SPEED,
        isPlayerBullet: true
      })
    } else {
      console.log('Creating single shot - straight up only')
      // Single shot - straight up only
      bullets.push({
        id: `player-${currentTime}`,
        x: gameState.playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
        velocityX: 0, // NO horizontal movement at all
        velocityY: -BULLET_SPEED,
        isPlayerBullet: true
      })
    }

    console.log(`Created ${bullets.length} bullets at positions:`, bullets.map(b => ({x: b.x, y: b.y})))

    setGameState(prev => ({
      ...prev,
      bullets: [...prev.bullets, ...bullets],
      lastShotTime: currentTime
    }))
  }, [gameState.gameStatus, gameState.playerX, gameState.lastShotTime, gameState.powerUp])

  // Alien shoot
  const alienShoot = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return

    const aliveAliens = gameState.aliens.filter(alien => alien.alive)
    if (aliveAliens.length === 0) return

    // Random alien shoots
    const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)]

    const alienBullet: Bullet = {
      id: `alien-${Date.now()}`,
      x: shooter.x + ALIEN_WIDTH / 2 - BULLET_WIDTH / 2,
      y: shooter.y + ALIEN_HEIGHT,
      velocityX: 0, // NO horizontal movement - straight down only
      velocityY: BULLET_SPEED * 0.3, // Move down
      isPlayerBullet: false
    }

    setGameState(prev => ({
      ...prev,
      bullets: [...prev.bullets, alienBullet]
    }))
  }, [gameState.aliens, gameState.gameStatus])

  // Alien shooting timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.gameStatus === 'playing' && Math.random() < 0.02) {
        alienShoot()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [alienShoot, gameState.gameStatus])

  // Game loop
  const gameLoop = useCallback(() => {
    console.log('Game loop running!')

    setFrameCount(prev => {
      console.log('Frame count:', prev + 1)
      return prev + 1
    })

    setGameState(prev => {
      if (prev.gameStatus !== 'playing') {
        console.log('Game not playing, status:', prev.gameStatus)
        return prev
      }

      console.log('Game state before update:', {
        bullets: prev.bullets.length,
        aliens: prev.aliens.filter(a => a.alive).length,
        playerX: prev.playerX
      })

      let newState = { ...prev }

      // Move player
      if (keysRef.current.has('ArrowLeft') && newState.playerX > 0) {
        newState.playerX = Math.max(0, newState.playerX - PLAYER_SPEED)
      }
      if (keysRef.current.has('ArrowRight') && newState.playerX < CANVAS_WIDTH - PLAYER_WIDTH) {
        newState.playerX = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, newState.playerX + PLAYER_SPEED)
      }

      // Update test animation
      setTestX(prev => (prev + 2) % CANVAS_WIDTH)

          // Move bullets - VERTICAL ONLY (no horizontal movement)
      newState.bullets = newState.bullets.map(bullet => {
        const oldY = bullet.y
        const newBullet = { ...bullet }

        // Only apply vertical movement - NO horizontal movement at all
        newBullet.y += newBullet.velocityY

        // Debug: Log bullet movement occasionally
        if (Math.random() < 0.05 && bullet.isPlayerBullet) {
          console.log(`Player bullet moved vertically from ${oldY} to ${newBullet.y}`)
        }

        return newBullet
      }).filter(bullet =>
        bullet.y > -BULLET_HEIGHT && bullet.y < CANVAS_HEIGHT + BULLET_HEIGHT
      )

      // Debug: Log bullet count occasionally
      if (Math.random() < 0.02) {
        console.log(`Bullets on screen: ${newState.bullets.length}`)
      }

      // Move aliens
      const aliveAliens = newState.aliens.filter(alien => alien.alive)
      if (aliveAliens.length > 0) {
        const leftMost = Math.min(...aliveAliens.map(a => a.x))
        const rightMost = Math.max(...aliveAliens.map(a => a.x + ALIEN_WIDTH))

        let newDirection: 1 | -1 = newState.alienDirection
        let newDropDistance = newState.alienDropDistance

        // Check if aliens hit the edge
        if ((newDirection === 1 && rightMost >= CANVAS_WIDTH - 20) ||
            (newDirection === -1 && leftMost <= 20)) {
          newDirection = (newDirection === 1 ? -1 : 1) as 1 | -1
          newDropDistance += 20
        }

        // Move aliens horizontally and drop down when hitting edge
        newState.aliens = newState.aliens.map(alien => {
          if (!alien.alive) return alien

          return {
            ...alien,
            x: alien.x + (newDirection * ALIEN_SPEED * 2 * (1 + newState.wave * 0.2)), // Much faster
            y: alien.y + newDropDistance
          }
        })

        newState.alienDirection = newDirection === 1 ? 1 : -1
        newState.alienDropDistance = 0

        // Debug: Log alien positions occasionally
        if (Math.random() < 0.01) {
          console.log('Alien positions:', aliveAliens.map(a => ({x: a.x, y: a.y})))
        }
      }

      // Check bullet-alien collisions (vertical bullets only)
      newState.bullets.forEach(bullet => {
        if (bullet.isPlayerBullet) {
          newState.aliens.forEach(alien => {
            if (alien.alive &&
                bullet.x < alien.x + ALIEN_WIDTH &&
                bullet.x + BULLET_WIDTH > alien.x &&
                bullet.y <= alien.y + ALIEN_HEIGHT &&
                bullet.y + BULLET_HEIGHT >= alien.y) {
              console.log(`Bullet hit alien at (${alien.x}, ${alien.y})`)
              alien.alive = false
              bullet.y = -100 // Remove bullet

              // Award points based on alien type
              let points = 10
              if (alien.type === 'fast') points = 20
              if (alien.type === 'tough') points = 30

              newState.score += points * newState.wave

              // Chance to spawn power-up (10% chance)
              if (Math.random() < 0.1) {
                const powerUpTypes: ('rapidFire' | 'tripleShot' | 'extraLife')[] = ['rapidFire', 'tripleShot', 'extraLife']
                const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]

                newState.powerUps.push({
                  id: `powerup-${Date.now()}`,
                  x: alien.x,
                  y: alien.y,
                  type: randomType
                })
              }
            }
          })
        }
      })

      // Remove hit bullets
      newState.bullets = newState.bullets.filter(bullet => bullet.y > -50)

      // Move power-ups down
      newState.powerUps.forEach(powerUp => {
        powerUp.y += 2
      })

      // Remove power-ups that are off screen
      newState.powerUps = newState.powerUps.filter(powerUp => powerUp.y < CANVAS_HEIGHT)

      // Check power-up collection
      newState.powerUps.forEach(powerUp => {
        if (
          powerUp.x < newState.playerX + PLAYER_WIDTH &&
          powerUp.x + 20 > newState.playerX &&
          powerUp.y + 20 > CANVAS_HEIGHT - PLAYER_HEIGHT - 10 &&
          powerUp.y < CANVAS_HEIGHT - 10
        ) {
          // Collect power-up
          if (powerUp.type === 'extraLife') {
            newState.lives = Math.min(newState.lives + 1, 5)
          } else {
            newState.powerUp = powerUp.type
            // Power-up lasts for 10 seconds
            setTimeout(() => {
              setGameState(prev => ({ ...prev, powerUp: null }))
            }, 10000)
          }

          // Remove collected power-up
          powerUp.y = CANVAS_HEIGHT + 100
        }
      })

      // Remove collected power-ups
      newState.powerUps = newState.powerUps.filter(powerUp => powerUp.y < CANVAS_HEIGHT)

      // Check bullet-player collisions
      const playerBullet = newState.bullets.find(bullet =>
        !bullet.isPlayerBullet &&
        bullet.x < newState.playerX + PLAYER_WIDTH &&
        bullet.x + BULLET_WIDTH > newState.playerX &&
        bullet.y + BULLET_HEIGHT > CANVAS_HEIGHT - PLAYER_HEIGHT - 10
      )

      if (playerBullet) {
        newState.lives -= 1
        newState.bullets = newState.bullets.filter(b => b !== playerBullet)

        if (newState.lives <= 0) {
          newState.gameStatus = 'gameOver'
        }
      }

      // Check if aliens reached the bottom
      const lowestAlien = Math.max(...newState.aliens.filter(a => a.alive).map(a => a.y))
      if (lowestAlien >= CANVAS_HEIGHT - PLAYER_HEIGHT - 50) {
        newState.lives = 0
        newState.gameStatus = 'gameOver'
      }

      // Check if wave is complete
      const remainingAliens = newState.aliens.filter(alien => alien.alive).length
      if (remainingAliens === 0) {
        newState.gameStatus = 'waveComplete'
        newState.wave += 1
        newState.aliens = createWave(newState.wave)
        newState.bullets = []
        newState.powerUps = []
        newState.alienDirection = 1
        newState.gameStatus = 'playing'
      }

      return newState
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [createWave])

  // Start game loop
  useEffect(() => {
    console.log('Game loop effect triggered, status:', gameState.gameStatus)

    if (gameState.gameStatus === 'playing') {
      console.log('Starting game loop!')
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    } else {
      console.log('Game not playing, not starting loop')
    }

    return () => {
      if (gameLoopRef.current) {
        console.log('Cleaning up game loop')
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameLoop, gameState.gameStatus])

  // Test rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      console.log('Canvas is available for rendering')
    } else {
      console.log('Canvas is NOT available')
    }
  }, [])

  // Initialize game on mount
  useEffect(() => {
    if (!initialState) {
      initGame()
    }
  }, [initGame, initialState])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    console.log('Canvas rendering frame:', frameCount)

    // Clear canvas
    ctx.fillStyle = '#000011'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw stars background
    ctx.fillStyle = '#FFFFFF'
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5) % CANVAS_WIDTH
      const y = (i * 83.7) % CANVAS_HEIGHT
      ctx.fillRect(x, y, 1, 1)
    }

    // Draw test animation - definitely visible
    ctx.fillStyle = '#FF00FF'
    ctx.fillRect(testX, 10, 20, 20)
    ctx.fillText('TEST', testX + 25, 25)

    // ALWAYS draw game objects (remove the status check)
    console.log('Drawing', gameState.aliens.filter(a => a.alive).length, 'aliens and', gameState.bullets.length, 'bullets')

    // Draw aliens - make them BIG and VISIBLE
    gameState.aliens.forEach((alien, index) => {
      if (alien.alive) {
        console.log(`Drawing alien ${index} at (${alien.x}, ${alien.y})`)

        // Make aliens much bigger and more visible
        ctx.fillStyle = '#FF0000'  // Bright red for visibility
        ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH * 2, ALIEN_HEIGHT * 2)

        // Add a border
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.strokeRect(alien.x, alien.y, ALIEN_WIDTH * 2, ALIEN_HEIGHT * 2)

        // Add alien number
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(index.toString(), alien.x + ALIEN_WIDTH, alien.y + ALIEN_HEIGHT + 5)
      }
    })

    // Draw bullets - make them BIG and VISIBLE
    gameState.bullets.forEach((bullet, index) => {
      console.log(`Drawing bullet ${index} at (${bullet.x}, ${bullet.y})`)

      if (bullet.isPlayerBullet) {
        ctx.fillStyle = '#00FF00'  // Bright green for player bullets
      } else {
        ctx.fillStyle = '#FF0000'  // Bright red for alien bullets
      }

      // Make bullets much bigger
      ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH * 3, BULLET_HEIGHT * 3)

      // Add bullet number
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(index.toString(), bullet.x + BULLET_WIDTH * 1.5, bullet.y + BULLET_HEIGHT * 1.5 + 8)
    })

    // Draw power-ups
    gameState.powerUps.forEach(powerUp => {
      let color = '#00FF00' // Default green
      let symbol = '?'

      if (powerUp.type === 'rapidFire') {
        color = '#FFFF00'
        symbol = '⚡'
      } else if (powerUp.type === 'tripleShot') {
        color = '#FF00FF'
        symbol = '3'
      } else if (powerUp.type === 'extraLife') {
        color = '#FF0000'
        symbol = '❤️'
      }

      // Power-up background
      ctx.fillStyle = color
      ctx.fillRect(powerUp.x, powerUp.y, 20, 20)

      // Power-up symbol
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(symbol, powerUp.x + 10, powerUp.y + 14)
    })

    // Draw player
    ctx.fillStyle = '#0088FF'
    ctx.fillRect(gameState.playerX, CANVAS_HEIGHT - PLAYER_HEIGHT - 10, PLAYER_WIDTH, PLAYER_HEIGHT)

    // Player details
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(gameState.playerX + 10, CANVAS_HEIGHT - PLAYER_HEIGHT - 10, 5, 5)
    ctx.fillRect(gameState.playerX + PLAYER_WIDTH - 15, CANVAS_HEIGHT - PLAYER_HEIGHT - 10, 5, 5)

    // Show current power-up
    if (gameState.powerUp) {
      const powerUpText = gameState.powerUp === 'rapidFire' ? '⚡ RAPID FIRE' :
                         gameState.powerUp === 'tripleShot' ? '3 TRIPLE SHOT' : 'UNKNOWN'
      ctx.fillStyle = '#FFFF00'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(powerUpText, 10, CANVAS_HEIGHT - 60)
    }

    // Draw UI
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Score: ${gameState.score}`, 10, 30)
    ctx.fillText(`Wave: ${gameState.wave}`, 10, 60)
    ctx.fillText(`Lives: ${gameState.lives}`, 10, 90)
    ctx.fillText(`Frame: ${frameCount}`, 10, 120)

    if (gameState.gameStatus === 'gameOver') {
      // Game over screen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = '#FF0000'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 24px Arial'
      ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.fillText(`Wave Reached: ${gameState.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40)
      ctx.font = '18px Arial'
      ctx.fillText('Click to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80)
    }

    if (gameState.gameStatus === 'waveComplete') {
      ctx.fillStyle = '#00FF00'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`WAVE ${gameState.wave - 1} COMPLETE!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
    }

  }, [gameState])

  // Handle canvas click
  const handleCanvasClick = () => {
    if (gameState.gameStatus === 'gameOver') {
      initGame()
    }
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">🚀 Classic Space Invaders</h2>

      {/* Game Stats */}
      {gameState.gameStatus === 'playing' && (
        <div className="flex justify-center space-x-8 mb-4 text-lg">
          <div className="text-blue-600">Score: {gameState.score}</div>
          <div className="text-green-600">Wave: {gameState.wave}</div>
          <div className="text-red-600">Lives: {gameState.lives}</div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How to Play</h3>
        <p className="text-blue-800 text-sm">
          Use ← → arrow keys to move your ship. Press SPACE to shoot. Destroy all aliens before they reach the bottom!
          Different alien colors give different points. Survive as many waves as possible!
        </p>
      </div>

      {/* Game Canvas */}
      <div className="flex justify-center mb-6">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          className={`border-4 border-gray-400 rounded-lg ${
            gameState.gameStatus === 'playing' ? 'cursor-none' : 'cursor-pointer'
          }`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Controls Info */}
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">🎮 Controls</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded">← →</kbd>
            <span>Move & Aim ship</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded">SPACE</kbd>
            <span>Shoot bullets</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          💡 Bullets only go straight up! Position your ship directly under aliens to hit them.
        </p>
      </div>

      {/* Alien Types */}
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">👾 Alien Types</h3>
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Basic: 10 pts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Fast: 20 pts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Tough: 30 pts</span>
          </div>
        </div>
      </div>

      {/* Power-ups */}
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">⚡ Power-ups</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-semibold text-yellow-600">Rapid Fire</div>
            <div className="text-xs">Shoot faster!</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">3</div>
            <div className="font-semibold text-purple-600">Triple Shot</div>
            <div className="text-xs">Shoot 3 bullets!</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">❤️</div>
            <div className="font-semibold text-red-600">Extra Life</div>
            <div className="text-xs">Gain +1 life!</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Power-ups drop randomly when aliens are destroyed!
        </p>
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

export default SpaceInvaders
