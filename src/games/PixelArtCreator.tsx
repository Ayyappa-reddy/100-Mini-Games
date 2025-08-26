import { useState, useEffect, useRef } from 'react'

interface PixelArtCreatorProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface PixelGrid {
  [key: string]: string // "x-y": color
}

const PixelArtCreator: React.FC<PixelArtCreatorProps> = ({ onUpdate, initialState, progress }) => {
  const [grid, setGrid] = useState<PixelGrid>(initialState?.grid || {})
  const [selectedColor, setSelectedColor] = useState('#FF0000')
  const [gridSize, setGridSize] = useState(initialState?.gridSize || 16)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingMode, setDrawingMode] = useState<'draw' | 'erase'>('draw')
  const [savedArtworks, setSavedArtworks] = useState<any[]>(initialState?.savedArtworks || [])
  const [, setCurrentArtwork] = useState<PixelGrid>({})

  const canvasRef = useRef<HTMLDivElement>(null)

  const colors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#000000', // Black
    '#FFFFFF', // White
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
    '#808080', // Gray
    '#90EE90', // Light Green
    '#87CEEB', // Sky Blue
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#FA8072', // Salmon
    '#20B2AA', // Light Sea Green
    '#FF6347', // Tomato
  ]

  // Initialize game
  useEffect(() => {
    if (Object.keys(grid).length === 0) {
      initializeCanvas()
    }
  }, [])

  const initializeCanvas = () => {
    const newGrid: PixelGrid = {}
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        newGrid[`${x}-${y}`] = 'transparent'
      }
    }
    setGrid(newGrid)
    setCurrentArtwork(newGrid)
    onUpdate({ grid: newGrid, gridSize, savedArtworks: [] }, 0)
  }

  const handlePixelClick = (x: number, y: number) => {
    const key = `${x}-${y}`
    const newGrid = { ...grid }

    if (drawingMode === 'erase') {
      newGrid[key] = 'transparent'
    } else {
      newGrid[key] = selectedColor
    }

    setGrid(newGrid)
    setCurrentArtwork(newGrid)
    onUpdate({ grid: newGrid, gridSize, savedArtworks }, 0)
  }

  const handleMouseDown = (x: number, y: number) => {
    setIsDrawing(true)
    handlePixelClick(x, y)
  }

  const handleMouseEnter = (x: number, y: number) => {
    if (isDrawing) {
      handlePixelClick(x, y)
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const newGrid: PixelGrid = {}
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        newGrid[`${x}-${y}`] = 'transparent'
      }
    }
    setGrid(newGrid)
    setCurrentArtwork(newGrid)
    onUpdate({ grid: newGrid, gridSize, savedArtworks }, 0)
  }

  const saveArtwork = () => {
    const artwork = {
      id: Date.now(),
      grid: { ...grid },
      gridSize,
      timestamp: new Date().toISOString(),
      name: `Artwork ${savedArtworks.length + 1}`
    }

    const newSavedArtworks = [...savedArtworks, artwork]
    setSavedArtworks(newSavedArtworks)
    onUpdate({ grid, gridSize, savedArtworks: newSavedArtworks }, 0)

    // Show success message
    alert('Artwork saved successfully!')
  }

  const loadArtwork = (artwork: any) => {
    setGrid(artwork.grid)
    setGridSize(artwork.gridSize)
    setCurrentArtwork(artwork.grid)
    onUpdate({ grid: artwork.grid, gridSize: artwork.gridSize, savedArtworks }, 0)
  }

  const changeGridSize = (newSize: number) => {
    const newGrid: PixelGrid = {}
    for (let y = 0; y < newSize; y++) {
      for (let x = 0; x < newSize; x++) {
        const key = `${x}-${y}`
        newGrid[key] = grid[key] || 'transparent'
      }
    }
    setGrid(newGrid)
    setGridSize(newSize)
    setCurrentArtwork(newGrid)
    onUpdate({ grid: newGrid, gridSize: newSize, savedArtworks }, 0)
  }

  const exportAsImage = () => {
    // This is a simplified export - in a real app you'd use a library like html2canvas
    alert('Image export feature would be implemented with html2canvas library!')
  }

  return (
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">🎨 Pixel Art Creator</h2>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How to Create</h3>
        <p className="text-blue-800 text-sm">
          Click or drag to draw pixels. Choose colors from the palette below.
          Create your masterpiece and save it when you're done!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side - Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white border-4 border-gray-300 rounded-lg p-6 mb-6">
            {/* Canvas */}
            <div
              ref={canvasRef}
              className="inline-block border-2 border-gray-400 bg-white"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                  width: `${gridSize * 20}px`,
                  height: `${gridSize * 20}px`
                }}
              >
                {Array.from({ length: gridSize }, (_, y) =>
                  Array.from({ length: gridSize }, (_, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: grid[`${x}-${y}`] || 'transparent'
                      }}
                      onMouseDown={() => handleMouseDown(x, y)}
                      onMouseEnter={() => handleMouseEnter(x, y)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Canvas Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={clearCanvas}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                🗑️ Clear
              </button>

              <button
                onClick={saveArtwork}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                💾 Save Art
              </button>

              <button
                onClick={exportAsImage}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                📥 Export
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Tools */}
        <div className="space-y-6">
          {/* Drawing Mode */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">🖌️ Drawing Mode</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setDrawingMode('draw')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                  drawingMode === 'draw'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                ✏️ Draw
              </button>
              <button
                onClick={() => setDrawingMode('erase')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                  drawingMode === 'erase'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                🗑️ Erase
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">🎨 Color Palette</h3>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    selectedColor === color
                      ? 'border-black scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Grid Size */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📐 Grid Size</h3>
            <div className="space-y-2">
              {[8, 12, 16, 20, 24].map((size) => (
                <button
                  key={size}
                  onClick={() => changeGridSize(size)}
                  className={`w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
                    gridSize === size
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Artworks */}
          {savedArtworks.length > 0 && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">💾 Saved Artworks</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedArtworks.map((artwork) => (
                  <button
                    key={artwork.id}
                    onClick={() => loadArtwork(artwork)}
                    className="w-full text-left px-3 py-2 bg-white rounded border hover:bg-gray-100 transition-colors text-sm"
                  >
                    <div className="font-medium">{artwork.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(artwork.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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

export default PixelArtCreator
