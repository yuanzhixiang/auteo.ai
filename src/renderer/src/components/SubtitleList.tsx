import { useEffect, useRef } from 'react'
import type { JSX } from 'react'
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
}

export default function SubtitleList({
  utterances,
  activeId,
  onSelect
}: SubtitleListProps): JSX.Element {
  const activeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  return (
    <ol className="subtitle-list">
      {utterances.map((utterance) => {
        const active = utterance.id === activeId
        return (
          <li
            key={utterance.id}
            ref={active ? activeRef : undefined}
            className={active ? 'subtitle-item subtitle-active' : 'subtitle-item'}
            onClick={() => onSelect(utterance)}
          >
            <span className="subtitle-time">{formatTime(utterance.start)}</span>
            <span className="subtitle-text">{utterance.text}</span>
          </li>
        )
      })}
    </ol>
  )
}
