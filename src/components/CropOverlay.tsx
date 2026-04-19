import { useRef, useCallback } from 'react'

interface Props {
  displayW: number
  displayH: number
  cropX: number
  cropY: number
  cropW: number
  cropH: number
  onCropChange: (x: number, y: number, w: number, h: number) => void
}

type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se'

interface DragState {
  handle: Handle
  startClientX: number
  startClientY: number
  startCrop: { x: number; y: number; w: number; h: number }
}

const MIN_SIZE = 20

export function CropOverlay({ displayW, displayH, cropX, cropY, cropW, cropH, onCropChange }: Props) {
  const dragRef = useRef<DragState | null>(null)

  const startDrag = useCallback((e: React.PointerEvent, handle: Handle) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCrop: { x: cropX, y: cropY, w: cropW, h: cropH },
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [cropX, cropY, cropW, cropH])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startClientX
    const dy = e.clientY - drag.startClientY
    const { x, y, w, h } = drag.startCrop
    let nx = x, ny = y, nw = w, nh = h

    if (drag.handle === 'move') {
      nx = Math.max(0, Math.min(x + dx, displayW - w))
      ny = Math.max(0, Math.min(y + dy, displayH - h))
    } else if (drag.handle === 'nw') {
      nx = Math.min(x + dx, x + w - MIN_SIZE)
      ny = Math.min(y + dy, y + h - MIN_SIZE)
      nw = w - (nx - x)
      nh = h - (ny - y)
    } else if (drag.handle === 'ne') {
      nw = Math.max(MIN_SIZE, w + dx)
      ny = Math.min(y + dy, y + h - MIN_SIZE)
      nh = h - (ny - y)
    } else if (drag.handle === 'sw') {
      nx = Math.min(x + dx, x + w - MIN_SIZE)
      nw = w - (nx - x)
      nh = Math.max(MIN_SIZE, h + dy)
    } else if (drag.handle === 'se') {
      nw = Math.max(MIN_SIZE, w + dx)
      nh = Math.max(MIN_SIZE, h + dy)
    }

    nx = Math.max(0, nx)
    ny = Math.max(0, ny)
    nw = Math.min(nw, displayW - nx)
    nh = Math.min(nh, displayH - ny)

    onCropChange(nx, ny, nw, nh)
  }, [displayW, displayH, onCropChange])

  const handlePointerUp = useCallback(() => { dragRef.current = null }, [])

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: 10,
    height: 10,
    background: '#fff',
    border: '1px solid #000',
    borderRadius: 2,
    pointerEvents: 'all',
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', userSelect: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* crop rect — dark mask via box-shadow, white border */}
      <div
        onPointerDown={e => startDrag(e, 'move')}
        style={{
          position: 'absolute',
          left: cropX,
          top: cropY,
          width: cropW,
          height: cropH,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          border: '2px solid #fff',
          cursor: 'move',
          boxSizing: 'border-box',
          pointerEvents: 'all',
        }}
      />
      {/* NW */}
      <div onPointerDown={e => startDrag(e, 'nw')} style={{ ...handleStyle, left: cropX - 5, top: cropY - 5, cursor: 'nw-resize' }} />
      {/* NE */}
      <div onPointerDown={e => startDrag(e, 'ne')} style={{ ...handleStyle, left: cropX + cropW - 5, top: cropY - 5, cursor: 'ne-resize' }} />
      {/* SW */}
      <div onPointerDown={e => startDrag(e, 'sw')} style={{ ...handleStyle, left: cropX - 5, top: cropY + cropH - 5, cursor: 'sw-resize' }} />
      {/* SE */}
      <div onPointerDown={e => startDrag(e, 'se')} style={{ ...handleStyle, left: cropX + cropW - 5, top: cropY + cropH - 5, cursor: 'se-resize' }} />
    </div>
  )
}
