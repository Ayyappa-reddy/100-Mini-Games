import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { ArrowLeft, Clock, Target, Trophy } from 'lucide-react'
import TicTacToe from '../games/TicTacToe'
import MemoryGame from '../games/MemoryGame'
import SnakeGame from '../games/SnakeGame'
import ColorMatch from '../games/ColorMatch'
import NumberPuzzle from '../games/NumberPuzzle'
import WordScramble from '../games/WordScramble'
import QuickMath from '../games/QuickMath'
import SimonSays from '../games/SimonSays'
import WhackAMole from '../games/WhackAMole'
import TypingSpeed from '../games/TypingSpeed'
import ConnectFour from '../games/ConnectFour'
import ColorPicker from '../games/ColorPicker'
import NumberSequence from '../games/NumberSequence'
import SpotTheDifference from '../games/SpotTheDifference'
import Minesweeper from '../games/Minesweeper'
import Game2048 from '../games/Game2048'
import Sudoku from '../games/Sudoku'
import WordSearch from '../games/WordSearch'
import Hangman from '../games/Hangman'
import LightsOut from '../games/LightsOut'
import MemoryPath from '../games/MemoryPath'
import Nonogram from '../games/Nonogram'
import Tetris from '../games/Tetris'
import RockPaperScissors from '../games/RockPaperScissors'
import HandCricket from '../games/HandCricket'
import StopAtTen from '../games/StopAtTen'
import DiceRolling from '../games/DiceRolling'
import WordChain from '../games/WordChain'
import WaterSort from '../games/WaterSort'
import PixelArtCreator from '../games/PixelArtCreator'
import SlidingPuzzle from '../games/SlidingPuzzle'
import PatternRecognition from '../games/PatternRecognition'
import FlappyBird from '../games/FlappyBird'
import SpaceInvaders from '../games/SpaceInvaders'
import NumberMerge from '../games/NumberMerge'
import CrossSums from '../games/CrossSums'
import NumberConnect from '../games/NumberConnect'
import Mancala from '../games/Mancala'


const GamePlay = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, getUserProgress, saveProgress } = useGame()
  const [gameState, setGameState] = useState<any>(null)
  const [score, setScore] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [, setIsCompleted] = useState(false)
  const [startTime] = useState(Date.now())

  const gameId = parseInt(id || '1')
  const game = games.find(g => g.id === gameId)
  const progress = getUserProgress(gameId)

  useEffect(() => {
    if (!game) {
      navigate('/games')
      return
    }

    // Update time spent every second
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [game, navigate, startTime])

  const handleGameComplete = useCallback(async (finalScore: number, completed: boolean = true) => {
    setScore(finalScore)
    setIsCompleted(completed)
    
    try {
      await saveProgress(gameId, finalScore, completed, timeSpent)
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }, [gameId, saveProgress, timeSpent])

  const handleGameUpdate = useCallback((newState: any, newScore?: number) => {
    setGameState(newState)
    if (newScore !== undefined) {
      setScore(newScore)
    }
  }, [])

  const renderGame = () => {
    if (!game) return null

    const gameProps = {
      onComplete: handleGameComplete,
      onUpdate: handleGameUpdate,
      initialState: gameState,
      progress: progress
    }

    // Allow overriding mismatched DB ids to point to the correct component
    const idOverrides: Record<number, number> = {
      // Example mapping; fill with actual ids when provided by user
      // [dbId]: [correctComponentId]
      // 21: 11, // chess -> ColorPicker
      // 22: 12, // checkers -> NumberSequence
      // 23: 14, // flappy birds -> SpotTheDifference
    }
    const effectiveId = idOverrides[game.id] ?? game.id

    switch (effectiveId) {
      case 1:
        return <TicTacToe {...gameProps} />
      case 2:
        return <MemoryGame {...gameProps} />
      case 3:
        return <SnakeGame {...gameProps} />
      case 4:
        return <ColorMatch {...gameProps} />
      case 5:
        return <NumberPuzzle {...gameProps} />
      case 6:
        return <WordScramble {...gameProps} />
      case 7:
        return <QuickMath {...gameProps} />
      case 8:
        return <SimonSays {...gameProps} />
      case 9:
        return <WhackAMole {...gameProps} />
      case 10:
        return <TypingSpeed {...gameProps} />
      case 11:
        return <ColorPicker {...gameProps} />
      case 12:
        return <NumberSequence {...gameProps} />
      case 13:
        return <ConnectFour {...gameProps} />
      case 14:
        return <SpotTheDifference {...gameProps} />
      case 15:
        return <Minesweeper {...gameProps} />
      case 16:
        return <Game2048 {...gameProps} />
      case 17:
        return <Sudoku {...gameProps} />
      case 18:
        return <WordSearch {...gameProps} />
      case 19:
        return <Hangman {...gameProps} />
      case 20:
        return <LightsOut {...gameProps} />
      case 21:
        return <MemoryPath {...gameProps} />
      case 22:
        return <Nonogram {...gameProps} />
      case 23:
        return <Tetris {...gameProps} />
      case 24:
        return <RockPaperScissors {...gameProps} />
      case 25:
        return <HandCricket {...gameProps} />
      case 26:
        return <StopAtTen {...gameProps} />
      case 27:
        return <DiceRolling {...gameProps} />
             case 28:
         return <WordChain {...gameProps} />
              case 29:
         return <WaterSort {...gameProps} />
       case 30:
         return <PixelArtCreator {...gameProps} />
       case 31:
         return <SlidingPuzzle {...gameProps} />
       case 32:
         return <PatternRecognition {...gameProps} />
       case 33:
         return <FlappyBird {...gameProps} />
       case 34:
         return <SpaceInvaders {...gameProps} />
       case 35:
         return <NumberMerge {...gameProps} />
       case 36:
         return <CrossSums {...gameProps} />
       case 37:
         return <NumberConnect {...gameProps} />
       case 38:
         return <Mancala {...gameProps} />
       default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Game Coming Soon</h3>
            <p className="text-gray-600">This game is under development</p>
          </div>
        )
    }
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Game Not Found</h3>
        <p className="text-gray-600 mb-4">The game you're looking for doesn't exist</p>
        <button
          onClick={() => navigate('/games')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to Games
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Games
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{game.name}</h1>
              <p className="text-gray-600 mt-1">{game.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span>{score} pts</span>
                </div>
                {progress && progress.completed && (
                  <div className="flex items-center text-green-600">
                    <Target className="h-4 w-4 mr-1" />
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {game.category}
            </span>
            <span className={`px-2 py-1 rounded ${
              game.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {game.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Game Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to Play</h3>
        <p className="text-blue-800 text-sm">{game.instructions}</p>
      </div>

      {/* Game Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderGame()}
      </div>

      {/* Progress Info */}
      {progress && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Your Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Best Score:</span>
              <div className="font-semibold">{progress.score} pts</div>
            </div>
            <div>
              <span className="text-gray-600">Time Spent:</span>
              <div className="font-semibold">{Math.round(progress.time_spent / 60)}m</div>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <div className="font-semibold">
                {progress.completed ? (
                  <span className="text-green-600">Completed</span>
                ) : (
                  <span className="text-yellow-600">In Progress</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamePlay 