import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface SudokuProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

type Grid = number[][]

const SIZE = 9

// Preset puzzles
const PRESET_MEDIUM: Grid = [
  [0,0,0, 2,6,0, 7,0,1],
  [6,8,0, 0,7,0, 0,9,0],
  [1,9,0, 0,0,4, 5,0,0],

  [8,2,0, 1,0,0, 0,4,0],
  [0,0,4, 6,0,2, 9,0,0],
  [0,5,0, 0,0,3, 0,2,8],

  [0,0,9, 3,0,0, 0,7,4],
  [0,4,0, 0,5,0, 0,3,6],
  [7,0,3, 0,1,8, 0,0,0],
]

const PRESET_HARD: Grid = [
  [0,0,0, 0,0,0, 0,0,0],
  [0,0,0, 0,0,3, 0,8,5],
  [0,0,1, 0,2,0, 0,0,0],

  [0,0,0, 5,0,7, 0,0,0],
  [0,0,4, 0,0,0, 1,0,0],
  [0,9,0, 0,0,0, 0,0,0],

  [5,0,0, 0,0,0, 0,7,3],
  [0,0,2, 0,1,0, 0,0,0],
  [0,0,0, 0,4,0, 0,0,9],
]

const deepClone = (g: Grid) => g.map(r => [...r])

const isValidPlacement = (grid: Grid, row: number, col: number, val: number): boolean => {
  for (let i = 0; i < SIZE; i++) if (grid[row][i] === val || grid[i][col] === val) return false
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) if (grid[r][c] === val) return false
  return true
}

const isSolved = (grid: Grid): boolean => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c]
      if (v < 1 || v > 9) return false
      // Temporarily clear and validate uniqueness
      const tmp = grid[r][c]
      grid[r][c] = 0
      const ok = isValidPlacement(grid, r, c, v)
      grid[r][c] = tmp
      if (!ok) return false
    }
  }
  return true
}

// CSS helpers for tailwind classes
const borderClass = (r: number, c: number) => {
  const b: string[] = ['border', 'border-gray-300']
  // Thicker lines for 3x3 boxes
  if (r % 3 === 0) b.push('border-t-2', 'border-t-gray-500')
  if (c % 3 === 0) b.push('border-l-2', 'border-l-gray-500')
  if (r === 8) b.push('border-b-2', 'border-b-gray-500')
  if (c === 8) b.push('border-r-2', 'border-r-gray-500')
  return b.join(' ')
}

const Sudoku: React.FC<SudokuProps> = ({ onComplete, onUpdate, initialState }) => {
  const [difficulty, setDifficulty] = useState<'medium' | 'hard'>(initialState?.difficulty || 'medium')
  const currentPreset = useMemo(() => deepClone(difficulty === 'hard' ? PRESET_HARD : PRESET_MEDIUM), [difficulty])
  const given = currentPreset

  const [grid, setGrid] = useState<Grid>(() => initialState?.grid || deepClone(PRESET_MEDIUM))
  const [notes, setNotes] = useState<Record<string, Set<number>>>(() => initialState?.notes || {})
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null)
  const [mistakes, setMistakes] = useState<number>(initialState?.mistakes || 0)
  const [elapsed, setElapsed] = useState<number>(initialState?.elapsed || 0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    onUpdate({ grid, notes: serializeNotes(notes), selected, mistakes, elapsed })
  }, [grid, notes, selected, mistakes, elapsed, onUpdate])

  const keyFor = (r: number, c: number) => `${r},${c}`
  const serializeNotes = (n: Record<string, Set<number>>) => Object.fromEntries(Object.entries(n).map(([k, v]) => [k, Array.from(v)]))
  const deserializeNotes = (obj: any): Record<string, Set<number>> => Object.fromEntries(Object.entries(obj || {}).map(([k, v]: any) => [k, new Set<number>(v as number[])]))

  useEffect(() => {
    if (initialState?.notes && typeof initialState.notes === 'object') {
      setNotes(deserializeNotes(initialState.notes))
    }
  }, [initialState])

  const placeNumber = (num: number) => {
    if (!selected) return
    const { r, c } = selected
    if (given[r][c] !== 0) return
    const next = deepClone(grid)
    if (num === 0) {
      next[r][c] = 0
      setGrid(next)
      return
    }
    if (isValidPlacement(next, r, c, num)) {
      next[r][c] = num
      setGrid(next)
      // clear notes for this cell
      setNotes(prev => { const cp = { ...prev }; delete cp[keyFor(r,c)]; return cp })
      // check solved
      if (isSolved(next)) {
        const base = 1000
        const score = Math.max(10, base - elapsed - mistakes * 25)
        onComplete(score, true)
      }
    } else {
      setMistakes(m => m + 1)
    }
  }

  const toggleNote = (num: number) => {
    if (!selected) return
    const { r, c } = selected
    if (given[r][c] !== 0) return
    const k = keyFor(r, c)
    setNotes(prev => {
      const cp = { ...prev }
      const set = new Set<number>(cp[k] || [])
      if (set.has(num)) {
        set.delete(num)
      } else {
        set.add(num)
      }
      cp[k] = set
      return cp
    })
  }

  const clearCell = () => placeNumber(0)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selected) return
    const n = parseInt(e.key, 10)
    if (n >= 1 && n <= 9) placeNumber(n)
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') placeNumber(0)
  }, [selected, placeNumber])

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKeyDown(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [handleKeyDown])

  const numberButton = (n: number) => (
    <button
      key={n}
      onClick={() => placeNumber(n)}
      onContextMenu={(e) => { e.preventDefault(); toggleNote(n) }}
      className="w-10 h-10 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
      title={`Left click: place ${n}. Right click: note ${n}`}
    >
      {n}
    </button>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded">Mistakes: {mistakes}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Time: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 mr-2">
            <button
              onClick={() => { setDifficulty('medium'); setGrid(deepClone(PRESET_MEDIUM)); setNotes({}); setMistakes(0); setElapsed(0) }}
              className={`btn-secondary ${difficulty === 'medium' ? 'opacity-70' : ''}`}
            >
              Medium
            </button>
            <button
              onClick={() => { setDifficulty('hard'); setGrid(deepClone(PRESET_HARD)); setNotes({}); setMistakes(0); setElapsed(0) }}
              className={`btn-secondary ${difficulty === 'hard' ? 'opacity-70' : ''}`}
            >
              Hard
            </button>
          </div>
          <button onClick={clearCell} className="btn-secondary">Clear Cell</button>
        </div>
      </div>

      {/* Board */}
      <div className="inline-block bg-white p-3 rounded shadow">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 48px)` }}>
          {Array.from({ length: SIZE }).map((_, r) => (
            Array.from({ length: SIZE }).map((_, c) => {
              const isGiven = given[r][c] !== 0
              const val = grid[r][c]
              const k = keyFor(r, c)
              const cellNotes = notes[k] || new Set<number>()
              const isSelected = selected?.r === r && selected?.c === c
              const sameRow = selected && selected.r === r
              const sameCol = selected && selected.c === c
              const sameBox = selected && Math.floor((selected.r as number)/3) === Math.floor(r/3) && Math.floor((selected.c as number)/3) === Math.floor(c/3)
              const bg = isSelected ? 'bg-blue-50' : (sameRow || sameCol || sameBox ? 'bg-yellow-50' : 'bg-gray-50')
              return (
                <div key={k} className={`group relative w-12 h-12 flex items-center justify-center cursor-pointer ${borderClass(r,c)} ${bg} ${isGiven ? 'font-bold text-gray-800' : 'text-gray-700'}`}
                  onClick={() => setSelected({ r, c })}
                  onContextMenu={(e) => { e.preventDefault(); setSelected({ r, c }) }}
                >
                  {val !== 0 ? (
                    <span className={`${isGiven ? 'text-gray-900' : 'text-primary-700'}`}>{val}</span>
                  ) : (
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="text-[10px] text-gray-400 flex items-center justify-center">
                          {cellNotes.has(i + 1) ? (i + 1) : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="mt-4 flex items-center space-x-2 flex-wrap gap-2">
        {Array.from({ length: 9 }, (_, i) => numberButton(i + 1))}
        <button onClick={() => placeNumber(0)} className="w-16 h-10 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Erase</button>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Tip: Right-click a number button to add/remove a note in the selected cell. Notes are hidden until you hover a cell.
      </div>
    </div>
  )
}

export default Sudoku


