import React, { useCallback, useEffect, useRef, useState } from 'react'

interface LightsOutProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

type Grid = boolean[][]

const defaultSize = 5

const createGrid = (size: number): Grid => Array.from({ length: size }, () => Array(size).fill(false))

const clone = (g: Grid) => g.map(row => [...row])

const toggleAt = (g: Grid, r: number, c: number) => {
  const n = g.length
  const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1]]
  for (const [dr, dc] of dirs) {
    const rr = r + dr, cc = c + dc
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) g[rr][cc] = !g[rr][cc]
  }
}

const scramble = (size: number, steps: number) => {
  const g = createGrid(size)
  for (let i = 0; i < steps; i++) {
    const r = Math.floor(Math.random() * size)
    const c = Math.floor(Math.random() * size)
    toggleAt(g, r, c)
  }
  return g
}

const allOff = (g: Grid) => g.every(row => row.every(cell => !cell))

const LightsOut: React.FC<LightsOutProps> = ({ onComplete, onUpdate, initialState }) => {
  const [size, setSize] = useState<number>(initialState?.size || defaultSize)
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>(initialState?.difficulty || 'easy')
  const stepsForDifficulty = useCallback((s: number) => {
    return difficulty === 'easy' ? Math.max(8, Math.floor(s * 2)) : Math.max(15, s * s)
  }, [difficulty])
  const [grid, setGrid] = useState<Grid>(() => initialState?.grid || scramble(defaultSize, Math.max(8, Math.floor(defaultSize * 2))))
  const [moves, setMoves] = useState<number>(initialState?.moves || 0)
  const [elapsed, setElapsed] = useState<number>(initialState?.elapsed || 0)
  const [canUndo, setCanUndo] = useState<boolean>(false)
  const [lastGrid, setLastGrid] = useState<Grid | null>(null)
  const [lastMoves, setLastMoves] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    onUpdate({ size, grid, moves, elapsed, canUndo })
  }, [size, grid, moves, elapsed, canUndo, onUpdate])

  const handleToggle = (r: number, c: number) => {
    setLastGrid(clone(grid))
    setLastMoves(moves)
    setCanUndo(true)
    const next = clone(grid)
    toggleAt(next, r, c)
    setGrid(next)
    setMoves(m => m + 1)
    if (allOff(next)) {
      const score = Math.max(10, 400 - elapsed - moves * 5)
      onComplete(score, true)
    }
  }

  const reset = (s: number = size) => {
    setSize(s)
    setGrid(scramble(s, stepsForDifficulty(s)))
    setMoves(0)
    setElapsed(0)
    setCanUndo(false)
    setLastGrid(null)
    setLastMoves(null)
  }

  const undo = () => {
    if (!canUndo || !lastGrid) return
    setGrid(clone(lastGrid))
    setMoves(lastMoves || 0)
    setCanUndo(false)
    setLastGrid(null)
    setLastMoves(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded">Moves: {moves}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Time: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Size: {size}×{size}</div>
        </div>
        <div className="space-x-2">
          <div className="inline-flex items-center space-x-2 mr-2">
            <button onClick={() => { setDifficulty('easy'); reset(size) }} className={`btn-secondary ${difficulty==='easy'?'opacity-70':''}`}>Easy</button>
            <button onClick={() => { setDifficulty('hard'); reset(size) }} className={`btn-secondary ${difficulty==='hard'?'opacity-70':''}`}>Hard</button>
          </div>
          <button onClick={() => reset(5)} className={`btn-secondary ${size===5?'opacity-70':''}`}>5×5</button>
          <button onClick={() => reset(7)} className={`btn-secondary ${size===7?'opacity-70':''}`}>7×7</button>
          <button onClick={undo} disabled={!canUndo} className={`btn-secondary ${!canUndo?'opacity-60 cursor-not-allowed':''}`}>Undo</button>
          <button onClick={() => reset(size)} className="btn-primary">Reset</button>
        </div>
      </div>

      <div className="inline-block p-4 bg-gray-200 rounded">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 56px)` }}>
          {grid.map((row, r) => row.map((on, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleToggle(r, c)}
              className={`w-14 h-14 rounded border border-gray-400 shadow-inner transition-colors ${on ? 'bg-yellow-300' : 'bg-gray-700'}`}
            />
          )))}
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Click a cell to toggle it and its neighbors. Turn all lights off to win.
      </div>
    </div>
  )
}

export default LightsOut


