"use client";

export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-lg font-medium text-black dark:text-zinc-50">
          データの読み込みに失敗しました。
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
