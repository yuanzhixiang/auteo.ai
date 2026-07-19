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
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Auteo</span>
        <nav>
          <button
            className={view === 'workbench' ? 'nav-active' : ''}
            onClick={() => setView('workbench')}
          >
            Workbench
          </button>
          <button
            className={view === 'settings' ? 'nav-active' : ''}
            onClick={() => setView('settings')}
          >
            Settings
          </button>
        </nav>
      </header>
      <main className="app-main">
        {view === 'settings' ? (
          <SettingsPage />
        ) : state.kind === 'idle' ? (
          <DropZone onSelect={(videoPath) => void transcribe(videoPath)} />
        ) : state.kind === 'working' ? (
          <div className="workbench">
            <p className="video-path">{state.videoPath}</p>
            <p>{describePhase(state.phase)}</p>
          </div>
        ) : state.kind === 'error' ? (
          <div className="workbench">
            <p className="workbench-error">{state.message}</p>
            {state.apiKeyProblem && (
              <button onClick={() => setView('settings')}>Open Settings</button>
            )}
            <button onClick={() => void transcribe(state.videoPath)}>Retry</button>
            <button onClick={() => setState({ kind: 'idle' })}>Choose another video</button>
          </div>
        ) : (
          <div className="ready-layout">
            <div className="ready-video">
              <VideoPlayer
                ref={videoRef}
                src={state.mediaUrl}
                onTimeUpdate={(timeMs) =>
                  setActiveUtteranceId(findActiveUtterance(state.transcript.utterances, timeMs))
                }
              />
              <div className="ready-toolbar">
                <span>
                  {state.transcript.utterances.length} utterances ·{' '}
                  {Math.round(state.transcript.audioDurationMs / 1000)}s
                </span>
                <div className="ready-actions">
                  <button onClick={() => void exportSrt(state.transcript)}>Export SRT</button>
                  <button onClick={() => setState({ kind: 'idle' })}>Choose another video</button>
                </div>
              </div>
              {exportMessage !== '' && <p className="export-message">{exportMessage}</p>}
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
