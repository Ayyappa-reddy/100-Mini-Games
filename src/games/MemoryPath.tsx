import React, { useEffect, useMemo, useRef, useState } from 'react'

interface MemoryPathProps {
  onComplete: (score: number, completed: boolean) => void
  onUpdate: (state: any, score?: number) => void
  initialState?: any
  progress?: any
}

type Pos = { r: number; c: number }

const SIZE = 5
const MAX_LIVES = 3

const neighbors = (p: Pos) => [
  { r: p.r - 1, c: p.c },
  { r: p.r + 1, c: p.c },
  { r: p.r, c: p.c - 1 },
  { r: p.r, c: p.c + 1 },
].filter(q => q.r >= 0 && q.r < SIZE && q.c >= 0 && q.c < SIZE)

const randInt = (n: number) => Math.floor(Math.random() * n)

const buildPath = (length: number): Pos[] => {
  let cur: Pos = { r: randInt(SIZE), c: randInt(SIZE) }
  const path: Pos[] = [cur]
  while (path.length < length) {
    const ns = neighbors(cur)
    cur = ns[randInt(ns.length)]
    path.push(cur)
  }
  return path
}

const keyOf = (p: Pos) => `${p.r},${p.c}`

const MemoryPath: React.FC<MemoryPathProps> = ({ onComplete, onUpdate, initialState }) => {
  const [level, setLevel] = useState<number>(initialState?.level || 1)
  const [lives, setLives] = useState<number>(initialState?.lives || MAX_LIVES)
  const [showing, setShowing] = useState<boolean>(false)
  const [path, setPath] = useState<Pos[]>(initialState?.path || buildPath(3))
  const [progressIdx, setProgressIdx] = useState<number>(0)
  const [score, setScore] = useState<number>(initialState?.score || 0)
  const [elapsed, setElapsed] = useState<number>(initialState?.elapsed || 0)
  const [activeHighlight, setActiveHighlight] = useState<number>(-1)
  const [wrongCell, setWrongCell] = useState<Pos | null>(null)
  const timerRef = useRef<number | null>(null)
  const previewTokenRef = useRef<number>(0)

  useEffect(() => {
    timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    onUpdate({ level, lives, path: path.map(keyOf), progressIdx, score, elapsed, showing })
  }, [level, lives, path, progressIdx, score, elapsed, showing, onUpdate])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const playPreview = async () => {
    const token = ++previewTokenRef.current
    setShowing(true)
    const stepMs = Math.max(250, 800 - level * 40)
    for (let i = 0; i < path.length; i++) {
      if (previewTokenRef.current !== token) return
      setActiveHighlight(i)
      // wait between steps
      // eslint-disable-next-line no-await-in-loop
      await sleep(stepMs)
    }
    if (previewTokenRef.current !== token) return
    setActiveHighlight(-1)
    setShowing(false)
  }

  useEffect(() => {
    // show preview at the start of each level
    playPreview()
    // cancel any running preview on unmount
    return () => { previewTokenRef.current++ }
  }, [level, path])

  const handleClick = (r: number, c: number) => {
    if (showing) return
    const expected = path[progressIdx]
    if (expected && expected.r === r && expected.c === c) {
      const nextIdx = progressIdx + 1
      setProgressIdx(nextIdx)
      if (nextIdx >= path.length) {
        const gained = 50 + level * 10
        setScore(s => s + gained)
        // next level
        const nextLevel = level + 1
        setLevel(nextLevel)
        setProgressIdx(0)
        setPath(buildPath(Math.min(3 + nextLevel, 12)))
        setTimeout(() => playPreview(), 300)
      }
    } else {
      // wrong cell
      setWrongCell({ r, c })
      window.setTimeout(() => setWrongCell(null), 400)
      setLives(h => h - 1)
      setProgressIdx(0)
      if (lives - 1 <= 0) {
        const final = Math.max(10, score - elapsed)
        onComplete(final, false)
      } else {
        // replay preview
        setTimeout(() => { playPreview() }, 300)
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-gray-100 rounded">Level: {level}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Lives: {lives}/{MAX_LIVES}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Score: {score}</div>
          <div className="px-3 py-1 bg-gray-100 rounded">Time: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</div>
        </div>
        <div className="space-x-2">
          <button onClick={playPreview} disabled={showing} className={`btn-secondary ${showing?'opacity-60 cursor-not-allowed':''}`}>Replay</button>
        </div>
      </div>

      <div className="inline-block p-4 bg-gray-200 rounded">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, 56px)` }}>
          {Array.from({ length: SIZE }).map((_, r) => (
            Array.from({ length: SIZE }).map((_, c) => {
              const currentLit = showing && activeHighlight >= 0 && path[activeHighlight] && path[activeHighlight].r === r && path[activeHighlight].c === c
              const progressSet = useMemo(() => new Set(path.slice(0, progressIdx).map(p => keyOf(p))), [path, progressIdx])
              const progressed = !showing && progressSet.has(keyOf({ r, c }))
              const isWrong = wrongCell && wrongCell.r === r && wrongCell.c === c
              return (
                <button key={`${r}-${c}`} onClick={() => handleClick(r,c)}
                  className={`w-14 h-14 rounded border border-gray-400 shadow-inner transition-colors ${
                    currentLit ? 'bg-blue-400' : isWrong ? 'bg-red-400' : progressed ? 'bg-yellow-300' : 'bg-gray-700'
                  }`}
                />
              )
            })
          ))}
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Watch the path, then reproduce it by clicking the cells in order. Levels grow longer; you have limited lives.
      </div>
    </div>
  )
}

export default MemoryPath


