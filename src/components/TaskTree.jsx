import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  defaultAnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef } from 'react';

/* ---------- Single row ---------- */
function Row({
  task,
  depth,
  onText,
  onEnter,
  onTab,
  setNodeRef,
  attributes,
  listeners,
  transform,
  transition,
}) {
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: depth * 24,
  };
  const inputRef = useRef();
  useEffect(() => {
    if (!task.name && inputRef.current) inputRef.current.focus();
  }, [task.name]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="task-row mb-1"
    >
      <span className="task-handle mr-2">☰</span>
      <input
        ref={inputRef}
        className="task-input flex-1 bg-transparent"
        value={task.name}
        onChange={(e) => onText(task.id, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter(task.id);
          }
          if (e.key === 'Tab') {
            e.preventDefault();
            onTab(task.id);
          }
        }}
      />
    </div>
  );
}

/* ---------- Sortable wrapper ---------- */
function SortableRow(props) {
  const { task } = props;
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });

  return (
    <Row
      {...props}
      setNodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      transform={transform}
      transition={transition}
    />
  );
}

/* ---------- Main tree ---------- */
export default function TaskTree({
  tasks,
  setTasks,
  onTextChange,
  onAddBelow,
  onAddChild,
}) {
  /* sensors */
  const sensors = useSensors(useSensor(PointerSensor));

  /* build nested structure */
  const buildTree = (parent = null, depth = 0) =>
    tasks
      .filter((t) => t.parent_id === parent)
      .map((t) => ({
        ...t,
        depth,
        children: buildTree(t.id, depth + 1),
      }));

  const tree = buildTree();
  const flatIds = tasks.map((t) => t.id);

  const render = (list) =>
    list.map((t) => (
      <div key={t.id}>
        <SortableRow
          task={t}
          depth={t.depth}
          onText={onTextChange}
          onEnter={onAddBelow}
          onTab={onAddChild}
        />
        {t.children?.length > 0 && render(t.children)}
      </div>
    ));

  /* on drag end with simple indent logic */
  const onDragEnd = ({ active, over, delta }) => {
    if (!over || active.id === over.id) return;

    /* reorder flat list */
    const oldIdx = flatIds.indexOf(active.id);
    const newIdx = flatIds.indexOf(over.id);
    let next = arrayMove(tasks, oldIdx, newIdx);

    /* indent / outdent */
    const moving = next.find((t) => t.id === active.id);
    const overTask = next.find((t) => t.id === over.id);

    if (delta.x > 20) {
      /* indent under overTask */
      moving.parent_id = overTask.id;
    } else if (delta.x < -20 && moving.parent_id) {
      /* un‑indent one level */
      const parent = next.find((t) => t.id === moving.parent_id);
      moving.parent_id = parent ? parent.parent_id : null;
    }

    setTasks(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
        <div className="task-tree">{render(tree)}</div>
      </SortableContext>
    </DndContext>
  );
}
