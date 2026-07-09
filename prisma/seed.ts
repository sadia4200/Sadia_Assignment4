import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("=== Starting Database Seeding ===");

  // Clean old data first (order matters to respect FK constraints)
  console.log("Cleaning old data...");
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleared.");

  // 1. Seed Admin
  console.log("Seeding Admin user...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@fixitnow.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin credentials seeded:");
  console.log("   Email:    admin@fixitnow.com");
  console.log("   Password: admin123");

  // 2. Seed Categories
  console.log("Seeding Categories...");
  const categoriesData = [
    { name: "Plumbing", slug: "plumbing" },
    { name: "Electrical Services", slug: "electrical-services" },
    { name: "Home Cleaning", slug: "home-cleaning" },
    { name: "AC Repair", slug: "ac-repair" },
    { name: "Appliance Repair", slug: "appliance-repair" },
    { name: "Pest Control", slug: "pest-control" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({
      data: cat,
    });
  }
  console.log(`✅ Seeded ${categoriesData.length} categories.`);

  console.log("=== Seeding Completed Successfully! ===");
}

main()
  .catch((e) => {
    console.error("❌ Error running seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
