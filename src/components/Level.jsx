// src/components/Level.jsx
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskRow from './TaskRow';

function SortableWrapper({ task, depth, ...callbacks }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({ id: task.id });

  return (
    <TaskRow
       task={task}
       depth={depth}
       {...callbacks}
       setDragRef={setNodeRef}
       dragAttributes={attributes}
       dragListeners={listeners}
       transform={transform}
       transition={transition}
     />
  );
}

export default function Level({ list, depth, callbacks }) {
  const ids = list.map((t) => t.id);

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      {list.map((t) => (
        <div key={t.id}>
          <SortableWrapper task={t} depth={depth} {...callbacks} />
          {t.children.length > 0 && (
            <Level
              list={t.children}
              depth={depth + 1}
              callbacks={callbacks}
            />
          )}
        </div>
      ))}
    </SortableContext>
  );
}

