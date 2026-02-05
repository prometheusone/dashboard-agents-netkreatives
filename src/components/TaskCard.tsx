import { formatDistanceToNow } from 'date-fns'
import './TaskCard.css'

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

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onClick: () => void
  isSelected: boolean
}

export default function TaskCard({ task, onDragStart, onClick, isSelected }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'var(--accent-red)',
      high: 'var(--accent-yellow)',
      medium: 'var(--accent-blue)',
      low: 'var(--text-tertiary)'
    }
    return colors[priority as keyof typeof colors] || colors.low
  }
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }
  
  return (
    <div
      className={`task-card priority-${task.priority} ${isSelected ? 'selected' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onClick={onClick}
      style={{ borderLeftColor: getPriorityColor(task.priority) }}
    >
      <div className="task-card-header">
        <span className={`priority-badge ${task.priority}`}>
          {task.priority}
        </span>
        
        {task.blockedReason && (
          <span className="blocked-indicator" title={task.blockedReason}>
            🚧
          </span>
        )}
      </div>
      
      <h4 className="task-title">{truncateText(task.title, 60)}</h4>
      
      {task.description && (
        <p className="task-description">
          {truncateText(task.description, 100)}
        </p>
      )}
      
      <div className="task-footer">
        <div className="task-meta">
          {task.assignedAgents && task.assignedAgents.length > 0 && (
            <div className="assigned-agents">
              {task.assignedAgents.slice(0, 3).map((agent, i) => (
                <span key={i} className="agent-avatar" title={agent}>
                  {agent.substring(0, 2).toUpperCase()}
                </span>
              ))}
              {task.assignedAgents.length > 3 && (
                <span className="agent-avatar more">
                  +{task.assignedAgents.length - 3}
                </span>
              )}
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="task-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="task-time">
          {formatDistanceToNow(task.updatedAt, { addSuffix: true })}
        </div>
      </div>
      
      {task.dependencies && task.dependencies.length > 0 && (
        <div className="task-dependencies">
          <span className="dependency-icon">🔗</span>
          <span className="dependency-count">{task.dependencies.length} dependencies</span>
        </div>
      )}
    </div>
  )
}
