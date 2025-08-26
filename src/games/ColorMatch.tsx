import { useState, useEffect, useRef } from 'react'

interface ColorMatchProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface RGBColor {
  r: number
  g: number
  b: number
}

const ColorMatch: React.FC<ColorMatchProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [targetColor, setTargetColor] = useState<RGBColor>(initialState?.targetColor || { r: 0, g: 0, b: 0 })
  const [userColor, setUserColor] = useState<RGBColor>({ r: 128, g: 128, b: 128 })
  const [score, setScore] = useState(initialState?.score || 0)
  const [level, setLevel] = useState(initialState?.level || 1)
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 30)
  const [gameActive, setGameActive] = useState(false)
  const [lastResult, setLastResult] = useState<{ user: RGBColor; target: RGBColor; accuracy: number; points: number } | null>(null)
  const [roundsCompleted, setRoundsCompleted] = useState(0)
  const colorPickerRef = useRef<HTMLInputElement>(null)

  const generateRandomColor = (): RGBColor => {
    return {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    }
  }

  const calculateColorDistance = (color1: RGBColor, color2: RGBColor): number => {
    // Calculate Euclidean distance in RGB space
    const dr = color1.r - color2.r
    const dg = color1.g - color2.g
    const db = color1.b - color2.b
    const distance = Math.sqrt(dr * dr + dg * dg + db * db)
    
    // Debug logging
    console.log(`Color1: RGB(${color1.r}, ${color1.g}, ${color1.b})`)
    console.log(`Color2: RGB(${color2.r}, ${color2.g}, ${color2.b})`)
    console.log(`Differences: R=${dr}, G=${dg}, B=${db}`)
    console.log(`Calculated Distance: ${distance.toFixed(2)}`)
    
    return distance
  }

  const calculateAccuracy = (distance: number): number => {
    // Maximum possible distance is sqrt(255² + 255² + 255²) ≈ 441.67
    const maxDistance = Math.sqrt(3 * 255 * 255)
    // Normalize distance to 0-100 scale properly
    const accuracy = Math.max(0, 100 - (distance / maxDistance) * 100)
    
    // Debug logging
    console.log(`Distance: ${distance.toFixed(2)}, MaxDistance: ${maxDistance.toFixed(2)}, Accuracy: ${accuracy.toFixed(2)}%`)
    
    return accuracy
  }

  const generateNewRound = () => {
    const newTargetColor = generateRandomColor()
    setTargetColor(newTargetColor)
    setUserColor({ r: 128, g: 128, b: 128 })
    setTimeLeft(30)
    setGameActive(true)
    setLastResult(null)
    
    onUpdate({ 
      targetColor: newTargetColor, 
      userColor: { r: 128, g: 128, b: 128 }, 
      score, 
      level, 
      timeLeft: 30, 
      gameActive: true,
      roundsCompleted 
    }, score)
  }

  const handleColorSubmit = () => {
    if (!gameActive) return

    const distance = calculateColorDistance(userColor, targetColor)
    const accuracy = calculateAccuracy(distance)
    
    // Score based on accuracy - more granular and logical
    let points = 0
    
    if (accuracy >= 95) {
      points = 10  // Perfect match
    } else if (accuracy >= 90) {
      points = 9   // Very close
    } else if (accuracy >= 85) {
      points = 8   // Close
    } else if (accuracy >= 80) {
      points = 7   // Good
    } else if (accuracy >= 75) {
      points = 6   // Fair
    } else if (accuracy >= 70) {
      points = 5   // Somewhat close
    } else if (accuracy >= 60) {
      points = 4   // Not very close
    } else if (accuracy >= 50) {
      points = 3   // Poor
    } else if (accuracy >= 30) {
      points = 2   // Bad
    } else if (accuracy >= 10) {
      points = 1   // Very bad
    } else {
      points = 0   // Way off
    }
    
    // Small time bonus for quick responses (max +2)
    if (timeLeft > 20) points += 1
    if (timeLeft > 25) points += 1
    
    const newScore = score + points
    const newRoundsCompleted = roundsCompleted + 1
    
    setScore(newScore)
    setRoundsCompleted(newRoundsCompleted)
    setGameActive(false)
    
    setLastResult({
      user: { ...userColor },
      target: { ...targetColor },
      accuracy,
      points
    })
    
    // Check if game is complete (10 rounds)
    if (newRoundsCompleted >= 10) {
      onComplete(newScore, true)
    }
    // Don't auto-advance - let player click Next Round button
    
    onUpdate({ 
      targetColor, 
      userColor, 
      score: newScore, 
      level: Math.floor(newRoundsCompleted / 3) + 1, 
      timeLeft, 
      gameActive: false,
      roundsCompleted: newRoundsCompleted
    }, newScore)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    setUserColor({ r, g, b })
  }

  const rgbToHex = (color: RGBColor): string => {
    return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`
  }

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev: number) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false)
      onComplete(score, false)
    }
  }, [timeLeft, gameActive, score, onComplete])

  useEffect(() => {
    if (targetColor.r === 0 && targetColor.g === 0 && targetColor.b === 0) {
      generateNewRound()
    }
  }, [])

  const resetGame = () => {
    setScore(0)
    setLevel(1)
    setTimeLeft(30)
    setGameActive(false)
    setRoundsCompleted(0)
    setLastResult(null)
    generateNewRound()
    onUpdate({ 
      targetColor: { r: 0, g: 0, b: 0 }, 
      userColor: { r: 128, g: 128, b: 128 }, 
      score: 0, 
      level: 1, 
      timeLeft: 30, 
      gameActive: false,
      roundsCompleted: 0
    }, 0)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Color Match</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Score: {score}</div>
          <div className="text-green-600">Level: {level}</div>
          <div className="text-red-600">Time: {timeLeft}s</div>
          <div className="text-purple-600">Round: {roundsCompleted + 1}/10</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Target Color */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Match This Color:</h3>
          <div 
            className="w-32 h-32 mx-auto rounded-lg border-4 border-gray-300 shadow-lg"
            style={{ backgroundColor: rgbToHex(targetColor) }}
          ></div>
          <p className="text-sm text-gray-500 mt-2">No RGB values shown!</p>
        </div>

        {/* User Color Picker */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Pick:</h3>
          <div 
            className="w-32 h-32 mx-auto rounded-lg border-4 border-gray-300 shadow-lg mb-4"
            style={{ backgroundColor: rgbToHex(userColor) }}
          ></div>
          
          <div className="space-y-3">
            <input
              ref={colorPickerRef}
              type="color"
              value={rgbToHex(userColor)}
              onChange={handleColorChange}
              disabled={!gameActive}
              className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:cursor-not-allowed"
            />
            
            <button
              onClick={handleColorSubmit}
              disabled={!gameActive}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                gameActive
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Color
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {lastResult && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Round Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Your Color</h4>
              <div 
                className="w-20 h-20 mx-auto rounded-lg border-2 border-gray-300 mb-2"
                style={{ backgroundColor: rgbToHex(lastResult.user) }}
              ></div>
              <p className="text-sm text-gray-600">
                R: {lastResult.user.r}, G: {lastResult.user.g}, B: {lastResult.user.b}
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Target Color</h4>
              <div 
                className="w-20 h-20 mx-auto rounded-lg border-2 border-gray-300 mb-2"
                style={{ backgroundColor: rgbToHex(lastResult.target) }}
              ></div>
              <p className="text-sm text-gray-600">
                R: {lastResult.target.r}, G: {lastResult.target.g}, B: {lastResult.target.b}
              </p>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-lg font-semibold text-gray-900">
              Accuracy: <span className="text-primary-600">{lastResult.accuracy.toFixed(1)}%</span>
            </p>
            <p className="text-lg font-semibold text-green-600">
              Points Earned: +{lastResult.points}
            </p>
            
            {roundsCompleted < 10 && (
              <button
                onClick={() => {
                  setLevel(Math.floor(roundsCompleted / 3) + 1)
                  generateNewRound()
                }}
                className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Next Round
              </button>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={resetGame}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          New Game
        </button>
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

export default ColorMatch 