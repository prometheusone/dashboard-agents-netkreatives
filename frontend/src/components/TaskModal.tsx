import { useState, useEffect } from 'react'
import { Task, Agent } from '../types'
import { formatDistanceToNow } from 'date-fns'
import './TaskModal.css'

interface TaskModalProps {
  task: Task
  agents: Agent[]
  onClose: () => void
  onRefresh: () => void
}

export default function TaskModal({ task, agents, onClose, onRefresh }: TaskModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const assignedAgents = task.assigneeIds
    ?.map(id => agents.find(a => a._id === id))
    .filter(Boolean) as Agent[]

  const statusColors: Record<string, string> = {
    inbox: '#8B92B2',
    assigned: '#8B92B2',
    in_progress: '#3B82F6',
    review: '#8B5CF6',
    blocked: '#F59E0B',
    done: '#10B981',
    archived: '#5A607A',
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{task.title}</h2>
            <div className="modal-meta">
              <span 
                className="status-badge"
                style={{ background: statusColors[task.status] }}
              >
                {task.status.replace('_', ' ')}
              </span>
              {task._creationTime && (
                <span className="time-created">
                  Created {formatDistanceToNow(new Date(task._creationTime), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={activeTab === 'activity' ? 'active' : ''}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'details' && (
            <div className="task-details">
              <div className="detail-section">
                <h3>Description</h3>
                <p>{task.description || 'No description provided.'}</p>
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="detail-section">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {task.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Assigned Agents</h3>
                <div className="agents-list">
                  {assignedAgents && assignedAgents.length > 0 ? (
                    assignedAgents.map(agent => (
                      <div key={agent._id} className="agent-item">
                        <span className="agent-avatar">{agent.avatar}</span>
                        <span className="agent-name">{agent.name}</span>
                        <span className="agent-role">{agent.role}</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No agents assigned</p>
                  )}
                </div>
              </div>

              {task.openclawRunId && (
                <div className="detail-section">
                  <h3>OpenClaw Run</h3>
                  <code className="run-id">{task.openclawRunId}</code>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="task-activity">
              <p className="empty-state">Activity timeline coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
