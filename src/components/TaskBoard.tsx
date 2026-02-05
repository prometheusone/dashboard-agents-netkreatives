import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import './TaskBoard.css'

interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  assignedAgents?: string[]
  tags?: string[]
  dependencies?: string[]
  blockedReason?: string
  updatedAt: number
}

interface TaskBoardProps {
  tasks: Task[]
  onTaskSelect: (taskId: string | null) => void
  selectedTaskId: string | null
}

const COLUMNS = [
  { id: 'ready', title: 'Ready', emoji: '📋' },
  { id: 'in_progress', title: 'In Progress', emoji: '🔨' },
  { id: 'blocked', title: 'Blocked', emoji: '🚧' },
  { id: 'done', title: 'Complete', emoji: '✅' },
]

export default function TaskBoard({ tasks, onTaskSelect, selectedTaskId }: TaskBoardProps) {
  const [filter, setFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [modalTaskId, setModalTaskId] = useState<string | null>(null)
  
  const updateTaskStatus = useMutation(api.tasks.updateStatus)
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    
    if (taskId) {
      try {
        await updateTaskStatus({
          taskId: taskId as any,
          status: newStatus,
          agentId: 'dashboard-ui'
        })
      } catch (error) {
        console.error('Failed to update task status:', error)
      }
    }
  }
  
  const filterTasks = (columnStatus: string) => {
    return tasks.filter(task => {
      if (task.status !== columnStatus) return false
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
      if (filter && !task.title.toLowerCase().includes(filter.toLowerCase())) return false
      return true
    })
  }
  
  const handleTaskClick = (taskId: string) => {
    setModalTaskId(taskId)
    onTaskSelect(taskId)
  }
  
  const handleModalClose = () => {
    setModalTaskId(null)
    onTaskSelect(null)
  }
  
  return (
    <div className="task-board">
      <div className="board-header">
        <div className="board-title">
          <h2>Task Board</h2>
          <span className="task-count">{tasks.length} tasks</span>
        </div>
        
        <div className="board-filters">
          <input
            type="text"
            placeholder="Search tasks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="priority-filter"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      
      <div className="board-columns">
        {COLUMNS.map(column => {
          const columnTasks = filterTasks(column.id)
          
          return (
            <div 
              key={column.id}
              className={`board-column column-${column.id}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="column-header">
                <span className="column-emoji">{column.emoji}</span>
                <h3 className="column-title">{column.title}</h3>
                <span className="column-count">{columnTasks.length}</span>
              </div>
              
              <div className="column-content">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onDragStart={handleDragStart}
                    onClick={() => handleTaskClick(task._id)}
                    isSelected={task._id === selectedTaskId}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="empty-column">
                    <p>No tasks</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {modalTaskId && (
        <TaskModal
          taskId={modalTaskId}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
