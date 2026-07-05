/**
 * 平台名稱 → 搜尋網址樣板的對照表。
 * TMDB 不提供「這部片在 Netflix 上的確切網址」這種逐平台深層連結，
 * 只有一個 region 層級的 JustWatch 彙整連結。這裡改用「組出該平台的
 * 搜尋頁網址」來逼近使用者要的體驗——手機瀏覽器點這類網址通常會自動
 * 跳轉到已安裝的 App，但落點是搜尋結果頁，不保證精準命中該片。
 * 對照不到的平台由呼叫端 fallback 回 TMDB 的 JustWatch link。
 */

interface ProviderLinkRule {
  match: string[];
  url: (query: string) => string;
}

const PROVIDER_LINK_RULES: ProviderLinkRule[] = [
  { match: ['netflix'], url: (q) => `https://www.netflix.com/search?q=${q}` },
  { match: ['disney'], url: (q) => `https://www.disneyplus.com/search?q=${q}` },
  { match: ['apple tv'], url: (q) => `https://tv.apple.com/search?term=${q}` },
  { match: ['amazon', 'prime video'], url: (q) => `https://www.amazon.com/s?k=${q}&i=instant-video` },
  { match: ['youtube'], url: (q) => `https://www.youtube.com/results?search_query=${q}` },
  { match: ['google play'], url: (q) => `https://play.google.com/store/search?q=${q}&c=movies` },
  { match: ['catchplay'], url: (q) => `https://www.catchplay.com/tw/search?keyword=${q}` },
  { match: ['friday'], url: (q) => `https://video.friday.tw/search?keyword=${q}` },
  { match: ['myvideo'], url: (q) => `https://www.myvideo.net.tw/next/search?keyword=${q}` },
  { match: ['kktv'], url: (q) => `https://www.kktv.me/search?q=${q}` },
  { match: ['line tv'], url: (q) => `https://www.linetv.tw/search?word=${q}` },
  { match: ['hami'], url: (q) => `https://hamivideo.hinet.net/search.do?keyword=${q}` },
  { match: ['max', 'hbo'], url: (q) => `https://www.max.com/search?q=${q}` },
  { match: ['crunchyroll'], url: (q) => `https://www.crunchyroll.com/search?q=${q}` },
];

/** 依平台名稱組出「該平台搜尋此片名」的網址，對照不到時回傳 null */
export function getProviderDeepLink(providerName: string, title: string): string | null {
  const name = providerName.toLowerCase();
  const rule = PROVIDER_LINK_RULES.find((r) => r.match.some((m) => name.includes(m)));
  if (!rule) return null;
  return rule.url(encodeURIComponent(title));
}
