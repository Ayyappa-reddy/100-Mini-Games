import { useState } from 'react'

interface RockPaperScissorsProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

type Choice = 'rock' | 'paper' | 'scissors'

interface GameResult {
  playerChoice: Choice
  aiChoice: Choice
  result: 'win' | 'lose' | 'draw'
  message: string
}

const RockPaperScissors: React.FC<RockPaperScissorsProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [score, setScore] = useState(initialState?.score || 0)
  const [wins, setWins] = useState(initialState?.wins || 0)
  const [losses, setLosses] = useState(initialState?.losses || 0)
  const [draws, setDraws] = useState(initialState?.draws || 0)
  const [roundsPlayed, setRoundsPlayed] = useState(initialState?.roundsPlayed || 0)
  const [lastResult, setLastResult] = useState<GameResult | null>(null)
  const [gameActive, setGameActive] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const choices: Choice[] = ['rock', 'paper', 'scissors']

  const getAIChoice = (): Choice => {
    return choices[Math.floor(Math.random() * 3)]
  }

  const determineWinner = (player: Choice, ai: Choice): 'win' | 'lose' | 'draw' => {
    if (player === ai) return 'draw'
    
    if (
      (player === 'rock' && ai === 'scissors') ||
      (player === 'paper' && ai === 'rock') ||
      (player === 'scissors' && ai === 'paper')
    ) {
      return 'win'
    }
    
    return 'lose'
  }

  const getResultMessage = (result: 'win' | 'lose' | 'draw', playerChoice: Choice, aiChoice: Choice): string => {
    if (result === 'draw') return "It's a tie!"
    
    const choiceNames = {
      rock: 'Rock',
      paper: 'Paper', 
      scissors: 'Scissors'
    }
    
    if (result === 'win') {
      return `${choiceNames[playerChoice]} beats ${choiceNames[aiChoice]}! You win!`
    } else {
      return `${choiceNames[aiChoice]} beats ${choiceNames[playerChoice]}! You lose!`
    }
  }

  const handleChoice = async (playerChoice: Choice) => {
    if (isAnimating || !gameActive) return
    
    setIsAnimating(true)
    setGameActive(false)
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const aiChoice = getAIChoice()
    const result = determineWinner(playerChoice, aiChoice)
    const message = getResultMessage(result, playerChoice, aiChoice)
    
    // Update stats
    const newWins = wins + (result === 'win' ? 1 : 0)
    const newLosses = losses + (result === 'lose' ? 1 : 0)
    const newDraws = draws + (result === 'draw' ? 1 : 0)
    const newRoundsPlayed = roundsPlayed + 1
    
    // Calculate score (win = 3, draw = 1, lose = 0)
    const roundScore = result === 'win' ? 3 : result === 'draw' ? 1 : 0
    const newScore = score + roundScore
    
    setWins(newWins)
    setLosses(newLosses)
    setDraws(newDraws)
    setRoundsPlayed(newRoundsPlayed)
    setScore(newScore)
    
    setLastResult({
      playerChoice,
      aiChoice,
      result,
      message
    })
    
    // Check if game is complete (20 rounds)
    if (newRoundsPlayed >= 20) {
      onComplete(newScore, true)
    }
    
    onUpdate({
      score: newScore,
      wins: newWins,
      losses: newLosses,
      draws: newDraws,
      roundsPlayed: newRoundsPlayed,
      gameActive: false
    }, newScore)
    
    setIsAnimating(false)
  }

  const resetGame = () => {
    setScore(0)
    setWins(0)
    setLosses(0)
    setDraws(0)
    setRoundsPlayed(0)
    setLastResult(null)
    setGameActive(true)
    
    onUpdate({
      score: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      roundsPlayed: 0,
      gameActive: true
    }, 0)
  }

  const nextRound = () => {
    setGameActive(true)
    setLastResult(null)
    
    onUpdate({
      score,
      wins,
      losses,
      draws,
      roundsPlayed,
      gameActive: true
    }, score)
  }

  const getChoiceIcon = (choice: Choice) => {
    switch (choice) {
      case 'rock': return '🪨'
      case 'paper': return '📄'
      case 'scissors': return '✂️'
    }
  }

  const getChoiceColor = (choice: Choice) => {
    switch (choice) {
      case 'rock': return 'bg-gray-600'
      case 'paper': return 'bg-white'
      case 'scissors': return 'bg-gray-400'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Rock Paper Scissors</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Score: {score}</div>
          <div className="text-green-600">Wins: {wins}</div>
          <div className="text-red-600">Losses: {losses}</div>
          <div className="text-purple-600">Draws: {draws}</div>
        </div>
        <div className="text-gray-600">Round: {roundsPlayed + 1}/20</div>
      </div>

      {/* Game Area */}
      {gameActive && (
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">Choose your weapon:</h3>
          <div className="flex justify-center space-x-6">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                disabled={isAnimating}
                className={`w-24 h-24 rounded-full text-4xl transition-all duration-200 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${getChoiceColor(choice)} border-4 border-gray-300`}
              >
                {getChoiceIcon(choice)}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">Click to make your choice!</p>
        </div>
      )}

      {/* Results Display */}
      {lastResult && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Round Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Your Choice</h4>
              <div className={`w-20 h-20 mx-auto rounded-full text-3xl flex items-center justify-center border-4 border-gray-300 ${getChoiceColor(lastResult.playerChoice)}`}>
                {getChoiceIcon(lastResult.playerChoice)}
              </div>
              <p className="text-sm text-gray-600 capitalize mt-2">{lastResult.playerChoice}</p>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">AI Choice</h4>
              <div className={`w-20 h-20 mx-auto rounded-full text-3xl flex items-center justify-center border-4 border-gray-300 ${getChoiceColor(lastResult.aiChoice)}`}>
                {getChoiceIcon(lastResult.aiChoice)}
              </div>
              <p className="text-sm text-gray-600 capitalize mt-2">{lastResult.aiChoice}</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${
              lastResult.result === 'win' ? 'text-green-600' : 
              lastResult.result === 'lose' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {lastResult.result === 'win' ? '🎉 YOU WIN! 🎉' : 
               lastResult.result === 'lose' ? '😢 You Lose' : 
               '🤝 Draw'}
            </div>
            <p className="text-lg text-gray-700 mb-4">{lastResult.message}</p>
            
            {roundsPlayed < 20 && (
              <button
                onClick={nextRound}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Next Round
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="text-center space-x-4">
        <button
          onClick={resetGame}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          New Game
        </button>
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

export default RockPaperScissors
