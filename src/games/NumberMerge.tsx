import React, { useState, useCallback } from 'react'

interface Block {
  id: string
  value: number
  x: number
  y: number
}

interface GameState {
  board: (Block | null)[][]
  nextBlock: Block
  score: number
  combo: number
  gameOver: boolean
  history: GameState[]
}

const BOARD_SIZE = 6
const INITIAL_NUMBERS = [2, 4]

const NumberMerge: React.FC<{
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score: number) => void
  initialState?: any
  progress?: any
}> = ({ onComplete, onUpdate }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialBoard: (Block | null)[][] = Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null)
    )

    return {
      board: initialBoard,
      nextBlock: generateRandomBlock(),
      score: 0,
      combo: 0,
      gameOver: false,
      history: []
    }
  })

  function generateRandomBlock(): Block {
    const value = INITIAL_NUMBERS[Math.floor(Math.random() * INITIAL_NUMBERS.length)]
    return {
      id: `block-${Date.now()}-${Math.random()}`,
      value,
      x: -1,
      y: -1
    }
  }

  const saveGameState = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      history: [{ ...prev, history: [] }] // Keep only the last state for single undo
    }))
  }, [])

  const dropBlock = useCallback((column: number) => {
    if (gameState.gameOver) return

    saveGameState()

    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row])
      const newState = { ...prev, board: newBoard }

      // Find the lowest empty position in the column
      let row = BOARD_SIZE - 1
      while (row >= 0 && newBoard[row][column] !== null) {
        row--
      }

      if (row < 0) return prev // Column is full

      // Place the block
      const newBlock: Block = {
        ...prev.nextBlock,
        x: column,
        y: row
      }
      newBoard[row][column] = newBlock

      // Process merges and gravity - processMerges handles everything internally
      const mergeResult = processMerges(newBoard)
      const comboCount = mergeResult.comboCount
      const totalScore = prev.score + mergeResult.score

      // Generate next block
      const nextBlock = generateRandomBlock()

      // Check game over
      const gameOver = isGameOver(newBoard)

      const finalState = {
        ...newState,
        nextBlock,
        score: totalScore,
        combo: comboCount,
        gameOver
      }

      // Update progress
      onUpdate(finalState, totalScore)

      if (gameOver) {
        onComplete(totalScore, false)
      }

      return finalState
    })
  }, [gameState.gameOver, saveGameState, onUpdate, onComplete])

  function processMerges(board: (Block | null)[][]): { merged: boolean; score: number; comboCount: number } {
    let totalMerged = false
    let totalScore = 0
    let comboCount = 0

    // Keep processing merges until no more are found
    let continueMerging = true
    while (continueMerging) {
      continueMerging = false
      let roundMerged = false
      let roundScore = 0

      // Check all horizontal merges (left to right)
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE - 1; col++) {
          const current = board[row][col]
          const next = board[row][col + 1]

          if (current && next && current.value === next.value) {
            // Merge blocks - keep the left one, remove the right one
            const mergedValue = current.value * 2
            board[row][col] = {
              id: `merged-${Date.now()}-${Math.random()}`,
              value: mergedValue,
              x: col,
              y: row
            }
            board[row][col + 1] = null
            roundMerged = true
            roundScore += mergedValue
          }
        }
      }

      // Check all vertical merges (top to bottom)
      for (let col = 0; col < BOARD_SIZE; col++) {
        for (let row = 0; row < BOARD_SIZE - 1; row++) {
          const current = board[row][col]
          const below = board[row + 1][col]

          if (current && below && current.value === below.value) {
            // Merge blocks - keep the top one, remove the bottom one
            const mergedValue = current.value * 2
            board[row][col] = {
              id: `merged-${Date.now()}-${Math.random()}`,
              value: mergedValue,
              x: col,
              y: row
            }
            board[row + 1][col] = null
            roundMerged = true
            roundScore += mergedValue
          }
        }
      }

      // If we found any merges this round, apply gravity and continue
      if (roundMerged) {
        continueMerging = true
        totalMerged = true
        totalScore += roundScore
        comboCount++
        applyGravity(board)
      }
    }

    return { merged: totalMerged, score: totalScore, comboCount }
  }

  function applyGravity(board: (Block | null)[][]) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Collect non-null blocks in this column
      const blocks: Block[] = []
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (board[row][col]) {
          blocks.push(board[row][col]!)
        }
        board[row][col] = null
      }

      // Place blocks from bottom up
      for (let i = 0; i < blocks.length; i++) {
        const row = BOARD_SIZE - 1 - i
        board[row][col] = { ...blocks[i], y: row }
      }
    }
  }

  function isGameOver(board: (Block | null)[][]): boolean {
    // Check if board is full
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!board[row][col]) {
          return false // Found empty space
        }
      }
    }

    // Check if any merges are possible
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const current = board[row][col]
        if (!current) continue

        // Check right neighbor
        if (col < BOARD_SIZE - 1) {
          const right = board[row][col + 1]
          if (right && current.value === right.value) {
            return false // Can merge horizontally
          }
        }

        // Check below neighbor
        if (row < BOARD_SIZE - 1) {
          const below = board[row + 1][col]
          if (below && current.value === below.value) {
            return false // Can merge vertically
          }
        }
      }
    }

    return true // Board full and no merges possible
  }

  const undoMove = useCallback(() => {
    if (gameState.history.length === 0) return

    setGameState(prev => {
      const lastState = prev.history[0] // Get the single saved state
      return {
        ...lastState,
        history: [] // Clear history after using the single undo
      }
    })
  }, [gameState.history])

  const resetGame = useCallback(() => {
    const initialBoard: (Block | null)[][] = Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null)
    )

    setGameState({
      board: initialBoard,
      nextBlock: generateRandomBlock(),
      score: 0,
      combo: 0,
      gameOver: false,
      history: []
    })
  }, [])

  const getBlockColor = (value: number): string => {
    const colors = {
      2: 'bg-blue-200',
      4: 'bg-blue-300',
      8: 'bg-green-300',
      16: 'bg-green-400',
      32: 'bg-yellow-300',
      64: 'bg-yellow-400',
      128: 'bg-orange-300',
      256: 'bg-orange-400',
      512: 'bg-red-300',
      1024: 'bg-red-400',
      2048: 'bg-purple-400'
    }
    return colors[value as keyof typeof colors] || 'bg-gray-400'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔢 Number Merge</h1>
        <p className="text-gray-600">Drop blocks and merge numbers to get high scores!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
          <div className="text-sm text-gray-600">Score</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{gameState.combo}</div>
          <div className="text-sm text-gray-600">Combo</div>
        </div>

        {/* Next Block Preview */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">Next</div>
          <div className={`inline-block w-16 h-16 ${getBlockColor(gameState.nextBlock.value)} rounded-lg flex items-center justify-center text-xl font-bold border-2 border-gray-400`}>
            {gameState.nextBlock.value}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-6 gap-2 mb-6 p-4 bg-gray-100 rounded-lg">
        {gameState.board.map((row, rowIndex) =>
          row.map((block, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`aspect-square rounded-lg border-2 border-gray-300 flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-200 ${
                block ? getBlockColor(block.value) : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => !block && dropBlock(colIndex)}
            >
              {block?.value || ''}
            </div>
          ))
        )}
      </div>

      {/* Column Indicators */}
      <div className="grid grid-cols-6 gap-2 mb-6">
        {Array.from({ length: BOARD_SIZE }, (_, col) => (
          <button
            key={col}
            className="aspect-square bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors duration-200 flex items-center justify-center"
            onClick={() => dropBlock(col)}
            disabled={gameState.gameOver}
          >
            ↓
          </button>
        ))}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={undoMove}
          disabled={gameState.history.length === 0 || gameState.gameOver}
          title={gameState.history.length === 0 ? "No moves to undo" : "Undo last move (one time only)"}
        >
          ↶ Undo {gameState.history.length > 0 && "(1 left)"}
        </button>

        <button
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors duration-200"
          onClick={resetGame}
        >
          🔄 Reset
        </button>
      </div>

      {/* Game Over Modal */}
      {gameState.gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
            <p className="text-xl mb-2">Final Score: <span className="font-bold text-blue-600">{gameState.score}</span></p>
            <p className="text-lg mb-6">Max Combo: <span className="font-bold text-green-600">{gameState.combo}</span></p>
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-200"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How to Play:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Click on a column to drop the next block</li>
          <li>• Blocks with the same number merge when they touch</li>
          <li>• Get combos by creating multiple merges in one move</li>
          <li>• Higher numbers = more points!</li>
          <li>• Use Undo once to go back one move if needed</li>
        </ul>
      </div>
    </div>
  )
}

export default NumberMerge
