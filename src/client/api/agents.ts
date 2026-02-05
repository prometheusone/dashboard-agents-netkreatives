const API_BASE = '/api'

export async function fetchAgents() {
  const res = await fetch(`${API_BASE}/agents`)
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

export async function fetchAgent(agentId: string) {
  const res = await fetch(`${API_BASE}/agents/${agentId}`)
  if (!res.ok) throw new Error('Failed to fetch agent')
  return res.json()
}

export async function fetchTasks() {
  const res = await fetch(`${API_BASE}/tasks`)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}
