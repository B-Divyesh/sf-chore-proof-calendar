import type { AppData, Chore, Completion } from './types';

const DB_NAME = 'done-here:v1';
const STORE = 'records';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your browser could not open its private storage. Check site storage settings and try again.'));
  });
}

export async function loadData(): Promise<AppData> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => {
      const rows = request.result as Array<(Chore | Completion) & { kind: string }>;
      resolve({
        chores: rows.filter((row) => row.kind === 'chore').map(({ kind: _, ...row }) => row as Chore),
        completions: rows.filter((row) => row.kind === 'completion').map(({ kind: _, ...row }) => row as Completion)
      });
    };
    request.onerror = () => reject(new Error('Your calendar could not be read. Reload the page and try again.'));
  });
}

export async function saveData(data: AppData): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    data.chores.forEach((row) => tx.objectStore(STORE).put({ ...row, kind: 'chore' }));
    data.completions.forEach((row) => tx.objectStore(STORE).put({ ...row, kind: 'completion' }));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error('Your change was not saved. Check site storage settings and try again.'));
  });
}

export async function replaceData(data: AppData): Promise<void> {
  if (!Array.isArray(data.chores) || !Array.isArray(data.completions)) throw new Error('This file is not a Done Here backup. Choose an exported JSON file.');
  await saveData(data);
}
