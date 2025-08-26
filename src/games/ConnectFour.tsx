import React, { useState, useEffect, useCallback, useRef } from 'react'

interface ConnectFourProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

const ConnectFour: React.FC<ConnectFourProps> = ({ onComplete, onUpdate, initialState }) => {
  const [board, setBoard] = useState<(number | null)[][]>(() => 
    Array(6).fill(null).map(() => Array(7).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  // Initialize board
  const initializeBoard = useCallback(() => {
    return Array(6).fill(null).map(() => Array(7).fill(null))
  }, [])

  // Check if a column is full
  const isColumnFull = useCallback((col: number, board: (number | null)[][]) => {
    return board[0][col] !== null
  }, [])

  // Drop a piece in a column
  const dropPiece = useCallback((col: number, player: number, board: (number | null)[][]) => {
    if (isColumnFull(col, board)) return null

    const newBoard = board.map(row => [...row])
    for (let row = 5; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = player
        return newBoard
      }
    }
    return null
  }, [isColumnFull])

  // Check for win
  const checkWin = useCallback((board: (number | null)[][], player: number) => {
    // Check horizontal
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === player &&
            board[row][col + 1] === player &&
            board[row][col + 2] === player &&
            board[row][col + 3] === player) {
          return true
        }
      }
    }

    // Check vertical
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] === player &&
            board[row + 1][col] === player &&
            board[row + 2][col] === player &&
            board[row + 3][col] === player) {
          return true
        }
      }
    }

    // Check diagonal (positive slope)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === player &&
            board[row + 1][col + 1] === player &&
            board[row + 2][col + 2] === player &&
            board[row + 3][col + 3] === player) {
          return true
        }
      }
    }

    // Check diagonal (negative slope)
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] === player &&
            board[row - 1][col + 1] === player &&
            board[row - 2][col + 2] === player &&
            board[row - 3][col + 3] === player) {
          return true
        }
      }
    }

    return false
  }, [])

  // Check if board is full
  const isBoardFull = useCallback((board: (number | null)[][]) => {
    return board[0].every(cell => cell !== null)
  }, [])

  // Handle column click
  const handleColumnClick = useCallback((col: number) => {
    if (gameOver || currentPlayer === 2) return

    const newBoard = dropPiece(col, currentPlayer, board)
    if (!newBoard) return

    setBoard(newBoard)

    // Check for win
    if (checkWin(newBoard, currentPlayer)) {
      setGameOver(true)
      setWinner(currentPlayer)
      setScore(currentPlayer === 1 ? 1000 : 0)
      onComplete(currentPlayer === 1 ? 1000 : 0, true)
      return
    }

    // Check for draw
    if (isBoardFull(newBoard)) {
      setGameOver(true)
      setWinner(null)
      setScore(500)
      onComplete(500, true)
      return
    }

    setCurrentPlayer(2)
  }, [board, currentPlayer, gameOver, dropPiece, checkWin, isBoardFull])

  // AI move
  useEffect(() => {
    if (gameStarted && !gameOver && currentPlayer === 2) {
      const timer = setTimeout(() => {
        setBoard(prevBoard => {
          // Find available columns
          const availableColumns = []
          for (let col = 0; col < 7; col++) {
            if (!isColumnFull(col, prevBoard)) {
              availableColumns.push(col)
            }
          }

          if (availableColumns.length === 0) return prevBoard

          // Simple AI: try to win, then block player, then random
          let bestColumn = availableColumns[0]

          // Try to win
          for (const col of availableColumns) {
            const testBoard = dropPiece(col, 2, prevBoard)
            if (testBoard && checkWin(testBoard, 2)) {
              bestColumn = col
              break
            }
          }

          // Try to block player
          if (bestColumn === availableColumns[0]) {
            for (const col of availableColumns) {
              const testBoard = dropPiece(col, 1, prevBoard)
              if (testBoard && checkWin(testBoard, 1)) {
                bestColumn = col
                break
              }
            }
          }

          // Random move
          if (bestColumn === availableColumns[0]) {
            bestColumn = availableColumns[Math.floor(Math.random() * availableColumns.length)]
          }

          const newBoard = dropPiece(bestColumn, 2, prevBoard)
          if (!newBoard) return prevBoard

          // Check for win
          if (checkWin(newBoard, 2)) {
            setGameOver(true)
            setWinner(2)
            setScore(0)
            onComplete(0, true)
          } else if (isBoardFull(newBoard)) {
            setGameOver(true)
            setWinner(null)
            setScore(500)
            onComplete(500, true)
          } else {
            setCurrentPlayer(1)
          }

          return newBoard
        })
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameStarted, gameOver, dropPiece, checkWin, isBoardFull, isColumnFull])

  // Start game
  const startGame = () => {
    setGameStarted(true)
    setBoard(initializeBoard())
    setCurrentPlayer(1)
    setGameOver(false)
    setWinner(null)
    setScore(0)
  }

  // Initialize game (apply initialState only once to avoid render loops)
  const hasAppliedInitial = useRef(false)
  useEffect(() => {
    if (hasAppliedInitial.current) return
    if (initialState) {
      setBoard(initialState.board || initializeBoard())
      setCurrentPlayer(initialState.currentPlayer || 1)
      setGameOver(initialState.gameOver || false)
      setWinner(initialState.winner || null)
      setScore(initialState.score || 0)
      setGameStarted(initialState.gameStarted || false)
    } else {
      setBoard(initializeBoard())
    }
    hasAppliedInitial.current = true
  }, [initialState, initializeBoard])

  // Update game state
  useEffect(() => {
    onUpdate({
      board,
      currentPlayer,
      gameOver,
      winner,
      score,
      gameStarted
    }, score)
  }, [board, currentPlayer, gameOver, winner, score, gameStarted])

  if (!gameStarted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Four</h2>
        <p className="text-gray-600 mb-6">Connect four pieces in a row to win! Play against the computer.</p>
        <button
          onClick={startGame}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Connect Four</h2>
        <p className="text-gray-600">
          Current Player: <span className={`font-semibold ${currentPlayer === 1 ? 'text-red-600' : 'text-yellow-600'}`}>
            {currentPlayer === 1 ? 'Red' : 'Yellow'}
          </span>
        </p>
        {gameOver && (
          <p className="text-lg font-semibold text-green-600">
            {winner ? `Game Over! ${winner === 1 ? 'Red' : 'Yellow'} wins!` : 'Game Over! It\'s a draw!'}
          </p>
        )}
      </div>

      {/* Connect Four Board */}
      <div className="inline-block bg-blue-600 p-4 rounded-lg">
        {/* Use exact same spacing for header and cells to align visually */}
        <div className="grid grid-cols-7 gap-2 mb-2 px-2">
          {Array(7).fill(null).map((_, col) => (
            <div key={col} className="flex items-center justify-center">
              <button
                onClick={() => handleColumnClick(col)}
                disabled={gameOver || currentPlayer === 2 || isColumnFull(col, board)}
                className="w-10 h-10 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-400 rounded-full text-white text-xs font-bold transition-colors"
              >
                ↓
              </button>
            </div>
          ))}
        </div>

        {/* Game board */}
        <div className="p-2 rounded">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7 gap-2 px-2">
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center"
                >
                  {cell && (
                    <div className={`w-10 h-10 rounded-full ${cell === 1 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">Score: {score}</p>
        {gameOver && (
          <button
            onClick={startGame}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors mt-2"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  )
}

export default ConnectFour
