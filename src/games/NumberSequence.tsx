import React, { useState, useEffect, useCallback } from 'react';

interface NumberSequenceProps {
  onComplete: (score: number, completed: boolean) => void;
  onUpdate: (state: any, score?: number) => void;
  initialState?: any;
  progress?: any;
}

const NumberSequence: React.FC<NumberSequenceProps> = ({ onComplete, onUpdate }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gamePhase, setGamePhase] = useState<'showing' | 'input' | 'gameOver'>('showing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);

  const generateSequence = useCallback((length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameActive(true);
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    startLevel(1);
  }, []);

  const startLevel = useCallback((levelNumber: number) => {
    const sequenceLength = Math.min(3 + levelNumber, 10);
    const newSequence = generateSequence(sequenceLength);
    setSequence(newSequence);
    setPlayerSequence([]);
    setCurrentIndex(0);
    setGamePhase('showing');
  }, [generateSequence]);

  const handleNumberClick = useCallback((number: number) => {
    if (gamePhase !== 'input' || !gameActive) return;

    const newPlayerSequence = [...playerSequence, number];
    setPlayerSequence(newPlayerSequence);

    // Check if the sequence is correct so far
    const currentLength = newPlayerSequence.length;
    if (newPlayerSequence[currentLength - 1] !== sequence[currentLength - 1]) {
      // Wrong number - game over
      setGameActive(false);
      setGamePhase('gameOver');
      onComplete(score, true);
      return;
    }

    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      // Level completed
      const levelScore = level * 10;
      const newScore = score + levelScore;
      setScore(newScore);
      
      if (level >= 10) {
        // Game completed
        setGameActive(false);
        setGamePhase('gameOver');
        onComplete(newScore, true);
      } else {
        // Next level
        setLevel(prev => prev + 1);
        setTimeout(() => startLevel(level + 1), 1000);
      }
    }
  }, [gamePhase, gameActive, playerSequence, sequence, score, level, onComplete, startLevel]);

  // Show sequence effect
  useEffect(() => {
    if (gamePhase === 'showing' && sequence.length > 0) {
      const timer = setTimeout(() => {
        if (currentIndex < sequence.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setGamePhase('input');
          setCurrentIndex(0);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, sequence, currentIndex]);

  // Timer effect
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
            setGamePhase('gameOver');
            onComplete(score, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameActive, timeLeft, score, onComplete]);

  // Update parent component
  useEffect(() => {
    if (gameStarted) {
      onUpdate({
        gameStarted,
        score,
        level,
        timeLeft,
        gamePhase,
        sequenceLength: sequence.length,
        playerSequenceLength: playerSequence.length
      }, score);
    }
  }, [gameStarted, score, level, timeLeft, gamePhase, sequence.length, playerSequence.length, onUpdate]);

  if (!gameStarted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Number Sequence</h2>
        <p className="text-gray-600 mb-6">Remember the sequence and repeat it!</p>
        <button
          onClick={startGame}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Number Sequence</h2>
        <div className="flex justify-center gap-4 text-sm">
          <span>Score: {score}</span>
          <span>Level: {level}</span>
          <span>Time: {timeLeft}s</span>
        </div>
      </div>

      {/* Sequence Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">
          {gamePhase === 'showing' ? 'Watch the sequence:' : 'Repeat the sequence:'}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              disabled={gamePhase !== 'input' || !gameActive}
              className={`
                w-16 h-16 rounded-lg text-2xl font-bold transition-all
                ${gamePhase === 'showing' && currentIndex < sequence.length && sequence[currentIndex] === number
                  ? 'bg-yellow-400 scale-110'
                  : gamePhase === 'input' && playerSequence.includes(number)
                    ? 'bg-green-400'
                    : 'bg-blue-500 hover:bg-blue-600'
                }
                ${gamePhase !== 'input' || !gameActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {number}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Sequence: {sequence.length} numbers</span>
          <span>Your input: {playerSequence.length}/{sequence.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(playerSequence.length / sequence.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Sequence Display */}
      {gamePhase === 'input' && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Your input:</h4>
          <div className="flex gap-2 flex-wrap">
            {playerSequence.map((num, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded text-sm font-bold ${
                  index < sequence.length && num === sequence[index] 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Game Over */}
      {gamePhase === 'gameOver' && (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Game Over!</h3>
          <p className="text-gray-600 mb-4">Final Score: {score}</p>
          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default NumberSequence;
