import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  openDB,
  getAllDesks,
  saveDesk,
  getTasksByDeskId,
  saveTask,
} from './utils/idb.js';

import TaskTree from './components/TaskTree';

export default function App() {
  /* ───────────────────────── state */
  const [desks, setDesks] = useState([]);
  const [currentDeskId, setCurrentDeskId] = useState(null);
  const [newDeskName, setNewDeskName] = useState('');
  const [tasks, setTasks] = useState([]);

  /* refs for auto‑focus */
  const firstTaskInput = useRef(null);
  const addInputRef   = useRef(null);

  /* ───────────────────────── boot */
  useEffect(() => {
    openDB().then(() => getAllDesks().then(setDesks));
  }, []);

  useEffect(() => {
    if (currentDeskId) {
      getTasksByDeskId(currentDeskId).then(setTasks);
      requestAnimationFrame(() => firstTaskInput.current?.focus());
    }
  }, [currentDeskId]);

  /* ───────────────────────── helpers */
  const persistAndSet = (next) => {
    setTasks(next);
    next.forEach(saveTask);
  };

  const addDesk = () => {
    if (!newDeskName.trim()) return;
    const d = { id: uuidv4(), name: newDeskName.trim() };
    saveDesk(d);
    setDesks((p) => [...p, d]);
    setCurrentDeskId(d.id);
    setNewDeskName('');
  };

  const addRootTask = (text = '') => {
    const t = {
      id: uuidv4(),
      desk_id: currentDeskId,
      name: text,
      parent_id: null,
      position: Date.now(),
    };
    persistAndSet([...tasks, t]);
  };

  /* callbacks passed to TaskTree */
  const onTextChange = (id, txt) =>
    persistAndSet(tasks.map((t) => (t.id === id ? { ...t, name: txt } : t)));

  const onAddBelow = (afterId) => {
    const idx = tasks.findIndex((t) => t.id === afterId);
    const ref = tasks[idx];
    const t = {
      id: uuidv4(),
      desk_id: currentDeskId,
      name: '',
      parent_id: ref.parent_id,
      position: Date.now(),
    };
    const next = [...tasks];
    next.splice(idx + 1, 0, t);
    persistAndSet(next);
  };

  const onAddChild = (parentId) => {
    const t = {
      id: uuidv4(),
      desk_id: currentDeskId,
      name: '',
      parent_id: parentId,
      position: Date.now(),
    };
    persistAndSet([...tasks, t]);
  };

  /* ───────────────────────── render */
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        {/* header */}
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="New desk…"
            value={newDeskName}
            onChange={(e) => setNewDeskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDesk()}
          />
          <button
            onClick={addDesk}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Add&nbsp;Desk
          </button>
        </div>

        {/* desk buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {desks.map((d) => (
            <button
              key={d.id}
              onClick={() => setCurrentDeskId(d.id)}
              className={`px-4 py-1 rounded border ${
                d.id === currentDeskId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* task area */}
        {currentDeskId && (
          <>
            {/* zero‑task prompt */}
            {tasks.length === 0 && (
              <div className="mb-4">
                <input
                  ref={firstTaskInput}
                  className="border px-3 py-2 rounded w-full"
                  placeholder="First task…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addRootTask(e.target.value.trim());
                      e.target.value = '';
                      addInputRef.current?.focus();
                    }
                  }}
                />
              </div>
            )}

            {/* tree */}
            {tasks.length > 0 && (
              <TaskTree
                tasks={tasks}
                setTasks={persistAndSet}
                onTextChange={onTextChange}
                onAddBelow={onAddBelow}
                onAddChild={onAddChild}
              />
            )}

            {/* bottom quick‑add */}
            <div className="mt-4">
              <input
                ref={addInputRef}
                className="border rounded px-3 py-2 w-full"
                placeholder="Add task…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const text = e.currentTarget.value.trim();
                    e.currentTarget.value = '';
                    addRootTask(text);
                    requestAnimationFrame(() => addInputRef.current?.focus());
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
