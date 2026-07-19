import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import type { TranscribePhase, Transcript, Utterance } from '../../shared/types'
import DropZone from './components/DropZone'
import SettingsPage from './components/SettingsPage'
import SubtitleList from './components/SubtitleList'
import VideoPlayer from './components/VideoPlayer'

type View = 'workbench' | 'settings'

type WorkbenchState =
  | { kind: 'idle' }
  | { kind: 'working'; videoPath: string; phase: TranscribePhase }
  | { kind: 'ready'; transcript: Transcript; mediaUrl: string }
  | { kind: 'error'; videoPath: string; message: string; apiKeyProblem: boolean }

function describePhase(phase: TranscribePhase): string {
  return phase === 'extracting' ? 'Extracting audio…' : 'Transcribing…'
}

function findActiveUtterance(utterances: Utterance[], timeMs: number): string | null {
  const active = utterances.find((utterance) => timeMs >= utterance.start && timeMs < utterance.end)
  return active ? active.id : null
}

const buttonClass =
  'cursor-pointer rounded-md border border-black/25 px-3 py-1.5 text-sm dark:border-white/25'

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('workbench')
  const [state, setState] = useState<WorkbenchState>({ kind: 'idle' })
  const [activeUtteranceId, setActiveUtteranceId] = useState<string | null>(null)
  const [exportMessage, setExportMessage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return window.auteo.onTranscribeProgress((progress) => {
      setState((current) =>
        current.kind === 'working' ? { ...current, phase: progress.phase } : current
      )
    })
  }, [])

  const transcribe = async (videoPath: string): Promise<void> => {
    setState({ kind: 'working', videoPath, phase: 'extracting' })
    setActiveUtteranceId(null)
    setExportMessage('')
    try {
      const transcript = await window.auteo.transcribeVideo(videoPath)
      const mediaUrl = await window.auteo.registerMedia(videoPath)
      setState({ kind: 'ready', transcript, mediaUrl })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setState({
        kind: 'error',
        videoPath,
        message: message.replace(/^Error invoking remote method '[^']+': Error: /, ''),
        apiKeyProblem: message.includes('API_KEY_')
      })
    }
  }

  const seekTo = (utterance: Utterance): void => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = utterance.start / 1000
    void video.play()
  }

  const exportSrt = async (transcript: Transcript): Promise<void> => {
    setExportMessage('')
    try {
      const result = await window.auteo.exportSrt(transcript)
      if (result.savedPath) setExportMessage(`Saved to ${result.savedPath}`)
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : 'Export failed.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-black/15 px-4 py-2.5 dark:border-white/15">
        <span className="text-base font-bold">Auteo</span>
        <nav className="flex gap-2">
          <button
            className={`${buttonClass} ${view === 'workbench' ? 'bg-black/10 dark:bg-white/10' : ''}`}
            onClick={() => setView('workbench')}
          >
            Workbench
          </button>
          <button
            className={`${buttonClass} ${view === 'settings' ? 'bg-black/10 dark:bg-white/10' : ''}`}
            onClick={() => setView('settings')}
          >
            Settings
          </button>
        </nav>
      </header>
      <main className="flex flex-1 flex-col p-4">
        {view === 'settings' ? (
          <SettingsPage />
        ) : state.kind === 'idle' ? (
          <DropZone onSelect={(videoPath) => void transcribe(videoPath)} />
        ) : state.kind === 'working' ? (
          <div className="m-auto flex flex-col items-center gap-2">
            <p className="font-mono text-xs break-all opacity-80">{state.videoPath}</p>
            <p>{describePhase(state.phase)}</p>
          </div>
        ) : state.kind === 'error' ? (
          <div className="m-auto flex flex-col items-center gap-2">
            <p className="max-w-2xl text-center text-red-500">{state.message}</p>
            <div className="flex gap-2">
              {state.apiKeyProblem && (
                <button className={buttonClass} onClick={() => setView('settings')}>
                  Open Settings
                </button>
              )}
              <button className={buttonClass} onClick={() => void transcribe(state.videoPath)}>
                Retry
              </button>
              <button className={buttonClass} onClick={() => setState({ kind: 'idle' })}>
                Choose another video
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-4">
            <div className="flex min-w-0 flex-[3] flex-col gap-2">
              <VideoPlayer
                ref={videoRef}
                src={state.mediaUrl}
                onTimeUpdate={(timeMs) =>
                  setActiveUtteranceId(findActiveUtterance(state.transcript.utterances, timeMs))
                }
              />
              <div className="flex items-center justify-between text-[13px] opacity-85">
                <span>
                  {state.transcript.utterances.length} utterances ·{' '}
                  {Math.round(state.transcript.audioDurationMs / 1000)}s
                </span>
                <div className="flex gap-2">
                  <button className={buttonClass} onClick={() => void exportSrt(state.transcript)}>
                    Export SRT
                  </button>
                  <button className={buttonClass} onClick={() => setState({ kind: 'idle' })}>
                    Choose another video
                  </button>
                </div>
              </div>
              {exportMessage !== '' && (
                <p className="m-0 text-xs break-all opacity-70">{exportMessage}</p>
              )}
            </div>
            <SubtitleList
              utterances={state.transcript.utterances}
              activeId={activeUtteranceId}
              onSelect={seekTo}
            />
          </div>
        )}
      </main>
    </div>
  )
}
