import { formatDistanceToNow } from 'date-fns'
import './Header.css'

interface HeaderProps {
  connected: boolean
  activeView: 'all' | 'tasks' | 'chat' | 'agents'
  setActiveView: (view: 'all' | 'tasks' | 'chat' | 'agents') => void
  agentCount: number
  totalAgents: number
  taskCount: number
}

export default function Header({ 
  connected, 
  activeView, 
  setActiveView,
  agentCount,
  totalAgents,
  taskCount
}: HeaderProps) {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  })
  const dateString = now.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase()

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="diamond-icon">💎</span>
          <span className="logo-text">MISSION CONTROL</span>
        </div>
        <div className="project-badge">Dashboard</div>
      </div>

      <div className="header-center">
        <div className="view-switcher">
          <button 
            className={activeView === 'all' ? 'active' : ''}
            onClick={() => setActiveView('all')}
          >
            All
          </button>
          <button 
            className={activeView === 'agents' ? 'active' : ''}
            onClick={() => setActiveView('agents')}
          >
            Agents
          </button>
          <button 
            className={activeView === 'tasks' ? 'active' : ''}
            onClick={() => setActiveView('tasks')}
          >
            Tasks
          </button>
          <button 
            className={activeView === 'chat' ? 'active' : ''}
            onClick={() => setActiveView('chat')}
          >
            Activity
          </button>
        </div>
      </div>

      <div className="header-right">
        <div className="kpi">
          <div className="kpi-value">{agentCount}/{totalAgents}</div>
          <div className="kpi-label">Agents Active</div>
        </div>
        <div className="kpi">
          <div className="kpi-value">{taskCount}</div>
          <div className="kpi-label">Tasks Queue</div>
        </div>
        <div className="clock">
          <div className="clock-time">{timeString}</div>
          <div className="clock-date">{dateString}</div>
        </div>
        <div className={`status-indicator ${connected ? 'online' : 'offline'}`}>
          <div className="status-dot"></div>
          <span>{connected ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  )
}
