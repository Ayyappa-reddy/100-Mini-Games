import { useState, useEffect } from 'react'

interface TicTacToeProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [board, setBoard] = useState<string[]>(initialState?.board || Array(9).fill(''))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>(initialState?.currentPlayer || 'X')
  const [gameOver, setGameOver] = useState(initialState?.gameOver || false)
  const [winner, setWinner] = useState<string | null>(initialState?.winner || null)
  const [score, setScore] = useState(0)

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ]

  const checkWinner = (boardState: string[]) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a]
      }
    }
    return null
  }

  const checkDraw = (boardState: string[]) => {
    return boardState.every(cell => cell !== '')
  }

  const getAvailableMoves = (boardState: string[]) => {
    return boardState.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1)
  }

  // Minimax algorithm for AI
  const minimax = (boardState: string[], depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(boardState)
    
    if (winner === 'O') return 10 - depth
    if (winner === 'X') return depth - 10
    if (checkDraw(boardState)) return 0
    
    const availableMoves = getAvailableMoves(boardState)
    
    if (isMaximizing) {
      let bestScore = -Infinity
      for (const move of availableMoves) {
        const newBoard = [...boardState]
        newBoard[move] = 'O'
        const score = minimax(newBoard, depth + 1, false)
        bestScore = Math.max(bestScore, score)
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (const move of availableMoves) {
        const newBoard = [...boardState]
        newBoard[move] = 'X'
        const score = minimax(newBoard, depth + 1, true)
        bestScore = Math.min(bestScore, score)
      }
      return bestScore
    }
  }

  const getBestMove = (boardState: string[]) => {
    const availableMoves = getAvailableMoves(boardState)
    
    // Add some randomness to make AI beatable (20% chance of making a random move)
    if (Math.random() < 0.2) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }
    
    let bestScore = -Infinity
    let bestMove = -1
    
    for (const move of availableMoves) {
      const newBoard = [...boardState]
      newBoard[move] = 'O'
      const score = minimax(newBoard, 0, false)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    return bestMove
  }

  const handleCellClick = (index: number) => {
    if (board[index] !== '' || gameOver || currentPlayer === 'O') return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const newWinner = checkWinner(newBoard)
    const isDraw = checkDraw(newBoard)

    if (newWinner) {
      setWinner(newWinner)
      setGameOver(true)
      const finalScore = newWinner === 'X' ? 100 : 0
      setScore(finalScore)
      onComplete(finalScore, newWinner === 'X')
    } else if (isDraw) {
      setGameOver(true)
      const finalScore = 25
      setScore(finalScore)
      onComplete(finalScore, false)
    } else {
      setCurrentPlayer('O')
    }

    onUpdate({ board: newBoard, currentPlayer: currentPlayer === 'X' ? 'O' : 'X', gameOver: newWinner || isDraw, winner: newWinner }, score)
  }

  useEffect(() => {
    if (currentPlayer === 'O' && !gameOver) {
      const timer = setTimeout(() => {
        const aiMove = getBestMove(board)
        if (aiMove !== -1) {
          const newBoard = [...board]
          newBoard[aiMove] = 'O'
          setBoard(newBoard)

          const newWinner = checkWinner(newBoard)
          const isDraw = checkDraw(newBoard)

          if (newWinner) {
            setWinner(newWinner)
            setGameOver(true)
            const finalScore = newWinner === 'X' ? 100 : 0
            setScore(finalScore)
            onComplete(finalScore, newWinner === 'X')
          } else if (isDraw) {
            setGameOver(true)
            const finalScore = 25
            setScore(finalScore)
            onComplete(finalScore, false)
          } else {
            setCurrentPlayer('X')
          }

          onUpdate({ board: newBoard, currentPlayer: 'X', gameOver: newWinner || isDraw, winner: newWinner }, score)
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, board, gameOver])

  const resetGame = () => {
    setBoard(Array(9).fill(''))
    setCurrentPlayer('X')
    setGameOver(false)
    setWinner(null)
    setScore(0)
    onUpdate({ board: Array(9).fill(''), currentPlayer: 'X', gameOver: false, winner: null }, 0)
  }

  const getStatusMessage = () => {
    if (winner) {
      return `Winner: ${winner}`
    } else if (gameOver) {
      return "It's a draw!"
    } else {
      return `Current player: ${currentPlayer}`
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tic Tac Toe</h2>
        <p className="text-gray-600 mb-4">{getStatusMessage()}</p>
        <div className="text-lg font-semibold text-primary-600">Score: {score}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={cell !== '' || gameOver || currentPlayer === 'O'}
            className="w-20 h-20 bg-gray-100 border-2 border-gray-300 rounded-lg text-2xl font-bold hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={resetGame}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          New Game
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">AI Opponent</h3>
        <p className="text-sm text-blue-800">
          You're playing against an AI that uses the minimax algorithm. It's smart but beatable - it occasionally makes random moves!
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

export default TicTacToe 