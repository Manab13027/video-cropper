import { useState, useCallback } from 'react'
import { useEditor } from './hooks/useEditor'
import { FileDropZone } from './components/FileDropZone'
import { VideoPreview } from './components/VideoPreview'
import { TrimTimeline } from './components/TrimTimeline'
import { ExportPanel } from './components/ExportPanel'
import { loadFFmpeg, cropAndTrim } from './lib/ffmpeg'

export default function App() {
  const { state, setFile, setVideoDimensions, setCrop, setTrim, setProcessing, setProgress, setDone, setError } = useEditor()
  const [isolated] = useState(() => crossOriginIsolated)

  const handleFile = useCallback(async (file: File) => {
    setFile(file)
    try {
      await loadFFmpeg()
    } catch (e) {
      setError(`Failed to load FFmpeg: ${String(e)}`)
    }
  }, [setFile, setError])

  const handleExport = useCallback(async () => {
    if (!state.file) return
    setProcessing()
    try {
      const blob = await cropAndTrim(
        state.file,
        Math.round(state.cropX),
        Math.round(state.cropY),
        Math.round(state.cropW),
        Math.round(state.cropH),
        state.trimStart,
        state.trimEnd,
        setProgress,
      )
      const url = URL.createObjectURL(blob)
      if (state.outputUrl) URL.revokeObjectURL(state.outputUrl)
      setDone(url)
    } catch (e) {
      setError(String(e))
    }
  }, [state, setProcessing, setProgress, setDone, setError])

  const canExport = state.cropW > 0 && state.cropH > 0 && state.trimEnd > state.trimStart

  if (!isolated) {
    return (
      <div style={{ padding: '2rem', color: '#f55', fontFamily: 'monospace' }}>
        <strong>Error:</strong> SharedArrayBuffer not available. Serve with COOP: same-origin and COEP: require-corp headers.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', background: '#1a1a1a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: 22 }}>Video Cropper</h1>
      {!state.file ? (
        <FileDropZone onFile={handleFile} />
      ) : (
        <>
          {state.file.size > 500 * 1024 * 1024 && (
            <p style={{ color: '#fa0', fontSize: 13, margin: '0 0 12px' }}>
              Large file (&gt;500MB) — processing may take a while.
            </p>
          )}
          <VideoPreview
            file={state.file}
            cropX={state.cropX} cropY={state.cropY}
            cropW={state.cropW} cropH={state.cropH}
            onCropChange={setCrop}
            onLoad={setVideoDimensions}
          />
          <TrimTimeline
            duration={state.videoDuration}
            trimStart={state.trimStart}
            trimEnd={state.trimEnd}
            onTrimChange={setTrim}
          />
          <ExportPanel
            status={state.status}
            progress={state.progress}
            outputUrl={state.outputUrl}
            errorMsg={state.errorMsg}
            canExport={canExport}
            onExport={handleExport}
          />
        </>
      )}
    </div>
  )
}
