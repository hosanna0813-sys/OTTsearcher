/**
 * 本服務對外（前端）的 API 回應型別。
 * client/src/types/index.ts 有一份對應的複本，兩邊需保持同步。
 */

export type MediaType = 'movie' | 'tv';

/** OTT 平台（已轉換成前端可直接使用的格式） */
export interface Provider {
  id: number;
  name: string;
  logoPath: string | null;
}

/** 搜尋結果的單筆卡片資料 */
export interface SearchResultItem {
  id: number;
  mediaType: MediaType;
  /** 中文名稱（zh-TW，TMDB 無翻譯時為原文） */
  title: string;
  /** 原文名稱 */
  originalTitle: string;
  /** 上映／首播年份，未知時為空字串 */
  year: string;
  posterPath: string | null;
  voteAverage: number;
  overview: string;
  /** 台灣可觀看平台摘要（訂閱/免費優先，最多 6 個） */
  providers: Provider[];
  /** TMDB 提供的 JustWatch 觀看資訊連結，供對照表查無平台時 fallback 使用 */
  link: string | null;
}

export interface SearchResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: SearchResultItem[];
}

/** 台灣觀看平台，依觀看方式分類 */
export interface TaiwanWatchInfo {
  /** TMDB 提供的觀看資訊連結（JustWatch） */
  link: string | null;
  /** 訂閱觀看 */
  flatrate: Provider[];
  /** 免費觀看（含廣告支援的免費） */
  free: Provider[];
  /** 租借 */
  rent: Provider[];
  /** 購買 */
  buy: Provider[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

/** 詳細頁資料（電影與影集共用） */
export interface MediaDetail {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  year: string;
  overview: string;
  genres: string[];
  /** 電影片長（分鐘） */
  runtime: number | null;
  /** 影集季數 */
  numberOfSeasons: number | null;
  /** 影集集數 */
  numberOfEpisodes: number | null;
  voteAverage: number;
  posterPath: string | null;
  backdropPath: string | null;
  /** 主要演員（前 10 名） */
  cast: CastMember[];
  /** 導演（電影）或創作者（影集） */
  directors: string[];
  /** YouTube 預告片影片 key，無預告片時為 null */
  trailerKey: string | null;
  watch: TaiwanWatchInfo;
}

export interface ApiErrorResponse {
  error: string;
}
