import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { formatDistanceToNow } from 'date-fns'
import './SquadChat.css'

const AGENT_EMOJIS: Record<string, string> = {
  main: '🐉',
  builder: '🔨',
  reviewer: '🔍',
  utility: '⚡',
  lead: '👑',
  dispatcher: '🎯',
}

const AGENT_COLORS: Record<string, string> = {
  main: 'var(--accent-purple)',
  builder: 'var(--accent-blue)',
  reviewer: 'var(--accent-green)',
  utility: 'var(--accent-yellow)',
  lead: '#f97316',
  dispatcher: '#ec4899',
}

export default function SquadChat() {
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const logs = useQuery(api.logs.list, { limit: 100 })
  const agents = useQuery(api.agents.list)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  // Detect manual scroll
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100
      setAutoScroll(isAtBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  if (!logs) {
    return <div className="loading">Loading chat...</div>
  }

  // Create agent lookup
  const agentMap = new Map(agents?.map(a => [a.agentId, a]) || [])

  // Filter logs
  const filteredLogs = filter
    ? logs.filter(log => 
        log.agentId.toLowerCase().includes(filter.toLowerCase()) ||
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.detail?.toLowerCase().includes(filter.toLowerCase())
      )
    : logs

  // Reverse to show newest at bottom
  const sortedLogs = [...filteredLogs].reverse()

  return (
    <div className="squad-chat">
      <div className="chat-header">
        <div className="chat-title">
          <h2>💬 Squad Chat</h2>
          <span className="message-count">{sortedLogs.length} messages</span>
        </div>

        <div className="chat-controls">
          <input
            type="text"
            placeholder="Filter messages..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="chat-search"
          />
          <label className="auto-scroll-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
        </div>
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        <div className="chat-messages">
          {sortedLogs.map((log, index) => {
            const agent = agentMap.get(log.agentId)
            const agentType = getAgentType(log.agentId)
            const isHandoff = log.action.includes('handoff') || log.action.includes('assigned')
            const isStatusUpdate = log.action.includes('status') || log.action.includes('update')

            return (
              <ChatMessage
                key={`${log._id}-${index}`}
                log={log}
                agent={agent}
                agentType={agentType}
                isHandoff={isHandoff}
                isStatusUpdate={isStatusUpdate}
              />
            )
          })}
          <div ref={chatEndRef} />
        </div>
      </div>

      {!autoScroll && (
        <button 
          className="scroll-to-bottom"
          onClick={() => {
            setAutoScroll(true)
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          ↓ Jump to latest
        </button>
      )}
    </div>
  )
}

function ChatMessage({ log, agent, agentType, isHandoff, isStatusUpdate }: {
  log: any
  agent: any
  agentType: string
  isHandoff: boolean
  isStatusUpdate: boolean
}) {
  const emoji = AGENT_EMOJIS[agentType] || '🤖'
  const color = AGENT_COLORS[agentType] || 'var(--text-secondary)'
  const agentName = agent?.name || log.agentId

  const messageClass = `chat-message ${isHandoff ? 'handoff' : ''} ${isStatusUpdate ? 'status-update' : ''}`

  return (
    <div className={messageClass}>
      <div className="message-avatar" style={{ backgroundColor: color }}>
        {emoji}
      </div>

      <div className="message-content">
        <div className="message-header">
          <span className="message-author" style={{ color }}>
            {agentName}
          </span>
          <span className="message-action">{formatAction(log.action)}</span>
          <span className="message-time">
            {formatDistanceToNow(log.timestamp, { addSuffix: true })}
          </span>
        </div>

        {log.detail && (
          <div className="message-detail">
            {parseMessageDetail(log.detail)}
          </div>
        )}

        {isHandoff && (
          <div className="handoff-indicator">
            🔄 Task Handoff
          </div>
        )}
      </div>
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
  return 'main'
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

function parseMessageDetail(detail: string): React.ReactNode {
  // Parse @mentions
  const parts = detail.split(/(@\w+)/g)
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="mention">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
