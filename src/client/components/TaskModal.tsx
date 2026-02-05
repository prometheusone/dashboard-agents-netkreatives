import { useEffect } from 'react'
import { formatRelativeTime } from '../utils/time'

interface TaskModalProps {
  task: any
  onClose: () => void
  onUpdate: () => void
}

const AGENT_EMOJIS: Record<string, string> = {
  builder: '🔨',
  reviewer: '🔍',
  utility: '⚡',
  lead: '👑',
  main: '🐉',
}

function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{task.title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status and Priority */}
          <div className="task-detail-section">
            <h3>Status & Priority</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${task.status}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Priority:</span>
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="task-detail-section">
              <h3>Description</h3>
              <p className="task-description-full">{task.description}</p>
            </div>
          )}

          {/* Assigned Agents */}
          {task.assignedAgents && task.assignedAgents.length > 0 && (
            <div className="task-detail-section">
              <h3>Assigned Agents</h3>
              <div className="agent-list">
                {task.assignedAgents.map((agent: string) => (
                  <div key={agent} className="agent-item">
                    <span className="agent-emoji">{AGENT_EMOJIS[agent] || '🤖'}</span>
                    <span className="agent-name">{agent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="task-detail-section">
              <h3>Dependencies</h3>
              <div className="dependency-list">
                {task.dependencies.map((depId: string) => (
                  <div key={depId} className="dependency-item">
                    🔗 Task {depId.substring(0, 8)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blocked Reason */}
          {task.blockedReason && (
            <div className="task-detail-section alert-section">
              <h3>🚧 Blocked</h3>
              <p>{task.blockedReason}</p>
            </div>
          )}

          {/* Waiting On */}
          {task.waitingOn && task.waitingOn.length > 0 && (
            <div className="task-detail-section">
              <h3>Waiting On</h3>
              {task.waitingOn.map((wait: any, idx: number) => (
                <div key={idx} className="waiting-item">
                  <span className="agent-emoji">
                    {AGENT_EMOJIS[wait.agentId] || '🤖'}
                  </span>
                  <span>{wait.resource}</span>
                  <span className="time-badge">
                    {formatRelativeTime(wait.since)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Handoff Message */}
          {task.handoffMessage && (
            <div className="task-detail-section">
              <h3>💬 Handoff Message</h3>
              <p className="handoff-message">{task.handoffMessage}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="task-detail-section">
            <h3>Metadata</h3>
            <div className="metadata-grid">
              {task.createdBy && (
                <div className="metadata-item">
                  <span className="metadata-label">Created by:</span>
                  <span>{task.createdBy}</span>
                </div>
              )}
              {task.updatedAt && (
                <div className="metadata-item">
                  <span className="metadata-label">Updated:</span>
                  <span>{formatRelativeTime(task.updatedAt)}</span>
                </div>
              )}
              {task.startedAt && (
                <div className="metadata-item">
                  <span className="metadata-label">Started:</span>
                  <span>{formatRelativeTime(task.startedAt)}</span>
                </div>
              )}
              {task.completedAt && (
                <div className="metadata-item">
                  <span className="metadata-label">Completed:</span>
                  <span>{formatRelativeTime(task.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* GitHub Links */}
          {(task.githubIssue || task.githubPR) && (
            <div className="task-detail-section">
              <h3>GitHub</h3>
              <div className="github-links">
                {task.githubIssue && (
                  <a
                    href={`https://github.com/${task.repo}/issues/${task.githubIssue}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                  >
                    Issue #{task.githubIssue}
                  </a>
                )}
                {task.githubPR && (
                  <a
                    href={`https://github.com/${task.repo}/pull/${task.githubPR}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                  >
                    PR #{task.githubPR}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskModal
