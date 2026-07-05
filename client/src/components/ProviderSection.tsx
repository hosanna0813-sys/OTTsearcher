import { TaiwanWatchInfo } from '../types';
import { getProviderDeepLink } from '../services/providerLinks';
import ProviderLogo from './ProviderLogo';

interface ProviderSectionProps {
  watch: TaiwanWatchInfo;
  title: string;
}

const CATEGORIES: { key: keyof Omit<TaiwanWatchInfo, 'link'>; label: string }[] = [
  { key: 'flatrate', label: '訂閱觀看' },
  { key: 'free', label: '免費觀看' },
  { key: 'rent', label: '租借' },
  { key: 'buy', label: '購買' },
];

/** 詳細頁的台灣 OTT 平台區塊：依 訂閱 / 免費 / 租借 / 購買 分類顯示 */
export default function ProviderSection({ watch, title }: ProviderSectionProps) {
  const hasAny = CATEGORIES.some(({ key }) => watch[key].length > 0);

  if (!hasAny) {
    return (
      <p className="flex items-center gap-2 text-base font-medium text-gray-500">
        <span aria-hidden="true" className="text-xl">
          📺
        </span>
        目前未找到台灣串流平台資訊
      </p>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl bg-gray-50 p-4 sm:p-5">
      {CATEGORIES.map(({ key, label }) => {
        const providers = watch[key];
        if (providers.length === 0) return null;
        return (
          <div key={key}>
            <h3 className="mb-2 text-sm font-medium text-gray-500">{label}</h3>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {providers.map((p) => (
                <ProviderLogo
                  key={p.id}
                  provider={p}
                  showName
                  href={getProviderDeepLink(p.name, title) ?? watch.link ?? undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400">觀看平台資料由 TMDB / JustWatch 提供，可能隨時變動；點擊平台圖示會前往該平台搜尋此作品。</p>
    </div>
  );
}
