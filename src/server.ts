import { Hono } from 'hono'
import { serve } from 'bun'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { WebSocketServer } from 'ws'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const app = new Hono()

// CORS middleware
app.use('*', cors())

// Serve static frontend files
app.use('/*', serveStatic({ root: './frontend/dist' }))

// Convex CLI wrapper function
async function convexQuery(functionName: string, args: any = {}) {
  try {
    const argsJson = JSON.stringify(args)
    const command = `cd ~/mission-control-convex && export CONVEX_DEPLOY_KEY='dev:beaming-basilisk-326|eyJ2MiI6ImZhYWI5MzU5MDVmODQwZDI5OGNlMzAzNjhhOGIwYjY0In0=' && /opt/homebrew/bin/npx convex run ${functionName} '${argsJson}'`
    
    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        CONVEX_DEPLOY_KEY: 'dev:beaming-basilisk-326|eyJ2MiI6ImZhYWI5MzU5MDVmODQwZDI5OGNlMzAzNjhhOGIwYjY0In0='
      }
    })

    if (stderr && !stderr.includes('Deprecation')) {
      console.error('Convex stderr:', stderr)
    }

    // Parse the output (Convex CLI returns JSON)
    const result = JSON.parse(stdout)
    return result
  } catch (error) {
    console.error(`Convex query error (${functionName}):`, error)
    throw error
  }
}

// API Routes
app.get('/api/agents', async (c) => {
  try {
    const agents = await convexQuery('queries:listAgents', {})
    return c.json(agents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return c.json({ error: 'Failed to fetch agents' }, 500)
  }
})

app.get('/api/tasks', async (c) => {
  try {
    const tasks = await convexQuery('queries:listTasks', {})
    return c.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return c.json({ error: 'Failed to fetch tasks' }, 500)
  }
})

app.get('/api/activities', async (c) => {
  try {
    const activities = await convexQuery('queries:listActivities', {})
    return c.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return c.json({ error: 'Failed to fetch activities' }, 500)
  }
})

app.get('/api/tasks/:id/messages', async (c) => {
  try {
    const taskId = c.req.param('id')
    const messages = await convexQuery('queries:listMessages', { taskId })
    return c.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start HTTP server
const port = process.env.PORT || 3000
const server = serve({
  port,
  fetch: app.fetch,
  websocket: {
    message(ws, message) {
      console.log('WebSocket message:', message)
      // Broadcast to all clients
      server.publish('mission-control', message)
    },
    open(ws) {
      console.log('WebSocket client connected')
      ws.subscribe('mission-control')
      ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to Mission Control' }))
    },
    close(ws) {
      console.log('WebSocket client disconnected')
    },
  },
})

console.log(`🚀 Mission Control Dashboard running on http://localhost:${port}`)
console.log(`🔌 WebSocket available at ws://localhost:${port}/ws`)
