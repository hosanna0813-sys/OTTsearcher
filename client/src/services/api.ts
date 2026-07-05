/**
 * 前端 API 存取層。
 * - 一律呼叫自家後端 /api（絕不直接呼叫 TMDB）
 * - 成功回應以 URL 為 key 快取在記憶體，避免重複查詢
 * - 同一 URL 進行中的請求共用同一個 Promise（in-flight 去重）
 */

import { MediaDetail, MediaType, SearchResponse } from '../types';

/** TMDB 圖片 CDN（純靜態圖片，不含 API Key） */
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const imageUrl = {
  poster: (path: string | null): string | null => (path ? `${IMAGE_BASE}/w342${path}` : null),
  backdrop: (path: string | null): string | null => (path ? `${IMAGE_BASE}/w780${path}` : null),
  logo: (path: string | null): string | null => (path ? `${IMAGE_BASE}/w92${path}` : null),
  profile: (path: string | null): string | null => (path ? `${IMAGE_BASE}/w185${path}` : null),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;

  // 同一 URL 已有進行中的請求時直接共用，避免重複打後端
  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new ApiError(res.status, body?.error ?? '目前暫時無法取得資料，請稍後再試。');
      }
      const data = (await res.json()) as T;
      cache.set(url, data);
      return data;
    } finally {
      inflight.delete(url);
    }
  })();

  inflight.set(url, promise);
  return promise;
}

export function searchMedia(query: string, page = 1, signal?: AbortSignal): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, page: String(page) });
  return fetchJson<SearchResponse>(`/api/search?${params.toString()}`, signal);
}

export function getMediaDetail(
  mediaType: MediaType,
  id: string,
  signal?: AbortSignal
): Promise<MediaDetail> {
  return fetchJson<MediaDetail>(`/api/${mediaType}/${id}`, signal);
}
