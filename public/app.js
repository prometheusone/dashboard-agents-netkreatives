// Mission Control Dashboard - Main Application
class MissionControl {
  constructor() {
    this.currentView = 'tasks'
    this.currentFilter = 'all'
    this.data = {
      tasks: [],
      messages: [],
      agents: [],
      handoffs: []
    }
    
    this.init()
  }
  
  async init() {
    this.setupNavigation()
    this.setupFilters()
    await this.loadData()
    this.startAutoRefresh()
  }
  
  // Navigation
  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view
        this.switchView(view)
      })
    })
  }
  
  switchView(view) {
    this.currentView = view
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view)
    })
    
    // Update views
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === `${view}View`)
    })
    
    // Render appropriate content
    this.renderCurrentView()
  }
  
  // Filters
  setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = btn.dataset.filter
        this.currentFilter = filter
        
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.filter === filter)
        })
        
        this.renderChat()
      })
    })
  }
  
  // Data Loading
  async loadData() {
    try {
      await Promise.all([
        this.loadTasks(),
        this.loadMessages(),
        this.loadAgents()
      ])
      
      this.updateHeaderStats()
      this.renderCurrentView()
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }
  
  async loadTasks() {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    if (data.success) {
      this.data.tasks = data.tasks
    }
  }
  
  async loadMessages() {
    const res = await fetch('/api/chat/messages?limit=50')
    const data = await res.json()
    if (data.success) {
      this.data.messages = data.messages
    }
  }
  
  async loadAgents() {
    const res = await fetch('/api/agents')
    const data = await res.json()
    if (data.success) {
      this.data.agents = data.agents
    }
  }
  
  // Auto Refresh
  startAutoRefresh() {
    setInterval(() => {
      this.loadData()
    }, 15000) // Every 15 seconds
  }
  
  // Rendering
  renderCurrentView() {
    switch (this.currentView) {
      case 'tasks':
        this.renderTasks()
        break
      case 'chat':
        this.renderChat()
        break
      case 'agents':
        this.renderAgents()
        break
    }
  }
  
  updateHeaderStats() {
    const activeAgents = this.data.agents.filter(a => a.status !== 'offline').length
    const activeTasks = this.data.tasks.filter(t => t.status === 'in_progress').length
    
    document.getElementById('headerStats').innerHTML = `
      <div class="stat">
        <span class="stat-value">${this.data.agents.length}</span>
        <span class="stat-label">AGENTS</span>
      </div>
      <div class="stat">
        <span class="stat-value">${this.data.tasks.length}</span>
        <span class="stat-label">TASKS</span>
      </div>
      <div class="stat">
        <span class="stat-value">${activeTasks}</span>
        <span class="stat-label">ACTIVE</span>
      </div>
    `
  }
  
  renderTasks() {
    const board = document.getElementById('taskBoard')
    
    const statuses = [
      { key: 'inbox', label: 'Inbox' },
      { key: 'ready', label: 'Ready' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'review', label: 'Review' },
      { key: 'done', label: 'Done' }
    ]
    
    board.innerHTML = statuses.map(status => {
      const tasks = this.data.tasks.filter(t => t.status === status.key)
      
      return `
        <div class="task-column">
          <h3>${status.label} (${tasks.length})</h3>
          ${tasks.map(task => `
            <div class="task-card">
              <h4>${this.escapeHtml(task.title)}</h4>
              <p>${this.escapeHtml(task.description || '')}</p>
              ${task.assignedAgents ? `<p style="margin-top:0.5rem;font-size:0.75rem;color:var(--accent)">→ ${task.assignedAgents.join(', ')}</p>` : ''}
            </div>
          `).join('')}
        </div>
      `
    }).join('')
  }
  
  renderChat() {
    const timeline = document.getElementById('chatTimeline')
    
    // Filter messages
    let filtered = this.data.messages
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(msg => {
        const role = this.getAgentRole(msg.agentId)
        return role === this.currentFilter
      })
    }
    
    if (filtered.length === 0) {
      timeline.innerHTML = `
        <div class="loading">
          <div style="font-size:4rem;margin-bottom:1rem;opacity:0.5">💬</div>
          <p>No messages yet</p>
        </div>
      `
      return
    }
    
    timeline.innerHTML = filtered.map(msg => {
      const role = this.getAgentRole(msg.agentId)
      const emoji = this.getAgentEmoji(role)
      const badge = this.getStatusBadge(msg.action)
      const handoff = this.extractHandoff(msg.detail)
      
      return `
        <div class="chat-message">
          <div class="message-header">
            <div class="agent-avatar ${role}">${emoji}</div>
            <div class="message-meta">
              <div class="agent-name">${this.escapeHtml(msg.agentId)}</div>
              <div class="message-time">${this.formatRelativeTime(msg.timestamp)}</div>
            </div>
            ${badge ? `<span class="status-badge ${badge.class}">${badge.emoji} ${badge.label}</span>` : ''}
          </div>
          <div class="message-content">
            <div class="message-action">${this.formatAction(msg.action)}</div>
            ${msg.detail ? `<div class="message-detail">${this.escapeHtml(msg.detail)}</div>` : ''}
            ${handoff ? `<div class="handoff-notice"><strong>Handoff:</strong> ${this.escapeHtml(handoff)}</div>` : ''}
          </div>
        </div>
      `
    }).join('')
  }
  
  renderAgents() {
    const grid = document.getElementById('agentGrid')
    
    if (this.data.agents.length === 0) {
      grid.innerHTML = `
        <div class="loading">
          <p>No agents online</p>
        </div>
      `
      return
    }
    
    grid.innerHTML = this.data.agents.map(agent => {
      const role = this.getAgentRole(agent.agentId)
      const emoji = this.getAgentEmoji(role)
      
      return `
        <div class="agent-card">
          <div class="agent-header">
            <div class="agent-avatar ${role}">${emoji}</div>
            <div class="agent-info">
              <h3>${this.escapeHtml(agent.agentId)}</h3>
              <span class="agent-status ${agent.status}">${agent.status}</span>
            </div>
          </div>
          ${agent.note ? `<div class="agent-task">${this.escapeHtml(agent.note)}</div>` : ''}
          <div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:0.5rem">
            Last seen: ${this.formatRelativeTime(agent.lastHeartbeat)}
          </div>
        </div>
      `
    }).join('')
  }
  
  // Utility Functions
  getAgentRole(agentId) {
    const roles = ['main', 'builder', 'reviewer', 'utility', 'lead']
    for (const role of roles) {
      if (agentId.includes(role)) return role
    }
    return 'default'
  }
  
  getAgentEmoji(role) {
    const emojis = {
      main: '🐉',
      builder: '🔨',
      reviewer: '🔍',
      utility: '⚡',
      lead: '👑',
      default: '🤖'
    }
    return emojis[role] || emojis.default
  }
  
  getStatusBadge(action) {
    const lower = action.toLowerCase()
    
    if (lower.includes('complete') || lower.includes('done') || lower.includes('merged')) {
      return { emoji: '✅', label: 'Complete', class: 'success' }
    }
    if (lower.includes('start') || lower.includes('begin') || lower.includes('claimed')) {
      return { emoji: '🛠', label: 'Working', class: 'info' }
    }
    if (lower.includes('block') || lower.includes('wait')) {
      return { emoji: '⏸', label: 'Blocked', class: 'warning' }
    }
    if (lower.includes('error') || lower.includes('fail')) {
      return { emoji: '❌', label: 'Error', class: 'error' }
    }
    if (lower.includes('review')) {
      return { emoji: '👀', label: 'Review', class: 'info' }
    }
    
    return null
  }
  
  extractHandoff(detail) {
    if (!detail) return null
    
    const match = detail.match(/(?:handoff|waiting on|needs|→)\s*@?(\w+)/i)
    if (match) return detail
    
    return null
  }
  
  formatAction(action) {
    return action
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  formatRelativeTime(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    
    const days = Math.floor(seconds / 86400)
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days}d ago`
    
    return new Date(timestamp).toLocaleDateString()
  }
  
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.missionControl = new MissionControl()
  })
} else {
  window.missionControl = new MissionControl()
}
