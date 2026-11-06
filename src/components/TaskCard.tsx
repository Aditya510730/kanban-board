import { useDraggable } from '@dnd-kit/core'
import type { Task } from '../types'

export function TaskCardView({ task }: { task: Task }) {
  return (
    <div className="rounded bg-white p-3 shadow-sm">
      {task.title}
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