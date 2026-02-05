export interface Agent {
  _id: string
  _creationTime?: number
  name: string
  role: string
  status: 'idle' | 'active' | 'blocked'
  level: 'LEAD' | 'INT' | 'SPC'
  avatar: string
  currentTaskId?: string
  sessionKey?: string
  systemPrompt?: string
  character?: string
  lore?: string
}

export interface Task {
  _id: string
  _creationTime?: number
  title: string
  description: string
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done' | 'archived' | 'blocked'
  assigneeIds?: string[]
  tags?: string[]
  borderColor?: string
  sessionKey?: string
  openclawRunId?: string
  startedAt?: number
  usedCodingTools?: boolean
  lastMessageTime?: number | null
}

export interface Activity {
  _id: string
  _creationTime?: number
  type: string
  agentId: string
  message: string
  targetId?: string
  agentName?: string
}

export interface Message {
  _id: string
  _creationTime?: number
  taskId: string
  fromAgentId: string
  content: string
  attachments?: string[]
  agentName?: string
  agentAvatar?: string
}
