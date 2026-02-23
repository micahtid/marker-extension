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

function getPageKey(url: string): string {
  try {
    const urlObj = new URL(url);
    return `marker:${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return `marker:${url}`;
  }
}

export async function saveAnnotations(
  url: string,
  textAnnotations: TextAnnotation[],
  drawAnnotations: DrawAnnotation[]
): Promise<void> {
  const pageKey = getPageKey(url);

  const data: PageAnnotations = {
    url: pageKey,
    textAnnotations,
    drawAnnotations,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [pageKey]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function loadAnnotations(url: string): Promise<PageAnnotations | null> {
  const pageKey = getPageKey(url);

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(pageKey, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve((result[pageKey] as PageAnnotations) || null);
      }
    });
  });
}

export async function clearAnnotations(url: string): Promise<void> {
  const pageKey = getPageKey(url);

  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(pageKey, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export function generateId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
