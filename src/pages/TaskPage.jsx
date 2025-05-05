import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import {
  getTasksByDeskId,
  saveTask,
  archiveTaskById,
  pruneEmptyTasks,
} from '../utils/idb.js';
import ArchiveList from './ArchiveList';
import TaskTree from '../components/TaskTree';
import { v4 as uuidv4 } from 'uuid';

export default function TaskPage() {
  const { deskId } = useParams();
  const [tasks, setTasks] = useState([]);
  const addInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      await pruneEmptyTasks(deskId);
      const t = await getTasksByDeskId(deskId);
      setTasks(t);
    })();
    localStorage.setItem('lastDesk', deskId);
  }, [deskId]);
// filepath: mytodo-react/src/pages/TaskPage.jsx
const toggleDone = (id) => {
  console.log('Toggling done for task:', id);
  const updatedTasks = tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  console.log('Updated tasks:', updatedTasks);
  setTasks(updatedTasks);
  persist(updatedTasks);
};


const archive = async (id) => {
  await archiveTaskById(id);
  setTasks((prev) =>
    prev.map((t) =>
      t.id === id ? { ...t, archived: true } : t
    )
  );
};

  const [showArc, setShowArc] = useState(false);
  const persist = (next) => {
    setTasks(next);
    next.forEach(saveTask);
  };

  const addRootTask = (text) => {
    const t = {
      id: uuidv4(),
      desk_id: deskId,
      name: text,
      parent_id: null,
      position: Date.now(),
    };
    persist([...tasks, t]);
  };

  /* handed down to tree */
  const onText = (id, txt) =>
    persist(tasks.map((t) => (t.id === id ? { ...t, name: txt } : t)));

  const onBelow = (afterId) => {
    const i = tasks.findIndex((t) => t.id === afterId);
    const ref = tasks[i];
    const t = {
      id: uuidv4(),
      desk_id: deskId,
      name: '',
      parent_id: ref.parent_id,
      position: Date.now(),
    };
    const next = [...tasks];
    next.splice(i + 1, 0, t);
    persist(next);
  };

  const onChild = (parent) =>
    persist([
      ...tasks,
      {
        id: uuidv4(),
        desk_id: deskId,
        name: '',
        parent_id: parent,
        position: Date.now(),
      },
    ]);

  return (
    <div className="flex flex-col h-full">
      {tasks.length === 0 && (
        <p className="text-gray-500 mb-4">No tasks yet — start by adding one.</p>
      )}

      {tasks.length > 0 && (
        <TaskTree
          tasks={tasks}
          setTasks={persist}
          onTextChange={onText}
          onToggleDone={toggleDone}
          onAddBelow={onBelow}
          onAddChild={onChild}
          onArchive={archive}
        />
      )}
<button
        className="text-blue-600 text-sm mt-2"
        onClick={() => setShowArc(!showArc)}
      >
        {showArc ? '[ hide archive ]' : `[ show archive (${tasks.filter((t) => t.archived).length}) ]`}
      </button>

      {showArc && (
        <ArchiveList
          tasks={tasks.filter((t) => t.archived)}
          refresh={async () => {
            const fresh = await getTasksByDeskId(deskId);
            setTasks(fresh);
          }}
        />
      )}
      <div className="mt-auto pt-4">
        <input
          ref={addInputRef}
          className="border rounded px-3 py-2 w-full"
          placeholder="Add task…"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              const txt = e.currentTarget.value.trim();
              e.currentTarget.value = '';
              addRootTask(txt);
            }
          }}
        />
      </div>
    </div>
  );
}