import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveDesk } from '../utils/idb';
import { useNavigate } from 'react-router-dom';

export default function NewDeskForm({ onDone, onCreate }) {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const create = () => {
    if (!name.trim()) return;
    const d = { id: uuidv4(), name: name.trim() };
    saveDesk(d).then(() => {
        onCreate(d);            // push into parent desks array
        onDone();               // clear addingDesk flag
        navigate(`/desk/${d.id}`);
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Create a new Desk</h2>
      <input
        className="border rounded px-3 py-2 w-full mb-3"
        placeholder="Desk name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && create()}
      />
      <button onClick={create} className="px-4 py-2 bg-green-600 text-white rounded">
        Save Desk
      </button>
    </div>
  );
}

