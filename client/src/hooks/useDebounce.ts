import { useEffect, useState } from 'react';

/** 回傳延遲 delay 毫秒後才更新的值，用於搜尋輸入 debounce */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
