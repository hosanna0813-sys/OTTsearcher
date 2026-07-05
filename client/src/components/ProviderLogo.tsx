import { Provider } from '../types';
import { imageUrl } from '../services/api';

interface ProviderLogoProps {
  provider: Provider;
  /** 是否在 Logo 旁顯示平台名稱（詳細頁用） */
  showName?: boolean;
  /** 有值時 Logo 可點擊，開新分頁前往該平台 */
  href?: string | null;
}

/** OTT 平台 Logo（搜尋卡片摘要與詳細頁共用），有 href 時可點擊前往該平台 */
export default function ProviderLogo({ provider, showName = false, href }: ProviderLogoProps) {
  const logo = imageUrl.logo(provider.logoPath);

  const content = (
    <>
      {logo ? (
        <img
          src={logo}
          alt={provider.name}
          loading="lazy"
          className="h-11 w-11 rounded-lg object-cover shadow-sm"
        />
      ) : (
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-500">
          {provider.name.slice(0, 2)}
        </span>
      )}
      {showName && <span className="text-sm text-gray-800">{provider.name}</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={provider.name}
        aria-label={`前往 ${provider.name}`}
        className="inline-flex items-center gap-2 transition-opacity hover:opacity-75 active:opacity-60"
      >
        {content}
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2" title={provider.name}>
      {content}
    </span>
  );
}
