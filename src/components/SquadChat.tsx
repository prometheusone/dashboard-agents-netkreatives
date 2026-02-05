import { useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import './SquadChat.css'

interface Message {
  _id: string
  taskId: string
  agentId: string
  content: string
  timestamp: number
}

interface Task {
  _id: string
  title: string
  status: string
}

interface Agent {
  agentId: string
  name?: string
  status: string
}

interface SquadChatProps {
  messages: Message[]
  tasks: Task[]
  agents: Agent[]
  selectedTaskId: string | null
  onTaskSelect: (taskId: string) => void
}

export default function SquadChat({ messages, tasks, agents, selectedTaskId, onTaskSelect }: SquadChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const getAgentStatus = (agentId: string) => {
    const agent = agents.find(a => a.agentId === agentId)
    return agent?.status || 'offline'
  }
  
  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId)
    return task?.title || 'Unknown Task'
  }
  
  const parseMentions = (content: string) => {
    const parts = content.split(/(@[\w-]+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="mention">
            {part}
          </span>
        )
      }
      return part
    })
  }
  
  const getAgentColor = (agentId: string) => {
    // Generate consistent color for each agent
    let hash = 0
    for (let i = 0; i < agentId.length; i++) {
      hash = agentId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash % 360)
    return `hsl(${hue}, 60%, 60%)`
  }
  
  const filteredMessages = selectedTaskId
    ? messages.filter(m => m.taskId === selectedTaskId)
    : messages
  
  return (
    <div className="squad-chat">
      <div className="chat-header">
        <h2>💬 Squad Chat</h2>
        {selectedTaskId && (
          <div className="chat-filter">
            <span className="filter-label">Filtered by task</span>
            <button 
              className="clear-filter"
              onClick={() => onTaskSelect(null as any)}
              title="Show all messages"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      
      <div className="chat-messages">
        {filteredMessages.length === 0 && (
          <div className="empty-chat">
            <p>No messages yet</p>
            <span className="text-sm text-secondary">
              Messages will appear here as agents communicate
            </span>
          </div>
        )}
        
        {filteredMessages.map((message, i) => {
          const isHandoff = message.content.includes('handoff') || 
                           message.content.includes('waiting on') ||
                           message.content.includes('blocked')
          const status = getAgentStatus(message.agentId)
          
          return (
            <div key={message._id} className={`chat-message ${isHandoff ? 'handoff' : ''}`}>
              <div className="message-avatar-wrapper">
                <div 
                  className="message-avatar"
                  style={{ background: getAgentColor(message.agentId) }}
                >
                  {message.agentId.substring(0, 2).toUpperCase()}
                </div>
                <span className={`agent-status-dot ${status}`}></span>
              </div>
              
              <div className="message-content-wrapper">
                <div className="message-header-inline">
                  <span className="message-agent">{message.agentId}</span>
                  <span className="message-time">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </span>
                </div>
                
                <div className="message-task-link" onClick={() => onTaskSelect(message.taskId)}>
                  on: {getTaskTitle(message.taskId)}
                </div>
                
                <p className="message-text">
                  {parseMentions(message.content)}
                </p>
                
                {isHandoff && (
                  <div className="handoff-badge">
                    🤝 Handoff
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-footer">
        <p className="text-xs text-tertiary">
          Real-time agent communication • {filteredMessages.length} messages
        </p>
      </div>
    </div>
  )
}
