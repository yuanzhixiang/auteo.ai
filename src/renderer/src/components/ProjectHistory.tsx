import type { JSX } from 'react'
import type { ProjectSummary } from '../../../shared/types'

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatUpdatedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

interface ProjectHistoryProps {
  projects: ProjectSummary[]
  onOpen(id: string): void
  onDelete(id: string): void
}

export default function ProjectHistory({
  projects,
  onOpen,
  onDelete
}: ProjectHistoryProps): JSX.Element | null {
  if (projects.length === 0) return null

  return (
    <section className="mt-4">
      <h3 className="mb-2 text-sm font-semibold opacity-75">Recent projects</h3>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {projects.map((project) => (
          <li
            key={project.id}
            className={`flex items-center gap-3 rounded-md border border-black/15 px-3 py-2 dark:border-white/15 ${
              project.fileExists
                ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/10'
                : 'opacity-50'
            }`}
            onClick={() => {
              if (project.fileExists) onOpen(project.id)
            }}
            title={project.fileExists ? project.videoPath : 'Video file missing'}
          >
            <span className="min-w-0 flex-1 truncate text-sm">{project.fileName}</span>
            <span className="shrink-0 text-xs opacity-60">
              {project.utteranceCount} lines · {formatDuration(project.audioDurationMs)} ·{' '}
              {formatUpdatedAt(project.updatedAt)}
              {!project.fileExists && ' · video missing'}
            </span>
            <button
              className="shrink-0 cursor-pointer rounded border border-black/20 px-2 py-0.5 text-xs opacity-70 hover:opacity-100 dark:border-white/20"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(project.id)
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
