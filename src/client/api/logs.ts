const API_BASE = '/api'

export async function fetchLogs(limit = 100) {
  const res = await fetch(`${API_BASE}/logs?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch logs')
  return res.json()
}
