import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import Header from './components/Header'
import TaskBoard from './components/TaskBoard'
import SquadChat from './components/SquadChat'
import AgentPanel from './components/AgentPanel'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState<'board' | 'chat' | 'both'>('both')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  
  // Real-time data subscriptions
  const tasks = useQuery(api.tasks.list) || []
  const agents = useQuery(api.agents.list) || []
  const messages = useQuery(api.messages.listRecent, { limit: 100 }) || []
  
  const handleTaskSelect = (taskId: string | null) => {
    setSelectedTaskId(taskId)
    if (taskId && activeView === 'board') {
      setActiveView('both')
    }
  }

  return (
    <div className="app">
      <Header 
        activeView={activeView}
        onViewChange={setActiveView}
        taskCount={tasks.length}
        agentCount={agents.filter(a => a.status !== 'offline').length}
      />
      
      <div className={`main-layout layout-${activeView}`}>
        {/* Agent Status Panel - Always visible on desktop */}
        <aside className="agent-sidebar">
          <AgentPanel 
            agents={agents}
            tasks={tasks}
          />
        </aside>
        
        {/* Task Board */}
        {(activeView === 'board' || activeView === 'both') && (
          <main className="task-board-container">
            <TaskBoard 
              tasks={tasks}
              onTaskSelect={handleTaskSelect}
              selectedTaskId={selectedTaskId}
            />
          </main>
        )}
        
        {/* Squad Chat */}
        {(activeView === 'chat' || activeView === 'both') && (
          <aside className="chat-container">
            <SquadChat 
              messages={messages}
              tasks={tasks}
              agents={agents}
              selectedTaskId={selectedTaskId}
              onTaskSelect={handleTaskSelect}
            />
          </aside>
        )}
      </div>
    </div>
  )
}

export default App
