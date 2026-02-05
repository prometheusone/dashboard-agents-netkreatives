import { Hono } from 'hono'
import { serve } from 'bun'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { streamSSE } from 'hono/streaming'
import { WebSocketServer } from 'ws'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readdir, stat } from 'fs/promises'
import { watch } from 'fs'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import path from 'path'

const execAsync = promisify(exec)
const HOME = process.env.HOME || '/Users/kurtbijl'

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

// ============================================
// LIVE TASK STREAMING
// ============================================

// Find the latest session file for an agent
async function findLatestSession(agentId: string): Promise<string | null> {
  const sessionsDir = path.join(HOME, `.openclaw/agents/${agentId}/sessions`)

  try {
    const files = await readdir(sessionsDir)
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))

    if (jsonlFiles.length === 0) return null

    // Find most recently modified
    let latestFile = ''
    let latestMtime = 0

    for (const file of jsonlFiles) {
      const filePath = path.join(sessionsDir, file)
      const stats = await stat(filePath)
      if (stats.mtimeMs > latestMtime) {
        latestMtime = stats.mtimeMs
        latestFile = filePath
      }
    }

    return latestFile
  } catch (error) {
    console.error(`Error finding sessions for ${agentId}:`, error)
    return null
  }
}

// Parse a JSONL line into a human-readable event
function parseSessionLine(line: string): { type: string; text: string; timestamp?: string } | null {
  try {
    const data = JSON.parse(line)

    // Session start
    if (data.type === 'session') {
      return { type: 'start', text: `Session started`, timestamp: data.timestamp }
    }

    // User message (task assignment)
    if (data.type === 'message' && data.message?.role === 'user') {
      const content = data.message.content?.[0]?.text || ''
      if (content.includes('TASK ID:')) {
        const match = content.match(/TITLE: (.+?)(?:\n|$)/)
        return { type: 'task', text: `Assigned: ${match?.[1] || 'Task'}`, timestamp: data.timestamp }
      }
      return { type: 'user', text: content.substring(0, 100), timestamp: data.timestamp }
    }

    // Tool calls
    if (data.type === 'message' && data.message?.role === 'assistant') {
      const content = data.message.content || []
      for (const block of content) {
        if (block.type === 'tool_use') {
          const name = block.name
          const input = block.input || {}

          // Format based on tool type
          if (name === 'read') {
            return { type: 'tool', text: `📖 Reading: ${input.file_path?.split('/').slice(-2).join('/')}`, timestamp: data.timestamp }
          }
          if (name === 'write') {
            return { type: 'tool', text: `✏️ Writing: ${input.file_path?.split('/').slice(-2).join('/')}`, timestamp: data.timestamp }
          }
          if (name === 'bash') {
            const cmd = input.command?.substring(0, 60) || ''
            return { type: 'tool', text: `💻 ${cmd}${input.command?.length > 60 ? '...' : ''}`, timestamp: data.timestamp }
          }
          if (name === 'glob' || name === 'grep') {
            return { type: 'tool', text: `🔍 Searching: ${input.pattern || input.query}`, timestamp: data.timestamp }
          }
          return { type: 'tool', text: `🔧 ${name}`, timestamp: data.timestamp }
        }

        // Thinking
        if (block.type === 'thinking') {
          const thought = block.thinking?.substring(0, 80) || ''
          return { type: 'thinking', text: `🤔 ${thought}...`, timestamp: data.timestamp }
        }

        // Text output (agent speaking)
        if (block.type === 'text' && block.text) {
          // Skip if it's just whitespace
          if (block.text.trim().length < 5) continue
          const text = block.text.substring(0, 100)
          return { type: 'output', text: `💬 ${text}${block.text.length > 100 ? '...' : ''}`, timestamp: data.timestamp }
        }
      }
    }

    // Tool results
    if (data.type === 'message' && data.message?.role === 'toolResult') {
      if (data.message.isError) {
        return { type: 'error', text: `❌ Tool error`, timestamp: data.timestamp }
      }
      // Skip successful tool results (too verbose)
      return null
    }

    return null
  } catch (error) {
    return null
  }
}

// Stream task logs via SSE
app.get('/api/tasks/:id/stream', async (c) => {
  const taskId = c.req.param('id')

  try {
    // Get task details from Convex
    const task = await convexQuery('tasks:get', { taskId })

    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const agentId = task.assignedAgents?.[0]
    if (!agentId) {
      return c.json({ error: 'No agent assigned to this task' }, 400)
    }

    // Find the agent's latest session
    const sessionFile = await findLatestSession(agentId)
    if (!sessionFile) {
      return c.json({ error: `No session found for agent ${agentId}` }, 404)
    }

    // Stream the session file via SSE
    return streamSSE(c, async (stream) => {
      // Send initial info
      await stream.writeSSE({
        event: 'info',
        data: JSON.stringify({
          taskId,
          taskTitle: task.title,
          agentId,
          sessionFile: sessionFile.split('/').pop(),
          status: task.status
        })
      })

      // Read existing lines first
      const fileStream = createReadStream(sessionFile, { encoding: 'utf-8' })
      const rl = createInterface({ input: fileStream })

      const seenEvents = new Set<string>()

      for await (const line of rl) {
        const event = parseSessionLine(line)
        if (event) {
          const key = `${event.type}:${event.text}`
          if (!seenEvents.has(key)) {
            seenEvents.add(key)
            await stream.writeSSE({
              event: event.type,
              data: JSON.stringify(event)
            })
          }
        }
      }

      // Now watch for new lines
      let lastSize = (await stat(sessionFile)).size

      const watcher = watch(sessionFile, async (eventType) => {
        if (eventType === 'change') {
          try {
            const currentSize = (await stat(sessionFile)).size
            if (currentSize > lastSize) {
              // Read new content
              const newStream = createReadStream(sessionFile, {
                encoding: 'utf-8',
                start: lastSize
              })
              const newRl = createInterface({ input: newStream })

              for await (const line of newRl) {
                const event = parseSessionLine(line)
                if (event) {
                  const key = `${event.type}:${event.text}`
                  if (!seenEvents.has(key)) {
                    seenEvents.add(key)
                    await stream.writeSSE({
                      event: event.type,
                      data: JSON.stringify(event)
                    })
                  }
                }
              }

              lastSize = currentSize
            }
          } catch (error) {
            // File might have been rotated
          }
        }
      })

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(async () => {
        try {
          await stream.writeSSE({ event: 'heartbeat', data: '' })
        } catch {
          clearInterval(heartbeat)
          watcher.close()
        }
      }, 5000)

      // Clean up on close
      stream.onAbort(() => {
        clearInterval(heartbeat)
        watcher.close()
      })

      // Keep the stream open
      await new Promise(() => {})
    })
  } catch (error) {
    console.error('Stream error:', error)
    return c.json({ error: 'Failed to stream task logs' }, 500)
  }
})

// Get task details with live session info
app.get('/api/tasks/:id/live', async (c) => {
  const taskId = c.req.param('id')

  try {
    const task = await convexQuery('tasks:get', { taskId })
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const agentId = task.assignedAgents?.[0]
    let sessionInfo = null

    if (agentId) {
      const sessionFile = await findLatestSession(agentId)
      if (sessionFile) {
        const stats = await stat(sessionFile)
        sessionInfo = {
          agentId,
          sessionFile: sessionFile.split('/').pop(),
          lastModified: stats.mtime.toISOString(),
          sizeKB: Math.round(stats.size / 1024)
        }
      }
    }

    return c.json({
      ...task,
      sessionInfo,
      streamUrl: `/api/tasks/${taskId}/stream`
    })
  } catch (error) {
    return c.json({ error: 'Failed to get task' }, 500)
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
