const DB_NAME = 'todoDB';
const DB_VERSION = 1;
let db = null;

export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('desks')) {
        db.createObjectStore('desks', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
  });
}

// ===== DESK OPERATIONS =====

export async function getAllDesks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('desks', 'readonly');
    const store = tx.objectStore('desks');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDesk(desk) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('desks', 'readwrite');
    const store = tx.objectStore('desks');
    const request = store.put(desk);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDesk(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('desks', 'readwrite');
    const store = tx.objectStore('desks');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ===== TASK OPERATIONS =====

export async function saveTask(task) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const request = store.put(task);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Load tasks for a desk.
 * @param {string|number} deskId
 * @param {boolean} includeArchived if true, returns all tasks; otherwise only non-archived
 */
export async function getTasksByDeskId(deskId, includeArchived = true) {
  const d = await openDB();
  return new Promise((res, rej) => {
    const tx = d.transaction('tasks','readonly');
    const store = tx.objectStore('tasks');
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      const filtered = all
        .filter(t =>
          t.desk_id === deskId &&
          (includeArchived ? true : !t.archived)
        )
        .sort((a,b) => a.position - b.position);
      res(filtered);
    };
    req.onerror = () => rej(req.error);
  });
}

export async function deleteTask(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Permanently delete a task (alias for deleteTask)
export async function deleteTaskById(id) {
  return deleteTask(id);
}

// Soft-archive a task
export async function archiveTaskById(id) {
  const db = await openDB();
  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');

  // read the full task
  const t = await new Promise((res, rej) => {
    const req = store.get(id);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  if (!t) return null;

  t.archived = true;
  return new Promise((resolve, reject) => {
    const req = store.put(t);
    req.onsuccess = () => resolve(t);
    req.onerror = () => reject(req.error);
  });
}

// Restore (un-archive) a task
export async function restoreTaskById(id) {
  const db = await openDB();
  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');

  const t = await new Promise((res, rej) => {
    const req = store.get(id);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  if (!t) return null;

  t.archived = false;
  return new Promise((resolve, reject) => {
    const req = store.put(t);
    req.onsuccess = () => resolve(t);
    req.onerror = () => reject(req.error);
  });
}

// Remove any tasks without a name (e.g. leftover blanks)
export async function pruneEmptyTasks(deskId) {
  const db = await openDB();
  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');

  const all = await new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });

  const empties = all.filter(
    (t) => t.desk_id === deskId && (!t.name || !t.name.trim())
  );
  await Promise.all(empties.map((t) => store.delete(t.id)));
  return empties.length;
}
