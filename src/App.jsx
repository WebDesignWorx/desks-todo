import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TaskPage from './pages/TaskPage';

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <h2 className="text-xl font-semibold">Desks Todo</h2>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            {/* redirect root to a default (could be lastDesk from localStorage) */}
            <Route path="/" element={<Navigate to="/desk" replace />} />
            <Route path="/desk/:deskId" element={<TaskPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
