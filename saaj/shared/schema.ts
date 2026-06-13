import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("saaj_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  gallery: text("gallery").array(),
  subtitle: text("subtitle"),
  sortOrder: integer("sort_order").default(0),
});

export const products = pgTable("saaj_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("PKR"),
  image: text("image").notNull(),
  hoverImage: text("hover_image"),
  gallery: text("gallery").array(),
  color: text("color"),
  sku: text("sku"),
  fabric: text("fabric"),
  pieces: text("pieces"),
  collectionId: varchar("collection_id").references(() => collections.id),
  isNew: boolean("is_new").default(false),
  isFeatured: boolean("is_featured").default(false),
});

export const users = pgTable("saaj_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("saaj_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  total: integer("total").notNull(),
  currency: text("currency").notNull().default("PKR"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentScreenshot: text("payment_screenshot"),
  shippingEmail: text("shipping_email"),
  shippingFirstName: text("shipping_first_name"),
  shippingLastName: text("shipping_last_name"),
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingZip: text("shipping_zip"),
  shippingCountry: text("shipping_country"),
  shippingPhone: text("shipping_phone"),
  orderNotes: text("order_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("saaj_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull(),
});

export const siteSettings = pgTable("saaj_site_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  category: text("category").notNull().default("general"),
});

export const cartItems = pgTable("saaj_cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  size: text("size"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const banners = pgTable("banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  image: text("image").notNull(),
  title: text("title"),
  subtitle: text("subtitle"),
  link: text("link"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Used by connect-pg-simple for express-session. Must match connect-pg-simple's table structure.
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, role: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings);
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const insertBannerSchema = createInsertSchema(banners).omit({ id: true });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
