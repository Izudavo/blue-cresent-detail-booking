export function PackagesSectionSkeleton() {
  return (
    <section
      id="packages"
      className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="h-3 w-20 animate-pulse rounded bg-border" />
          <div className="h-10 w-64 animate-pulse rounded bg-border sm:h-12 sm:w-80" />
        </div>

        <div className="h-11 w-56 animate-pulse rounded bg-border" />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex min-h-[430px] flex-col border border-border bg-card/60 p-8"
          >
            <div className="h-7 w-40 animate-pulse rounded bg-border" />

            <div className="mt-5 h-12 w-32 animate-pulse rounded bg-border" />

            <div className="mt-5 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-border" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-border" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-border" />
            </div>

            <div className="mt-8 flex-1 space-y-3">
              {[1, 2, 3, 4].map((line) => (
                <div
                  key={line}
                  className="h-4 w-3/4 animate-pulse rounded bg-border"
                />
              ))}
            </div>

            <div className="mt-8 h-11 w-full animate-pulse rounded bg-border" />
          </div>
        ))}
      </div>
    </section>
  );
}