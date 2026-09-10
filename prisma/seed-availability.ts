import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const business_hours = [
  {
    day_of_week: 0,
    is_open: false,
    open_time: null,
    close_time: null,
  },
  {
    day_of_week: 1,
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
  },
  {
    day_of_week: 2,
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
  },
  {
    day_of_week: 3,
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
  },
  {
    day_of_week: 4,
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
  },
  {
    day_of_week: 5,
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
  },
  {
    day_of_week: 6,
    is_open: true,
    open_time: "08:00",
    close_time: "16:00",
  },
];

async function main() {
  for (const day of business_hours) {
    await prisma.businessHours.upsert({
      where: {
        day_of_week: day.day_of_week,
      },
      update: {
        is_open: day.is_open,
        open_time: day.open_time,
        close_time: day.close_time,
      },
      create: day,
    });
  }

  console.log("Availability schedule seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to seed availability:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
