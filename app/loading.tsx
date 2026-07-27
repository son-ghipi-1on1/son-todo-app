export default function Loading() {
  return (
    <div className="relative flex flex-1 justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-10 dark:from-zinc-950 dark:via-black dark:to-black sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-600/10"
      />

      <main className="relative w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Todo
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            今日やることを、ひとつずつ片づけよう。
          </p>
        </header>

        <div className="mb-5 h-[52px] animate-pulse rounded-2xl bg-white/70 shadow-sm dark:bg-zinc-900/70" />

        <div className="mb-4 flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-100 dark:bg-white/5" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-zinc-100 dark:bg-white/5" />
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 px-4 py-1 shadow-sm shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60">
          <ul>
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-b border-black/5 py-2.5 last:border-b-0 dark:border-white/10"
              >
                <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                <div className="h-4 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-white/10" />
                <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
