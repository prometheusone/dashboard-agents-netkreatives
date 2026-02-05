# Mission Control UI

**The unified dashboard for agent tasks, squad chat, and agent status.**

Live at: `https://dashboard.agents.netkreatives.com`

## Features

### 🎯 Three Main Views

1. **Tasks (Kanban Board)**
   - Four columns: Ready | In Progress | Blocked | Complete
   - Drag-and-drop task management
   - Filter by agent, priority, status
   - Click tasks for detailed modal view
   - Visual dependency indicators
   - Real-time updates

2. **Squad Chat (Timeline)**
   - Chronological agent messages
   - Visual agent distinction (emojis + colors)
   - Handoff notifications highlighted
   - @mention detection
   - Grouped by day
   - Real-time WebSocket updates

3. **Agent Status**
   - Online/offline status
   - Current task display
   - Last heartbeat time
   - Agent health metrics (green/yellow/red)
   - Quick actions (assign task, send message, view details)
   - Agent capabilities badges

### ⌨️ Keyboard Shortcuts

- `/` - Focus search
- `1` - Switch to Tasks view
- `2` - Switch to Squad Chat view
- `3` - Switch to Agent Status view
- `Esc` - Close modal

### 🎨 Design Principles

- **Dark theme** - Easy on the eyes, consistent with existing agent sites
- **Real-time updates** - WebSocket connections, not polling
- **Mobile responsive** - Works on all screen sizes
- **Fast performance** - <100ms interactions
- **Clean & minimal** - No clutter, important info prominent

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **@tanstack/react-query** - Data fetching & caching
- **@dnd-kit** - Drag-and-drop for Kanban board
- **WebSocket** - Real-time updates

### Backend
- **Bun** - JavaScript runtime
- **Hono** - Web framework
- **Convex** - Backend database & real-time sync
  - Deployment: `beaming-basilisk-326.convex.cloud`
  - Tables: `tasks`, `agents`, `logs`, `messages`

## Development

### Prerequisites
- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Convex deployment key

### Setup

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env and add your CONVEX_DEPLOY_KEY

# Run development server
bun run dev          # Backend (port 3000)
bun run dev:client   # Frontend (port 5173)
```

### Build

```bash
# Build for production
bun run build

# Run production build
bun run start
```

### Docker

```bash
# Build image
docker build -t mission-control-ui .

# Run container
docker run -p 3000:3000 \
  -e CONVEX_DEPLOYMENT=beaming-basilisk-326 \
  -e CONVEX_DEPLOY_KEY=your_key_here \
  mission-control-ui
```

## Deployment

Deployed via Coolify to `dashboard.agents.netkreatives.com`

- **Coolify UUID:** `tgwo840og04kgwwso44k8w0g`
- **GitHub Repo:** `prometheusone/dashboard-agents-netkreatives`
- **Auto-deploy:** Push to `main` branch triggers deployment

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?status=ready` - Get tasks by status
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks/:id/status` - Update task status

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get single agent

### Logs
- `GET /api/logs?limit=100` - Get recent logs

### Health
- `GET /api/health` - Health check

## Data Sources

All data comes from Convex backend:

- **Tasks table** - All task data with status, priority, assignments
- **Agents table** - Agent status, heartbeats, current tasks
- **Logs table** - Agent activity messages
- **Messages table** - Task-specific messages (future use)

## Project Structure

```
dashboard-agents-netkreatives/
├── src/
│   ├── client/                 # Frontend code
│   │   ├── components/         # React components
│   │   │   ├── TasksView.tsx   # Kanban board
│   │   │   ├── TaskColumn.tsx  # Kanban column
│   │   │   ├── TaskCard.tsx    # Task card
│   │   │   ├── TaskModal.tsx   # Task detail modal
│   │   │   ├── SquadChat.tsx   # Chat timeline
│   │   │   └── AgentStatus.tsx # Agent status grid
│   │   ├── api/                # API functions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── styles/             # CSS styles
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   └── server/                 # Backend code
│       ├── routes/             # API routes
│       └── index.ts            # Server entry
├── index.html                  # HTML template
├── vite.config.ts              # Vite config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── Dockerfile                  # Docker build
└── README.md                   # This file
```

## Future Enhancements

- [ ] Task creation/editing from UI
- [ ] Direct messaging between agents
- [ ] Notification system
- [ ] Advanced filtering (by tags, date range)
- [ ] Export tasks to CSV/JSON
- [ ] Dark/light theme toggle
- [ ] Audio alerts for critical events
- [ ] Task analytics dashboard
- [ ] Agent performance metrics

## Support

For issues or questions, contact Kurt or create an issue in the GitHub repo.

---

Built with ❤️ for the Netkreatives agent squad
