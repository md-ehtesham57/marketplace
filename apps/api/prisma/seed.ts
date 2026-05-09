import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../.env")});
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ───────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: { name: "Electronics", slug: "electronics", icon: "📱" },
    }),
    prisma.category.upsert({
      where: { slug: "fashion" },
      update: {},
      create: { name: "Fashion", slug: "fashion", icon: "👗" },
    }),
    prisma.category.upsert({
      where: { slug: "home-living" },
      update: {},
      create: { name: "Home & Living", slug: "home-living", icon: "🛋️" },
    }),
    prisma.category.upsert({
      where: { slug: "sports" },
      update: {},
      create: { name: "Sports", slug: "sports", icon: "⚽" },
    }),
    prisma.category.upsert({
      where: { slug: "beauty" },
      update: {},
      create: { name: "Beauty", slug: "beauty", icon: "💄" },
    }),
  ]);

  console.log("✅ Categories created");

  // ── Seller User ──────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@marketplace.com" },
    update: {},
    create: {
      email: "seller@marketplace.com",
      password: hashedPassword,
      firstName: "Tech",
      lastName: "Store",
      role: "SELLER",
    },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: "TechZone Store",
      description: "Best electronics at best prices",
      rating: 4.8,
      isVerified: true,
    },
  });

  console.log("✅ Seller created");

  // ── Products ─────────────────────────────────────────────
  const products = [
    {
      name: "Wireless Noise Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      description: "Experience premium sound with 40mm drivers and 30-hour battery life.",
      price: 2999,
      originalPrice: 4999,
      stock: 50,
      images: [],
      isFeatured: true,
      rating: 4.5,
      totalReviews: 2341,
      categoryId: categories[0].id,
      sellerId: seller.id,
    },
    {
      name: "Mechanical Keyboard RGB",
      slug: "mechanical-keyboard-rgb",
      description: "Premium mechanical keyboard with RGB backlighting and tactile switches.",
      price: 4499,
      originalPrice: 5999,
      stock: 30,
      images: [],
      isFeatured: true,
      rating: 4.8,
      totalReviews: 1876,
      categoryId: categories[0].id,
      sellerId: seller.id,
    },
    {
      name: "Premium Leather Wallet",
      slug: "premium-leather-wallet",
      description: "Genuine leather wallet with RFID blocking and multiple card slots.",
      price: 799,
      originalPrice: 1299,
      stock: 100,
      images: [],
      isFeatured: false,
      rating: 4.3,
      totalReviews: 876,
      categoryId: categories[1].id,
      sellerId: seller.id,
    },
    {
      name: "Ergonomic Office Chair",
      slug: "ergonomic-office-chair",
      description: "Adjustable lumbar support with breathable mesh back for all-day comfort.",
      price: 8999,
      originalPrice: 12999,
      stock: 15,
      images: [],
      isFeatured: true,
      rating: 4.7,
      totalReviews: 1203,
      categoryId: categories[2].id,
      sellerId: seller.id,
    },
    {
      name: "Running Shoes Pro",
      slug: "running-shoes-pro",
      description: "Lightweight running shoes with advanced cushioning technology.",
      price: 3499,
      originalPrice: 4999,
      stock: 45,
      images: [],
      isFeatured: false,
      rating: 4.4,
      totalReviews: 567,
      categoryId: categories[3].id,
      sellerId: seller.id,
    },
    {
      name: "Skincare Essentials Kit",
      slug: "skincare-essentials-kit",
      description: "Complete skincare routine with cleanser, toner, and moisturizer.",
      price: 1299,
      originalPrice: 1999,
      stock: 60,
      images: [],
      isFeatured: true,
      rating: 4.6,
      totalReviews: 934,
      categoryId: categories[4].id,
      sellerId: seller.id,
    },
    {
      name: "Yoga Mat Premium",
      slug: "yoga-mat-premium",
      description: "Non-slip premium yoga mat with alignment lines and carrying strap.",
      price: 999,
      originalPrice: 1499,
      stock: 80,
      images: [],
      isFeatured: false,
      rating: 4.2,
      totalReviews: 432,
      categoryId: categories[3].id,
      sellerId: seller.id,
    },
    {
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      description: "Double-wall insulated bottle keeps drinks cold 24hrs, hot 12hrs.",
      price: 599,
      originalPrice: 899,
      stock: 120,
      images: [],
      isFeatured: true,
      rating: 4.5,
      totalReviews: 1120,
      categoryId: categories[2].id,
      sellerId: seller.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log("✅ Products created");

  // ── Admin User ───────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@marketplace.com" },
    update: {},
    create: {
      email: "admin@marketplace.com",
      password: await bcrypt.hash("admin123", 12),
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });