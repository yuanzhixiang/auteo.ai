import { useEffect, useRef, useState } from 'react'
import type { JSX, KeyboardEvent } from 'react'
import type { Utterance } from '../../../shared/types'

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

interface SubtitleListProps {
  utterances: Utterance[]
  activeId: string | null
  onSelect(utterance: Utterance): void
  onEditSave(id: string, text: string): void
}

export default function SubtitleList({
  utterances,
  activeId,
  onSelect,
  onEditSave
}: SubtitleListProps): JSX.Element {
  const activeRef = useRef<HTMLLIElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (editingId === null) activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeId, editingId])

  const startEdit = (utterance: Utterance): void => {
    setEditingId(utterance.id)
    setDraft(utterance.text)
  }

  const cancelEdit = (): void => {
    setEditingId(null)
    setDraft('')
  }

  const saveEdit = (): void => {
    if (editingId === null) return
    const text = draft.trim()
    if (text === '') {
      cancelEdit()
      return
    }
    onEditSave(editingId, text)
    cancelEdit()
  }

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Enter during IME composition (Chinese input) must not commit.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      saveEdit()
    } else if (event.key === 'Escape') {
      cancelEdit()
    }
  }

  return (
    <ol className="m-0 flex-[2] list-none overflow-y-auto border-l border-black/15 p-0 dark:border-white/15">
      {utterances.map((utterance) => {
        const active = utterance.id === activeId
        const editing = utterance.id === editingId
        return (
          <li
            key={utterance.id}
            ref={active ? activeRef : undefined}
            className={`flex gap-2.5 rounded-md px-3 py-2 ${
              editing
                ? 'bg-black/5 dark:bg-white/10'
                : `cursor-pointer ${active ? 'bg-brand/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`
            }`}
            onClick={() => {
              if (!editing) onSelect(utterance)
            }}
            onDoubleClick={() => {
              if (!editing) startEdit(utterance)
            }}
            title={editing ? undefined : 'Click to jump · double-click to edit'}
          >
            <span className="shrink-0 pt-0.5 font-mono text-xs opacity-60">
              {formatTime(utterance.start)}
            </span>
            {editing ? (
              <textarea
                autoFocus
                rows={2}
                className="w-full resize-none rounded border border-brand bg-transparent px-1.5 py-1 text-sm leading-6 outline-none"
                value={draft}
                onFocus={(event) => event.target.select()}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={saveEdit}
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <span className="text-sm leading-6">{utterance.text}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
