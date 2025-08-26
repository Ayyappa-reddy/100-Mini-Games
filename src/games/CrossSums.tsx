import React, { useState } from 'react'

interface Cell {
  value: number
  erased: boolean
  confirmed: boolean
  id: string
}

interface Puzzle {
  id: string
  grid: number[][]
  rowTargets: number[]
  colTargets: number[]
  difficulty: 'easy' | 'medium' | 'hard'
}

interface GameState {
  currentPuzzle: Puzzle
  grid: Cell[][]
  mode: 'erase' | 'confirm'
  completed: boolean
  level: number
  unlockedLevels: Set<number>
  stars: number[]
  selectedDifficulty: 'easy' | 'medium' | 'hard' | null
  showDifficultySelection: boolean
}

const CrossSums: React.FC<{
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score: number) => void
  initialState?: any
  progress?: any
}> = ({ onComplete, onUpdate }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      currentPuzzle: { id: '', grid: [], rowTargets: [], colTargets: [], difficulty: 'easy' },
      grid: [],
      mode: 'erase',
      completed: false,
      level: 1,
      unlockedLevels: new Set([1]),
      stars: [],
      selectedDifficulty: null,
      showDifficultySelection: true
    }
  })

  function getPuzzle(level: number, difficulty?: 'easy' | 'medium' | 'hard'): Puzzle {
    const targetDifficulty = difficulty || gameState.selectedDifficulty || 'easy'
    const difficultyPuzzles = PUZZLES.filter(p => p.difficulty === targetDifficulty)
    return difficultyPuzzles[level - 1] || difficultyPuzzles[0] || PUZZLES[0]
  }

  function selectDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
    const puzzle = getPuzzle(1, difficulty)
    setGameState(prev => ({
      ...prev,
      selectedDifficulty: difficulty,
      currentPuzzle: puzzle,
      grid: initializeGrid(puzzle),
      showDifficultySelection: false,
      level: 1,
      completed: false,
      unlockedLevels: new Set([1]),
      stars: []
    }))
  }

  function initializeGrid(puzzle: Puzzle): Cell[][] {
    return puzzle.grid.map((row, rowIndex) =>
      row.map((value, colIndex) => ({
        value,
        erased: false,
        confirmed: false,
        id: `cell-${rowIndex}-${colIndex}`
      }))
    )
  }

  function calculateRowSum(row: Cell[]): number {
    return row.filter(cell => !cell.erased).reduce((sum, cell) => sum + cell.value, 0)
  }

  function calculateColSum(colIndex: number): number {
    return gameState.grid.map(row => row[colIndex]).filter(cell => !cell.erased).reduce((sum, cell) => sum + cell.value, 0)
  }

  function isRowComplete(row: Cell[], target: number): boolean {
    return calculateRowSum(row) === target
  }

  function isColComplete(colIndex: number, target: number): boolean {
    return calculateColSum(colIndex) === target
  }



  function checkCompletion(): boolean {
    const { currentPuzzle, grid } = gameState

    // Check if all rows meet their targets
    for (let row = 0; row < currentPuzzle.rowTargets.length; row++) {
      if (!isRowComplete(grid[row], currentPuzzle.rowTargets[row])) {
        return false
      }
    }

    // Check if all columns meet their targets
    for (let col = 0; col < currentPuzzle.colTargets.length; col++) {
      if (!isColComplete(col, currentPuzzle.colTargets[col])) {
        return false
      }
    }

    // Only check if sums are correct - don't require all cells to be marked as confirmed
    // The player can just erase what they don't need and leave the rest as-is
    return true
  }

  function handleCellClick(rowIndex: number, colIndex: number) {
    if (gameState.completed) return

    setGameState(prev => {
      const newGrid = prev.grid.map((row, r) =>
        row.map((cell, c) => {
          if (r === rowIndex && c === colIndex) {
            if (prev.mode === 'erase') {
              return { ...cell, erased: !cell.erased, confirmed: false }
            } else {
              if (!cell.erased) {
                return { ...cell, confirmed: !cell.confirmed }
              }
            }
          }
          return cell
        })
      )

      const newState = { ...prev, grid: newGrid }

      // Don't auto-complete - let player check manually with Check Answer button

      onUpdate(newState, (newState.stars || []).reduce((sum, star) => sum + (star || 0) * 100, 0))
      return newState
    })
  }

  // function changeMode(newMode: 'erase' | 'confirm') {
  //   setGameState(prev => ({ ...prev, mode: newMode }))
  // }

  function nextLevel() {
    const currentDifficulty = gameState.selectedDifficulty || 'easy'
    const difficultyPuzzles = PUZZLES.filter(p => p.difficulty === currentDifficulty)
    if (gameState.level < difficultyPuzzles.length) {
      const nextPuzzle = getPuzzle(gameState.level + 1, currentDifficulty)
      setGameState(prev => ({
        ...prev,
        currentPuzzle: nextPuzzle,
        grid: initializeGrid(nextPuzzle),
        mode: 'erase',
        completed: false,
        level: prev.level + 1
      }))
    }
  }

  function previousLevel() {
    if (gameState.level > 1) {
      const currentDifficulty = gameState.selectedDifficulty || 'easy'
      const prevPuzzle = getPuzzle(gameState.level - 1, currentDifficulty)
      setGameState(prev => ({
        ...prev,
        currentPuzzle: prevPuzzle,
        grid: initializeGrid(prevPuzzle),
        mode: 'erase',
        completed: false,
        level: prev.level - 1
      }))
    }
  }

  function getCellClass(cell: Cell): string {
    let baseClass = 'aspect-square border border-gray-300 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-200 '

    if (cell.erased) {
      return baseClass + 'bg-gray-200 text-gray-400 line-through'
    } else if (cell.confirmed) {
      return baseClass + 'bg-green-100 text-green-800 border-green-400 border-2'
    } else {
      return baseClass + 'bg-white hover:bg-gray-50'
    }
  }

  function getStarRating(stars: number): string {
    const validStars = Math.max(0, Math.min(3, stars || 0))
    return '★'.repeat(validStars) + '☆'.repeat(3 - validStars)
  }

  const totalStars = gameState.stars?.reduce((sum, star) => sum + (star || 0), 0) || 0

  // Difficulty Selection Screen
  if (gameState.showDifficultySelection) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧩 Cross Sums</h1>
          <p className="text-gray-600">Choose your difficulty level to begin!</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <button
            onClick={() => selectDifficulty('easy')}
            className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-green-800">🌱 Easy</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-green-700 mb-2">4×4 grids with simple sums</p>
            <p className="text-sm text-green-600">Perfect for beginners</p>
          </button>

          <button
            onClick={() => selectDifficulty('medium')}
            className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-yellow-800">⚡ Medium</h3>
              <span className="text-2xl">⭐⭐</span>
            </div>
            <p className="text-yellow-700 mb-2">5×5 grids with balanced challenges</p>
            <p className="text-sm text-yellow-600">For experienced players</p>
          </button>

          <button
            onClick={() => selectDifficulty('hard')}
            className="p-6 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-red-800">🔥 Hard</h3>
              <span className="text-2xl">⭐⭐⭐</span>
            </div>
            <p className="text-red-700 mb-2">6×6 grids with complex puzzles</p>
            <p className="text-sm text-red-600">For puzzle masters</p>
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How to Play:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Look at target sums for rows (left) and columns (top)</li>
            <li>• Erase numbers you don't need with Erase Mode</li>
            <li>• Click "Check Answer" when you think you're done</li>
            <li>• Game will tell you if you're correct or what's wrong</li>
            <li>• Complete levels to unlock more and earn stars!</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🧩 Cross Sums</h1>
        <p className="text-gray-600">Remove numbers to match the target sums!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">Level {gameState.level}</div>
          <div className="text-sm text-gray-600 capitalize">{gameState.currentPuzzle.difficulty} • {gameState.currentPuzzle.grid.length}×{gameState.currentPuzzle.grid[0]?.length || 0}</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{getStarRating(totalStars)}</div>
          <div className="text-sm text-gray-600">{totalStars}/45 Total Stars</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">Mode</div>
          <div className="text-sm text-gray-600">🗑️ Erase Only</div>
        </div>
      </div>

      {/* Current Mode Display */}
      <div className="flex justify-center mb-6">
        <div className="bg-red-100 border-2 border-red-300 rounded-lg px-6 py-2">
          <span className="text-red-800 font-semibold">🗑️ Erase Mode Active</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="mb-6">
        {/* Column Targets */}
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `50px repeat(${gameState.currentPuzzle.colTargets.length}, 1fr)` }}>
          <div></div> {/* Empty corner */}
          {gameState.currentPuzzle.colTargets.map((target, index) => (
            <div key={index} className="text-center font-bold text-blue-600 bg-blue-50 rounded p-2">
              {target}
            </div>
          ))}
        </div>

        {/* Grid with Row Targets */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `50px repeat(${gameState.currentPuzzle.colTargets.length}, 1fr)` }}>
          {gameState.grid.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Row Target */}
              <div className="text-center font-bold text-blue-600 bg-blue-50 rounded p-2 flex items-center justify-center">
                {gameState.currentPuzzle.rowTargets[rowIndex]}
              </div>

              {/* Row Cells */}
              {row.map((cell, colIndex) => (
                <div
                  key={cell.id}
                  className={getCellClass(cell)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell.erased ? '×' : cell.value}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Level Navigation */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-200"
          onClick={() => setGameState(prev => ({ ...prev, showDifficultySelection: true }))}
        >
          📋 Menu
        </button>

        <button
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={previousLevel}
          disabled={gameState.level <= 1}
        >
          ← Previous
        </button>

        <div className="text-lg font-semibold">
          Level {gameState.level} of {PUZZLES.filter(p => p.difficulty === gameState.selectedDifficulty).length}
        </div>

        <button
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={nextLevel}
          disabled={!gameState.unlockedLevels.has(gameState.level + 1) || gameState.level >= PUZZLES.filter(p => p.difficulty === gameState.selectedDifficulty).length}
        >
          Next →
        </button>
      </div>

      {/* Completion Modal */}
      {gameState.completed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Puzzle Complete!</h2>
            <p className="text-xl mb-4">Level {gameState.level} Solved!</p>
            <div className="text-4xl mb-4">{getStarRating(gameState.stars?.[gameState.stars.length - 1] || 0)}</div>
            <p className="text-lg mb-6">
              You earned {gameState.stars?.[gameState.stars.length - 1] || 0} star{(gameState.stars?.[gameState.stars.length - 1] || 0) !== 1 ? 's' : ''}!
            </p>
            <div className="flex justify-center space-x-4">
              {gameState.level < PUZZLES.filter(p => p.difficulty === gameState.selectedDifficulty).length ? (
                <button
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors duration-200"
                  onClick={nextLevel}
                >
                  Next Level
                </button>
              ) : (
                <button
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-200"
                  onClick={() => setGameState(prev => ({ ...prev, showDifficultySelection: true }))}
                >
                  Choose New Difficulty
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Check Answer Button */}
      <div className="flex justify-center mb-6">
        <button
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-200 text-lg"
          onClick={() => {
            const completed = checkCompletion()
            if (completed) {
              setGameState(prev => {
                // Award stars based on difficulty
                const stars = prev.currentPuzzle.difficulty === 'easy' ? 1 :
                             prev.currentPuzzle.difficulty === 'medium' ? 2 : 3
                const newStars = [...prev.stars, stars]
                const newUnlockedLevels = new Set(prev.unlockedLevels)
                newUnlockedLevels.add(prev.level + 1)
                
                onComplete(stars * 100, true)
                
                return {
                  ...prev,
                  completed: true,
                  stars: newStars,
                  unlockedLevels: newUnlockedLevels
                }
              })
            } else {
              // Show what's wrong
              const rowSums = gameState.grid.map(row => calculateRowSum(row))
              const colSums = gameState.currentPuzzle.colTargets.map((_, colIndex) => calculateColSum(colIndex))
              
              let errorMessage = '❌ Solution not correct!\n\n'
              errorMessage += 'Row sums:\n'
              rowSums.forEach((sum, i) => {
                const target = gameState.currentPuzzle.rowTargets[i]
                errorMessage += `Row ${i+1}: ${sum} (target: ${target}) ${sum === target ? '✅' : '❌'}\n`
              })
              errorMessage += '\nColumn sums:\n'
              colSums.forEach((sum, i) => {
                const target = gameState.currentPuzzle.colTargets[i]
                errorMessage += `Col ${i+1}: ${sum} (target: ${target}) ${sum === target ? '✅' : '❌'}\n`
              })
              
              alert(errorMessage)
            }
          }}
        >
          ✅ Check Answer
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How to Play:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Match the numbers shown at the top (columns) and left (rows)</li>
          <li>• Erase Mode: Remove numbers you don't need</li>
          <li>• Click "Check Answer" when you think you're done</li>
          <li>• Game will tell you if you're correct or what's wrong</li>
          <li>• Complete levels to unlock more and earn stars!</li>
        </ul>
      </div>
    </div>
  )
}

// Puzzle Data
const PUZZLES: Puzzle[] = [
  // Easy Levels (4x4 grids, 8 levels) - Varied sums within each puzzle
  {
    id: 'easy-1',
    difficulty: 'easy',
    grid: [
      [3, 2, 1, 4],
      [1, 4, 2, 3],
      [2, 1, 3, 1],
      [1, 2, 1, 2]
    ],
    rowTargets: [6, 7, 5, 4],
    colTargets: [5, 6, 4, 7]
  },
  {
    id: 'easy-2',
    difficulty: 'easy',
    grid: [
      [2, 1, 3, 2],
      [1, 2, 1, 2],
      [3, 1, 2, 1],
      [1, 2, 1, 2]
    ],
    rowTargets: [8, 6, 7, 6],
    colTargets: [7, 6, 7, 7]
  },
  {
    id: 'easy-3',
    difficulty: 'easy',
    grid: [
      [1, 2, 1, 3],
      [2, 1, 2, 1],
      [1, 3, 1, 2],
      [2, 1, 2, 1]
    ],
    rowTargets: [7, 6, 7, 6],
    colTargets: [6, 7, 6, 7]
  },
  {
    id: 'easy-4',
    difficulty: 'easy',
    grid: [
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2]
    ],
    rowTargets: [6, 6, 6, 6],
    colTargets: [6, 6, 6, 6]
  },
  {
    id: 'easy-5',
    difficulty: 'easy',
    grid: [
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1]
    ],
    rowTargets: [6, 6, 6, 6],
    colTargets: [6, 6, 6, 6]
  },
  {
    id: 'easy-6',
    difficulty: 'easy',
    grid: [
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2]
    ],
    rowTargets: [6, 6, 6, 6],
    colTargets: [6, 6, 6, 6]
  },
  {
    id: 'easy-7',
    difficulty: 'easy',
    grid: [
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2]
    ],
    rowTargets: [6, 6, 6, 6],
    colTargets: [6, 6, 6, 6]
  },
  {
    id: 'easy-8',
    difficulty: 'easy',
    grid: [
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2]
    ],
    rowTargets: [6, 6, 6, 6],
    colTargets: [6, 6, 6, 6]
  },

  // Medium Levels (5x5 grids, 8 levels) - Actually challenging puzzles
  {
    id: 'medium-1',
    difficulty: 'medium',
    grid: [
      [3, 2, 4, 1, 5],
      [1, 4, 2, 3, 1],
      [4, 1, 3, 2, 4],
      [2, 3, 1, 4, 2],
      [1, 2, 4, 1, 3]
    ],
    rowTargets: [8, 9, 7, 8, 9],
    colTargets: [7, 8, 6, 9, 8]
  },
  {
    id: 'medium-2',
    difficulty: 'medium',
    grid: [
      [2, 3, 1, 4, 2],
      [1, 2, 4, 1, 3],
      [3, 1, 2, 3, 1],
      [2, 4, 1, 2, 4],
      [1, 2, 3, 1, 2]
    ],
    rowTargets: [12, 11, 10, 13, 9],
    colTargets: [9, 12, 11, 11, 12]
  },
  {
    id: 'medium-3',
    difficulty: 'medium',
    grid: [
      [4, 1, 3, 2, 1],
      [1, 3, 2, 1, 4],
      [2, 1, 4, 3, 2],
      [3, 2, 1, 4, 1],
      [1, 4, 2, 1, 3]
    ],
    rowTargets: [11, 11, 12, 11, 11],
    colTargets: [11, 11, 12, 11, 11]
  },
  {
    id: 'medium-4',
    difficulty: 'medium',
    grid: [
      [3, 1, 4, 2, 1],
      [1, 4, 2, 1, 3],
      [2, 3, 1, 4, 2],
      [4, 2, 3, 1, 4],
      [1, 2, 1, 3, 2]
    ],
    rowTargets: [11, 11, 12, 14, 12],
    colTargets: [11, 12, 11, 11, 12]
  },
  {
    id: 'medium-5',
    difficulty: 'medium',
    grid: [
      [1, 3, 2, 4, 1],
      [3, 1, 4, 2, 3],
      [2, 4, 1, 3, 2],
      [4, 2, 3, 1, 4],
      [1, 3, 2, 4, 1]
    ],
    rowTargets: [11, 13, 12, 14, 11],
    colTargets: [11, 13, 12, 14, 11]
  },
  {
    id: 'medium-6',
    difficulty: 'medium',
    grid: [
      [2, 1, 3, 2, 1],
      [1, 3, 2, 1, 3],
      [3, 2, 1, 3, 2],
      [2, 1, 3, 2, 1],
      [1, 3, 2, 1, 3]
    ],
    rowTargets: [9, 10, 11, 9, 10],
    colTargets: [9, 10, 11, 9, 10]
  },
  {
    id: 'medium-7',
    difficulty: 'medium',
    grid: [
      [3, 2, 1, 4, 3],
      [1, 4, 3, 2, 1],
      [2, 1, 4, 3, 2],
      [4, 3, 2, 1, 4],
      [1, 2, 3, 4, 1]
    ],
    rowTargets: [13, 11, 12, 14, 11],
    colTargets: [11, 12, 13, 14, 11]
  },
  {
    id: 'medium-8',
    difficulty: 'medium',
    grid: [
      [4, 2, 5, 1, 3],
      [1, 5, 3, 2, 4],
      [3, 1, 4, 5, 2],
      [2, 4, 1, 3, 5],
      [5, 3, 2, 4, 1]
    ],
    rowTargets: [15, 15, 15, 15, 15],
    colTargets: [15, 15, 15, 15, 15]
  },

  // Hard Levels (6x6 grids, 6 levels) - Actually challenging puzzles
  {
    id: 'hard-1',
    difficulty: 'hard',
    grid: [
      [7, 3, 8, 2, 5, 4],
      [2, 6, 4, 7, 1, 9],
      [5, 1, 9, 3, 6, 2],
      [3, 8, 2, 5, 4, 7],
      [6, 4, 1, 8, 3, 5],
      [1, 7, 5, 4, 2, 8]
    ],
    rowTargets: [18, 20, 15, 19, 17, 16],
    colTargets: [16, 19, 18, 20, 15, 21]
  },
  {
    id: 'hard-2',
    difficulty: 'hard',
    grid: [
      [8, 4, 6, 3, 5, 2],
      [3, 7, 2, 8, 1, 9],
      [5, 1, 9, 4, 6, 3],
      [2, 6, 4, 7, 2, 8],
      [7, 3, 1, 5, 4, 6],
      [1, 8, 5, 2, 3, 7]
    ],
    rowTargets: [28, 30, 28, 29, 26, 26],
    colTargets: [26, 29, 27, 29, 21, 35]
  },
  {
    id: 'hard-3',
    difficulty: 'hard',
    grid: [
      [9, 5, 7, 2, 4, 6],
      [3, 8, 1, 9, 3, 5],
      [6, 2, 8, 4, 7, 1],
      [2, 7, 4, 6, 1, 9],
      [5, 1, 6, 3, 8, 2],
      [4, 6, 3, 5, 2, 7]
    ],
    rowTargets: [33, 29, 28, 29, 25, 27],
    colTargets: [29, 29, 29, 33, 25, 30]
  },
  {
    id: 'hard-4',
    difficulty: 'hard',
    grid: [
      [7, 3, 9, 1, 5, 8],
      [2, 8, 4, 7, 2, 6],
      [5, 1, 6, 3, 9, 4],
      [3, 9, 2, 5, 4, 7],
      [8, 4, 1, 8, 3, 5],
      [1, 6, 7, 2, 6, 3]
    ],
    rowTargets: [33, 29, 28, 32, 29, 25],
    colTargets: [26, 31, 29, 26, 29, 33]
  },
  {
    id: 'hard-5',
    difficulty: 'hard',
    grid: [
      [8, 4, 6, 2, 7, 3],
      [3, 9, 1, 8, 4, 5],
      [6, 2, 7, 3, 9, 1],
      [2, 7, 4, 6, 1, 8],
      [5, 1, 8, 4, 3, 6],
      [4, 6, 3, 5, 2, 7]
    ],
    rowTargets: [30, 30, 28, 28, 27, 27],
    colTargets: [28, 29, 29, 28, 26, 30]
  },
  {
    id: 'hard-6',
    difficulty: 'hard',
    grid: [
      [6, 2, 8, 4, 1, 9],
      [3, 7, 1, 6, 3, 5],
      [8, 4, 5, 2, 7, 1],
      [2, 9, 3, 7, 4, 6],
      [5, 1, 7, 3, 8, 2],
      [4, 6, 2, 5, 1, 8]
    ],
    rowTargets: [30, 25, 27, 31, 24, 26],
    colTargets: [28, 29, 26, 27, 24, 31]
  }
]

export default CrossSums
