import { useState } from 'react'
import { supabase } from '../supabase'
import type { Priority, Task } from '../types'

type Props = {
  onCreated: (task: Task) => void
  onCancel: () => void
}

export default function TaskForm({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setFormError(null)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
      })
      .select()
      .single()

    setSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    onCreated(data as Task)
    setTitle('')
    setDescription('')
    setPriority('normal')
    setDueDate('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 max-w-xl space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        maxLength={200}
        required
        autoFocus
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={3}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <div className="flex gap-3">
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}