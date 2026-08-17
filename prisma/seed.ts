import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@demo-aerospace.test";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123!";

  const company = await prisma.company.upsert({
    where: { id: "demo-company" },
    update: {},
    create: { id: "demo-company", name: "Demo Aerospace Solutions" },
  });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Demo Admin",
      role: "ADMIN",
      companyId: company.id,
    },
  });

  console.log(`Seeded company "${company.name}" and admin user "${user.email}"`);
  console.log(`Login with: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
