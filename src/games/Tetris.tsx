import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Pause, Play } from 'lucide-react';

interface Tetromino {
  shape: number[][];
  color: string;
}

const TETROMINOS: { [key: string]: Tetromino } = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-500'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-500'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-500'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-500'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500'
  }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

interface TetrisProps {
  onComplete: (finalScore: number, completed?: boolean) => Promise<void>;
  onUpdate: (newState: any, newScore?: number) => void;
  initialState: any;
  progress: any;
}

const Tetris: React.FC<TetrisProps> = ({ onComplete, onUpdate }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][]; x: number; y: number; type: string } | null>(null);
  const [nextPieces, setNextPieces] = useState<string[]>([]);
  const [heldPiece, setHeldPiece] = useState<string | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dropTime, setDropTime] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const gameLoopRef = useRef<number>();
  const dropIntervalRef = useRef<number>();



  // Game loop
  useEffect(() => {
    if (gameOver || paused) return;

    const gameLoop = (time: number) => {
      if (lastTime === 0) {
        setLastTime(time);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = time - lastTime;
      setDropTime(prev => prev + deltaTime);

      if (dropTime > (1000 - (level - 1) * 50)) {
        dropPiece();
        setDropTime(0);
      }

      setLastTime(time);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver, paused, lastTime, dropTime, level]);

  // Cleanup intervals
  useEffect(() => {
    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, []);

  // Update score and notify parent component (only when score changes significantly)
  useEffect(() => {
    if (score > 0) {
      onUpdate({ board, currentPiece, nextPieces, heldPiece, score, level, lines }, score);
    }
  }, [score, onUpdate]); // Only depend on score changes, not every state change

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      console.log('Game over, calling onComplete once');
      onComplete(score, false);
    }
  }, [gameOver]); // Only depend on gameOver, not score or onComplete



  const spawnNewPiece = () => {
    // Generate a single random piece
    const pieces = Object.keys(TETROMINOS);
    const pieceType = pieces[Math.floor(Math.random() * pieces.length)];
    
    // Create the new piece
    const piece = {
      shape: TETROMINOS[pieceType].shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[pieceType].shape[0].length / 2),
      y: 0,
      type: pieceType
    };
    
    // Set current piece
    setCurrentPiece(piece);
    
    // Generate next piece for preview
    const nextPieceType = pieces[Math.floor(Math.random() * pieces.length)];
    setNextPieces([nextPieceType]);
    
    if (isCollision(piece.shape, piece.x, piece.y)) {
      setGameOver(true);
    }
  };

  // Initialize board after functions are defined
  useEffect(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    setBoard(newBoard);
  }, []);

  // Spawn first piece after board is initialized
  useEffect(() => {
    if (board.length > 0 && board[0].length > 0) {
      spawnNewPiece();
    }
  }, [board]);

  const isCollision = (shape: number[][], x: number, y: number): boolean => {
    // Safety check: ensure board is properly initialized
    if (!board || board.length === 0 || board[0].length === 0) {
      return true;
    }

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const newX = x + col;
          const newY = y + row;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && board[newY] && board[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotatePiece = (clockwise: boolean = true) => {
    if (!currentPiece) return;
    
    const rotated = clockwise 
      ? currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse())
      : currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[row.length - 1 - i]));
    
    // Try to place rotated piece
    if (!isCollision(rotated, currentPiece.x, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    } else {
      // Try wall kicks
      const kicks = [
        { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 },
        { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -2 }
      ];
      
      for (const kick of kicks) {
        if (!isCollision(rotated, currentPiece.x + kick.x, currentPiece.y + kick.y)) {
          setCurrentPiece({ 
            ...currentPiece, 
            shape: rotated, 
            x: currentPiece.x + kick.x, 
            y: currentPiece.y + kick.y 
          });
          return;
        }
      }
    }
  };

  const movePiece = (dx: number, dy: number) => {
    if (!currentPiece) return;
    
    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;
    
    if (!isCollision(currentPiece.shape, newX, newY)) {
      setCurrentPiece({ ...currentPiece, x: newX, y: newY });
    } else if (dy > 0) {
      // Piece has landed
      placePiece();
    }
  };

  const dropPiece = () => {
    movePiece(0, 1);
  };



  const placePiece = () => {
    if (!currentPiece) return;
    
    const newBoard = board.map(row => [...row]);
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col] !== 0) {
          const boardY = currentPiece.y + row;
          const boardX = currentPiece.x + col;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = 1;
          }
        }
      }
    }
    
    setBoard(newBoard);
    clearLines(newBoard);
    spawnNewPiece();
    setCanHold(true);
  };

  const clearLines = (currentBoard: number[][]) => {
    let linesCleared = 0;
    const newBoard = currentBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      setLevel(Math.floor((lines + linesCleared) / 10) + 1);
    }
    
    setBoard(newBoard);
  };

  const holdPiece = () => {
    if (!currentPiece || !canHold) return;
    
    const newHeld = heldPiece;
    setHeldPiece(currentPiece.type);
    
    if (newHeld) {
      const piece = {
        shape: TETROMINOS[newHeld].shape,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[newHeld].shape[0].length / 2),
        y: 0,
        type: newHeld
      };
      setCurrentPiece(piece);
    } else {
      spawnNewPiece();
    }
    
    setCanHold(false);
  };

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentPiece(null);
    setNextPieces([]);
    setHeldPiece(null);
    setCanHold(true);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setDropTime(0);
    setLastTime(0);
    spawnNewPiece();
  };

  const togglePause = () => {
    setPaused(prev => !prev);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          // Hard drop removed - use soft drop instead
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          rotatePiece(false); // Counter-clockwise
          break;
        case 'x':
        case 'X':
        case 'r':
        case 'R':
          e.preventDefault();
          rotatePiece(true); // Clockwise
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          holdPiece();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, gameOver]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col] !== 0) {
            const boardY = currentPiece.y + row;
            const boardX = currentPiece.x + col;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = 2; // Current piece
            }
          }
        }
      }
    }
    
    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => {
          const isFixed = board[y][x] === 1;
          const isCurrent = cell === 2;
          const isGhost = cell === 8;
          
          let cellClass = 'w-6 h-6 border border-gray-600';
          
          if (isFixed) {
            cellClass += ' bg-gray-400 border-gray-500';
          } else if (isCurrent) {
            cellClass += ` ${TETROMINOS[currentPiece?.type || 'I'].color} border-gray-300`;
          } else if (isGhost) {
            cellClass += ' bg-gray-600 border-gray-700';
          } else {
            cellClass += ' bg-gray-800';
          }
          
          return (
            <div key={x} className={cellClass} />
          );
        })}
      </div>
    ));
  };

  const renderNextPieces = () => {
    if (nextPieces.length === 0) return null;
    
    const pieceType = nextPieces[0];
    
    // Get the actual shape data
    const shape = TETROMINOS[pieceType]?.shape;
    if (!shape) {
      return <div className="text-red-500">No shape for {pieceType}</div>;
    }
    
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Next ({pieceType})</h3>
        <div className="flex justify-center">
          <div className="border border-gray-500 p-1 bg-gray-700 rounded">
            {shape.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-4 h-4 border border-gray-600 ${
                      cell !== 0 ? TETROMINOS[pieceType].color : 'bg-gray-800'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const renderHeldPiece = () => {
    if (!heldPiece) return null;
    
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Hold</h3>
        <div className="flex justify-center">
          {TETROMINOS[heldPiece].shape.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-4 h-4 border border-gray-600 ${
                    cell !== 0 ? TETROMINOS[heldPiece].color : 'bg-gray-800'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-8">Game Over!</h1>
        <div className="text-center mb-8">
          <p className="text-xl mb-2">Final Score: {score}</p>
          <p className="text-lg mb-2">Level: {level}</p>
          <p className="text-lg">Lines: {lines}</p>
        </div>
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-start gap-8">
        {/* Game Board */}
        <div className="flex flex-col items-center">
          <div className="mb-4 flex items-center gap-4">
            <h1 className="text-3xl font-bold">Tetris</h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              {showInfo ? 'Hide Info' : 'Show Info'}
            </button>
          </div>
          
          <div className="border-2 border-gray-600 bg-gray-800 p-2">
            {renderBoard()}
          </div>
          
          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => movePiece(-1, 0)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => movePiece(1, 0)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              →
            </button>
            <button
              onClick={() => movePiece(0, 1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              ↓
            </button>

          </div>
          
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => rotatePiece(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Z
            </button>
            <button
              onClick={() => rotatePiece(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              X/R
            </button>
            <button
              onClick={holdPiece}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Hold (C)
            </button>
          </div>
          
          <div className="mt-2">
            <button
              onClick={togglePause}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors flex items-center gap-2"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? 'Resume' : 'Pause'} (P)
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-6">
          {/* Info Panel */}
          {showInfo && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 min-w-80">
              <h3 className="text-lg font-semibold mb-3 text-center">How to Play</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Movement:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>← → Arrow keys: Move left/right</li>
                    <li>↓ Arrow key: Soft drop</li>
                    <li>↑ or Space: Hard drop</li>
                  </ul>
                </div>
                <div>
                  <strong>Rotation:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>Z key: Rotate counter-clockwise</li>
                    <li>X or R key: Rotate clockwise</li>
                    <li>Right-click: Rotate clockwise</li>
                  </ul>
                </div>
                <div>
                  <strong>Special Actions:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>C key: Hold piece</li>
                    <li>P key: Pause/Resume</li>
                  </ul>
                </div>
                <div>
                  <strong>Scoring:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>1 line: 100 × level</li>
                    <li>2 lines: 200 × level</li>
                    <li>3 lines: 300 × level</li>
                    <li>4 lines: 400 × level</li>
                  </ul>
                </div>
                <div>
                  <strong>Level System:</strong>
                  <p className="ml-4 mt-1">Speed increases every 10 lines cleared</p>
                </div>
              </div>
            </div>
          )}

          {/* Game Stats */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 min-w-80">
            <h3 className="text-lg font-semibold mb-3 text-center">Game Stats</h3>
            <div className="space-y-2 text-center">
              <p><span className="font-semibold">Score:</span> {score}</p>
              <p><span className="font-semibold">Level:</span> {level}</p>
              <p><span className="font-semibold">Lines:</span> {lines}</p>
              <p><span className="font-semibold">Next Level:</span> {Math.max(0, 10 - (lines % 10))}</p>
            </div>
          </div>

          {/* Next Pieces */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 min-w-80">
            {renderNextPieces()}
          </div>

          {/* Held Piece */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 min-w-80">
            {renderHeldPiece()}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tetris;


