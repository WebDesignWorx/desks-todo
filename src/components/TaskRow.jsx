import { useEffect, useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';

export default function TaskRow({
  task,
  depth,
  onToggleDone,
  onTextChange,
  onAddBelow,
  onAddChild,
  onArchive,
  setNodeRef,
  attributes,
  listeners,
  transform,
  transition,
}) {
  const [editing, setEditing] = useState(!task.name);
  const [value, setValue] = useState(task.name);
  const inputRef = useRef();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: depth * 24,
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = value.trim();
    setEditing(false);
    onTextChange(task.id, trimmed);
    if (!trimmed) setValue(''); // keep UI in sync if user cleared name
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="task-row mb-1 group"
      role="treeitem"
      aria-level={depth + 1}
    >
      {/* checkbox */}
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggleDone(task.id)}
        className="mr-2"
      />

      {/* drag handle */}
      <span className="task-handle mr-2 opacity-0 group-hover:opacity-100">
        ☰
      </span>

      {/* title */}
      {editing ? (
        <input
          ref={inputRef}
          className="task-input flex-1 bg-transparent"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit();
              onAddBelow(task.id);
            } else if (e.key === 'Tab') {
              e.preventDefault();
              commit();
              onAddChild(task.id);
            }
          }}
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 ${
            task.done ? 'task-checked-done' : ''
          }`}
        >
          {task.name || <em className="text-gray-400">[empty]</em>}
        </div>
      )}

      {/* archive × */}
      <button
        onClick={() => onArchive(task.id)}
        className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
        title="Archive"
      >
        ×
      </button>
    </div>
  );
}
