import type { Status } from '../types'

interface Props {
  status: Status
  progress: number
  outputUrl: string | null
  errorMsg: string | null
  canExport: boolean
  onExport: () => void
}

export function ExportPanel({ status, progress, outputUrl, errorMsg, canExport, onExport }: Props) {
  return (
    <div style={{ marginTop: 24 }}>
      {status === 'processing' && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#4af', transition: 'width 0.2s' }} />
          </div>
          <p style={{ color: '#aaa', fontSize: 13, margin: '4px 0 0' }}>Processing… {progress}%</p>
        </div>
      )}
      {status === 'error' && (
        <p style={{ color: '#f55', fontSize: 14, marginBottom: 12 }}>Error: {errorMsg}</p>
      )}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={onExport}
          disabled={!canExport || status === 'processing'}
          style={{
            padding: '10px 24px',
            background: canExport && status !== 'processing' ? '#4af' : '#333',
            color: canExport && status !== 'processing' ? '#000' : '#666',
            border: 'none',
            borderRadius: 6,
            fontSize: 15,
            fontWeight: 600,
            cursor: canExport && status !== 'processing' ? 'pointer' : 'not-allowed',
          }}
          title={!canExport ? 'Crop region or trim range is invalid' : undefined}
        >
          {status === 'processing' ? 'Processing…' : 'Export MP4'}
        </button>
        {outputUrl && (
          <a
            href={outputUrl}
            download="cropped.mp4"
            style={{
              padding: '10px 24px',
              background: '#2a2',
              color: '#fff',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Download
          </a>
        )}
      </div>
    </div>
  )
}
