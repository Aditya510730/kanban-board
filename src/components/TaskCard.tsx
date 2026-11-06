import { useDraggable } from '@dnd-kit/core'
import type { Task } from '../types'
import { PRIORITY_STYLES, getDueInfo } from '../utils'

export function TaskCardView({ task }: { task: Task }) {
  const due = getDueInfo(task.due_date, task.status)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-slate-900">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
        {due && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${due.style}`}>
            {due.label}
          </span>
        )}
      </div>
    </div>
  )
}

export default function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`mb-2 cursor-grab touch-none ${isDragging ? 'opacity-40' : ''}`}
    >
      <TaskCardView task={task} />
    </div>
  )
}