import { useState } from 'react'
import type { JSX } from 'react'
import DropZone from './components/DropZone'
import SettingsPage from './components/SettingsPage'

type View = 'workbench' | 'settings'

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('workbench')
  const [videoPath, setVideoPath] = useState<string | null>(null)

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
        {view === 'workbench' ? (
          videoPath === null ? (
            <DropZone onSelect={setVideoPath} />
          ) : (
            <div className="workbench">
              <p className="video-path">{videoPath}</p>
              <p className="placeholder">Transcription pipeline lands in the next step.</p>
              <button onClick={() => setVideoPath(null)}>Choose another video</button>
            </div>
          )
        ) : (
          <SettingsPage />
        )}
      </main>
    </div>
  )
}
