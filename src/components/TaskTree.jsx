// src/components/TaskTree.jsx
import React, { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragOverlay,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeChildrenOf,
  setProperty,
} from "../utils/tree-utils";
import TaskRow from "./TaskRow";

export default function TaskTree({
  tasks,
  setTasks,
  onTextChange,
  onToggleDone,
  onAddBelow,
  onAddChild,
  onArchive,
}) {
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  // 1) Flatten and remove collapsed branches
  const flattened = useMemo(() => {
    const flat = flattenTree(tasks);
    const collapsedIds = flat.reduce((acc, { id, children, collapsed }) => {
      return collapsed && children.length ? acc.concat(id) : acc;
    }, []);
    return removeChildrenOf(
      flat,
      activeId ? [activeId, ...collapsedIds] : collapsedIds
    );
  }, [tasks, activeId]);

  // 2) Compute projected drop position (depth + parentId)
  const projected =
    activeId && overId
      ? getProjection(
          flattened,
          activeId,
          overId,
          offsetLeft,
          /* indentationWidth */ 20
        )
      : null;

  // Sensors: start drag after 5px movement
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragMove={({ delta }) => setOffsetLeft(delta.x)}
      onDragOver={({ over }) => setOverId(over?.id ?? null)}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        setOverId(null);
        setOffsetLeft(0);

        if (projected && over) {
          const cloned = JSON.parse(JSON.stringify(flattened));
          const oldIndex = cloned.findIndex((i) => i.id === active.id);
          // reassign depth & parent
          cloned[oldIndex] = {
            ...cloned[oldIndex],
            depth: projected.depth,
            parentId: projected.parentId,
          };
          const newIndex = cloned.findIndex((i) => i.id === over.id);
          // move in list
          const moved = [
            ...cloned.slice(0, oldIndex),
            ...cloned.slice(oldIndex + 1),
          ];
          moved.splice(newIndex, 0, cloned[oldIndex]);
          // rebuild tree
          const tree = buildTree(moved);
          setTasks(tree);
        }
      }}
      onDragCancel={() => {
        setActiveId(null);
        setOverId(null);
        setOffsetLeft(0);
      }}
      dropAnimation={{ ...defaultDropAnimation, dragSourceOpacity: 0.5 }}
    >
      <SortableContext
        items={flattened.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-1">
          {flattened.map(({ id, depth, children, collapsed }) => (
            <SortableItem
              key={id}
              id={id}
              tasks={tasks}
              depth={id === activeId && projected ? projected.depth : depth}
              collapsed={Boolean(collapsed && children.length)}
              onToggleCollapse={() =>
                setTasks((items) =>
                  setProperty(items, id, "collapsed", (v) => !v)
                )
              }
              onTextChange={onTextChange}
              onToggleDone={onToggleDone}
              onAddBelow={onAddBelow}
              onAddChild={onAddChild}
              onArchive={onArchive}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-lg rounded p-2">
            {tasks.find((t) => t.id === activeId)?.name || "…"}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableItem({
  id,
  tasks,
  depth,
  collapsed,
  onToggleCollapse,
  onTextChange,
  onToggleDone,
  onAddBelow,
  onAddChild,
  onArchive,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // you can expose the CSS variable for the demo’s blue bar indicator:
    "--spacing": `${depth * 20}px`,
  };

  const task = tasks.find((t) => t.id === id);

  return (
    <li ref={setNodeRef} style={style}>
      <TaskRow
        task={task}
        depth={depth}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        onTextChange={onTextChange}
        onToggleDone={onToggleDone}
        onAddBelow={onAddBelow}
        onAddChild={onAddChild}
        onArchive={onArchive}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </li>
  );
}
