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

  // 1) flatten + hide collapsed sub-trees
  const flattened = useMemo(() => {
    const flat = flattenTree(tasks);
    const collapsedIds = flat.reduce((ids, { id, children, collapsed }) => {
      return collapsed && children.length ? [...ids, id] : ids;
    }, []);
    return removeChildrenOf(
      flat,
      activeId ? [activeId, ...collapsedIds] : collapsedIds
    );
  }, [tasks, activeId]);

  // 2) compute where a drop would land
  const projected =
    activeId && overId
      ? getProjection(flattened, activeId, overId, offsetLeft, 20)
      : null;

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
          // clone our flattened items
          const cloned = JSON.parse(JSON.stringify(flattened));
          const oldIndex = cloned.findIndex((i) => i.id === active.id);

          // update its depth & parent
          cloned[oldIndex] = {
            ...cloned[oldIndex],
            depth: projected.depth,
            parentId: projected.parentId,
          };

          // move its array position
          const newIndex = cloned.findIndex((i) => i.id === over.id);
          const moved = [
            ...cloned.slice(0, oldIndex),
            ...cloned.slice(oldIndex + 1),
          ];
          moved.splice(newIndex, 0, cloned[oldIndex]);

          // rebuild nested tree and persist
          setTasks(buildTree(moved));
        }
      }}
      onDragCancel={() => {
        setActiveId(null);
        setOverId(null);
        setOffsetLeft(0);
      }}
      dropAnimation={{
        ...defaultDropAnimation,
        dragSourceOpacity: 0.5,
      }}
    >
      <SortableContext
        items={flattened.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-1">
          {flattened.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              projected={projected}
              activeId={activeId}
              onToggleCollapse={() =>
                setTasks((items) =>
                  setProperty(items, item.id, "collapsed", (v) => !v)
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
          <div className="p-2 bg-white shadow-lg rounded">
            {tasks.find((t) => t.id === activeId)?.name || "…"}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableItem({
  item,
  projected,
  activeId,
  onToggleCollapse,
  onTextChange,
  onToggleDone,
  onAddBelow,
  onAddChild,
  onArchive,
}) {
  const { id, depth, children, collapsed } = item;
  const isProjected = id === activeId && projected;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // drives the little blue insertion bar
    "--spacing": `${(isProjected ? projected.depth : depth) * 20}px`,
  };

  return (
    <li ref={setNodeRef} style={style} className="relative">
      <TaskRow
        task={item}
        depth={isProjected ? projected.depth : depth}
        onTextChange={onTextChange}
        onToggleDone={onToggleDone}
        onAddBelow={onAddBelow}
        onAddChild={onAddChild}
        onArchive={onArchive}
        dragAttributes={attributes}
        dragListeners={listeners}
      />

      {children.length > 0 && (
        <button
          onClick={onToggleCollapse}
          className="absolute left-0 top-1"
          aria-label={collapsed ? "Expand branch" : "Collapse branch"}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      )}
    </li>
  );
}
