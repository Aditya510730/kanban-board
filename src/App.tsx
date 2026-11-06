import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { supabase, ensureGuestSession } from './supabase'
import { COLUMNS } from './types'
import type { Status, Task } from './types'
import TaskForm from './components/TaskForm'
import Column from './components/Column'
import { TaskCardView } from './components/TaskCard'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  useEffect(() => {
    async function load() {
      try {
        await ensureGuestSession()
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at')
        if (error) throw error
        setTasks(data as Task[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleDragStart(event: DragStartEvent) {
    setMoveError(null)
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const newStatus = over.id as Status
    const task = tasks.find(t => t.id === active.id)
    if (!task || task.status === newStatus) return

    const oldStatus = task.status

    // update the screen right away
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    // then save it
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)

    if (error) {
      // put the card back if the save failed
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, status: oldStatus } : t))
      )
      setMoveError("Couldn't move that task. Please try again.")
    }
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Loading your board...</p>
  }

  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Board</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            New task
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          onCreated={task => {
            setTasks(prev => [...prev, task])
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {moveError && <p className="mb-4 text-sm text-red-600">{moveError}</p>}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map(col => (
            <Column
              key={col.status}
              status={col.status}
              label={col.label}
              tasks={tasks.filter(t => t.status === col.status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCardView task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default App