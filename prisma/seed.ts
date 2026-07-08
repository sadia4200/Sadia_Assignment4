import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("=== Starting Database Seeding ===");

  // 1. Seed Admin
  console.log("Seeding Admin user...");
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@rentnest.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@rentnest.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin credentials seeded:");
  console.log("   Email:    admin@rentnest.com");
  console.log("   Password: Admin@123");

  // 2. Seed Categories
  console.log("Seeding Categories...");
  const categoriesData = [
    { name: "Apartment", description: "Modern apartments with shared amenities" },
    { name: "House", description: "Cozy stand-alone family houses" },
    { name: "Studio", description: "Compact and efficient single-room spaces" },
    { name: "Condo", description: "Premium condominium units" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(c);
  }
  console.log(`✅ Seeded ${categories.length} categories.`);

  // 3. Seed Landlords
  console.log("Seeding Landlord users...");
  const landlordPassword = await bcrypt.hash("Password123", 12);
  
  const landlord1 = await prisma.user.upsert({
    where: { email: "landlord1@rentnest.com" },
    update: {},
    create: {
      name: "Landlord John",
      email: "landlord1@rentnest.com",
      password: landlordPassword,
      role: "LANDLORD",
      status: "ACTIVE",
    },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: "landlord2@rentnest.com" },
    update: {},
    create: {
      name: "Landlord Sarah",
      email: "landlord2@rentnest.com",
      password: landlordPassword,
      role: "LANDLORD",
      status: "ACTIVE",
    },
  });
  console.log("✅ Seeded landlords (landlord1@rentnest.com, landlord2@rentnest.com).");

  // 4. Seed Tenants
  console.log("Seeding Tenant users...");
  const tenantPassword = await bcrypt.hash("Password123", 12);

  const tenant1 = await prisma.user.upsert({
    where: { email: "tenant1@rentnest.com" },
    update: {},
    create: {
      name: "Tenant Alice",
      email: "tenant1@rentnest.com",
      password: tenantPassword,
      role: "TENANT",
      status: "ACTIVE",
    },
  });

  const tenant2 = await prisma.user.upsert({
    where: { email: "tenant2@rentnest.com" },
    update: {},
    create: {
      name: "Tenant Bob",
      email: "tenant2@rentnest.com",
      password: tenantPassword,
      role: "TENANT",
      status: "ACTIVE",
    },
  });
  console.log("✅ Seeded tenants (tenant1@rentnest.com, tenant2@rentnest.com).");

  // 5. Seed Properties
  console.log("Seeding Properties...");
  const aptCat = categories.find((c) => c.name === "Apartment")!;
  const houseCat = categories.find((c) => c.name === "House")!;
  const studioCat = categories.find((c) => c.name === "Studio")!;
  const condoCat = categories.find((c) => c.name === "Condo")!;

  const propertiesData = [
    {
      title: "Gulshan Luxury Penthouse",
      description: "Stunning penthouse with skyline views and rooftop access.",
      location: "Gulshan, Dhaka",
      price: 1500,
      propertyType: "Apartment",
      amenities: ["wifi", "pool", "gym", "elevator", "parking"],
      images: ["penthouse_main.jpg", "penthouse_bed.jpg"],
      availability: "AVAILABLE" as const,
      landlordId: landlord1.id,
      categoryId: aptCat.id,
    },
    {
      title: "Cozy Banani Studio",
      description: "Minimalist studio apartment close to the commercial hub.",
      location: "Banani, Dhaka",
      price: 450,
      propertyType: "Apartment",
      amenities: ["wifi", "ac", "security"],
      images: ["studio_main.jpg"],
      availability: "AVAILABLE" as const,
      landlordId: landlord1.id,
      categoryId: studioCat.id,
    },
    {
      title: "Dhanmondi Lakefront House",
      description: "Large 4-bedroom house with beautiful lakefront veranda.",
      location: "Dhanmondi, Dhaka",
      price: 2500,
      propertyType: "Apartment",
      amenities: ["wifi", "lakeview", "garden", "security", "garage"],
      images: ["house_main.jpg", "house_living.jpg"],
      availability: "AVAILABLE" as const,
      landlordId: landlord2.id,
      categoryId: houseCat.id,
    },
    {
      title: "Uttara Suburban Condo",
      description: "Modern condominium in a quiet residential sector.",
      location: "Uttara, Dhaka",
      price: 800,
      propertyType: "Apartment",
      amenities: ["wifi", "gym", "elevator", "security"],
      images: ["condo_main.jpg"],
      availability: "AVAILABLE" as const,
      landlordId: landlord2.id,
      categoryId: condoCat.id,
    },
  ];

  const properties = [];
  for (const prop of propertiesData) {
    let p = await prisma.property.findFirst({
      where: { title: prop.title },
    });
    if (!p) {
      p = await prisma.property.create({
        data: prop,
      });
    }
    properties.push(p);
  }
  console.log(`✅ Seeded ${properties.length} properties.`);

  // 6. Seed Rental Requests & Payments & Reviews
  console.log("Seeding Rental Request lifecycle flow...");
  const prop1 = properties[0];
  const prop2 = properties[1];
  const prop3 = properties[2];

  // Request 1: PENDING (Tenant 1 -> Penthouse)
  const existingPending = await prisma.rentalRequest.findFirst({
    where: {
      tenantId: tenant1.id,
      propertyId: prop1.id,
      status: "PENDING",
    },
  });
  if (!existingPending) {
    await prisma.rentalRequest.create({
      data: {
        tenantId: tenant1.id,
        propertyId: prop1.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 30,
        status: "PENDING",
      },
    });
  }

  // Request 2: APPROVED (Tenant 1 -> Banani Studio)
  const existingApproved = await prisma.rentalRequest.findFirst({
    where: {
      tenantId: tenant1.id,
      propertyId: prop2.id,
      status: "APPROVED",
    },
  });
  if (!existingApproved) {
    await prisma.rentalRequest.create({
      data: {
        tenantId: tenant1.id,
        propertyId: prop2.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        duration: 15,
        status: "APPROVED",
      },
    });
  }

  // Request 3: COMPLETED + Payment + Review (Tenant 2 -> Dhanmondi Lakefront)
  const existingCompleted = await prisma.rentalRequest.findFirst({
    where: {
      tenantId: tenant2.id,
      propertyId: prop3.id,
      status: "COMPLETED",
    },
  });
  if (!existingCompleted) {
    const completedRequest = await prisma.rentalRequest.create({
      data: {
        tenantId: tenant2.id,
        propertyId: prop3.id,
        startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        duration: 30,
        status: "COMPLETED",
      },
    });

    // Create a completed payment
    await prisma.payment.create({
      data: {
        rentalRequestId: completedRequest.id,
        transactionId: "cs_demo_completed_transaction",
        amount: prop3.price,
        method: "CARD",
        provider: "STRIPE",
        status: "COMPLETED",
        paidAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
    });

    // Create a review
    await prisma.review.create({
      data: {
        tenantId: tenant2.id,
        propertyId: prop3.id,
        rentalRequestId: completedRequest.id,
        rating: 5,
        comment: "Amazing place, highly recommend! Veranda view is beautiful.",
      },
    });
  }
  console.log("✅ Seeded rental lifecycle flows (PENDING, APPROVED, COMPLETED with Payment & Review).");

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
