import { useEffect, useRef, useState } from 'react';

export default function TaskRow({
  task,
  depth,
  onToggleDone,
  onTextChange,
  onAddBelow,
  onAddChild,
  onArchive,
  dragAttributes,
  dragListeners,
  setDragRef,
}) {
  const [editing, setEditing] = useState(!task.name);
  const [value, setValue] = useState(task.name);
  const inputRef = useRef();

  /* auto‑focus when editing starts */
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  /* commit text change */
  const commit = () => {
    const trimmed = value.trim();
    setEditing(false);
    if (trimmed !== task.name) onTextChange(task.id, trimmed);
  };

  return (
    <li
      ref={setDragRef}
      {...dragAttributes}
      {...dragListeners}
      style={{ paddingLeft: depth * 24 }}
      className="task-row flex items-center gap-2 mb-1 group"
    >
      {/* checkbox */}
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => {
            console.log('✅ TaskRow onToggleDone(', task.id, ')');
            onToggleDone(task.id);
        }}
      />

      {/* drag handle */}
      <span className="task-handle cursor-move opacity-0 group-hover:opacity-100">
        ☰
      </span>

      {/* title or input */}
      {editing ? (
        <input
          ref={inputRef}
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
          className="flex-1 bg-transparent outline-none border-b border-indigo-300"
        />
      ) : (
            <div
              onDoubleClick={() => setEditing(true)}
              className={`flex-1 select-none ${
                task.done ? 'task-checked-done' : ''
              }`}
            >
          {task.name || <em className="text-neutral-400">[empty]</em>}
        </div>
      )}

      {/* archive (×) */}
      <button
        onClick={() => onArchive(task.id)}
        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
        title="Archive"
      >
        ×
      </button>
    </li>
  );
}
