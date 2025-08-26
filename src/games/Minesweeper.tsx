import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface MinesweeperProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacent: number
}

const ROWS = 16
const COLS = 16
const MINES = 40

const adjacentDirs = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

const inBounds = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS

const createEmptyBoard = (): Cell[][] => Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => ({ isMine: false, isRevealed: false, isFlagged: false, adjacent: 0 }))
)

const placeMines = (board: Cell[][], safeR: number, safeC: number): void => {
  let placed = 0
  const forbidden = new Set<string>()
  // keep first click area (safe and its neighbors) free
  for (const [dr, dc] of [[0,0], ...adjacentDirs]) {
    const rr = safeR + (dr as number)
    const cc = safeC + (dc as number)
    if (inBounds(rr, cc)) forbidden.add(`${rr},${cc}`)
  }
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (forbidden.has(`${r},${c}`)) continue
    if (!board[r][c].isMine) {
      board[r][c].isMine = true
      placed++
    }
  }
}

const computeAdjacency = (board: Cell[][]) => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) { board[r][c].adjacent = 0; continue }
      let count = 0
      for (const [dr, dc] of adjacentDirs) {
        const rr = r + (dr as number)
        const cc = c + (dc as number)
        if (inBounds(rr, cc) && board[rr][cc].isMine) count++
      }
      board[r][c].adjacent = count
    }
  }
}

const Minesweeper: React.FC<MinesweeperProps> = ({ onComplete, onUpdate, initialState }) => {
  const [board, setBoard] = useState<Cell[][]>(() => initialState?.board || createEmptyBoard())
  const [revealedSafe, setRevealedSafe] = useState<number>(initialState?.revealedSafe || 0)
  const [flags, setFlags] = useState<number>(initialState?.flags || 0)
  const [started, setStarted] = useState<boolean>(initialState?.started || false)
  const [gameOver, setGameOver] = useState<boolean>(initialState?.gameOver || false)
  const [win, setWin] = useState<boolean>(initialState?.win || false)
  const [elapsed, setElapsed] = useState<number>(initialState?.elapsed || 0)
  const timerRef = useRef<number | null>(null)
  const firstClickRef = useRef<boolean>(true)

  // total safe cells
  const totalSafe = useMemo(() => ROWS * COLS - MINES, [])

  useEffect(() => {
    if (started && !gameOver) {
      timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
      return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
    }
    return
  }, [started, gameOver])

  useEffect(() => {
    onUpdate({
      board,
      revealedSafe,
      flags,
      started,
      gameOver,
      win,
      elapsed,
    })
  }, [board, revealedSafe, flags, started, gameOver, win, elapsed, onUpdate])

  const startWithSafe = useCallback((r: number, c: number): Cell[][] => {
    const newBoard = createEmptyBoard()
    placeMines(newBoard, r, c)
    computeAdjacency(newBoard)
    return newBoard
  }, [])

  const floodReveal = useCallback((b: Cell[][], r: number, c: number): number => {
    const stack: Array<[number, number]> = [[r, c]]
    let revealed = 0
    while (stack.length) {
      const [rr, cc] = stack.pop() as [number, number]
      const cell = b[rr][cc]
      if (cell.isRevealed || cell.isFlagged) continue
      cell.isRevealed = true
      if (!cell.isMine) revealed++
      if (cell.adjacent === 0) {
        for (const [dr, dc] of adjacentDirs) {
          const nr = rr + (dr as number)
          const nc = cc + (dc as number)
          if (inBounds(nr, nc) && !b[nr][nc].isRevealed && !b[nr][nc].isMine) {
            stack.push([nr, nc])
          }
        }
      }
    }
    return revealed
  }, [])

  const calculateFinalScore = useCallback((b: Cell[][], safeRevealed: number, seconds: number) => {
    let correctFlags = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c].isMine && b[r][c].isFlagged) correctFlags++
      }
    }
    const base = safeRevealed + correctFlags * 5
    const minutes = seconds / 60
    const multiplier = Math.max(0.6, 1.2 - minutes / 5)
    return Math.floor(base * multiplier)
  }, [])

  const handleReveal = useCallback((r: number, c: number) => {
    if (gameOver) return
    const cell = board[r][c]
    if (cell.isRevealed || cell.isFlagged) return

    let newBoard = board.map(row => row.map(c => ({ ...c })))

    if (firstClickRef.current) {
      // ensure first click safe and start timer
      newBoard = startWithSafe(r, c)
      setStarted(true)
      firstClickRef.current = false
    }

    const target = newBoard[r][c]
    if (target.isMine) {
      // reveal mine -> lose
      target.isRevealed = true
      setBoard(newBoard)
      setGameOver(true)
      setWin(false)
      if (timerRef.current) window.clearInterval(timerRef.current)
      const finalScore = calculateFinalScore(newBoard, revealedSafe, elapsed)
      onComplete(finalScore, false)
      return
    }

    // reveal cell (and flood if zero)
    const newly = target.adjacent === 0 ? floodReveal(newBoard, r, c) : (target.isRevealed ? 0 : (target.isRevealed = true, 1))
    const totalRevealed = revealedSafe + newly
    setBoard(newBoard)
    setRevealedSafe(totalRevealed)

    if (totalRevealed >= totalSafe) {
      // win
      setGameOver(true)
      setWin(true)
      if (timerRef.current) window.clearInterval(timerRef.current)
      const finalScore = calculateFinalScore(newBoard, totalRevealed, elapsed)
      onComplete(finalScore, true)
    }
  }, [board, gameOver, revealedSafe, totalSafe, startWithSafe, floodReveal, calculateFinalScore, elapsed, onComplete])

  const toggleFlag = useCallback((r: number, c: number) => {
    if (gameOver) return
    const cell = board[r][c]
    if (cell.isRevealed) return
    const newBoard = board.map(row => row.map(c => ({ ...c })))
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged
    setBoard(newBoard)
    setFlags(f => newBoard[r][c].isFlagged ? f + 1 : f - 1)
  }, [board, gameOver])

  const handleContextMenu = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    toggleFlag(r, c)
  }, [toggleFlag])

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    setBoard(createEmptyBoard())
    setRevealedSafe(0)
    setFlags(0)
    setStarted(false)
    setGameOver(false)
    setWin(false)
    setElapsed(0)
    firstClickRef.current = true
    onUpdate({ board: createEmptyBoard(), revealedSafe: 0, flags: 0, started: false, gameOver: false, win: false, elapsed: 0 }, 0)
  }

  const minesRemaining = MINES - flags

  const numberColor = (n: number) => {
    switch (n) {
      case 1: return 'text-blue-600'
      case 2: return 'text-green-600'
      case 3: return 'text-red-600'
      case 4: return 'text-indigo-700'
      case 5: return 'text-yellow-700'
      case 6: return 'text-teal-600'
      case 7: return 'text-purple-700'
      case 8: return 'text-gray-700'
      default: return 'text-gray-700'
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded">Mines: {MINES}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Flags: {flags}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Left: {minesRemaining}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Revealed: {revealedSafe}/{totalSafe}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Time: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
        </div>
        <button onClick={reset} className="btn-secondary">Reset</button>
      </div>

      <div
        className="grid gap-1 select-none"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {board.map((row, r) => row.map((cell, c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => handleReveal(r, c)}
            onContextMenu={(e) => handleContextMenu(e, r, c)}
            className={`w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center border 
              ${cell.isRevealed ? 'bg-gray-100 border-gray-300' : 'bg-gray-300 border-gray-400 hover:bg-gray-200'}
              ${cell.isFlagged && !cell.isRevealed ? 'bg-yellow-300' : ''}
            `}
            disabled={gameOver}
            aria-label={cell.isRevealed ? (cell.isMine ? 'Mine' : `${cell.adjacent}`) : (cell.isFlagged ? 'Flagged' : 'Hidden cell')}
            title={cell.isRevealed ? '' : 'Left click: reveal, Right click: flag'}
          >
            {cell.isRevealed ? (
              cell.isMine ? (
                <span>💣</span>
              ) : (
                cell.adjacent > 0 ? <span className={`font-bold ${numberColor(cell.adjacent)}`}>{cell.adjacent}</span> : null
              )
            ) : (
              cell.isFlagged ? <span>🚩</span> : null
            )}
          </button>
        )))}
      </div>

      {gameOver && (
        <div className="mt-4 text-center">
          <div className="text-xl font-semibold">
            {win ? 'You cleared the board! 🎉' : 'Boom! You hit a mine.'}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Tips: First click is always safe. Right-click to flag on desktop. On mobile, use long-press (or tap the same cell to toggle flag if your browser supports context menu).
      </div>
    </div>
  )
}

export default Minesweeper


