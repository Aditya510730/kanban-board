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
import type { Priority, Status, Task } from './types'
import { isOverdue } from './utils'
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
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')

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

  const filteredTasks = tasks.filter(
    t =>
      t.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (priorityFilter === 'all' || t.priority === priorityFilter)
  )

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => isOverdue(t.due_date, t.status)).length,
  }

  const filtersActive = search.trim() !== '' || priorityFilter !== 'all'

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 h-10 w-40 animate-pulse rounded-lg bg-black/5" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-black/5" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-lg font-semibold">Couldn't load your board</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Board</h1>
          <p className="mt-1 text-sm text-black/50">
            {tasks.length === 0
              ? 'Add your first task to get started'
              : 'Drag cards between columns to update their status'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + New task
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 sm:max-w-md">
        {[
          { label: 'Total', value: stats.total, style: 'text-slate-900' },
          { label: 'Completed', value: stats.done, style: 'text-emerald-600' },
          { label: 'Overdue', value: stats.overdue, style: 'text-red-600' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-lg bg-white px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
          >
            <p className="text-xs text-black/50">{s.label}</p>
            <p className={`text-xl font-semibold ${s.style}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-lg bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/10 transition placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:w-64"
        />
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as Priority | 'all')}
          className="rounded-lg bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/10 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        {filtersActive && (
          <button
            onClick={() => {
              setSearch('')
              setPriorityFilter('all')
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear filters
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

      {moveError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {moveError}
        </p>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map(col => (
            <Column
              key={col.status}
              status={col.status}
              label={col.label}
              tasks={filteredTasks.filter(t => t.status === col.status)}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}
        >
          {activeTask ? (
            <div className="rotate-2 cursor-grabbing shadow-xl">
              <TaskCardView task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default App