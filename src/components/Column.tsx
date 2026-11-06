import { useDroppable } from '@dnd-kit/core'
import type { Status, Task } from '../types'
import TaskCard from './TaskCard'

const DOT: Record<Status, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  in_review: 'bg-amber-500',
  done: 'bg-emerald-500',
}

type Props = {
  status: Status
  label: string
  tasks: Task[]
}

export default function Column({ status, label, tasks }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-72 rounded-xl p-3 transition-colors ${
        isOver ? 'bg-blue-100/70' : 'bg-slate-100'
      }`}
    >
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT[status]}`} />
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="rounded-full bg-white px-2 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
          Drop tasks here
        </div>
      ) : (
        tasks.map(task => <TaskCard key={task.id} task={task} />)
      )}
    </div>
  )
}