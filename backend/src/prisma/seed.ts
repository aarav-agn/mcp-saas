import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@local.test";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const demoTenantName = "Demo Tenant";

  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: `user_${uuidv4()}`,
      name: "Admin",
      email: adminEmail,
      password: hashed,
      role: "admin"
    }
  });

  // Create a personal tenant for admin (Option 3 -- personal tenant on signup)
  const personalTenant = await prisma.tenant.upsert({
    where: { ownerId: admin.id },
    update: {},
    create: {
      id: `tenant_${uuidv4()}`,
      name: `${admin.name}'s Personal Tenant`,
      ownerId: admin.id,
      mcpServerId: `mcp-${uuidv4()}`
    }
  });

  // link personalTenant to user
  await prisma.user.update({ where: { id: admin.id }, data: { personalTenantId: personalTenant.id }});

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { name: demoTenantName },
    update: {},
    create: {
      id: `tenant_${uuidv4()}`,
      name: demoTenantName,
      ownerId: admin.id,
      mcpServerId: `mcp-${uuidv4()}`
    }
  });

  // Add admin membership to demo tenant
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: admin.id, tenantId: demoTenant.id } },
    update: {},
    create: {
      userId: admin.id,
      tenantId: demoTenant.id,
      role: "OWNER"
    }
  });

  console.log("Seeded admin and demo tenant:");
  console.log({ admin: admin.email, personalTenant: personalTenant.name, demoTenant: demoTenant.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
