import { FormEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  /** 首頁用大尺寸，搜尋頁用一般尺寸 */
  size?: 'large' | 'normal';
}

/** 搜尋框：手機優先，輸入區大且好點擊 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  autoFocus = false,
  size = 'normal',
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const heightClass = size === 'large' ? 'h-14 text-lg' : 'h-12 text-base';

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="輸入片名、影集名或關鍵字"
        aria-label="搜尋電影與影集"
        className={`${heightClass} min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white px-5 text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200`}
      />
      <button
        type="submit"
        className={`${heightClass} shrink-0 rounded-2xl bg-gray-900 px-6 font-medium text-white transition-colors hover:bg-gray-700 active:bg-gray-800`}
      >
        搜尋
      </button>
    </form>
  );
}
