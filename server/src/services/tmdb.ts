/**
 * TMDB API 存取層。
 * - API Key 只存在後端環境變數，絕不傳到前端
 * - 同時支援 v3 API Key（query 參數）與 v4 Read Access Token（Bearer header）
 * - 內建 10 秒 timeout 與統一錯誤型別
 */

import {
  MediaType,
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbTvDetails,
  TmdbWatchProvidersResponse,
} from '../types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 10_000;

/** 查詢地區固定為台灣 */
export const REGION = 'TW';
/** 介面語言固定為繁體中文 */
export const LANGUAGE = 'zh-TW';

export class TmdbError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new TmdbError(500, '伺服器尚未設定 TMDB_API_KEY 環境變數');
  }
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  // v4 Read Access Token 是 JWT（eyJ 開頭），用 Bearer header；v3 Key 用 query 參數
  if (apiKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set('api_key', apiKey);
  }

  let response: Response;
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new TmdbError(502, `無法連線 TMDB API：${reason}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new TmdbError(500, 'TMDB API Key 無效，請檢查 TMDB_API_KEY 設定');
    }
    if (response.status === 404) {
      throw new TmdbError(404, '找不到這部作品');
    }
    throw new TmdbError(502, `TMDB API 回應錯誤（HTTP ${response.status}）`);
  }

  return (await response.json()) as T;
}

/** Search API：搜尋電影與影集（multi search，之後在 transform 過濾掉 person） */
export function searchMulti(query: string, page: number): Promise<TmdbSearchResponse> {
  return tmdbFetch<TmdbSearchResponse>('/search/multi', {
    query,
    page: String(page),
    language: LANGUAGE,
    include_adult: 'false',
  });
}

/** Watch Providers API：查詢單一作品各地區的觀看平台 */
export function getWatchProviders(
  mediaType: MediaType,
  id: number
): Promise<TmdbWatchProvidersResponse> {
  return tmdbFetch<TmdbWatchProvidersResponse>(`/${mediaType}/${id}/watch/providers`);
}

/**
 * Movie Details：一次帶出 Credits / Videos / Watch Providers。
 * include_video_language 讓沒有中文預告片時可退回英文。
 */
export function getMovieDetails(id: number): Promise<TmdbMovieDetails> {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, {
    language: LANGUAGE,
    append_to_response: 'credits,videos,watch/providers',
    include_video_language: 'zh,en',
  });
}

/** TV Details：同上 */
export function getTvDetails(id: number): Promise<TmdbTvDetails> {
  return tmdbFetch<TmdbTvDetails>(`/tv/${id}`, {
    language: LANGUAGE,
    append_to_response: 'credits,videos,watch/providers',
    include_video_language: 'zh,en',
  });
}

/** 抓取英文版 overview，作為 zh-TW 無翻譯時的備援 */
export async function getEnglishOverview(mediaType: MediaType, id: number): Promise<string> {
  const data = await tmdbFetch<{ overview?: string }>(`/${mediaType}/${id}`, {
    language: 'en-US',
  });
  return data.overview ?? '';
}
