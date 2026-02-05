import { useState, useEffect } from 'react'
import Header from './components/Header'
import TaskBoard from './components/TaskBoard'
import ChatTimeline from './components/ChatTimeline'
import AgentPanel from './components/AgentPanel'
import { useConvex } from './hooks/useConvex'
import { useWebSocket } from './hooks/useWebSocket'
import './App.css'

function App() {
  const { tasks, agents, activities, loading, error, refreshData } = useConvex()
  const { connected, sendMessage } = useWebSocket('ws://localhost:3000/ws')
  const [activeView, setActiveView] = useState<'all' | 'tasks' | 'chat' | 'agents'>('all')

  useEffect(() => {
    // Refresh data every 10 seconds as fallback
    const interval = setInterval(refreshData, 10000)
    return () => clearInterval(interval)
  }, [refreshData])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--text-secondary)'
      }}>
        <div className="animate-pulse">Loading Mission Control...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <div style={{ color: 'var(--error)' }}>Error: {error}</div>
        <button onClick={refreshData} style={{
          padding: '0.5rem 1rem',
          background: 'var(--info)',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          cursor: 'pointer'
        }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <Header 
        connected={connected}
        activeView={activeView}
        setActiveView={setActiveView}
        agentCount={agents.filter(a => a.status === 'active').length}
        totalAgents={agents.length}
        taskCount={tasks.filter(t => t.status !== 'done' && t.status !== 'archived').length}
      />
      
      <div className="main-content">
        {(activeView === 'all' || activeView === 'agents') && (
          <AgentPanel agents={agents} />
        )}
        
        {(activeView === 'all' || activeView === 'tasks') && (
          <TaskBoard 
            tasks={tasks} 
            agents={agents}
            onRefresh={refreshData}
          />
        )}
        
        {(activeView === 'all' || activeView === 'chat') && (
          <ChatTimeline 
            activities={activities}
            agents={agents}
          />
        )}
      </div>
    </div>
  )
}

export default App
