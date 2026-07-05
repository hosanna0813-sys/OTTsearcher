/**
 * 將 TMDB 原始回應轉換成前端使用的精簡格式。
 * 台灣觀看平台的分類規則：
 *   flatrate → 訂閱觀看
 *   free + ads → 免費觀看（合併去重）
 *   rent → 租借
 *   buy → 購買
 */

import {
  CastMember,
  MediaDetail,
  MediaType,
  Provider,
  SearchResultItem,
  TaiwanWatchInfo,
} from '../types/api';
import {
  TmdbMovieDetails,
  TmdbProvider,
  TmdbRegionProviders,
  TmdbSearchResult,
  TmdbTvDetails,
  TmdbVideo,
} from '../types/tmdb';

const MAX_SUMMARY_PROVIDERS = 6;
const MAX_CAST = 10;

function toProvider(p: TmdbProvider): Provider {
  return { id: p.provider_id, name: p.provider_name, logoPath: p.logo_path };
}

function dedupeProviders(providers: TmdbProvider[]): Provider[] {
  const seen = new Set<number>();
  const result: Provider[] = [];
  for (const p of providers) {
    if (seen.has(p.provider_id)) continue;
    seen.add(p.provider_id);
    result.push(toProvider(p));
  }
  return result;
}

/** 把 TMDB 的 TW 區塊轉成四分類的觀看資訊 */
export function toTaiwanWatchInfo(region: TmdbRegionProviders | undefined): TaiwanWatchInfo {
  return {
    link: region?.link ?? null,
    flatrate: dedupeProviders(region?.flatrate ?? []),
    free: dedupeProviders([...(region?.free ?? []), ...(region?.ads ?? [])]),
    rent: dedupeProviders(region?.rent ?? []),
    buy: dedupeProviders(region?.buy ?? []),
  };
}

/** 搜尋卡片用的平台摘要：訂閱與免費優先，其次租借／購買，最多 6 個 */
export function toProviderSummary(region: TmdbRegionProviders | undefined): Provider[] {
  const ordered = [
    ...(region?.flatrate ?? []),
    ...(region?.free ?? []),
    ...(region?.ads ?? []),
    ...(region?.rent ?? []),
    ...(region?.buy ?? []),
  ];
  return dedupeProviders(ordered).slice(0, MAX_SUMMARY_PROVIDERS);
}

function extractYear(date: string | undefined): string {
  return date && date.length >= 4 ? date.slice(0, 4) : '';
}

/** multi search 結果 → 搜尋卡片（person 或缺 id 的項目回傳 null） */
export function toSearchResultItem(
  raw: TmdbSearchResult
): Omit<SearchResultItem, 'providers' | 'link'> | null {
  if (raw.media_type !== 'movie' && raw.media_type !== 'tv') return null;
  const isMovie = raw.media_type === 'movie';
  return {
    id: raw.id,
    mediaType: raw.media_type,
    title: (isMovie ? raw.title : raw.name) || raw.original_title || raw.original_name || '',
    originalTitle: (isMovie ? raw.original_title : raw.original_name) || '',
    year: extractYear(isMovie ? raw.release_date : raw.first_air_date),
    posterPath: raw.poster_path ?? null,
    voteAverage: raw.vote_average ?? 0,
    overview: raw.overview ?? '',
  };
}

/** 從影片清單挑出最合適的 YouTube 預告片：官方 Trailer > Trailer > Teaser */
export function pickTrailerKey(videos: TmdbVideo[] | undefined): string | null {
  const youtube = (videos ?? []).filter((v) => v.site === 'YouTube');
  const officialTrailer = youtube.find((v) => v.type === 'Trailer' && v.official);
  const trailer = youtube.find((v) => v.type === 'Trailer');
  const teaser = youtube.find((v) => v.type === 'Teaser');
  return (officialTrailer ?? trailer ?? teaser)?.key ?? null;
}

function toCast(details: TmdbMovieDetails | TmdbTvDetails): CastMember[] {
  return (details.credits?.cast ?? []).slice(0, MAX_CAST).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character ?? '',
    profilePath: c.profile_path ?? null,
  }));
}

export function toMovieDetail(details: TmdbMovieDetails, region: TmdbRegionProviders | undefined): MediaDetail {
  const directors = (details.credits?.crew ?? [])
    .filter((c) => c.job === 'Director')
    .map((c) => c.name);
  return {
    id: details.id,
    mediaType: 'movie' as MediaType,
    title: details.title || details.original_title || '',
    originalTitle: details.original_title ?? '',
    year: extractYear(details.release_date),
    overview: details.overview ?? '',
    genres: (details.genres ?? []).map((g) => g.name),
    runtime: details.runtime ?? null,
    numberOfSeasons: null,
    numberOfEpisodes: null,
    voteAverage: details.vote_average ?? 0,
    posterPath: details.poster_path ?? null,
    backdropPath: details.backdrop_path ?? null,
    cast: toCast(details),
    directors,
    trailerKey: pickTrailerKey(details.videos?.results),
    watch: toTaiwanWatchInfo(region),
  };
}

export function toTvDetail(details: TmdbTvDetails, region: TmdbRegionProviders | undefined): MediaDetail {
  return {
    id: details.id,
    mediaType: 'tv' as MediaType,
    title: details.name || details.original_name || '',
    originalTitle: details.original_name ?? '',
    year: extractYear(details.first_air_date),
    overview: details.overview ?? '',
    genres: (details.genres ?? []).map((g) => g.name),
    runtime: null,
    numberOfSeasons: details.number_of_seasons ?? null,
    numberOfEpisodes: details.number_of_episodes ?? null,
    voteAverage: details.vote_average ?? 0,
    posterPath: details.poster_path ?? null,
    backdropPath: details.backdrop_path ?? null,
    cast: toCast(details),
    directors: (details.created_by ?? []).map((c) => c.name),
    trailerKey: pickTrailerKey(details.videos?.results),
    watch: toTaiwanWatchInfo(region),
  };
}
