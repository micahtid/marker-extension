export interface TextAnnotation {
  id: string;
  type: 'text';
  text: string;
  startOffset: number;
  endOffset: number;
  xpath: string;
  style: {
    color?: string;
    underline?: boolean;
    bold?: boolean;
    strikethrough?: boolean;
  };
}

export interface DrawAnnotation {
  id: string;
  type: 'draw';
  paths: {
    points: { x: number; y: number }[];
    color: string;
    width: number;
  }[];
}

export type Annotation = TextAnnotation | DrawAnnotation;

export interface PageAnnotations {
  url: string;
  textAnnotations: TextAnnotation[];
  drawAnnotations: DrawAnnotation[];
  updatedAt: number;
}

const DB_NAME = 'annotate-saver-db';
const DB_VERSION = 1;
const STORE_NAME = 'annotations';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'url' });
      }
    };
  });
}

function getPageKey(url: string): string {
  // Normalize URL by removing hash and query params for consistency
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

export async function saveAnnotations(
  url: string,
  textAnnotations: TextAnnotation[],
  drawAnnotations: DrawAnnotation[]
): Promise<void> {
  const database = await initDB();
  const pageKey = getPageKey(url);

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data: PageAnnotations = {
      url: pageKey,
      textAnnotations,
      drawAnnotations,
      updatedAt: Date.now(),
    };

    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function loadAnnotations(url: string): Promise<PageAnnotations | null> {
  const database = await initDB();
  const pageKey = getPageKey(url);

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(pageKey);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function clearAnnotations(url: string): Promise<void> {
  const database = await initDB();
  const pageKey = getPageKey(url);

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(pageKey);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export function generateId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
