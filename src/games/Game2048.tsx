import React, { useCallback, useEffect, useRef, useState } from 'react'

interface Game2048Props {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

type Direction = 'up' | 'down' | 'left' | 'right'

const createEmpty = (size: number): number[][] => Array.from({ length: size }, () => Array(size).fill(0))

const clone = (b: number[][]) => b.map(row => [...row])

const getEmptyCells = (b: number[][]): Array<[number, number]> => {
  const rows = b.length
  const cols = b[0]?.length || 0
  const out: Array<[number, number]> = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (b[r][c] === 0) out.push([r, c])
  return out
}

const spawnRandom = (b: number[][], count = 1) => {
  const cells = getEmptyCells(b)
  for (let i = 0; i < count && cells.length > 0; i++) {
    const idx = Math.floor(Math.random() * cells.length)
    const [r, c] = cells.splice(idx, 1)[0]
    b[r][c] = Math.random() < 0.9 ? 2 : 4
  }
}

const canMove = (b: number[][]): boolean => {
  const rows = b.length
  const cols = b[0]?.length || 0
  if (getEmptyCells(b).length > 0) return true
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = b[r][c]
      if ((r + 1 < rows && b[r + 1][c] === v) || (c + 1 < cols && b[r][c + 1] === v)) return true
    }
  }
  return false
}

const rotate = (b: number[][]): number[][] => {
  const n = b.length
  const out = createEmpty(n)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      out[c][n - 1 - r] = b[r][c]
    }
  }
  return out
}

const compressAndMergeRow = (row: number[]): { row: number[]; gained: number } => {
  const size = row.length
  const filtered = row.filter(v => v !== 0)
  const out: number[] = []
  let gained = 0
  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2
      out.push(merged)
      gained += merged
      i++
    } else {
      out.push(filtered[i])
    }
  }
  while (out.length < size) out.push(0)
  return { row: out, gained }
}

const moveLeft = (b: number[][]): { board: number[][]; moved: boolean; gained: number } => {
  let moved = false
  let gained = 0
  const out = b.map(r => {
    const before = [...r]
    const { row, gained: g } = compressAndMergeRow(before)
    gained += g
    if (!moved && row.some((v, idx) => v !== before[idx])) moved = true
    return row
  })
  return { board: out, moved, gained }
}

const moveBoard = (b: number[][], dir: Direction): { board: number[][]; moved: boolean; gained: number } => {
  let temp = clone(b)
  let times = 0
  if (dir === 'up') times = 3
  if (dir === 'right') times = 2
  if (dir === 'down') times = 1
  for (let i = 0; i < times; i++) temp = rotate(temp)
  const { board: movedLeft, moved, gained } = moveLeft(temp)
  let res = movedLeft
  for (let i = 0; i < (4 - times) % 4; i++) res = rotate(res)
  return { board: res, moved, gained }
}

const tileColor = (v: number) => {
  switch (v) {
    case 0: return 'bg-gray-200'
    case 2: return 'bg-amber-50 text-gray-800'
    case 4: return 'bg-amber-100 text-gray-800'
    case 8: return 'bg-orange-200 text-gray-900'
    case 16: return 'bg-orange-300 text-white'
    case 32: return 'bg-orange-400 text-white'
    case 64: return 'bg-orange-500 text-white'
    case 128: return 'bg-yellow-400 text-white'
    case 256: return 'bg-yellow-500 text-white'
    case 512: return 'bg-yellow-600 text-white'
    case 1024: return 'bg-yellow-700 text-white'
    case 2048: return 'bg-green-500 text-white'
    default: return 'bg-green-600 text-white'
  }
}

const Game2048: React.FC<Game2048Props> = ({ onComplete, onUpdate, initialState }) => {
  const [boardSize, setBoardSize] = useState<number>(initialState?.board?.length || 8)
  const [board, setBoard] = useState<number[][]>(() => initialState?.board || createEmpty(8))
  const [score, setScore] = useState<number>(initialState?.score || 0)
  const [hasWon, setHasWon] = useState<boolean>(initialState?.hasWon || false)
  const [gameOver, setGameOver] = useState<boolean>(initialState?.gameOver || false)
  const [lastBoard, setLastBoard] = useState<number[][] | null>(null)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [canUndo, setCanUndo] = useState<boolean>(false)
  const initializedRef = useRef(false)

  // initialize with two tiles
  useEffect(() => {
    if (initializedRef.current) return
    const b = clone(board)
    const totalCells = (b.length) * (b[0]?.length || 0)
    if (getEmptyCells(b).length === totalCells) {
      spawnRandom(b, 2)
      setBoard(clone(b))
    }
    initializedRef.current = true
  }, [board])

  // notify parent
  useEffect(() => {
    onUpdate({ board, score, hasWon, gameOver })
  }, [board, score, hasWon, gameOver, onUpdate])

  const handleMove = useCallback((dir: Direction) => {
    if (gameOver) return
    const { board: next, moved, gained } = moveBoard(board, dir)
    if (!moved) return

    // save undo state (single-step)
    setLastBoard(board)
    setLastScore(score)
    setCanUndo(true)

    const afterSpawn = clone(next)
    spawnRandom(afterSpawn, 1)
    const newScore = score + gained
    setBoard(afterSpawn)
    setScore(newScore)

    // check win
    if (!hasWon) {
      for (let r = 0; r < afterSpawn.length; r++) {
        for (let c = 0; c < afterSpawn[r].length; c++) {
          if (afterSpawn[r][c] >= 2048) {
            setHasWon(true)
            // mark completed but allow continue
            onComplete(newScore, true)
            break
          }
        }
      }
    }

    // check game over (no moves)
    if (!canMove(afterSpawn)) {
      setGameOver(true)
      if (!hasWon) onComplete(newScore, false)
    }
  }, [board, score, gameOver, hasWon, onComplete])

  const undo = () => {
    if (!canUndo || !lastBoard) return
    setBoard(clone(lastBoard))
    setScore(lastScore || 0)
    setLastBoard(null)
    setLastScore(null)
    setCanUndo(false)
  }

  // keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleMove('left')
      else if (e.key === 'ArrowRight') handleMove('right')
      else if (e.key === 'ArrowUp') handleMove('up')
      else if (e.key === 'ArrowDown') handleMove('down')
      else if (e.key.toLowerCase() === 'u') undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleMove, undo])

  const reset = () => {
    if (!window.confirm('Reset the game? Your current board and score will be lost.')) return
    setBoard(createEmpty(boardSize))
    setScore(0)
    setHasWon(false)
    setGameOver(false)
    setLastBoard(null)
    setLastScore(null)
    setCanUndo(false)
    initializedRef.current = false
  }

  // change size: resets the game and spawns two tiles
  const changeSize = (size: number) => {
    setBoardSize(size)
    const b = createEmpty(size)
    spawnRandom(b, 2)
    setBoard(b)
    setScore(0)
    setHasWon(false)
    setGameOver(false)
    setLastBoard(null)
    setLastScore(null)
    setCanUndo(false)
    initializedRef.current = true
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded">Score: {score}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Size: {boardSize}×{boardSize}</div>
          <div className="flex items-center space-x-2">
            <button onClick={() => changeSize(4)} className={`btn-secondary ${boardSize === 4 ? 'opacity-70' : ''}`}>4×4</button>
            <button onClick={() => changeSize(8)} className={`btn-secondary ${boardSize === 8 ? 'opacity-70' : ''}`}>8×8</button>
          </div>
          {hasWon && (
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded">2048 reached! You can continue.</div>
          )}
          {gameOver && (
            <div className="px-3 py-1 bg-red-100 text-red-700 rounded">No more moves</div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={undo} disabled={!canUndo} className={`btn-secondary ${!canUndo ? 'opacity-60 cursor-not-allowed' : ''}`}>Undo</button>
          <button onClick={reset} className="btn-primary">Reset</button>
        </div>
      </div>

      <div className="inline-block p-3 bg-gray-300 rounded-lg">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${boardSize}, 72px)` }}>
          {board.map((row, r) => row.map((v, c) => (
            <div key={`${r}-${c}`} className={`w-[72px] h-[72px] rounded flex items-center justify-center text-xl font-bold ${tileColor(v)}`}>
              {v !== 0 ? v : ''}
            </div>
          )))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Controls: Arrow keys to move. Press U or click Undo to go one step back. Reaching 2048 wins but you can keep playing.
      </div>
    </div>
  )
}

export default Game2048


