import { useCallback } from 'react'

interface Props {
  onFile: (file: File) => void
}

export function FileDropZone({ onFile }: Props) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) onFile(file)
  }, [onFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      style={{
        border: '2px dashed #555',
        borderRadius: 8,
        padding: '3rem 2rem',
        textAlign: 'center',
        color: '#aaa',
        background: '#111',
        fontSize: 16,
      }}
    >
      <p style={{ margin: 0 }}>
        Drop any video file here or{' '}
        <label style={{ color: '#4af', cursor: 'pointer', textDecoration: 'underline' }}>
          browse
          <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleChange} />
        </label>
      </p>
    </div>
  )
}
