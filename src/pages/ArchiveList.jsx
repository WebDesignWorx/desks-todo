export default function ArchiveList({ tasks, onRestore, onDeletePermanent }) {
  if (!tasks.length) {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Archived</h3>
        <p className="text-sm text-gray-500">No archived tasks.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded">
      <h3 className="font-semibold mb-2">Archived</h3>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li
            key={t.id}
            className={`flex items-center justify-between px-2 py-1 rounded ${
              t.done
                ? 'line-through text-gray-400 bg-white'
                : 'bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={t.done}
                disabled
                className="h-4 w-4"
              />
              <span>{t.name}</span>
            </div>
            <div className="space-x-2 text-sm">
              <button
                onClick={() => onRestore(t.id)}
                className="text-green-600 hover:text-green-800"
              >
                restore
              </button>
              <button
                onClick={() => onDeletePermanent(t.id)}
                className="text-red-600 hover:text-red-800"
              >
                delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
