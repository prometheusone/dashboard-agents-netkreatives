import { useState, useEffect } from 'react'
import './Header.css'

interface HeaderProps {
  activeView: 'board' | 'chat' | 'both'
  onViewChange: (view: 'board' | 'chat' | 'both') => void
  taskCount: number
  agentCount: number
}

export default function Header({ activeView, onViewChange, taskCount, agentCount }: HeaderProps) {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">💎</span>
          <h1>MISSION CONTROL</h1>
        </div>
        <div className="project-badge">Netkreatives</div>
      </div>
      
      <div className="header-center">
        <div className="view-switcher">
          <button 
            className={activeView === 'board' ? 'active' : ''}
            onClick={() => onViewChange('board')}
            title="Tasks Board"
          >
            📋 Tasks
          </button>
          <button 
            className={activeView === 'chat' ? 'active' : ''}
            onClick={() => onViewChange('chat')}
            title="Squad Chat"
          >
            💬 Chat
          </button>
          <button 
            className={activeView === 'both' ? 'active' : ''}
            onClick={() => onViewChange('both')}
            title="Unified View"
          >
            🎯 Both
          </button>
        </div>
      </div>
      
      <div className="header-right">
        <div className="stat-pill">
          <span className="stat-value">{agentCount}</span>
          <span className="stat-label">Agents Online</span>
        </div>
        <div className="stat-pill">
          <span className="stat-value">{taskCount}</span>
          <span className="stat-label">Tasks</span>
        </div>
        <div className="clock">
          <div className="time">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
          <div className="date">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        </div>
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">ONLINE</span>
        </div>
      </div>
    </header>
  )
}
