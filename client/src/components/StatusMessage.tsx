interface StatusMessageProps {
  type: 'empty' | 'error';
  message?: string;
}

/** 查無結果 / API 錯誤的統一狀態顯示 */
export default function StatusMessage({ type, message }: StatusMessageProps) {
  const defaults = {
    empty: { icon: '🔍', text: '找不到符合的作品' },
    error: { icon: '⚠️', text: '目前暫時無法取得資料，請稍後再試。' },
  } as const;

  const { icon, text } = defaults[type];

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-gray-600">{message ?? text}</p>
    </div>
  );
}
