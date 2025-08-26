import { useState, useEffect, useCallback } from 'react'

interface WordScrambleProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState: any
  progress: any
}

const WordScramble: React.FC<WordScrambleProps> = ({ onComplete, onUpdate, initialState, progress }) => {
  const [currentWord, setCurrentWord] = useState(initialState?.currentWord || '')
  const [scrambledWord, setScrambledWord] = useState(initialState?.scrambledWord || '')
  const [userGuess, setUserGuess] = useState(initialState?.userGuess || '')
  const [score, setScore] = useState(initialState?.score || 0)
  const [level, setLevel] = useState(initialState?.level || 1)
  const [hint, setHint] = useState(initialState?.hint || '')
  const [gameComplete, setGameComplete] = useState(initialState?.gameComplete || false)
  const [gameStarted, setGameStarted] = useState(initialState?.gameStarted || true) // Always start automatically
  const [levelCompleted, setLevelCompleted] = useState(initialState?.levelCompleted || false)

  const words = [
    // Level 1-10: Easy words
    { word: 'GAME', hint: 'An activity for entertainment' },
    { word: 'FUN', hint: 'Enjoyment or amusement' },
    { word: 'CODE', hint: 'Instructions for a computer' },
    { word: 'PLAY', hint: 'Engage in activity for enjoyment' },
    { word: 'WIN', hint: 'Achieve victory' },
    { word: 'LOSE', hint: 'Fail to win' },
    { word: 'GOAL', hint: 'Target or objective' },
    { word: 'TEAM', hint: 'Group working together' },
    { word: 'MOVE', hint: 'Change position' },
    { word: 'TIME', hint: 'Duration or period' },
    
    // Level 11-20: Medium words
    { word: 'REACT', hint: 'A JavaScript library for building user interfaces' },
    { word: 'PUZZLE', hint: 'A problem to solve' },
    { word: 'BRAIN', hint: 'The organ that thinks' },
    { word: 'LOGIC', hint: 'Reasoning or thinking' },
    { word: 'SKILL', hint: 'Ability to do something well' },
    { word: 'LEVEL', hint: 'Stage or degree' },
    { word: 'SCORE', hint: 'Points earned' },
    { word: 'SPEED', hint: 'Rate of movement' },
    { word: 'FOCUS', hint: 'Concentrate attention' },
    { word: 'LEARN', hint: 'Acquire knowledge' },
    
    // Level 21-30: Harder words
    { word: 'CHALLENGE', hint: 'A difficult task' },
    { word: 'VICTORY', hint: 'Winning or success' },
    { word: 'STRATEGY', hint: 'Plan of action' },
    { word: 'PATTERN', hint: 'Repeated design' },
    { word: 'SOLUTION', hint: 'Answer to a problem' },
    { word: 'PROBLEM', hint: 'Difficult situation' },
    { word: 'SUCCESS', hint: 'Achievement of goal' },
    { word: 'EFFORT', hint: 'Hard work' },
    { word: 'RESULT', hint: 'Outcome or consequence' },
    { word: 'PROGRESS', hint: 'Forward movement' },
    
    // Level 31-40: Advanced words
    { word: 'ALGORITHM', hint: 'Step-by-step procedure' },
    { word: 'FUNCTION', hint: 'Mathematical relationship' },
    { word: 'VARIABLE', hint: 'Changeable quantity' },
    { word: 'CONSTANT', hint: 'Unchanging value' },
    { word: 'SEQUENCE', hint: 'Ordered list' },
    { word: 'ITERATION', hint: 'Repetition of process' },
    { word: 'RECURSION', hint: 'Self-referencing function' },
    { word: 'OPTIMIZE', hint: 'Make more efficient' },
    { word: 'ANALYZE', hint: 'Examine closely' },
    { word: 'SYNTAX', hint: 'Rules of language' },
    
    // Level 41-50: Expert words
    { word: 'DATABASE', hint: 'Organized data storage' },
    { word: 'NETWORK', hint: 'Connected system' },
    { word: 'PROTOCOL', hint: 'Communication rules' },
    { word: 'ENCRYPTION', hint: 'Data security method' },
    { word: 'INTERFACE', hint: 'User interaction point' },
    { word: 'PLATFORM', hint: 'Computing environment' },
    { word: 'FRAMEWORK', hint: 'Software structure' },
    { word: 'LIBRARY', hint: 'Collection of code' },
    { word: 'COMPILER', hint: 'Code translator' },
    { word: 'DEBUGGER', hint: 'Error finding tool' },
    
    // Level 51-60: Master words
    { word: 'ARCHITECTURE', hint: 'System design' },
    { word: 'IMPLEMENTATION', hint: 'Putting into practice' },
    { word: 'DEPLOYMENT', hint: 'Release to production' },
    { word: 'MAINTENANCE', hint: 'Ongoing support' },
    { word: 'DOCUMENTATION', hint: 'Written instructions' },
    { word: 'TESTING', hint: 'Quality verification' },
    { word: 'INTEGRATION', hint: 'Combining systems' },
    { word: 'SCALABILITY', hint: 'Growth capability' },
    { word: 'PERFORMANCE', hint: 'Speed and efficiency' },
    { word: 'RELIABILITY', hint: 'Dependability' },
    
    // Level 61-70: Expert level
    { word: 'MICROSERVICES', hint: 'Small service architecture' },
    { word: 'CONTAINERIZATION', hint: 'Package with dependencies' },
    { word: 'VIRTUALIZATION', hint: 'Simulated environment' },
    { word: 'CLOUD', hint: 'Remote computing' },
    { word: 'DEVOPS', hint: 'Development operations' },
    { word: 'AGILE', hint: 'Flexible methodology' },
    { word: 'SCRUM', hint: 'Project management framework' },
    { word: 'KANBAN', hint: 'Visual workflow system' },
    { word: 'CI_CD', hint: 'Continuous integration/deployment' },
    { word: 'MONITORING', hint: 'System observation' },
    
    // Level 71-80: Master level
    { word: 'MACHINE_LEARNING', hint: 'AI training algorithms' },
    { word: 'DEEP_LEARNING', hint: 'Neural network AI' },
    { word: 'ARTIFICIAL_INTELLIGENCE', hint: 'Computer intelligence' },
    { word: 'BLOCKCHAIN', hint: 'Distributed ledger' },
    { word: 'CRYPTOCURRENCY', hint: 'Digital money' },
    { word: 'INTERNET_OF_THINGS', hint: 'Connected devices' },
    { word: 'AUGMENTED_REALITY', hint: 'Enhanced reality' },
    { word: 'VIRTUAL_REALITY', hint: 'Immersive experience' },
    { word: 'QUANTUM_COMPUTING', hint: 'Advanced computing' },
    { word: 'EDGE_COMPUTING', hint: 'Local processing' },
    
    // Level 81-90: Legendary level
    { word: 'SUSTAINABILITY', hint: 'Environmental responsibility' },
    { word: 'INNOVATION', hint: 'New ideas and methods' },
    { word: 'COLLABORATION', hint: 'Working together' },
    { word: 'COMMUNICATION', hint: 'Information exchange' },
    { word: 'LEADERSHIP', hint: 'Guiding others' },
    { word: 'MOTIVATION', hint: 'Drive to achieve' },
    { word: 'DETERMINATION', hint: 'Strong will' },
    { word: 'PERSEVERANCE', hint: 'Persistence' },
    { word: 'EXCELLENCE', hint: 'Outstanding quality' },
    { word: 'ACHIEVEMENT', hint: 'Accomplishment' },
    
    // Level 91-100: Ultimate level
    { word: 'MASTERY', hint: 'Complete skill' },
    { word: 'EXPERTISE', hint: 'Specialized knowledge' },
    { word: 'PROFICIENCY', hint: 'High competence' },
    { word: 'COMPETENCE', hint: 'Adequate ability' },
    { word: 'CAPABILITY', hint: 'Power to do something' },
    { word: 'POTENTIAL', hint: 'Possible future ability' },
    { word: 'OPPORTUNITY', hint: 'Favorable chance' },
    { word: 'POSSIBILITY', hint: 'Something that can happen' },
    { word: 'FUTURE', hint: 'Time to come' },
    { word: 'DESTINY', hint: 'Predetermined fate' }
  ]

  const scrambleWord = useCallback((word: string) => {
    let scrambled = word.split('').sort(() => Math.random() - 0.5).join('')
    
    // If the scrambled word is the same as original, try again
    let attempts = 0
    while (scrambled === word && attempts < 10) {
      scrambled = word.split('').sort(() => Math.random() - 0.5).join('')
      attempts++
    }
    
    return scrambled
  }, [])

  const initializeGame = () => {
    const wordData = words[level - 1] || words[0]
    const scrambled = scrambleWord(wordData.word)
    
    setCurrentWord(wordData.word)
    setScrambledWord(scrambled)
    setUserGuess('')
    setHint(wordData.hint)
    setGameComplete(false)
    setGameStarted(true) // Always start automatically
    setLevelCompleted(false)
    
    onUpdate({ 
      currentWord: wordData.word, 
      scrambledWord: scrambled, 
      userGuess: '', 
      score, 
      level, 
      hint: wordData.hint, 
      gameComplete: false,
      gameStarted: true,
      levelCompleted: false
    }, score)
  }



  useEffect(() => {
    if (!currentWord) {
      initializeGame()
    }
  }, [])

  useEffect(() => {
    if (levelCompleted) {
      const timer = setTimeout(() => {
        setLevelCompleted(false)
        const nextLevel = level + 1
        
        if (nextLevel > words.length) {
          setGameComplete(true)
          onComplete(score, true)
        } else {
          setLevel(nextLevel)
          setTimeout(() => {
            const wordData = words[nextLevel - 1] // Use nextLevel - 1 for array index
            if (!wordData) {
              return
            }
            const scrambled = scrambleWord(wordData.word)
            
            setCurrentWord(wordData.word)
            setScrambledWord(scrambled)
            setUserGuess('')
            setHint(wordData.hint)
            setGameStarted(true) // Always start automatically
            
            onUpdate({ 
              currentWord: wordData.word, 
              scrambledWord: scrambled, 
              userGuess: '', 
              score, 
              level: nextLevel, 
              hint: wordData.hint, 
              gameComplete: false,
              gameStarted: true,
              levelCompleted: false
            }, score)
          }, 1000)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [levelCompleted, level, score, words, onComplete, onUpdate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!gameStarted) return
    
    if (userGuess.toUpperCase() === currentWord) {
      const newScore = score + 100 + (level * 10)
      setScore(newScore)
      
      // Check if level is a multiple of 10
      if (level % 10 === 0) {
        setLevelCompleted(true)
        onUpdate({ 
          currentWord, 
          scrambledWord, 
          userGuess, 
          score: newScore, 
          level, 
          hint, 
          gameComplete,
          gameStarted,
          levelCompleted: true
        }, newScore)
        
        // Handle progression after 2 seconds
        setTimeout(() => {
          setLevelCompleted(false)
          const nextLevel = level + 1
          if (nextLevel > words.length) {
            setGameComplete(true)
            onComplete(newScore, true)
          } else {
            setLevel(nextLevel)
            setTimeout(() => {
              const wordData = words[nextLevel - 1]
              if (!wordData) return
              const scrambled = scrambleWord(wordData.word)
              
              setCurrentWord(wordData.word)
              setScrambledWord(scrambled)
              setUserGuess('')
              setHint(wordData.hint)
              setGameStarted(true)
              
              onUpdate({ 
                currentWord: wordData.word, 
                scrambledWord: scrambled, 
                userGuess: '', 
                score: newScore, 
                level: nextLevel, 
                hint: wordData.hint, 
                gameComplete: false,
                gameStarted: true,
                levelCompleted: false
              }, newScore)
            }, 1000)
          }
        }, 2000)
                             } else {
           // Regular level completion
           const nextLevel = level + 1
           if (nextLevel > words.length) {
             setGameComplete(true)
             onComplete(newScore, true)
           } else {
             setLevel(nextLevel)
             setTimeout(() => {
               const wordData = words[nextLevel - 1] // Use nextLevel - 1 for array index
               const scrambled = scrambleWord(wordData.word)
               
               setCurrentWord(wordData.word)
               setScrambledWord(scrambled)
               setUserGuess('')
               setHint(wordData.hint)
               setGameStarted(true) // Keep game started for next level
               
               onUpdate({ 
                 currentWord: wordData.word, 
                 scrambledWord: scrambled, 
                 userGuess: '', 
                 score: newScore, 
                 level: nextLevel, 
                 hint: wordData.hint, 
                 gameComplete: false,
                 gameStarted: true,
                 levelCompleted: false
               }, newScore)
             }, 1000)
           }
         }
         } else {
       // Wrong guess - game over, reset the game
       setGameComplete(true)
       onComplete(score, false) // false means game was not completed successfully
       onUpdate({ 
         currentWord, 
         scrambledWord, 
         userGuess, 
         score, 
         level, 
         hint, 
         gameComplete: true,
         gameStarted: false,
         levelCompleted: false
       }, score)
     }
  }

  const resetGame = () => {
    setScore(0)
    setLevel(1)
    setGameComplete(false)
    setLevelCompleted(false)
    setGameStarted(true) // Set to true since initializeGame will set it to true anyway
    initializeGame()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Word Scramble</h2>
        <div className="flex justify-center space-x-8 text-lg mb-4">
          <div className="text-blue-600">Level: {level}</div>
          <div className="text-primary-600">Score: {score}</div>
        </div>
        

        
        {levelCompleted && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            🎉 Level {level} Completed! 🎉
          </div>
        )}
        
                 {gameComplete && level >= words.length && (
           <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
             🎉 Congratulations! You completed all 100 levels!
           </div>
         )}
         
         {gameComplete && level < words.length && (
           <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
             ❌ Game Over! Wrong answer. Your final score: {score} points
           </div>
         )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Unscramble this word:</h3>
          <div className="text-4xl font-bold text-primary-600 tracking-wider">
            {scrambledWord}
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-1">Hint:</h4>
          <p className="text-blue-800">{hint}</p>
        </div>

                 {!gameComplete && !levelCompleted && gameStarted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="guess" className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <input
                type="text"
                id="guess"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your answer..."
                disabled={gameComplete}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={gameComplete || !userGuess.trim()}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          </form>
        )}
      </div>

             <div className="text-center space-x-4">
         {gameComplete && (
           <div className="mb-4">
             <button
               onClick={resetGame}
               className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
             >
               Play Again
             </button>
           </div>
         )}
         {!gameComplete && (
           <button
             onClick={resetGame}
             className="bg-secondary-600 text-white px-6 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
           >
             New Game
           </button>
         )}
       </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
        <p className="text-sm text-gray-600">
          Unscramble the letters to form a word. Use the hint to help you! 
          You get 100 points for each correct answer plus bonus points for higher levels.
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

export default WordScramble
