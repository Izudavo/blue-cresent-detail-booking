import { get_catalog } from "@/lib/server/catalog/catalog.service";
import { PackagesSection } from "./PackagesSection";

export async function HomePackages() {
  try {
    const catalog = await get_catalog();

    return <PackagesSection packages={catalog.packages} />;
  } catch {
    /*
     * Packages depend on the database, but they are not
     * required for the rest of the homepage to render.
     *
     * Fail silently if the catalog is temporarily unavailable.
     */
    return null;
  }
}