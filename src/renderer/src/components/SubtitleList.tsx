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
    <ol className="m-0 flex-[2] list-none overflow-y-auto border-l border-black/15 p-0 dark:border-white/15">
      {utterances.map((utterance) => {
        const active = utterance.id === activeId
        return (
          <li
            key={utterance.id}
            ref={active ? activeRef : undefined}
            className={`flex cursor-pointer gap-2.5 rounded-md px-3 py-2 ${
              active ? 'bg-brand/20' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            onClick={() => onSelect(utterance)}
          >
            <span className="shrink-0 pt-0.5 font-mono text-xs opacity-60">
              {formatTime(utterance.start)}
            </span>
            <span className="text-sm leading-6">{utterance.text}</span>
          </li>
        )
      })}
    </ol>
  )
}
