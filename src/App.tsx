import { useEditor } from './hooks/useEditor'
import { FileDropZone } from './components/FileDropZone'
import { VideoPreview } from './components/VideoPreview'

export default function App() {
  const { state, setFile, setVideoDimensions, setCrop } = useEditor()
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', background: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ margin: '0 0 1.5rem' }}>Video Cropper</h1>
      {!state.file
        ? <FileDropZone onFile={setFile} />
        : (
          <VideoPreview
            file={state.file}
            cropX={state.cropX} cropY={state.cropY}
            cropW={state.cropW} cropH={state.cropH}
            onCropChange={setCrop}
            onLoad={setVideoDimensions}
          />
        )
      }
    </div>
  )
}
