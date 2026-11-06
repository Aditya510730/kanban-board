import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { Task } from '../types'
import { PRIORITY_STYLES, getDueInfo } from '../utils'

type ViewProps = {
  task: Task
  onDelete?: (id: string) => void
}

// Stops the drag sensors from grabbing the card when the user taps a button
const stop = {
  onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
  onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
}

export function TaskCardView({ task, onDelete }: ViewProps) {
  const due = getDueInfo(task.due_date, task.status)
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className="group relative rounded-lg bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
      onMouseLeave={() => setConfirming(false)}
    >
        {onDelete && !confirming && (
        <button
          type="button"
          aria-label={`Delete task ${task.title}`}
          {...stop}
          onClick={() => setConfirming(true)}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-sm text-black/25 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          ✕
        </button>
      )}

      <p className={`text-sm font-medium text-slate-900 ${onDelete ? 'pr-6' : ''}`}>
        {task.title}
      </p>
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

      {onDelete && confirming && (
        <div className="mt-3 flex items-center gap-2 border-t border-black/5 pt-3">
          <span className="text-xs text-black/50">Delete this task?</span>
          <button
            type="button"
            {...stop}
            onClick={() => onDelete(task.id)}
            className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            Delete
          </button>
          <button
            type="button"
            {...stop}
            onClick={() => setConfirming(false)}
            className="rounded-md px-2 py-1 text-xs font-medium text-black/50 transition hover:bg-black/5"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default function TaskCard({
  task,
  onDelete,
}: {
  task: Task
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`card-in mb-2 cursor-grab touch-none transition-opacity ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <TaskCardView task={task} onDelete={onDelete} />
    </div>
  )
}