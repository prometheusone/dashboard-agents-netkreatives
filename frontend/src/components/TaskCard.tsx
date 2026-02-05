import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { Task, Agent } from '../types'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
  agents: Agent[]
  onClick: () => void
}

export default function TaskCard({ task, agents, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const assignedAgents = task.assigneeIds
    ?.map(id => agents.find(a => a._id === id))
    .filter(Boolean) as Agent[]

  const getPriorityColor = () => {
    if (task.tags?.includes('critical') || task.tags?.includes('urgent')) return 'var(--error)'
    if (task.tags?.includes('high')) return 'var(--warning)'
    return 'var(--text-muted)'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onClick={onClick}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.slice(0, 2).map(tag => (
              <span 
                key={tag} 
                className="tag"
                style={{ background: getPriorityColor() }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {task.description && (
        <p className="task-description">
          {task.description.length > 100 
            ? task.description.substring(0, 100) + '...' 
            : task.description}
        </p>
      )}

      <div className="task-footer">
        <div className="task-assignees">
          {assignedAgents?.slice(0, 3).map(agent => (
            <div 
              key={agent._id} 
              className="avatar-mini"
              title={agent.name}
            >
              {agent.avatar}
            </div>
          ))}
          {assignedAgents && assignedAgents.length > 3 && (
            <div className="avatar-mini">+{assignedAgents.length - 3}</div>
          )}
        </div>

        <div className="task-meta">
          {task._creationTime && (
            <span className="time-ago">
              {formatDistanceToNow(new Date(task._creationTime), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
