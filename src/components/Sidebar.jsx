/* …imports stay same */
import { Link } from 'react-router-dom';
export default function Sidebar({ desks, currentDeskId, startAddDesk }) {
  /* …state stays same, remove inline add‑form logic */

  return (
    <aside className="w-60 shrink-0 bg-slate-100 border-r p-4 h-[calc(100vh-4rem)] overflow-y-auto">
      <button
        onClick={startAddDesk}              
        className="w-full mb-4 py-1.5 bg-blue-600 text-white rounded"
      >
        + Add Desk
      </button>

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
