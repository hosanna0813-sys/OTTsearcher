import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';
import SkeletonCard from '../components/SkeletonCard';
import StatusMessage from '../components/StatusMessage';
import { useDebounce } from '../hooks/useDebounce';
import { searchMedia } from '../services/api';
import { SearchResultItem } from '../types';

type Status = 'idle' | 'loading' | 'loadingMore' | 'success' | 'error';

/** 搜尋結果頁：/search?q=…，輸入即時 debounce 搜尋並同步網址 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';

  const [input, setInput] = useState(urlQuery);
  const debouncedInput = useDebounce(input, 400);

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [status, setStatus] = useState<Status>(urlQuery ? 'loading' : 'idle');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  // 輸入停止 400ms 後，把關鍵字同步到 ?q=（replace 避免灌爆瀏覽器歷史）
  useEffect(() => {
    const q = debouncedInput.trim();
    if (q !== urlQuery) {
      setSearchParams(q ? { q } : {}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  const runSearch = useCallback((query: string, pageToLoad: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus(pageToLoad === 1 ? 'loading' : 'loadingMore');

    searchMedia(query, pageToLoad, controller.signal)
      .then((data) => {
        setResults((prev) => (pageToLoad === 1 ? data.results : [...prev, ...data.results]));
        setPage(data.page);
        setTotalPages(data.totalPages);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
      });
  }, []);

  // ?q= 變動時重新搜尋第一頁
  useEffect(() => {
    if (!urlQuery) {
      setResults([]);
      setStatus('idle');
      return;
    }
    runSearch(urlQuery, 1);
    return () => abortRef.current?.abort();
  }, [urlQuery, runSearch]);

  const canLoadMore = status === 'success' && page < totalPages;

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 bg-gray-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="shrink-0 text-lg font-bold text-gray-900" aria-label="回到首頁">
            OTT<span className="text-gray-400">搜尋</span>
          </Link>
          <div className="flex-1">
            <SearchBar value={input} onChange={setInput} autoFocus={!urlQuery} />
          </div>
        </div>
      </header>

      <section className="mt-4 space-y-4">
        {status === 'idle' && (
          <p className="py-16 text-center text-gray-400">輸入片名或關鍵字開始搜尋</p>
        )}

        {status === 'loading' &&
          Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)}

        {status === 'error' && <StatusMessage type="error" />}

        {(status === 'success' || status === 'loadingMore') && results.length === 0 && (
          <StatusMessage type="empty" />
        )}

        {(status === 'success' || status === 'loadingMore') &&
          results.map((item) => <ResultCard key={`${item.mediaType}-${item.id}`} item={item} />)}

        {status === 'loadingMore' && <SkeletonCard />}

        {canLoadMore && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => runSearch(urlQuery, page + 1)}
              className="min-h-[44px] rounded-xl border border-gray-300 bg-white px-8 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              載入更多
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
