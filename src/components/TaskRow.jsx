import React, { useState, useRef, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({ html: false, linkify: true });

export default function TaskRow({
  task,
  depth,
  caret = false,
  collapsed = false,
  onCaretToggle,
  onToggleDone,
  prefix,
  onTextChange,
  onAddBelow,
  onAddChild,
  onArchive,
  dragAttributes,
  dragListeners,
}) {
  const [editing, setEditing] = useState(!task.name);
  const [val, setVal] = useState(task.name || '');
  const inputRef = useRef();

  /* focus when entering edit */
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  useEffect(() => setVal(task.name || ''), [task.name]);

  const commit = () => {
    const txt = val.trim();
    setEditing(false);
    if (txt !== task.name) onTextChange(task.id, txt);
  };

  return (
    <div
      className={`spr-row group ${task.done ? 'spr-done' : ''}`}
      style={{ paddingLeft: depth * 20 }}
    >
      {caret ? (
        <button
          onClick={onCaretToggle}
          className="spr-caret"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▸' : '▾'}
        </button>
      ) : (
        <span className="spr-caret-placeholder" />
      )}
        {prefix}
      <span
        {...dragAttributes}
        {...dragListeners}
        className="spr-handle opacity-0 group-hover:opacity-100"
      >
        ═
      </span>

      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggleDone(task.id)}
        className="mr-2"
      />

      {editing ? (
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { commit(); onAddBelow(task.id); }
            if (e.key === 'Tab')  { e.preventDefault(); commit(); onAddChild(task.id); }
          }}
          className="spr-input"
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          className="flex-1 select-none"
          dangerouslySetInnerHTML={{
            __html: task.name
              ? md.renderInline(task.name)
              : '<em class="text-gray-400">[empty]</em>',
          }}
        />
      )}

      <button
        onClick={() => onArchive(task.id)}
        className="spr-archive opacity-0 group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
