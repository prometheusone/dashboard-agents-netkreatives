import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import TaskColumn from './TaskColumn'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import { fetchTasks, updateTaskStatus } from '../api/tasks'

interface TasksViewProps {
  searchQuery: string
}

const COLUMNS = [
  { id: 'ready', title: 'Ready', icon: '🎯' },
  { id: 'in_progress', title: 'In Progress', icon: '🚀' },
  { id: 'blocked', title: 'Blocked', icon: '🚧' },
  { id: 'done', title: 'Complete', icon: '✅' },
]

function TasksView({ searchQuery }: TasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filterAgent, setFilterAgent] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  
  const queryClient = useQueryClient()

  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    refetchInterval: 5000, // Poll every 5 seconds
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status, agentId }: any) =>
      updateTaskStatus(taskId, status, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Filter tasks
  const filteredTasks = allTasks.filter((task: any) => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAgent = !filterAgent || 
      task.assignedAgents?.includes(filterAgent)
    
    const matchesPriority = !filterPriority || 
      task.priority === filterPriority
    
    return matchesSearch && matchesAgent && matchesPriority
  })

  // Group tasks by status
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredTasks.filter((task: any) => task.status === col.id)
    return acc
  }, {} as Record<string, any[]>)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as string

    // Update task status
    if (taskId && newStatus) {
      updateStatusMutation.mutate({
        taskId,
        status: newStatus,
        agentId: 'dashboard',
      })
    }

    setActiveId(null)
  }

  const activeTask = activeId 
    ? allTasks.find((t: any) => t._id === activeId)
    : null

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading tasks...
      </div>
    )
  }

  return (
    <div className="tasks-view">
      {/* Filters */}
      <div className="filters">
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="filter-select"
        >
          <option value="">All Agents</option>
          <option value="builder">🔨 Builder</option>
          <option value="reviewer">🔍 Reviewer</option>
          <option value="utility">⚡ Utility</option>
          <option value="lead">👑 Lead</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <div className="task-count">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              icon={column.icon}
              tasks={tasksByStatus[column.id] || []}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
        />
      )}
    </div>
  )
}

export default TasksView
