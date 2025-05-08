import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getTasksByDeskId,
  pruneEmptyTasks,
  saveTask,
  deleteTaskById,
} from '../utils/idb';
import ArchiveList from './ArchiveList';
import TaskTree from '../components/TaskTree';
import { v4 as uuidv4 } from 'uuid';

export default function TaskPage() {
  const { deskId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const addInputRef = useRef();

  // load/refresh whenever deskId changes
  useEffect(() => {
    (async () => {
      await pruneEmptyTasks(deskId);
      const t = await getTasksByDeskId(deskId);
      setTasks(t);
    })();
    localStorage.setItem('lastDesk', deskId);
  }, [deskId]);

  // a wrapper that both updates state and persists every item
  const persist = (updater) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      next.forEach(saveTask);
      return next;
    });
  };

  const toggleDone = (id) =>
    persist((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );

  const changeText = (id, name) =>
    persist((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name } : t
      )
    );

  const addBelow = (id) =>
    persist((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const sibling = prev[idx];
      const newTask = {
        id: uuidv4(),
        desk_id: deskId,
        name: '',
        done: false,
        archived: false,
        parent_id: sibling.parent_id,
        position: sibling.position + 0.1,
      };
      return [...prev, newTask];
    });

  const addChild = (parentId) =>
    persist((prev) => [
      ...prev,
      {
        id: uuidv4(),
        desk_id: deskId,
        name: '',
        done: false,
        archived: false,
        parent_id: parentId,
        position: Date.now(),
      },
    ]);

  const archive = (id) =>
    persist((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, archived: true } : t
      )
    );

  const deletePermanent = (id) => {
    deleteTaskById(id).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });
  };

  const onRootKey = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const name = e.target.value.trim();
      e.target.value = '';
      persist((prev) => [
        ...prev,
        {
          id: uuidv4(),
          desk_id: deskId,
          name,
          done: false,
          archived: false,
          parent_id: null,
          position: Date.now(),
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {tasks.length === 0 && !showArchive && (
        <p className="text-gray-500">No tasks yet.</p>
      )}

      {tasks.length > 0 && (
        <TaskTree
          tasks={tasks}
          setTasks={persist}
          onToggleDone={toggleDone}
          onTextChange={changeText}
          onAddBelow={addBelow}
          onAddChild={addChild}
          onArchive={archive}
        />
      )}

      <button
        className="mt-4 text-blue-600"
        onClick={() => setShowArchive((v) => !v)}
      >
        {showArchive
          ? '[ hide archive ]'
          : `[ show archive (${tasks.filter(t => t.archived).length}) ]`}
      </button>

      {showArchive && (
        <ArchiveList
          tasks={tasks.filter((t) => t.archived)}
          onRestore={(id) =>
            persist((prev) =>
              prev.map((t) =>
                t.id === id ? { ...t, archived: false } : t
              )
            )
          }
          onDeletePermanent={deletePermanent}
        />
      )}

      <div className="mt-auto pt-4">
        <input
          ref={addInputRef}
          placeholder="Add task…"
          className="border rounded px-3 py-2 w-full"
          onKeyDown={onRootKey}
        />
      </div>
    </div>
  );
}
