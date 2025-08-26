import React, { useState, useCallback, useRef, useEffect } from 'react'

interface Tile {
  id: string
  value: number
  row: number
  col: number
}

interface GameState {
  board: (Tile | null)[][]
  score: number
  combo: number
  gameOver: boolean
  nextTiles: number[]
  moveHistory: Array<{
    board: (Tile | null)[][]
    score: number
    combo: number
  }>
}

const NumberConnect: React.FC<{
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score: number) => void
  initialState?: any
  progress?: any
}> = ({ onComplete, onUpdate }) => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: [],
    score: 0,
    combo: 0,
    gameOver: false,
    nextTiles: [],
    moveHistory: []
  }))

  const [isDragging, setIsDragging] = useState(false)
  const [dragChain, setDragChain] = useState<Tile[]>([])
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const BOARD_WIDTH = 8
  const BOARD_HEIGHT = 6
  const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],  // Top-left, Top, Top-right
    [0, -1],           [0, 1],     // Left, Right
    [1, -1],  [1, 0],  [1, 1]     // Bottom-left, Bottom, Bottom-right
  ]

  // Initialize board with random tiles
  const initializeBoard = useCallback((): (Tile | null)[][] => {
    const board: (Tile | null)[][] = []
    const possibleValues = [2, 4, 8, 16, 32, 64, 128]
    
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      board[row] = []
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[row][col] = {
          id: `tile-${row}-${col}-${Date.now()}`,
          value: possibleValues[Math.floor(Math.random() * possibleValues.length)],
          row,
          col
        }
      }
    }
    return board
  }, [])

  // Generate next tiles
  const generateNextTiles = useCallback((): number[] => {
    const tiles: number[] = []
    const possibleValues = [2, 4, 8, 16, 32, 64, 128]
    
    for (let i = 0; i < 3; i++) {
      tiles.push(possibleValues[Math.floor(Math.random() * possibleValues.length)])
    }
    return tiles
  }, [])

  // Initialize game
  useEffect(() => {
    const board = initializeBoard()
    const nextTiles = generateNextTiles()
    setGameState(prev => ({
      ...prev,
      board,
      nextTiles,
      moveHistory: [{ board: JSON.parse(JSON.stringify(board)), score: 0, combo: 0 }]
    }))
  }, [initializeBoard, generateNextTiles])

  // Check if a chain is valid (must start with 2 identical numbers)
  const isValidChain = useCallback((chain: Tile[]): boolean => {
    if (chain.length < 2) return false
    return chain[0].value === chain[1].value
  }, [])

  // Calculate final merged value through continuous doubling
  const calculateMergedValue = useCallback((chain: Tile[]): number => {
    if (chain.length < 2) return 0
    
    let currentValue = chain[0].value
    
    // Start with the first value, then double for each additional tile
    for (let i = 1; i < chain.length; i++) {
      currentValue *= 2
    }
    
    return currentValue
  }, [])

  // Calculate score for a chain
  const calculateScore = useCallback((chain: Tile[], finalValue: number): number => {
    const baseScore = finalValue
    const comboBonus = Math.max(0, chain.length - 2) * 10
    return baseScore + comboBonus
  }, [])

  // Find all possible moves
  const findPossibleMoves = useCallback((board: (Tile | null)[][]): boolean => {
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (!board[row][col]) continue
        
        // Check all 8 directions
        for (const [dRow, dCol] of DIRECTIONS) {
          const chain = [board[row][col]!]
          let currentRow = row + dRow
          let currentCol = col + dCol
          
          while (
            currentRow >= 0 && currentRow < BOARD_HEIGHT &&
            currentCol >= 0 && currentCol < BOARD_WIDTH &&
            board[currentRow][currentCol]
          ) {
            chain.push(board[currentRow][currentCol]!)
            if (isValidChain(chain)) {
              return true // Found a valid move
            }
            currentRow += dRow
            currentCol += dCol
          }
        }
      }
    }
    return false
  }, [isValidChain])

  // Spawn new tiles to fill empty spaces
  const spawnNewTiles = useCallback((board: (Tile | null)[][], nextTiles: number[]): { board: (Tile | null)[][], newNextTiles: number[] } => {
    const newBoard = board.map(row => [...row])
    const emptyCells: Array<{ row: number; col: number }> = []
    
    // Find empty cells
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (!newBoard[row][col]) {
          emptyCells.push({ row, col })
        }
      }
    }
    
    // Spawn new tiles in all empty cells
    const newNextTiles = [...nextTiles]
    
    for (const { row, col } of emptyCells) {
      if (newNextTiles.length > 0) {
        newBoard[row][col] = {
          id: `tile-${row}-${col}-${Date.now()}`,
          value: newNextTiles.shift()!,
          row,
          col
        }
             } else {
         // Generate more tiles if needed
         const possibleValues = [2, 4, 8, 16, 32, 64, 128]
         newBoard[row][col] = {
           id: `tile-${row}-${col}-${Date.now()}`,
           value: possibleValues[Math.floor(Math.random() * possibleValues.length)],
           row,
           col
         }
       }
    }
    
    // Generate more next tiles if needed
    while (newNextTiles.length < 3) {
      newNextTiles.push(Math.random() < 0.7 ? 2 : 4)
    }
    
    return { board: newBoard, newNextTiles }
  }, [])

  // Handle mouse/touch events
  const handleMouseDown = useCallback((e: React.MouseEvent, row: number, col: number) => {
    if (!gameState.board[row][col]) return
    
    setIsDragging(true)
    setDragStart({ row, col })
    setDragChain([gameState.board[row][col]!])
  }, [gameState.board])

  const handleMouseEnter = useCallback((e: React.MouseEvent, row: number, col: number) => {
    if (!isDragging || !dragStart || !gameState.board[row][col]) return
    
    // Check if this tile can be added to the chain (must be same value as first tile)
    const newChain = [...dragChain, gameState.board[row][col]!]
    if (isValidChain(newChain)) {
      setDragChain(newChain)
    }
  }, [isDragging, dragStart, dragChain, gameState.board, isValidChain])

  const handleMouseUp = useCallback(() => {
    if (!isDragging || dragChain.length < 2) {
      setIsDragging(false)
      setDragChain([])
      setDragStart(null)
      return
    }

    // Execute the move
    const finalValue = calculateMergedValue(dragChain)
    const scoreGain = calculateScore(dragChain, finalValue)
    
    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row])
      
      // Remove all tiles in the chain
      for (const tile of dragChain) {
        newBoard[tile.row][tile.col] = null
      }
      
      // Place the merged tile at the last position
      const lastTile = dragChain[dragChain.length - 1]
      newBoard[lastTile.row][lastTile.col] = {
        id: `merged-${Date.now()}`,
        value: finalValue,
        row: lastTile.row,
        col: lastTile.col
      }
      
      // Spawn new tiles to fill all empty spaces
      const { board: boardWithNewTiles, newNextTiles } = spawnNewTiles(newBoard, prev.nextTiles)
      
      // Check for game over
      const gameOver = !findPossibleMoves(boardWithNewTiles)
      
      const newState = {
        ...prev,
        board: boardWithNewTiles,
        score: prev.score + scoreGain,
        combo: prev.combo + 1,
        nextTiles: newNextTiles,
        gameOver,
        moveHistory: [...prev.moveHistory, {
          board: JSON.parse(JSON.stringify(prev.board)),
          score: prev.score,
          combo: prev.combo
        }]
      }
      
      onUpdate(newState, newState.score)
      if (gameOver) {
        onComplete(newState.score, false)
      }
      
      return newState
    })
    
    setIsDragging(false)
    setDragChain([])
    setDragStart(null)
  }, [isDragging, dragChain, calculateMergedValue, calculateScore, spawnNewTiles, findPossibleMoves, onUpdate, onComplete])

  // Undo last move
  const undoMove = useCallback(() => {
    setGameState(prev => {
      if (prev.moveHistory.length <= 1) return prev
      
      const lastMove = prev.moveHistory[prev.moveHistory.length - 1]
      const newHistory = prev.moveHistory.slice(0, -1)
      
      return {
        ...prev,
        board: lastMove.board,
        score: lastMove.score,
        combo: lastMove.combo,
        moveHistory: newHistory,
        gameOver: false
      }
    })
  }, [])

  // Reset game
  const resetGame = useCallback(() => {
    const board = initializeBoard()
    const nextTiles = generateNextTiles()
    setGameState(prev => ({
      ...prev,
      board,
      score: 0,
      combo: 0,
      gameOver: false,
      nextTiles,
      moveHistory: [{ board: JSON.parse(JSON.stringify(board)), score: 0, combo: 0 }]
    }))
  }, [initializeBoard, generateNextTiles])

  // Get tile color based on value
  const getTileColor = useCallback((value: number): string => {
    const colors = {
      2: 'bg-red-200',
      4: 'bg-orange-200',
      8: 'bg-yellow-200',
      16: 'bg-green-200',
      32: 'bg-blue-200',
      64: 'bg-purple-200',
      128: 'bg-pink-200',
      256: 'bg-indigo-200',
      512: 'bg-teal-200',
      1024: 'bg-cyan-200',
      2048: 'bg-rose-200'
    }
    return colors[value as keyof typeof colors] || 'bg-gray-200'
  }, [])

  // Check if a tile is in the current drag chain
  const isInDragChain = useCallback((tile: Tile): boolean => {
    return dragChain.some(chainTile => chainTile.id === tile.id)
  }, [dragChain])

  if (gameState.gameOver) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Game Over!</h1>
          <p className="text-xl mb-4">Final Score: {gameState.score}</p>
          <p className="text-lg mb-6">No more moves possible</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-200"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔗 Number Connect</h1>
        <p className="text-gray-600">Connect and merge numbers to score points!</p>
      </div>

      {/* Score and Combo */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">Score</div>
          <div className="text-lg text-gray-800">{gameState.score}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">Combo</div>
          <div className="text-lg text-gray-800">{gameState.combo}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">Next Tiles</div>
          <div className="flex space-x-2">
            {gameState.nextTiles.map((value, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${getTileColor(value)}`}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div 
        ref={boardRef}
        className="grid gap-1 mx-auto mb-6"
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
          maxWidth: 'fit-content'
        }}
        onMouseLeave={handleMouseUp}
      >
        {gameState.board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-16 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-200
                ${tile ? getTileColor(tile.value) : 'bg-gray-100'}
                ${isDragging && tile && isInDragChain(tile) ? 'ring-4 ring-yellow-400 scale-110' : ''}
                ${isDragging && tile && !isInDragChain(tile) ? 'opacity-50' : ''}
              `}
              onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
              onMouseEnter={(e) => handleMouseEnter(e, rowIndex, colIndex)}
              onMouseUp={handleMouseUp}
            >
              {tile ? tile.value : ''}
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={undoMove}
          disabled={gameState.moveHistory.length <= 1}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-200"
        >
          ↩️ Undo
        </button>
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors duration-200"
        >
          🔄 Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How to Play:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Click and drag to connect identical numbers (same value)</li>
          <li>• Connect at least 2 tiles to start a chain</li>
          <li>• Each additional tile doubles the final value: 2→4→8→16→32→64→128...</li>
          <li>• Longer chains give higher scores and bonus combo points</li>
          <li>• New tiles spawn to fill empty spaces after each move</li>
          <li>• Game ends when no more moves are possible</li>
        </ul>
      </div>
    </div>
  )
}

export default NumberConnect
