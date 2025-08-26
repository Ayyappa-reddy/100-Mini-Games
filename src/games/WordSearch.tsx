import React, { useEffect, useMemo, useRef, useState } from 'react'

interface WordSearchProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

type Pos = { r: number; c: number }

const ROWS = 12
const COLS = 12
const DIRECTIONS: Array<[number, number]> = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
]

const DEFAULT_WORDS = ['TIGER','REACT','CODE','GAME','PUZZLE','LOGIC','TAILWIND','VITE','SCORE']
const WORD_POOL = [
  'TIGER','REACT','CODE','GAME','PUZZLE','LOGIC','TAILWIND','VITE','SCORE','POINTS','LEVEL',
  'BOARD','GRID','LETTER','SEARCH','DRAG','CLICK','SELECT','HINT','TIME','CLOCK','WIN','PLAY',
  'STATE','HOOKS','ROUTER','AUTH','PROFILE','SNAKE','COLOR','NUMBER','SEQUENCE','MEMORY','MATCH',
  'OBJECT','ARRAY','FUNCTION','VARIABLE','TYPESCRIPT','JAVASCRIPT','SUPABASE','LOGIN','USER'
]

const pickRandomWords = (pool: string[], count: number, allowDuplicates = true): string[] => {
  const out: string[] = []
  if (allowDuplicates) {
    for (let i = 0; i < count; i++) out.push(pool[Math.floor(Math.random() * pool.length)])
  } else {
    const copy = [...pool]
    for (let i = 0; i < count && copy.length > 0; i++) {
      const idx = Math.floor(Math.random() * copy.length)
      out.push(copy.splice(idx, 1)[0])
    }
  }
  return out
}

const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26))

const inBounds = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS

const placeWord = (grid: string[][], word: string): boolean => {
  const chars = word.toUpperCase().split('')
  for (let attempt = 0; attempt < 100; attempt++) {
    const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    const sr = Math.floor(Math.random() * ROWS)
    const sc = Math.floor(Math.random() * COLS)
    const er = sr + dr * (chars.length - 1)
    const ec = sc + dc * (chars.length - 1)
    if (!inBounds(er, ec)) continue
    let ok = true
    for (let i = 0; i < chars.length; i++) {
      const r = sr + dr * i, c = sc + dc * i
      if (!inBounds(r,c)) { ok = false; break }
      const existing = grid[r][c]
      if (existing !== '' && existing !== chars[i]) { ok = false; break }
    }
    if (!ok) continue
    for (let i = 0; i < chars.length; i++) {
      const r = sr + dr * i, c = sc + dc * i
      grid[r][c] = chars[i]
    }
    return true
  }
  return false
}

const buildGrid = (words: string[]) => {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  const placed: string[] = []
  for (const w of words) {
    if (placeWord(grid, w)) placed.push(w.toUpperCase())
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] === '') grid[r][c] = randomLetter()
  return { grid, placed }
}

const WordSearch: React.FC<WordSearchProps> = ({ onComplete, onUpdate, initialState }) => {
  const [words, setWords] = useState<string[]>(initialState?.words || DEFAULT_WORDS)
  const built = useMemo(() => buildGrid(words), [words])
  const [grid, setGrid] = useState<string[][]>(initialState?.grid || built.grid)
  const [found, setFound] = useState<Set<string>>(new Set<string>(initialState?.found || []))
  const [selection, setSelection] = useState<Pos[]>([])
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [elapsed, setElapsed] = useState<number>(initialState?.elapsed || 0)
  const [hintsUsed, setHintsUsed] = useState<number>(initialState?.hintsUsed || 0)
  const timerRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  // On first mount, if no preset words provided, pick a random set and rebuild grid
  useEffect(() => {
    if (!initializedRef.current && !initialState?.words) {
      const picks = pickRandomWords(WORD_POOL, 10, true)
      setWords(picks)
      initializedRef.current = true
    }
  }, [initialState])

  // When words change (due to randomization), rebuild grid and reset progress state
  useEffect(() => {
    if (!initialState?.grid) {
      setGrid(built.grid)
      setFound(new Set<string>())
      setSelection([])
      setElapsed(0)
      setHintsUsed(0)
    }
  }, [words])

  useEffect(() => {
    onUpdate({ grid, words, found: Array.from(found), selection, elapsed, hintsUsed })
  }, [grid, words, found, selection, elapsed, hintsUsed, onUpdate])

  const onCellDown = (r: number, c: number) => {
    setIsMouseDown(true)
    setSelection([{ r, c }])
  }
  const onCellEnter = (r: number, c: number) => {
    if (!isMouseDown) return
    setSelection(prev => {
      const head = prev[0]
      if (!head) return [{ r, c }]
      // compute straight line path from head to (r,c) if aligned in 8 directions
      const dr = Math.sign(r - head.r)
      const dc = Math.sign(c - head.c)
      if (dr === 0 && dc === 0) return [{ r, c }]
      if (dr !== 0 && dc !== 0 && Math.abs(r - head.r) !== Math.abs(c - head.c)) return prev
      if (dr === 0 && c !== head.c) { /* horizontal */ }
      else if (dc === 0 && r !== head.r) { /* vertical */ }
      else if (Math.abs(r - head.r) === Math.abs(c - head.c)) { /* diagonal */ }
      else return prev
      const path: Pos[] = []
      let cr = head.r, cc = head.c
      while (!(cr === r && cc === c)) {
        path.push({ r: cr, c: cc })
        cr += dr; cc += dc
      }
      path.push({ r, c })
      return path
    })
  }
  const onMouseUp = () => {
    setIsMouseDown(false)
    if (selection.length < 2) { setSelection([]); return }
    const word = selection.map(p => grid[p.r][p.c]).join('')
    const rev = selection.map(p => grid[p.r][p.c]).reverse().join('')
    const candidate = (words.includes(word) ? word : (words.includes(rev) ? rev : ''))
    if (candidate) {
      setFound(prev => new Set<string>([...Array.from(prev), candidate]))
      setSelection([])
      if (found.size + 1 >= words.length) {
        const base = 500
        const score = Math.max(10, base - elapsed - hintsUsed * 50)
        onComplete(score, true)
      }
    } else {
      setSelection([])
    }
  }

  const useHint = () => {
    // reveal one random unfound word's first letter path highlight for 2 seconds
    const remaining = words.filter(w => !found.has(w))
    if (remaining.length === 0) return
    const pick = remaining[Math.floor(Math.random() * remaining.length)]
    // try to scan the grid for that word and set selection to its path briefly
    outer: for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        for (const [dr, dc] of DIRECTIONS) {
          let ok = true
          const path: Pos[] = []
          for (let i = 0; i < pick.length; i++) {
            const rr = r + dr * i, cc = c + dc * i
            if (!inBounds(rr, cc) || grid[rr][cc] !== pick[i]) { ok = false; break }
            path.push({ r: rr, c: cc })
          }
          if (ok) {
            setSelection(path)
            setHintsUsed(h => h + 1)
            window.setTimeout(() => setSelection([]), 1500)
            break outer
          }
        }
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded">Found: {found.size}/{words.length}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Time: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Hints: {hintsUsed}</div>
        </div>
        <div className="space-x-2">
          <button onClick={useHint} className="btn-secondary">Hint</button>
        </div>
      </div>

      <div className="grid gap-1 select-none bg-white p-3 rounded shadow" style={{ gridTemplateColumns: `repeat(${COLS}, 36px)` }} onMouseLeave={() => isMouseDown && setIsMouseDown(false)} onMouseUp={onMouseUp}>
        {Array.from({ length: ROWS }).map((_, r) => (
          Array.from({ length: COLS }).map((_, c) => {
            const ch = grid[r][c]
            const inSel = selection.some(p => p.r === r && p.c === c)
            const isFoundCell = (() => {
              // crude: if cell is in any found word path, highlight; we skip exact path mapping for perf
              return false
            })()
            return (
              <div
                key={`${r}-${c}`}
                onMouseDown={() => onCellDown(r, c)}
                onMouseEnter={() => onCellEnter(r, c)}
                className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded border border-gray-300 cursor-pointer ${inSel ? 'bg-yellow-200' : isFoundCell ? 'bg-green-100' : 'bg-gray-50'} select-none`}
              >
                <span className="font-bold text-gray-800">{ch}</span>
              </div>
            )
          })
        ))}
      </div>

      <div className="mt-4 bg-gray-50 p-3 rounded">
        <div className="font-semibold mb-2">Words</div>
        <div className="flex flex-wrap gap-2">
          {words.map(w => (
            <span key={w} className={`px-2 py-1 rounded border ${found.has(w) ? 'bg-green-100 border-green-300 text-green-700 line-through' : 'bg-white border-gray-300 text-gray-800'}`}>{w}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WordSearch


