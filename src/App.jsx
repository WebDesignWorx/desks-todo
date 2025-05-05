import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskPage from './pages/TaskPage';
import { openDB, getAllDesks } from './utils/idb.js';

export default function App() {
  const [desks, setDesks] = useState([]);
  const location = useLocation();
  const currentDeskId =
    location.pathname.startsWith('/desk/') &&
    location.pathname.split('/desk/')[1];

  /* load desks at boot */
  useEffect(() => {
    openDB().then(() => getAllDesks().then(setDesks));
  }, []);

  /* redirect / to last desk if exists */
  useEffect(() => {
    if (location.pathname === '/') {
      const last = localStorage.getItem('lastDesk');
      if (last) window.location.replace(`/desk/${last}`);
    }
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar desks={desks} currentDeskId={currentDeskId} />

        <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<p>Select or add a desk to begin.</p>} />
            <Route path="/desk/:deskId" element={<TaskPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
