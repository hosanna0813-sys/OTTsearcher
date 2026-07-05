/** 搜尋結果載入中的 Skeleton 卡片 */
export default function SkeletonCard() {
  return (
    <div className="flex animate-pulse gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="aspect-[2/3] w-24 shrink-0 rounded-xl bg-gray-200 sm:w-28" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
        <div className="flex gap-2 pt-1">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
