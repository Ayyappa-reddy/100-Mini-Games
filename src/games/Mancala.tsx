import React, { useState, useCallback, useEffect } from 'react'

interface Pit {
  id: number
  stones: number
  player: 'player1' | 'player2'
  isStore: boolean
}

interface GameState {
  pits: Pit[]
  currentPlayer: 'player1' | 'player2'
  gameOver: boolean
  winner: 'player1' | 'player2' | null
  moveHistory: Array<{
    pits: Pit[]
    currentPlayer: 'player1' | 'player2'
  }>
  lastMove: {
    fromPit: number
    path: number[]
    captured: boolean
  } | null
}

const Mancala: React.FC<{
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score: number) => void
  initialState?: any
  progress?: any
}> = ({ onComplete, onUpdate }) => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    pits: [],
    currentPlayer: 'player1',
    gameOver: false,
    winner: null,
    moveHistory: [],
    lastMove: null
  }))

  const [gameMode, setGameMode] = useState<'twoPlayer' | 'vsAI'>('twoPlayer')
  const [aiThinking, setAiThinking] = useState(false)
  // const [animating, setAnimating] = useState(false)
  // const animationRef = useRef<NodeJS.Timeout>()

  // Initialize board with 6 pits per player + 2 stores
  const initializeBoard = useCallback((): Pit[] => {
    const pits: Pit[] = []
    
    // Player 1 pits (bottom row, left to right)
    for (let i = 0; i < 6; i++) {
      pits.push({
        id: i,
        stones: 4,
        player: 'player1',
        isStore: false
      })
    }
    
    // Player 1 store (right side)
    pits.push({
      id: 6,
      stones: 0,
      player: 'player1',
      isStore: true
    })
    
    // Player 2 pits (top row, right to left)
    for (let i = 7; i < 13; i++) {
      pits.push({
        id: i,
        stones: 4,
        player: 'player2',
        isStore: false
      })
    }
    
    // Player 2 store (left side)
    pits.push({
      id: 13,
      stones: 0,
      player: 'player2',
      isStore: true
    })
    
    return pits
  }, [])

  // Initialize game
  useEffect(() => {
    const pits = initializeBoard()
    setGameState(prev => ({
      ...prev,
      pits,
      moveHistory: [{ pits: JSON.parse(JSON.stringify(pits)), currentPlayer: 'player1' }]
    }))
  }, [initializeBoard])

  // Get pit by ID
  const getPit = useCallback((id: number): Pit => {
    return gameState.pits.find(pit => pit.id === id)!
  }, [gameState.pits])

  // Check if a pit belongs to current player
  const isPlayerPit = useCallback((pitId: number): boolean => {
    const pit = getPit(pitId)
    return pit.player === gameState.currentPlayer && !pit.isStore
  }, [getPit, gameState.currentPlayer])

  // Get next pit in sequence (counterclockwise)
  const getNextPit = useCallback((currentPitId: number): number => {
    if (currentPitId === 6) return 7  // Player 1 store → Player 2 first pit
    if (currentPitId === 13) return 0 // Player 2 store → Player 1 first pit
    
    if (currentPitId < 6) {
      // Player 1 pits
      return currentPitId + 1
    } else {
      // Player 2 pits
      return currentPitId + 1
    }
  }, [])

  // Check if game is over
  const checkGameOver = useCallback((pits: Pit[]): boolean => {
    const player1Pits = pits.filter(pit => pit.player === 'player1' && !pit.isStore)
    const player2Pits = pits.filter(pit => pit.player === 'player2' && !pit.isStore)
    
    return player1Pits.every(pit => pit.stones === 0) || player2Pits.every(pit => pit.stones === 0)
  }, [])

  // End game and calculate winner
  const endGame = useCallback((pits: Pit[]) => {
    const newPits = [...pits]
    
    // Collect remaining stones
    for (let i = 0; i < 6; i++) {
      if (newPits[i].stones > 0) {
        newPits[6].stones += newPits[i].stones
        newPits[i].stones = 0
      }
    }
    
    for (let i = 7; i < 13; i++) {
      if (newPits[i].stones > 0) {
        newPits[13].stones += newPits[i].stones
        newPits[i].stones = 0
      }
    }
    
    const player1Score = newPits[6].stones
    const player2Score = newPits[13].stones
    const winner = player1Score > player2Score ? 'player1' : player2Score > player1Score ? 'player2' : null
    
    setGameState(prev => ({
      ...prev,
      pits: newPits,
      gameOver: true,
      winner
    }))
    
    // Calculate final score (difference between stores)
    const finalScore = Math.abs(player1Score - player2Score)
    onComplete(finalScore, true)
  }, [onComplete])

  // Execute a move
  const executeMove = useCallback(async (fromPitId: number) => {
    if (!isPlayerPit(fromPitId)) return
    
    const newPits = gameState.pits.map(pit => ({ ...pit }))
    const fromPit = newPits.find(pit => pit.id === fromPitId)!
    const stonesToMove = fromPit.stones
    
    if (stonesToMove === 0) return
    
    // Clear the source pit
    fromPit.stones = 0
    
    // Distribute stones
    let currentPitId = fromPitId
    let path: number[] = []
    let captured = false
    
    for (let i = 0; i < stonesToMove; i++) {
      currentPitId = getNextPit(currentPitId)
      
      // Skip opponent's store
      if (currentPitId === 6 && gameState.currentPlayer === 'player2') {
        currentPitId = getNextPit(currentPitId)
      }
      if (currentPitId === 13 && gameState.currentPlayer === 'player1') {
        currentPitId = getNextPit(currentPitId)
      }
      
      path.push(currentPitId)
      newPits[currentPitId].stones++
    }
    
    // Check for capture
    const lastPit = newPits[currentPitId]
    if (!lastPit.isStore && lastPit.player === gameState.currentPlayer && lastPit.stones === 1) {
      // Last stone landed in empty pit on player's side
      const oppositePitId = 12 - currentPitId // Calculate opposite pit
      const oppositePit = newPits[oppositePitId]
      
      if (oppositePit.stones > 0) {
        // Capture stones
        lastPit.stones += oppositePit.stones
        oppositePit.stones = 0
        captured = true
      }
    }
    
    // Check for extra turn
    const extraTurn = lastPit.isStore && lastPit.player === gameState.currentPlayer
    
    // Update game state
    const newCurrentPlayer = extraTurn ? gameState.currentPlayer : 
                           gameState.currentPlayer === 'player1' ? 'player2' : 'player1'
    
    setGameState(prev => ({
      ...prev,
      pits: newPits,
      currentPlayer: newCurrentPlayer,
      lastMove: { fromPit: fromPitId, path, captured },
      moveHistory: [...prev.moveHistory, {
        pits: JSON.parse(JSON.stringify(prev.pits)),
        currentPlayer: prev.currentPlayer
      }]
    }))
    
    // Check for game over
    if (checkGameOver(newPits)) {
      setTimeout(() => endGame(newPits), 1000)
    }
    
    // AI turn
    if (gameMode === 'vsAI' && newCurrentPlayer === 'player2' && !extraTurn) {
      setAiThinking(true)
      setTimeout(() => {
        makeAIMove(newPits)
        setAiThinking(false)
      }, 1000)
    }
    
    onUpdate({ pits: newPits, currentPlayer: newCurrentPlayer }, 0)
  }, [isPlayerPit, gameState.pits, gameState.currentPlayer, getNextPit, checkGameOver, endGame, gameMode, onUpdate])

  // Simple AI move
  const makeAIMove = useCallback((pits: Pit[]) => {
    const aiPits = pits.filter(pit => pit.player === 'player2' && !pit.isStore && pit.stones > 0)
    
    if (aiPits.length === 0) return
    
    // Simple strategy: prioritize pits that might give extra turns
    let bestPit = aiPits[0]
    let bestScore = 0
    
    for (const pit of aiPits) {
      let score = 0
      
      // Bonus for pits that might reach the store
      if (pit.stones >= 13 - pit.id) {
        score += 10
      }
      
      // Bonus for pits with more stones
      score += pit.stones
      
      if (score > bestScore) {
        bestScore = score
        bestPit = pit
      }
    }
    
    executeMove(bestPit.id)
  }, [executeMove])

  // Undo last move
  const undoMove = useCallback(() => {
    setGameState(prev => {
      if (prev.moveHistory.length <= 1) return prev
      
      const lastMove = prev.moveHistory[prev.moveHistory.length - 1]
      const newHistory = prev.moveHistory.slice(0, -1)
      
      return {
        ...prev,
        pits: lastMove.pits,
        currentPlayer: lastMove.currentPlayer,
        moveHistory: newHistory,
        lastMove: null
      }
    })
  }, [])

  // Reset game
  const resetGame = useCallback(() => {
    const pits = initializeBoard()
    setGameState(prev => ({
      ...prev,
      pits,
      currentPlayer: 'player1',
      gameOver: false,
      winner: null,
      moveHistory: [{ pits: JSON.parse(JSON.stringify(pits)), currentPlayer: 'player1' }],
      lastMove: null
    }))
  }, [initializeBoard])

  // Get pit styling
  const getPitStyle = useCallback((pit: Pit | undefined, pitId: number) => {
    if (!pit) return 'w-16 h-16 rounded-full border-2 border-gray-300 bg-gray-100'
    
    const baseStyle = `
      w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200
      ${pit.isStore ? 'w-20 h-20' : 'w-16 h-16'}
    `
    
    if (pit.isStore) {
      return `${baseStyle} ${pit.player === 'player1' ? 'bg-blue-100' : 'bg-red-100'}`
    }
    
    if (pit.stones === 0) {
      return `${baseStyle} bg-gray-50 text-gray-400 cursor-not-allowed`
    }
    
    if (isPlayerPit(pitId)) {
      return `${baseStyle} bg-blue-200 hover:bg-blue-300`
    } else {
      return `${baseStyle} bg-red-200 hover:bg-red-300`
    }
  }, [isPlayerPit])

  // Render stones in a pit
  const renderStones = useCallback((stones: number) => {
    if (stones === 0) return null
    
    if (stones <= 6) {
      return (
        <div className="flex flex-wrap justify-center items-center w-full h-full">
          {Array.from({ length: stones }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-yellow-500 rounded-full m-0.5"
            />
          ))}
        </div>
      )
    }
    
    return (
      <div className="text-xs font-bold text-gray-700">
        {stones}
      </div>
    )
  }, [])

  // Don't render if board isn't initialized
  if (gameState.pits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Mancala...</h1>
          <p className="text-gray-600">Initializing game board...</p>
        </div>
      </div>
    )
  }

  if (gameState.gameOver) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-4">Game Over!</h1>
          <p className="text-xl mb-4">
            {gameState.winner ? 
              `Winner: ${gameState.winner === 'player1' ? 'Player 1' : 'Player 2'}` : 
              'It\'s a tie!'
            }
          </p>
          <div className="text-lg mb-6">
            <p>Player 1: {gameState.pits[6]?.stones || 0} stones</p>
            <p>Player 2: {gameState.pits[13]?.stones || 0} stones</p>
          </div>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏺 Mancala</h1>
        <p className="text-gray-600">Classic Kalah variant - strategic stone distribution game</p>
      </div>

      {/* Game Mode Selection */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            className={`px-6 py-2 rounded-md font-semibold transition-colors duration-200 ${
              gameMode === 'twoPlayer'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setGameMode('twoPlayer')}
          >
            2 Players
          </button>
          <button
            className={`px-6 py-2 rounded-md font-semibold transition-colors duration-200 ${
              gameMode === 'vsAI'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setGameMode('vsAI')}
          >
            vs AI
          </button>
        </div>
      </div>

      {/* Current Player */}
      <div className="text-center mb-6">
        <div className={`text-2xl font-bold px-6 py-2 rounded-lg inline-block ${
          gameState.currentPlayer === 'player1' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {gameMode === 'vsAI' && gameState.currentPlayer === 'player2' ? '🤖 AI Thinking...' : 
           `Current Turn: ${gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}`}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-8 gap-2 items-center">
          {/* Player 2 Store (Left) */}
          <div className="col-span-1">
            <div className={getPitStyle(gameState.pits[13], 13)}>
              {gameState.pits[13] && renderStones(gameState.pits[13].stones)}
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">P2 Store</div>
          </div>
          
          {/* Player 2 Pits (Top Row) */}
          <div className="col-span-6 grid grid-cols-6 gap-2">
            {gameState.pits.slice(7, 13).reverse().map(pit => (
              <div key={pit.id} className="text-center">
                <div
                  className={getPitStyle(pit, pit.id)}
                  onClick={() => executeMove(pit.id)}
                >
                  {renderStones(pit.stones)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Pit {pit.id}</div>
              </div>
            ))}
          </div>
          
          {/* Player 1 Store (Right) */}
          <div className="col-span-1">
            <div className={getPitStyle(gameState.pits[6], 6)}>
              {gameState.pits[6] && renderStones(gameState.pits[6].stones)}
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">P1 Store</div>
          </div>
          
          {/* Player 1 Pits (Bottom Row) */}
          <div className="col-span-6 grid grid-cols-6 gap-2 col-start-2">
            {gameState.pits.slice(0, 6).map(pit => (
              <div key={pit.id} className="text-center">
                <div
                  className={getPitStyle(pit, pit.id)}
                  onClick={() => executeMove(pit.id)}
                >
                  {renderStones(pit.stones)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Pit {pit.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">Player 1</div>
          <div className="text-lg text-gray-800">{gameState.pits[6]?.stones || 0} stones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">Player 2</div>
          <div className="text-lg text-gray-800">{gameState.pits[13]?.stones || 0} stones</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={undoMove}
          disabled={gameState.moveHistory.length <= 1 || aiThinking}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-200"
        >
          ↩️ Undo
        </button>
        <button
          onClick={resetGame}
          disabled={aiThinking}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors duration-200"
        >
          🔄 Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How to Play:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Click on one of your pits to pick up all stones</li>
          <li>• Stones are distributed counterclockwise, one per pit</li>
          <li>• Skip your opponent's store when distributing</li>
          <li>• Land in your store = extra turn</li>
          <li>• Land in empty pit on your side = capture opponent's opposite stones</li>
          <li>• Game ends when one side is empty</li>
          <li>• Most stones in store wins!</li>
        </ul>
      </div>
    </div>
  )
}

export default Mancala
