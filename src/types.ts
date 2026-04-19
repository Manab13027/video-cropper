export type Status = 'idle' | 'loading' | 'processing' | 'done' | 'error'

export interface EditorState {
  file: File | null
  videoWidth: number
  videoHeight: number
  videoDuration: number
  cropX: number
  cropY: number
  cropW: number
  cropH: number
  trimStart: number
  trimEnd: number
  status: Status
  progress: number
  outputUrl: string | null
  errorMsg: string | null
}
