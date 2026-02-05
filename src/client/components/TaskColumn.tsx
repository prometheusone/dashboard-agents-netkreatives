import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

interface TaskColumnProps {
  id: string
  title: string
  icon: string
  tasks: any[]
  onTaskClick: (task: any) => void
}

function TaskColumn({ id, title, icon, tasks, onTaskClick }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`task-column ${isOver ? 'drag-over' : ''}`}
    >
      <div className="column-header">
        <span className="column-icon">{icon}</span>
        <h3 className="column-title">{title}</h3>
        <span className="task-count-badge">{tasks.length}</span>
      </div>

      <div className="column-content">
        {tasks.length === 0 ? (
          <div className="empty-column">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default TaskColumn
