import type { PackageItem } from "@/types/catalog";

interface PackageCardProps {
  packageData: PackageItem;
  onSelect: (pkg: PackageItem) => void;
}

export function PackageCard({ packageData: p, onSelect }: PackageCardProps) {
  return (
    <article
      className={`relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all sm:p-8 lg:flex-row lg:items-center ${
        p.featured
          ? "border-primary bg-background shadow-lg shadow-primary/10 ring-1 ring-primary"
          : "border-border bg-background hover:border-primary/50 hover:bg-ink"
      }`}
    >
      <div className="lg:max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-bold text-white">{p.name}</h3>

          {p.badge && (
            <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">
              {p.badge}
            </span>
          )}

          <span className="rounded-md border border-border bg-ink px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Est. {p.estimatedTime}
          </span>
        </div>

        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          {p.description}
        </p>

        {p.items.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {p.items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-ink/60 px-3 py-1 text-xs font-medium text-white"
              >
                <span className="font-bold text-primary">✓</span> {item}
              </span>
            ))}
          </div>
        )}

        {p.exteriorItems && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-ink/60 p-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-primary">
                Exterior Process
              </span>

              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {p.exteriorItems.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="text-primary">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {p.interiorItems && (
              <div className="rounded-xl border border-border bg-ink/60 p-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-primary">
                  Interior Process
                </span>

                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {p.interiorItems.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="text-primary">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 lg:mt-0 lg:flex-col lg:items-end lg:justify-center lg:border-t-0 lg:pt-0">
        <div className="text-left lg:text-right">
          {p.displayStartingPrice ? (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Starting at
              </span>

              <span className="text-3xl font-extrabold text-white">
                {p.displayStartingPrice}
              </span>
            </div>
          ) : p.prices ? (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Starting prices
              </span>

              <div className="flex gap-4 lg:justify-end">
                {p.prices.map((item) => (
                  <div key={item.label} className="text-left lg:text-right">
                    <span className="block text-[10px] uppercase text-muted-foreground">
                      {item.label}
                    </span>

                    <span className="text-lg font-bold text-white">
                      {item.displayPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onSelect(p)}
          className="btn-base btn-primary mt-3"
        >
          Book Package
        </button>
      </div>
    </article>
  );
}