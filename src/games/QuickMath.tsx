import { useState, useEffect } from 'react'

interface QuickMathProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

interface MathProblem {
  question: string
  answer: number
}

const QuickMath: React.FC<QuickMathProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(initialState?.currentProblem || null)
  const [userAnswer, setUserAnswer] = useState(initialState?.userAnswer || '')
  const [score, setScore] = useState(initialState?.score || 0)
  const [level, setLevel] = useState(initialState?.level || 1)
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 30)
  const [gameActive, setGameActive] = useState(initialState?.gameActive || false)
  const [gameStarted, setGameStarted] = useState(initialState?.gameStarted || false)
  const [problemsSolved, setProblemsSolved] = useState(initialState?.problemsSolved || 0)

  const generateProblem = (): MathProblem => {
    const operations = ['+', '-', '*']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let num1: number, num2: number, answer: number
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1
        num2 = Math.floor(Math.random() * 50) + 1
        answer = num1 + num2
        break
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25
        num2 = Math.floor(Math.random() * num1) + 1
        answer = num1 - num2
        break
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        answer = num1 * num2
        break
      default:
        num1 = 1
        num2 = 1
        answer = 2
    }
    
    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer
    }
  }

  const startGame = () => {
    const problem = generateProblem()
    setCurrentProblem(problem)
    setUserAnswer('')
    setTimeLeft(30)
    setGameActive(true)
    setGameStarted(true)
    setProblemsSolved(0)
    setScore(0)
    setLevel(1)
    
    onUpdate({ 
      currentProblem: problem, 
      userAnswer: '', 
      score: 0, 
      level: 1, 
      timeLeft: 30, 
      gameActive: true, 
      gameStarted: true,
      problemsSolved: 0 
    }, 0)
  }

  const resetGame = () => {
    setCurrentProblem(null)
    setUserAnswer('')
    setTimeLeft(30)
    setGameActive(false)
    setGameStarted(false)
    setProblemsSolved(0)
    setScore(0)
    setLevel(1)
    
    onUpdate({ 
      currentProblem: null, 
      userAnswer: '', 
      score: 0, 
      level: 1, 
      timeLeft: 30, 
      gameActive: false, 
      gameStarted: false,
      problemsSolved: 0 
    }, 0)
  }

  useEffect(() => {
    if (!currentProblem && !gameActive) {
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
          onComplete(score, false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive, gameStarted, score, onComplete])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentProblem || !gameActive || !gameStarted) return
    
    const userNum = parseInt(userAnswer)
    if (userNum === currentProblem.answer) {
      const timeBonus = Math.floor(timeLeft * 2)
      const newScore = score + 50 + timeBonus
      const newProblemsSolved = problemsSolved + 1
      
      setScore(newScore)
      setProblemsSolved(newProblemsSolved)
      
      // Increase difficulty every 5 problems
      if (newProblemsSolved % 5 === 0) {
        setLevel(level + 1)
      }
      
      const nextProblem = generateProblem()
      setCurrentProblem(nextProblem)
      setUserAnswer('')
      
      onUpdate({ 
        currentProblem: nextProblem, 
        userAnswer: '', 
        score: newScore, 
        level: newProblemsSolved % 5 === 0 ? level + 1 : level, 
        timeLeft, 
        gameActive, 
        problemsSolved: newProblemsSolved 
      }, newScore)
    } else {
      // Wrong answer - lose some time
      setTimeLeft(Math.max(0, timeLeft - 5))
      setUserAnswer('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Math</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-red-600">Time: {timeLeft}s</div>
          <div className="text-blue-600">Level: {level}</div>
          <div className="text-primary-600">Score: {score}</div>
        </div>
        
        {!gameStarted && !gameActive && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            <p className="mb-2">Ready to solve math problems quickly?</p>
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
            ⏰ Time's up! Final Score: {score}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Solve this problem:</h3>
          <div className="text-5xl font-bold text-primary-600 mb-4">
            {currentProblem?.question}
          </div>
          <div className="text-sm text-gray-600">
            Problems solved: {problemsSolved}
          </div>
        </div>

        {gameStarted && gameActive && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <input
                type="number"
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl"
                placeholder="Enter answer..."
                disabled={!gameActive}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={!gameActive || !userAnswer.trim()}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              Submit Answer
            </button>
          </form>
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
          Solve math problems as quickly as possible! You get 50 points per correct answer plus time bonus.
          Wrong answers cost you 5 seconds. Complete as many problems as you can before time runs out!
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

export default QuickMath
