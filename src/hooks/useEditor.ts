import { useState, useCallback } from 'react'
import type { EditorState, Status } from '../types'

const initial: EditorState = {
  file: null,
  videoWidth: 0,
  videoHeight: 0,
  videoDuration: 0,
  cropX: 0,
  cropY: 0,
  cropW: 0,
  cropH: 0,
  trimStart: 0,
  trimEnd: 0,
  status: 'idle' as Status,
  progress: 0,
  outputUrl: null,
  errorMsg: null,
}

export function useEditor() {
  const [state, setState] = useState<EditorState>(initial)

  const setFile = useCallback((file: File) => {
    setState(s => ({ ...s, file, status: 'loading', outputUrl: null, errorMsg: null }))
  }, [])

  const setVideoDimensions = useCallback((width: number, height: number, duration: number) => {
    setState(s => ({
      ...s,
      videoWidth: width,
      videoHeight: height,
      videoDuration: duration,
      cropX: 0,
      cropY: 0,
      cropW: width,
      cropH: height,
      trimStart: 0,
      trimEnd: duration,
      status: 'idle',
    }))
  }, [])

  const setCrop = useCallback((x: number, y: number, w: number, h: number) => {
    setState(s => ({ ...s, cropX: x, cropY: y, cropW: w, cropH: h }))
  }, [])

  const setTrim = useCallback((start: number, end: number) => {
    setState(s => ({ ...s, trimStart: start, trimEnd: end }))
  }, [])

  const setProcessing = useCallback(() => {
    setState(s => ({ ...s, status: 'processing', progress: 0 }))
  }, [])

  const setProgress = useCallback((progress: number) => {
    setState(s => ({ ...s, progress }))
  }, [])

  const setDone = useCallback((outputUrl: string) => {
    setState(s => ({ ...s, status: 'done', outputUrl, progress: 100 }))
  }, [])

  const setError = useCallback((errorMsg: string) => {
    setState(s => ({ ...s, status: 'error', errorMsg }))
  }, [])

  return { state, setFile, setVideoDimensions, setCrop, setTrim, setProcessing, setProgress, setDone, setError }
}
