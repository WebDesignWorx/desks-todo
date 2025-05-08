import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header   from "./components/Header";
import Sidebar  from "./components/Sidebar";
import TaskPage from "./pages/TaskPage";
import { getAllDesks, saveDesk } from "./utils/idb";
import { v4 as uuid } from "uuid";

export default function App() {
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── load desks once ──────────────────────────────────────────
  useEffect(() => {
    getAllDesks().then((d) => {
      setDesks(d);
      setLoading(false);
    });
  }, []);

  const addDesk = async (name) => {
    const desk = { id: uuid(), name: name.trim() };
    await saveDesk(desk);
    setDesks((prev) => [...prev, desk]);
    return desk.id;
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar desks={desks} addDesk={addDesk} />
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <Routes>
              <Route path="/"          element={<HomeRedirect desks={desks} />} />
              <Route path="/desk/:id"  element={<TaskPage />} />
              <Route path="*"          element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

/* send first-ever user to first desk (or prompt to create) */
function HomeRedirect({ desks }) {
  const nav = useNavigate();
  useEffect(() => {
    if (desks.length) nav(`/desk/${desks[0].id}`, { replace: true });
  }, [desks]);
  return desks.length ? null : (
    <p className="text-center text-gray-500 mt-20">
      No desks yet – create one with “Add Desk” →
    </p>
  );
}
