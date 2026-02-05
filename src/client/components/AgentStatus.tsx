import { useQuery } from '@tanstack/react-query'
import { formatRelativeTime } from '../utils/time'
import { fetchAgents, fetchTasks } from '../api/agents'

interface AgentStatusProps {
  searchQuery: string
}

const AGENT_CONFIG: Record<string, { emoji: string; color: string }> = {
  main: { emoji: '🐉', color: '#8b5cf6' },
  builder: { emoji: '🔨', color: '#3b82f6' },
  reviewer: { emoji: '🔍', color: '#10b981' },
  utility: { emoji: '⚡', color: '#f59e0b' },
  lead: { emoji: '👑', color: '#ef4444' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  idle: { label: 'Idle', color: '#6b7280' },
  working: { label: 'Working', color: '#10b981' },
  blocked: { label: 'Blocked', color: '#ef4444' },
  reviewing: { label: 'Reviewing', color: '#3b82f6' },
  offline: { label: 'Offline', color: '#374151' },
}

function AgentStatus({ searchQuery }: AgentStatusProps) {
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 5000, // Poll every 5 seconds
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-for-agents'],
    queryFn: fetchTasks,
    refetchInterval: 5000,
  })

  // Filter agents by search query
  const filteredAgents = agents.filter((agent: any) => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      agent.agentId?.toLowerCase().includes(searchLower) ||
      agent.name?.toLowerCase().includes(searchLower) ||
      agent.role?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate agent health (green if heartbeat within 2 minutes)
  const getAgentHealth = (lastHeartbeat: number) => {
    const now = Date.now()
    const diff = now - lastHeartbeat
    
    if (diff < 120000) return 'healthy' // < 2 minutes
    if (diff < 600000) return 'warning' // < 10 minutes
    return 'critical' // > 10 minutes
  }

  // Get current task for an agent
  const getAgentTask = (agent: any) => {
    if (!agent.currentTask) return null
    return tasks.find((t: any) => t._id === agent.currentTask)
  }

  if (loadingAgents) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading agents...
      </div>
    )
  }

  return (
    <div className="agent-status">
      <div className="status-header">
        <h2>Agent Status</h2>
        <div className="status-stats">
          <span className="stat-item">
            <span className="stat-dot online"></span>
            {agents.filter((a: any) => a.status !== 'offline').length} Online
          </span>
          <span className="stat-item">
            <span className="stat-dot working"></span>
            {agents.filter((a: any) => a.status === 'working').length} Working
          </span>
        </div>
      </div>

      <div className="agent-grid">
        {filteredAgents.map((agent: any) => {
          const config = AGENT_CONFIG[agent.agentId] || { emoji: '🤖', color: '#6b7280' }
          const statusConfig = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline
          const health = getAgentHealth(agent.lastHeartbeat)
          const currentTask = getAgentTask(agent)

          return (
            <div key={agent._id} className={`agent-card status-${agent.status}`}>
              {/* Agent Header */}
              <div className="agent-card-header">
                <div
                  className="agent-avatar-large"
                  style={{ backgroundColor: config.color }}
                >
                  {config.emoji}
                </div>
                <div className="agent-info">
                  <h3 className="agent-name">
                    {agent.name || agent.agentId}
                  </h3>
                  <div className="agent-role">
                    {agent.role || 'Agent'} • {agent.level || 'specialist'}
                  </div>
                </div>
                <div className={`health-indicator health-${health}`} title="Health status">
                  ●
                </div>
              </div>

              {/* Status Badge */}
              <div className="agent-status-badge">
                <span
                  className="status-dot"
                  style={{ backgroundColor: statusConfig.color }}
                ></span>
                <span className="status-label">{statusConfig.label}</span>
              </div>

              {/* Current Task */}
              {currentTask ? (
                <div className="current-task">
                  <div className="current-task-label">Current Task:</div>
                  <div className="current-task-title">{currentTask.title}</div>
                  <div className="current-task-meta">
                    <span className={`priority-badge priority-${currentTask.priority}`}>
                      {currentTask.priority}
                    </span>
                    <span className="task-status">
                      {currentTask.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="current-task empty">
                  <div className="current-task-label">No active task</div>
                </div>
              )}

              {/* Heartbeat */}
              <div className="agent-heartbeat">
                <span className="heartbeat-label">Last heartbeat:</span>
                <span className="heartbeat-time">
                  {formatRelativeTime(agent.lastHeartbeat)}
                </span>
              </div>

              {/* Capabilities */}
              {agent.capabilities && agent.capabilities.length > 0 && (
                <div className="agent-capabilities">
                  {agent.capabilities.slice(0, 3).map((cap: string) => (
                    <span key={cap} className="capability-badge">
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="capability-badge">
                      +{agent.capabilities.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Note */}
              {agent.note && (
                <div className="agent-note">
                  💬 {agent.note}
                </div>
              )}

              {/* Actions */}
              <div className="agent-actions">
                <button className="btn-icon" title="Assign task">
                  📋
                </button>
                <button className="btn-icon" title="Send message">
                  💬
                </button>
                <button className="btn-icon" title="View details">
                  ℹ️
                </button>
              </div>
            </div>
          )
        })}

        {filteredAgents.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🤖</span>
            <p>No agents found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentStatus
