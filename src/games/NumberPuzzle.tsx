import { useState, useEffect } from 'react'

interface NumberPuzzleProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

const NumberPuzzle: React.FC<NumberPuzzleProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [board, setBoard] = useState<number[]>(initialState?.board || [])
  const [moves, setMoves] = useState(initialState?.moves || 0)
  const [score, setScore] = useState(initialState?.score || 0)
  const [gameComplete, setGameComplete] = useState(initialState?.gameComplete || false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  const BOARD_SIZE = 3
  const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE

  const createSolvedBoard = () => {
    return Array.from({ length: TOTAL_CELLS - 1 }, (_, i) => i + 1).concat(0)
  }

  const shuffleBoard = (board: number[]) => {
    const shuffled = [...board]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const initializeGame = () => {
    const solvedBoard = createSolvedBoard()
    const shuffledBoard = shuffleBoard(solvedBoard)
    setBoard(shuffledBoard)
    setMoves(0)
    setScore(0)
    setGameComplete(false)
    setStartTime(Date.now())
    
    onUpdate({ board: shuffledBoard, moves: 0, score: 0, gameComplete: false, startTime: Date.now() }, 0)
  }

  const isSolvable = (board: number[]) => {
    let inversions = 0
    for (let i = 0; i < board.length - 1; i++) {
      for (let j = i + 1; j < board.length; j++) {
        if (board[i] !== 0 && board[j] !== 0 && board[i] > board[j]) {
          inversions++
        }
      }
    }
    return inversions % 2 === 0
  }

  const canMove = (index: number) => {
    const emptyIndex = board.indexOf(0)
    const row = Math.floor(index / BOARD_SIZE)
    const emptyRow = Math.floor(emptyIndex / BOARD_SIZE)
    const col = index % BOARD_SIZE
    const emptyCol = emptyIndex % BOARD_SIZE

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    )
  }

  const moveTile = (index: number) => {
    if (!canMove(index) || gameComplete) return

    const emptyIndex = board.indexOf(0)
    const newBoard = [...board]
    ;[newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]]
    
    const newMoves = moves + 1
    setBoard(newBoard)
    setMoves(newMoves)

    // Check if puzzle is solved
    const solvedBoard = createSolvedBoard()
    if (JSON.stringify(newBoard) === JSON.stringify(solvedBoard)) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      const finalScore = Math.max(1000 - (newMoves * 10) - (timeSpent * 2), 100)
      setScore(finalScore)
      setGameComplete(true)
      onComplete(finalScore, true)
    }

    onUpdate({ board: newBoard, moves: newMoves, score, gameComplete: false }, score)
  }



  useEffect(() => {
    if (board.length === 0) {
      initializeGame()
    }
  }, [])

  useEffect(() => {
    if (board.length > 0 && !isSolvable(board)) {
      // If not solvable, shuffle again
      const solvedBoard = createSolvedBoard()
      const shuffledBoard = shuffleBoard(solvedBoard)
      setBoard(shuffledBoard)
    }
  }, [board])

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Number Puzzle</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Moves: {moves}</div>
          <div className="text-primary-600">Score: {score}</div>
        </div>
        
        {gameComplete && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
            🎉 Puzzle solved! Great job!
          </div>
        )}
      </div>

      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-3 gap-2 border-4 border-gray-300 p-2 rounded-lg bg-gray-100">
          {board.map((value, index) => (
            <button
              key={index}
              onClick={() => moveTile(index)}
              disabled={value === 0 || gameComplete}
              className={`w-16 h-16 text-xl font-bold rounded-lg border-2 transition-all duration-200 ${
                value === 0
                  ? 'bg-gray-300 border-gray-400 cursor-not-allowed'
                  : canMove(index) && !gameComplete
                  ? 'bg-blue-100 border-blue-300 hover:bg-blue-200 cursor-pointer'
                  : 'bg-white border-gray-300 cursor-not-allowed'
              }`}
            >
              {value === 0 ? '' : value}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={initializeGame}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          New Game
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
        <p className="text-sm text-gray-600">
          Click on a tile next to the empty space to move it. Arrange the numbers in order from 1 to 8 with the empty space in the bottom right.
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

export default NumberPuzzle 