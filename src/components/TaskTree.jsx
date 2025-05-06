import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Level from './Level';

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

  /* build nested tree */
  const makeTree = (parent = null, depth = 0) =>
    tasks
      .filter((t) => t.parent_id === parent && !t.archived)
      .sort((a, b) => a.position - b.position)
      .map((t) => ({
        ...t,
        depth,
        children: makeTree(t.id, depth + 1),
      }));

  const tree = makeTree();

  const onDragEnd = ({ active, over, delta }) => {
    if (!over) return;

    const updated = [...tasks];           // start from current tasks

    const moving = updated.find((t) => t.id === active.id);
    const target = updated.find((t) => t.id === over.id);
    if (!moving || !target) return;

    /* horizontal indent / out‑dent ------------- */
    if (delta.x > 20) moving.parent_id = target.id;
    if (delta.x < -20) moving.parent_id = target.parent_id ?? null;

    /* sibling re‑order ------------------------- */
    const siblings = updated
      .filter((t) => t.parent_id === moving.parent_id && !t.archived)
      .sort((a, b) => a.position - b.position);
    const oldIdx = siblings.findIndex((s) => s.id === moving.id);
    const newIdx = siblings.findIndex((s) => s.id === target.id);
    const reordered = arrayMove(siblings, oldIdx, newIdx);
    reordered.forEach((t, i) => (t.position = i + 1));

    setTasks(updated);      // ✅ pass the *array* to persist


  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <Level
          list={tree}
          depth={0}
          callbacks={{
            onTextChange,
            onToggleDone,
            onAddBelow,
            onAddChild,
            onArchive,
          }}
        />

    </DndContext>
  );
}
