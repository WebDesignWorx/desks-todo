import { useSortable } from '@dnd-kit/sortable';
import TaskRow from './TaskRow';

export default function SortableWrapper(props) {
  const { task, depth } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition
  };

  return (
    <TaskRow
      {...props}
      setDragRef={setNodeRef}
      dragAttributes={attributes}
      dragListeners={listeners}
      style={style}
      className={`sortable-item ${isDragging ? 'dragging' : ''}`}
      depth={depth}
    />
  );
}

