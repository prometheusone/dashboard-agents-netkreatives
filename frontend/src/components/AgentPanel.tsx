import { formatDistanceToNow } from 'date-fns'
import { Agent } from '../types'
import './AgentPanel.css'

interface AgentPanelProps {
  agents: Agent[]
}

const AGENT_EMOJI_MAP: Record<string, string> = {
  'dragon': '🐉',
  'hammer': '🔨',
  'magnifier': '🔍',
  'lightning': '⚡',
  'crown': '👑',
  'robot': '🤖',
  'wizard': '🧙',
  'builder': '🔨',
  'reviewer': '🔍',
  'lead': '👑',
}

export default function AgentPanel({ agents }: AgentPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'var(--success)'
      case 'idle':
        return 'var(--text-muted)'
      case 'blocked':
        return 'var(--error)'
      default:
        return 'var(--text-muted)'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Online'
      case 'idle':
        return 'Idle'
      case 'blocked':
        return 'Blocked'
      default:
        return 'Offline'
    }
  }

  const sortedAgents = [...agents].sort((a, b) => {
    const statusOrder = { active: 0, idle: 1, blocked: 2 }
    return (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
           (statusOrder[b.status as keyof typeof statusOrder] || 3)
  })

  return (
    <div className="agent-panel">
      <div className="panel-header">
        <h2>🤖 Squad Status</h2>
        <div className="agent-count">
          <span className="count-active">
            {agents.filter(a => a.status === 'active').length}
          </span>
          <span className="count-separator">/</span>
          <span className="count-total">{agents.length}</span>
        </div>
      </div>

      <div className="agents-list">
        {sortedAgents.map(agent => (
          <div key={agent._id} className="agent-card">
            <div className="agent-info">
              <div className="agent-avatar-large">
                {agent.avatar || AGENT_EMOJI_MAP[agent.role.toLowerCase()] || '🤖'}
              </div>
              <div className="agent-details">
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role">{agent.role}</div>
              </div>
            </div>

            <div className="agent-status">
              <div 
                className="status-indicator"
                style={{ background: getStatusColor(agent.status) }}
              />
              <span className="status-label">
                {getStatusLabel(agent.status)}
              </span>
            </div>

            {agent.currentTaskId && (
              <div className="agent-task">
                <span className="task-icon">📋</span>
                <span className="task-label">Working on task</span>
              </div>
            )}

            {agent._creationTime && (
              <div className="agent-heartbeat">
                <span className="heartbeat-icon">💓</span>
                <span className="heartbeat-time">
                  {formatDistanceToNow(new Date(agent._creationTime), { addSuffix: true })}
                </span>
              </div>
            )}

            <div className="agent-actions">
              <button className="btn-action" title="View Details">
                👁️
              </button>
              <button className="btn-action" title="Assign Task">
                ➕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
