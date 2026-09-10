import {
  InclusionGroup,
  PrismaClient,
  VehicleType,
} from "@prisma/client";

const prisma = new PrismaClient();

const packages = [
  {
    slug: "express-detail",
    name: "Express Detail",
    badge: null,
    description: "Perfect for routine upkeep and a quick refresh.",
    estimated_time: "1 – 1.5 Hours",
    duration_minutes: 90,
    featured: false,
    sort_order: 1,

    prices: [
      {
        vehicle_type: VehicleType.CARS,
        price: 65,
      },
    ],

    inclusions: [
      "Exterior hand wash",
      "Wheels & tires cleaned",
      "Tire shine",
      "Windows cleaned inside & out",
      "Interior vacuum",
      "Dash & console wipe-down",
      "Door jambs wiped",
    ].map((name, index) => ({
      name,
      group: InclusionGroup.GENERAL,
      sort_order: index + 1,
    })),
  },

  {
    slug: "interior-reset",
    name: "Interior Reset",
    badge: null,
    description: "Give your interior the deep clean it needs.",
    estimated_time: "2 – 4 Hours",
    duration_minutes: 180,
    featured: false,
    sort_order: 2,

    prices: [
      {
        vehicle_type: VehicleType.CARS,
        price: 125,
      },
      {
        vehicle_type: VehicleType.SUVS_TRUCKS,
        price: 150,
      },
    ],

    inclusions: [
      "Thorough vacuum",
      "Carpet cleaning",
      "Floor mat cleaning",
      "Seats cleaned",
      "Dash, console & door panels detailed",
      "Cup holders & crevices cleaned",
      "Interior plastics cleaned",
      "Interior windows & mirrors",
      "Door jambs",
      "Interior deodorizing",
    ].map((name, index) => ({
      name,
      group: InclusionGroup.GENERAL,
      sort_order: index + 1,
    })),
  },

  {
    slug: "exterior-revival",
    name: "Exterior Revival",
    badge: null,
    description: "Bring back that freshly detailed shine.",
    estimated_time: "2 – 3 Hours",
    duration_minutes: 150,
    featured: false,
    sort_order: 3,

    prices: [
      {
        vehicle_type: VehicleType.CARS,
        price: 125,
      },
      {
        vehicle_type: VehicleType.SUVS_TRUCKS,
        price: 150,
      },
    ],

    inclusions: [
      "Pre-rinse & foam bath",
      "Two-bucket hand wash",
      "Wheels & wheel wells cleaned",
      "Tires scrubbed & dressed",
      "Bug removal",
      "Exterior glass cleaned",
      "Door jambs cleaned",
      "Paint decontamination",
      "Spray wax/sealant",
      "Exterior trim dressed",
    ].map((name, index) => ({
      name,
      group: InclusionGroup.GENERAL,
      sort_order: index + 1,
    })),
  },

  {
    slug: "full-phase-detail",
    name: "Full Phase Detail",
    badge: "Most Popular",
    description: "The complete Blue Crescent treatment.",
    estimated_time: "4 – 6 Hours",
    duration_minutes: 300,
    featured: true,
    sort_order: 4,

    prices: [
      {
        vehicle_type: VehicleType.CARS,
        price: 225,
      },
      {
        vehicle_type: VehicleType.SUVS_TRUCKS,
        price: 275,
      },
    ],

    inclusions: [
      {
        group: InclusionGroup.EXTERIOR,
        items: [
          "Foam bath & hand wash",
          "Wheels, tires & wheel wells",
          "Bug removal",
          "Paint decontamination",
          "Exterior glass",
          "Tire dressing",
          "Paint sealant/protection",
          "Exterior trim dressing",
        ],
      },
      {
        group: InclusionGroup.INTERIOR,
        items: [
          "Deep vacuum",
          "Carpet & floor mat cleaning",
          "Seat cleaning",
          "Dash, console & door panels",
          "Cup holders, vents & crevices",
          "Interior glass",
          "Door jambs",
          "Interior deodorizing",
        ],
      },
    ].flatMap(({ group, items }) =>
      items.map((name, index) => ({
        name,
        group,
        sort_order: index + 1,
      })),
    ),
  },

  {
    slug: "new-moon-deep-clean",
    name: "New Moon Deep Clean",
    badge: null,
    description:
      "For vehicles that need serious attention. Includes everything in the Full Phase Detail, plus:",
    estimated_time: "5 – 7 Hours",
    duration_minutes: 360,
    featured: false,
    sort_order: 5,

    prices: [
      {
        vehicle_type: VehicleType.CARS,
        price: 325,
      },
    ],

    inclusions: [
      "Intensive carpet cleaning",
      "Deep seat extraction where applicable",
      "Heavy stain treatment",
      "Pet hair removal",
      "Heavy dirt & grime removal",
      "Detailed cracks, seams & hard-to-reach areas",
      "Extended interior deodorizing",
    ].map((name, index) => ({
      name,
      group: InclusionGroup.GENERAL,
      sort_order: index + 1,
    })),
  },
];

const add_ons = [
  {
    slug: "headlight-restoration",
    name: "Headlight Restoration",
    price: 60,
    additional_minutes: 45,
    sort_order: 1,
  },
  {
    slug: "engine-bay-detail",
    name: "Engine Bay Detail",
    price: 50,
    additional_minutes: 30,
    sort_order: 2,
  },
  {
    slug: "pet-hair-removal",
    name: "Pet Hair Removal",
    price: 30,
    additional_minutes: 30,
    sort_order: 3,
  },
  {
    slug: "heavy-stain-treatment",
    name: "Heavy Stain Treatment",
    price: 25,
    additional_minutes: 30,
    sort_order: 4,
  },
  {
    slug: "seat-carpet-extraction",
    name: "Seat/Carpet Extraction",
    price: 50,
    additional_minutes: 45,
    sort_order: 5,
  },
  {
    slug: "clay-bar-treatment",
    name: "Clay Bar Treatment",
    price: 50,
    additional_minutes: 45,
    sort_order: 6,
  },
  {
    slug: "paint-sealant-upgrade",
    name: "Paint Sealant Upgrade",
    price: 40,
    additional_minutes: 20,
    sort_order: 7,
  },
  {
    slug: "trim-restoration",
    name: "Trim Restoration",
    price: 40,
    additional_minutes: 30,
    sort_order: 8,
  },
  {
    slug: "odor-treatment",
    name: "Odor Treatment",
    price: 40,
    additional_minutes: 30,
    sort_order: 9,
  },
];

async function main() {
  console.log("Seeding Blue Crescent catalog...");

  for (const service_package of packages) {
    const { prices, inclusions, ...package_data } = service_package;

    const existing_package = await prisma.servicePackage.findUnique({
      where: {
        slug: package_data.slug,
      },
    });

    if (existing_package) {
      console.log(`Skipping existing package: ${package_data.name}`);
      continue;
    }

    await prisma.servicePackage.create({
      data: {
        ...package_data,

        prices: {
          create: prices,
        },

        inclusions: {
          create: inclusions,
        },
      },
    });

    console.log(`Created package: ${package_data.name}`);
  }

  for (const add_on of add_ons) {
    const existing_add_on = await prisma.addOn.findUnique({
      where: {
        slug: add_on.slug,
      },
    });

    if (existing_add_on) {
      console.log(`Skipping existing add-on: ${add_on.name}`);
      continue;
    }

    await prisma.addOn.create({
      data: add_on,
    });

    console.log(`Created add-on: ${add_on.name}`);
  }

  console.log("Catalog seeding complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });