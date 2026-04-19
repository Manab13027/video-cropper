import { useRef, useCallback } from 'react'

interface Props {
  duration: number
  trimStart: number
  trimEnd: number
  onTrimChange: (start: number, end: number) => void
}

function formatTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function TrimTimeline({ duration, trimStart, trimEnd, onTrimChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'start' | 'end' | null>(null)

  const toTime = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return frac * duration
  }, [duration])

  const handlePointerDown = useCallback((e: React.PointerEvent, which: 'start' | 'end') => {
    e.preventDefault()
    dragging.current = which
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const t = toTime(e.clientX)
    if (dragging.current === 'start') {
      onTrimChange(Math.min(t, trimEnd - 0.1), trimEnd)
    } else {
      onTrimChange(trimStart, Math.max(t, trimStart + 0.1))
    }
  }, [toTime, trimStart, trimEnd, onTrimChange])

  const handlePointerUp = useCallback(() => { dragging.current = null }, [])

  const startPct = duration > 0 ? (trimStart / duration) * 100 : 0
  const endPct = duration > 0 ? (trimEnd / duration) * 100 : 100

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: -6,
    width: 14,
    height: 28,
    background: '#4af',
    borderRadius: 3,
    cursor: 'ew-resize',
    transform: 'translateX(-50%)',
    pointerEvents: 'all',
    border: '2px solid #fff',
  }

  return (
    <div style={{ marginTop: 16, padding: '0 8px' }}>
      <div
        ref={trackRef}
        style={{ position: 'relative', height: 16, background: '#333', borderRadius: 8, margin: '16px 0' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* selected range */}
        <div style={{
          position: 'absolute',
          left: `${startPct}%`,
          width: `${endPct - startPct}%`,
          height: '100%',
          background: 'rgba(68,170,255,0.25)',
          borderRadius: 8,
        }} />
        {/* start thumb */}
        <div onPointerDown={e => handlePointerDown(e, 'start')} style={{ ...thumbStyle, left: `${startPct}%` }} />
        {/* end thumb */}
        <div onPointerDown={e => handlePointerDown(e, 'end')} style={{ ...thumbStyle, left: `${endPct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#aaa' }}>
        <span>In: <strong style={{ color: '#fff' }}>{formatTime(trimStart)}</strong></span>
        <span>Duration: <strong style={{ color: '#fff' }}>{formatTime(trimEnd - trimStart)}</strong></span>
        <span>Out: <strong style={{ color: '#fff' }}>{formatTime(trimEnd)}</strong></span>
      </div>
    </div>
  )
}
