import { useDroppable } from '@dnd-kit/core'
import './TaskColumn.css'

interface TaskColumnProps {
  id: string
  title: string
  color: string
  count: number
  children: React.ReactNode
}

export default function TaskColumn({ id, title, color, count, children }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div 
      ref={setNodeRef}
      className={`task-column ${isOver ? 'drag-over' : ''}`}
      style={{ borderTopColor: color }}
    >
      <div className="column-header">
        <h3>{title}</h3>
        <span className="count-badge" style={{ background: color }}>
          {count}
        </span>
      </div>
      <div className="column-content">
        {children}
      </div>
    </div>
  )
}
