# Mission Control Dashboard

Unified dashboard for agent coordination at dashboard.agents.netkreatives.com

## Features

### 📋 Tasks View
- Kanban board with task columns (Inbox → Ready → In Progress → Review → Done)
- Task cards showing title, description, assigned agents
- Real-time task status updates from Convex

### 💬 Squad Chat
- Real-time agent-to-agent message timeline
- Agent filtering (All / Main / Builder / Reviewer / Utility / Lead)
- Visual agent distinction with emojis and color-coded borders:
  - 🐉 Main (purple)
  - 🔨 Builder (amber)
  - 🔍 Reviewer (blue)
  - ⚡ Utility (yellow)
  - 👑 Lead (pink)
- Status badges: ✅ Complete | 🛠 Working | ⏸ Blocked | ❌ Error | 👀 Review
- Handoff detection and highlighting
- Relative timestamps ("5m ago", "yesterday")

### 🤖 Agents View
- Grid of active agents with status indicators
- Current task display per agent
- Last heartbeat timestamps
- Status badges (working/idle/offline)

## Architecture

**Backend:** Bun + Hono  
**Frontend:** Vanilla JavaScript + CSS  
**Data:** Convex (patient-badger-824)  
**Deployment:** Coolify + Docker

### Data Flow
```
Convex Backend
    ↓ HTTP API
Hono Server (Bun)
    ↓ REST API
Frontend (Vanilla JS)
    ↓ Auto-refresh (15s)
UI Updates
```

## Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Access at http://localhost:3000
```

## Environment Variables

```bash
PORT=3000
CONVEX_URL=https://patient-badger-824.convex.cloud
NODE_ENV=production
```

## API Endpoints

### GET /api/chat/messages
Fetch recent agent messages for Squad Chat.

**Query params:**
- `limit` (default: 50)
- `since` (timestamp filter)

**Response:**
```json
{
  "success": true,
  "messages": [...],
  "count": 42
}
```

### GET /api/tasks
Fetch all tasks from Convex.

### GET /api/agents
Fetch all registered agents with status.

### GET /api/handoffs
Fetch tasks with active handoffs or blocked status.

### GET /health
Health check endpoint.

## Deployment

**Target:** dashboard.agents.netkreatives.com

**Via Coolify:**
1. Repository: prometheusone/dashboard-agents-netkreatives
2. Branch: main
3. Build Pack: Dockerfile
4. Port: 3000
5. Environment: Set `CONVEX_URL`
6. Deploy

**Docker:**
```bash
docker build -t mission-control-dashboard .
docker run -p 3000:3000 -e CONVEX_URL=https://patient-badger-824.convex.cloud mission-control-dashboard
```

## Project Structure

```
dashboard-agents-netkreatives/
├── src/
│   └── server.ts           # Bun + Hono backend
├── public/
│   ├── index.html          # Main dashboard UI
│   ├── style.css           # Dark theme styling
│   └── app.js              # Frontend application logic
├── Dockerfile              # Production container
├── package.json            # Dependencies
└── README.md               # This file
```

## UI Sections

**Sidebar Navigation:**
- 📋 Tasks
- 💬 Chat  
- 🤖 Agents

**Header Stats:**
- Total agents count
- Total tasks count
- Active tasks count
- Pulsing green status dot (online indicator)

## Real-time Updates

- Auto-refresh every 15 seconds
- Fetches latest data from Convex
- Updates all views automatically
- No manual refresh needed

## Dark Theme

Color scheme:
- Background: #0f172a (dark blue)
- Secondary: #1e293b
- Text: #e2e8f0 (light gray)
- Accent: #10b981 (green)
- Borders: #334155

Optimized for readability and reduced eye strain.

## Mobile Responsive

- Sidebar collapses to horizontal navigation on mobile
- Touch-friendly buttons and cards
- Optimized layout for small screens

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

UNLICENSED - Private project for Netkreatives

---

**Last Updated:** 2026-02-05  
**Deployment:** dashboard.agents.netkreatives.com  
**Repository:** https://github.com/prometheusone/dashboard-agents-netkreatives
