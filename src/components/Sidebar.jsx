import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ desks, addDesk }) {
  const { pathname } = useLocation();
  const [name, setName] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = await addDesk(name);
    setName("");
  };

  return (
    <aside className="w-56 shrink-0 border-r bg-white flex flex-col">
      <form onSubmit={onSubmit} className="p-3 border-b">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New desk…"
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </form>

      <nav className="flex-1 overflow-auto p-2 space-y-1">
        {desks.map((d) => {
          const active = pathname.includes(d.id);
          return (
            <Link
              key={d.id}
              to={`/desk/${d.id}`}
              className={`block px-3 py-1 rounded text-sm ${
                active ? "bg-indigo-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              {d.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
