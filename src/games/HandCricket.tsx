import { useState, useEffect } from 'react'

interface HandCricketProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

type GamePhase = 'toss' | 'batting' | 'bowling' | 'result'
type TossChoice = 'heads' | 'tails'
type BattingChoice = 'bat' | 'bowl'

interface GameState {
  phase: GamePhase
  playerScore: number
  aiScore: number
  currentRuns: number
  balls: number
  isOut: boolean
  tossWinner: 'player' | 'ai' | null
  playerChoice: BattingChoice | null
  matchResult: 'win' | 'lose' | 'draw' | null
}

const HandCricket: React.FC<HandCricketProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [gameState, setGameState] = useState<GameState>(initialState || {
    phase: 'toss',
    playerScore: 0,
    aiScore: 0,
    currentRuns: 0,
    balls: 0,
    isOut: false,
    tossWinner: null,
    playerChoice: null,
    matchResult: null
  })

  const [score, setScore] = useState(initialState?.score || 0)
  const [gameActive, setGameActive] = useState(true)
  const [lastMove, setLastMove] = useState<{ player: number; ai: number; result: string } | null>(null)

  const numbers = [1, 2, 3, 4, 5, 6]
  const maxBalls = 20 // Increased from 6 to make game longer

  const getHandEmoji = (num: number): string => {
    switch (num) {
      case 1: return '☝️'
      case 2: return '✌️'
      case 3: return '🤟'
      case 4: return '🖖'
      case 5: return '🖐️'
      case 6: return '🤙'
      default: return '👋'
    }
  }

  const flipCoin = (): 'heads' | 'tails' => {
    return Math.random() < 0.5 ? 'heads' : 'tails'
  }

  const handleToss = (playerCall: TossChoice) => {
    const coinResult = flipCoin()
    const isWinner = playerCall === coinResult
    const tossWinner = isWinner ? 'player' : 'ai'
    
    setGameState(prev => ({
      ...prev,
      phase: 'toss',
      tossWinner
    }))
  }

  const handleBattingChoice = (choice: BattingChoice) => {
    setGameState(prev => ({
      ...prev,
      playerChoice: choice,
      phase: choice === 'bat' ? 'batting' : 'bowling'
    }))
  }

  const handleBatting = (playerNumber: number) => {
    const aiNumber = Math.floor(Math.random() * 6) + 1
    const isOut = playerNumber === aiNumber
    const runs = isOut ? 0 : playerNumber
    const newBalls = gameState.balls + 1
    const newCurrentRuns = gameState.currentRuns + runs

    // Show last move result
    const result = isOut ? 'OUT! 🚫' : `+${runs} runs! 🏃‍♂️`
    setLastMove({ player: playerNumber, ai: aiNumber, result })

    if (isOut) {
      // Player is out, check if this was first or second inning
      const newPlayerScore = gameState.playerScore + newCurrentRuns
      
      if (gameState.playerChoice === 'bowl') {
        // Player chose to bowl first, so this is second inning - match complete
        const finalPlayerScore = newPlayerScore
        const finalAiScore = gameState.aiScore
        let matchResult: 'win' | 'lose' | 'draw'
        
        if (finalPlayerScore > finalAiScore) {
          matchResult = 'win'
        } else if (finalPlayerScore < finalAiScore) {
          matchResult = 'lose'
        } else {
          matchResult = 'draw'
        }

        // Calculate points
        let points = 0
        if (matchResult === 'win') points = 10
        else if (matchResult === 'draw') points = 5
        
        // Bonus points
        if (finalPlayerScore >= 100) points += 5
        else if (finalPlayerScore >= 50) points += 3

        const newScore = score + points
        setScore(newScore)
        setGameActive(false)

        setGameState(prev => ({
          ...prev,
          playerScore: newPlayerScore,
          currentRuns: 0,
          balls: 0,
          isOut: false,
          phase: 'result',
          matchResult
        }))

        onComplete(newScore, true)
      } else {
        // Player chose to bat first, so this is first inning - switch to bowling
        setGameState(prev => ({
          ...prev,
          playerScore: newPlayerScore,
          currentRuns: 0,
          balls: 0,
          isOut: false,
          phase: 'bowling'
        }))

        onUpdate({
          phase: 'bowling',
          playerScore: newPlayerScore,
          aiScore: gameState.aiScore,
          currentRuns: 0,
          balls: 0,
          isOut: false
        })
      }
    } else if (newBalls >= maxBalls) {
      // Inning complete (20 balls reached)
      const newPlayerScore = gameState.playerScore + newCurrentRuns
      setGameState(prev => ({
        ...prev,
        playerScore: newPlayerScore,
        currentRuns: 0,
        balls: 0,
        isOut: false,
        phase: 'bowling'
      }))

      onUpdate({
        phase: 'bowling',
        playerScore: newPlayerScore,
        aiScore: gameState.aiScore,
        currentRuns: 0,
        balls: 0,
        isOut: false
      })
    } else {
      // Continue batting
      setGameState(prev => ({
        ...prev,
        currentRuns: newCurrentRuns,
        balls: newBalls,
        isOut: false
      }))

      onUpdate({
        phase: 'batting',
        playerScore: gameState.playerScore + runs,
        aiScore: gameState.aiScore,
        currentRuns: newCurrentRuns,
        balls: newBalls,
        isOut: false
      })
    }
  }

  const handleBowling = (playerNumber: number) => {
    const aiNumber = Math.floor(Math.random() * 6) + 1
    const isOut = playerNumber === aiNumber
    const runs = isOut ? 0 : aiNumber
    const newBalls = gameState.balls + 1
    const newAiScore = gameState.aiScore + runs

    // Show last move result
    const result = isOut ? 'WICKET! 🎯' : `+${runs} runs! 🏃‍♂️`
    setLastMove({ player: playerNumber, ai: aiNumber, result })

    if (isOut) {
      // AI is out, switch to batting phase for player
      setGameState(prev => ({
        ...prev,
        aiScore: newAiScore,
        currentRuns: 0,
        balls: 0,
        isOut: false,
        phase: 'batting'
      }))

      onUpdate({
        phase: 'batting',
        playerScore: gameState.playerScore,
        aiScore: newAiScore,
        currentRuns: 0,
        balls: 0,
        isOut: false
      })
    } else if (newBalls >= maxBalls) {
      // Inning complete (20 balls reached), check if this was first or second inning
      if (gameState.playerChoice === 'bowl') {
        // Player chose to bowl first, so this is first inning - switch to batting
        setGameState(prev => ({
          ...prev,
          aiScore: newAiScore,
          currentRuns: 0,
          balls: 0,
          isOut: false,
          phase: 'batting'
        }))

        onUpdate({
          phase: 'batting',
          playerScore: gameState.playerScore,
          aiScore: newAiScore,
          currentRuns: 0,
          balls: 0,
          isOut: false
        })
      } else {
        // Player chose to bat first, so this is second inning - match complete
        const finalPlayerScore = gameState.playerScore
        const finalAiScore = newAiScore
        let matchResult: 'win' | 'lose' | 'draw'
        
        if (finalPlayerScore > finalAiScore) {
          matchResult = 'win'
        } else if (finalPlayerScore < finalAiScore) {
          matchResult = 'lose'
        } else {
          matchResult = 'draw'
        }

        // Calculate points
        let points = 0
        if (matchResult === 'win') points = 10
        else if (matchResult === 'draw') points = 5
        
        // Bonus points
        if (finalPlayerScore >= 100) points += 5
        else if (finalPlayerScore >= 50) points += 3

        const newScore = score + points
        setScore(newScore)
        setGameActive(false)

        setGameState(prev => ({
          ...prev,
          aiScore: newAiScore,
          balls: newBalls,
          phase: 'result',
          matchResult
        }))

        onComplete(newScore, true)
      }
    } else {
      // Continue bowling
      setGameState(prev => ({
        ...prev,
        aiScore: newAiScore,
        balls: newBalls
      }))

      onUpdate({
        phase: 'bowling',
        playerScore: gameState.playerScore,
        aiScore: newAiScore,
        currentRuns: 0,
        balls: newBalls,
        isOut: false
      })
    }
  }

  const resetGame = () => {
    const newState = {
      phase: 'toss' as GamePhase,
      playerScore: 0,
      aiScore: 0,
      currentRuns: 0,
      balls: 0,
      isOut: false,
      tossWinner: null,
      playerChoice: null,
      matchResult: null
    }
    
    setGameState(newState)
    setScore(0)
    setGameActive(true)
    setLastMove(null)
    
    onUpdate(newState, 0)
  }

  const renderTossPhase = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">🏏 Toss Time!</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
        <p className="text-lg text-gray-700 mb-4">Call Heads or Tails to decide who bats first!</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleToss('heads')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            🪙 Heads
          </button>
          <button
            onClick={() => handleToss('tails')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            🪙 Tails
          </button>
        </div>
      </div>
    </div>
  )

  const renderTossResult = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 Toss Result</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
        <p className="text-xl text-gray-700 mb-4">
          {gameState.tossWinner === 'player' ? '🎉 You won the toss!' : '😔 AI won the toss!'}
        </p>
        <p className="text-lg text-gray-600 mb-6">Choose what you want to do:</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleBattingChoice('bat')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            🏏 Bat First
          </button>
          <button
            onClick={() => handleBattingChoice('bowl')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            🎯 Bowl First
          </button>
        </div>
      </div>
    </div>
  )

  const renderScoreboard = () => (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-6">
      <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">🏏 Scoreboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Score */}
        <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
          <h4 className="text-lg font-semibold text-blue-700 mb-2">👤 Your Score</h4>
          <div className="text-3xl font-bold text-blue-600">{gameState.playerScore}</div>
          <div className="text-sm text-gray-600 mt-1">
            {gameState.phase === 'batting' && `Current: ${gameState.currentRuns}`}
          </div>
        </div>
        
        {/* AI Score */}
        <div className="bg-white rounded-lg p-4 border-2 border-red-300">
          <h4 className="text-lg font-semibold text-red-700 mb-2">🤖 AI Score</h4>
          <div className="text-3xl font-bold text-red-600">{gameState.aiScore}</div>
          <div className="text-sm text-gray-600 mt-1">
            {gameState.phase === 'bowling' && `Current: ${gameState.aiScore - (gameState.playerChoice === 'bowl' ? 0 : gameState.playerScore)}`}
          </div>
        </div>
      </div>
      
      {/* Match Progress */}
      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{gameState.balls}/{maxBalls} balls</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(gameState.balls / maxBalls) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )

  const renderBattingPhase = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">🏏 Your Batting</h3>
      <p className="text-lg text-gray-700 mb-6">Choose your shot (1-6 runs):</p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleBatting(num)}
            disabled={!gameActive}
            className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 text-white text-2xl font-bold rounded-lg hover:from-orange-500 hover:to-orange-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getHandEmoji(num)}
            <div className="text-sm">{num}</div>
          </button>
        ))}
      </div>
      
      <p className="text-sm text-gray-500">Click a number to bat!</p>
    </div>
  )

  const renderBowlingPhase = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">🎯 Your Bowling</h3>
      <p className="text-lg text-gray-700 mb-6">Choose your delivery (1-6):</p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleBowling(num)}
            disabled={!gameActive}
            className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 text-white text-2xl font-bold rounded-lg hover:from-purple-500 hover:to-purple-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getHandEmoji(num)}
            <div className="text-sm">{num}</div>
          </button>
        ))}
      </div>
      
      <p className="text-sm text-gray-500">Click a number to bowl!</p>
    </div>
  )

  const renderResult = () => (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">🏆 Match Result</h3>
      
      <div className={`text-4xl font-bold mb-4 ${
        gameState.matchResult === 'win' ? 'text-green-600' :
        gameState.matchResult === 'lose' ? 'text-red-600' : 'text-yellow-600'
      }`}>
        {gameState.matchResult === 'win' ? '🎉 YOU WIN! 🎉' :
         gameState.matchResult === 'lose' ? '😢 You Lose' : '🤝 Draw'}
      </div>
      
      <div className="bg-white rounded-lg p-6 border-2 border-gray-300 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-700 mb-2">Your Score</h4>
            <div className="text-3xl font-bold text-blue-600">{gameState.playerScore}</div>
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-700 mb-2">AI Score</h4>
            <div className="text-3xl font-bold text-red-600">{gameState.aiScore}</div>
          </div>
        </div>
      </div>
      
      <button
        onClick={resetGame}
        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        🏏 Play Again
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">🏏 Hand Cricket</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Score: {score}</div>
          <div className="text-green-600">Status: {gameState.phase}</div>
        </div>
      </div>

      {/* Scoreboard - Always visible */}
      {gameState.phase !== 'toss' && renderScoreboard()}

      {/* Last Move Display */}
      {lastMove && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6 text-center">
          <h4 className="text-lg font-semibold text-yellow-800 mb-2">Last Move</h4>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-2xl mb-1">{getHandEmoji(lastMove.player)}</div>
              <p className="text-sm text-gray-600">You chose: {lastMove.player}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{getHandEmoji(lastMove.ai)}</div>
              <p className="text-sm text-gray-600">AI chose: {lastMove.ai}</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-700">{lastMove.result}</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Phases */}
      {gameState.phase === 'toss' && !gameState.tossWinner && renderTossPhase()}
      {gameState.phase === 'toss' && gameState.tossWinner && renderTossResult()}
      {gameState.phase === 'batting' && renderBattingPhase()}
      {gameState.phase === 'bowling' && renderBowlingPhase()}
      {gameState.phase === 'result' && renderResult()}

      {/* Game Controls */}
      {gameState.phase !== 'toss' && gameState.phase !== 'result' && (
        <div className="text-center mt-6">
          <button
            onClick={resetGame}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 New Game
          </button>
        </div>
      )}

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

export default HandCricket
