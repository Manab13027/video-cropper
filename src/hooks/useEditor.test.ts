import { renderHook, act } from '@testing-library/react'
import { useEditor } from './useEditor'

describe('useEditor', () => {
  it('starts with idle status and null file', () => {
    const { result } = renderHook(() => useEditor())
    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.file).toBeNull()
  })

  it('setFile sets file and loading status', () => {
    const { result } = renderHook(() => useEditor())
    const file = new File([''], 'test.mp4', { type: 'video/mp4' })
    act(() => result.current.setFile(file))
    expect(result.current.state.file).toBe(file)
    expect(result.current.state.status).toBe('loading')
  })

  it('setVideoDimensions initialises crop to full frame', () => {
    const { result } = renderHook(() => useEditor())
    act(() => result.current.setVideoDimensions(1920, 1080, 60))
    const s = result.current.state
    expect(s.videoWidth).toBe(1920)
    expect(s.cropW).toBe(1920)
    expect(s.cropH).toBe(1080)
    expect(s.trimEnd).toBe(60)
    expect(s.status).toBe('idle')
  })

  it('setCrop updates crop values', () => {
    const { result } = renderHook(() => useEditor())
    act(() => result.current.setCrop(10, 20, 640, 360))
    expect(result.current.state.cropX).toBe(10)
    expect(result.current.state.cropW).toBe(640)
  })

  it('setTrim updates trim values', () => {
    const { result } = renderHook(() => useEditor())
    act(() => result.current.setTrim(5, 30))
    expect(result.current.state.trimStart).toBe(5)
    expect(result.current.state.trimEnd).toBe(30)
  })

  it('setProcessing sets processing status and resets progress', () => {
    const { result } = renderHook(() => useEditor())
    act(() => result.current.setProcessing())
    expect(result.current.state.status).toBe('processing')
    expect(result.current.state.progress).toBe(0)
  })

  it('setProgress updates progress', () => {
    const { result } = renderHook(() => useEditor())
    act(() => result.current.setProgress(42))
    expect(result.current.state.progress).toBe(42)
  })

  it('setDone sets outputUrl and done status', () => {
    const { result } = renderHook(() => useEditor())
    act(() => result.current.setDone('blob:http://localhost/abc'))
    expect(result.current.state.status).toBe('done')
    expect(result.current.state.outputUrl).toBe('blob:http://localhost/abc')
    expect(result.current.state.progress).toBe(100)
  })

  it('setError sets error status and message', () => {
    const { result } = renderHook(() => useEditor())
    act(() => result.current.setError('FFmpeg crashed'))
    expect(result.current.state.status).toBe('error')
    expect(result.current.state.errorMsg).toBe('FFmpeg crashed')
  })
})
