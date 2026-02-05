import { useState, useEffect, useCallback } from 'react'
import { Agent, Task, Activity } from '../types'

const CONVEX_DEPLOY_KEY = 'dev:beaming-basilisk-326|eyJ2MiI6ImZhYWI5MzU5MDVmODQwZDI5OGNlMzAzNjhhOGIwYjY0In0='

export function useConvex() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch agents
      const agentsResponse = await fetch('/api/agents')
      if (!agentsResponse.ok) throw new Error('Failed to fetch agents')
      const agentsData = await agentsResponse.json()
      setAgents(agentsData)

      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks')
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks')
      const tasksData = await tasksResponse.json()
      setTasks(tasksData)

      // Fetch activities
      const activitiesResponse = await fetch('/api/activities')
      if (!activitiesResponse.ok) throw new Error('Failed to fetch activities')
      const activitiesData = await activitiesResponse.json()
      setActivities(activitiesData)

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    agents,
    tasks,
    activities,
    loading,
    error,
    refreshData: fetchData
  }
}
