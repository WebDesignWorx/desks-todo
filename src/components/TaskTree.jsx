import TaskRow from './TaskRow';
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy,
  arrayMove, defaultAnimateLayoutChanges,
} from '@dnd-kit/sortable';

/* wrapper to inject dnd‑kit props */
function SortableWrapper(props) {
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
    <TaskRow
      {...props}               /* spreads onToggleDone and everything else */
      setNodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      transform={transform}
      transition={transition}
    />
  );
}

export default function TaskTree({
  tasks,
  setTasks,
  onTextChange,
  onToggleDone,
  onAddBelow,
  onAddChild,
  onArchive,
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  /* build nested list */
  const tree = (parent = null, depth = 0) =>
    tasks
      .filter((t) => t.parent_id === parent && !t.archived)
      .map((t) => ({
        ...t,
        depth,
        children: tree(t.id, depth + 1),
      }));

  const flatIds = tasks.filter((t) => !t.archived).map((t) => t.id);

  const render = (list) =>
    list.map((t) => (
      <div key={t.id} className="group">
        <SortableWrapper
          task={t}
          depth={t.depth}
          onTextChange={onTextChange}  
          onToggleDone={onToggleDone}   
          onToggleDone={onToggleDone}
          onAddBelow={onAddBelow}
          onAddChild={onAddChild}
          onArchive={onArchive}
        />
        {t.children.length > 0 && render(t.children)}
      </div>
    ));

  const onDragEnd = ({ active, over, delta }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = flatIds.indexOf(active.id);
    const newIdx = flatIds.indexOf(over.id);
    let next = arrayMove(tasks, oldIdx, newIdx);

    const moving = next.find((t) => t.id === active.id);
    const overTask = next.find((t) => t.id === over.id);

    if (delta.x > 20) moving.parent_id = overTask.id;
    if (delta.x < -20) moving.parent_id = overTask.parent_id ?? null;

    setTasks(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
        {render(tree())}
      </SortableContext>
    </DndContext>
  );
}
