import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveDesk } from '../utils/idb.js';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar({ desks, currentDeskId }) {
  const [adding, setAdding] = useState(false);
  const [deskName, setDeskName] = useState('');
  const navigate = useNavigate();

  const createDesk = () => {
    if (!deskName.trim()) return;
    const d = { id: uuidv4(), name: deskName.trim() };
    saveDesk(d).then(() => {
      // naive reload — parent fetches again
      window.location.href = `/desk/${d.id}`;
    });
  };

  return (
    <aside className="w-60 shrink-0 bg-slate-100 border-r p-4 h-[calc(100vh-4rem)] overflow-y-auto">
      <button
        onClick={() => setAdding(!adding)}
        className="w-full mb-4 py-1.5 bg-blue-600 text-white rounded"
      >
        + Add Desk
      </button>

      {adding && (
        <div className="mb-4">
          <input
            className="w-full border rounded px-2 py-1 mb-1"
            placeholder="Desk name…"
            value={deskName}
            onChange={(e) => setDeskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createDesk()}
          />
          <button
            onClick={createDesk}
            className="w-full py-1 bg-green-600 text-white rounded"
          >
            Save
          </button>
        </div>
      )}

      <div className="space-y-1">
        {desks.map((d) => (
          <Link
            key={d.id}
            to={`/desk/${d.id}`}
            className={`block px-3 py-1 rounded ${
              d.id === currentDeskId
                ? 'bg-blue-500 text-white'
                : 'hover:bg-slate-200'
            }`}
          >
            {d.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

