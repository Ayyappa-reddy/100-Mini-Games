import { useState } from 'react'

interface DiceRollingProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface GameState {
  currentRound: number
  totalChips: number
  bets: Record<number, number>
  diceResult: number | null
  roundResults: Array<{
    round: number
    bets: Record<number, number>
    diceResult: number
    winnings: number
    losses: number
    remainingChips: number
  }>
  gameComplete: boolean
}

const DiceRolling: React.FC<DiceRollingProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [gameState, setGameState] = useState<GameState>(initialState || {
    currentRound: 1,
    totalChips: 100,
    bets: {},
    diceResult: null,
    roundResults: [],
    gameComplete: false
  })

  const [score, setScore] = useState(initialState?.score || 0)
  const [betAmount, setBetAmount] = useState('')
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [roundComplete, setRoundComplete] = useState(false)

  const diceNumbers = [1, 2, 3, 4, 5, 6]
  const maxRounds = 3

  const placeBet = () => {
    if (!selectedNumber || !betAmount || parseInt(betAmount) <= 0) return
    
    const amount = parseInt(betAmount)
    if (amount > gameState.totalChips) return

    setGameState(prev => ({
      ...prev,
      bets: {
        ...prev.bets,
        [selectedNumber]: (prev.bets[selectedNumber] || 0) + amount
      },
      totalChips: prev.totalChips - amount
    }))

    setBetAmount('')
    setSelectedNumber(null)
  }

  const removeBet = (number: number) => {
    const amount = gameState.bets[number] || 0
    setGameState(prev => ({
      ...prev,
      bets: {
        ...prev.bets,
        [number]: 0
      },
      totalChips: prev.totalChips + amount
    }))
  }

  const rollDice = () => {
    if (Object.keys(gameState.bets).length === 0) return
    
    const result = Math.floor(Math.random() * 6) + 1
    const winnings = gameState.bets[result] ? gameState.bets[result] * 2 : 0
    const totalBet = Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0)
    const losses = totalBet - winnings
    const remainingChips = gameState.totalChips + winnings

    const roundResult = {
      round: gameState.currentRound,
      bets: { ...gameState.bets },
      diceResult: result,
      winnings,
      losses,
      remainingChips
    }

    setGameState(prev => ({
      ...prev,
      diceResult: result,
      totalChips: remainingChips,
      roundResults: [...prev.roundResults, roundResult],
      currentRound: prev.currentRound + 1,
      bets: {},
      gameComplete: prev.currentRound >= maxRounds
    }))

    setShowResult(true)
    setRoundComplete(true)

    // Check if game is complete
    if (gameState.currentRound >= maxRounds) {
      const finalScore = remainingChips
      setScore(finalScore)
      onComplete(finalScore, true)
    }

    onUpdate({
      currentRound: gameState.currentRound + 1,
      totalChips: remainingChips,
      bets: {},
      diceResult: result,
      roundResults: [...gameState.roundResults, roundResult],
      gameComplete: gameState.currentRound >= maxRounds
    }, remainingChips)
  }

  const nextRound = () => {
    setShowResult(false)
    setRoundComplete(false)
    setGameState(prev => ({
      ...prev,
      diceResult: null
    }))
  }

  const resetGame = () => {
    const newState = {
      currentRound: 1,
      totalChips: 100,
      bets: {},
      diceResult: null,
      roundResults: [],
      gameComplete: false
    }
    
    setGameState(newState)
    setScore(0)
    setShowResult(false)
    setRoundComplete(false)
    
    onUpdate(newState, 0)
  }

  const getBetDisplay = (number: number) => {
    const bet = gameState.bets[number] || 0
    return bet > 0 ? `${bet} chips` : ''
  }

  const getTotalBets = () => {
    return Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0)
  }

  const canRoll = Object.keys(gameState.bets).length > 0 && !showResult
  const canPlaceBet = gameState.totalChips > 0 && !showResult && !roundComplete

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">🎲 Casino Dice Rolling</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Round: {gameState.currentRound}/{maxRounds}</div>
          <div className="text-green-600">Chips: {gameState.totalChips}</div>
          <div className="text-purple-600">Score: {score}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Betting Area */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
          <h3 className="text-2xl font-semibold text-center text-green-800 mb-6">
            {roundComplete ? '🎯 Round Complete!' : '💰 Place Your Bets!'}
          </h3>

          {/* Betting Interface */}
          {!roundComplete && (
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <select
                  value={selectedNumber || ''}
                  onChange={(e) => setSelectedNumber(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!canPlaceBet}
                >
                  <option value="">Select Number</option>
                  {diceNumbers.map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Chips"
                  min="1"
                  max={gameState.totalChips}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-24"
                  disabled={!canPlaceBet}
                />
                
                <button
                  onClick={placeBet}
                  disabled={!canPlaceBet || !selectedNumber || !betAmount || parseInt(betAmount) <= 0 || parseInt(betAmount) > gameState.totalChips}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Bet
                </button>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>💰 Bet on any number(s). Win = 2x your bet!</p>
                <p>🎯 Strategy: Spread your bets or go all-in!</p>
              </div>
            </div>
          )}

          {/* Current Bets Display */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Current Bets:</h4>
            <div className="grid grid-cols-2 gap-3">
              {diceNumbers.map(num => {
                const bet = gameState.bets[num] || 0
                return (
                  <div key={num} className={`p-3 rounded-lg border-2 ${
                    bet > 0 ? 'border-green-500 bg-green-100' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{num}</div>
                      <div className="text-sm text-gray-600">{getBetDisplay(num)}</div>
                      {bet > 0 && (
                        <button
                          onClick={() => removeBet(num)}
                          className="mt-1 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Total Bets and Roll Button */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 mb-4">
              Total Bets: <span className="text-blue-600">{getTotalBets()}</span> chips
            </div>
            
            {!roundComplete && (
              <button
                onClick={rollDice}
                disabled={!canRoll}
                className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎲 Roll Dice!
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Results and History */}
        <div className="space-y-6">
          {/* Current Round Result */}
          {showResult && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-center text-yellow-800 mb-4">
                🎯 Round {gameState.currentRound - 1} Result
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎲</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  Dice: {gameState.diceResult}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-700 mb-1">Winnings</h4>
                    <div className="text-2xl font-bold text-green-600">
                      +{gameState.roundResults[gameState.roundResults.length - 1]?.winnings || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-700 mb-1">Losses</h4>
                    <div className="text-2xl font-bold text-red-600">
                      -{gameState.roundResults[gameState.roundResults.length - 1]?.losses || 0}
                    </div>
                  </div>
                </div>
                
                <div className="text-lg font-semibold text-gray-700 mb-4">
                  Remaining Chips: <span className="text-purple-600">{gameState.totalChips}</span>
                </div>
                
                {gameState.currentRound <= maxRounds && !gameState.gameComplete && (
                  <button
                    onClick={nextRound}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    🎯 Next Round
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Round History */}
          {gameState.roundResults.length > 0 && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Round History</h3>
              <div className="space-y-3">
                {gameState.roundResults.map((result, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Round {result.round}</span>
                      <span className="text-gray-600">Dice: {result.diceResult}</span>
                      <span className="text-green-600">+{result.winnings}</span>
                      <span className="text-red-600">-{result.losses}</span>
                      <span className="font-semibold">{result.remainingChips} chips</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Controls */}
          <div className="text-center">
            <button
              onClick={resetGame}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 New Game
            </button>
          </div>
        </div>
      </div>

      {/* Progress Display */}
      {progress && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Your Best Score</h3>
          <p className="text-2xl font-bold text-primary-600">{progress.score} chips</p>
        </div>
      )}
    </div>
  )
}

export default DiceRolling
