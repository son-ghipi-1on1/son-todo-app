"use client";

export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white px-4 dark:from-zinc-950 dark:via-black dark:to-black">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-600/10"
      />

      <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-black/5 bg-white/80 p-8 text-center shadow-sm shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="h-10 w-10 text-red-400 dark:text-red-500"
        >
          <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.198 0l6.517 11.26c1.155 2-.289 4.5-2.599 4.5H5.483c-2.31 0-3.754-2.5-2.599-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-base font-medium text-zinc-800 dark:text-zinc-100">
          データの読み込みに失敗しました。
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-transform hover:scale-[1.02] active:scale-95"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
