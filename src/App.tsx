import { useEditor } from './hooks/useEditor'
import { FileDropZone } from './components/FileDropZone'

export default function App() {
  const { state, setFile } = useEditor()
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', background: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ margin: '0 0 1.5rem' }}>Video Cropper</h1>
      {!state.file
        ? <FileDropZone onFile={setFile} />
        : <p>File loaded: {state.file.name}</p>
      }
    </div>
  )
}
