import { formatDistanceToNow } from 'date-fns'
import './AgentPanel.css'

interface Agent {
  _id: string
  agentId: string
  name?: string
  role?: string
  status: string
  currentTask?: string
  lastHeartbeat: number
  model?: string
}

interface Task {
  _id: string
  title: string
}

interface AgentPanelProps {
  agents: Agent[]
  tasks: Task[]
}

export default function AgentPanel({ agents, tasks }: AgentPanelProps) {
  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return null
    const task = tasks.find(t => t._id === taskId)
    return task?.title
  }
  
  const getStatusIcon = (status: string) => {
    const icons = {
      idle: '💤',
      working: '🔨',
      blocked: '🚧',
      reviewing: '👀',
      offline: '💀'
    }
    return icons[status as keyof typeof icons] || '❓'
  }
  
  const sortedAgents = [...agents].sort((a, b) => {
    // Online agents first
    if (a.status === 'offline' && b.status !== 'offline') return 1
    if (a.status !== 'offline' && b.status === 'offline') return -1
    // Then by last heartbeat (most recent first)
    return b.lastHeartbeat - a.lastHeartbeat
  })
  
  const onlineCount = agents.filter(a => a.status !== 'offline').length
  
  return (
    <div className="agent-panel">
      <div className="panel-header">
        <h2>🤖 Agents</h2>
        <div className="agent-count-badge">
          <span className="count-online">{onlineCount}</span>
          <span className="count-separator">/</span>
          <span className="count-total">{agents.length}</span>
        </div>
      </div>
      
      <div className="agent-list">
        {sortedAgents.map(agent => {
          const isOffline = agent.status === 'offline'
          const heartbeatAge = Date.now() - agent.lastHeartbeat
          const isStale = heartbeatAge > 60000 // More than 1 minute
          
          return (
            <div 
              key={agent._id} 
              className={`agent-card ${agent.status} ${isStale ? 'stale' : ''}`}
            >
              <div className="agent-card-header">
                <div className="agent-info">
                  <div className="agent-name-row">
                    <span className="status-icon">{getStatusIcon(agent.status)}</span>
                    <span className="agent-name">
                      {agent.name || agent.agentId}
                    </span>
                  </div>
                  {agent.role && (
                    <span className="agent-role">{agent.role}</span>
                  )}
                </div>
                
                <span className={`status-badge ${agent.status}`}>
                  {agent.status}
                </span>
              </div>
              
              {agent.currentTask && (
                <div className="agent-current-task">
                  <span className="task-label">Task:</span>
                  <span className="task-title">
                    {getTaskTitle(agent.currentTask) || 'Unknown'}
                  </span>
                </div>
              )}
              
              <div className="agent-meta">
                {agent.model && (
                  <span className="meta-item model">
                    🧠 {agent.model}
                  </span>
                )}
                <span className={`meta-item heartbeat ${isStale ? 'stale' : ''}`}>
                  ❤️ {formatDistanceToNow(agent.lastHeartbeat, { addSuffix: true })}
                </span>
              </div>
            </div>
          )
        })}
        
        {agents.length === 0 && (
          <div className="empty-agents">
            <p>No agents online</p>
            <span className="text-xs text-tertiary">
              Agents will appear here when they connect
            </span>
          </div>
        )}
      </div>
      
      <div className="panel-footer">
        <button className="add-agent-button">
          + New Agent
        </button>
      </div>
    </div>
  )
}
