import { useQuery } from '@tanstack/react-query'
import { formatRelativeTime, formatFullTime } from '../utils/time'
import { fetchLogs } from '../api/logs'

interface SquadChatProps {
  searchQuery: string
}

const AGENT_CONFIG: Record<string, { emoji: string; color: string; name: string }> = {
  main: { emoji: '🐉', color: '#8b5cf6', name: 'Main Agent' },
  builder: { emoji: '🔨', color: '#3b82f6', name: 'Builder' },
  reviewer: { emoji: '🔍', color: '#10b981', name: 'Reviewer' },
  utility: { emoji: '⚡', color: '#f59e0b', name: 'Utility' },
  lead: { emoji: '👑', color: '#ef4444', name: 'Lead' },
  dashboard: { emoji: '📊', color: '#6b7280', name: 'Dashboard' },
}

function SquadChat({ searchQuery }: SquadChatProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => fetchLogs(200),
    refetchInterval: 3000, // Poll every 3 seconds
  })

  // Filter logs by search query
  const filteredLogs = logs.filter((log: any) => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      log.action?.toLowerCase().includes(searchLower) ||
      log.detail?.toLowerCase().includes(searchLower) ||
      log.agentId?.toLowerCase().includes(searchLower)
    )
  })

  // Group logs by day
  const groupedLogs = filteredLogs.reduce((acc: any, log: any) => {
    const date = new Date(log.timestamp).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading messages...
      </div>
    )
  }

  return (
    <div className="squad-chat">
      <div className="chat-header">
        <h2>Squad Chat Timeline</h2>
        <div className="chat-stats">
          {filteredLogs.length} message{filteredLogs.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="chat-timeline">
        {Object.entries(groupedLogs).map(([date, dayLogs]: [string, any]) => (
          <div key={date} className="timeline-day">
            <div className="day-separator">
              <span className="day-label">{formatDayLabel(date)}</span>
            </div>

            {dayLogs.map((log: any) => {
              const agentConfig = AGENT_CONFIG[log.agentId] || {
                emoji: '🤖',
                color: '#6b7280',
                name: log.agentId,
              }

              const isHandoff = log.action?.includes('handoff') || log.action?.includes('waiting')
              const isStatus = log.action?.includes('status') || log.action?.includes('heartbeat')
              const isError = log.action?.includes('error') || log.action?.includes('failed')

              return (
                <div
                  key={`${log.timestamp}-${log.agentId}`}
                  className={`chat-message ${isHandoff ? 'handoff' : ''} ${isError ? 'error' : ''}`}
                >
                  <div
                    className="agent-avatar"
                    style={{ backgroundColor: agentConfig.color }}
                    title={agentConfig.name}
                  >
                    {agentConfig.emoji}
                  </div>

                  <div className="message-content">
                    <div className="message-header">
                      <span className="agent-name" style={{ color: agentConfig.color }}>
                        {agentConfig.name}
                      </span>
                      <span className="message-time">
                        {formatFullTime(log.timestamp)}
                      </span>
                    </div>

                    <div className="message-body">
                      <strong>{log.action}</strong>
                      {log.detail && (
                        <div className="message-detail">
                          {highlightMentions(log.detail)}
                        </div>
                      )}
                    </div>

                    {log.taskId && (
                      <div className="message-meta">
                        <span className="task-link">
                          📋 Task {log.taskId.substring(0, 8)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>No messages yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper to format day labels
function formatDayLabel(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  if (dateString === today) return 'Today'
  if (dateString === yesterday) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper to highlight @mentions
function highlightMentions(text: string): JSX.Element {
  const parts = text.split(/(@\w+)/g)
  
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

export default SquadChat
