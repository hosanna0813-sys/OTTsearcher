/**
 * 前端使用的 API 回應型別。
 * 與 server/src/types/api.ts 為同一份定義的複本，兩邊需保持同步。
 */

export type MediaType = 'movie' | 'tv';

export interface Provider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface SearchResultItem {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  year: string;
  posterPath: string | null;
  voteAverage: number;
  overview: string;
  providers: Provider[];
}

export interface SearchResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: SearchResultItem[];
}

export interface TaiwanWatchInfo {
  link: string | null;
  flatrate: Provider[];
  free: Provider[];
  rent: Provider[];
  buy: Provider[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface MediaDetail {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  year: string;
  overview: string;
  genres: string[];
  runtime: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  voteAverage: number;
  posterPath: string | null;
  backdropPath: string | null;
  cast: CastMember[];
  directors: string[];
  trailerKey: string | null;
  watch: TaiwanWatchInfo;
}
