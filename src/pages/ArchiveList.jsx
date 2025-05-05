import { deleteTaskById, saveTask } from '../utils/idb';

export default function ArchiveList({ tasks, refresh }) {
  const restore = async (t) => {
    t.archived = false;
    await saveTask(t);
    refresh();
  };
  const del = async (id) => {
    await deleteTaskById(id);
    refresh();
  };

  return (
    <div className="mt-4 bg-slate-50 p-4 rounded">
      <h3 className="font-semibold mb-2">Archived</h3>
      {tasks.length === 0 && <p className="text-sm text-gray-500">No archived tasks.</p>}
      {tasks.map((t) => (
        <div key={t.id} className="flex justify-between items-center mb-1">
          <span>{t.name}</span>
          <div className="space-x-2 text-sm">
            <button onClick={() => restore(t)} className="text-green-600">
              restore
            </button>
            <button onClick={() => del(t.id)} className="text-red-600">
              delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}