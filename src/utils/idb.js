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

export async function getTasksByDeskId(deskId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result;
      const filtered = all
        .filter((t) => t.desk_id === deskId && !t.archived)
        .sort((a, b) => a.position - b.position);
      resolve(filtered);
    };

    request.onerror = () => reject(request.error);
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
