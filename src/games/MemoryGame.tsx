import { useState, useEffect } from 'react'

interface MemoryGameProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [cards, setCards] = useState<Card[]>(initialState?.cards || [])
  const [flippedCards, setFlippedCards] = useState<number[]>(initialState?.flippedCards || [])
  const [moves, setMoves] = useState(initialState?.moves || 0)
  const [score, setScore] = useState(initialState?.score || 0)
  const [gameComplete, setGameComplete] = useState(initialState?.gameComplete || false)

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮']

  const initializeGame = () => {
    const gameEmojis = emojis.slice(0, 10) // Use 10 emojis for 20 cards (4x5 grid)
    const gameCards = [...gameEmojis, ...gameEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
    
    setCards(gameCards)
    setFlippedCards([])
    setMoves(0)
    setScore(0)
    setGameComplete(false)
    
    onUpdate({ cards: gameCards, flippedCards: [], moves: 0, score: 0, gameComplete: false }, 0)
  }

  useEffect(() => {
    if (cards.length === 0) {
      initializeGame()
    }
  }, [])

  const handleCardClick = (cardId: number) => {
    if (gameComplete || flippedCards.length >= 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
      return
    }

    const newCards = [...cards]
    newCards[cardId].isFlipped = true
    setCards(newCards)

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves((prev: number) => prev + 1)
      
      const [firstId, secondId] = newFlippedCards
      const firstCard = newCards[firstId]
      const secondCard = newCards[secondId]

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        newCards[firstId].isMatched = true
        newCards[secondId].isMatched = true
        setCards(newCards)
        setFlippedCards([])
        
        const newScore = score + 50 - moves * 2
        setScore(newScore)
        
        // Check if game is complete
        const allMatched = newCards.every(card => card.isMatched)
        if (allMatched) {
          setGameComplete(true)
          const finalScore = Math.max(newScore, 10)
          onComplete(finalScore, true)
        }
        
        onUpdate({ cards: newCards, flippedCards: [], moves: moves + 1, score: newScore, gameComplete: allMatched }, newScore)
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          newCards[firstId].isFlipped = false
          newCards[secondId].isFlipped = false
          setCards(newCards)
          setFlippedCards([])
          onUpdate({ cards: newCards, flippedCards: [], moves: moves + 1, score, gameComplete }, score)
        }, 1000)
      }
    } else {
      onUpdate({ cards: newCards, flippedCards: newFlippedCards, moves, score, gameComplete }, score)
    }
  }

  const getCardDisplay = (card: Card) => {
    if (card.isMatched) {
      return card.emoji
    } else if (card.isFlipped) {
      return card.emoji
    } else {
      return '❓'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Memory Game</h2>
        <div className="flex justify-center space-x-8 text-lg">
          <div className="text-blue-600">Moves: {moves}</div>
          <div className="text-primary-600">Score: {score}</div>
        </div>
        {gameComplete && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
            🎉 Congratulations! You completed the game!
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={gameComplete || card.isMatched}
            className={`w-14 h-14 text-xl font-bold rounded-lg border-2 transition-all duration-300 ${
              card.isMatched
                ? 'bg-green-100 border-green-300 text-green-800'
                : card.isFlipped
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            } ${gameComplete ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {getCardDisplay(card)}
          </button>
        ))}
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={initializeGame}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          New Game
        </button>
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

export default MemoryGame 