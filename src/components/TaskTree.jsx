import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import TaskRow from './TaskRow';
import InsertionIndicator from './InsertionIndicator';
import {
  buildTree,
  flatten,
  getProjection,
  removeNode,
  insertNode,
} from '../utils/tree-helpers';

export default function TaskTree({ tasks, setTasks, ...rowHandlers }) {
  /* build nested → flat */
  const tree = useMemo(() => buildTree(tasks), [tasks]);
  const flat = useMemo(() => flatten(tree), [tree]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const [activeId, setActiveId] = useState(null);
  const [deltaX, setDeltaX] = useState(0);

  const proj = (overId) =>
    activeId ? getProjection(flat, activeId, overId, deltaX) : null;

  const onDragStart = ({ active }) => setActiveId(active.id);
  const onDragMove = ({ delta }) => setDeltaX(delta.x);

  const onDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      const projection = proj(over.id);
      if (projection) {
        /* yank + insert */
        const { removed, tree: without } = removeNode(tree, active.id);
        const siblingPos = projection.parentId
          ? without.find((n) => n.id === projection.parentId).children.length
          : without.length;
        removed.parent_id = projection.parentId;
        removed.position = siblingPos;
        const withInserted = insertNode(
          without,
          projection.parentId,
          removed,
          siblingPos
        );
        /* flatten back to DB-ready structure */
        setTasks(
          flatten(withInserted).map((n) => ({
            id: n.id,
            desk_id: n.desk_id,
            name: n.name,
            parent_id: n.parentId,
            position: n.position,
            done: n.done,
            archived: n.archived,
            collapsed: n.collapsed,
          }))
        );
      }
    }
    setActiveId(null);
    setDeltaX(0);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={flat.map((n) => n.id)} strategy={rectSortingStrategy}>
        <ul>
          {flat.map((n) => (
            <SortableNode
              key={n.id}
              node={n}
              projected={proj(n.id)}
              {...rowHandlers}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="px-2 py-1 bg-white border rounded shadow">
            {flat.find((n) => n.id === activeId)?.name || '…'}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/* single sortable row */
function SortableNode({ node, projected, ...rowHandlers }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="relative">
      <InsertionIndicator projected={projected} />
      <TaskRow
        task={node}
        depth={projected ? projected.depth : node.depth}
        dragAttributes={attributes}
        dragListeners={listeners}
        {...rowHandlers}
      />
    </li>
  );
}
