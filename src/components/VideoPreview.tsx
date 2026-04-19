import { useRef, useState, useEffect, useCallback } from 'react'
import { CropOverlay } from './CropOverlay'

interface Props {
  file: File
  cropX: number
  cropY: number
  cropW: number
  cropH: number
  onCropChange: (x: number, y: number, w: number, h: number) => void
  onLoad: (width: number, height: number, duration: number) => void
}

export function VideoPreview({ file, cropX, cropY, cropW, cropH, onCropChange, onLoad }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [srcUrl, setSrcUrl] = useState('')
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 })
  const [intrinsic, setIntrinsic] = useState({ w: 1, h: 1 })

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrcUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const ro = new ResizeObserver(() => setDisplaySize({ w: v.clientWidth, h: v.clientHeight }))
    ro.observe(v)
    return () => ro.disconnect()
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setIntrinsic({ w: v.videoWidth, h: v.videoHeight })
    setDisplaySize({ w: v.clientWidth, h: v.clientHeight })
    onLoad(v.videoWidth, v.videoHeight, v.duration)
  }, [onLoad])

  const scaleX = displaySize.w / intrinsic.w
  const scaleY = displaySize.h / intrinsic.h

  const handleCropChange = useCallback((dx: number, dy: number, dw: number, dh: number) => {
    onCropChange(
      Math.round(dx / scaleX),
      Math.round(dy / scaleY),
      Math.round(dw / scaleX),
      Math.round(dh / scaleY),
    )
  }, [scaleX, scaleY, onCropChange])

  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <video
        ref={videoRef}
        src={srcUrl}
        controls
        onLoadedMetadata={handleLoadedMetadata}
        style={{ display: 'block', maxWidth: '100%', maxHeight: '60vh' }}
      />
      {displaySize.w > 0 && (
        <CropOverlay
          displayW={displaySize.w}
          displayH={displaySize.h}
          cropX={cropX * scaleX}
          cropY={cropY * scaleY}
          cropW={cropW * scaleX}
          cropH={cropH * scaleY}
          onCropChange={handleCropChange}
        />
      )}
    </div>
  )
}
