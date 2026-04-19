import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let loadPromise: Promise<void> | null = null

export async function loadFFmpeg(): Promise<void> {
  if (ffmpeg?.loaded) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    ffmpeg = new FFmpeg()
    const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    })
  })().catch(err => {
    loadPromise = null
    throw err
  })

  return loadPromise
}

export async function cropAndTrim(
  file: File,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
  trimStart: number,
  trimEnd: number,
  onProgress: (pct: number) => void,
): Promise<Blob> {
  if (!ffmpeg?.loaded) throw new Error('FFmpeg not loaded')

  const ext = file.name.split('.').pop() || 'mp4'
  const inputName = `input.${ext}`

  await ffmpeg.writeFile(inputName, await fetchFile(file))

  const onProg = ({ progress }: { progress: number }) => onProgress(Math.round(progress * 100))
  ffmpeg.on('progress', onProg)

  try {
    await ffmpeg.exec([
      '-i', inputName,
      '-ss', String(trimStart),
      '-to', String(trimEnd),
      '-vf', `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      'output.mp4',
    ])
  } finally {
    ffmpeg.off('progress', onProg)
    await ffmpeg.deleteFile(inputName).catch(() => {})
  }

  const data = await ffmpeg.readFile('output.mp4')
  await ffmpeg.deleteFile('output.mp4').catch(() => {})

  return new Blob([data as Uint8Array<ArrayBuffer>], { type: 'video/mp4' })
}
