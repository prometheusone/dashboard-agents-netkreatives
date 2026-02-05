import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { formatDistanceToNow } from 'date-fns'
import './AgentStatus.css'

const AGENT_EMOJIS: Record<string, string> = {
  main: '🐉',
  builder: '🔨',
  reviewer: '🔍',
  utility: '⚡',
  lead: '👑',
  dispatcher: '🎯',
}

const STATUS_COLORS: Record<string, string> = {
  idle: 'var(--accent-green)',
  working: 'var(--accent-blue)',
  blocked: 'var(--accent-red)',
  reviewing: 'var(--accent-purple)',
  offline: 'var(--text-muted)',
}

export default function AgentStatus() {
  const agents = useQuery(api.agents.getAll)
  const agentStats = useQuery(api.agents.getStats)

  // Sort agents: online first, then by status
  const sortedAgents = useMemo(() => {
    if (!agents) return []
    
    const now = Date.now()
    const FIVE_MINUTES = 5 * 60 * 1000

    return [...agents].sort((a, b) => {
      // Check if agents are online (heartbeat within 5 minutes)
      const aOnline = (now - a.lastHeartbeat) < FIVE_MINUTES && a.status !== 'offline'
      const bOnline = (now - b.lastHeartbeat) < FIVE_MINUTES && b.status !== 'offline'

      // Online agents first
      if (aOnline !== bOnline) return bOnline ? 1 : -1

      // Then sort by status priority
      const statusPriority: Record<string, number> = {
        working: 4,
        blocked: 3,
        reviewing: 2,
        idle: 1,
        offline: 0,
      }

      const aPriority = statusPriority[a.status] || 0
      const bPriority = statusPriority[b.status] || 0

      return bPriority - aPriority
    })
  }, [agents])

  if (!agents) {
    return <div className="loading">Loading agents...</div>
  }

  return (
    <div className="agent-status">
      <div className="status-header">
        <h2>🤖 Agent Status</h2>
        {agentStats && (
          <div className="status-summary">
            <StatusBadge status="online" count={agentStats.online} />
            <StatusBadge status="working" count={agentStats.working} />
            <StatusBadge status="idle" count={agentStats.idle} />
            <StatusBadge status="blocked" count={agentStats.blocked} />
          </div>
        )}
      </div>

      <div className="agent-grid">
        {sortedAgents.map(agent => (
          <AgentCard key={agent._id} agent={agent} />
        ))}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: any }) {
  const now = Date.now()
  const FIVE_MINUTES = 5 * 60 * 1000
  const isOnline = (now - agent.lastHeartbeat) < FIVE_MINUTES && agent.status !== 'offline'

  const agentType = getAgentType(agent.agentId)
  const emoji = agent.avatar || AGENT_EMOJIS[agentType] || '🤖'
  const statusColor = STATUS_COLORS[agent.status] || 'var(--text-muted)'

  return (
    <div className={`agent-card ${isOnline ? 'online' : 'offline'}`}>
      <div className="agent-card-header">
        <div className="agent-avatar" style={{ borderColor: statusColor }}>
          {emoji}
          <div 
            className="status-indicator" 
            style={{ backgroundColor: statusColor }}
          />
        </div>
        
        <div className="agent-info">
          <div className="agent-name">
            {agent.name || agent.agentId}
          </div>
          <div className="agent-role">
            {agent.role || agentType}
            {agent.level && <span className="agent-level"> • {agent.level}</span>}
          </div>
        </div>

        <div className="agent-status-badge" style={{ backgroundColor: statusColor }}>
          {agent.status}
        </div>
      </div>

      <div className="agent-card-body">
        {agent.currentTaskData ? (
          <div className="current-task">
            <div className="task-label">Current Task:</div>
            <div className="task-title">{agent.currentTaskData.title}</div>
            <div className="task-status">
              Status: <span className="task-status-value">{agent.currentTaskData.status}</span>
            </div>
          </div>
        ) : (
          <div className="no-task">
            {agent.status === 'idle' ? '💤 Idle - Waiting for tasks' : 'No active task'}
          </div>
        )}

        {agent.note && (
          <div className="agent-note">
            💭 {agent.note}
          </div>
        )}

        <div className="agent-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Last heartbeat:</span>
            <span className="metadata-value">
              {formatDistanceToNow(agent.lastHeartbeat, { addSuffix: true })}
            </span>
          </div>

          {agent.model && (
            <div className="metadata-item">
              <span className="metadata-label">Model:</span>
              <span className="metadata-value">{agent.model}</span>
            </div>
          )}

          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="metadata-item">
              <span className="metadata-label">Capabilities:</span>
              <div className="capabilities">
                {agent.capabilities.slice(0, 3).map((cap: string, i: number) => (
                  <span key={i} className="capability-tag">{cap}</span>
                ))}
                {agent.capabilities.length > 3 && (
                  <span className="capability-tag">+{agent.capabilities.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {agent.personality && (
        <div className="agent-personality">
          {agent.personality}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, count }: { status: string; count: number }) {
  const colors: Record<string, string> = {
    online: 'var(--accent-green)',
    working: 'var(--accent-blue)',
    idle: 'var(--accent-yellow)',
    blocked: 'var(--accent-red)',
  }

  return (
    <div className="status-badge">
      <span 
        className="status-dot" 
        style={{ backgroundColor: colors[status] || 'var(--text-muted)' }}
      />
      <span className="status-label">{status}:</span>
      <span className="status-count">{count}</span>
    </div>
  )
}

function getAgentType(agentId: string): string {
  if (agentId.includes('builder')) return 'builder'
  if (agentId.includes('reviewer')) return 'reviewer'
  if (agentId.includes('utility')) return 'utility'
  if (agentId.includes('lead')) return 'lead'
  if (agentId.includes('dispatcher')) return 'dispatcher'
  if (agentId.includes('main')) return 'main'
  return 'agent'
}
