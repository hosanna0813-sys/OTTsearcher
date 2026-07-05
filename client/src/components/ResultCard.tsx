import { Link } from 'react-router-dom';
import { SearchResultItem } from '../types';
import { imageUrl } from '../services/api';
import { getProviderDeepLink } from '../services/providerLinks';
import ProviderLogo from './ProviderLogo';

interface ResultCardProps {
  item: SearchResultItem;
}

/** 搜尋結果卡片：海報 + 中英文名稱 + 年份 + 類型 + 評分 + 簡介 + 台灣平台摘要 */
export default function ResultCard({ item }: ResultCardProps) {
  const poster = imageUrl.poster(item.posterPath);
  const showOriginalTitle = item.originalTitle && item.originalTitle !== item.title;
  const detailPath = `/${item.mediaType}/${item.id}`;

  return (
    // 外層用 div（非 Link），因為平台圖示各自也是連結，不能把 <a> 巢狀在 <a> 裡面
    <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      {/* 海報固定 2:3 比例，避免版面跳動 */}
      <Link to={detailPath} className="w-24 shrink-0 sm:w-28">
        {poster ? (
          <img
            src={poster}
            alt={item.title}
            loading="lazy"
            className="aspect-[2/3] w-full rounded-xl bg-gray-100 object-cover"
          />
        ) : (
          <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-gray-100 text-3xl">
            🎬
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={detailPath} className="block">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">{item.title}</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {item.mediaType === 'movie' ? '電影' : '影集'}
            </span>
          </div>

          <p className="mt-0.5 truncate text-sm text-gray-500">
            {showOriginalTitle ? `${item.originalTitle}・` : ''}
            {item.year || '年份未知'}
          </p>

          {item.voteAverage > 0 && (
            <p className="mt-1 text-sm text-gray-700">★ {item.voteAverage.toFixed(1)}</p>
          )}

          {item.overview && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">{item.overview}</p>
          )}
        </Link>

        {/* 台灣可觀看平台摘要：獨立於上方的 Link 之外，圖示各自可點擊前往該平台 */}
        <div className="mt-3">
          {item.providers.length > 0 ? (
            <>
              <p className="mb-1.5 text-xs font-medium text-gray-500">可在以下平台觀看</p>
              <div className="flex flex-wrap items-center gap-3">
                {item.providers.map((p) => (
                  <ProviderLogo
                    key={p.id}
                    provider={p}
                    href={getProviderDeepLink(p.name, item.title) ?? item.link ?? undefined}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400">目前未找到台灣串流平台資訊</p>
          )}
        </div>
      </div>
    </div>
  );
}
