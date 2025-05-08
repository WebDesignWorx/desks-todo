import React, { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";

/* ------------------------------------------------------------------ helpers */
const flatten = (nodes, depth = 0, list = []) => {
  nodes.forEach((n, i) => {
    list.push({ ...n, depth, index: i });
    flatten(n.children ?? [], depth + 1, list);
  });
  return list;
};

const buildTree = (flat) => {
  const byId = Object.fromEntries(flat.map((t) => [t.id, { ...t, children: [] }]));
  const root = [];
  flat.forEach((t) => {
    if (t.parent_id) byId[t.parent_id]?.children.push(byId[t.id]);
    else root.push(byId[t.id]);
  });
  // sort children by position
  Object.values(byId).forEach((n) =>
    n.children.sort((a, b) => a.position - b.position)
  );
  return root.sort((a, b) => a.position - b.position);
};
/* ------------------------------------------------------------------ */

/**
 * props:
 *  items      → array of nested tasks   ( [{id,name,children:[]}, …] )
 *  setItems   → callback to persist changes – receives the **new tree**
 *  indentationWidth (number)
 *  collapsible / removable (bool flags)
 */
export function SortableTree({
  items,
  setItems,
  indentationWidth = 20,
  collapsible = true,
  removable = true,
}) {
  const flat = useMemo(() => flatten(items), [items]);
  const [activeId, setActiveId] = useState(null);

  /* ------------------------------------------------------------- sensors */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  /* ----------------------------------------------------------- drag logic */
  const handleEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeItem  = flat.find((n) => n.id === active.id);
    const overItemIdx = flat.findIndex((n) => n.id === over.id);
    const overItem    = flat[overItemIdx];

    // new flat order
    const movedFlat = arrayMove(flat, flat.indexOf(activeItem), overItemIdx);

    // re-number positions, keep same parent
    movedFlat.forEach((n, i) => (n.position = i));

    // rebuild tree & persist
    setItems(buildTree(movedFlat));
  };

  /* ----------------------------------------------------------- render */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={flat.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        {flat.map((node) => (
          <Row
            key={node.id}
            node={node}
            depth={node.depth}
            indent={indentationWidth}
            collapsible={collapsible}
            removable={removable}
            onCollapse={() =>
              setItems(
                items.map((t) =>
                  t.id === node.id ? { ...t, collapsed: !t.collapsed } : t
                )
              )
            }
            onRemove={() =>
              setItems(items.filter((t) => t.id !== node.id))
            }
          />
        ))}
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <Ghost label={flat.find((n) => n.id === activeId)?.name} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/* ------------------------------ single row */
function Row({
  node,
  depth,
  indent,
  collapsible,
  removable,
  onCollapse,
  onRemove,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    paddingLeft: depth * indent,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        "flex items-center gap-2 py-1 rounded",
        isDragging && "bg-white shadow"
      )}
    >
      {/* caret */}
      {collapsible ? (
        <button
          className={classNames(
            "w-4 transition",
            node.children?.length ? "text-gray-500" : "invisible"
          )}
          onClick={onCollapse}
        >
          {node.collapsed ? "▸" : "▾"}
        </button>
      ) : (
        <span style={{ width: 16 }} />
      )}

      {/* drag handle */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab select-none text-gray-400"
      >
        ☰
      </span>

      {/* label */}
      <span className="flex-1">{node.name || "[empty]"}</span>

      {/* delete */}
      {removable && (
        <button
          onClick={onRemove}
          className="px-1 text-red-600 hover:text-red-800"
        >
          ×
        </button>
      )}
    </div>
  );
}

/* overlay */
const Ghost = ({ label }) => (
  <div className="px-2 py-1 bg-white shadow-lg rounded opacity-80">{label}</div>
);

export default SortableTree;

