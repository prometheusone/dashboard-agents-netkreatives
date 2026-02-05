import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'
import './TasksView.css'

type TaskStatus = 'ready' | 'in_progress' | 'blocked' | 'done'

const COLUMNS: { id: TaskStatus; label: string; emoji: string; color: string }[] = [
  { id: 'ready', label: 'Ready', emoji: '⏳', color: 'var(--accent-yellow)' },
  { id: 'in_progress', label: 'In Progress', emoji: '⚙️', color: 'var(--accent-blue)' },
  { id: 'blocked', label: 'Blocked', emoji: '🚫', color: 'var(--accent-red)' },
  { id: 'done', label: 'Complete', emoji: '✅', color: 'var(--accent-green)' },
]

export default function TasksView() {
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [filterAgent, setFilterAgent] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')

  const tasks = useQuery(api.tasks.list)
  const agents = useQuery(api.agents.list)
  const updateTask = useMutation(api.tasks.update)

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    
    let filtered = tasks

    if (filterAgent) {
      filtered = filtered.filter(t => 
        t.assignedAgents?.includes(filterAgent) || t.preferredAgent === filterAgent
      )
    }

    if (filterPriority) {
      filtered = filtered.filter(t => t.priority === filterPriority)
    }

    return filtered
  }, [tasks, filterAgent, filterPriority])

  // Group tasks by status
  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, any[]> = {
      ready: [],
      in_progress: [],
      blocked: [],
      done: [],
    }

    filteredTasks.forEach(task => {
      if (task.status in grouped) {
        grouped[task.status as TaskStatus].push(task)
      }
    })

    return grouped
  }, [filteredTasks])

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
  }

  const handleCloseModal = () => {
    setSelectedTask(null)
  }

  const handleStatusChange = async (taskId: Id<'tasks'>, newStatus: string) => {
    try {
      await updateTask({ taskId, status: newStatus as any })
      if (selectedTask?._id === taskId) {
        setSelectedTask(null)
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  if (!tasks) {
    return <div className="loading">Loading tasks...</div>
  }

  return (
    <div className="tasks-view">
      <div className="tasks-header">
        <div className="filters">
          <select 
            value={filterAgent} 
            onChange={(e) => setFilterAgent(e.target.value)}
            className="filter-select"
          >
            <option value="">All Agents</option>
            {agents?.map(agent => (
              <option key={agent._id} value={agent.agentId}>
                {agent.name || agent.agentId}
              </option>
            ))}
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

          {(filterAgent || filterPriority) && (
            <button 
              className="clear-filters"
              onClick={() => {
                setFilterAgent('')
                setFilterPriority('')
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="task-count">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="kanban-board">
        {COLUMNS.map(column => (
          <div key={column.id} className="kanban-column">
            <div className="column-header">
              <span className="column-emoji">{column.emoji}</span>
              <span className="column-title">{column.label}</span>
              <span className="column-count" style={{ backgroundColor: column.color }}>
                {tasksByColumn[column.id].length}
              </span>
            </div>

            <div className="column-content">
              {tasksByColumn[column.id].map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onClick={() => handleTaskClick(task)}
                  agents={agents || []}
                />
              ))}
              {tasksByColumn[column.id].length === 0 && (
                <div className="empty-column">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={handleCloseModal}
          onStatusChange={handleStatusChange}
          agents={agents || []}
        />
      )}
    </div>
  )
}

function TaskCard({ task, onClick, agents }: { task: any; onClick: () => void; agents: any[] }) {
  const priorityColors: Record<string, string> = {
    critical: 'var(--accent-red)',
    high: '#f97316',
    medium: 'var(--accent-yellow)',
    low: 'var(--accent-green)',
  }

  const assignedAgent = agents.find(a => task.assignedAgents?.includes(a.agentId))

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-header">
        <div 
          className="task-priority-indicator" 
          style={{ backgroundColor: priorityColors[task.priority] || 'var(--text-muted)' }}
        />
        <span className="task-title">{task.title}</span>
      </div>

      {task.description && (
        <p className="task-description">{task.description.slice(0, 100)}...</p>
      )}

      <div className="task-card-footer">
        {assignedAgent && (
          <div className="task-agent">
            <span className="agent-avatar">{assignedAgent.avatar || '🤖'}</span>
            <span className="agent-name">{assignedAgent.name || assignedAgent.agentId}</span>
          </div>
        )}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="task-dependencies">
            🔗 {task.dependencies.length}
          </div>
        )}
      </div>
    </div>
  )
}

function TaskModal({ task, onClose, onStatusChange, agents }: { 
  task: any
  onClose: () => void
  onStatusChange: (taskId: Id<'tasks'>, status: string) => void
  agents: any[]
}) {
  const assignedAgents = agents.filter(a => task.assignedAgents?.includes(a.agentId))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="task-meta">
            <div className="meta-item">
              <strong>Status:</strong>
              <select 
                value={task.status} 
                onChange={(e) => onStatusChange(task._id, e.target.value)}
                className="status-select"
              >
                <option value="ready">⏳ Ready</option>
                <option value="in_progress">⚙️ In Progress</option>
                <option value="blocked">🚫 Blocked</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            <div className="meta-item">
              <strong>Priority:</strong>
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority}
              </span>
            </div>

            {assignedAgents.length > 0 && (
              <div className="meta-item">
                <strong>Assigned to:</strong>
                <div className="assigned-agents">
                  {assignedAgents.map(agent => (
                    <span key={agent._id} className="agent-badge">
                      {agent.avatar || '🤖'} {agent.name || agent.agentId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {task.description && (
            <div className="task-detail">
              <strong>Description:</strong>
              <p>{task.description}</p>
            </div>
          )}

          {task.blockedReason && (
            <div className="task-detail blocked-reason">
              <strong>⚠️ Blocked Reason:</strong>
              <p>{task.blockedReason}</p>
            </div>
          )}

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="task-detail">
              <strong>Dependencies:</strong>
              <p>🔗 {task.dependencies.length} dependent task(s)</p>
            </div>
          )}

          {task.handoffMessage && (
            <div className="task-detail handoff">
              <strong>💬 Handoff:</strong>
              <p>{task.handoffMessage}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
