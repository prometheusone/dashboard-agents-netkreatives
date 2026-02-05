import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskColumn from './TaskColumn'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import { Task, Agent } from '../types'
import './TaskBoard.css'

interface TaskBoardProps {
  tasks: Task[]
  agents: Agent[]
  onRefresh: () => void
}

const COLUMNS = [
  { id: 'inbox', title: 'Ready', color: '#8B92B2' },
  { id: 'in_progress', title: 'In Progress', color: '#3B82F6' },
  { id: 'review', title: 'Blocked', color: '#F59E0B' },
  { id: 'done', title: 'Complete', color: '#10B981' },
]

export default function TaskBoard({ tasks, agents, onRefresh }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => {
      if (status === 'inbox') return t.status === 'inbox' || t.status === 'assigned'
      if (status === 'review') return t.status === 'review' || t.status === 'blocked'
      return t.status === status
    }).filter(t => t.status !== 'archived')
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const taskId = active.id as string
    const newStatus = over.id as string

    // TODO: Update task status via API
    console.log(`Moving task ${taskId} to ${newStatus}`)
    
    // Optimistic update would go here
    onRefresh()
  }

  return (
    <div className="task-board">
      <div className="board-header">
        <h2>📋 Mission Queue</h2>
        <button className="btn-primary" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {COLUMNS.map(column => {
            const columnTasks = getTasksByStatus(column.id)
            return (
              <TaskColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                count={columnTasks.length}
              >
                <SortableContext
                  items={columnTasks.map(t => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      agents={agents}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                </SortableContext>
              </TaskColumn>
            )
          })}
        </div>
      </DndContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          agents={agents}
          onClose={() => setSelectedTask(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}
