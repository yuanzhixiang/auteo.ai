import { useState } from 'react'
import type { JSX } from 'react'
import SettingsPage from './components/SettingsPage'

type View = 'workbench' | 'settings'

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('workbench')

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
          <p className="placeholder">Drop a video to get started. (Coming in the next step.)</p>
        ) : (
          <SettingsPage />
        )}
      </main>
    </div>
  )
}
