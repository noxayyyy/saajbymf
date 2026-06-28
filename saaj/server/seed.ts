import { db } from "./storage";
import { collections, products, users } from "@shared/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "./auth";

const productImages = {
  "mahira-verdure": {
    image:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
    ],
    color: "Emerald Green",
    sku: "MV-001",
  },
  "mehr-peridot": {
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    ],
    color: "Lime Green",
    sku: "MP-002",
  },
  "mehvish-burgundy": {
    image:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    ],
    color: "Burgundy",
    sku: "MB-003",
  },
  "zoya-sapphire": {
    image:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    ],
    color: "Sapphire Blue",
    sku: "ZS-004",
  },
  "maheen-emerald": {
    image:
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=800&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    ],
    color: "Emerald",
    sku: "ME-005",
  },
  "gulnar-midnight": {
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    ],
    color: "Midnight Black",
    sku: "GM-006",
  },
};

const collectionImages = {
  embroidered:
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
  "formal-wear":
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
  bridal:
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
  "casual-elegance":
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
  "secret-garden":
    "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=800&q=80",
  sarees:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
};

const navCollections = [
  {
    name: "Secret Garden",
    slug: "secret-garden",
    subtitle: "Limited Edition",
    description:
      "A curated capsule of ethereal ensembles inspired by blooming gardens — delicate embroideries, soft palettes, and timeless silhouettes.",
    image: collectionImages["secret-garden"],
    sortOrder: 5,
  },
  {
    name: "Sarees",
    slug: "sarees",
    subtitle: "Heritage",
    description:
      "Graceful sarees that celebrate Pakistani craftsmanship with contemporary draping, rich fabrics, and refined embellishment.",
    image: collectionImages.sarees,
    sortOrder: 6,
  },
];

export async function seedDatabase() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    const adminPassword = await hashPassword("admin123");
    await db.insert(users).values({
      email: "admin@saajbymf.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "SAAJ",
      role: "admin",
    });
  }

  const existingCollections = await db.select().from(collections);
  if (existingCollections.length > 0) {
    const existingSlugs = new Set(existingCollections.map((col) => col.slug));
    const missingNavCollections = navCollections.filter(
      (col) => !existingSlugs.has(col.slug),
    );
    if (missingNavCollections.length > 0) {
      await db.insert(collections).values(missingNavCollections);
    }

    for (const col of existingCollections) {
      const img = collectionImages[col.slug as keyof typeof collectionImages];
      if (img && (!col.image || col.image.startsWith("/images/"))) {
        await db
          .update(collections)
          .set({ image: img })
          .where(sql`id = ${col.id}`);
      }
    }

    const existingProducts = await db.select().from(products);
    for (const prod of existingProducts) {
      const data = productImages[prod.slug as keyof typeof productImages];
      if (data && (!prod.image || prod.image.startsWith("/images/"))) {
        await db
          .update(products)
          .set({
            image: data.image,
            hoverImage: data.hoverImage,
            gallery: data.gallery,
            color: data.color,
            sku: data.sku,
          })
          .where(sql`id = ${prod.id}`);
      }
    }
    return;
  }

  const [embroidered, formal, bridal, casual] = await db
    .insert(collections)
    .values([
      {
        name: "Embroidered",
        slug: "embroidered",
        subtitle: "Hand-Crafted",
        description:
          "Exquisite hand-embroidered pieces featuring intricate Zardosi, Adda Work, and traditional motifs on premium fabrics.",
        image: collectionImages.embroidered,
        sortOrder: 1,
      },
      {
        name: "Formal Wear",
        slug: "formal-wear",
        subtitle: "Occasion",
        description:
          "Elegant formal ensembles designed for occasions that deserve more than ordinary. Statement pieces with timeless impressions.",
        image: collectionImages["formal-wear"],
        sortOrder: 2,
      },
      {
        name: "Bridal",
        slug: "bridal",
        subtitle: "Luxury",
        description:
          "Opulent bridal wear celebrating the grandeur of Pakistani heritage. Each piece is a masterwork of traditional artistry.",
        image: collectionImages.bridal,
        sortOrder: 3,
      },
      {
        name: "Casual Elegance",
        slug: "casual-elegance",
        subtitle: "Everyday",
        description:
          "Refined everyday pieces that bring effortless sophistication to your wardrobe with subtle embroidery and premium fabrics.",
        image: collectionImages["casual-elegance"],
        sortOrder: 4,
      },
      ...navCollections,
    ])
    .returning();

  await db.insert(products).values([
    {
      name: "Mahira Verdure",
      slug: "mahira-verdure",
      description:
        'Discover the refined elegance of Mahira Verdure, a testament to "Modernity in Heritage." This exquisite ensemble, in a captivating emerald hue, drapes flawlessly in luxurious Georgette. The shirt is artfully designed with distinctive pleats, exquisitely enhanced by delicate milky laces, creating a unique textural symphony.',
      price: 12000,
      currency: "PKR",
      ...productImages["mahira-verdure"],
      fabric: "Embroidered | Georgette",
      pieces: "2pc",
      collectionId: casual.id,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Mehr Peridot",
      slug: "mehr-peridot",
      description:
        'Experience the glowing allure of Mehr Peridot, a vibrant expression of "Modernity in Heritage." This striking ensemble, in a fresh lime shade, blooms with masterful artistry. Elaborate Adda Work, sparkling Sitara, fine Dubka, Moti, Cut Dana, and elegant Kundan Buttons form a magnificent golden embroidery.',
      price: 35500,
      currency: "PKR",
      ...productImages["mehr-peridot"],
      fabric: "Embroidered | Khaadi Net",
      pieces: "3pc",
      collectionId: embroidered.id,
      isNew: true,
      isFeatured: true,
    },
    {
      name: "Mehvish Burgundy",
      slug: "mehvish-burgundy",
      description:
        'Immerse yourself in the radiant charm of Mehvish Burgundy, a masterpiece of "Modernity in Heritage." This opulent ensemble, in a rich, deep hue, is a resplendent canvas for its extensive hand-done artistry. Intricate Adda Work, shimmering Sitara, delicate Moti, precise Cut Dana, traditional Dubka, and fine Resham collectively create a breathtaking golden tapestry.',
      price: 34000,
      currency: "PKR",
      ...productImages["mehvish-burgundy"],
      fabric: "Embroidered | Tassal Silk",
      pieces: "3pc",
      collectionId: formal.id,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Zoya Sapphire",
      slug: "zoya-sapphire",
      description:
        'Embrace the profound elegance of Zoya Sapphire, a breathtaking embodiment of "Modernity in Heritage." This resplendent ensemble drapes with a luxurious grace, its deep, captivating hue serving as a canvas for exquisite hand-done artistry.',
      price: 12500,
      currency: "PKR",
      ...productImages["zoya-sapphire"],
      fabric: "Embroidered | Silk Charmeuse",
      pieces: "2pc",
      collectionId: casual.id,
      isNew: true,
      isFeatured: true,
    },
    {
      name: "Maheen Emerald",
      slug: "maheen-emerald",
      description:
        'Discover timeless allure with Maheen Emerald, a radiant expression of "Modernity in Heritage." This exquisite ensemble features intricate, hand-done Zardosi and Adda Work, gracefully adorning the neckline and subtly scattered across its luminous canvas.',
      price: 23500,
      currency: "PKR",
      ...productImages["maheen-emerald"],
      fabric: "Embroidered | Bareeze Net",
      pieces: "3pc",
      collectionId: embroidered.id,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Gulnar Midnight",
      slug: "gulnar-midnight",
      description:
        'Embrace the enchanting Gulnar Midnight, where Pakistani craftsmanship meets modern elegance. This exquisite three-piece ensemble, designed for the discerning woman, truly brings "Modernity in Heritage" to life.',
      price: 32000,
      currency: "PKR",
      ...productImages["gulnar-midnight"],
      fabric: "Embroidered | Korean Raw Silk",
      pieces: "3pc",
      collectionId: formal.id,
      isNew: true,
      isFeatured: true,
    },
  ]);
}

// Execute the seeder if this script is run directly from the command line
if (process.argv[1]?.includes("seed.ts")) {
  console.log("Starting database seeding...");
  seedDatabase()
    .then(() => {
      console.log("Database seeded successfully!");
      process.exit(0); // Safely close the database connection pool so the Vercel build exits
    })
    .catch((err) => {
      console.error("Database seeding failed:", err);
      process.exit(1);
    });
}
