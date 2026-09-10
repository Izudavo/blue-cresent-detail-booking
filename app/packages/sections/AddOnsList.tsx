import type { AddOnItem } from "@/types/catalog";

interface AddOnsListProps {
  addOns: AddOnItem[];
}

export function AddOnsList({ addOns }: AddOnsListProps) {
  return (
    <section className="border-t border-border bg-ink py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Available Add-On Upgrades
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enhance any detailing package directly inside the booking drawer.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {addOns.map((addon) => (
            <div
              key={addon.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-background p-4 transition hover:border-primary/50"
            >
              <div>
                <span className="block text-sm font-bold text-white">
                  {addon.name}
                </span>

                {addon.additionalMinutes && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    +{addon.additionalMinutes} min
                  </span>
                )}
              </div>

              <span className="mt-3 text-base font-bold text-primary">
                {addon.displayPrice}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}