// backend/src/seed.ts
import prisma from "./services/prisma";
import bcrypt from "bcryptjs";

async function seed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

  const hash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, password: hash, role: "admin" }
  });

  const demoTenant = await prisma.tenant.upsert({
    where: { name: "Demo Tenant" },
    update: {},
    create: { name: "Demo Tenant", mcpServerId: "demo-mcp-001" }
  });

  console.log("seeded:", { admin: admin.email, tenant: demoTenant.name });
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
diff
