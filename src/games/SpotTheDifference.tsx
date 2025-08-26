import React, { useState, useEffect, useCallback } from 'react';

interface SpotTheDifferenceProps {
  onComplete: (score: number, completed: boolean) => void;
  onUpdate: (state: any, score?: number) => void;
  initialState?: any;
  progress?: any;
}

const SpotTheDifference: React.FC<SpotTheDifferenceProps> = ({ onComplete, onUpdate }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [grid1, setGrid1] = useState<boolean[][]>([]);
  const [grid2, setGrid2] = useState<boolean[][]>([]);
  const [differences, setDifferences] = useState<{row: number, col: number}[]>([]);
  const [foundDifferences, setFoundDifferences] = useState<{row: number, col: number}[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gridSize, setGridSize] = useState(6);

  const generateGrid = useCallback((size: number, numDifferences: number) => {
    // Create base grid
    const baseGrid = Array(size).fill(null).map(() => Array(size).fill(false));
    
    // Add random "objects" to the grid
    const numObjects = Math.floor((size * size) * 0.3);
    for (let i = 0; i < numObjects; i++) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      baseGrid[row][col] = true;
    }
    
    // Create second grid as a copy
    const grid2 = baseGrid.map(row => [...row]);
    
    // Add differences
    const diffPositions: {row: number, col: number}[] = [];
    for (let i = 0; i < numDifferences; i++) {
      let row: number, col: number;
      do {
        row = Math.floor(Math.random() * size);
        col = Math.floor(Math.random() * size);
      } while (diffPositions.some(d => d.row === row && d.col === col));
      
      diffPositions.push({ row, col });
      grid2[row][col] = !grid2[row][col]; // Flip the cell
    }
    
    return { grid1: baseGrid, grid2, differences: diffPositions };
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameActive(true);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setFoundDifferences([]);
    startLevel(1);
  }, []);

  const startLevel = useCallback((levelNumber: number) => {
    const size = Math.min(6 + Math.floor(levelNumber / 3), 10);
    const numDifferences = Math.min(3 + levelNumber, 8);
    setGridSize(size);
    
    const { grid1: newGrid1, grid2: newGrid2, differences: newDifferences } = generateGrid(size, numDifferences);
    setGrid1(newGrid1);
    setGrid2(newGrid2);
    setDifferences(newDifferences);
    setFoundDifferences([]);
  }, [generateGrid]);

  const handleCellClick = useCallback((row: number, col: number, gridIndex: number) => {
    if (!gameActive) return;

    const clickedGrid = gridIndex === 1 ? grid1 : grid2;
    const otherGrid = gridIndex === 1 ? grid2 : grid1;
    
    // Check if this is a difference
    const isDifference = clickedGrid[row][col] !== otherGrid[row][col];
    const alreadyFound = foundDifferences.some(d => d.row === row && d.col === col);
    
    if (isDifference && !alreadyFound) {
      // Found a difference!
      const newFoundDifferences = [...foundDifferences, { row, col }];
      setFoundDifferences(newFoundDifferences);
      
      const differenceScore = Math.floor(100 / differences.length);
      const newScore = score + differenceScore;
      setScore(newScore);
      
      // Check if all differences found
      if (newFoundDifferences.length === differences.length) {
        const levelBonus = level * 50;
        const finalLevelScore = newScore + levelBonus;
        setScore(finalLevelScore);
        
        if (level >= 10) {
          // Game completed
          setGameActive(false);
          onComplete(finalLevelScore, true);
        } else {
          // Next level
          setLevel(prev => prev + 1);
          setTimeout(() => startLevel(level + 1), 1500);
        }
      }
    } else if (!isDifference) {
      // Wrong click - penalty
      const penalty = Math.max(0, score - 10);
      setScore(penalty);
    }
  }, [gameActive, grid1, grid2, foundDifferences, differences, score, level, onComplete, startLevel]);

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
        foundDifferences: foundDifferences.length,
        totalDifferences: differences.length,
        gridSize
      }, score);
    }
  }, [gameStarted, score, level, timeLeft, foundDifferences.length, differences.length, gridSize, onUpdate]);

  const renderGrid = (grid: boolean[][], gridIndex: number) => (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isFound = foundDifferences.some(d => d.row === rowIndex && d.col === colIndex);
          // Do not compute/show difference state to avoid visual hints
          
          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex, gridIndex)}
              disabled={!gameActive}
              className={`
                w-8 h-8 md:w-10 md:h-10 rounded transition-all
                ${cell ? 'bg-blue-500' : 'bg-gray-200'}
                ${isFound ? 'ring-2 ring-green-500 bg-green-400' : ''}
                hover:scale-105 disabled:opacity-50
              `}
            />
          );
        })
      )}
    </div>
  );

  if (!gameStarted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Spot The Difference</h2>
        <p className="text-gray-600 mb-6">Find all the differences between the two grids! Tiles will not highlight until you find a correct difference.</p>
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Spot The Difference</h2>
        <div className="flex justify-center gap-4 text-sm">
          <span>Score: {score}</span>
          <span>Level: {level}</span>
          <span>Time: {timeLeft}s</span>
          <span>Found: {foundDifferences.length}/{differences.length}</span>
        </div>
      </div>

      {/* Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Grid 1</h3>
          <div className="flex justify-center">
            {renderGrid(grid1, 1)}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Grid 2</h3>
          <div className="flex justify-center">
            {renderGrid(grid2, 2)}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Click on the differences between the two grids. 
          <span className="text-green-600 font-semibold"> Green</span> = found.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{foundDifferences.length} / {differences.length} differences found</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(foundDifferences.length / differences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Game Over */}
      {!gameActive && (
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

export default SpotTheDifference;
