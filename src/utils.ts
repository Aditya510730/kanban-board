import type { Priority, Status } from './types'

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-50 text-blue-700',
  high: 'bg-rose-50 text-rose-700',
}

export function getDueInfo(due: string | null, status: Status) {
  if (!due || status === 'done') return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // parse as a local date so timezones don't shift the day
  const [y, m, d] = due.split('-').map(Number)
  const dueDate = new Date(y, m - 1, d)

  const days = Math.round((dueDate.getTime() - today.getTime()) / 86400000)
  const label = dueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  if (days < 0) return { label: `Overdue · ${label}`, style: 'bg-red-50 text-red-700' }
  if (days <= 2) return { label: `Due ${label}`, style: 'bg-amber-50 text-amber-700' }
  return { label, style: 'bg-slate-100 text-slate-600' }
}
export function isOverdue(due: string | null, status: Status) {
  if (!due || status === 'done') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d) < today
}