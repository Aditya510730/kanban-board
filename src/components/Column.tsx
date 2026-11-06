import { useDroppable } from '@dnd-kit/core'
import type { Status, Task } from '../types'
import TaskCard from './TaskCard'

const STYLES: Record<Status, { col: string; pill: string; dot: string; count: string }> = {
  todo: {
    col: 'bg-purple-50/70',
    pill: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-400',
    count: 'text-purple-500',
  },
  in_progress: {
    col: 'bg-amber-50/70',
    pill: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-400',
    count: 'text-amber-600',
  },
  in_review: {
    col: 'bg-sky-50/70',
    pill: 'bg-sky-100 text-sky-800',
    dot: 'bg-sky-400',
    count: 'text-sky-600',
  },
  done: {
    col: 'bg-emerald-50/70',
    pill: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-400',
    count: 'text-emerald-600',
  },
}

type Props = {
  status: Status
  label: string
  tasks: Task[]
  onDelete: (id: string) => void
}

export default function Column({ status, label, tasks, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const s = STYLES[status]

  return (
    <div
      ref={setNodeRef}
      className={`min-h-72 rounded-xl p-3 transition ${s.col} ${
        isOver ? 'ring-2 ring-blue-300' : 'ring-0'
      }`}
    >
      <div className="mb-3 flex items-center gap-2 px-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-medium ${s.pill}`}
        >
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {label}
        </span>
        <span className={`text-sm font-medium ${s.count}`}>{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/10 p-6 text-center text-xs text-black/40">
          Drop tasks here
        </div>
      ) : (
        tasks.map(task => (
          <TaskCard key={task.id} task={task} onDelete={onDelete} />
        ))
      )}
    </div>
  )
}