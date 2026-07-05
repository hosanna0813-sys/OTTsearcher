import { Provider } from '../types';
import { imageUrl } from '../services/api';

interface ProviderLogoProps {
  provider: Provider;
  /** 是否在 Logo 旁顯示平台名稱（詳細頁用） */
  showName?: boolean;
}

/** OTT 平台 Logo（搜尋卡片摘要與詳細頁共用） */
export default function ProviderLogo({ provider, showName = false }: ProviderLogoProps) {
  const logo = imageUrl.logo(provider.logoPath);

  return (
    <span className="inline-flex items-center gap-2" title={provider.name}>
      {logo ? (
        <img
          src={logo}
          alt={provider.name}
          loading="lazy"
          className="h-9 w-9 rounded-lg object-cover shadow-sm"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-500">
          {provider.name.slice(0, 2)}
        </span>
      )}
      {showName && <span className="text-sm text-gray-800">{provider.name}</span>}
    </span>
  );
}
