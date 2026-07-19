import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import type { TranscribePhase, Transcript } from '../../shared/types'
import DropZone from './components/DropZone'
import SettingsPage from './components/SettingsPage'

type View = 'workbench' | 'settings'

type WorkbenchState =
  | { kind: 'idle' }
  | { kind: 'working'; videoPath: string; phase: TranscribePhase }
  | { kind: 'ready'; transcript: Transcript }
  | { kind: 'error'; videoPath: string; message: string; apiKeyProblem: boolean }

function describePhase(phase: TranscribePhase): string {
  return phase === 'extracting' ? 'Extracting audio…' : 'Transcribing…'
}

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('workbench')
  const [state, setState] = useState<WorkbenchState>({ kind: 'idle' })

  useEffect(() => {
    return window.auteo.onTranscribeProgress((progress) => {
      setState((current) =>
        current.kind === 'working' ? { ...current, phase: progress.phase } : current
      )
    })
  }, [])

  const transcribe = async (videoPath: string): Promise<void> => {
    setState({ kind: 'working', videoPath, phase: 'extracting' })
    try {
      const transcript = await window.auteo.transcribeVideo(videoPath)
      setState({ kind: 'ready', transcript })
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
          <div className="workbench">
            <p className="video-path">{state.transcript.sourcePath}</p>
            <p>
              {state.transcript.utterances.length} utterances ·{' '}
              {Math.round(state.transcript.audioDurationMs / 1000)}s
            </p>
            <div className="utterance-preview">
              {state.transcript.utterances.slice(0, 5).map((utterance) => (
                <p key={utterance.id}>{utterance.text}</p>
              ))}
            </div>
            <p className="placeholder">Player and subtitle list land in the next step.</p>
            <button onClick={() => setState({ kind: 'idle' })}>Choose another video</button>
          </div>
        )}
      </main>
    </div>
  )
}
