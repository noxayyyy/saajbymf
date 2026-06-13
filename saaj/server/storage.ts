import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  collections,
  products,
  users,
  orders,
  orderItems,
  siteSettings,
  banners,
  type Collection,
  type InsertCollection,
  type Product,
  type InsertProduct,
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type SiteSetting,
  type InsertSiteSetting,
  type Banner,
  type InsertBanner,
} from "@shared/schema";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
export { pool };

export interface IStorage {
  getCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | undefined>;
  getCollectionById(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCollection(collectionSlug: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getSiteSettings(category?: string): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  getBanners(activeOnly?: boolean): Promise<Banner[]>;
  getBannerById(id: string): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, data: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getCollections(): Promise<Collection[]> {
    return db.select().from(collections).orderBy(collections.sortOrder);
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.slug, slug));
    return collection;
  }

  async getCollectionById(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [created] = await db.insert(collections).values(collection).returning();
    return created;
  }

  async updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection | undefined> {
    const [updated] = await db.update(collections).set(data).where(eq(collections.id, id)).returning();
    return updated;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await db.delete(collections).where(eq(collections.id, id)).returning();
    return result.length > 0;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCollection(collectionSlug: string): Promise<Product[]> {
    const collection = await this.getCollectionBySlug(collectionSlug);
    if (!collection) return [];
    return db.select().from(products).where(eq(products.collectionId, collection.id));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isFeatured, true));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.shippingEmail, email.toLowerCase()))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated;
  }

  async deleteOrder(id: string): Promise<boolean> {
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    const result = await db.delete(orders).where(eq(orders.id, id)).returning();
    return result.length > 0;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.update(orders).set({ userId: null }).where(eq(orders.userId, id));
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async getSiteSettings(category?: string): Promise<SiteSetting[]> {
    if (category) {
      return db.select().from(siteSettings).where(eq(siteSettings.category, category));
    }
    return db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const [upserted] = await db
      .insert(siteSettings)
      .values(setting)
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: setting.value, category: setting.category } })
      .returning();
    return upserted;
  }

  async getBanners(activeOnly = false): Promise<Banner[]> {
    if (activeOnly) {
      return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(asc(banners.sortOrder));
    }
    return db.select().from(banners).orderBy(asc(banners.sortOrder));
  }

  async getBannerById(id: string): Promise<Banner | undefined> {
    const [banner] = await db.select().from(banners).where(eq(banners.id, id));
    return banner;
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [created] = await db.insert(banners).values(banner).returning();
    return created;
  }

  async updateBanner(id: string, data: Partial<InsertBanner>): Promise<Banner | undefined> {
    const [updated] = await db.update(banners).set(data).where(eq(banners.id, id)).returning();
    return updated;
  }

  async deleteBanner(id: string): Promise<boolean> {
    const result = await db.delete(banners).where(eq(banners.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
