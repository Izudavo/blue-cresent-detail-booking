import { get_catalog } from "@/lib/server/catalog/catalog.service";
import { PackagesSection } from "./PackagesSection";

export async function HomePackages() {
  const catalog = await get_catalog();

  return <PackagesSection packages={catalog.packages} />;
}