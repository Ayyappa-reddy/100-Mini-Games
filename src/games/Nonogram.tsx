import React, { useEffect, useMemo, useRef, useState } from 'react'

interface NonogramProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

type Grid = number[][] // 1 = filled (solution), 0 = empty
type Paint = 0 | 1 // 1 = user filled, 0 = empty
type Mark = boolean // true = X mark (user thinks empty)

const PRESET_10: Grid = [
  // Simple heart (10x10)
  [0,1,1,0,0,0,0,1,1,0],
  [1,1,1,1,0,0,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0],
  [0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
]

const PRESET_15: Grid = [
  // Smiley (15x15)
  [0,0,0,0,1,1,1,0,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,0,0,1,1,1,0,0,1,1,0,0],
  [0,1,1,0,0,0,1,1,1,0,0,0,1,1,0],
  [1,1,0,0,0,0,1,1,1,0,0,0,0,1,1],
  [1,1,0,1,1,0,1,1,1,0,1,1,0,1,1],
  [1,1,0,1,1,0,1,1,1,0,1,1,0,1,1],
  [1,1,0,0,0,0,1,1,1,0,0,0,0,1,1],
  [1,1,0,0,1,1,1,1,1,1,1,0,0,1,1],
  [0,1,1,0,1,0,0,0,0,0,1,0,1,1,0],
  [0,0,1,1,0,1,1,1,1,1,0,1,1,0,0],
  [0,0,0,1,1,0,1,1,1,0,1,1,0,0,0],
  [0,0,0,0,1,1,0,1,0,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

const computeClues = (grid: Grid) => {
  const rows = grid.length
  const cols = grid[0]?.length || 0
  const rowClues: number[][] = []
  const colClues: number[][] = []
  for (let r = 0; r < rows; r++) {
    const runs: number[] = []
    let cnt = 0
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) cnt++
      else if (cnt > 0) { runs.push(cnt); cnt = 0 }
    }
    if (cnt > 0) runs.push(cnt)
    rowClues.push(runs.length ? runs : [0])
  }
  for (let c = 0; c < cols; c++) {
    const runs: number[] = []
    let cnt = 0
    for (let r = 0; r < rows; r++) {
      if (grid[r][c] === 1) cnt++
      else if (cnt > 0) { runs.push(cnt); cnt = 0 }
    }
    if (cnt > 0) runs.push(cnt)
    colClues.push(runs.length ? runs : [0])
  }
  return { rowClues, colClues }
}

const Nonogram: React.FC<NonogramProps> = ({ onComplete, onUpdate, initialState }) => {
  const [size, setSize] = useState<number>(initialState?.size || 10)
  const solution: Grid = useMemo(() => (size === 15 ? PRESET_15 : PRESET_10), [size])
  const rows = solution.length
  const cols = solution[0]?.length || 0
  const { rowClues, colClues } = useMemo(() => computeClues(solution), [solution])
  const [paint, setPaint] = useState<Paint[][]>(() => initialState?.paint || Array.from({ length: rows }, () => Array(cols).fill(0)))
  const [marks, setMarks] = useState<Mark[][]>(() => initialState?.marks || Array.from({ length: rows }, () => Array(cols).fill(false)))
  const [elapsed, setElapsed] = useState<number>(initialState?.elapsed || 0)
  const [mistakes, setMistakes] = useState<number>(initialState?.mistakes || 0)
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  const [dragMode, setDragMode] = useState<'fill' | 'erase' | 'mark' | null>(null)
  const [hints, setHints] = useState<number>(initialState?.hints || 2)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    onUpdate({ size, paint, marks, elapsed, mistakes, hints })
  }, [size, paint, marks, elapsed, mistakes, hints, onUpdate])

  const handleCellAction = (r: number, c: number, action: 'toggleFill' | 'toggleMark' | 'drag') => {
    setPaint(prev => {
      const p = prev.map(row => [...row])
      const m = marks.map(row => [...row])
      const isSolution = solution[r][c] === 1
      if (action === 'toggleFill') {
        // toggle fill
        p[r][c] = p[r][c] === 1 ? 0 : 1
        if (p[r][c] === 1) m[r][c] = false
        if (p[r][c] === 1 && !isSolution) setMistakes(x => x + 1)
      } else if (action === 'toggleMark') {
        m[r][c] = !m[r][c]
        if (m[r][c]) p[r][c] = 0
      } else if (action === 'drag') {
        if (dragMode === 'fill') { p[r][c] = 1; m[r][c] = false }
        else if (dragMode === 'erase') { p[r][c] = 0 }
        else if (dragMode === 'mark') { m[r][c] = true; p[r][c] = 0 }
      }
      // check completion
      const solved = p.every((row, rr) => row.every((v, cc) => v === solution[rr][cc]))
      if (solved) {
        const score = Math.max(50, 1500 - elapsed - mistakes * 20 - (2 - hints) * 50)
        onComplete(score, true)
      }
      setMarks(m)
      return p
    })
  }

  const onMouseDownCell = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    setIsMouseDown(true)
    if (e.button === 2) {
      setDragMode('mark')
      handleCellAction(r, c, 'toggleMark')
    } else {
      // decide fill vs erase by current state
      const mode: 'fill' | 'erase' = paint[r][c] === 1 ? 'erase' : 'fill'
      setDragMode(mode)
      handleCellAction(r, c, 'toggleFill')
    }
  }

  const onMouseEnterCell = (r: number, c: number) => {
    if (!isMouseDown || !dragMode) return
    handleCellAction(r, c, 'drag')
  }

  const onMouseUpGrid = () => {
    setIsMouseDown(false)
    setDragMode(null)
  }

  const useHint = () => {
    if (hints <= 0) return
    // reveal a random incorrect cell towards solution
    const candidates: Array<[number, number]> = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (paint[r][c] !== solution[r][c]) candidates.push([r, c])
      }
    }
    if (candidates.length === 0) return
    const [rr, cc] = candidates[Math.floor(Math.random() * candidates.length)]
    setPaint(prev => {
      const p = prev.map(row => [...row])
      const m = marks.map(row => [...row])
      p[rr][cc] = solution[rr][cc] as Paint
      if (p[rr][cc] === 1) m[rr][cc] = false
      setMarks(m)
      return p
    })
    setHints(h => h - 1)
  }

  const maxRowClueLen = Math.max(...rowClues.map(rc => rc.length))
  const maxColClueLen = Math.max(...colClues.map(cc => cc.length))

  // clue completion helpers
  const groupRuns = (arr: number[]) => {
    const runs: number[] = []
    let cnt = 0
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 1) cnt++
      else if (cnt > 0) { runs.push(cnt); cnt = 0 }
    }
    if (cnt > 0) runs.push(cnt)
    return runs
  }

  const rowProgress = useMemo(() => paint.map(r => groupRuns(r as number[])), [paint])
  const colProgress = useMemo(() => {
    const progress: number[][] = []
    for (let c = 0; c < cols; c++) {
      const col: number[] = []
      for (let r = 0; r < rows; r++) col.push(paint[r][c])
      progress.push(groupRuns(col))
    }
    return progress
  }, [paint, rows, cols])

  return (
    <div className="max-w-5xl mx-auto select-none" onMouseUp={onMouseUpGrid} onContextMenu={e => e.preventDefault()}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-gray-100 rounded">Size:
            <button onClick={() => { setSize(10); setPaint(Array.from({ length: 10 }, () => Array(10).fill(0))); setMarks(Array.from({ length: 10 }, () => Array(10).fill(false))) }} className={`ml-2 btn-secondary ${size===10?'opacity-70':''}`}>10×10</button>
            <button onClick={() => { setSize(15); setPaint(Array.from({ length: 15 }, () => Array(15).fill(0))); setMarks(Array.from({ length: 15 }, () => Array(15).fill(false))) }} className={`ml-2 btn-secondary ${size===15?'opacity-70':''}`}>15×15</button>
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded">Time: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Mistakes: {mistakes}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Hints: {hints}</div>
        </div>
        <div className="space-x-2">
          <button onClick={useHint} disabled={hints<=0} className={`btn-secondary ${hints<=0?'opacity-60 cursor-not-allowed':''}`}>Hint</button>
          <button onClick={() => { setPaint(Array.from({ length: rows }, () => Array(cols).fill(0))); setMarks(Array.from({ length: rows }, () => Array(cols).fill(false))); setMistakes(0); setElapsed(0) }} className="btn-primary">Clear</button>
        </div>
      </div>

      <div className="inline-block p-3 bg-white rounded shadow overflow-auto">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${maxColClueLen + cols}, 32px)` }}>
          {/* Top-left empty corner for alignment */}
          {Array.from({ length: maxColClueLen }).map((_, i) => (
            <div key={`corner-${i}`} />
          ))}
          {/* Column clues */}
          {colClues.map((cc, ci) => (
            <div key={`colclue-${ci}`} className="flex flex-col items-center justify-end h-full">
              {Array.from({ length: maxColClueLen }).map((_, idx) => {
                const clueIdx = cc.length - (maxColClueLen - idx)
                const val = clueIdx >= 0 ? cc[clueIdx] : ''
                const done = colProgress[ci] && JSON.stringify(colProgress[ci]) === JSON.stringify(cc)
                return <div key={idx} className={`text-xs leading-4 ${done ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>{val}</div>
              })}
            </div>
          ))}
          {/* Rows */}
          {solution.map((row, r) => (
            <React.Fragment key={`row-${r}`}>
              {/* Row clues */}
              {Array.from({ length: maxColClueLen }).map((_, i) => (
                <div key={`rowclue-${r}-${i}`} className="flex items-center justify-end pr-1">
                  {(() => {
                    const rc = rowClues[r]
                    const offset = maxColClueLen - rc.length
                    const idx = i - offset
                    const val = idx >= 0 ? rc[idx] : ''
                    const done = JSON.stringify(rowProgress[r]) === JSON.stringify(rc)
                    return <span className={`text-xs ${done ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>{val}</span>
                  })()}
                </div>
              ))}
              {/* Cells */}
              {row.map((_cell, c) => {
                const filled = paint[r][c] === 1
                const hoverClass = !filled ? 'hover:bg-gray-100' : ''
                return (
                  <button
                    key={`cell-${r}-${c}`}
                    onMouseDown={(e) => onMouseDownCell(e, r, c)}
                    onMouseEnter={() => onMouseEnterCell(r, c)}
                    className={`w-8 h-8 border ${ (r % 5 === 4 ? 'border-b-2' : 'border-b') + ' ' + (c % 5 === 4 ? 'border-r-2' : 'border-r') } border-gray-300 flex items-center justify-center ${filled ? 'bg-gray-800' : 'bg-white'} ${hoverClass} relative`}
                  >
                    {marks[r][c] && !filled && (
                      <span className="text-gray-400">×</span>
                    )}
                  </button>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Left click/drag to fill; right click to mark X. Match the clues for every row and column.
      </div>
    </div>
  )
}

export default Nonogram


