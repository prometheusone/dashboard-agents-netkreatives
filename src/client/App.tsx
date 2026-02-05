import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import TasksView from './components/TasksView'
import SquadChat from './components/SquadChat'
import AgentStatus from './components/AgentStatus'
import { useWebSocket } from './hooks/useWebSocket'

type View = 'tasks' | 'chat' | 'agents'

function App() {
  const [activeView, setActiveView] = useState<View>('tasks')
  const [searchQuery, setSearchQuery] = useState('')
  const { connected, lastMessage } = useWebSocket()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // / for search
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
      // 1, 2, 3 for view switching
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === '1') setActiveView('tasks')
        if (e.key === '2') setActiveView('chat')
        if (e.key === '3') setActiveView('agents')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            🎯 Mission Control
          </h1>
          <div className="header-actions">
            <input
              id="search-input"
              type="text"
              placeholder="Search (press /)"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? '● Live' : '○ Offline'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeView === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveView('tasks')}
          >
            <span className="nav-icon">📋</span>
            Tasks
            <span className="keyboard-hint">1</span>
          </button>
          <button
            className={`nav-tab ${activeView === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveView('chat')}
          >
            <span className="nav-icon">💬</span>
            Squad Chat
            <span className="keyboard-hint">2</span>
          </button>
          <button
            className={`nav-tab ${activeView === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveView('agents')}
          >
            <span className="nav-icon">🤖</span>
            Agents
            <span className="keyboard-hint">3</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeView === 'tasks' && <TasksView searchQuery={searchQuery} />}
        {activeView === 'chat' && <SquadChat searchQuery={searchQuery} />}
        {activeView === 'agents' && <AgentStatus searchQuery={searchQuery} />}
      </main>
    </div>
  )
}

export default App
