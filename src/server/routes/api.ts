import { Hono } from 'hono'
import { ConvexHttpClient } from 'convex/browser'

const app = new Hono()

// Initialize Convex client
const convex = new ConvexHttpClient(
  process.env.CONVEX_DEPLOYMENT 
    ? `https://${process.env.CONVEX_DEPLOYMENT}.convex.cloud`
    : 'https://beaming-basilisk-326.convex.cloud'
)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

// Get all tasks
app.get('/tasks', async (c) => {
  try {
    const status = c.req.query('status')
    const tasks = await convex.query('tasks:list' as any, status ? { status } : {})
    return c.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return c.json({ error: 'Failed to fetch tasks' }, 500)
  }
})

// Get task by ID
app.get('/tasks/:id', async (c) => {
  try {
    const taskId = c.req.param('id')
    const task = await convex.query('tasks:get' as any, { taskId })
    return c.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return c.json({ error: 'Failed to fetch task' }, 500)
  }
})

// Get all agents
app.get('/agents', async (c) => {
  try {
    const agents = await convex.query('agents:list' as any, {})
    return c.json(agents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return c.json({ error: 'Failed to fetch agents' }, 500)
  }
})

// Get agent by ID
app.get('/agents/:id', async (c) => {
  try {
    const agentId = c.req.param('id')
    const agent = await convex.query('agents:getByAgentId' as any, { agentId })
    return c.json(agent)
  } catch (error) {
    console.error('Error fetching agent:', error)
    return c.json({ error: 'Failed to fetch agent' }, 500)
  }
})

// Get logs
app.get('/logs', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100')
    const logs = await convex.query('logs:recent' as any, { limit })
    return c.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return c.json({ error: 'Failed to fetch logs' }, 500)
  }
})

// Get messages for a task
app.get('/messages/:taskId', async (c) => {
  try {
    const taskId = c.req.param('taskId')
    const messages = await convex.query('messages:list' as any, { taskId })
    return c.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// Update task status
app.post('/tasks/:id/status', async (c) => {
  try {
    const taskId = c.req.param('id')
    const { status, agentId } = await c.req.json()
    
    await convex.mutation('tasks:updateStatus' as any, {
      taskId,
      newStatus: status,
      agentId: agentId || 'dashboard'
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error updating task status:', error)
    return c.json({ error: 'Failed to update task status' }, 500)
  }
})

export { app as apiRoutes }
