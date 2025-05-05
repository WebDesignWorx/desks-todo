import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from 'react';

export default function SortableItem({ task, tasks, setTasks }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const [text, setText] = useState(task.name);
  const ref = useRef(null);

  useEffect(() => {
    setText(task.name);
  }, [task.name]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const handleBlur = () => {
    if (text.trim() === task.name) return;
    const updated = tasks.map((t) => (t.id === task.id ? { ...t, name: text } : t));
    setTasks(updated);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTask = {
        id: crypto.randomUUID(),
        name: '',
        parent_id: null,
        desk_id: task.desk_id,
        position: tasks.length,
        done: false
      };
      const currentIndex = tasks.findIndex((t) => t.id === task.id);
      const updated = [...tasks.slice(0, currentIndex + 1), newTask, ...tasks.slice(currentIndex + 1)];
      setTasks(updated);
      requestAnimationFrame(() => {
        const nextInput = ref.current?.nextElementSibling?.querySelector('input');
        nextInput?.focus();
      });
    }
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} className="border p-2 mb-1 bg-white rounded flex items-center">
      <span {...listeners} className="cursor-move mr-2">☰</span>
      <input
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKey}
        className="flex-1 outline-none border-none"
      />
    </li>
  );
}

