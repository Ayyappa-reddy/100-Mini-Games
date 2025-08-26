import { useState, useEffect } from 'react'

interface TypingSpeedProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

const TypingSpeed: React.FC<TypingSpeedProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [currentWord, setCurrentWord] = useState(initialState?.currentWord || '')
  const [userInput, setUserInput] = useState(initialState?.userInput || '')
  const [score, setScore] = useState(initialState?.score || 0)
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 60)
  const [gameActive, setGameActive] = useState(initialState?.gameActive || false)
  const [gameStarted, setGameStarted] = useState(initialState?.gameStarted || false)
  const [wordsTyped, setWordsTyped] = useState(initialState?.wordsTyped || 0)
  const [errors, setErrors] = useState(initialState?.errors || 0)
  const [wpm, setWpm] = useState(initialState?.wpm || 0)

  const words = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ]

  const getRandomWord = () => {
    return words[Math.floor(Math.random() * words.length)]
  }

  const startGame = () => {
    const word = getRandomWord()
    setCurrentWord(word)
    setUserInput('')
    setTimeLeft(60)
    setGameActive(true)
    setGameStarted(true)
    setWordsTyped(0)
    setErrors(0)
    setScore(0)
    setWpm(0)
    
    onUpdate({ 
      currentWord: word, 
      userInput: '', 
      score: 0, 
      timeLeft: 60, 
      gameActive: true, 
      gameStarted: true,
      wordsTyped: 0, 
      errors: 0, 
      wpm: 0 
    }, 0)
  }

  const resetGame = () => {
    setCurrentWord('')
    setUserInput('')
    setTimeLeft(60)
    setGameActive(false)
    setGameStarted(false)
    setWordsTyped(0)
    setErrors(0)
    setScore(0)
    setWpm(0)
    
    onUpdate({ 
      currentWord: '', 
      userInput: '', 
      score: 0, 
      timeLeft: 60, 
      gameActive: false, 
      gameStarted: false,
      wordsTyped: 0, 
      errors: 0, 
      wpm: 0 
    }, 0)
  }

  useEffect(() => {
    if (!currentWord) {
      // Don't auto-start, wait for user to click start
    }
  }, [])

  useEffect(() => {
    if (!gameActive || !gameStarted) return

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          setGameActive(false)
          setGameStarted(false)
          const finalWpm = Math.round((wordsTyped / 5) * (60 / 60))
          setWpm(finalWpm)
          onComplete(score, false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive, gameStarted, score, wordsTyped, onComplete])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameActive || !gameStarted) return
    
    const value = e.target.value
    setUserInput(value)
    
    // Check if word is completed
    if (value.endsWith(' ')) {
      const typedWord = value.trim()
      const isCorrect = typedWord === currentWord
      
      if (isCorrect) {
        const newWordsTyped = wordsTyped + 1
        const newScore = score + 10
        setWordsTyped(newWordsTyped)
        setScore(newScore)
        
        // Calculate WPM
        const timeElapsed = 60 - timeLeft
        const newWpm = Math.round((newWordsTyped / 5) * (60 / timeElapsed))
        setWpm(newWpm)
      } else {
        const newErrors = errors + 1
        setErrors(newErrors)
      }
      
      // Get next word
      const nextWord = getRandomWord()
      setCurrentWord(nextWord)
      setUserInput('')
      
      onUpdate({ 
        currentWord: nextWord, 
        userInput: '', 
        score: isCorrect ? score + 10 : score, 
        timeLeft, 
        gameActive, 
        wordsTyped: isCorrect ? wordsTyped + 1 : wordsTyped, 
        errors: isCorrect ? errors : errors + 1, 
        wpm: isCorrect ? Math.round(((wordsTyped + 1) / 5) * (60 / (60 - timeLeft))) : wpm 
      }, isCorrect ? score + 10 : score)
    }
  }

  const accuracy = wordsTyped + errors > 0 ? Math.round((wordsTyped / (wordsTyped + errors)) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Typing Speed</h2>
        <div className="flex justify-center space-x-6 text-lg mb-4">
          <div className="text-red-600">Time: {timeLeft}s</div>
          <div className="text-blue-600">WPM: {wpm}</div>
          <div className="text-green-600">Accuracy: {accuracy}%</div>
          <div className="text-primary-600">Score: {score}</div>
        </div>
        
        {!gameStarted && !gameActive && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            <p className="mb-2">Ready to test your typing speed?</p>
            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}
        
        {!gameActive && timeLeft === 0 && gameStarted && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
            ⏰ Time's up! Final Score: {score} | WPM: {wpm} | Accuracy: {accuracy}%
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Type this word:</h3>
          <div className="text-4xl font-bold text-primary-600 mb-4">
            {currentWord}
          </div>
          <div className="text-sm text-gray-600 space-x-4">
            <span>Words: {wordsTyped}</span>
            <span>Errors: {errors}</span>
          </div>
        </div>

        {gameStarted && gameActive && (
          <div className="space-y-4">
            <div>
              <label htmlFor="typing" className="block text-sm font-medium text-gray-700 mb-2">
                Type here:
              </label>
              <input
                type="text"
                id="typing"
                value={userInput}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                placeholder="Start typing..."
                disabled={!gameActive}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

             <div className="text-center space-x-4">
         <button
           onClick={resetGame}
           className="bg-secondary-600 text-white px-6 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
         >
           New Game
         </button>
       </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
        <p className="text-sm text-gray-600">
          Type the words as quickly and accurately as possible! You get 10 points for each correct word.
          Your WPM (Words Per Minute) and accuracy are calculated in real-time. Press space after each word.
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

export default TypingSpeed
