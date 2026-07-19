import { useState } from 'react'
import type { DragEvent, JSX } from 'react'

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm', '.m4v', '.avi']

function isVideoFile(name: string): boolean {
  const lower = name.toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

interface DropZoneProps {
  onSelect(videoPath: string): void
}

export default function DropZone({ onSelect }: DropZoneProps): JSX.Element {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const handleDrop = (event: DragEvent): void => {
    event.preventDefault()
    setDragging(false)
    setError('')
    const file = event.dataTransfer.files[0]
    if (!file) return
    if (!isVideoFile(file.name)) {
      setError('Please drop a video file.')
      return
    }
    const videoPath = window.auteo.getPathForFile(file)
    if (!videoPath) {
      setError('Could not resolve the file path.')
      return
    }
    onSelect(videoPath)
  }

  return (
    <div
      className={`drop-zone${dragging ? ' drop-zone-active' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <p className="drop-zone-title">Drop a video here</p>
      <p className="drop-zone-hint">MP4, MOV, MKV, WebM…</p>
      {error !== '' && <p className="drop-zone-error">{error}</p>}
    </div>
  )
}
