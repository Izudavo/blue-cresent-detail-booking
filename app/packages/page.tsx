import { Header } from "@/app/packages/sections/Header";
import { FallingCrescents } from "@/app/packages/sections/FallingCrescents";
import { PackagesClient } from "@/app/packages/PackagesClient";
import { get_catalog } from "@/lib/server/catalog/catalog.service";

export default async function PackagesPage() {
  const catalog = await get_catalog();

  return (
    <div className="relative min-h-screen bg-ink font-sans text-white selection:bg-primary selection:text-ink">
      <FallingCrescents />

      <div className="relative z-10">
        <Header />

        <main className="py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-8 border-b border-border pb-4">
              <p className="eyebrow">Pricing & Plans</p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Select a Package
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Pick a service tier to begin customizing your booking.
              </p>
            </div>

            <PackagesClient
              packages={catalog.packages}
              addOns={catalog.addOns}
            />
          </div>
        </main>
      </div>
    </div>
  );
}