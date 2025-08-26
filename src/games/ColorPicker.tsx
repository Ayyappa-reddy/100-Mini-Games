import React, { useState, useEffect, useCallback } from 'react';

interface ColorPickerProps {
  onComplete: (score: number, completed: boolean) => void;
  onUpdate: (state: any, score?: number) => void;
  initialState?: any;
  progress?: any;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onComplete, onUpdate, initialState }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [targetColor, setTargetColor] = useState({ r: 0, g: 0, b: 0 });
  const [playerColor, setPlayerColor] = useState({ r: 128, g: 128, b: 128 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(1);
  const [attempts, setAttempts] = useState(0);

  const generateTargetColor = useCallback(() => {
    return {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
  }, []);

  const calculateColorDifference = useCallback((color1: any, color2: any) => {
    const rDiff = Math.abs(color1.r - color2.r);
    const gDiff = Math.abs(color1.g - color2.g);
    const bDiff = Math.abs(color1.b - color2.b);
    return rDiff + gDiff + bDiff;
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameActive(true);
    setTimeLeft(60);
    setScore(0);
    setLevel(1);
    setAttempts(0);
    setTargetColor(generateTargetColor());
    setPlayerColor({ r: 128, g: 128, b: 128 });
  }, [generateTargetColor]);

  const handleColorChange = useCallback((channel: 'r' | 'g' | 'b', value: number) => {
    setPlayerColor(prev => ({ ...prev, [channel]: value }));
  }, []);

  const checkMatch = useCallback(() => {
    const difference = calculateColorDifference(targetColor, playerColor);
    const maxDifference = 255 * 3; // Maximum possible difference
    const accuracy = Math.max(0, 100 - (difference / maxDifference) * 100);
    
    setAttempts(prev => prev + 1);
    
    if (accuracy >= 90) {
      const levelScore = Math.floor(accuracy * (level * 0.5));
      const newScore = score + levelScore;
      setScore(newScore);
      setLevel(prev => prev + 1);
      setTargetColor(generateTargetColor());
      setPlayerColor({ r: 128, g: 128, b: 128 });
      
      if (level >= 10) {
        setGameActive(false);
        onComplete(newScore, true);
      }
    }
  }, [targetColor, playerColor, calculateColorDifference, score, level, generateTargetColor, onComplete]);

  const resetColor = useCallback(() => {
    setPlayerColor({ r: 128, g: 128, b: 128 });
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
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
        attempts,
        targetColor,
        playerColor
      }, score);
    }
  }, [gameStarted, score, level, timeLeft, attempts, targetColor, playerColor, onUpdate]);

  if (!gameStarted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Color Picker</h2>
        <p className="text-gray-600 mb-6">Match the target color by adjusting the RGB sliders!</p>
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Color Picker</h2>
        <div className="flex justify-center gap-4 text-sm">
          <span>Score: {score}</span>
          <span>Level: {level}</span>
          <span>Time: {timeLeft}s</span>
          <span>Attempts: {attempts}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target Color */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Target Color</h3>
          <div 
            className="w-full h-32 rounded-lg border-2 border-gray-300"
            style={{ backgroundColor: `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` }}
          />
          <div className="text-sm text-gray-600">
            RGB: ({targetColor.r}, {targetColor.g}, {targetColor.b})
          </div>
        </div>

        {/* Player Color */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Color</h3>
          <div 
            className="w-full h-32 rounded-lg border-2 border-gray-300"
            style={{ backgroundColor: `rgb(${playerColor.r}, ${playerColor.g}, ${playerColor.b})` }}
          />
          <div className="text-sm text-gray-600">
            RGB: ({playerColor.r}, {playerColor.g}, {playerColor.b})
          </div>
        </div>
      </div>

      {/* Color Sliders */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Red: {playerColor.r}
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={playerColor.r}
            onChange={(e) => handleColorChange('r', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #000, #f00)` }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Green: {playerColor.g}
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={playerColor.g}
            onChange={(e) => handleColorChange('g', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #000, #0f0)` }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Blue: {playerColor.b}
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={playerColor.b}
            onChange={(e) => handleColorChange('b', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #000, #00f)` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4 justify-center">
        <button
          onClick={checkMatch}
          disabled={!gameActive}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Check Match
        </button>
        <button
          onClick={resetColor}
          disabled={!gameActive}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {/* Game Over */}
      {!gameActive && (
        <div className="mt-6 text-center">
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

export default ColorPicker;
