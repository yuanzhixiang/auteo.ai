import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import type { SettingsStatus } from '../../../shared/types'

export default function SettingsPage(): JSX.Element {
  const [status, setStatus] = useState<SettingsStatus | null>(null)
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setStatus(await window.auteo.getSettingsStatus())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = async (): Promise<void> => {
    setMessage('')
    try {
      await window.auteo.setApiKey(draft)
      setDraft('')
      setMessage('API key saved.')
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save the API key.')
    }
  }

  return (
    <section className="settings-page">
      <h2>Settings</h2>
      <div className="settings-field">
        <label htmlFor="volc-api-key">Volcano Engine API key</label>
        <p className="settings-status">
          {status === null
            ? 'Checking…'
            : status.hasApiKey
              ? `Configured (…${status.apiKeyTail})`
              : 'Not configured'}
        </p>
        <div className="settings-row">
          <input
            id="volc-api-key"
            type="password"
            placeholder="Paste your API key"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button onClick={() => void save()} disabled={draft.trim() === ''}>
            Save
          </button>
        </div>
        {message !== '' && <p className="settings-message">{message}</p>}
        <p className="settings-hint">
          The key is encrypted with the operating system keychain and never leaves this device
          except to call the transcription API.
        </p>
      </div>
    </section>
  )
}
