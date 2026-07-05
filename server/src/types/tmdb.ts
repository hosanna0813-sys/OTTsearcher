/**
 * TMDB API 原始回應型別（只宣告本專案會用到的欄位）
 * 文件：https://developer.themoviedb.org/reference
 */

export type MediaType = 'movie' | 'tv';

export interface TmdbSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string; // movie
  original_title?: string; // movie
  name?: string; // tv / person
  original_name?: string; // tv / person
  release_date?: string; // movie
  first_air_date?: string; // tv
  poster_path?: string | null;
  vote_average?: number;
  overview?: string;
}

export interface TmdbSearchResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbSearchResult[];
}

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
}

/** 單一地區（例如 TW）的觀看平台資訊 */
export interface TmdbRegionProviders {
  link?: string;
  flatrate?: TmdbProvider[]; // 訂閱
  free?: TmdbProvider[]; // 免費
  ads?: TmdbProvider[]; // 含廣告免費（歸入免費）
  rent?: TmdbProvider[]; // 租借
  buy?: TmdbProvider[]; // 購買
}

export interface TmdbWatchProvidersResponse {
  id: number;
  results: Record<string, TmdbRegionProviders>;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job?: string;
}

export interface TmdbCredits {
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
}

export interface TmdbVideo {
  key: string;
  site: string; // YouTube / Vimeo
  type: string; // Trailer / Teaser / ...
  official?: boolean;
  iso_639_1?: string;
}

export interface TmdbVideosResponse {
  results?: TmdbVideo[];
}

/** movie / tv details（append credits, videos, watch/providers 後）的共同欄位 */
export interface TmdbDetailsBase {
  id: number;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  genres?: TmdbGenre[];
  credits?: TmdbCredits;
  videos?: TmdbVideosResponse;
  'watch/providers'?: { results?: Record<string, TmdbRegionProviders> };
}

export interface TmdbMovieDetails extends TmdbDetailsBase {
  title?: string;
  original_title?: string;
  release_date?: string;
  runtime?: number | null;
}

export interface TmdbTvDetails extends TmdbDetailsBase {
  name?: string;
  original_name?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  created_by?: { id: number; name: string }[];
}
