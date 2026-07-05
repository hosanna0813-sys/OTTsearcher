import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

/** 首頁：大量留白、置中站名與搜尋框，手機優先 */
export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-xl -translate-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          台灣 OTT 搜尋
        </h1>
        <p className="mt-4 text-base text-gray-500 sm:text-lg">
          搜尋電影與影集，在台灣哪裡可以看。
        </p>
        <div className="mt-10">
          <SearchBar value={query} onChange={setQuery} onSubmit={handleSubmit} size="large" />
        </div>
      </div>
      <footer className="absolute bottom-6 px-6 text-center text-xs text-gray-400">
        資料來源：TMDB・觀看平台資訊由 JustWatch 提供
      </footer>
    </main>
  );
}
