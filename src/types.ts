export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'normal' | 'high'

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  created_at: string
}

export const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'in_review', label: 'In Review' },
  { status: 'done', label: 'Done' },
]