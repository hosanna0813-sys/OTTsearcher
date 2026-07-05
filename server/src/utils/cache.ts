/**
 * 簡易記憶體 TTL 快取。
 * - 每筆資料有各自的過期時間
 * - 超過容量上限時淘汰最舊的一筆（Map 保留插入順序）
 * 適合單機 MVP；不需要外部 Redis。
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private maxSize = 500) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    // 容量滿時淘汰最舊的一筆
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

/** 常用 TTL（毫秒） */
export const TTL = {
  SEARCH: 10 * 60 * 1000, // 搜尋結果 10 分鐘
  DETAIL: 30 * 60 * 1000, // 詳細資料 30 分鐘
  PROVIDERS: 6 * 60 * 60 * 1000, // 觀看平台 6 小時
} as const;
