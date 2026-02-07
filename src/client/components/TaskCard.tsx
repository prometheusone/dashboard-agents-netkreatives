import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { formatRelativeTime } from '../utils/time'

interface TaskCardProps {
  task: any
  onClick?: () => void
  isDragging?: boolean
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

const AGENT_EMOJIS: Record<string, string> = {
  builder: '🔨',
  reviewer: '🔍',
  utility: '⚡',
  lead: '👑',
  main: '🐉',
}

function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  })

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined

  const priorityColor = PRIORITY_COLORS[task.priority] || '#6b7280'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <div className="task-card-header">
        <div
          className="priority-indicator"
          style={{ backgroundColor: priorityColor }}
          title={task.priority}
        />
        <div className="task-meta">
          {task.assignedAgent && (
            <span className="agent-badge" title={task.assignedAgent}>
              {AGENT_EMOJIS[task.assignedAgent] || '🤖'}
            </span>
          )}
        </div>
      </div>

      <h4 className="task-title">{task.title}</h4>

      {task.description && (
        <p className="task-description">
          {task.description.substring(0, 100)}
          {task.description.length > 100 ? '...' : ''}
        </p>
      )}

      <div className="task-footer">
        {task.dependencies && task.dependencies.length > 0 && (
          <span className="dependency-badge" title="Has dependencies">
            🔗 {task.dependencies.length}
          </span>
        )}
        {task.blockedReason && (
          <span className="blocked-badge" title={task.blockedReason}>
            🚧 Blocked
          </span>
        )}
        {task.updatedAt && (
          <span className="time-badge">
            {formatRelativeTime(task.updatedAt)}
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCard
