import { formatDistanceToNow } from 'date-fns'
import { Activity, Agent } from '../types'
import './ChatTimeline.css'

interface ChatTimelineProps {
  activities: Activity[]
  agents: Agent[]
}

export default function ChatTimeline({ activities, agents }: ChatTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return '🔄'
      case 'assignees_update':
        return '👥'
      case 'task_update':
        return '✏️'
      case 'message':
        return '💬'
      case 'document_created':
        return '📄'
      case 'handoff':
        return '🤝'
      default:
        return '📌'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'status_update':
        return 'var(--info)'
      case 'assignees_update':
        return 'var(--purple)'
      case 'task_update':
        return 'var(--warning)'
      case 'message':
        return 'var(--text-secondary)'
      case 'document_created':
        return 'var(--success)'
      case 'handoff':
        return 'var(--error)'
      default:
        return 'var(--text-muted)'
    }
  }

  const parseMessage = (message: string) => {
    // Detect @mentions
    const mentionRegex = /@(\w+)/g
    const parts = message.split(mentionRegex)
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return (
          <span key={index} className="mention">
            @{part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="chat-timeline">
      <div className="timeline-header">
        <h2>⚡ Activity Feed</h2>
        <div className="activity-count">{activities.length}</div>
      </div>

      <div className="timeline-content">
        {activities.length === 0 ? (
          <div className="empty-timeline">
            <div className="empty-icon">📭</div>
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map(activity => {
            const agent = agents.find(a => a._id === activity.agentId)
            
            return (
              <div 
                key={activity._id} 
                className={`activity-item ${activity.type === 'handoff' ? 'highlight' : ''}`}
              >
                <div 
                  className="activity-icon"
                  style={{ background: getActivityColor(activity.type) }}
                >
                  {getActivityIcon(activity.type)}
                </div>

                <div className="activity-content">
                  <div className="activity-header">
                    <span className="agent-badge">
                      {agent?.avatar || '🤖'} {agent?.name || 'Unknown Agent'}
                    </span>
                    <span className="activity-time">
                      {activity._creationTime && 
                        formatDistanceToNow(new Date(activity._creationTime), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="activity-message">
                    {parseMessage(activity.message)}
                  </div>

                  {activity.type === 'handoff' && (
                    <div className="handoff-badge">
                      🤝 Task Handoff
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
