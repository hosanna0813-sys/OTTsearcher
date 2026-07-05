/**
 * /api 路由：
 *   GET /api/health          — Render 健康檢查
 *   GET /api/search?q=&page= — 搜尋電影與影集（含台灣平台摘要）
 *   GET /api/movie/:id       — 電影詳細資料
 *   GET /api/tv/:id          — 影集詳細資料
 * 所有 TMDB 請求都在這一層代理，並套用記憶體快取。
 */

import { Router, Request, Response } from 'express';
import {
  MediaDetail,
  Provider,
  SearchResponse,
  SearchResultItem,
} from '../types/api';
import { MediaType, TmdbRegionProviders } from '../types/tmdb';
import {
  REGION,
  TmdbError,
  getEnglishOverview,
  getMovieDetails,
  getTvDetails,
  getWatchProviders,
  searchMulti,
} from '../services/tmdb';
import {
  toMovieDetail,
  toProviderSummary,
  toSearchResultItem,
  toTvDetail,
} from '../services/transform';
import { TTL, TTLCache } from '../utils/cache';

const router = Router();

interface ProviderSummary {
  providers: Provider[];
  link: string | null;
}

const searchCache = new TTLCache<SearchResponse>(300);
const detailCache = new TTLCache<MediaDetail>(300);
const providerCache = new TTLCache<ProviderSummary>(1000);

function handleError(res: Response, err: unknown): void {
  if (err instanceof TmdbError) {
    // 不把上游細節整包吐給前端，但保留可讀的錯誤訊息
    console.error(`[TMDB] ${err.status} ${err.message}`);
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error('[API] Unexpected error:', err);
  res.status(500).json({ error: '目前暫時無法取得資料，請稍後再試。' });
}

/** 取得單一作品的台灣平台摘要與 JustWatch 連結（失敗時回空結果，不影響整體搜尋結果） */
async function fetchProviderSummary(mediaType: MediaType, id: number): Promise<ProviderSummary> {
  const cacheKey = `${mediaType}:${id}`;
  const cached = providerCache.get(cacheKey);
  if (cached) return cached;
  try {
    const data = await getWatchProviders(mediaType, id);
    const region = data.results?.[REGION];
    const summary: ProviderSummary = {
      providers: toProviderSummary(region),
      link: region?.link ?? null,
    };
    providerCache.set(cacheKey, summary, TTL.PROVIDERS);
    return summary;
  } catch (err) {
    console.error(`[TMDB] watch/providers failed for ${cacheKey}:`, err);
    return { providers: [], link: null };
  }
}

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.get('/search', async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '').trim();
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);

  if (!query) {
    res.status(400).json({ error: '請輸入搜尋關鍵字' });
    return;
  }

  const cacheKey = `${query}::${page}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const raw = await searchMulti(query, page);
    const items = raw.results
      .map(toSearchResultItem)
      .filter((item): item is Omit<SearchResultItem, 'providers' | 'link'> => item !== null);

    // 並行查每筆結果的台灣平台摘要（有 6 小時快取，重複作品幾乎零成本）
    const withProviders: SearchResultItem[] = await Promise.all(
      items.map(async (item) => {
        const { providers, link } = await fetchProviderSummary(item.mediaType, item.id);
        return { ...item, providers, link };
      })
    );

    const response: SearchResponse = {
      page: raw.page,
      totalPages: raw.total_pages,
      totalResults: raw.total_results,
      results: withProviders,
    };
    searchCache.set(cacheKey, response, TTL.SEARCH);
    res.json(response);
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/:mediaType(movie|tv)/:id(\\d+)', async (req: Request, res: Response) => {
  const mediaType = req.params.mediaType as MediaType;
  const id = Number.parseInt(req.params.id, 10);

  const cacheKey = `${mediaType}:${id}`;
  const cached = detailCache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    let detail: MediaDetail;
    if (mediaType === 'movie') {
      const raw = await getMovieDetails(id);
      detail = toMovieDetail(raw, pickTaiwanRegion(raw['watch/providers']?.results));
    } else {
      const raw = await getTvDetails(id);
      detail = toTvDetail(raw, pickTaiwanRegion(raw['watch/providers']?.results));
    }

    // zh-TW 沒有翻譯簡介時，退回英文簡介
    if (!detail.overview) {
      detail.overview = await getEnglishOverview(mediaType, id).catch(() => '');
    }

    detailCache.set(cacheKey, detail, TTL.DETAIL);
    res.json(detail);
  } catch (err) {
    handleError(res, err);
  }
});

function pickTaiwanRegion(
  results: Record<string, TmdbRegionProviders> | undefined
): TmdbRegionProviders | undefined {
  return results?.[REGION];
}

export default router;
