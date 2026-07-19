import { forwardRef } from 'react'

interface VideoPlayerProps {
  src: string
  onTimeUpdate(currentTimeMs: number): void
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(function VideoPlayer(
  { src, onTimeUpdate },
  ref
) {
  return (
    <video
      ref={ref}
      className="video-player"
      src={src}
      controls
      onTimeUpdate={(event) => onTimeUpdate(event.currentTarget.currentTime * 1000)}
    />
  )
})

export default VideoPlayer
