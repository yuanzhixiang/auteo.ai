import { Download, RefreshCw, Search, Undo2 } from 'lucide-react'
import type { JSX } from 'react'

const iconButtonClass =
  'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors'
const textButtonClass =
  'flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 text-xs whitespace-nowrap transition-colors'
const ghostClass = 'hover:bg-muted'
const activeClass = 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
const findInputClass =
  'h-8 w-36 rounded-md border border-black/20 bg-transparent px-2 text-xs outline-none dark:border-white/20'

interface SubtitleToolbarProps {
  utteranceCount: number
  audioDurationMs: number
  canUndo: boolean
  findOpen: boolean
  findText: string
  replaceText: string
  message: string
  onUndo(): void
  onExportSrt(): void
  onRetranscribe(): void
  onToggleFind(): void
  onFindTextChange(value: string): void
  onReplaceTextChange(value: string): void
  onReplaceAll(): void
}

export default function SubtitleToolbar({
  utteranceCount,
  audioDurationMs,
  canUndo,
  findOpen,
  findText,
  replaceText,
  message,
  onUndo,
  onExportSrt,
  onRetranscribe,
  onToggleFind,
  onFindTextChange,
  onReplaceTextChange,
  onReplaceAll
}: SubtitleToolbarProps): JSX.Element {
  return (
    <div className="shrink-0">
      <div className="box-border flex h-[52px] items-center p-2">
        <span className="px-1 text-xs whitespace-nowrap text-muted-foreground">
          {utteranceCount} utterances · {Math.round(audioDurationMs / 1000)}s
        </span>
        <div className="flex-1" />
        {canUndo && (
          <button className={`${iconButtonClass} ${ghostClass}`} title="Undo" onClick={onUndo}>
            <Undo2 size={16} />
          </button>
        )}
        <button className={`${textButtonClass} ${ghostClass}`} onClick={onExportSrt}>
          <Download size={16} />
          Export SRT
        </button>
        <button className={`${textButtonClass} ${ghostClass}`} onClick={onRetranscribe}>
          <RefreshCw size={16} />
          Re-transcribe
        </button>
        <button
          className={`${iconButtonClass} ${findOpen ? activeClass : ghostClass}`}
          title="Find and replace"
          onClick={onToggleFind}
        >
          <Search size={16} />
        </button>
      </div>
      {findOpen && (
        <div className="flex flex-wrap items-center gap-2 px-2 pb-2">
          <input
            autoFocus
            className={findInputClass}
            placeholder="Find"
            value={findText}
            onChange={(event) => onFindTextChange(event.target.value)}
          />
          <input
            className={findInputClass}
            placeholder="Replace with"
            value={replaceText}
            onChange={(event) => onReplaceTextChange(event.target.value)}
          />
          <button
            className={`${textButtonClass} ${ghostClass} disabled:cursor-default disabled:opacity-50`}
            disabled={findText === ''}
            onClick={onReplaceAll}
          >
            Replace All
          </button>
        </div>
      )}
      {message !== '' && <p className="m-0 px-3 pb-2 text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
