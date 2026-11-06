import { useDroppable } from '@dnd-kit/core'
import type { Status, Task } from '../types'
import TaskCard from './TaskCard'

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
      className={`min-h-64 rounded-lg p-3 transition-colors ${
        isOver ? 'bg-blue-100' : 'bg-gray-100'
      }`}
    >
      <h2 className="mb-3 font-semibold">
        {label} <span className="text-gray-400">{tasks.length}</span>
      </h2>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}