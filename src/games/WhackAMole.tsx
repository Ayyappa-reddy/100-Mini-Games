import { useState, useEffect } from 'react'

interface WhackAMoleProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

const WhackAMole: React.FC<WhackAMoleProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [score, setScore] = useState(initialState?.score || 0)
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 30)
  const [gameActive, setGameActive] = useState(initialState?.gameActive || false)
  const [activeMole, setActiveMole] = useState<number | null>(initialState?.activeMole || null)
  const [molesWhacked, setMolesWhacked] = useState(initialState?.molesWhacked || 0)

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setGameActive(true)
    setActiveMole(null)
    setMolesWhacked(0)
    
    onUpdate({ 
      score: 0, 
      timeLeft: 30, 
      gameActive: true, 
      activeMole: null, 
      molesWhacked: 0 
    }, 0)
  }

  useEffect(() => {
    if (!gameActive) {
      startGame()
    }
  }, [])

  useEffect(() => {
    if (!gameActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          setGameActive(false)
          onComplete(score, false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive, score, onComplete])

  useEffect(() => {
    if (!gameActive) return

    const moleTimer = setInterval(() => {
      if (activeMole === null) {
        const randomHole = Math.floor(Math.random() * 9)
        setActiveMole(randomHole)
        
        // Mole disappears after 1-2 seconds
        setTimeout(() => {
          setActiveMole(null)
        }, Math.random() * 1000 + 1000)
      }
    }, 800)

    return () => clearInterval(moleTimer)
  }, [gameActive, activeMole])

  const whackMole = (holeIndex: number) => {
    if (!gameActive || activeMole !== holeIndex) return

    const newScore = score + 10
    const newMolesWhacked = molesWhacked + 1
    
    setScore(newScore)
    setMolesWhacked(newMolesWhacked)
    setActiveMole(null)
    
    onUpdate({ 
      score: newScore, 
      timeLeft, 
      gameActive, 
      activeMole: null, 
      molesWhacked: newMolesWhacked 
    }, newScore)
  }

  const renderHole = (index: number) => (
    <button
      key={index}
      onClick={() => whackMole(index)}
      disabled={!gameActive}
      className={`
        w-20 h-20 rounded-full border-4 border-gray-800 transition-all duration-200
        ${activeMole === index 
          ? 'bg-green-600 transform scale-110 shadow-lg' 
          : 'bg-gray-700 hover:bg-gray-600'
        }
        ${!gameActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {activeMole === index && (
        <span className="text-2xl">🦫</span>
      )}
    </button>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Whack-a-Mole</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-red-600">Time: {timeLeft}s</div>
          <div className="text-green-600">Whacked: {molesWhacked}</div>
          <div className="text-primary-600">Score: {score}</div>
        </div>
        
        {!gameActive && timeLeft === 0 && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
            ⏰ Time's up! Final Score: {score}
          </div>
        )}
      </div>

      <div className="bg-green-800 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          {Array.from({ length: 9 }, (_, i) => renderHole(i))}
        </div>
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={startGame}
          className="bg-secondary-600 text-white px-6 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
        >
          New Game
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
        <p className="text-sm text-gray-600">
          Click on the moles (🦫) as they appear! You get 10 points for each mole you whack.
          The moles appear randomly and disappear quickly. How many can you catch in 30 seconds?
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

export default WhackAMole
