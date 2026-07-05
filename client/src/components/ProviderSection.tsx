import { TaiwanWatchInfo } from '../types';
import ProviderLogo from './ProviderLogo';

interface ProviderSectionProps {
  watch: TaiwanWatchInfo;
}

const CATEGORIES: { key: keyof Omit<TaiwanWatchInfo, 'link'>; label: string }[] = [
  { key: 'flatrate', label: '訂閱觀看' },
  { key: 'free', label: '免費觀看' },
  { key: 'rent', label: '租借' },
  { key: 'buy', label: '購買' },
];

/** 詳細頁的台灣 OTT 平台區塊：依 訂閱 / 免費 / 租借 / 購買 分類顯示 */
export default function ProviderSection({ watch }: ProviderSectionProps) {
  const hasAny = CATEGORIES.some(({ key }) => watch[key].length > 0);

  if (!hasAny) {
    return <p className="text-gray-500">目前未找到台灣串流平台資訊</p>;
  }

  return (
    <div className="space-y-5">
      {CATEGORIES.map(({ key, label }) => {
        const providers = watch[key];
        if (providers.length === 0) return null;
        return (
          <div key={key}>
            <h3 className="mb-2 text-sm font-medium text-gray-500">{label}</h3>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {providers.map((p) => (
                <ProviderLogo key={p.id} provider={p} showName />
              ))}
            </div>
          </div>
        );
      })}
      {watch.link && (
        <a
          href={watch.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          前往觀看資訊 ↗
        </a>
      )}
      <p className="text-xs text-gray-400">觀看平台資料由 TMDB / JustWatch 提供，可能隨時變動。</p>
    </div>
  );
}
