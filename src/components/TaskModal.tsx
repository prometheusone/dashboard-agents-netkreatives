import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { formatDistanceToNow } from 'date-fns'
import './TaskModal.css'

interface TaskModalProps {
  taskId: string
  onClose: () => void
}

export default function TaskModal({ taskId, onClose }: TaskModalProps) {
  const task = useQuery(api.tasks.get, { taskId: taskId as any })
  const messages = useQuery(api.messages.listByTask, { taskId: taskId as any })
  
  if (!task) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content loading">
          <div className="spinner"></div>
          <p>Loading task...</p>
        </div>
      </div>
    )
  }
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>{task.title}</h2>
            <div className="modal-meta">
              <span className={`status-badge ${task.status}`}>{task.status}</span>
              <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
              <span className="text-sm text-secondary">
                Updated {formatDistanceToNow(task.updatedAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <section className="modal-section">
            <h3>Description</h3>
            <p className="task-description-full">{task.description}</p>
          </section>
          
          {task.assignedAgents && task.assignedAgents.length > 0 && (
            <section className="modal-section">
              <h3>Assigned Agents</h3>
              <div className="agent-list">
                {task.assignedAgents.map((agent, i) => (
                  <span key={i} className="agent-chip">{agent}</span>
                ))}
              </div>
            </section>
          )}
          
          {task.blockedReason && (
            <section className="modal-section blocked-section">
              <h3>🚧 Blocked</h3>
              <p className="blocked-reason">{task.blockedReason}</p>
            </section>
          )}
          
          {task.dependencies && task.dependencies.length > 0 && (
            <section className="modal-section">
              <h3>Dependencies</h3>
              <p className="text-secondary">{task.dependencies.length} task(s) must be completed first</p>
            </section>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <section className="modal-section">
              <h3>Tags</h3>
              <div className="tag-list">
                {task.tags.map((tag, i) => (
                  <span key={i} className="tag-chip">#{tag}</span>
                ))}
              </div>
            </section>
          )}
          
          {messages && messages.length > 0 && (
            <section className="modal-section">
              <h3>Comments ({messages.length})</h3>
              <div className="message-list">
                {messages.map((msg, i) => (
                  <div key={i} className="message-item">
                    <div className="message-header">
                      <span className="message-author">{msg.agentId}</span>
                      <span className="message-time">
                        {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="message-content">{msg.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
