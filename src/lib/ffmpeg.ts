import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let loadPromise: Promise<void> | null = null

const MOUNT_POINT = '/input'
const FALLBACK_SIZE_LIMIT = 500 * 1024 * 1024

export async function loadFFmpeg(): Promise<void> {
  if (ffmpeg?.loaded) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    ffmpeg = new FFmpeg()
    const base = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript'),
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

  let inputPath: string
  let usedMount = false

  try {
    // Ensure the mount directory exists before mounting.
    await ffmpeg.createDir(MOUNT_POINT).catch(() => {})
    await ffmpeg.mount('WORKERFS', { files: [file] }, MOUNT_POINT)
    inputPath = `${MOUNT_POINT}/${file.name}`
    usedMount = true
  } catch {
    // WORKERFS unavailable in this build — fall back to copying the file into MEMFS.
    if (file.size > FALLBACK_SIZE_LIMIT) {
      throw new Error(
        `File is ${Math.round(file.size / 1024 / 1024)} MB. ` +
        `Files over 500 MB require WORKERFS support, which is unavailable in this build.`,
      )
    }
    const ext = file.name.split('.').pop() || 'mp4'
    inputPath = `input.${ext}`
    await ffmpeg.writeFile(inputPath, await fetchFile(file))
  }

  const onProg = ({ progress }: { progress: number }) => onProgress(Math.round(progress * 100))
  ffmpeg.on('progress', onProg)

  try {
    await ffmpeg.exec([
      '-ss', String(trimStart),
      '-i', inputPath,
      '-t', String(trimEnd - trimStart),
      '-vf', `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      'output.mp4',
    ])
  } finally {
    ffmpeg.off('progress', onProg)
    if (usedMount) {
      await ffmpeg.unmount(MOUNT_POINT).catch(() => {})
      await ffmpeg.deleteDir(MOUNT_POINT).catch(() => {})
    } else {
      await ffmpeg.deleteFile(inputPath).catch(() => {})
    }
  }

  const data = await ffmpeg.readFile('output.mp4')
  await ffmpeg.deleteFile('output.mp4').catch(() => {})

  return new Blob([data as Uint8Array<ArrayBuffer>], { type: 'video/mp4' })
}
