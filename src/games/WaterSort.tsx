import { useState, useEffect } from 'react'

interface WaterSortProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface Tube {
  id: number
  colors: string[]
}

const WaterSort: React.FC<WaterSortProps> = ({ onComplete, onUpdate, progress }) => {
  const [tubes, setTubes] = useState<Tube[]>([])
  const [selectedTube, setSelectedTube] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)

  // const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'] // Red, Green, Blue, Yellow

  // Initialize game
  useEffect(() => {
    if (tubes.length === 0) {
      initializeGame()
    }
  }, [])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const initializeGame = () => {
    // Create 5 tubes: 4 with mixed colors, 1 empty
    const newTubes: Tube[] = []
    
    // Tube 0: Mixed colors
    newTubes.push({
      id: 0,
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']
    })
    
    // Tube 1: Mixed colors  
    newTubes.push({
      id: 1,
      colors: ['#00FF00', '#0000FF', '#FFFF00', '#FF0000']
    })
    
    // Tube 2: Mixed colors
    newTubes.push({
      id: 2,
      colors: ['#0000FF', '#FFFF00', '#FF0000', '#00FF00']
    })
    
    // Tube 3: Mixed colors
    newTubes.push({
      id: 3,
      colors: ['#FFFF00', '#FF0000', '#00FF00', '#0000FF']
    })
    
    // Tube 4: Empty
    newTubes.push({
      id: 4,
      colors: []
    })
    
    setTubes(newTubes)
    setMoves(0)
    setGameComplete(false)
    setSelectedTube(null)
    
    onUpdate({ tubes: newTubes, moves: 0, gameComplete: false }, 0)
  }

  const handleTubeClick = (tubeId: number) => {
    if (gameComplete) return

    if (selectedTube === null) {
      // First click - select tube
      if (tubes[tubeId].colors.length > 0) {
        setSelectedTube(tubeId)
        console.log('Selected tube:', tubeId, 'with top color:', tubes[tubeId].colors[tubes[tubeId].colors.length - 1])
      }
    } else if (selectedTube === tubeId) {
      // Click same tube - deselect
      setSelectedTube(null)
      console.log('Deselected tube:', tubeId)
    } else {
      // Second click - try to pour
      console.log('Attempting to pour from tube', selectedTube, 'to tube', tubeId)
      pourWater(selectedTube, tubeId)
    }
  }

  const pourWater = (fromId: number, toId: number) => {
    const fromTube = tubes[fromId]
    const toTube = tubes[toId]
    
    console.log('Pouring from tube', fromId, 'to tube', toId)
    console.log('From tube colors:', fromTube.colors)
    console.log('To tube colors:', toTube.colors)
    
    // Check if pour is valid
    if (fromTube.colors.length === 0) {
      console.log('Cannot pour from empty tube')
      setSelectedTube(null)
      return
    }
    
    if (toTube.colors.length >= 4) {
      console.log('Cannot pour to full tube')
      setSelectedTube(null)
      return
    }
    
    const topColor = fromTube.colors[fromTube.colors.length - 1]
    console.log('Top color from source tube:', topColor)
    
    // Can pour if receiving tube is empty OR if top colors match
    const canPour = toTube.colors.length === 0 || toTube.colors[toTube.colors.length - 1] === topColor
    
    if (!canPour) {
      console.log('Cannot pour - colors do not match')
      setSelectedTube(null)
      return
    }
    
    console.log('Pour is valid, proceeding...')
    
    // Update tubes
    const newTubes = [...tubes]
    
    // Remove top color from source tube
    newTubes[fromId] = {
      ...fromTube,
      colors: fromTube.colors.slice(0, -1)
    }
    
    // Add color to destination tube
    newTubes[toId] = {
      ...toTube,
      colors: [...toTube.colors, topColor]
    }
    
    console.log('New tubes after pour:', newTubes)
    
    setTubes(newTubes)
    setSelectedTube(null)
    setMoves(prev => prev + 1)
    
    // Check if game is complete
    const isComplete = newTubes.every(tube => {
      if (tube.colors.length === 0) return true // Empty tube is fine
      if (tube.colors.length !== 4) return false // Must be full to be complete
      return tube.colors.every(color => color === tube.colors[0]) // All colors must be the same
    })
    
    console.log('Game complete check:', isComplete)
    
    if (isComplete) {
      console.log('GAME COMPLETE!')
      setGameComplete(true)
      const finalScore = Math.max(100, 1000 - moves * 10 - timeSpent * 2)
      onComplete(finalScore, true)
    }
    
    onUpdate({ tubes: newTubes, moves: moves + 1, gameComplete: isComplete }, 0)
  }

  const resetGame = () => {
    initializeGame()
  }

  if (gameComplete) {
    return (
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-green-600 mb-6">🎉 Puzzle Complete!</h2>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
          <div className="text-2xl mb-4">🏆 Congratulations!</div>
          <div className="grid grid-cols-3 gap-4 text-lg">
            <div>
              <div className="font-semibold text-gray-700">Moves</div>
              <div className="text-2xl text-blue-600">{moves}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Time</div>
              <div className="text-2xl text-purple-600">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Score</div>
              <div className="text-2xl text-green-600">{Math.max(100, 1000 - moves * 10 - timeSpent * 2)}</div>
            </div>
          </div>
        </div>
        <button
          onClick={resetGame}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-xl hover:bg-blue-700 transition-colors"
        >
          🎯 Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">🧪 Water Sort Puzzle</h2>
      
      {/* Game Stats */}
      <div className="flex justify-center space-x-8 mb-6 text-lg">
        <div className="text-blue-600">Moves: {moves}</div>
        <div className="text-green-600">Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
        <div className="text-purple-600">Score: {Math.max(100, 1000 - moves * 10 - timeSpent * 2)}</div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How to Play</h3>
        <p className="text-blue-800 text-sm">
          Click a tube to select it, then click another tube to pour water. 
          You can only pour if the colors match or the receiving tube is empty. 
          Complete all tubes to win!
        </p>
        {selectedTube !== null && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Selected:</strong> Tube {selectedTube + 1} - Color: 
              <span 
                className="inline-block w-4 h-4 rounded border ml-2"
                style={{ backgroundColor: tubes[selectedTube]?.colors[tubes[selectedTube]?.colors.length - 1] }}
              ></span>
            </p>
          </div>
        )}
      </div>

      {/* Tubes */}
      <div className="grid grid-cols-5 gap-4 justify-items-center mb-6">
        {tubes.map((tube) => (
          <div
            key={tube.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedTube === tube.id ? 'scale-110 ring-4 ring-yellow-400' : 'scale-100'
            }`}
            onClick={() => handleTubeClick(tube.id)}
          >
            {/* Tube Container */}
            <div className="w-16 h-24 bg-gray-200 border-2 border-gray-400 rounded-b-full relative overflow-hidden">
              {/* Water Segments */}
              {tube.colors.map((color, index) => (
                <div
                  key={index}
                  className="absolute w-full h-6 border-t border-gray-300"
                  style={{
                    backgroundColor: color,
                    bottom: `${index * 6}px`
                  }}
                />
              ))}
              
              {/* Empty Space Indicator */}
              {tube.colors.length < 4 && (
                <div 
                  className="absolute w-full h-6 border-t border-gray-300 bg-gray-100 opacity-50"
                  style={{ bottom: `${tube.colors.length * 6}px` }} 
                />
              )}
            </div>
            
            {/* Tube Label */}
            <div className="text-center mt-2">
              <div className="text-sm font-medium text-gray-700">Tube {tube.id + 1}</div>
              {tube.colors.length === 4 && tube.colors.every(color => color === tube.colors[0]) && (
                <div className="text-xs text-green-600 font-bold">✓ Complete</div>
              )}
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-1">
                {tube.colors.length > 0 && (
                  <div>Top: {tube.colors[tube.colors.length - 1].substring(1, 4)}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={resetGame}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          🔄 Reset Game
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

export default WaterSort
