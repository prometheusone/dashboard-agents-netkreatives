import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || 'https://patient-badger-824.convex.cloud'
const convex = new ConvexHttpClient(CONVEX_URL)

const app = new Hono()

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Main dashboard
app.get('/', async (c) => {
  const file = Bun.file('./public/index.html')
  return new Response(file, {
    headers: { 'Content-Type': 'text/html' }
  })
})

// API routes
app.get('/api/chat/messages', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const since = parseInt(c.req.query('since') || '0')
    
    const messages = await convex.query('logs:list', { limit, since })
    
    return c.json({ 
      success: true, 
      messages: messages || [],
      count: messages?.length || 0
    })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

app.get('/api/tasks', async (c) => {
  try {
    const tasks = await convex.query('tasks:list', {})
    
    return c.json({ 
      success: true, 
      tasks: tasks || []
    })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

app.get('/api/agents', async (c) => {
  try {
    const agents = await convex.query('agents:list', {})
    
    return c.json({ 
      success: true, 
      agents: agents || []
    })
  } catch (error) {
    console.error('Failed to fetch agents:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

app.get('/api/handoffs', async (c) => {
  try {
    const tasks = await convex.query('tasks:listHandoffs', {})
    
    return c.json({ 
      success: true, 
      tasks: tasks || []
    })
  } catch (error) {
    console.error('Failed to fetch handoffs:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500)
  }
})

// Health check
app.get('/health', (c) => c.json({ 
  status: 'healthy',
  timestamp: Date.now(),
  convex: CONVEX_URL
}))

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch
}

console.log(`🚀 Mission Control Dashboard running on port ${process.env.PORT || 3000}`)
