import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllDesks } from '../utils/idb';

export default function Sidebar() {
  const [desks, setDesks] = useState([]);

  useEffect(() => {
    getAllDesks().then(setDesks);
  }, []);

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex-shrink-0">
      <h1 className="text-2xl font-bold mb-4">Desks Todo</h1>
      <div className="space-y-2">
        {desks.map((desk) => (
          <NavLink
            key={desk.id}
            to={`/desk/${desk.id}`}
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`
            }
          >
            {desk.name}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
