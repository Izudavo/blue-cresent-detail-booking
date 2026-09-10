export interface PriceTier {
  label: "Cars" | "SUVs/Trucks" | string;
  price: number;
  displayPrice: string;
}

export interface PackageItem {
  id: string;
  name: string;
  badge?: string;
  featured?: boolean;
  startingPrice?: number;
  displayStartingPrice?: string;
  prices?: PriceTier[];
  description: string;
  estimatedTime: string;
  durationMinutes: number;
  items: string[];
  exteriorItems?: string[];
  interiorItems?: string[];
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  displayPrice: string;
  additionalMinutes?: number;
}

export interface Catalog {
  packages: PackageItem[];
  addOns: AddOnItem[];
}