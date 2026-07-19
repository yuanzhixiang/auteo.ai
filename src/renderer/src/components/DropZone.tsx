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
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed ${
        dragging
          ? 'border-brand bg-brand/10'
          : 'border-black/30 dark:border-white/30'
      }`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <p className="m-0 text-lg font-semibold">Drop a video here</p>
      <p className="m-0 opacity-60">MP4, MOV, MKV, WebM…</p>
      {error !== '' && <p className="text-red-500">{error}</p>}
    </div>
  )
}
