export default function Loading() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-2xl px-4 py-10 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-black dark:text-zinc-50">
          Todo
        </h1>
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
        </div>
        <div className="mt-4 rounded-2xl bg-white px-4 dark:bg-zinc-900">
          <ul>
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-b border-black/10 py-3 last:border-b-0 dark:border-white/10"
              >
                <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 flex-1 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                <div className="h-4 w-16 shrink-0 animate-pulse rounded bg-black/10 dark:bg-white/10" />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
