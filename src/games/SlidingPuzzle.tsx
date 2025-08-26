import { useState, useEffect } from 'react'

interface SlidingPuzzleProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface Tile {
  id: number
  currentPosition: number
  correctPosition: number
  imageX: number
  imageY: number
}

const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [gridSize, setGridSize] = useState(initialState?.gridSize || 4)
  const [moves, setMoves] = useState(0)
  const [startTime] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedImage, setSelectedImage] = useState(initialState?.selectedImage || 'nature')
  const [showNumbers, setShowNumbers] = useState(initialState?.showNumbers || false)

  const images = {
    nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    space: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400',
    ocean: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
    mountain: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400'
  }

  const tileSize = 400 / gridSize

  // Initialize puzzle
  useEffect(() => {
    initializePuzzle()
  }, [gridSize, selectedImage])

  // Timer
  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime, isComplete])

  const initializePuzzle = () => {
    const totalTiles = gridSize * gridSize
    const newTiles: Tile[] = []

    // Create tiles
    for (let i = 0; i < totalTiles - 1; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize

      newTiles.push({
        id: i + 1,
        currentPosition: i,
        correctPosition: i,
        imageX: col * tileSize,
        imageY: row * tileSize
      })
    }

    // Add empty tile (last position)
    newTiles.push({
      id: 0, // Empty tile
      currentPosition: totalTiles - 1,
      correctPosition: totalTiles - 1,
      imageX: 0,
      imageY: 0
    })

    // Shuffle tiles
    const shuffled = shuffleTiles(newTiles)
    setTiles(shuffled)
    setMoves(0)
    setIsComplete(false)
    setTimeSpent(0)

    onUpdate({
      tiles: shuffled,
      gridSize,
      selectedImage,
      showNumbers,
      moves: 0,
      isComplete: false
    }, 0)
  }

  const shuffleTiles = (tilesArray: Tile[]): Tile[] => {
    const shuffled = [...tilesArray]
    let emptyIndex = shuffled.findIndex(tile => tile.id === 0)

    // Calculate shuffle intensity based on grid size
    const shuffleIntensity = gridSize === 3 ? 50 : gridSize === 4 ? 80 : 120

    console.log(`Shuffling ${gridSize}x${gridSize} puzzle with ${shuffleIntensity} moves`)

    // Perform random valid moves
    for (let i = 0; i < shuffleIntensity; i++) {
      const validMoves = getValidMoves(emptyIndex)
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        const result = moveTile(randomMove, shuffled)
        if (result) {
          shuffled.splice(0, shuffled.length, ...result.tiles)
          emptyIndex = shuffled.findIndex(tile => tile.id === 0)
        }
      }
    }

    // Verify the puzzle is actually shuffled
    const _isShuffled = !shuffled.every(tile =>
      tile.id === 0 || tile.currentPosition === tile.correctPosition
    )

    console.log('Puzzle shuffled correctly:', _isShuffled)

    return shuffled
  }

  const getValidMoves = (emptyIndex: number): number[] => {
    const validMoves: number[] = []
    const row = Math.floor(emptyIndex / gridSize)
    const col = emptyIndex % gridSize

    // Check adjacent positions
    const adjacent = [
      { row: row - 1, col: col }, // Up
      { row: row + 1, col: col }, // Down
      { row: row, col: col - 1 }, // Left
      { row: row, col: col + 1 }  // Right
    ]

    adjacent.forEach(({ row: r, col: c }) => {
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        const index = r * gridSize + c
        validMoves.push(index)
      }
    })

    return validMoves
  }

  const moveTile = (tileIndex: number, tilesArray?: Tile[]) => {
    const currentTiles = tilesArray || tiles
    const emptyIndex = currentTiles.findIndex(tile => tile.id === 0)

    if (emptyIndex === -1) return null

    // Check if move is valid
    const validMoves = getValidMoves(emptyIndex)
    if (!validMoves.includes(tileIndex)) {
      console.log(`Invalid move: tile ${tileIndex} cannot move to empty space at ${emptyIndex}`)
      return null
    }

    console.log(`Moving tile ${currentTiles[tileIndex].id} from position ${tileIndex} to empty position ${emptyIndex}`)

    // Swap tiles
    const newTiles = [...currentTiles]
    const temp = newTiles[tileIndex]
    newTiles[tileIndex] = newTiles[emptyIndex]
    newTiles[emptyIndex] = temp

    // Update current positions
    newTiles[tileIndex].currentPosition = tileIndex
    newTiles[emptyIndex].currentPosition = emptyIndex

    return {
      tiles: newTiles,
      moved: true
    }
  }

  const handleTileClick = (tileIndex: number) => {
    if (isComplete) return

    const result = moveTile(tileIndex)
    if (result) {
      setTiles(result.tiles)
      setMoves(prev => prev + 1)

      // Check if puzzle is complete
      const complete = result.tiles.every(tile =>
        tile.id === 0 || tile.currentPosition === tile.correctPosition
      )

      if (complete) {
        setIsComplete(true)
        const finalScore = Math.max(100, 2000 - moves * 5 - timeSpent * 2)
        onComplete(finalScore, true)
      }

      onUpdate({
        tiles: result.tiles,
        gridSize,
        selectedImage,
        showNumbers,
        moves: moves + 1,
        isComplete: complete
      }, complete ? Math.max(100, 2000 - moves * 5 - timeSpent * 2) : 0)
    }
  }

  const changeGridSize = (newSize: number) => {
    setGridSize(newSize)
    onUpdate({
      tiles,
      gridSize: newSize,
      selectedImage,
      showNumbers,
      moves,
      isComplete
    }, 0)
  }

  const changeImage = (imageKey: string) => {
    setSelectedImage(imageKey)
    onUpdate({
      tiles,
      gridSize,
      selectedImage: imageKey,
      showNumbers,
      moves,
      isComplete
    }, 0)
  }

  const toggleNumbers = () => {
    setShowNumbers(!showNumbers)
    onUpdate({
      tiles,
      gridSize,
      selectedImage,
      showNumbers: !showNumbers,
      moves,
      isComplete
    }, 0)
  }

  const getHint = () => {
    // Find a tile that can be moved
    const emptyIndex = tiles.findIndex(tile => tile.id === 0)
    const validMoves = getValidMoves(emptyIndex)

    if (validMoves.length > 0) {
      // Just move the first valid tile as a hint
      handleTileClick(validMoves[0])
    }
  }

  if (isComplete) {
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
              <div className="text-2xl text-green-600">{Math.max(100, 2000 - moves * 5 - timeSpent * 2)}</div>
            </div>
          </div>
        </div>
        <button
          onClick={initializePuzzle}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-xl hover:bg-blue-700 transition-colors"
        >
          🎯 Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">🧩 Sliding Puzzle</h2>

      {/* Game Stats */}
      <div className="flex justify-center space-x-8 mb-6 text-lg">
        <div className="text-blue-600">Moves: {moves}</div>
        <div className="text-green-600">Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</div>
        <div className="text-purple-600">Score: {Math.max(100, 2000 - moves * 5 - timeSpent * 2)}</div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How to Play</h3>
        <p className="text-blue-800 text-sm">
          Click tiles adjacent to the empty space to slide them. Rearrange the pieces to form the complete image!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Puzzle */}
        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-gray-300 rounded-lg p-6">
            {/* Puzzle Grid */}
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: `${gridSize * 100}px`,
                height: `${gridSize * 100}px`
              }}
            >
              {tiles.map((tile, index) => (
                <div
                  key={tile.id}
                  className={`border-2 border-gray-400 rounded cursor-pointer transition-all duration-200 hover:scale-105 ${
                    tile.id === 0 ? 'bg-gray-200' : 'bg-white'
                  }`}
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundImage: tile.id === 0 ? 'none' : `url(${images[selectedImage as keyof typeof images]})`,
                    backgroundSize: `${gridSize * 100}px ${gridSize * 100}px`,
                    backgroundPosition: `-${tile.imageX}px -${tile.imageY}px`
                  }}
                  onClick={() => handleTileClick(index)}
                >
                  {tile.id === 0 && (
                    <div className="w-full h-full bg-gray-300 border-2 border-dashed border-gray-400"></div>
                  )}
                  {showNumbers && tile.id !== 0 && (
                    <div className="absolute top-1 left-1 bg-white bg-opacity-90 text-black font-bold text-sm px-2 py-1 rounded shadow-md pointer-events-none">
                      {tile.id}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Puzzle Controls */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={initializePuzzle}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🔄 New Puzzle
              </button>

              <button
                onClick={() => {
                  const reshuffled = shuffleTiles(tiles)
                  setTiles(reshuffled)
                  setMoves(0)
                  setIsComplete(false)
                  onUpdate({
                    tiles: reshuffled,
                    gridSize,
                    selectedImage,
                    showNumbers,
                    moves: 0,
                    isComplete: false
                  }, 0)
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                🎲 Reshuffle
              </button>

              <button
                onClick={getHint}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
              >
                💡 Hint
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Options */}
        <div className="space-y-6">
          {/* Grid Size */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📐 Difficulty</h3>
            <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded">
              <div className="text-sm font-semibold text-blue-800">
                Current: {gridSize}×{gridSize}
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  gridSize === 3 ? 'bg-green-600 text-white' :
                  gridSize === 4 ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {gridSize === 3 ? 'EASY' : gridSize === 4 ? 'MEDIUM' : 'HARD'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {[3, 4, 5].map((size) => (
                <button
                  key={size}
                  onClick={() => changeGridSize(size)}
                  className={`w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
                    gridSize === size
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {size}×{size} {size === 3 ? '(Easy)' : size === 4 ? '(Medium)' : '(Hard)'}
                </button>
              ))}
            </div>
          </div>

          {/* Image Selection */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">🖼️ Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(images).map(([key, url]) => (
                <button
                  key={key}
                  onClick={() => changeImage(key)}
                  className={`p-2 rounded border-2 transition-all ${
                    selectedImage === key
                      ? 'border-blue-500 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={url}
                    alt={key}
                    className="w-full h-12 object-cover rounded"
                  />
                  <div className="text-xs mt-1 capitalize">{key}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">⚙️ Options</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showNumbers}
                  onChange={toggleNumbers}
                  className="mr-2"
                />
                <span className="text-sm">Show tile numbers</span>
              </label>
            </div>
          </div>

          {/* Progress Display */}
          {progress && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Your Best Score</h3>
              <p className="text-2xl font-bold text-primary-600">{progress.score} points</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SlidingPuzzle
