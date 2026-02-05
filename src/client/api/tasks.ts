const API_BASE = '/api'

export async function fetchTasks(status?: string) {
  const url = status ? `${API_BASE}/tasks?status=${status}` : `${API_BASE}/tasks`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function fetchTask(taskId: string) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`)
  if (!res.ok) throw new Error('Failed to fetch task')
  return res.json()
}

export async function updateTaskStatus(taskId: string, status: string, agentId: string) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, agentId }),
  })
  if (!res.ok) throw new Error('Failed to update task status')
  return res.json()
}
