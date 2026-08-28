import type { AppData, Chore, Completion } from './types';

const DB_NAME = 'done-here:v1';
const STORE = 'records';
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isId = (value: unknown) => typeof value === 'string' && value.length > 0 && value.length <= 128;
const isIsoDate = (value: unknown) => typeof value === 'string' && value.length <= 64 && Number.isFinite(Date.parse(value));
const isPhoto = (value: unknown) => typeof value === 'string' && PHOTO_TYPES.some((type) => value.startsWith(`data:${type};base64,`));

function isChore(value: unknown): value is Chore {
  if (!isRecord(value)) return false;
  return isId(value.id)
    && typeof value.name === 'string'
    && value.name.trim().length > 0
    && value.name.length <= 80
    && Number.isInteger(value.intervalDays)
    && Number(value.intervalDays) >= 1
    && Number(value.intervalDays) <= 365
    && isIsoDate(value.createdAt)
    && (value.archived === undefined || typeof value.archived === 'boolean');
}

function isCompletion(value: unknown): value is Completion {
  if (!isRecord(value)) return false;
  return isId(value.id)
    && isId(value.choreId)
    && isIsoDate(value.completedAt)
    && (value.note === undefined || (typeof value.note === 'string' && value.note.length <= 300))
    && (value.photo === undefined || isPhoto(value.photo));
}

export function validateData(value: unknown): AppData {
  if (!isRecord(value) || !Array.isArray(value.chores) || !Array.isArray(value.completions)) {
    throw new Error('This file is not a Done Here backup. Choose an exported JSON file.');
  }
  if (!value.chores.every(isChore) || !value.completions.every(isCompletion)) {
    throw new Error('This backup has an invalid chore or completion. Your current calendar was not changed.');
  }
  const choreIds = new Set(value.chores.map((row) => row.id));
  const allIds = [...value.chores, ...value.completions].map((row) => row.id);
  if (new Set(allIds).size !== allIds.length || value.completions.some((row) => !choreIds.has(row.choreId))) {
    throw new Error('This backup has duplicate or missing record links. Your current calendar was not changed.');
  }
  return { chores: value.chores, completions: value.completions };
}

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
      const chores = rows.filter((row) => row.kind === 'chore').map(({ kind, ...row }) => { void kind; return row; }).filter(isChore);
      const choreIds = new Set(chores.map((row) => row.id));
      const completions = rows.filter((row) => row.kind === 'completion').map(({ kind, ...row }) => { void kind; return row; }).filter(isCompletion).filter((row) => choreIds.has(row.choreId));
      resolve({ chores, completions });
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

export async function replaceData(data: unknown): Promise<void> {
  await saveData(validateData(data));
}
