import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { apiRoutes } from './routes/api'

const app = new Hono()

// CORS for development
app.use('/*', cors())

// API routes
app.route('/api', apiRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist/client' }))
  app.get('*', serveStatic({ path: './dist/client/index.html' }))
}

// WebSocket upgrade handler
const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch: app.fetch,
  websocket: {
    open(ws) {
      console.log('WebSocket client connected')
      ws.subscribe('mission-control')
    },
    message(ws, message) {
      // Echo messages to all subscribed clients
      server.publish('mission-control', message)
    },
    close(ws) {
      console.log('WebSocket client disconnected')
    },
  },
})

console.log(`🚀 Mission Control server running on http://localhost:${server.port}`)

export default app
