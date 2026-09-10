import { prisma } from "@/lib/prisma";
import { hash_password } from "@/lib/server/auth/auth.utils";

async function main() {
  const username =
    process.env.ADMIN_USERNAME?.trim();

  const password =
    process.env.ADMIN_PASSWORD;

  if (!username) {
    throw new Error(
      "ADMIN_USERNAME is required.",
    );
  }

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is required.",
    );
  }

  if (password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters long.",
    );
  }

  const password_hash =
    await hash_password(password);

  const existing_admin =
    await prisma.adminUser.findUnique({
      where: {
        username,
      },
    });

  if (existing_admin) {
    await prisma.adminUser.update({
      where: {
        id: existing_admin.id,
      },
      data: {
        password_hash,
        is_active: true,
      },
    });

    console.log(
      `Admin "${username}" updated successfully.`,
    );

    return;
  }

  await prisma.adminUser.create({
    data: {
      username,
      password_hash,
      is_active: true,
    },
  });

  console.log(
    `Admin "${username}" created successfully.`,
  );
}

main()
  .catch((error) => {
    console.error(
      "Admin seed failed:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

